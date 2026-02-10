export const ScheduledEventType = {
  TASK: 'TASK',
  MEETING: 'MEETING',
  BREAK: 'BREAK',
  OTHER: 'OTHER',
} as const;
export type ScheduledEventType = (typeof ScheduledEventType)[keyof typeof ScheduledEventType];
