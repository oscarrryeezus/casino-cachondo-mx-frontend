/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.jsx',
    include: ['src/**/*.test.{js,jsx}'],
    exclude: ['node_modules', 'dist'],
    server: {
      deps: {
        inline: [
          '@mui/icons-material',
          '@mui/material',
          'react-router-dom'
        ]
      }
    },
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 1,
        minForks: 1
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
});