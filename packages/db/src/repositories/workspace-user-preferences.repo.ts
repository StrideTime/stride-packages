/**
 * WorkspaceUserPreferences Repository
 *
 * Provides CRUD operations for workspace user preferences with proper domain/DB type mapping.
 * All methods accept a DB instance to support transactions.
 */

import { eq, and } from 'drizzle-orm';
import type {
  WorkspaceUserPreferences,
  CreateWorkspaceUserPreferencesInput,
} from '@stridetime/types';
import { workspaceUserPreferencesTable } from '../drizzle/schema';
import type { WorkspaceUserPreferencesRow, NewWorkspaceUserPreferencesRow } from '../drizzle/types';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: WorkspaceUserPreferencesRow): WorkspaceUserPreferences {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    userId: row.userId,
    defaultView: row.defaultView,
    groupTasksBy: row.groupTasksBy,
    sortTasksBy: row.sortTasksBy,
    showCompletedTasks: row.showCompletedTasks,
    showQuickAddButton: row.showQuickAddButton,
    keyboardShortcutsEnabled: row.keyboardShortcutsEnabled,
    autoStartTimerOnTask: row.autoStartTimerOnTask,
    trackTime: row.trackTime,
    trackBreaks: row.trackBreaks,
    trackCompletionTimes: row.trackCompletionTimes,
    trackFocus: row.trackFocus,
    trackProjectSwitching: row.trackProjectSwitching,
    statsVisibility: row.statsVisibility,
    showOnLeaderboard: row.showOnLeaderboard,
    shareAchievements: row.shareAchievements,
    dataRetention: row.dataRetention,
    taskReminders: row.taskReminders,
    goalProgressNotifications: row.goalProgressNotifications,
    breakReminders: row.breakReminders,
    dailySummary: row.dailySummary,
    weeklySchedule: row.weeklySchedule,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: row.deleted,
  };
}

function toDbInsert(
  prefs: CreateWorkspaceUserPreferencesInput
): Omit<NewWorkspaceUserPreferencesRow, 'id'> {
  const timestamp = now();
  return {
    workspaceId: prefs.workspaceId,
    userId: prefs.userId,
    defaultView: prefs.defaultView,
    groupTasksBy: prefs.groupTasksBy,
    sortTasksBy: prefs.sortTasksBy,
    showCompletedTasks: prefs.showCompletedTasks,
    showQuickAddButton: prefs.showQuickAddButton,
    keyboardShortcutsEnabled: prefs.keyboardShortcutsEnabled,
    autoStartTimerOnTask: prefs.autoStartTimerOnTask,
    trackTime: prefs.trackTime,
    trackBreaks: prefs.trackBreaks,
    trackCompletionTimes: prefs.trackCompletionTimes,
    trackFocus: prefs.trackFocus,
    trackProjectSwitching: prefs.trackProjectSwitching,
    statsVisibility: prefs.statsVisibility,
    showOnLeaderboard: prefs.showOnLeaderboard,
    shareAchievements: prefs.shareAchievements,
    dataRetention: prefs.dataRetention,
    taskReminders: prefs.taskReminders,
    goalProgressNotifications: prefs.goalProgressNotifications,
    breakReminders: prefs.breakReminders,
    dailySummary: prefs.dailySummary,
    weeklySchedule: prefs.weeklySchedule,
    createdAt: timestamp,
    updatedAt: timestamp,
    deleted: false,
  };
}

function toDbUpdate(
  prefs: Partial<WorkspaceUserPreferences>
): Partial<WorkspaceUserPreferencesRow> {
  return {
    ...prefs,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class WorkspaceUserPreferencesRepository {
  async findById(db: StrideDatabase, id: string): Promise<WorkspaceUserPreferences | null> {
    const row = await db.query.workspaceUserPreferencesTable.findFirst({
      where: eq(workspaceUserPreferencesTable.id, id),
    });
    return row ? toDomain(row) : null;
  }

  async findByUserAndWorkspace(
    db: StrideDatabase,
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceUserPreferences | null> {
    const row = await db.query.workspaceUserPreferencesTable.findFirst({
      where: and(
        eq(workspaceUserPreferencesTable.userId, userId),
        eq(workspaceUserPreferencesTable.workspaceId, workspaceId)
      ),
    });
    return row ? toDomain(row) : null;
  }

  async findByUser(db: StrideDatabase, userId: string): Promise<WorkspaceUserPreferences[]> {
    const rows = await db.query.workspaceUserPreferencesTable.findMany({
      where: eq(workspaceUserPreferencesTable.userId, userId),
    });
    return rows.map(toDomain);
  }

  async create(
    db: StrideDatabase,
    prefs: CreateWorkspaceUserPreferencesInput
  ): Promise<WorkspaceUserPreferences> {
    const id = generateId();
    const dbPrefs = toDbInsert(prefs);

    await db.insert(workspaceUserPreferencesTable).values({
      id,
      ...dbPrefs,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create workspace user preferences');
    }
    return created;
  }

  async update(
    db: StrideDatabase,
    id: string,
    updates: Partial<WorkspaceUserPreferences>
  ): Promise<WorkspaceUserPreferences> {
    const dbUpdates = toDbUpdate(updates);

    await db
      .update(workspaceUserPreferencesTable)
      .set(dbUpdates)
      .where(eq(workspaceUserPreferencesTable.id, id));

    const updated = await this.findById(db, id);
    if (!updated) {
      throw new Error('Workspace user preferences not found');
    }
    return updated;
  }

  async delete(db: StrideDatabase, id: string): Promise<void> {
    await db.delete(workspaceUserPreferencesTable).where(eq(workspaceUserPreferencesTable.id, id));
  }
}

export const workspaceUserPreferencesRepo = new WorkspaceUserPreferencesRepository();
