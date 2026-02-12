import type { WorkspaceStatus } from '../entities/WorkspaceStatus';

export type CreateWorkspaceStatusInput = Omit<
  WorkspaceStatus,
  'id' | 'createdAt' | 'updatedAt' | 'deleted'
>;
