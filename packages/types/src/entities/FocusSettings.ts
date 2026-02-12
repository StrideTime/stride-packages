export type FocusSettings = {
  id: string;
  userId: string;
  pomodoroModeEnabled: boolean;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  notificationsEnabled: boolean;
  tickingSoundEnabled: boolean;
};
