import type { DailySummary } from '../entities/DailySummary';

export type CreateDailySummaryInput = Omit<DailySummary, 'id' | 'createdAt'>;
