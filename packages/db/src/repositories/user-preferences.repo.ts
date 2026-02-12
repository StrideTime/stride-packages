/**
 * UserPreferences Repository
 *
 * Provides CRUD operations for user preferences with proper domain/DB type mapping.
 * All methods accept a DB instance to support transactions.
 */

import { eq } from 'drizzle-orm';
import type { UserPreferences } from '@stridetime/types';
import { userPreferencesTable } from '../drizzle/schema';
import type { UserPreferencesRow, NewUserPreferencesRow } from '../drizzle/types';
import type { StrideDatabase } from '../db/client';
import { now } from '../db/utils';

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: UserPreferencesRow): UserPreferences {
  return {
    userId: row.userId,
    theme: row.theme,
    planningMode: row.planningMode,
    checkInFrequency: row.checkInFrequency,
    checkInEnabled: row.checkInEnabled,
    endOfDaySummaryTime: row.endOfDaySummaryTime,
    endOfDaySummaryEnabled: row.endOfDaySummaryEnabled,
    autoPauseMinutes: row.autoPauseMinutes,
    autoPauseEnabled: row.autoPauseEnabled,
    breakReminderEnabled: row.breakReminderEnabled,
    breakReminderMinutes: row.breakReminderMinutes,
    workingHoursStart: row.workingHoursStart,
    workingHoursEnd: row.workingHoursEnd,
    workingDays: row.workingDays,
    accentColor: row.accentColor,
    fontSize: row.fontSize,
    density: row.density,
    keyboardShortcuts: row.keyboardShortcuts,
    enableSoundEffects: row.enableSoundEffects,
    enableHapticFeedback: row.enableHapticFeedback,
    autoStartTimer: row.autoStartTimer,
  };
}

function toDbInsert(prefs: UserPreferences): NewUserPreferencesRow {
  return {
    userId: prefs.userId,
    theme: prefs.theme,
    planningMode: prefs.planningMode,
    checkInFrequency: prefs.checkInFrequency,
    checkInEnabled: prefs.checkInEnabled,
    endOfDaySummaryTime: prefs.endOfDaySummaryTime,
    endOfDaySummaryEnabled: prefs.endOfDaySummaryEnabled,
    autoPauseMinutes: prefs.autoPauseMinutes,
    autoPauseEnabled: prefs.autoPauseEnabled,
    breakReminderEnabled: prefs.breakReminderEnabled,
    breakReminderMinutes: prefs.breakReminderMinutes,
    workingHoursStart: prefs.workingHoursStart,
    workingHoursEnd: prefs.workingHoursEnd,
    workingDays: prefs.workingDays,
    accentColor: prefs.accentColor,
    fontSize: prefs.fontSize,
    density: prefs.density,
    keyboardShortcuts: prefs.keyboardShortcuts,
    enableSoundEffects: prefs.enableSoundEffects,
    enableHapticFeedback: prefs.enableHapticFeedback,
    autoStartTimer: prefs.autoStartTimer,
    updatedAt: now(),
  };
}

function toDbUpdate(prefs: Partial<UserPreferences>): Partial<UserPreferencesRow> {
  return {
    ...prefs,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class UserPreferencesRepository {
  async findByUserId(db: StrideDatabase, userId: string): Promise<UserPreferences | null> {
    const row = await db.query.userPreferencesTable.findFirst({
      where: eq(userPreferencesTable.userId, userId),
    });
    return row ? toDomain(row) : null;
  }

  async create(db: StrideDatabase, prefs: UserPreferences): Promise<UserPreferences> {
    const dbPrefs = toDbInsert(prefs);

    await db.insert(userPreferencesTable).values(dbPrefs);

    const created = await this.findByUserId(db, prefs.userId);
    if (!created) {
      throw new Error('Failed to create user preferences');
    }
    return created;
  }

  async update(
    db: StrideDatabase,
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const dbUpdates = toDbUpdate(updates);

    await db
      .update(userPreferencesTable)
      .set(dbUpdates)
      .where(eq(userPreferencesTable.userId, userId));

    const updated = await this.findByUserId(db, userId);
    if (!updated) {
      throw new Error('User preferences not found');
    }
    return updated;
  }

  async delete(db: StrideDatabase, userId: string): Promise<void> {
    await db.delete(userPreferencesTable).where(eq(userPreferencesTable.userId, userId));
  }
}

export const userPreferencesRepo = new UserPreferencesRepository();
