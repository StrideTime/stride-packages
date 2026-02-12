import type { GoalType } from '../enums/GoalType';
import type { GoalPeriod } from '../enums/GoalPeriod';

export type Goal = {
  id: string;
  userId: string;
  workspaceId: string;
  type: GoalType;
  targetValue: number;
  period: GoalPeriod;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
