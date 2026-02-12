export type TimeEntry = {
  id: string;
  taskId: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
