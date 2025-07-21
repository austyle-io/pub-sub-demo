/**
 * Global test setup for server tests
 * This file runs BEFORE any test files are imported, ensuring environment variables
 * are set before server modules that call validateEnv() at import time.
 *
 * This follows Node.js testing best practices for environment configuration.
 */

// Set required environment variables for all server tests
process.env['JWT_ACCESS_SECRET'] =
  'test-access-secret-key-for-testing-only-32-chars-minimum';
process.env['JWT_REFRESH_SECRET'] =
  'test-refresh-secret-key-for-testing-only-32-chars-minimum';
process.env['MONGO_URL'] =
  process.env['MONGO_URL'] ?? 'mongodb://localhost:27017/collab_demo_test';
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3001';
process.env['CLIENT_URL'] = 'http://localhost:3000';

// Prevent process.exit calls during tests
const originalProcessExit = process.exit;
process.exit = ((code?: number) => {
  if (process.env['NODE_ENV'] === 'test') {
    throw new Error(`process.exit(${code ?? 0}) called during test`);
  }
  return originalProcessExit(code);
}) as typeof process.exit;
