import type { FocusSessionType, Task } from "@stridetime/types";

export interface TimerDisplayProps {
  // Core
  task: Task;
  sessionSeconds: number;
  onStopSession: () => void;

  // Display augmentation (joined from Project entity)
  projectName?: string;
  projectColor?: string;

  // Pomodoro mode
  pomodoroEnabled?: boolean;
  sessionType?: FocusSessionType;
  currentCycle?: number;
  totalCycles?: number;
  sessionDurationMinutes?: number;
  remainingSeconds?: number;
}
