import type { Theme } from '../enums/Theme';
import type { FontSize } from '../enums/FontSize';
import type { Density } from '../enums/Density';

export interface UpdateUserPreferencesInput {
  theme?: Theme;
  checkInFrequency?: number;
  checkInEnabled?: boolean;
  endOfDaySummaryTime?: string;
  endOfDaySummaryEnabled?: boolean;
  autoPauseMinutes?: number;
  autoPauseEnabled?: boolean;
  breakReminderEnabled?: boolean;
  breakReminderMinutes?: number;
  accentColor?: string | null;
  fontSize?: FontSize;
  density?: Density;
  keyboardShortcuts?: string | null;
  soundEnabled?: boolean;
  soundVolume?: number;
  enableHapticFeedback?: boolean;
  autoStartTimer?: boolean;
}
