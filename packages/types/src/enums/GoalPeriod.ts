export const GoalPeriod = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
} as const;
export type GoalPeriod = (typeof GoalPeriod)[keyof typeof GoalPeriod];
