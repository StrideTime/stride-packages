/**
 * Mock task generator for testing
 */

import type { Task, TaskDifficulty, TaskStatus } from '@stridetime/types';

/**
 * Create a mock task with optional overrides
 */
export function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-123',
    userId: 'user-123',
    projectId: 'project-123',
    parentTaskId: null,
    title: 'Test Task',
    description: null,
    difficulty: 'MEDIUM' as TaskDifficulty,
    progress: 0,
    status: 'BACKLOG' as TaskStatus,
    estimatedMinutes: 60,
    maxMinutes: null,
    actualMinutes: 0,
    plannedForDate: null,
    dueDate: null,
    taskTypeId: null,
    completedAt: null,
    ...overrides,
  };
}

/**
 * Create multiple mock tasks with sequential IDs
 */
export function createMockTasks(count: number, overrides: Partial<Task> = {}): Task[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTask({
      id: `task-${i + 1}`,
      title: `Test Task ${i + 1}`,
      ...overrides,
    })
  );
}

/**
 * Create a mock completed task
 */
export function createMockCompletedTask(overrides: Partial<Task> = {}): Task {
  return createMockTask({
    progress: 100,
    status: 'COMPLETED' as TaskStatus,
    actualMinutes: 60, // Default to matching estimated time (no efficiency bonus)
    completedAt: new Date().toISOString(),
    ...overrides,
  });
}
