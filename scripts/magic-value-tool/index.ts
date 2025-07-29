#!/usr/bin/env node --experimental-strip-types
import { Command } from 'commander';
import { loadConfig } from './config/config-loader.ts';
import { MagicValueRefactor } from './core/refactor.ts';
import { logger } from './utils/logger.ts';

const program = new Command();

program
  .name('magic-refactor')
  .description('Context-aware magic value refactoring tool v2.0')
  .version('2.0.0');

program
  .command('scan')
  .description('Scan codebase for magic values')
  .option('-p, --path <path>', 'Path to scan', process.cwd())
  .option('-i, --include <patterns...>', 'Include file patterns', [
    '**/*.ts',
    '**/*.tsx',
  ])
  .option('-e, --exclude <patterns...>', 'Exclude file patterns', [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.test.*',
    '**/*.spec.*',
  ])
  .option('--detect-only', 'Only detect, do not suggest replacements')
  .option('--context-aware', 'Enable context-aware detection', true)
  .option('--json', 'Output results as JSON')
  .action(async (options) => {
    try {
      const config = await loadConfig();
      const refactor = new MagicValueRefactor(config);
      const results = await refactor.scan({
        path: options.path,
        includePatterns: options.include,
        excludePatterns: options.exclude,
        detectOnly: options.detectOnly,
        contextAware: options.contextAware,
      });

      if (options.json) {
        const getCircularReplacer = () => {
          const seen = new WeakSet();
          return (_key: string, value: unknown) => {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) {
                return;
              }
              seen.add(value);
            }
            return value;
          };
        };

        console.log(JSON.stringify(results, getCircularReplacer(), 2));
      } else {
        logger.displayResults(results);
      }
    } catch (error) {
      logger.error('Scan failed:', error);
      process.exit(1);
    }
  });

program
  .command('transform')
  .description('Transform magic values to constants')
  .option('-p, --path <path>', 'Path to transform', process.cwd())
  .option('-g, --group <group>', 'Transform specific group only')
  .option('-f, --file <file>', 'Transform specific file only')
  .option('--dry-run', 'Preview changes without applying')
  .option('--interactive', 'Confirm each transformation')
  .option('--safe-mode', 'Conservative transformation mode', true)
  .action(async (options) => {
    try {
      const config = await loadConfig();
      const refactor = new MagicValueRefactor(config);
      const results = await refactor.transform({
        path: options.path,
        group: options.group,
        file: options.file,
        dryRun: options.dryRun,
        interactive: options.interactive,
        safeMode: options.safeMode,
      });

      logger.displayTransformResults(results);
    } catch (error) {
      logger.error('Transform failed:', error);
      process.exit(1);
    }
  });

program
  .command('analyze-edge-cases')
  .description('Analyze potential edge cases in codebase')
  .option('-p, --path <path>', 'Path to analyze', process.cwd())
  .action(async (options) => {
    try {
      const config = await loadConfig();
      const refactor = new MagicValueRefactor(config);
      const analysis = await refactor.analyzeEdgeCases({
        path: options.path,
      });

      logger.displayEdgeCaseAnalysis(analysis);
    } catch (error) {
      logger.error('Analysis failed:', error);
      process.exit(1);
    }
  });

program.parse();
