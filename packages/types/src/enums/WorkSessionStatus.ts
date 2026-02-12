export const WorkSessionStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
} as const;
export type WorkSessionStatus = (typeof WorkSessionStatus)[keyof typeof WorkSessionStatus];
