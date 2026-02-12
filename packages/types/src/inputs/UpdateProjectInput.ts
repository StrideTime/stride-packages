import type { ProjectStatus } from '../enums/ProjectStatus';

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: ProjectStatus;
}
