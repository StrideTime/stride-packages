import type { Workspace } from '../entities/Workspace';

export type CreateWorkspaceInput = Omit<Workspace, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>;
