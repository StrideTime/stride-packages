import type { User } from '../entities/User';

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>;
