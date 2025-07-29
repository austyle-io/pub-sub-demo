import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  createCommand,
  ensureError,
  handleError,
  parseOptions,
  setupGracefulShutdown,
} from '../../utilities/cli-utils.ts';

// Mock the logger to avoid actual console output in tests
vi.mock('../../utilities/logger.ts', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('cli-utils', () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`Process exited with code ${code}`);
    });
    originalProcessEnv = { ...process.env };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalProcessEnv;
  });

  describe('ensureError', () => {
    it('should return the same Error instance if input is Error', () => {
      const error = new Error('test error');
      const result = ensureError(error);
      expect(result).toBe(error);
    });

    it('should convert string to Error', () => {
      const result = ensureError('string error');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('string error');
    });

    it('should convert number to Error', () => {
      const result = ensureError(404);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('404');
    });

    it('should convert object to Error', () => {
      const obj = { message: 'object error', code: 'TEST_ERROR' };
      const result = ensureError(obj);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('[object Object]');
    });

    it('should convert null to Error', () => {
      const result = ensureError(null);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('null');
    });

    it('should convert undefined to Error', () => {
      const result = ensureError(undefined);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('undefined');
    });
  });

  describe('handleError', () => {
    it('should log error message and exit with code 1', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      const error = new Error('test error');

      await expect(handleError(error)).rejects.toThrow(
        'Process exited with code 1',
      );

      expect(logger.error).toHaveBeenCalledWith('Script failed:', 'test error');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should log stack trace when DEBUG is set', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      process.env.DEBUG = 'true';
      const error = new Error('test error');

      await expect(handleError(error)).rejects.toThrow(
        'Process exited with code 1',
      );

      expect(logger.error).toHaveBeenCalledWith('Script failed:', 'test error');
      expect(logger.debug).toHaveBeenCalledWith('Stack trace:', error.stack);
    });

    it('should not log stack trace when DEBUG is not set', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      delete process.env.DEBUG;
      const error = new Error('test error');

      await expect(handleError(error)).rejects.toThrow(
        'Process exited with code 1',
      );

      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('should handle non-Error values', async () => {
      const { logger } = await import('../../utilities/logger.ts');

      await expect(handleError('string error')).rejects.toThrow(
        'Process exited with code 1',
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Script failed:',
        'string error',
      );
    });
  });

  describe('setupGracefulShutdown', () => {
    it('should register SIGINT and SIGTERM handlers', () => {
      const onSpy = vi.spyOn(process, 'on');

      setupGracefulShutdown();

      expect(onSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
    });

    it('should call cleanup function on SIGINT', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      const cleanup = vi.fn().mockResolvedValue(undefined);
      const listeners: Record<string, Function> = {};

      vi.spyOn(process, 'on').mockImplementation((event, handler) => {
        listeners[event as string] = handler;
        return process;
      });

      setupGracefulShutdown(cleanup);

      await expect(async () => {
        await (listeners['SIGINT'] as Function)();
      }).rejects.toThrow('Process exited with code 0');

      expect(logger.info).toHaveBeenCalledWith(
        'Received SIGINT, shutting down gracefully...',
      );
      expect(cleanup).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should handle cleanup errors gracefully', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      const cleanupError = new Error('cleanup failed');
      const cleanup = vi.fn().mockRejectedValue(cleanupError);
      const listeners: Record<string, Function> = {};

      vi.spyOn(process, 'on').mockImplementation((event, handler) => {
        listeners[event as string] = handler;
        return process;
      });

      setupGracefulShutdown(cleanup);

      await expect(async () => {
        await (listeners['SIGTERM'] as Function)();
      }).rejects.toThrow('Process exited with code 0');

      expect(logger.error).toHaveBeenCalledWith(
        'Cleanup failed:',
        cleanupError,
      );
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should work without cleanup function', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      const listeners: Record<string, Function> = {};

      vi.spyOn(process, 'on').mockImplementation((event, handler) => {
        listeners[event as string] = handler;
        return process;
      });

      setupGracefulShutdown();

      await expect(async () => {
        await (listeners['SIGINT'] as Function)();
      }).rejects.toThrow('Process exited with code 0');

      expect(logger.info).toHaveBeenCalledWith(
        'Received SIGINT, shutting down gracefully...',
      );
    });
  });

  describe('createCommand', () => {
    it('should create a command with basic properties', () => {
      const command = createCommand(
        'test-cli',
        'Test CLI description',
        '2.0.0',
      );

      expect(command.name()).toBe('test-cli');
      expect(command.description()).toBe('Test CLI description');
      expect(command.version()).toBe('2.0.0');
    });

    it('should use default version when not provided', () => {
      const command = createCommand('test-cli', 'Test CLI description');

      expect(command.version()).toBe('1.0.0');
    });

    it('should include verbose and dry-run options', () => {
      const command = createCommand('test-cli', 'Test CLI description');
      const options = command.options;

      const verboseOption = options.find((opt) => opt.short === '-v');
      expect(verboseOption).toBeDefined();
      expect(verboseOption?.long).toBe('--verbose');
      expect(verboseOption?.description).toBe('Enable verbose logging');

      const dryRunOption = options.find((opt) => opt.long === '--dry-run');
      expect(dryRunOption).toBeDefined();
      expect(dryRunOption?.description).toBe(
        'Preview changes without applying them',
      );
    });

    it('should set LOG_LEVEL to debug when verbose flag is used', async () => {
      // Store original value
      const originalLogLevel = process.env.LOG_LEVEL;
      delete process.env.LOG_LEVEL;

      const command = createCommand('test-cli', 'Test CLI description');

      // Add an action to trigger the preAction hook
      let actionCalled = false;
      command.action(() => {
        actionCalled = true;
      });

      // Simulate parsing with verbose flag
      await command.parseAsync(['node', 'test-cli', '--verbose'], {
        from: 'node',
      });

      expect(actionCalled).toBe(true);
      expect(process.env.LOG_LEVEL).toBe('debug');

      // Restore original value
      if (originalLogLevel !== undefined) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });
  });

  describe('parseOptions', () => {
    const TestSchema = z.object({
      name: z.string(),
      age: z.number(),
      active: z.boolean().optional(),
    });

    it('should parse valid options successfully', () => {
      const options = {
        name: 'John',
        age: 30,
        active: true,
      };

      const result = parseOptions(TestSchema, options);

      expect(result).toEqual(options);
    });

    it('should parse options with optional fields', () => {
      const options = {
        name: 'Jane',
        age: 25,
      };

      const result = parseOptions(TestSchema, options);

      expect(result).toEqual(options);
    });

    it('should exit process on validation error', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      const invalidOptions = {
        name: 'Bob',
        age: 'not-a-number', // Invalid type
      };

      expect(() => parseOptions(TestSchema, invalidOptions)).toThrow(
        'Process exited with code 1',
      );

      expect(logger.error).toHaveBeenCalledWith('Invalid options:');
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('age:'),
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should log all validation errors', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      const invalidOptions = {
        // Missing required fields
        active: 'yes', // Wrong type
      };

      expect(() => parseOptions(TestSchema, invalidOptions)).toThrow(
        'Process exited with code 1',
      );

      // Should have errors for both missing fields and wrong type
      const errorCalls = (logger.error as any).mock.calls;
      const errorMessages = errorCalls.map((call: any[]) => call.join(' '));

      expect(errorMessages.some((msg: string) => msg.includes('name:'))).toBe(
        true,
      );
      expect(errorMessages.some((msg: string) => msg.includes('age:'))).toBe(
        true,
      );
      expect(errorMessages.some((msg: string) => msg.includes('active:'))).toBe(
        true,
      );
    });

    it('should rethrow non-Zod errors', () => {
      const schema = z.object({}).refine(() => {
        throw new Error('Custom error');
      });

      expect(() => parseOptions(schema, {})).toThrow('Custom error');
    });
  });
});
