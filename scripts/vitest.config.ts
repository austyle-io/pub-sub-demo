import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.ts',
        'dist/',
        'coverage/',
        'magic-value-tool/', // Exclude the magic-value-tool which has its own tests
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    setupFiles: ['./test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
