import { defineConfig } from 'vite';
export default defineConfig({
  build: {
    lib: { entry: 'src/index.ts', name: 'GnCopilot', formats: ['iife'], fileName: () => 'copilot.js' },
    outDir: 'dist', minify: true, sourcemap: false,
  },
});
