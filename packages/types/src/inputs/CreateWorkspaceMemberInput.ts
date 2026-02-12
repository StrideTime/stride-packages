import type { WorkspaceMember } from '../entities/WorkspaceMember';

export type CreateWorkspaceMemberInput = Omit<
  WorkspaceMember,
  'id' | 'createdAt' | 'updatedAt' | 'deleted'
>;
