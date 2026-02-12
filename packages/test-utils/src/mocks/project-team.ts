/**
 * Mock ProjectTeam generator for testing
 */

import type { ProjectTeam } from '@stridetime/types';

/**
 * Create a mock ProjectTeam with optional overrides
 */
export function createMockProjectTeam(overrides: Partial<ProjectTeam> = {}): ProjectTeam {
  return {
    id: 'project-team-123',
    projectId: 'project-123',
    teamId: 'team-123',
    addedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

/**
 * Create multiple mock ProjectTeam associations
 */
export function createMockProjectTeams(
  count: number,
  overrides: Partial<ProjectTeam> = {}
): ProjectTeam[] {
  return Array.from({ length: count }, (_, i) =>
    createMockProjectTeam({
      id: `project-team-${i + 1}`,
      ...overrides,
    })
  );
}
