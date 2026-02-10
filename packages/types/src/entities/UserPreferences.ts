import type { Theme } from '../enums/Theme';
import type { PlanningMode } from '../enums/PlanningMode';

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
};
