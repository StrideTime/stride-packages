export const TaskPriority = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  NONE: 'NONE',
} as const;
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];
