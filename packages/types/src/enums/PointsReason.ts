export const PointsReason = {
  WORK_SESSION: 'WORK_SESSION',
  TASK_COMPLETED: 'TASK_COMPLETED',
  EFFICIENCY_BONUS: 'EFFICIENCY_BONUS',
  FOCUS_BONUS: 'FOCUS_BONUS',
  STREAK_BONUS: 'STREAK_BONUS',
} as const;
export type PointsReason = (typeof PointsReason)[keyof typeof PointsReason];
