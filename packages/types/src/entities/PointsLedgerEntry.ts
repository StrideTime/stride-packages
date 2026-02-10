import type { PointsReason } from '../enums/PointsReason';

export type PointsLedgerEntry = {
  id: string;
  userId: string;
  taskId: string | null;
  timeEntryId: string | null;
  points: number;
  reason: PointsReason;
  description: string | null;
  earnedAt: string;
};
