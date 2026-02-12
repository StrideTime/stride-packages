import type { TeamMember } from '../entities/TeamMember';

export type CreateTeamMemberInput = Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>;
