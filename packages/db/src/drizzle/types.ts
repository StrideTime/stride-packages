/**
 * Internal Drizzle-inferred types
 * These types are NEVER exported outside of stride-db
 * Repositories use these internally and map to/from domain types
 */

import {
  usersTable,
  plansTable,
  userSubscriptionsTable,
  subscriptionHistoryTable,
  workspacesTable,
  workspaceMembersTable,
  projectsTable,
  taskTypesTable,
  tasksTable,
  timeEntriesTable,
  scheduledEventsTable,
  pointsLedgerTable,
  dailySummariesTable,
  userPreferencesTable,
  teamsTable,
  teamMembersTable,
  projectTeamsTable,
  goalsTable,
  habitsTable,
  habitCompletionsTable,
  breaksTable,
  workSessionsTable,
  focusSettingsTable,
  focusSessionsTable,
  workspaceUserPreferencesTable,
  workspaceStatusesTable,
  workspaceUserStatusTable,
} from './schema';

// User types
export type UserRow = typeof usersTable.$inferSelect;
export type NewUserRow = typeof usersTable.$inferInsert;

// Plan types (subscription plans — SQL table `plans`)
export type PlanRow = typeof plansTable.$inferSelect;
export type NewPlanRow = typeof plansTable.$inferInsert;

// UserSubscription types
export type UserSubscriptionRow = typeof userSubscriptionsTable.$inferSelect;
export type NewUserSubscriptionRow = typeof userSubscriptionsTable.$inferInsert;

// SubscriptionHistory types
export type SubscriptionHistoryRow = typeof subscriptionHistoryTable.$inferSelect;
export type NewSubscriptionHistoryRow = typeof subscriptionHistoryTable.$inferInsert;

// Workspace types
export type WorkspaceRow = typeof workspacesTable.$inferSelect;
export type NewWorkspaceRow = typeof workspacesTable.$inferInsert;

// WorkspaceMember types
export type WorkspaceMemberRow = typeof workspaceMembersTable.$inferSelect;
export type NewWorkspaceMemberRow = typeof workspaceMembersTable.$inferInsert;

// Project types
export type ProjectRow = typeof projectsTable.$inferSelect;
export type NewProjectRow = typeof projectsTable.$inferInsert;

// TaskType types
export type TaskTypeRow = typeof taskTypesTable.$inferSelect;
export type NewTaskTypeRow = typeof taskTypesTable.$inferInsert;

// Task types
export type TaskRow = typeof tasksTable.$inferSelect;
export type NewTaskRow = typeof tasksTable.$inferInsert;

// TimeEntry types
export type TimeEntryRow = typeof timeEntriesTable.$inferSelect;
export type NewTimeEntryRow = typeof timeEntriesTable.$inferInsert;

// ScheduledEvent types
export type ScheduledEventRow = typeof scheduledEventsTable.$inferSelect;
export type NewScheduledEventRow = typeof scheduledEventsTable.$inferInsert;

// PointsLedger types
export type PointsLedgerRow = typeof pointsLedgerTable.$inferSelect;
export type NewPointsLedgerRow = typeof pointsLedgerTable.$inferInsert;

// DailySummary types
export type DailySummaryRow = typeof dailySummariesTable.$inferSelect;
export type NewDailySummaryRow = typeof dailySummariesTable.$inferInsert;

// UserPreferences types
export type UserPreferencesRow = typeof userPreferencesTable.$inferSelect;
export type NewUserPreferencesRow = typeof userPreferencesTable.$inferInsert;
// Team types
export type TeamRow = typeof teamsTable.$inferSelect;
export type NewTeamRow = typeof teamsTable.$inferInsert;

// TeamMember types
export type TeamMemberRow = typeof teamMembersTable.$inferSelect;
export type NewTeamMemberRow = typeof teamMembersTable.$inferInsert;

// ProjectTeam types
export type ProjectTeamRow = typeof projectTeamsTable.$inferSelect;
export type NewProjectTeamRow = typeof projectTeamsTable.$inferInsert;

// Goal types
export type GoalRow = typeof goalsTable.$inferSelect;
export type NewGoalRow = typeof goalsTable.$inferInsert;

// Habit types
export type HabitRow = typeof habitsTable.$inferSelect;
export type NewHabitRow = typeof habitsTable.$inferInsert;

// HabitCompletion types
export type HabitCompletionRow = typeof habitCompletionsTable.$inferSelect;
export type NewHabitCompletionRow = typeof habitCompletionsTable.$inferInsert;

// Break types
export type BreakRow = typeof breaksTable.$inferSelect;
export type NewBreakRow = typeof breaksTable.$inferInsert;

// WorkSession types
export type WorkSessionRow = typeof workSessionsTable.$inferSelect;
export type NewWorkSessionRow = typeof workSessionsTable.$inferInsert;

// FocusSettings types
export type FocusSettingsRow = typeof focusSettingsTable.$inferSelect;
export type NewFocusSettingsRow = typeof focusSettingsTable.$inferInsert;

// FocusSession types
export type FocusSessionRow = typeof focusSessionsTable.$inferSelect;
export type NewFocusSessionRow = typeof focusSessionsTable.$inferInsert;

// WorkspaceUserPreferences types
export type WorkspaceUserPreferencesRow = typeof workspaceUserPreferencesTable.$inferSelect;
export type NewWorkspaceUserPreferencesRow = typeof workspaceUserPreferencesTable.$inferInsert;

// WorkspaceStatus types
export type WorkspaceStatusRow = typeof workspaceStatusesTable.$inferSelect;
export type NewWorkspaceStatusRow = typeof workspaceStatusesTable.$inferInsert;

// WorkspaceUserStatus types
export type WorkspaceUserStatusRow = typeof workspaceUserStatusTable.$inferSelect;
export type NewWorkspaceUserStatusRow = typeof workspaceUserStatusTable.$inferInsert;
