import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/translate': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/api/submissions': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/api/ai': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/api/my_submissions': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/api/delete_resource': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/zip-api': {
        target: 'https://www.zipcodeapi.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/zip-api/, ''),
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
