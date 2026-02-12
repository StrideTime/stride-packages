export const ScheduleType = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  CUSTOM: 'CUSTOM',
} as const;
export type ScheduleType = (typeof ScheduleType)[keyof typeof ScheduleType];
