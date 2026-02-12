import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.config.ts',
        'src/index.ts', // Barrel export file
        'src/auth/**', // Integration code tested in stride-desktop
        'src/services/index.ts', // Barrel export file
        'src/utils/index.ts', // Barrel export file
      ],
      // Note: scoring.service.ts has low coverage (51%) and is unused in stride-desktop
      // TODO: Either add tests or remove if truly legacy code
      thresholds: {
        statements: 88,
        branches: 90,
        functions: 90,
        lines: 88,
      },
    },
  },
});
