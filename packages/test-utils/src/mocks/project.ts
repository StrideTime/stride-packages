/**
 * Mock project generator for testing
 */

import type { Project, ProjectStatus } from '@stridetime/types';

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
    icon: null,
    status: 'ACTIVE' as ProjectStatus,
    completionPercentage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
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
