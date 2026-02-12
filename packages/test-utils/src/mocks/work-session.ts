/**
 * Mock work session generator for testing
 */

import type { WorkSession, WorkSessionStatus } from '@stridetime/types';

/**
 * Create a mock work session with optional overrides
 */
export function createMockWorkSession(overrides: Partial<WorkSession> = {}): WorkSession {
  const now = new Date();
  return {
    id: 'session-123',
    userId: 'user-123',
    workspaceId: 'workspace-123',
    status: 'ACTIVE' as WorkSessionStatus,
    clockedInAt: now.toISOString(),
    clockedOutAt: null,
    totalFocusMinutes: 0,
    totalBreakMinutes: 0,
    date: now.toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

/**
 * Create multiple mock work sessions with sequential IDs
 */
export function createMockWorkSessions(
  count: number,
  overrides: Partial<WorkSession> = {}
): WorkSession[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return createMockWorkSession({
      id: `session-${i + 1}`,
      date: date.toISOString().split('T')[0],
      ...overrides,
    });
  });
}

/**
 * Create a mock completed work session
 */
export function createMockCompletedWorkSession(overrides: Partial<WorkSession> = {}): WorkSession {
  const clockedInAt = new Date();
  clockedInAt.setHours(clockedInAt.getHours() - 8); // 8 hours ago
  const clockedOutAt = new Date();

  return createMockWorkSession({
    status: 'COMPLETED' as WorkSessionStatus,
    clockedInAt: clockedInAt.toISOString(),
    clockedOutAt: clockedOutAt.toISOString(),
    totalFocusMinutes: 420, // 7 hours
    totalBreakMinutes: 60, // 1 hour
    ...overrides,
  });
}

/**
 * Create a mock active work session
 */
export function createMockActiveWorkSession(overrides: Partial<WorkSession> = {}): WorkSession {
  return createMockWorkSession({
    status: 'ACTIVE' as WorkSessionStatus,
    clockedOutAt: null,
    ...overrides,
  });
}
