/**
 * Mock team member generator for testing
 */

import type { TeamMember, TeamMemberRole } from '@stridetime/types';

/**
 * Create a mock team member with optional overrides
 */
export function createMockTeamMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: 'team-member-123',
    teamId: 'team-123',
    userId: 'user-123',
    role: 'MEMBER' as TeamMemberRole,
    addedBy: null,
    addedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

/**
 * Create multiple mock team members with sequential IDs
 */
export function createMockTeamMembers(
  count: number,
  overrides: Partial<TeamMember> = {}
): TeamMember[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTeamMember({
      id: `team-member-${i + 1}`,
      userId: `user-${i + 1}`,
      ...overrides,
    })
  );
}

/**
 * Create a mock team lead
 */
export function createMockTeamLead(overrides: Partial<TeamMember> = {}): TeamMember {
  return createMockTeamMember({
    role: 'LEAD' as TeamMemberRole,
    ...overrides,
  });
}
