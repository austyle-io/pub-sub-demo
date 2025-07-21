import { useCallback, useMemo } from 'react';

// Define log levels
export const LOG_LEVEL = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

export type LogLevel = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];
export type LogContext = Record<string, unknown>;

// Client-side logger interface
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
 * React hook for structured client-side logging
 *
 * @param module - Module name for context
 * @param baseContext - Base context to include in all logs
 * @returns ClientLogger instance with structured logging methods
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

// Default logger instance
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
