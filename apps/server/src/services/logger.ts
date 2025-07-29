import { type AppLogger, createAppLogger } from '@collab-edit/shared';
import type { NextFunction, Request, Response } from 'express';

// Module-specific loggers
/**
 * @summary Logger instance for general server-related events.
 * @since 1.0.0
 */
export const serverLogger = createAppLogger('server');
/**
 * @summary Logger instance for authentication-related events.
 * @since 1.0.0
 */
export const authLogger = createAppLogger('auth');
/**
 * @summary Logger instance for ShareDB-related events.
 * @since 1.0.0
 */
export const sharedbLogger = createAppLogger('sharedb');
/**
 * @summary Logger instance for API-related events.
 * @since 1.0.0
 */
export const apiLogger = createAppLogger('api');
/**
 * @summary Logger instance for database-related events.
 * @since 1.0.0
 */
export const dbLogger = createAppLogger('database');

// Simple request logging middleware
/**
 * @summary Middleware for logging incoming HTTP requests.
 * @remarks
 * This middleware logs the method and URL of each incoming request, and assigns
 * a unique request ID for tracing.
 * @param req - The Express request object.
 * @param _res - The Express response object (unused).
 * @param next - The next middleware function.
 * @since 1.0.0
 */
export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const requestId = Math.random().toString(36).substring(7);
  const logger = apiLogger.child({
    requestId,
    method: req.method,
    url: req.url,
  });

  logger.info('Request received');
  next();
};

// Performance logging utility
/**
 * @summary A utility function to log the performance of a given operation.
 * @remarks
 * This function wraps a synchronous or asynchronous function, logs the execution time,
 * and includes the operation name in the log message. It logs success and failure
 * cases separately.
 * @template T - The return type of the wrapped function.
 * @param operation - A descriptive name for the operation being measured.
 * @param fn - The function to execute and measure.
 * @param logger - The logger instance to use for logging.
 * @returns The result of the wrapped function.
 * @since 1.0.0
 */
export const logPerformance = <T>(
  operation: string,
  fn: () => T | Promise<T>,
  logger: AppLogger,
): T | Promise<T> => {
  const start = performance.now();

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result.then(
        (value) => {
          const duration = performance.now() - start;
          logger.info(`${operation} completed`, {
            duration: `${duration.toFixed(2)}ms`,
            operation,
          });
          return value;
        },
        (error) => {
          const duration = performance.now() - start;
          logger.error(`${operation} failed`, {
            duration: `${duration.toFixed(2)}ms`,
            operation,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error;
        },
      );
    }
    const duration = performance.now() - start;
    logger.info(`${operation} completed`, {
      duration: `${duration.toFixed(2)}ms`,
      operation,
    });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`${operation} failed`, {
      duration: `${duration.toFixed(2)}ms`,
      operation,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};
