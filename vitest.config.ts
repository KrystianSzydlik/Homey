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
      exclude: [
        '**/*.d.ts',
        '**/types/**',
        '**/*.module.{ts,tsx}',
        '**/test/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@/app': path.resolve(__dirname, './src/app'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/test': path.resolve(__dirname, './src/test'),
      '@/lib/constants': path.resolve(__dirname, './src/lib/constants'),
      '@/lib/actions': path.resolve(__dirname, './src/lib/actions'),
      '@/lib/utils': path.resolve(__dirname, './src/lib/utils'),
      '@/lib/pln-validation.server': path.resolve(__dirname, './src/lib/pln-validation.server'),
      '@/lib/pln-validation': path.resolve(__dirname, './src/lib/pln-validation'),
      '@/lib/serializers': path.resolve(__dirname, './src/lib/serializers'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@': path.resolve(__dirname, './'),
    },
  },
});
