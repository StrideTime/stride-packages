import type { WorkSessionStatus } from '../enums/WorkSessionStatus';

export type WorkSession = {
  id: string;
  userId: string;
  workspaceId: string;
  status: WorkSessionStatus;
  clockedInAt: string;
  clockedOutAt: string | null;
  totalFocusMinutes: number;
  totalBreakMinutes: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
