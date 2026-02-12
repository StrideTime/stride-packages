import type { TaskPriority } from '../enums/TaskPriority';

export interface UpdateTaskPriorityInput {
  taskId: string;
  priority: TaskPriority;
}
