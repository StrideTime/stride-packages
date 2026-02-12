import type { TaskDifficulty } from '../enums/TaskDifficulty';
import type { TaskPriority } from '../enums/TaskPriority';
import type { TaskStatus } from '../enums/TaskStatus';
import type { ExternalSource } from '../enums/ExternalSource';

export type Task = {
  id: string;
  userId: string;
  projectId: string;
  parentTaskId: string | null;

  title: string;
  description: string | null;
  difficulty: TaskDifficulty;
  priority: TaskPriority;
  progress: number;
  status: TaskStatus;

  // Assignment
  assigneeUserId: string | null;
  teamId: string | null;

  // Time tracking
  estimatedMinutes: number | null;
  maxMinutes: number | null;
  actualMinutes: number;

  // Planning
  plannedForDate: string | null;
  dueDate: string | null;
  taskTypeId: string | null;
  displayOrder: number;

  // External integration
  tags: string | null;
  externalId: string | null;
  externalSource: ExternalSource | null;

  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
