import type { FocusSessionType } from '../enums/FocusSessionType';

export type FocusSession = {
  id: string;
  userId: string;
  workspaceId: string | null;
  taskId: string | null;
  taskName: string | null;
  type: FocusSessionType;
  durationMinutes: number;
  startedAt: string;
  endedAt: string | null;
  completed: boolean;
  interrupted: boolean;
  interruptions: number;
};
