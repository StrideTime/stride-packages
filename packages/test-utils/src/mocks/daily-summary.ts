/**
 * Mock daily summary generator for testing
 */

import type { DailySummary } from '@stridetime/types';

/**
 * Create a mock daily summary with optional overrides
 */
export function createMockDailySummary(overrides: Partial<DailySummary> = {}): DailySummary {
  return {
    id: 'summary-123',
    userId: 'user-123',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    tasksCompleted: 0,
    tasksWorkedOn: 0,
    totalPoints: 0,
    focusMinutes: 0,
    efficiencyRating: 1.0,
    standoutMoment: null,
    ...overrides,
  };
}

/**
 * Create multiple mock daily summaries with sequential dates
 */
export function createMockDailySummaries(count: number, overrides: Partial<DailySummary> = {}): DailySummary[] {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    return createMockDailySummary({
      id: `summary-${i + 1}`,
      date: date.toISOString().split('T')[0],
      ...overrides,
    });
  });
}
