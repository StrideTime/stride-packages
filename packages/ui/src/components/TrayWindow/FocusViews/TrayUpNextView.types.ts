import type { Task, ScheduledTask } from "../TrayWindow.types";

export interface TrayUpNextViewProps {
  scheduledTasks: ScheduledTask[];
  recommendedTasks: Task[];
  onStartTask: (taskId: string) => void;
  onOpenSchedule: () => void;
  onBack: () => void;
}
