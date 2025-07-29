import isNil from 'lodash.isnil';
import pino, { type Logger as PinoLogger } from 'pino';

export const LOG_LEVEL = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
} as const;

export type LogLevel = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];

export type LogContext = Record<string, unknown>;

export type LoggerConfig = {
  level: LogLevel;
  module: string;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  enableExternal: boolean;
  pretty?: boolean;
};

export type AppLogger = {
  error: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
  trace: (message: string, context?: LogContext) => void;
  child: (bindings: LogContext) => AppLogger;
  flush: () => Promise<void>;
};

// Environment-specific configurations
export const LOGGING_CONFIG = {
  development: {
    level: LOG_LEVEL.DEBUG,
    enableConsole: true,
    enableFile: false,
    enableExternal: false,
    pretty: true,
  },
  production: {
    level: LOG_LEVEL.INFO,
    enableConsole: true,
    enableFile: true,
    filePath: '.logs/production.log',
    enableExternal: false,
    pretty: false,
  },
  test: {
    level: LOG_LEVEL.ERROR,
    enableConsole: false,
    enableFile: false,
    enableExternal: false,
    pretty: false,
  },
} as const;

const getEnvironmentConfig = (): Partial<LoggerConfig> => {
  const env = (process.env['NODE_ENV'] ||
    'development') as keyof typeof LOGGING_CONFIG;
  return LOGGING_CONFIG[env] || LOGGING_CONFIG.development;
};

export const createAppLogger = (
  module: string,
  config?: Partial<LoggerConfig>,
): AppLogger => {
  const envConfig = getEnvironmentConfig();
  const finalConfig: LoggerConfig = {
    level: LOG_LEVEL.INFO,
    enableConsole: true,
    enableFile: false,
    enableExternal: false,
    pretty: false,
    module,
    ...envConfig,
    ...config,
  };

  // Create transport configuration
  const transport =
    finalConfig.pretty && finalConfig.enableConsole
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined;

  // Create Pino logger instance
  const pinoLogger: PinoLogger = pino({
    level: finalConfig.level,
    transport,
    base: {
      module: finalConfig.module,
      service: process.env['SERVICE_NAME'] || 'pub-sub-demo',
      version: process.env['APP_VERSION'] || '1.0.0',
    },
  });

  // Create wrapper that implements AppLogger interface
  const createLogMethod = (level: LogLevel) => {
    return (message: string, context?: LogContext) => {
      if (isNil(context) || Object.keys(context || {}).length === 0) {
        pinoLogger[level](message);
      } else {
        pinoLogger[level](context, message);
      }
    };
  };

  const appLogger: AppLogger = {
    error: createLogMethod(LOG_LEVEL.ERROR),
    warn: createLogMethod(LOG_LEVEL.WARN),
    info: createLogMethod(LOG_LEVEL.INFO),
    debug: createLogMethod(LOG_LEVEL.DEBUG),
    trace: createLogMethod(LOG_LEVEL.TRACE),

    child: (bindings: LogContext): AppLogger => {
      const childPino = pinoLogger.child(bindings);

      return {
        error: (message: string, context?: LogContext) => {
          if (isNil(context)) {
            childPino.error(message);
          } else {
            childPino.error(context, message);
          }
        },
        warn: (message: string, context?: LogContext) => {
          if (isNil(context)) {
            childPino.warn(message);
          } else {
            childPino.warn(context, message);
          }
        },
        info: (message: string, context?: LogContext) => {
          if (isNil(context)) {
            childPino.info(message);
          } else {
            childPino.info(context, message);
          }
        },
        debug: (message: string, context?: LogContext) => {
          if (isNil(context)) {
            childPino.debug(message);
          } else {
            childPino.debug(context, message);
          }
        },
        trace: (message: string, context?: LogContext) => {
          if (isNil(context)) {
            childPino.trace(message);
          } else {
            childPino.trace(context, message);
          }
        },
        child: (childBindings: LogContext) =>
          appLogger.child({ ...bindings, ...childBindings }),
        flush: async () => {
          await new Promise((resolve) => {
            pinoLogger.flush(resolve);
          });
        },
      };
    },

    flush: async () => {
      await new Promise((resolve) => {
        pinoLogger.flush(resolve);
      });
    },
  };

  return appLogger;
};

// Export default logger instance
export const logger = createAppLogger('app');
