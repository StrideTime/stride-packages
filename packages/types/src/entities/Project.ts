import type { ProjectStatus } from '../enums/ProjectStatus';

export type Project = {
  id: string;
  workspaceId: string;
  /** Audit-only creator; access is via workspace + project_teams, not this field. */
  createdByUserId: string | null;
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
