import type { Task } from '../entities/Task';

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>;
