/**
 * Internal Drizzle-inferred types
 * These types are NEVER exported outside of stride-db
 * Repositories use these internally and map to/from domain types
 */

import {
  usersTable,
  rolesTable,
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
  breaksTable,
  workSessionsTable,
  workspaceUserPreferencesTable,
  workspaceStatusesTable,
} from './schema';

// User types
export type UserRow = typeof usersTable.$inferSelect;
export type NewUserRow = typeof usersTable.$inferInsert;

// Role types
export type RoleRow = typeof rolesTable.$inferSelect;
export type NewRoleRow = typeof rolesTable.$inferInsert;

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

// Break types
export type BreakRow = typeof breaksTable.$inferSelect;
export type NewBreakRow = typeof breaksTable.$inferInsert;

// WorkSession types
export type WorkSessionRow = typeof workSessionsTable.$inferSelect;
export type NewWorkSessionRow = typeof workSessionsTable.$inferInsert;

// WorkspaceUserPreferences types
export type WorkspaceUserPreferencesRow = typeof workspaceUserPreferencesTable.$inferSelect;
export type NewWorkspaceUserPreferencesRow = typeof workspaceUserPreferencesTable.$inferInsert;

// WorkspaceStatus types
export type WorkspaceStatusRow = typeof workspaceStatusesTable.$inferSelect;
export type NewWorkspaceStatusRow = typeof workspaceStatusesTable.$inferInsert;
