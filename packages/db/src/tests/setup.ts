/**
 * Test setup utilities
 * Creates in-memory SQLite database for testing
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../drizzle/schema';

/**
 * Test database type that's compatible with both PowerSync and BetterSQLite3
 * This allows us to test with BetterSQLite3 while using the same interface.
 * We use 'any' here to bypass type checking since BetterSQLite3Database and
 * PowerSyncSQLiteDatabase have the same runtime interface but different TypeScript types.
 */
export type TestDatabase = any;

/**
 * Create an in-memory test database.
 * This creates a fresh SQLite database for each test.
 */
export function createTestDb(): TestDatabase {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite, { schema });

  // Run migrations (create tables)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      first_name TEXT,
      last_name TEXT,
      avatar_url TEXT,
      timezone TEXT NOT NULL DEFAULT 'UTC',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      owner_user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      type TEXT NOT NULL,
      color TEXT,
      timezone TEXT NOT NULL DEFAULT 'America/New_York',
      week_starts_on INTEGER NOT NULL DEFAULT 1,
      default_project_id TEXT,
      default_team_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT,
      icon TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      completion_percentage INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS task_types (
      id TEXT PRIMARY KEY,
      workspace_id TEXT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      is_default INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      parent_task_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      difficulty TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'NONE',
      progress INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'BACKLOG',
      assignee_user_id TEXT,
      team_id TEXT,
      estimated_minutes INTEGER,
      max_minutes INTEGER,
      actual_minutes INTEGER NOT NULL DEFAULT 0,
      planned_for_date TEXT,
      due_date TEXT,
      task_type_id TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      tags TEXT,
      external_id TEXT,
      external_source TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS daily_summaries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      tasks_completed INTEGER NOT NULL DEFAULT 0,
      tasks_worked_on INTEGER NOT NULL DEFAULT 0,
      total_points INTEGER NOT NULL DEFAULT 0,
      focus_minutes INTEGER NOT NULL DEFAULT 0,
      break_minutes INTEGER NOT NULL DEFAULT 0,
      work_session_count INTEGER NOT NULL DEFAULT 0,
      clock_in_time TEXT,
      clock_out_time TEXT,
      efficiency_rating REAL NOT NULL DEFAULT 0.0,
      standout_moment TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      theme TEXT NOT NULL DEFAULT 'SYSTEM',
      planning_mode TEXT NOT NULL DEFAULT 'WEEKLY',
      check_in_frequency INTEGER NOT NULL DEFAULT 30,
      check_in_enabled INTEGER NOT NULL DEFAULT 1,
      end_of_day_summary_time TEXT NOT NULL DEFAULT '17:00',
      end_of_day_summary_enabled INTEGER NOT NULL DEFAULT 1,
      auto_pause_minutes INTEGER NOT NULL DEFAULT 10,
      auto_pause_enabled INTEGER NOT NULL DEFAULT 1,
      break_reminder_enabled INTEGER NOT NULL DEFAULT 1,
      break_reminder_minutes INTEGER NOT NULL DEFAULT 90,
      working_hours_start TEXT NOT NULL DEFAULT '09:00',
      working_hours_end TEXT NOT NULL DEFAULT '17:00',
      working_days TEXT NOT NULL DEFAULT '[1,2,3,4,5]',
      accent_color TEXT,
      font_size TEXT NOT NULL DEFAULT 'MEDIUM',
      density TEXT NOT NULL DEFAULT 'COMFORTABLE',
      keyboard_shortcuts TEXT,
      enable_sound_effects INTEGER NOT NULL DEFAULT 1,
      enable_haptic_feedback INTEGER NOT NULL DEFAULT 0,
      auto_start_timer INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scheduled_events (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      user_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      label TEXT NOT NULL,
      type TEXT NOT NULL,
      external_id TEXT,
      external_source TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS workspace_user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      workspace_id TEXT NOT NULL,
      default_view TEXT NOT NULL DEFAULT 'TODAY',
      group_tasks_by TEXT NOT NULL DEFAULT 'PROJECT',
      sort_tasks_by TEXT NOT NULL DEFAULT 'PRIORITY',
      show_completed_tasks INTEGER NOT NULL DEFAULT 0,
      show_quick_add_button INTEGER NOT NULL DEFAULT 1,
      keyboard_shortcuts_enabled INTEGER NOT NULL DEFAULT 1,
      auto_start_timer_on_task INTEGER NOT NULL DEFAULT 0,
      track_time INTEGER NOT NULL DEFAULT 1,
      track_breaks INTEGER NOT NULL DEFAULT 1,
      track_completion_times INTEGER NOT NULL DEFAULT 1,
      track_focus INTEGER NOT NULL DEFAULT 1,
      track_project_switching INTEGER NOT NULL DEFAULT 0,
      stats_visibility TEXT NOT NULL DEFAULT 'ONLY_ME',
      show_on_leaderboard INTEGER NOT NULL DEFAULT 0,
      share_achievements INTEGER NOT NULL DEFAULT 0,
      data_retention TEXT NOT NULL DEFAULT 'FOREVER',
      task_reminders INTEGER NOT NULL DEFAULT 1,
      goal_progress_notifications INTEGER NOT NULL DEFAULT 1,
      break_reminders INTEGER NOT NULL DEFAULT 1,
      daily_summary INTEGER NOT NULL DEFAULT 1,
      weekly_schedule TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      UNIQUE(user_id, workspace_id)
    );

    CREATE TABLE IF NOT EXISTS points_ledger (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_id TEXT,
      time_entry_id TEXT,
      points INTEGER NOT NULL,
      reason TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT,
      icon TEXT,
      is_default INTEGER NOT NULL DEFAULT 0,
      lead_user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      added_by TEXT,
      added_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      UNIQUE(team_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS project_teams (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      team_id TEXT NOT NULL,
      added_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      UNIQUE(project_id, team_id)
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      workspace_id TEXT NOT NULL,
      type TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      period TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS breaks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      duration_minutes INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS work_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      workspace_id TEXT NOT NULL,
      status TEXT NOT NULL,
      clocked_in_at TEXT NOT NULL,
      clocked_out_at TEXT,
      total_focus_minutes INTEGER NOT NULL DEFAULT 0,
      total_break_minutes INTEGER NOT NULL DEFAULT 0,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS workspace_statuses (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT NOT NULL DEFAULT 'Circle',
      color TEXT NOT NULL DEFAULT '#22c55e',
      is_enabled INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS workspace_members (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      invited_by TEXT,
      joined_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      UNIQUE(workspace_id, user_id)
    );
  `);

  return db;
}

/**
 * Close and clean up test database.
 */
export function closeTestDb(_db: any): void {
  // Better-sqlite3 doesn't expose close on the drizzle wrapper
  // Just let it be garbage collected
}
