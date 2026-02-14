import type { Task, TaskType, Project } from "@stridetime/types";

/**
 * A task being drafted in the QuickAdd form.
 *
 * It's a Partial<Task> because most fields start unset and get filled in
 * as the user configures the task. `id` and `title` are always present.
 * `indent` is form-only (controls bullet-list nesting depth).
 */
export type DraftTask = Partial<Task> &
  Pick<Task, "id" | "title"> & {
    /** Bullet-list nesting depth (0 = top-level, 1+ = subtask) */
    indent: number;
  };

export interface TaskListViewProps {
  tasks: DraftTask[];
  projects: Project[];
  selectedProjectId?: string;
  hoveredGroupId?: string | null;
  onTasksChange: (tasks: DraftTask[]) => void;
  onHoveredGroupChange?: (groupId: string | null) => void;
  onSelectTask: (taskId: string) => void;
}

export interface TaskConfigViewProps {
  task: DraftTask;
  tasks: DraftTask[];
  projects: Project[];
  taskTypes: TaskType[];
  selectedProjectId?: string;
  isWorkspaceAdmin?: boolean;
  onUpdateTask: (id: string, updates: Partial<DraftTask>) => void;
  onTasksChange: (tasks: DraftTask[]) => void;
}

export interface QuickAddTaskProps {
  projects: Project[];
  taskTypes: TaskType[];
  isWorkspaceAdmin?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: DraftTask[];
  onTasksChange: (tasks: DraftTask[]) => void;
  selectedProjectId?: string;
  onSelectedProjectChange?: (projectId: string) => void;
  selectedTaskId?: string | null;
  onSelectedTaskChange?: (taskId: string | null) => void;
  hoveredGroupId?: string | null;
  onHoveredGroupChange?: (groupId: string | null) => void;
  onCreate?: (tasks: DraftTask[]) => void;
}
