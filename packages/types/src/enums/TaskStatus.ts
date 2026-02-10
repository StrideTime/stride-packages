export const TaskStatus = {
  BACKLOG: 'BACKLOG',
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
