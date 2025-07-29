import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the utilities
vi.mock('../utilities/logger.ts', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../utilities/cli-utils.ts', () => ({
  handleError: vi.fn(),
  setupGracefulShutdown: vi.fn(),
}));

// Mock Node.js modules
vi.mock('node:fs/promises');
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));
vi.mock('node:crypto', () => ({
  randomBytes: vi.fn(),
}));

describe('setup-env', () => {
  const mockEnvPath = path.join(process.cwd(), '.env');
  const mockEnvExamplePath = path.join(process.cwd(), '.env.example');
  const mockEnvContent = `
# JWT Secrets
JWT_ACCESS_SECRET=old_access_secret
JWT_REFRESH_SECRET=old_refresh_secret

# Database
MONGO_URL=mongodb://localhost:27017/test
`;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateSecret', () => {
    it('should generate a base64 encoded secret', async () => {
      const mockBuffer = Buffer.from('test-secret-data');
      vi.mocked(randomBytes).mockReturnValue(mockBuffer);

      // Import the function directly
      const { generateSecret } = await import('../setup-env.ts');

      const secret = await generateSecret();

      expect(randomBytes).toHaveBeenCalledWith(32);
      expect(secret).toBe(mockBuffer.toString('base64'));
    });
  });

  describe('updateEnvFile', () => {
    it('should update existing environment variable', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(mockEnvContent);
      vi.mocked(fs.writeFile).mockResolvedValue();

      const { updateEnvFile } = await import('../setup-env.ts');

      await updateEnvFile(mockEnvPath, 'JWT_ACCESS_SECRET', 'new_secret_value');

      expect(fs.readFile).toHaveBeenCalledWith(mockEnvPath, 'utf-8');
      expect(fs.writeFile).toHaveBeenCalledWith(
        mockEnvPath,
        expect.stringContaining('JWT_ACCESS_SECRET=new_secret_value'),
      );

      // Verify the old value was replaced
      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
      expect(writtenContent).not.toContain(
        'JWT_ACCESS_SECRET=old_access_secret',
      );
      expect(writtenContent).toContain('JWT_REFRESH_SECRET=old_refresh_secret');
    });

    it('should handle multiple occurrences of the same key', async () => {
      const contentWithDuplicates = `
JWT_ACCESS_SECRET=value1
# Old value
JWT_ACCESS_SECRET=value2
`;
      vi.mocked(fs.readFile).mockResolvedValue(contentWithDuplicates);
      vi.mocked(fs.writeFile).mockResolvedValue();

      const { updateEnvFile } = await import('../setup-env.ts');

      await updateEnvFile(mockEnvPath, 'JWT_ACCESS_SECRET', 'new_value');

      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
      const matches = writtenContent.match(/JWT_ACCESS_SECRET=new_value/g);
      expect(matches).toHaveLength(2); // Both occurrences should be updated
    });
  });

  describe('setupEnvironment', () => {
    it('should create .env from .env.example if it does not exist', async () => {
      const { logger } = await import('../utilities/logger.ts');

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path === mockEnvPath) return false;
        if (path === mockEnvExamplePath) return true;
        return false;
      });

      vi.mocked(fs.copyFile).mockResolvedValue();
      vi.mocked(fs.readFile).mockResolvedValue(mockEnvContent);
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(randomBytes).mockReturnValue(Buffer.from('test-secret'));

      const { setupEnvironment } = await import('../setup-env.ts');

      await setupEnvironment();

      expect(fs.copyFile).toHaveBeenCalledWith(mockEnvExamplePath, mockEnvPath);
      expect(logger.info).toHaveBeenCalledWith(
        'Creating .env file from .env.example...',
      );
    });

    it('should not copy .env.example if .env already exists', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(mockEnvContent);
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(randomBytes).mockReturnValue(Buffer.from('test-secret'));

      const { setupEnvironment } = await import('../setup-env.ts');

      await setupEnvironment();

      expect(fs.copyFile).not.toHaveBeenCalled();
    });

    it('should throw error if .env.example does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const { setupEnvironment } = await import('../setup-env.ts');

      await expect(setupEnvironment()).rejects.toThrow(
        '.env.example file not found',
      );
    });

    it('should generate and update JWT secrets', async () => {
      const { logger } = await import('../utilities/logger.ts');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(mockEnvContent);
      vi.mocked(fs.writeFile).mockResolvedValue();

      const accessSecretBuffer = Buffer.from('access-secret-data');
      const refreshSecretBuffer = Buffer.from('refresh-secret-data');

      vi.mocked(randomBytes)
        .mockReturnValueOnce(accessSecretBuffer)
        .mockReturnValueOnce(refreshSecretBuffer);

      const { setupEnvironment } = await import('../setup-env.ts');

      await setupEnvironment();

      // Verify secrets were generated
      expect(randomBytes).toHaveBeenCalledTimes(2);
      expect(randomBytes).toHaveBeenCalledWith(32);

      // Verify files were updated with new secrets
      expect(fs.writeFile).toHaveBeenCalledWith(
        mockEnvPath,
        expect.stringContaining(
          `JWT_ACCESS_SECRET=${accessSecretBuffer.toString('base64')}`,
        ),
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        mockEnvPath,
        expect.stringContaining(
          `JWT_REFRESH_SECRET=${refreshSecretBuffer.toString('base64')}`,
        ),
      );

      // Verify success messages
      expect(logger.info).toHaveBeenCalledWith(
        '✅ Environment setup complete!',
      );
      expect(logger.info).toHaveBeenCalledWith(
        'You may want to update MONGO_URL in .env if needed.',
      );
    });
  });

  describe('main function', () => {
    it('should setup graceful shutdown and run setupEnvironment', async () => {
      const { setupGracefulShutdown, handleError } = await import(
        '../utilities/cli-utils.ts'
      );

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(mockEnvContent);
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(randomBytes).mockReturnValue(Buffer.from('test-secret'));

      // Import main function
      const { main } = await import('../setup-env.ts');

      await main();

      expect(setupGracefulShutdown).toHaveBeenCalled();
      expect(handleError).not.toHaveBeenCalled();
    });

    it('should handle errors with handleError', async () => {
      const { handleError } = await import('../utilities/cli-utils.ts');
      const testError = new Error('Test error');

      vi.mocked(existsSync).mockReturnValue(false);

      const { main } = await import('../setup-env.ts');

      await main();

      expect(handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '.env.example file not found',
        }),
      );
    });
  });
});
