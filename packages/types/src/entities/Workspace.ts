import type { WorkspaceType } from '../enums/WorkspaceType';

export type Workspace = {
  id: string;
  ownerUserId: string;
  name: string;
  type: WorkspaceType;
};
