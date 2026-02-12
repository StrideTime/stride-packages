/**
 * Mock workspace status generator for testing
 */

import type { WorkspaceStatus } from '@stridetime/types';

/**
 * Create a mock workspace status with optional overrides
 */
export function createMockWorkspaceStatus(
  overrides: Partial<WorkspaceStatus> = {}
): WorkspaceStatus {
  return {
    id: 'status-123',
    workspaceId: 'workspace-123',
    name: 'Online',
    description: null,
    icon: '🟢',
    color: '#10b981',
    isEnabled: true,
    displayOrder: 0,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

/**
 * Create multiple mock workspace statuses with sequential IDs
 */
export function createMockWorkspaceStatuses(
  count: number,
  overrides: Partial<WorkspaceStatus> = {}
): WorkspaceStatus[] {
  const defaultStatuses = [
    { name: 'Online', icon: '🟢', color: '#10b981' },
    { name: 'Away', icon: '🟡', color: '#f59e0b' },
    { name: 'Busy', icon: '🔴', color: '#ef4444' },
    { name: 'Offline', icon: '⚫', color: '#6b7280' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const status = defaultStatuses[i % defaultStatuses.length];
    return createMockWorkspaceStatus({
      id: `status-${i + 1}`,
      name: status.name,
      icon: status.icon,
      color: status.color,
      displayOrder: i,
      isDefault: i < 4,
      ...overrides,
    });
  });
}

/**
 * Create a mock custom workspace status
 */
export function createMockCustomWorkspaceStatus(
  overrides: Partial<WorkspaceStatus> = {}
): WorkspaceStatus {
  return createMockWorkspaceStatus({
    name: 'In a Meeting',
    icon: '📞',
    color: '#8b5cf6',
    isDefault: false,
    ...overrides,
  });
}
