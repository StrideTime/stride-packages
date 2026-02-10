/**
 * Mock task type generator for testing
 */

import type { TaskType } from '@stridetime/types';

/**
 * Create a mock task type with optional overrides
 */
export function createMockTaskType(overrides: Partial<TaskType> = {}): TaskType {
  return {
    id: 'task-type-123',
    workspaceId: null,
    userId: 'user-123',
    name: 'Development',
    icon: null,
    color: '#10b981',
    isDefault: false,
    displayOrder: 0,
    ...overrides,
  };
}

/**
 * Create multiple mock task types with sequential IDs
 */
export function createMockTaskTypes(count: number, overrides: Partial<TaskType> = {}): TaskType[] {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const names = ['Development', 'Design', 'Planning', 'Meeting', 'Documentation'];

  return Array.from({ length: count }, (_, i) =>
    createMockTaskType({
      id: `task-type-${i + 1}`,
      name: names[i % names.length],
      color: colors[i % colors.length],
      ...overrides,
    })
  );
}
