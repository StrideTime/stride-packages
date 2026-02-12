/**
 * Mock workspace user preferences generator for testing
 */

import type { WorkspaceUserPreferences } from '@stridetime/types';

/**
 * Create a mock workspace user preferences with optional overrides
 */
export function createMockWorkspaceUserPreferences(
  overrides: Partial<WorkspaceUserPreferences> = {}
): WorkspaceUserPreferences {
  return {
    id: 'prefs-123',
    userId: 'user-123',
    workspaceId: 'workspace-123',
    defaultView: 'TODAY',
    groupTasksBy: 'PROJECT',
    sortTasksBy: 'PRIORITY',
    showCompletedTasks: false,
    showQuickAddButton: true,
    keyboardShortcutsEnabled: true,
    autoStartTimerOnTask: false,
    trackTime: true,
    trackBreaks: true,
    trackCompletionTimes: true,
    trackFocus: true,
    trackProjectSwitching: true,
    statsVisibility: 'ONLY_ME',
    showOnLeaderboard: false,
    shareAchievements: false,
    dataRetention: 'FOREVER',
    taskReminders: true,
    goalProgressNotifications: true,
    breakReminders: true,
    dailySummary: true,
    weeklySchedule: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

/**
 * Create multiple mock workspace user preferences with sequential IDs
 */
export function createMockWorkspaceUserPreferencesSet(
  count: number,
  overrides: Partial<WorkspaceUserPreferences> = {}
): WorkspaceUserPreferences[] {
  return Array.from({ length: count }, (_, i) =>
    createMockWorkspaceUserPreferences({
      id: `prefs-${i + 1}`,
      userId: `user-${i + 1}`,
      ...overrides,
    })
  );
}

/**
 * Create mock workspace user preferences with all tracking disabled
 */
export function createMockMinimalWorkspaceUserPreferences(
  overrides: Partial<WorkspaceUserPreferences> = {}
): WorkspaceUserPreferences {
  return createMockWorkspaceUserPreferences({
    trackTime: false,
    trackBreaks: false,
    trackCompletionTimes: false,
    trackFocus: false,
    trackProjectSwitching: false,
    showOnLeaderboard: false,
    shareAchievements: false,
    taskReminders: false,
    goalProgressNotifications: false,
    breakReminders: false,
    dailySummary: false,
    ...overrides,
  });
}
