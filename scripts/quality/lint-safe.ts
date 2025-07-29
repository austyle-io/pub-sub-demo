#!/usr/bin/env node --experimental-strip-types

import { exec } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { glob } from 'glob';
import { z } from 'zod';
import {
  createCommand,
  handleError,
  parseOptions,
  setupGracefulShutdown,
} from '../utilities/cli-utils.ts';
import { logger } from '../utilities/logger.ts';

const execAsync = promisify(exec);

const ConfigSchema = z.object({
  timeout: z.number().default(60),
  verbose: z.boolean().default(false),
  fix: z.boolean().default(false),
});

type Config = z.infer<typeof ConfigSchema>;

class LintSafe {
  private config: Config;
  private projectRoot: string;
  private logFile: string;
  private errors = 0;

  constructor(config: Config) {
    this.config = config;
    this.projectRoot = path.resolve(import.meta.dirname, '../..');
    const timestamp = Date.now();
    this.logFile = path.join(
      this.projectRoot,
      '.logs',
      `lint-safe-${timestamp}.log`,
    );
  }

  private async ensureLogDirectory(): Promise<void> {
    const logDir = path.join(this.projectRoot, '.logs');
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
  }

  private async log(
    message: string,
    level: 'info' | 'error' | 'success' | 'warn' = 'info',
  ): Promise<void> {
    const formattedMessage = `[LINT] ${message}`;

    switch (level) {
      case 'error':
        logger.error(formattedMessage);
        break;
      case 'success':
        logger.info(`✅ ${message}`);
        break;
      case 'warn':
        logger.warn(formattedMessage);
        break;
      default:
        logger.info(formattedMessage);
    }

    // Also append to log file
    try {
      await fs.appendFile(
        this.logFile,
        `${new Date().toISOString()} - ${formattedMessage}\n`,
      );
    } catch {
      // Ignore log file errors
    }
  }

  private async runLintCheck(targetDir: string): Promise<boolean> {
    await this.log(`Running linting on: ${targetDir}`);
    await this.log(`Timeout: ${this.config.timeout}s`);

    try {
      // Check if biome is available
      const { stdout: biomeCheck } = await execAsync('pnpm list --depth=0', {
        cwd: this.projectRoot,
      });

      if (biomeCheck.includes('@biomejs/biome')) {
        await this.log('Using Biome for linting...');

        const command = this.config.fix
          ? `pnpm biome check --write ${targetDir}`
          : `pnpm biome check ${targetDir}`;

        await execAsync(command, {
          cwd: this.projectRoot,
          timeout: this.config.timeout * 1000,
        });

        await this.log('Biome linting passed', 'success');
        return true;
      } else {
        // Fallback to package.json lint script
        await this.log('Using package.json lint script...');

        const command = this.config.fix ? 'pnpm lint:fix' : 'pnpm lint';
        await execAsync(command, {
          cwd: this.projectRoot,
          timeout: this.config.timeout * 1000,
        });

        await this.log('Package lint script passed', 'success');
        return true;
      }
    } catch (error: any) {
      if (error.code === 'ETIMEDOUT') {
        await this.log(
          `Linting timed out after ${this.config.timeout}s on ${targetDir}`,
          'error',
        );
        await this.log(
          '💡 Try running on smaller directory: pnpm biome check src/',
        );
      } else {
        await this.log(`Linting failed: ${error.message}`, 'error');
      }
      return false;
    }
  }

  private async runFormatCheck(): Promise<boolean> {
    await this.log('Checking code formatting...');

    try {
      const { stdout: biomeCheck } = await execAsync('pnpm list --depth=0', {
        cwd: this.projectRoot,
      });

      if (!biomeCheck.includes('@biomejs/biome')) {
        await this.log('Biome not available, skipping format check');
        return true;
      }

      await execAsync(
        'pnpm biome check --formatter-enabled=true --linter-enabled=false .',
        {
          cwd: this.projectRoot,
          timeout: 30000,
        },
      );

      await this.log('Code formatting is correct', 'success');
      return true;
    } catch (error) {
      await this.log('Code formatting issues found', 'warn');
      await this.log("💡 Run 'pnpm format' to fix formatting");
      return false;
    }
  }

  private async runShellCheck(): Promise<boolean> {
    await this.log('Running shellcheck on shell scripts...');

    try {
      // Find shell scripts
      const shellFiles = await glob('**/*.sh', {
        cwd: this.projectRoot,
        ignore: ['node_modules/**', '.git/**', '**/node_modules/**'],
      });

      if (shellFiles.length === 0) {
        await this.log('No shell scripts found to check');
        return true;
      }

      await this.log(`Found ${shellFiles.length} shell script(s) to check`);

      // Check if shellcheck is available
      try {
        await execAsync('which shellcheck');
      } catch {
        await this.log(
          'Shellcheck not available, skipping shell script checks',
          'warn',
        );
        await this.log(
          'Install with: brew install shellcheck (macOS) or apt install shellcheck (Ubuntu)',
        );
        return true;
      }

      // Run shellcheck on each file
      const failedFiles: string[] = [];
      for (const file of shellFiles) {
        try {
          await execAsync(`shellcheck -S error "${file}"`, {
            cwd: this.projectRoot,
          });
        } catch {
          failedFiles.push(file);
        }
      }

      if (failedFiles.length === 0) {
        await this.log('All shell scripts passed shellcheck', 'success');
        return true;
      } else {
        await this.log(
          `${failedFiles.length} shell script(s) failed shellcheck:`,
          'error',
        );
        for (const file of failedFiles) {
          await this.log(`  ${file}`, 'error');
        }
        return false;
      }
    } catch (error) {
      await this.log(`Shell check error: ${error}`, 'error');
      return false;
    }
  }

  private async runMarkdownLint(): Promise<boolean> {
    await this.log('Running markdownlint on documentation files...');

    try {
      // Check if markdownlint-cli2 is available
      let markdownlintCmd: string | null = null;

      try {
        await execAsync('which markdownlint-cli2');
        markdownlintCmd = 'markdownlint-cli2';
      } catch {
        const { stdout } = await execAsync('pnpm list --depth=0', {
          cwd: this.projectRoot,
        });
        if (stdout.includes('markdownlint-cli2')) {
          markdownlintCmd = 'pnpm exec markdownlint-cli2';
        }
      }

      if (!markdownlintCmd) {
        await this.log(
          'markdownlint-cli2 not available, skipping markdown checks',
          'warn',
        );
        await this.log('Install with: pnpm add -D markdownlint-cli2');
        return true;
      }

      // Count markdown files
      const mdFiles = await glob('**/*.md', {
        cwd: this.projectRoot,
        ignore: ['node_modules/**', '.git/**', '**/node_modules/**'],
      });

      if (mdFiles.length === 0) {
        await this.log('No markdown files found to check');
        return true;
      }

      await this.log(`Found ${mdFiles.length} markdown file(s) to check`);

      // Run markdownlint
      const configFile = path.join(this.projectRoot, '.markdownlint-cli2.yaml');
      const configFlag = existsSync(configFile) ? `--config ${configFile}` : '';

      await execAsync(`${markdownlintCmd} ${configFlag}`, {
        cwd: this.projectRoot,
        timeout: 30000,
      });

      await this.log('All markdown files passed markdownlint', 'success');
      return true;
    } catch (error: any) {
      if (error.code === 'ETIMEDOUT') {
        await this.log('Markdownlint timed out after 30s', 'error');
      } else {
        await this.log(
          'Some markdown files failed markdownlint checks',
          'error',
        );
      }
      return false;
    }
  }

  async run(): Promise<void> {
    await this.ensureLogDirectory();

    await this.log('Starting safe linting process...');
    await this.log(`Project root: ${this.projectRoot}`);
    await this.log(`Log file: ${this.logFile}`);
    await this.log(`Timestamp: ${new Date().toISOString()}`);

    // Check specific directories to avoid timeouts
    const targetDirs = ['src', 'apps', 'packages', 'test', 'scripts'];
    const availableDirs: string[] = [];

    // Find available directories
    for (const dir of targetDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (existsSync(dirPath)) {
        availableDirs.push(dir);
      }
    }

    if (availableDirs.length === 0) {
      await this.log(
        'No standard directories found, linting entire project',
        'warn',
      );
      availableDirs.push('.');
    }

    // Run linting on each directory
    for (const dir of availableDirs) {
      await this.log('');
      await this.log(`=== Linting directory: ${dir} ===`);

      if (!(await this.runLintCheck(dir))) {
        this.errors++;
        await this.log(`Linting failed for: ${dir}`, 'error');
      }
    }

    // Run format check
    await this.log('');
    await this.log('=== Format Check ===');
    if (!(await this.runFormatCheck())) {
      this.errors++;
      await this.log('Format check failed', 'error');
    }

    // Run shellcheck
    await this.log('');
    await this.log('=== Shell Script Check ===');
    if (!(await this.runShellCheck())) {
      this.errors++;
      await this.log('Shellcheck failed', 'error');
    }

    // Run markdownlint
    await this.log('');
    await this.log('=== Markdown Documentation Check ===');
    if (!(await this.runMarkdownLint())) {
      this.errors++;
      await this.log('Markdownlint failed', 'error');
    }

    // Summary
    await this.log('');
    await this.log('=== Linting Summary ===');
    if (this.errors === 0) {
      await this.log('All linting checks passed! ✨', 'success');
      // Clean up log file on success
      try {
        rmSync(this.logFile);
      } catch {
        // Ignore cleanup errors
      }
    } else {
      await this.log(`Linting completed with ${this.errors} error(s)`, 'error');
      await this.log(`Full log available at: ${this.logFile}`);

      await this.log('');
      await this.log('💡 Troubleshooting suggestions:');
      await this.log('  - Try running: pnpm lint --fix');
      await this.log('  - Check specific file: pnpm lint src/specific-file.ts');
      await this.log('  - Review biome configuration: biome.json');
      await this.log('  - Run format first: pnpm format');

      process.exit(1);
    }
  }
}

// Main CLI setup
async function main(): Promise<void> {
  setupGracefulShutdown();

  const program = createCommand(
    'lint-safe',
    'Run comprehensive linting with safety checks',
  )
    .option(
      '-t, --timeout <seconds>',
      'Timeout for each linting operation',
      '60',
    )
    .option('-f, --fix', 'Automatically fix linting issues where possible')
    .action(async (options) => {
      try {
        const config = parseOptions(ConfigSchema, {
          ...options,
          timeout: Number.parseInt(options.timeout, 10),
        });

        const linter = new LintSafe(config);
        await linter.run();
      } catch (error) {
        await handleError(error);
      }
    });

  program.parse();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
