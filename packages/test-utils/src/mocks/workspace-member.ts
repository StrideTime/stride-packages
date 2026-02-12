/**
 * Mock workspace member generator for testing
 */

import type { WorkspaceMember, WorkspaceMemberRole } from '@stridetime/types';

/**
 * Create a mock workspace member with optional overrides
 */
export function createMockWorkspaceMember(
  overrides: Partial<WorkspaceMember> = {}
): WorkspaceMember {
  return {
    id: 'workspace-member-123',
    workspaceId: 'workspace-123',
    userId: 'user-123',
    role: 'MEMBER' as WorkspaceMemberRole,
    invitedBy: null,
    joinedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

/**
 * Create multiple mock workspace members with sequential IDs
 */
export function createMockWorkspaceMembers(
  count: number,
  overrides: Partial<WorkspaceMember> = {}
): WorkspaceMember[] {
  return Array.from({ length: count }, (_, i) =>
    createMockWorkspaceMember({
      id: `workspace-member-${i + 1}`,
      userId: `user-${i + 1}`,
      ...overrides,
    })
  );
}
