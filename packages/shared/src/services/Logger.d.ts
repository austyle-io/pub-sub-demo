/**
 * @summary Defines the available log levels.
 * @since 1.0.0
 */
export declare const LOG_LEVEL: {
  readonly ERROR: 'error';
  readonly WARN: 'warn';
  readonly INFO: 'info';
  readonly DEBUG: 'debug';
  readonly TRACE: 'trace';
};
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
 * @summary Configuration for the application logger.
 * @since 1.0.0
 */
export type LoggerConfig = {
  level: LogLevel;
  module: string;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  enableExternal: boolean;
  pretty?: boolean;
};
/**
 * @summary Interface for the application logger.
 * @since 1.0.0
 */
export type AppLogger = {
  error: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
  trace: (message: string, context?: LogContext) => void;
  child: (bindings: LogContext) => AppLogger;
  flush: () => Promise<void>;
};
/**
 * @summary Environment-specific logging configurations.
 * @since 1.0.0
 */
export declare const LOGGING_CONFIG: {
  readonly development: {
    readonly level: 'debug';
    readonly enableConsole: true;
    readonly enableFile: false;
    readonly enableExternal: false;
    readonly pretty: true;
  };
  readonly production: {
    readonly level: 'info';
    readonly enableConsole: true;
    readonly enableFile: true;
    readonly filePath: '.logs/production.log';
    readonly enableExternal: false;
    readonly pretty: false;
  };
  readonly test: {
    readonly level: 'error';
    readonly enableConsole: false;
    readonly enableFile: false;
    readonly enableExternal: false;
    readonly pretty: false;
  };
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
export declare const createAppLogger: (
  module: string,
  config?: Partial<LoggerConfig>,
) => AppLogger;
/**
 * @summary The default application logger instance.
 * @since 1.0.0
 */
export declare const logger: AppLogger;
//# sourceMappingURL=Logger.d.ts.map
