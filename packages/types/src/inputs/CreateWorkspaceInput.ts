import type { WorkspaceType } from '../enums/WorkspaceType';

export interface CreateWorkspaceInput {
  name: string;
  type: WorkspaceType;
}
