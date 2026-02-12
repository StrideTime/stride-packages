import type { WorkspaceUserPreferences } from '../entities/WorkspaceUserPreferences';

export type CreateWorkspaceUserPreferencesInput = Omit<
  WorkspaceUserPreferences,
  'id' | 'createdAt' | 'updatedAt' | 'deleted'
>;
