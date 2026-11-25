import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5173, open: true },
  preview: { port: 6173 },
  build: { target: 'es2022' },
});
