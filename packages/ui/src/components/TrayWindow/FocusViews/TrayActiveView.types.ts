import type { FocusSessionType, Task, UpcomingEvent } from "../TrayWindow.types";

export interface TrayActiveViewProps {
  task: Task;
  sessionSeconds: number;
  onStopSession: () => void;

  // Pomodoro
  pomodoroEnabled?: boolean;
  sessionType?: FocusSessionType;
  currentCycle?: number;
  totalCycles?: number;
  sessionDurationMinutes?: number;
  remainingSeconds?: number;

  // Switch task without stopping timer (Pomodoro)
  onSwitchTask?: () => void;

  // Upcoming event
  upcomingEvent?: UpcomingEvent;
  onStartEvent?: () => void;
}
