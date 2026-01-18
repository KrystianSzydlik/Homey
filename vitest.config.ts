import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/types/**', '**/*.module.{ts,tsx}'],
    },
  },
  resolve: {
    alias: {
      // Match tsconfig paths: @/* can resolve to both ./src/* and ./*
      // Order matters: more specific paths first
      '@/app': path.resolve(__dirname, './src/app'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      // Root-level paths
      '@/lib': path.resolve(__dirname, './lib'),
      '@/auth': path.resolve(__dirname, './auth'),
      // Fallback to root
      '@': path.resolve(__dirname, './'),
    },
  },
});
