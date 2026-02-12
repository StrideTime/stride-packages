import type { ScheduleType } from '../enums/ScheduleType';
import type { TrackingType } from '../enums/TrackingType';

export interface CreateHabitInput {
  name: string;
  description?: string;
  icon: string;
  scheduleType: ScheduleType;
  scheduleDaysOfWeek?: number[];
  targetCount?: number;
  trackingType: TrackingType;
  unit?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  reminderMessage?: string;
}
