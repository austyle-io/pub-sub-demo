import { afterEach, beforeEach } from 'vitest';

// Global test setup
beforeEach(() => {
  // Store original env
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Suppress logs during tests
});

afterEach(() => {
  // Cleanup after each test
  delete process.env.LOG_LEVEL;
});
