import type { ScheduledEventType } from '../enums/ScheduledEventType';

export type ScheduledEvent = {
  id: string;
  taskId: string | null;
  userId: string;
  startTime: string;
  durationMinutes: number;
  label: string;
  type: ScheduledEventType;
  externalId: string | null;
};
