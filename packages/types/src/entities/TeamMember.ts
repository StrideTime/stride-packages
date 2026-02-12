import type { TeamMemberRole } from '../enums/TeamMemberRole';

export type TeamMember = {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  addedBy: string | null;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
