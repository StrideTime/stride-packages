import type { ProjectTeam } from '../entities/ProjectTeam';

export type CreateProjectTeamInput = Omit<
  ProjectTeam,
  'id' | 'createdAt' | 'updatedAt' | 'deleted'
>;
