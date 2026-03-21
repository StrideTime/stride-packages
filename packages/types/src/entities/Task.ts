import type { TaskDifficulty } from '../enums/TaskDifficulty';
import type { TaskStatus } from '../enums/TaskStatus';
import type { ExternalSource } from '../enums/ExternalSource';

export type Task = {
  id: string;
  userId: string;
  projectId: string;

  title: string;
  description: string | null;
  difficulty: TaskDifficulty;
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

  /** JSON array of checklist items (e.g. `{ id, title, completed }[]`). */
  checklistItems: string | null;

  // External integration
  tags: string | null;
  externalId: string | null;
  externalSource: ExternalSource | null;

  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
