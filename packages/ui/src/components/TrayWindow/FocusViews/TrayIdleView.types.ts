import type { Task, Goals } from "../TrayWindow.types";

export type IdleSection = "pick" | "break" | "finish";

export interface TrayIdleViewProps {
  dailySeconds: number;
  goals: Goals;
  availableTasks: Task[];
  onStartTask: (task: Task) => void;
  onTakeBreak: (minutes: number) => void;
  onClockOut: () => void;
  onOpenMain: () => void;
}
