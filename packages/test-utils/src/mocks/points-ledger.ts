/**
 * Mock points ledger entry generator for testing
 */

import type { PointsLedgerEntry, PointsReason } from '@stridetime/types';

/**
 * Create a mock points ledger entry with optional overrides
 */
export function createMockPointsLedgerEntry(
  overrides: Partial<PointsLedgerEntry> = {}
): PointsLedgerEntry {
  return {
    id: 'points-123',
    userId: 'user-123',
    taskId: null,
    timeEntryId: null,
    points: 10,
    reason: 'TASK_COMPLETED' as PointsReason,
    description: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

/**
 * Create multiple mock points ledger entries with sequential IDs
 */
export function createMockPointsLedgerEntries(
  count: number,
  overrides: Partial<PointsLedgerEntry> = {}
): PointsLedgerEntry[] {
  return Array.from({ length: count }, (_, i) =>
    createMockPointsLedgerEntry({
      id: `points-${i + 1}`,
      points: (i + 1) * 10,
      ...overrides,
    })
  );
}

/**
 * Create a mock points entry for task completion
 */
export function createMockTaskCompletionPoints(
  taskId: string,
  points: number,
  overrides: Partial<PointsLedgerEntry> = {}
): PointsLedgerEntry {
  return createMockPointsLedgerEntry({
    taskId,
    points,
    reason: 'TASK_COMPLETED' as PointsReason,
    description: 'Task completion bonus',
    ...overrides,
  });
}
