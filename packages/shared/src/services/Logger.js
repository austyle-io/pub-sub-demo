var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, '__esModule', { value: true });
exports.logger =
  exports.createAppLogger =
  exports.LOGGING_CONFIG =
  exports.LOG_LEVEL =
    void 0;
const lodash_isnil_1 = __importDefault(require('lodash.isnil'));
const pino_1 = __importDefault(require('pino'));
/**
 * @summary Defines the available log levels.
 * @since 1.0.0
 */
exports.LOG_LEVEL = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
};
/**
 * @summary Environment-specific logging configurations.
 * @since 1.0.0
 */
exports.LOGGING_CONFIG = {
  development: {
    level: exports.LOG_LEVEL.DEBUG,
    enableConsole: true,
    enableFile: false,
    enableExternal: false,
    pretty: true,
  },
  production: {
    level: exports.LOG_LEVEL.INFO,
    enableConsole: true,
    enableFile: true,
    filePath: '.logs/production.log',
    enableExternal: false,
    pretty: false,
  },
  test: {
    level: exports.LOG_LEVEL.ERROR,
    enableConsole: false,
    enableFile: false,
    enableExternal: false,
    pretty: false,
  },
};
const getEnvironmentConfig = () => {
  const env = process.env['NODE_ENV'] || 'development';
  return exports.LOGGING_CONFIG[env] || exports.LOGGING_CONFIG.development;
};
/**
 * @summary Creates an application logger instance.
 * @remarks
 * This function creates a logger with a specified module name and optional
 * configuration. It automatically uses the correct configuration based on the
 * environment.
 * @param module - The name of the module for context.
 * @param config - Optional configuration to override the environment defaults.
 * @returns An `AppLogger` instance.
 * @since 1.0.0
 * @example
 * ```typescript
 * const logger = createAppLogger('MyModule');
 * logger.info('Module initialized');
 * ```
 */
const createAppLogger = (module, config) => {
  const envConfig = getEnvironmentConfig();
  const finalConfig = {
    level: exports.LOG_LEVEL.INFO,
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
  const pinoLogger = (0, pino_1.default)({
    level: finalConfig.level,
    transport,
    base: {
      module: finalConfig.module,
      service: process.env['SERVICE_NAME'] || 'pub-sub-demo',
      version: process.env['APP_VERSION'] || '1.0.0',
    },
  });
  // Create wrapper that implements AppLogger interface
  const createLogMethod = (level) => {
    return (message, context) => {
      if (
        (0, lodash_isnil_1.default)(context) ||
        Object.keys(context || {}).length === 0
      ) {
        pinoLogger[level](message);
      } else {
        pinoLogger[level](context, message);
      }
    };
  };
  const appLogger = {
    error: createLogMethod(exports.LOG_LEVEL.ERROR),
    warn: createLogMethod(exports.LOG_LEVEL.WARN),
    info: createLogMethod(exports.LOG_LEVEL.INFO),
    debug: createLogMethod(exports.LOG_LEVEL.DEBUG),
    trace: createLogMethod(exports.LOG_LEVEL.TRACE),
    child: (bindings) => {
      const childPino = pinoLogger.child(bindings);
      return {
        error: (message, context) => {
          if ((0, lodash_isnil_1.default)(context)) {
            childPino.error(message);
          } else {
            childPino.error(context, message);
          }
        },
        warn: (message, context) => {
          if ((0, lodash_isnil_1.default)(context)) {
            childPino.warn(message);
          } else {
            childPino.warn(context, message);
          }
        },
        info: (message, context) => {
          if ((0, lodash_isnil_1.default)(context)) {
            childPino.info(message);
          } else {
            childPino.info(context, message);
          }
        },
        debug: (message, context) => {
          if ((0, lodash_isnil_1.default)(context)) {
            childPino.debug(message);
          } else {
            childPino.debug(context, message);
          }
        },
        trace: (message, context) => {
          if ((0, lodash_isnil_1.default)(context)) {
            childPino.trace(message);
          } else {
            childPino.trace(context, message);
          }
        },
        child: (childBindings) =>
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
exports.createAppLogger = createAppLogger;
/**
 * @summary The default application logger instance.
 * @since 1.0.0
 */
exports.logger = (0, exports.createAppLogger)('app');
