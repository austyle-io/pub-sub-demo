import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    // Increase timeouts for CI environments where tests may run slower
    testTimeout: process.env['CI'] ? 30000 : 10000, // 30s in CI, 10s locally
    hookTimeout: process.env['CI'] ? 30000 : 10000,
    // Add retry logic for flaky tests in CI
    retry: process.env['CI'] ? 2 : 0,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
    // Ensure proper environment variables are set
    env: {
      NODE_ENV: 'test',
    },
  },
});
