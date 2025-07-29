import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogLevel, Logger, logger } from '../../utilities/logger.ts';

describe('Logger', () => {
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let originalLogLevel: string | undefined;

  beforeEach(() => {
    originalLogLevel = process.env.LOG_LEVEL;
    delete process.env.LOG_LEVEL;

    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalLogLevel !== undefined) {
      process.env.LOG_LEVEL = originalLogLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }
  });

  describe('log level filtering', () => {
    it('should log all levels when set to DEBUG', () => {
      process.env.LOG_LEVEL = LogLevel.DEBUG;
      const testLogger = new Logger(LogLevel.DEBUG);

      testLogger.debug('debug message');
      testLogger.info('info message');
      testLogger.warn('warn message');
      testLogger.error('error message');

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should log INFO and above when set to INFO', () => {
      const testLogger = new Logger(LogLevel.INFO);

      testLogger.debug('debug message');
      testLogger.info('info message');
      testLogger.warn('warn message');
      testLogger.error('error message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should log WARN and above when set to WARN', () => {
      const testLogger = new Logger(LogLevel.WARN);

      testLogger.debug('debug message');
      testLogger.info('info message');
      testLogger.warn('warn message');
      testLogger.error('error message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should log only ERROR when set to ERROR', () => {
      const testLogger = new Logger(LogLevel.ERROR);

      testLogger.debug('debug message');
      testLogger.info('info message');
      testLogger.warn('warn message');
      testLogger.error('error message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('log formatting', () => {
    it('should format messages with timestamp and level', () => {
      const testLogger = new Logger(LogLevel.INFO);
      const timestampRegex = /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/;

      testLogger.info('test message', 'with', 'multiple', 'args');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toMatch(timestampRegex);
      expect(logOutput).toContain('[INFO]');
      expect(logOutput).toContain('test message with multiple args');
    });

    it('should include color codes in formatted messages', () => {
      const testLogger = new Logger(LogLevel.DEBUG);

      testLogger.debug('debug');
      testLogger.info('info');
      testLogger.warn('warn');
      testLogger.error('error');

      const debugOutput = consoleDebugSpy.mock.calls[0][0];
      const infoOutput = consoleInfoSpy.mock.calls[0][0];
      const warnOutput = consoleWarnSpy.mock.calls[0][0];
      const errorOutput = consoleErrorSpy.mock.calls[0][0];

      expect(debugOutput).toContain('\x1b[90m'); // gray
      expect(infoOutput).toContain('\x1b[36m'); // cyan
      expect(warnOutput).toContain('\x1b[33m'); // yellow
      expect(errorOutput).toContain('\x1b[31m'); // red

      // All should reset colors
      expect(debugOutput).toContain('\x1b[0m');
      expect(infoOutput).toContain('\x1b[0m');
      expect(warnOutput).toContain('\x1b[0m');
      expect(errorOutput).toContain('\x1b[0m');
    });
  });

  describe('environment configuration', () => {
    it('should respect LOG_LEVEL environment variable', () => {
      process.env.LOG_LEVEL = LogLevel.WARN;
      const testLogger = new Logger();

      testLogger.debug('debug');
      testLogger.info('info');
      testLogger.warn('warn');
      testLogger.error('error');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should default to INFO level when not specified', () => {
      delete process.env.LOG_LEVEL;
      const testLogger = new Logger();

      testLogger.debug('debug');
      testLogger.info('info');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('argument handling', () => {
    it('should handle multiple arguments', () => {
      const testLogger = new Logger(LogLevel.INFO);

      testLogger.info('message', { obj: 'test' }, 123, null, undefined);

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      // Check that all parts are in the output (null and undefined are converted to empty strings by join)
      expect(logOutput).toContain('message [object Object] 123  ');
    });

    it('should handle empty arguments', () => {
      const testLogger = new Logger(LogLevel.INFO);

      testLogger.info();

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      // The logger now doesn't add a space if no args, so the pattern should end right after [INFO] and reset code
      expect(logOutput).toMatch(/\[INFO\]\x1b\[0m$/);
    });
  });
});
