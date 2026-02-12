import type { WorkspaceType } from '../enums/WorkspaceType';

export type Workspace = {
  id: string;
  ownerUserId: string;
  name: string;
  description: string | null;
  icon: string | null;
  type: WorkspaceType;
  color: string | null;
  timezone: string;
  weekStartsOn: number;
  defaultProjectId: string | null;
  defaultTeamId: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
