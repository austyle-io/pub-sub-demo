import { useCallback, useMemo } from 'react';

/**
 * @summary Defines the available log levels.
 * @since 1.0.0
 */
export const LOG_LEVEL = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

/**
 * @summary Type definition for the available log levels.
 * @since 1.0.0
 */
export type LogLevel = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];

/**
 * @summary Type definition for the log context object.
 * @since 1.0.0
 */
export type LogContext = Record<string, unknown>;

/**
 * @summary Interface for the client-side logger.
 * @since 1.0.0
 */
export type ClientLogger = {
  error: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
  child: (context: LogContext) => ClientLogger;
};

// Environment-based configuration
const getLogConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const logLevel =
    import.meta.env['VITE_LOG_LEVEL'] || (isDevelopment ? 'debug' : 'warn');

  return {
    level: logLevel as LogLevel,
    enableConsole: isDevelopment,
    enableRemote: !isDevelopment,
  };
};

// Create a structured log entry
const createLogEntry = (
  level: LogLevel,
  message: string,
  context?: LogContext,
  baseContext?: LogContext,
) => {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...baseContext,
    ...context,
  };
};

// Log level priorities for filtering
const LOG_PRIORITIES = {
  [LOG_LEVEL.ERROR]: 4,
  [LOG_LEVEL.WARN]: 3,
  [LOG_LEVEL.INFO]: 2,
  [LOG_LEVEL.DEBUG]: 1,
};

// Check if log level should be output
const shouldLog = (level: LogLevel, configLevel: LogLevel): boolean => {
  return LOG_PRIORITIES[level] >= LOG_PRIORITIES[configLevel];
};

// Send logs to remote endpoint (for production)
const sendToRemote = async (logEntry: unknown) => {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry),
    });
  } catch (error) {
    // Fallback to console if remote logging fails
    console.error('Failed to send log to server:', error);
  }
};

/**
 * @summary A React hook for structured client-side logging.
 * @remarks
 * This hook provides a logging instance that can be used to send structured
 * logs to the console in development and to a remote endpoint in production.
 * It supports different log levels and allows for adding contextual information.
 * @param module - The name of the module for context.
 * @param baseContext - A base context to include in all logs.
 * @returns A `ClientLogger` instance with structured logging methods.
 * @since 1.0.0
 * @example
 * ```typescript
 * const logger = useLogger('MyComponent');
 * logger.info('Component mounted');
 * ```
 */
export const useLogger = (
  module: string,
  baseContext?: LogContext,
): ClientLogger => {
  const config = useMemo(() => getLogConfig(), []);

  const logMethod = useCallback(
    (level: LogLevel) => {
      return (message: string, context?: LogContext) => {
        if (!shouldLog(level, config.level)) {
          return;
        }

        const logEntry = createLogEntry(level, message, context, {
          module,
          ...baseContext,
        });

        // Console output (development)
        if (config.enableConsole) {
          const consoleMethod = level === 'debug' ? 'log' : level;
          console[consoleMethod](`[${module}] ${message}`, context || '');
        }

        // Remote logging (production)
        if (config.enableRemote) {
          sendToRemote(logEntry);
        }
      };
    },
    [module, baseContext, config],
  );

  const childLogger = useCallback(
    (childContext: LogContext): ClientLogger => {
      const combinedContext = { ...baseContext, ...childContext };
      return {
        error: logMethod(LOG_LEVEL.ERROR),
        warn: logMethod(LOG_LEVEL.WARN),
        info: logMethod(LOG_LEVEL.INFO),
        debug: logMethod(LOG_LEVEL.DEBUG),
        child: (nestedContext: LogContext) =>
          childLogger({ ...combinedContext, ...nestedContext }),
      };
    },
    [baseContext, logMethod],
  );

  return useMemo(
    () => ({
      error: logMethod(LOG_LEVEL.ERROR),
      warn: logMethod(LOG_LEVEL.WARN),
      info: logMethod(LOG_LEVEL.INFO),
      debug: logMethod(LOG_LEVEL.DEBUG),
      child: childLogger,
    }),
    [logMethod, childLogger],
  );
};

/**
 * @summary Creates a client-side logger instance.
 * @remarks
 * This function creates a logger that can be used outside of React components.
 * It provides the same functionality as the `useLogger` hook.
 * @param module - The name of the module for context.
 * @param context - A base context to include in all logs.
 * @returns A `ClientLogger` instance.
 * @since 1.0.0
 * @example
 * ```typescript
 * const logger = createClientLogger('MyService');
 * logger.info('Service initialized');
 * ```
 */
export const createClientLogger = (
  module: string,
  context?: LogContext,
): ClientLogger => {
  const config = getLogConfig();

  const logMethod = (level: LogLevel) => {
    return (message: string, logContext?: LogContext) => {
      if (!shouldLog(level, config.level)) {
        return;
      }

      const logEntry = createLogEntry(level, message, logContext, {
        module,
        ...context,
      });

      if (config.enableConsole) {
        const consoleMethod = level === 'debug' ? 'log' : level;
        console[consoleMethod](`[${module}] ${message}`, logContext || '');
      }

      if (config.enableRemote) {
        sendToRemote(logEntry);
      }
    };
  };

  return {
    error: logMethod(LOG_LEVEL.ERROR),
    warn: logMethod(LOG_LEVEL.WARN),
    info: logMethod(LOG_LEVEL.INFO),
    debug: logMethod(LOG_LEVEL.DEBUG),
    child: (childContext: LogContext) =>
      createClientLogger(module, { ...context, ...childContext }),
  };
};
