#!/usr/bin/env node --experimental-strip-types

/**
 * Command-line interface utilities for scripts.
 *
 * This module provides common utilities for building CLI scripts including
 * error handling, graceful shutdown, command creation, and option parsing.
 * All scripts in the project should use these utilities for consistency.
 *
 * @module utilities/cli-utils
 * @since 1.0.0
 */

import { Command } from 'commander';
import { z } from 'zod';
import { logger } from './logger.ts';

/**
 * Ensures a value is an Error instance.
 *
 * Converts any thrown value to a proper Error object for consistent
 * error handling throughout the CLI scripts.
 *
 * @param value - Any value that might be an error
 * @returns Error instance
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   const err = ensureError(error);
 *   logger.error(err.message);
 * }
 * ```
 */
export function ensureError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(String(value));
}

/**
 * Handles errors in CLI scripts with proper logging and exit.
 *
 * Logs the error message and optionally the stack trace (if DEBUG env var is set),
 * then exits the process with code 1.
 *
 * @param error - Any error value
 * @returns Never returns, always exits the process
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * async function main() {
 *   try {
 *     await runScript();
 *   } catch (error) {
 *     await handleError(error);
 *   }
 * }
 * ```
 */
export async function handleError(error: unknown): Promise<never> {
  const err = ensureError(error);
  logger.error('Script failed:', err.message);

  if (err.stack && process.env.DEBUG) {
    logger.debug('Stack trace:', err.stack);
  }

  process.exit(1);
}

/**
 * Sets up graceful shutdown handlers for SIGINT and SIGTERM.
 *
 * Registers signal handlers that will call the optional cleanup function
 * before exiting the process. Useful for cleaning up resources like
 * database connections or temporary files.
 *
 * @param cleanup - Optional async cleanup function to run before exit
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const cleanup = async () => {
 *   await database.disconnect();
 *   await tempFiles.removeAll();
 * };
 *
 * setupGracefulShutdown(cleanup);
 * ```
 */
export function setupGracefulShutdown(cleanup?: () => Promise<void>): void {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);

    if (cleanup) {
      try {
        await cleanup();
      } catch (error) {
        logger.error('Cleanup failed:', error);
      }
    }

    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * Creates a pre-configured Commander command instance.
 *
 * Sets up a command with common options like verbose logging and dry-run mode.
 * Automatically enables debug logging when --verbose flag is used.
 *
 * @param name - Command name
 * @param description - Command description
 * @param version - Command version (default: '1.0.0')
 * @returns Configured Command instance
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const program = createCommand('db-reset', 'Reset the database to a clean state');
 *
 * program
 *   .option('--force', 'Skip confirmation prompt')
 *   .action(async (options) => {
 *     // Command logic here
 *   });
 *
 * await program.parseAsync();
 * ```
 */
export function createCommand(
  name: string,
  description: string,
  version = '1.0.0',
): Command {
  return new Command()
    .name(name)
    .description(description)
    .version(version)
    .option('-v, --verbose', 'Enable verbose logging')
    .option('--dry-run', 'Preview changes without applying them')
    .hook('preAction', (thisCommand) => {
      const opts = thisCommand.opts();
      if (opts.verbose) {
        process.env.LOG_LEVEL = 'debug';
      }
    });
}

/**
 * Parses and validates command-line options using Zod schema.
 *
 * Validates options against the provided schema and exits with
 * detailed error messages if validation fails.
 *
 * @template T - Zod schema type
 * @param schema - Zod schema for validation
 * @param options - Options object to validate
 * @returns Validated and typed options
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const OptionsSchema = z.object({
 *   port: z.number().default(3000),
 *   host: z.string().default('localhost'),
 *   verbose: z.boolean().default(false)
 * });
 *
 * const options = parseOptions(OptionsSchema, program.opts());
 * // options is now typed and validated
 * ```
 */
export function parseOptions<T extends z.ZodType>(
  schema: T,
  options: unknown,
): z.infer<T> {
  try {
    return schema.parse(options);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Invalid options:');
      error.errors.forEach((err) => {
        logger.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}
