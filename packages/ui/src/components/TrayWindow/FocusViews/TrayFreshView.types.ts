import type { Task, ScheduledTask, Goals } from "../TrayWindow.types";

export type FreshSection = "plan" | "pick" | "focus";

export interface TrayFreshViewProps {
  goals: Goals;
  availableTasks: Task[];
  scheduledTasks?: ScheduledTask[];
  onStartTask: (task: Task) => void;
  onOpenSchedule: () => void;
  onViewGoals: () => void;
  onOpenMain: () => void;
}
