/**
 * Mock break generator for testing
 */

import type { Break, BreakType } from '@stridetime/types';

/**
 * Create a mock break with optional overrides
 */
export function createMockBreak(overrides: Partial<Break> = {}): Break {
  return {
    id: 'break-123',
    userId: 'user-123',
    type: 'COFFEE' as BreakType,
    startedAt: new Date().toISOString(),
    endedAt: null,
    durationMinutes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

/**
 * Create multiple mock breaks with sequential IDs
 */
export function createMockBreaks(count: number, overrides: Partial<Break> = {}): Break[] {
  return Array.from({ length: count }, (_, i) =>
    createMockBreak({
      id: `break-${i + 1}`,
      ...overrides,
    })
  );
}

/**
 * Create a mock completed break (with endedAt and duration)
 */
export function createMockCompletedBreak(
  durationMinutes: number = 5,
  overrides: Partial<Break> = {}
): Break {
  const startedAt = new Date();
  const endedAt = new Date(startedAt.getTime() + durationMinutes * 60000);

  return createMockBreak({
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationMinutes,
    ...overrides,
  });
}

/**
 * Create a mock coffee break (short, 5 minutes)
 */
export function createMockCoffeeBreak(overrides: Partial<Break> = {}): Break {
  return createMockBreak({
    type: 'COFFEE' as BreakType,
    durationMinutes: 5,
    ...overrides,
  });
}

/**
 * Create a mock lunch break (longer, 30 minutes)
 */
export function createMockLunchBreak(overrides: Partial<Break> = {}): Break {
  return createMockBreak({
    type: 'LUNCH' as BreakType,
    durationMinutes: 30,
    ...overrides,
  });
}
