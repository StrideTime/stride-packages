/**
 * Mock time entry generator for testing
 */

import type { TimeEntry } from '@stridetime/types';

/**
 * Create a mock time entry with optional overrides
 */
export function createMockTimeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 'entry-123',
    userId: 'user-123',
    taskId: 'task-123',
    startedAt: new Date().toISOString(),
    endedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

/**
 * Create multiple mock time entries with sequential IDs
 */
export function createMockTimeEntries(
  count: number,
  overrides: Partial<TimeEntry> = {}
): TimeEntry[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTimeEntry({
      id: `entry-${i + 1}`,
      ...overrides,
    })
  );
}

/**
 * Create a mock completed time entry (with endedAt)
 */
export function createMockCompletedTimeEntry(
  durationMinutes: number = 60,
  overrides: Partial<TimeEntry> = {}
): TimeEntry {
  const startedAt = new Date();
  const endedAt = new Date(startedAt.getTime() + durationMinutes * 60000);

  return createMockTimeEntry({
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    ...overrides,
  });
}

/**
 * Create a mock active time entry (without endedAt)
 */
export function createMockActiveTimeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return createMockTimeEntry({
    endedAt: null,
    ...overrides,
  });
}
