import { type AppLogger, createAppLogger } from '@collab-edit/shared';
import type { NextFunction, Request, Response } from 'express';

// Module-specific loggers
export const serverLogger = createAppLogger('server');
export const authLogger = createAppLogger('auth');
export const sharedbLogger = createAppLogger('sharedb');
export const apiLogger = createAppLogger('api');
export const dbLogger = createAppLogger('database');

// Simple request logging middleware
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
    } else {
      const duration = performance.now() - start;
      logger.info(`${operation} completed`, {
        duration: `${duration.toFixed(2)}ms`,
        operation,
      });
      return result;
    }
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
