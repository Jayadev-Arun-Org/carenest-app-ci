import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/appointments': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/prescriptions': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/notifications': {
        target: 'http://localhost:3004',
        changeOrigin: true,
      },
    },
  },
});
