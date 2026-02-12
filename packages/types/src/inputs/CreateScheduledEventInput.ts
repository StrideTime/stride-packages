import type { ScheduledEventType } from '../enums/ScheduledEventType';
import type { ExternalSource } from '../enums/ExternalSource';

export interface CreateScheduledEventInput {
  taskId?: string;
  startTime: string;
  durationMinutes: number;
  label: string;
  type: ScheduledEventType;
  externalSource?: ExternalSource;
  externalId?: string;
  metadata?: string;
}
