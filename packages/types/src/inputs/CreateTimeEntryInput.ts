import type { TimeEntry } from '../entities/TimeEntry';

export type CreateTimeEntryInput = Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>;
