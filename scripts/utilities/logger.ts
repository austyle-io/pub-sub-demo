#!/usr/bin/env node --experimental-strip-types

/**
 * Simple logging utility for CLI scripts.
 *
 * This module provides a lightweight logger with colored output and
 * configurable log levels. It's designed specifically for CLI scripts
 * and development tools, not for production applications.
 *
 * @module utilities/logger
 * @since 1.0.0
 */

/**
 * Available log levels.
 *
 * Log levels in order of increasing severity:
 * - DEBUG: Detailed information for debugging
 * - INFO: General informational messages
 * - WARN: Warning messages
 * - ERROR: Error messages
 *
 * @since 1.0.0
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

/**
 * Log level type.
 * @since 1.0.0
 */
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

/**
 * Simple logger implementation with colored console output.
 *
 * Features:
 * - Colored output for different log levels
 * - Timestamp prefixes
 * - Configurable log level via constructor or LOG_LEVEL env var
 * - Automatic message formatting
 *
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const log = new Logger(LogLevel.DEBUG);
 *
 * log.debug('Detailed debug information');
 * log.info('Script started');
 * log.warn('This might be a problem');
 * log.error('Something went wrong!');
 * ```
 */
export class Logger {
  private level: LogLevel;
  private colors = {
    debug: '\x1b[90m', // gray
    info: '\x1b[36m', // cyan
    warn: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
    reset: '\x1b[0m',
  };

  constructor(level?: LogLevel) {
    this.level = level || (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
    ];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(level: LogLevel, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const color = this.colors[level];
    const reset = this.colors.reset;
    const prefix = `${color}[${timestamp}] [${level.toUpperCase()}]${reset}`;
    const message = args.length > 0 ? ` ${args.join(' ')}` : '';
    return `${prefix}${message}`;
  }

  /**
   * Logs a debug message.
   *
   * Only outputs if current log level is DEBUG.
   *
   * @param args - Values to log
   * @since 1.0.0
   */
  debug(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, ...args));
    }
  }

  /**
   * Logs an info message.
   *
   * Outputs if current log level is INFO or lower.
   *
   * @param args - Values to log
   * @since 1.0.0
   */
  info(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, ...args));
    }
  }

  /**
   * Logs a warning message.
   *
   * Outputs if current log level is WARN or lower.
   *
   * @param args - Values to log
   * @since 1.0.0
   */
  warn(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, ...args));
    }
  }

  /**
   * Logs an error message.
   *
   * Always outputs regardless of log level.
   *
   * @param args - Values to log
   * @since 1.0.0
   */
  error(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, ...args));
    }
  }
}

/**
 * Default logger instance.
 *
 * Pre-configured logger that uses the LOG_LEVEL environment variable
 * or defaults to INFO level.
 *
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * import { logger } from './utilities/logger.ts';
 *
 * logger.info('Starting script...');
 * logger.error('Failed:', error.message);
 * ```
 */
export const logger = new Logger();
