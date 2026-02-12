import type { Theme } from '../enums/Theme';
import type { PlanningMode } from '../enums/PlanningMode';
import type { FontSize } from '../enums/FontSize';
import type { Density } from '../enums/Density';

export type UserPreferences = {
  userId: string;

  theme: Theme;
  planningMode: PlanningMode;

  checkInFrequency: number;
  checkInEnabled: boolean;

  endOfDaySummaryTime: string;
  endOfDaySummaryEnabled: boolean;

  autoPauseMinutes: number;
  autoPauseEnabled: boolean;

  breakReminderEnabled: boolean;
  breakReminderMinutes: number;

  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string;
  accentColor: string | null;

  fontSize: FontSize;
  density: Density;
  keyboardShortcuts: string | null;
  enableSoundEffects: boolean;
  enableHapticFeedback: boolean;
  autoStartTimer: boolean;
};
