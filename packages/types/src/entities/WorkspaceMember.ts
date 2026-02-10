import type { WorkspaceMemberRole } from '../enums/WorkspaceMemberRole';

export type WorkspaceMember = {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  invitedBy: string | null;
  joinedAt: string;
};
