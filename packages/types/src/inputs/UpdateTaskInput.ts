import type { TaskDifficulty } from '../enums/TaskDifficulty';
import type { TaskStatus } from '../enums/TaskStatus';

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  difficulty?: TaskDifficulty;
  status?: TaskStatus;
  progress?: number;
  estimatedMinutes?: number | null;
  maxMinutes?: number | null;
  plannedForDate?: string | null;
  dueDate?: string | null;
  taskTypeId?: string | null;
  parentTaskId?: string | null;
}
