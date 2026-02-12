export type WorkspaceStatus = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  isEnabled: boolean;
  displayOrder: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
