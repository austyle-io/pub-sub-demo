import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:3001',
        changeOrigin: true,
      },
      '/ws': {
        target: (process.env.VITE_API_URL ?? 'http://localhost:3001').replace(
          'http://',
          'ws://',
        ),
        ws: true,
      },
    },
  },
});
