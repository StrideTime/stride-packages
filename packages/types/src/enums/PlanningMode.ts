export const PlanningMode = {
  WEEKLY: 'WEEKLY',
  DAILY: 'DAILY',
  TIME_BLOCKER: 'TIME_BLOCKER',
  MINIMAL: 'MINIMAL',
} as const;
export type PlanningMode = (typeof PlanningMode)[keyof typeof PlanningMode];
