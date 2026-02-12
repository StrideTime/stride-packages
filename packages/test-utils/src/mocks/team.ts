/**
 * Mock team generator for testing
 */

import type { Team } from '@stridetime/types';

/**
 * Create a mock team with optional overrides
 */
export function createMockTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 'team-123',
    workspaceId: 'workspace-123',
    name: 'Test Team',
    description: null,
    color: '#3b82f6',
    icon: null,
    isDefault: false,
    leadUserId: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

/**
 * Create multiple mock teams with sequential IDs
 */
export function createMockTeams(count: number, overrides: Partial<Team> = {}): Team[] {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  return Array.from({ length: count }, (_, i) =>
    createMockTeam({
      id: `team-${i + 1}`,
      name: `Test Team ${i + 1}`,
      color: colors[i % colors.length],
      ...overrides,
    })
  );
}
