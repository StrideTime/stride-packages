import type { ProjectStatus } from '../enums/ProjectStatus';

export type Project = {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  status: ProjectStatus;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
