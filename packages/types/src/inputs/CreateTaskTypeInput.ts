import type { TaskType } from '../entities/TaskType';

export type CreateTaskTypeInput = Omit<TaskType, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>;
