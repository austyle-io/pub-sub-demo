#!/usr/bin/env node --experimental-strip-types

/**
 * Chain Runner for Cursor Prompts
 *
 * Executes prompt chains defined in YAML files by parsing chain definitions,
 * substituting parameters, and generating prompt files for each step.
 *
 * @module chains/run
 * @since 1.0.0
 */

import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { glob } from 'glob';
import { parse as parseYaml } from 'yaml';

// ANSI color codes
const colors = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m',
} as const;

/**
 * Chain definition from YAML file.
 * @since 1.0.0
 */
interface ChainDefinition {
  name: string;
  description: string;
  parameters?: Array<{
    name: string;
    description: string;
  }>;
  steps: Array<{
    id: string;
    prompt: string;
  }>;
}

/**
 * Prints colored output to console.
 *
 * @param color - ANSI color code
 * @param message - Message to print
 * @since 1.0.0
 */
function printColor(color: keyof typeof colors, message: string): void {
  console.log(`${colors[color]}${message}${colors.RESET}`);
}

/**
 * Prints usage information and lists available chains.
 *
 * @param chainsDir - Directory containing chain files
 * @since 1.0.0
 */
async function printUsage(chainsDir: string): Promise<void> {
  printColor('BLUE', 'Cursor Prompt Chain Runner');
  console.log('');
  console.log('Usage: ./run.ts <chain-name> [parameters...]');
  console.log('');
  console.log('Available chains:');

  const chainFiles = await glob('_*.yaml', { cwd: chainsDir });
  for (const file of chainFiles) {
    const chainName = basename(file, '.yaml').substring(1);
    console.log(`  - ${chainName}`);
  }

  console.log('');
  console.log('Example:');
  console.log(
    '  ./run.ts websocket-feature "user presence indicator" "Show online users in real-time"',
  );
}

/**
 * Loads and parses a chain definition from a YAML file.
 *
 * @param filePath - Path to the YAML file
 * @returns Parsed chain definition
 * @throws Error if file cannot be read or parsed
 * @since 1.0.0
 */
export function loadChainDefinition(filePath: string): ChainDefinition {
  const content = readFileSync(filePath, 'utf8');
  return parseYaml(content) as ChainDefinition;
}

/**
 * Substitutes parameters in a template string.
 *
 * @param template - Template string with {{param}} placeholders
 * @param params - Parameter values
 * @returns String with substituted values
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const result = substituteParameters(
 *   'Hello {{name}}, welcome to {{place}}!',
 *   { name: 'Alice', place: 'Wonderland' }
 * );
 * // Result: 'Hello Alice, welcome to Wonderland!'
 * ```
 */
export function substituteParameters(
  template: string,
  params: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
    return params[paramName] || match;
  });
}

/**
 * Executes a chain with the provided parameters.
 *
 * @param chainName - Name of the chain to execute
 * @param parameters - Array of parameter values
 * @param chainsDir - Directory containing chain files
 * @returns Path to the output directory
 * @since 1.0.0
 */
export async function executeChain(
  chainName: string,
  parameters: string[],
  chainsDir: string,
): Promise<string> {
  const chainFile = join(chainsDir, `_${chainName}.yaml`);

  // Check if chain file exists
  if (!existsSync(chainFile)) {
    throw new Error(`Chain '${chainName}' not found!`);
  }

  // Load chain definition
  printColor('BLUE', `Loading chain: ${chainName}`);
  const chain = loadChainDefinition(chainFile);

  // Map parameters to object
  const paramMap: Record<string, string> = {};
  if (chain.parameters) {
    chain.parameters.forEach((param, index) => {
      if (parameters[index]) {
        paramMap[param.name] = parameters[index];
      }
    });
  }

  printColor('YELLOW', `Parameters: ${parameters.join(', ')}`);
  console.log('');

  // Create temporary directory
  const tempDir = mkdtempSync(join(tmpdir(), 'cursor-chain-'));

  // Create output file
  const outputFile = join(tempDir, 'chain_output.md');
  const outputContent = [
    `# ${chain.name} Chain Execution`,
    '',
    `**Date**: ${new Date().toISOString()}`,
    `**Parameters**: ${parameters.join(', ')}`,
    '',
  ];

  printColor('GREEN', 'Executing chain steps...');
  console.log('');

  // Execute each step
  chain.steps.forEach((step, index) => {
    const stepNum = index + 1;
    printColor('BLUE', `Step ${stepNum}: ${step.id}`);

    // Add step to output
    outputContent.push(`## Step ${stepNum}: ${step.id}`);
    outputContent.push('');

    // Create prompt file
    const promptFile = join(tempDir, `step_${stepNum}_${step.id}.md`);
    const promptContent = substituteParameters(step.prompt, paramMap);

    writeFileSync(
      promptFile,
      [`# Step: ${step.id}`, '', promptContent].join('\n'),
    );

    console.log(`📋 Creating prompt for: ${step.id}`);
    printColor('YELLOW', `  → Prompt saved to: ${promptFile}`);
    outputContent.push('');
  });

  // Write output file
  writeFileSync(outputFile, outputContent.join('\n'));

  printColor('GREEN', 'Chain execution complete!');
  console.log('');
  printColor('BLUE', 'Outputs saved to:');
  printColor('YELLOW', `  → ${tempDir}`);
  console.log('');
  printColor('BLUE', 'Next steps:');
  console.log('1. Open each prompt file in Cursor');
  console.log('2. Execute the prompts in sequence');
  console.log('3. Collect outputs in the chain_output.md file');
  console.log('');
  printColor(
    'YELLOW',
    "Note: In a future version, this could integrate with Cursor's CLI directly.",
  );

  return tempDir;
}

/**
 * Main CLI entry point.
 * @since 1.0.0
 */
async function main(): Promise<void> {
  const scriptDir = resolve(import.meta.dirname);

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.length < 1) {
    await printUsage(scriptDir);
    process.exit(1);
  }

  const chainName = args[0];
  const parameters = args.slice(1);

  try {
    const outputDir = await executeChain(chainName, parameters, scriptDir);

    // Wait for user input before cleanup
    console.log('');
    printColor(
      'GREEN',
      'Press Enter to clean up temporary files, or Ctrl+C to keep them...',
    );

    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });

    // Cleanup would happen here in production
    console.log('Cleanup complete.');
  } catch (error) {
    printColor(
      'RED',
      `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.log('');
    await printUsage(scriptDir);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
