/**
 * Mock project generator for testing
 */

import type { Project } from '@stridetime/types';

/**
 * Create a mock project with optional overrides
 */
export function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-123',
    workspaceId: 'workspace-123',
    userId: 'user-123',
    name: 'Test Project',
    description: null,
    color: '#3b82f6',
    completionPercentage: 0,
    ...overrides,
  };
}

/**
 * Create multiple mock projects with sequential IDs
 */
export function createMockProjects(count: number, overrides: Partial<Project> = {}): Project[] {
  return Array.from({ length: count }, (_, i) =>
    createMockProject({
      id: `project-${i + 1}`,
      name: `Test Project ${i + 1}`,
      ...overrides,
    })
  );
}
