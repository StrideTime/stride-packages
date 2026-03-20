import type { UserStatus } from '../enums/UserStatus';

export type WorkspaceUserStatus = {
  id: string;
  userId: string;
  workspaceId: string;
  status: UserStatus;
  statusText: string | null;
  activeTaskId: string | null;
  createdAt: string;
  updatedAt: string;
};
