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
        'src/auth/**', // Auth provider integration (tested in stride-desktop)
        'src/db/**', // Database connection infrastructure (integration tests)
        'src/drizzle/index.ts', // Barrel export
        'src/drizzle/types.ts', // Type definitions only
        'src/repositories/index.ts', // Barrel export
        'src/tests/setup.ts', // Test infrastructure
      ],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 89,
        lines: 90,
      },
    },
  },
});
