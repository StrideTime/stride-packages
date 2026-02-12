import type { GoalType } from '../enums/GoalType';
import type { GoalPeriod } from '../enums/GoalPeriod';

export interface CreateGoalInput {
  type: GoalType;
  targetValue: number;
  period: GoalPeriod;
  workspaceId: string;
}
