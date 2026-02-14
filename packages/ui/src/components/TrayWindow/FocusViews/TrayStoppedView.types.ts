import type { Task, UpcomingEvent } from "../TrayWindow.types";

export interface TrayStoppedViewProps {
  taskTitle: string;
  minutesWorked: number;
  currentProgress: number;
  subtasks?: Task[];
  /** Why the session stopped — controls which actions are shown below */
  reason?: "manual" | "event";
  /** The event that triggered the stop (shown when reason='event') */
  nextEventTitle?: string;
  /** Upcoming scheduled event (shown in manual stop when within range) */
  upcomingEvent?: UpcomingEvent;
  onProgressChange: (progress: number) => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onCompleteTask?: () => void;
  onSelectNewTask: () => void;
  onStartNextEvent?: () => void;
  onStartEvent?: () => void;
  onTakeBreak: (minutes: number) => void;
  onClockOut: () => void;
}
