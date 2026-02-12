export const GoalType = {
  TASKS_COMPLETED: 'TASKS_COMPLETED',
  FOCUS_MINUTES: 'FOCUS_MINUTES',
  POINTS_EARNED: 'POINTS_EARNED',
  CUSTOM: 'CUSTOM',
} as const;
export type GoalType = (typeof GoalType)[keyof typeof GoalType];
