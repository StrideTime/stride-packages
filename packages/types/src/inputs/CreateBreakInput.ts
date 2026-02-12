import type { Break } from '../entities/Break';

export type CreateBreakInput = Omit<Break, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>;
