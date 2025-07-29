import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock utilities
vi.mock('../../utilities/logger.ts', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../../utilities/cli-utils.ts', () => ({
  handleError: vi.fn(),
  setupGracefulShutdown: vi.fn(),
  createCommand: vi.fn(() => ({
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
    parse: vi.fn(),
  })),
  parseOptions: vi.fn((schema, options) => options),
}));

// Mock Node.js modules
vi.mock('node:child_process');
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));
vi.mock('node:readline');

// Mock promisify to return our mocked exec
const execAsyncMock = vi.fn();
vi.mock('node:util', () => ({
  promisify: vi.fn(() => execAsyncMock),
}));

describe('DatabaseReset', () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let execCallbacks: Map<string, { resolve: Function; reject: Function }>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks(); // Reset mocks to clear implementations
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`Process exited with code ${code}`);
    });

    execCallbacks = new Map();

    // Reset execAsyncMock
    execAsyncMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createDatabaseReset = async () => {
    const { DatabaseReset } = await import(
      '../../development/reset-database.ts'
    );
    return new DatabaseReset({
      force: false,
      mongoUrl: 'mongodb://localhost:27017/test_db',
      nodeEnv: 'development',
      ci: false,
    });
  };

  describe('confirmReset', () => {
    it('should reject production environment', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      const { DatabaseReset } = await import(
        '../../development/reset-database.ts'
      );
      const reset = new DatabaseReset({
        nodeEnv: 'production',
        mongoUrl: 'mongodb://localhost:27017/prod_db',
        force: false,
        ci: false,
      });

      await expect(reset.confirmReset()).rejects.toThrow(
        'Process exited with code 1',
      );

      expect(logger.error).toHaveBeenCalledWith(
        '❌ Cannot reset production database!',
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Set NODE_ENV to development or test to continue',
      );
    });

    it('should skip confirmation with force flag', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      const { DatabaseReset } = await import(
        '../../development/reset-database.ts'
      );
      const reset = new DatabaseReset({
        force: true,
        mongoUrl: 'mongodb://localhost:27017/test_db',
        nodeEnv: 'development',
        ci: false,
      });

      await reset.confirmReset();

      expect(logger.info).toHaveBeenCalledWith(
        'Running in CI or with --force flag, proceeding automatically',
      );
    });

    it('should skip confirmation in CI environment', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      const { DatabaseReset } = await import(
        '../../development/reset-database.ts'
      );
      const reset = new DatabaseReset({
        force: false,
        mongoUrl: 'mongodb://localhost:27017/test_db',
        nodeEnv: 'development',
        ci: true,
      });

      await reset.confirmReset();

      expect(logger.info).toHaveBeenCalledWith(
        'Running in CI or with --force flag, proceeding automatically',
      );
    });

    it('should prompt for confirmation and proceed with "yes"', async () => {
      const mockInterface = {
        question: vi.fn((prompt, callback) => callback('yes')),
        close: vi.fn(),
      };

      vi.mocked(readline.createInterface).mockReturnValue(mockInterface as any);

      const reset = await createDatabaseReset();
      await reset.confirmReset();

      expect(mockInterface.question).toHaveBeenCalledWith(
        expect.stringContaining("type 'yes' to confirm"),
        expect.any(Function),
      );
      expect(mockInterface.close).toHaveBeenCalled();
    });

    it('should cancel reset when user does not confirm', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      const mockInterface = {
        question: vi.fn((prompt, callback) => callback('no')),
        close: vi.fn(),
      };

      vi.mocked(readline.createInterface).mockReturnValue(mockInterface as any);

      const reset = await createDatabaseReset();

      await expect(reset.confirmReset()).rejects.toThrow(
        'Process exited with code 0',
      );

      expect(logger.info).toHaveBeenCalledWith('Database reset cancelled');
    });
  });

  describe('stopContainers', () => {
    it('should stop MongoDB container if running', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      vi.mocked(existsSync).mockReturnValue(true);

      // Set up the execAsync mock
      execAsyncMock
        .mockResolvedValueOnce({
          stdout: 'mongo container is running',
          stderr: '',
        }) // docker-compose ps
        .mockResolvedValueOnce({ stdout: '', stderr: '' }); // docker-compose down

      const reset = await createDatabaseReset();
      await reset.stopContainers();

      expect(logger.info).toHaveBeenCalledWith(
        'Stopping database containers...',
      );
      expect(logger.info).toHaveBeenCalledWith('Stopping MongoDB container...');
      expect(logger.info).toHaveBeenCalledWith(
        '✅ MongoDB container stopped and volumes removed',
      );
    });

    it('should skip if docker-compose.yml not found', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      vi.mocked(existsSync).mockReturnValue(false);

      const reset = await createDatabaseReset();
      await reset.stopContainers();

      expect(logger.warn).toHaveBeenCalledWith(
        'No docker-compose.yml found, skipping container stop',
      );
    });

    it('should handle docker-compose not installed', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      vi.mocked(existsSync).mockReturnValue(true);

      const error: any = new Error(
        'docker-compose not found. Please install Docker Compose.',
      );
      error.code = 'ENOENT';
      execAsyncMock.mockRejectedValueOnce(error);

      const reset = await createDatabaseReset();

      // stopContainers catches errors and logs warnings instead of throwing
      await reset.stopContainers();

      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to check/stop containers:',
        expect.any(Error),
      );
    });
  });

  describe('startContainers', () => {
    it('should start MongoDB container and wait for it to be ready', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      vi.mocked(existsSync).mockReturnValue(true);

      // Mock start container success
      execAsyncMock.mockResolvedValueOnce({ stdout: '', stderr: '' }); // up -d mongo

      // Mock ping attempts - fail twice, then succeed
      execAsyncMock
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce({ stdout: 'ping successful', stderr: '' });

      const reset = await createDatabaseReset();
      await reset.startContainers();

      expect(logger.info).toHaveBeenCalledWith('Starting MongoDB container...');
      expect(logger.info).toHaveBeenCalledWith('✅ MongoDB is ready');
      expect(execAsyncMock).toHaveBeenCalledTimes(4); // 1 up + 3 pings
    });

    it('should timeout if MongoDB does not start', async () => {
      vi.mocked(existsSync).mockReturnValue(true);

      // Mock start container success
      execAsyncMock.mockResolvedValueOnce({ stdout: '', stderr: '' });

      // Mock all ping attempts to fail
      execAsyncMock.mockRejectedValue(new Error('Connection failed'));

      const reset = await createDatabaseReset();

      // Mock setTimeout to speed up test
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const startPromise = reset.startContainers();

      // Fast-forward through all retries
      await vi.runAllTimersAsync();

      await expect(startPromise).rejects.toThrow(
        '❌ MongoDB failed to start within timeout',
      );

      vi.useRealTimers();
    });
  });

  describe('extractDatabaseName', () => {
    it('should extract database name from MongoDB URL', async () => {
      const reset = await createDatabaseReset();

      expect(reset.extractDatabaseName('mongodb://localhost:27017/mydb')).toBe(
        'mydb',
      );
      expect(
        reset.extractDatabaseName(
          'mongodb://user:pass@host:27017/testdb?authSource=admin',
        ),
      ).toBe('testdb');
      expect(
        reset.extractDatabaseName('mongodb+srv://cluster.mongodb.net/proddb'),
      ).toBe('proddb');
    });

    it('should return default name if extraction fails', async () => {
      const reset = await createDatabaseReset();

      expect(reset.extractDatabaseName('invalid-url')).toBe('collab_demo');
      expect(reset.extractDatabaseName('mongodb://localhost:27017/')).toBe(
        'collab_demo',
      );
    });
  });

  describe('resetDatabase', () => {
    it('should drop database using mongosh', async () => {
      const { logger } = await import('../../utilities/logger.ts');

      // Mock which commands
      execAsyncMock.mockResolvedValueOnce({
        stdout: '/usr/bin/mongosh',
        stderr: '',
      }); // which mongosh

      // Mock database operations
      execAsyncMock.mockResolvedValueOnce({
        stdout: 'Database dropped',
        stderr: '',
      }); // dropDatabase
      execAsyncMock.mockRejectedValueOnce(new Error('No collections')); // db.stats() - throws when no collections

      const reset = await createDatabaseReset();
      await reset.resetDatabase();

      expect(logger.info).toHaveBeenCalledWith(
        'Using mongosh to reset database: test_db',
      );
      expect(logger.info).toHaveBeenCalledWith(
        "✅ Database 'test_db' dropped successfully",
      );
      expect(logger.info).toHaveBeenCalledWith('Collections remaining: 0');
    });

    it('should fall back to mongo if mongosh not found', async () => {
      const { logger } = await import('../../utilities/logger.ts');

      // Mock which commands - mongosh not found, mongo found
      const mongoshError: any = new Error('Command not found');
      mongoshError.code = 'ENOENT';
      execAsyncMock.mockRejectedValueOnce(mongoshError); // which mongosh fails
      execAsyncMock.mockResolvedValueOnce({
        stdout: '/usr/bin/mongo',
        stderr: '',
      }); // which mongo succeeds

      // Mock database operations
      execAsyncMock.mockResolvedValueOnce({
        stdout: 'Database dropped',
        stderr: '',
      }); // dropDatabase
      execAsyncMock.mockResolvedValueOnce({ stdout: '3', stderr: '' }); // db.stats() returns collection count

      const reset = await createDatabaseReset();
      await reset.resetDatabase();

      expect(logger.info).toHaveBeenCalledWith(
        'Using mongo to reset database: test_db',
      );
      expect(logger.info).toHaveBeenCalledWith('Collections remaining: 3');
    });

    it('should throw error if no MongoDB client found', async () => {
      // Mock both which commands to fail
      const notFoundError: any = new Error('Command not found');
      notFoundError.code = 'ENOENT';
      execAsyncMock.mockRejectedValue(notFoundError); // All calls fail

      const reset = await createDatabaseReset();

      await expect(reset.resetDatabase()).rejects.toThrow(
        'No MongoDB client found',
      );
    });
  });

  describe('seedInitialData', () => {
    it('should run seed script if it exists', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      vi.mocked(existsSync).mockReturnValue(true);

      // Mock execAsync to succeed for seed script
      execAsyncMock.mockResolvedValueOnce({
        stdout: 'Seed complete',
        stderr: '',
      });

      const reset = await createDatabaseReset();
      await reset.seedInitialData();

      expect(logger.info).toHaveBeenCalledWith('✅ Development data seeded');
    });

    it('should handle seed script failure gracefully', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      vi.mocked(existsSync).mockReturnValue(true);

      // Mock execAsync to reject for seed script
      execAsyncMock.mockRejectedValueOnce(new Error('Seed failed'));

      const reset = await createDatabaseReset();
      await reset.seedInitialData();

      expect(logger.warn).toHaveBeenCalledWith(
        '⚠️  Seed script failed (this may be normal)',
      );
    });

    it('should skip seeding if no seed script exists', async () => {
      const { logger } = await import('../../utilities/logger.ts');
      vi.mocked(existsSync).mockReturnValue(false);

      const reset = await createDatabaseReset();
      await reset.seedInitialData();

      expect(logger.info).toHaveBeenCalledWith(
        'Database reset complete with empty state',
      );
    });
  });
});
