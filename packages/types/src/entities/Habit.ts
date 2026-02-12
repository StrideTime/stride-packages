import type { ScheduleType } from '../enums/ScheduleType';
import type { TrackingType } from '../enums/TrackingType';

export type Habit = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  icon: string;
  scheduleType: ScheduleType;
  scheduleDaysOfWeek: string | null;
  scheduleStartDate: string;
  scheduleEndDate: string | null;
  targetCount: number | null;
  trackingType: TrackingType;
  unit: string | null;
  reminderEnabled: boolean;
  reminderTime: string | null;
  reminderMessage: string | null;
  displayOrder: number;
  archivedAt: string | null;
};

export type HabitStreak = {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalCompletions: number;
};
