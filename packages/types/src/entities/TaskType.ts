export type TaskType = {
  id: string;
  workspaceId: string | null;
  userId: string;
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  displayOrder: number;
};
