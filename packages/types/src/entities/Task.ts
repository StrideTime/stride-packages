import type { TaskDifficulty } from '../enums/TaskDifficulty';
import type { TaskStatus } from '../enums/TaskStatus';

export type Task = {
  id: string;
  userId: string;
  projectId: string;
  parentTaskId: string | null;

  title: string;
  description: string | null;
  difficulty: TaskDifficulty;
  progress: number;
  status: TaskStatus;

  // Time tracking
  estimatedMinutes: number | null;
  maxMinutes: number | null;
  actualMinutes: number;

  // Planning
  plannedForDate: string | null;
  dueDate: string | null;
  taskTypeId: string | null;

  completedAt: string | null;
};
