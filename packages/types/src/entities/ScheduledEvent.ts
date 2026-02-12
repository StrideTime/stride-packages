import type { ScheduledEventType } from '../enums/ScheduledEventType';
import type { ExternalSource } from '../enums/ExternalSource';

export type ScheduledEvent = {
  id: string;
  taskId: string | null;
  userId: string;
  startTime: string;
  durationMinutes: number;
  label: string;
  type: ScheduledEventType;
  externalId: string | null;
  externalSource: ExternalSource | null;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
