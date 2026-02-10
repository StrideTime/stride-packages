/**
 * Repository mock helpers for testing
 */

import { vi } from 'vitest';

/**
 * Create a mock TaskRepository
 */
export function createMockTaskRepo() {
  return {
    findById: vi.fn(),
    findByUser: vi.fn(),
    findByProject: vi.fn(),
    findByStatus: vi.fn(),
    findPlannedForDate: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateProgress: vi.fn(),
    updateStatus: vi.fn(),
    complete: vi.fn(),
    getChildTasks: vi.fn(),
  };
}

/**
 * Create a mock ProjectRepository
 */
export function createMockProjectRepo() {
  return {
    findById: vi.fn(),
    findByWorkspace: vi.fn(),
    findByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

/**
 * Create a mock WorkspaceRepository
 */
export function createMockWorkspaceRepo() {
  return {
    findById: vi.fn(),
    findByOwner: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

/**
 * Create a mock TimeEntryRepository
 */
export function createMockTimeEntryRepo() {
  return {
    findById: vi.fn(),
    findByTask: vi.fn(),
    findByUser: vi.fn(),
    findByDateRange: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    endEntry: vi.fn(),
    getActiveEntry: vi.fn(),
  };
}

/**
 * Create a mock DailySummaryRepository
 */
export function createMockDailySummaryRepo() {
  return {
    findById: vi.fn(),
    findByUserAndDate: vi.fn(),
    findByUser: vi.fn(),
    findByDateRange: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    calculateAveragePoints: vi.fn(),
  };
}

/**
 * Create a mock UserRepository
 */
export function createMockUserRepo() {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

/**
 * Create a mock TaskTypeRepository
 */
export function createMockTaskTypeRepo() {
  return {
    findById: vi.fn(),
    findByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}
