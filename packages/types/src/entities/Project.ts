export type Project = {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  completionPercentage: number;
};
