import type { ScheduleType } from '../enums/ScheduleType';

export interface UpdateHabitInput {
  name?: string;
  description?: string;
  icon?: string;
  scheduleType?: ScheduleType;
  scheduleDaysOfWeek?: number[];
  targetCount?: number;
  unit?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  reminderMessage?: string;
  displayOrder?: number;
}
