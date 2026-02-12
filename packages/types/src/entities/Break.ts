import type { BreakType } from '../enums/BreakType';

export type Break = {
  id: string;
  userId: string;
  type: BreakType;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
