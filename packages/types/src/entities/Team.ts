export type Team = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isDefault: boolean;
  leadUserId: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
