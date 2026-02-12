import type { WorkSession } from '../entities/WorkSession';

export type CreateWorkSessionInput = Omit<
  WorkSession,
  'id' | 'createdAt' | 'updatedAt' | 'deleted'
>;
