/**
 * Mock workspace generator for testing
 */

import type { Workspace, WorkspaceType } from '@stridetime/types';

/**
 * Create a mock workspace with optional overrides
 */
export function createMockWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  return {
    id: 'workspace-123',
    name: 'Test Workspace',
    type: 'PERSONAL' as WorkspaceType,
    ownerUserId: 'user-123',
    ...overrides,
  };
}

/**
 * Create multiple mock workspaces with sequential IDs
 */
export function createMockWorkspaces(count: number, overrides: Partial<Workspace> = {}): Workspace[] {
  return Array.from({ length: count }, (_, i) =>
    createMockWorkspace({
      id: `workspace-${i + 1}`,
      name: `Test Workspace ${i + 1}`,
      ...overrides,
    })
  );
}
