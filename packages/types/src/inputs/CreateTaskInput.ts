import type { TaskDifficulty } from '../enums/TaskDifficulty';

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  parentTaskId?: string;
  estimatedMinutes?: number;
  maxMinutes?: number;
  plannedForDate?: string;
  dueDate?: string;
  taskTypeId?: string;
}
