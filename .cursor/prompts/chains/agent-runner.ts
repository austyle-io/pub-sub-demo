#!/usr/bin/env node --experimental-strip-types

/**
 * Agent-friendly Chain Runner
 *
 * An autonomous version of the chain runner that can execute documentation
 * and development workflows without human intervention.
 *
 * @module chains/agent-runner
 * @since 1.0.0
 */

import { exec } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { parse as parseYaml } from 'yaml';

const execAsync = promisify(exec);

/**
 * Agent-executable step with actions instead of prompts.
 * @since 1.0.0
 */
interface AgentStep {
  id: string;
  description: string;
  actions: {
    type: 'analyze' | 'generate' | 'modify' | 'validate' | 'execute';
    target?: string;
    template?: string;
    command?: string;
    inputs?: string[];
    outputs?: string[];
    validation?: {
      type: 'exists' | 'contains' | 'matches' | 'passes';
      value?: string;
      pattern?: string;
    };
  }[];
  dependsOn?: string[];
}

/**
 * Agent-friendly chain definition.
 * @since 1.0.0
 */
interface AgentChain {
  name: string;
  description: string;
  parameters?: Array<{
    name: string;
    description: string;
    default?: string;
  }>;
  context?: {
    workingDirectory?: string;
    requiredFiles?: string[];
    requiredCommands?: string[];
  };
  steps: AgentStep[];
  outputs?: {
    summary?: boolean;
    artifacts?: string[];
    reports?: string[];
  };
}

/**
 * Execution context for the agent.
 * @since 1.0.0
 */
interface ExecutionContext {
  chainName: string;
  parameters: Record<string, string>;
  workingDirectory: string;
  outputDirectory: string;
  stepResults: Map<string, any>;
  artifacts: Map<string, string>;
}

/**
 * Agent runner that can execute chains autonomously.
 * @since 1.0.0
 */
export class AgentRunner {
  private context: ExecutionContext;

  constructor(chainName: string, parameters: Record<string, string>) {
    const outputDir = join(
      process.cwd(),
      '.agent-output',
      chainName,
      new Date().toISOString().replace(/[:.]/g, '-'),
    );
    mkdirSync(outputDir, { recursive: true });

    this.context = {
      chainName,
      parameters,
      workingDirectory: process.cwd(),
      outputDirectory: outputDir,
      stepResults: new Map(),
      artifacts: new Map(),
    };
  }

  /**
   * Load and validate an agent chain.
   * @since 1.0.0
   */
  async loadChain(chainFile: string): Promise<AgentChain> {
    const content = readFileSync(chainFile, 'utf8');
    const chain = parseYaml(content) as AgentChain;

    // Validate required context
    if (chain.context?.requiredFiles) {
      for (const file of chain.context.requiredFiles) {
        if (!existsSync(join(this.context.workingDirectory, file))) {
          throw new Error(`Required file not found: ${file}`);
        }
      }
    }

    if (chain.context?.requiredCommands) {
      for (const cmd of chain.context.requiredCommands) {
        try {
          await execAsync(`which ${cmd}`);
        } catch {
          throw new Error(`Required command not found: ${cmd}`);
        }
      }
    }

    return chain;
  }

  /**
   * Execute a single step action.
   * @since 1.0.0
   */
  private async executeAction(
    action: AgentStep['actions'][0],
    step: AgentStep,
  ): Promise<any> {
    console.log(`  → Executing ${action.type} action`);

    switch (action.type) {
      case 'analyze': {
        // Analyze files or codebase
        if (action.target) {
          const targetPath = this.substituteParams(action.target);
          const content = readFileSync(targetPath, 'utf8');

          // Example: Extract JSDoc comments
          const jsdocPattern = /\/\*\*[\s\S]*?\*\//g;
          const matches = content.match(jsdocPattern) || [];

          return {
            file: targetPath,
            analysis: {
              hasJSDoc: matches.length > 0,
              jsdocCount: matches.length,
              fileSize: content.length,
              lineCount: content.split('\n').length,
            },
          };
        }
        break;
      }

      case 'generate': {
        // Generate documentation or code
        if (action.template && action.outputs) {
          const template = readFileSync(action.template, 'utf8');
          const processed = this.substituteParams(template);

          for (const output of action.outputs) {
            const outputPath = join(this.context.outputDirectory, output);
            writeFileSync(outputPath, processed);
            this.context.artifacts.set(output, outputPath);
          }

          return { generated: action.outputs };
        }
        break;
      }

      case 'modify': {
        // Modify existing files
        if (action.target && action.command) {
          const targetPath = this.substituteParams(action.target);
          const command = this.substituteParams(action.command);

          // Example: Add JSDoc comments
          if (command === 'add-jsdoc') {
            const content = readFileSync(targetPath, 'utf8');
            // Simple example - in reality, use AST manipulation
            const modified = content.replace(
              /export (function|const) (\w+)/g,
              '/**\n * TODO: Add description\n * @since 1.0.0\n */\n$&',
            );

            const backupPath = `${targetPath}.backup`;
            writeFileSync(backupPath, content);
            writeFileSync(targetPath, modified);

            return { modified: targetPath, backup: backupPath };
          }
        }
        break;
      }

      case 'validate': {
        // Validate files or results
        if (action.validation && action.target) {
          const targetPath = this.substituteParams(action.target);
          const content = readFileSync(targetPath, 'utf8');

          switch (action.validation.type) {
            case 'contains':
              return content.includes(action.validation.value || '');
            case 'matches':
              return new RegExp(action.validation.pattern || '').test(content);
            case 'exists':
              return existsSync(targetPath);
            case 'passes':
              // Run a validation command
              if (action.command) {
                const { stdout, stderr } = await execAsync(action.command);
                return { passed: !stderr, stdout, stderr };
              }
          }
        }
        break;
      }

      case 'execute': {
        // Execute commands
        if (action.command) {
          const command = this.substituteParams(action.command);
          const { stdout, stderr } = await execAsync(command);
          return { stdout, stderr, exitCode: 0 };
        }
        break;
      }
    }

    return null;
  }

  /**
   * Substitute parameters in strings.
   * @since 1.0.0
   */
  private substituteParams(template: string): string {
    return template.replace(/\$\{(\w+)\}/g, (match, paramName) => {
      return (
        this.context.parameters[paramName] ||
        this.context.stepResults.get(paramName) ||
        match
      );
    });
  }

  /**
   * Execute a complete chain.
   * @since 1.0.0
   */
  async execute(chainFile: string): Promise<void> {
    console.log(`🤖 Agent Runner: Executing ${this.context.chainName}`);

    const chain = await this.loadChain(chainFile);

    // Apply defaults to parameters
    if (chain.parameters) {
      for (const param of chain.parameters) {
        if (!this.context.parameters[param.name] && param.default) {
          this.context.parameters[param.name] = param.default;
        }
      }
    }

    console.log(`📋 Parameters:`, this.context.parameters);
    console.log(`📁 Output directory: ${this.context.outputDirectory}`);

    // Execute steps
    for (const step of chain.steps) {
      console.log(`\n🔧 Step: ${step.id} - ${step.description}`);

      // Check dependencies
      if (step.dependsOn) {
        for (const dep of step.dependsOn) {
          if (!this.context.stepResults.has(dep)) {
            throw new Error(
              `Step ${step.id} depends on ${dep} which hasn't been executed`,
            );
          }
        }
      }

      // Execute actions
      const stepResult: any = {};
      for (const action of step.actions) {
        try {
          const result = await this.executeAction(action, step);
          Object.assign(stepResult, result);
        } catch (error) {
          console.error(`  ❌ Action failed:`, error);
          stepResult.error = error;
        }
      }

      this.context.stepResults.set(step.id, stepResult);
    }

    // Generate summary
    if (chain.outputs?.summary) {
      this.generateSummary(chain);
    }

    console.log(`\n✅ Chain execution complete!`);
    console.log(`📊 Results saved to: ${this.context.outputDirectory}`);
  }

  /**
   * Generate execution summary.
   * @since 1.0.0
   */
  private generateSummary(chain: AgentChain): void {
    const summary = {
      chain: chain.name,
      executedAt: new Date().toISOString(),
      parameters: this.context.parameters,
      steps: Array.from(this.context.stepResults.entries()).map(
        ([id, result]) => ({
          id,
          result: result.error ? 'failed' : 'success',
          details: result,
        }),
      ),
      artifacts: Array.from(this.context.artifacts.entries()),
    };

    const summaryPath = join(
      this.context.outputDirectory,
      'execution-summary.json',
    );
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  }
}

/**
 * Convert a prompt-based chain to an agent-executable chain.
 * @since 1.0.0
 */
export function convertToAgentChain(promptChain: any): AgentChain {
  const agentChain: AgentChain = {
    name: promptChain.name,
    description: promptChain.description,
    parameters: promptChain.parameters,
    steps: [],
  };

  // Convert each prompt step to agent actions
  for (const step of promptChain.steps) {
    const agentStep: AgentStep = {
      id: step.id,
      description: step.prompt.split('\n')[0].trim(),
      actions: [],
    };

    // Analyze prompt to determine actions
    const prompt = step.prompt.toLowerCase();

    if (prompt.includes('analyze')) {
      agentStep.actions.push({ type: 'analyze' });
    }
    if (prompt.includes('create') || prompt.includes('generate')) {
      agentStep.actions.push({ type: 'generate' });
    }
    if (prompt.includes('implement') || prompt.includes('build')) {
      agentStep.actions.push({ type: 'modify' });
    }
    if (prompt.includes('test') || prompt.includes('validate')) {
      agentStep.actions.push({ type: 'validate' });
    }

    agentChain.steps.push(agentStep);
  }

  return agentChain;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const [chainName, ...params] = process.argv.slice(2);

  if (!chainName) {
    console.log(
      'Usage: agent-runner.ts <chain-name> [param1=value1] [param2=value2]',
    );
    process.exit(1);
  }

  // Parse parameters
  const parameters: Record<string, string> = {};
  for (const param of params) {
    const [key, value] = param.split('=');
    if (key && value) {
      parameters[key] = value;
    }
  }

  const runner = new AgentRunner(chainName, parameters);
  const chainFile = join(resolve(import.meta.dirname), `_${chainName}.yaml`);

  runner.execute(chainFile).catch(console.error);
}
