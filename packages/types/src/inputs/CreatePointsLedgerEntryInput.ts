import type { PointsLedgerEntry } from '../entities/PointsLedgerEntry';

export type CreatePointsLedgerEntryInput = Omit<
  PointsLedgerEntry,
  'id' | 'createdAt' | 'updatedAt' | 'deleted'
>;
