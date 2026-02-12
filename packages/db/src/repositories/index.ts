/**
 * Repository exports
 * All repositories follow the same pattern:
 * - Accept DB instance as first parameter (enables transactions)
 * - Map between domain types (@stridetime/types) and DB rows
 * - Provide type-safe CRUD operations
 */

export { TaskRepository, taskRepo } from './task.repo';
export { ProjectRepository, projectRepo } from './project.repo';
export { WorkspaceRepository, workspaceRepo } from './workspace.repo';
export { TimeEntryRepository, timeEntryRepo } from './time-entry.repo';
export { UserRepository, userRepo } from './user.repo';
export { TaskTypeRepository, taskTypeRepo } from './task-type.repo';
export { DailySummaryRepository, dailySummaryRepo } from './daily-summary.repo';
export { WorkspaceMemberRepository, workspaceMemberRepo } from './workspace-member.repo';
export { TeamRepository, teamRepo } from './team.repo';
export { TeamMemberRepository, teamMemberRepo } from './team-member.repo';
export { ScheduledEventRepository, scheduledEventRepo } from './scheduled-event.repo';
export { PointsLedgerRepository, pointsLedgerRepo } from './points-ledger.repo';
export { UserPreferencesRepository, userPreferencesRepo } from './user-preferences.repo';
export { GoalRepository, goalRepo } from './goal.repo';
export { BreakRepository, breakRepo } from './break.repo';
export { WorkSessionRepository, workSessionRepo } from './work-session.repo';
export {
  WorkspaceUserPreferencesRepository,
  workspaceUserPreferencesRepo,
} from './workspace-user-preferences.repo';
export { WorkspaceStatusRepository, workspaceStatusRepo } from './workspace-status.repo';
export { ProjectTeamRepository, projectTeamRepo } from './project-team.repo';
