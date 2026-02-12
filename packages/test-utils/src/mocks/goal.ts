/**
 * Mock goal generator for testing
 */

import type { Goal, GoalType, GoalPeriod } from '@stridetime/types';

/**
 * Create a mock goal with optional overrides
 */
export function createMockGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal-123',
    userId: 'user-123',
    workspaceId: 'workspace-123',
    type: 'TASKS_COMPLETED' as GoalType,
    targetValue: 10,
    period: 'DAILY' as GoalPeriod,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

/**
 * Create multiple mock goals with sequential IDs
 */
export function createMockGoals(count: number, overrides: Partial<Goal> = {}): Goal[] {
  const types: GoalType[] = ['TASKS_COMPLETED', 'POINTS_EARNED', 'FOCUS_MINUTES'];
  return Array.from({ length: count }, (_, i) =>
    createMockGoal({
      id: `goal-${i + 1}`,
      type: types[i % types.length],
      targetValue: (i + 1) * 10,
      ...overrides,
    })
  );
}

/**
 * Create a mock weekly goal
 */
export function createMockWeeklyGoal(overrides: Partial<Goal> = {}): Goal {
  return createMockGoal({
    period: 'WEEKLY' as GoalPeriod,
    targetValue: 50,
    ...overrides,
  });
}

/**
 * Create a mock monthly goal
 */
export function createMockMonthlyGoal(overrides: Partial<Goal> = {}): Goal {
  return createMockGoal({
    period: 'MONTHLY' as GoalPeriod,
    targetValue: 200,
    ...overrides,
  });
}
