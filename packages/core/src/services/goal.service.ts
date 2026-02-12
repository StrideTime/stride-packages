/**
 * Goal Service
 * Business logic for goal CRUD and progress computation
 */

import {
  goalRepo as defaultGoalRepo,
  type GoalRepository,
  taskRepo as defaultTaskRepo,
  type TaskRepository,
  timeEntryRepo as defaultTimeEntryRepo,
  type TimeEntryRepository,
  pointsLedgerRepo as defaultPointsLedgerRepo,
  type PointsLedgerRepository,
  type StrideDatabase,
} from '@stridetime/db';
import type { Goal, GoalType, GoalPeriod } from '@stridetime/types';
import { ValidationError, TaskStatus } from '@stridetime/types';

/**
 * Parameters for creating a new goal
 */
export interface CreateGoalParams {
  userId: string;
  workspaceId: string;
  type: GoalType;
  targetValue: number;
  period: GoalPeriod;
}

/**
 * Parameters for updating a goal
 */
export interface UpdateGoalParams {
  type?: GoalType;
  targetValue?: number;
  period?: GoalPeriod;
  isActive?: boolean;
}

/**
 * Goal progress status
 */
export interface GoalProgress {
  goal: Goal;
  current: number;
  target: number;
  percentage: number;
}

/**
 * Goal Service for business logic
 */
export class GoalService {
  constructor(
    private goalRepo: GoalRepository = defaultGoalRepo,
    private taskRepo: TaskRepository = defaultTaskRepo,
    private timeEntryRepo: TimeEntryRepository = defaultTimeEntryRepo,
    private pointsLedgerRepo: PointsLedgerRepository = defaultPointsLedgerRepo
  ) {}

  /**
   * Validate goal creation parameters
   */
  private validateCreate(params: CreateGoalParams): void {
    // User validation
    if (!params.userId) {
      throw new ValidationError('userId', 'User ID is required');
    }

    // Workspace validation
    if (!params.workspaceId) {
      throw new ValidationError('workspaceId', 'Workspace ID is required');
    }

    // Type validation
    if (!params.type) {
      throw new ValidationError('type', 'Goal type is required');
    }

    // Period validation
    if (!params.period) {
      throw new ValidationError('period', 'Goal period is required');
    }

    // Target value validation
    if (!params.targetValue || params.targetValue <= 0) {
      throw new ValidationError('targetValue', 'Target value must be greater than 0');
    }
  }

  /**
   * Validate goal update parameters
   */
  private validateUpdate(params: UpdateGoalParams): void {
    // Target value validation (if provided)
    if (params.targetValue !== undefined && params.targetValue <= 0) {
      throw new ValidationError('targetValue', 'Target value must be greater than 0');
    }
  }

  /**
   * Get start and end dates for a goal period
   */
  private getDateRange(period: GoalPeriod, date?: string): { startDate: string; endDate: string } {
    const now = date ? new Date(date) : new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    if (period === 'DAILY') {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`;
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59.999Z`;
      return { startDate, endDate };
    }

    // WEEKLY: start from Monday of current week
    const dayOfWeek = now.getUTCDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, so -6 to get to Monday
    const monday = new Date(now);
    monday.setUTCDate(day + diffToMonday);
    monday.setUTCHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);

    const startDate = monday.toISOString();
    const endDate = sunday.toISOString();

    return { startDate, endDate };
  }

  /**
   * Calculate current progress for a goal
   */
  private async calculateProgress(
    db: StrideDatabase,
    userId: string,
    goal: Goal,
    date?: string
  ): Promise<number> {
    const { startDate, endDate } = this.getDateRange(goal.period, date);

    switch (goal.type) {
      case 'TASKS_COMPLETED': {
        // Count tasks with status=COMPLETED and completedAt in date range
        const tasks = await this.taskRepo.findByUserId(db, userId);
        const completedInRange = tasks.filter(task => {
          if (task.status !== TaskStatus.COMPLETED || !task.completedAt) {
            return false;
          }
          const completedAt = new Date(task.completedAt).getTime();
          return (
            completedAt >= new Date(startDate).getTime() &&
            completedAt <= new Date(endDate).getTime()
          );
        });
        return completedInRange.length;
      }

      case 'FOCUS_MINUTES': {
        // Sum duration from time_entries in date range
        const entries = await this.timeEntryRepo.findByDateRange(db, userId, startDate, endDate);
        const focusMinutes = entries.reduce((total, entry) => {
          if (!entry.endedAt) return total;
          const start = new Date(entry.startedAt).getTime();
          const end = new Date(entry.endedAt).getTime();
          return total + Math.floor((end - start) / 60000);
        }, 0);
        return focusMinutes;
      }

      case 'POINTS_EARNED': {
        // Sum points from points_ledger in date range
        const allEntries = await this.pointsLedgerRepo.findByUser(db, userId);
        const entriesInRange = allEntries.filter(entry => {
          const createdAt = new Date(entry.createdAt).getTime();
          return (
            createdAt >= new Date(startDate).getTime() && createdAt <= new Date(endDate).getTime()
          );
        });
        const totalPoints = entriesInRange.reduce((sum, entry) => sum + entry.points, 0);
        return totalPoints;
      }

      case 'CUSTOM':
        // Custom goals don't have automatic progress tracking
        return 0;

      default:
        return 0;
    }
  }

  /**
   * Create a new goal
   */
  async create(db: StrideDatabase, params: CreateGoalParams): Promise<Goal> {
    // 1. Validate synchronously
    this.validateCreate(params);

    // 2. Create goal via repo with defaults
    const goal = await this.goalRepo.create(db, {
      userId: params.userId,
      workspaceId: params.workspaceId,
      type: params.type,
      targetValue: params.targetValue,
      period: params.period,
      isActive: true,
    });

    return goal;
  }

  /**
   * Update a goal
   */
  async update(db: StrideDatabase, goalId: string, params: UpdateGoalParams): Promise<Goal> {
    // 1. Validate synchronously
    this.validateUpdate(params);

    // 2. Check if goal exists
    const existingGoal = await this.goalRepo.findById(db, goalId);
    if (!existingGoal) {
      throw new ValidationError('goalId', 'Goal not found');
    }

    // 3. Prepare updates
    const updates: Partial<Goal> = {};

    if (params.type !== undefined) {
      updates.type = params.type;
    }

    if (params.targetValue !== undefined) {
      updates.targetValue = params.targetValue;
    }

    if (params.period !== undefined) {
      updates.period = params.period;
    }

    if (params.isActive !== undefined) {
      updates.isActive = params.isActive;
    }

    // 4. Update goal via repo
    const updatedGoal = await this.goalRepo.update(db, goalId, updates);

    return updatedGoal;
  }

  /**
   * Delete a goal (soft delete)
   */
  async delete(db: StrideDatabase, goalId: string): Promise<void> {
    // Check if goal exists
    const goal = await this.goalRepo.findById(db, goalId);
    if (!goal) {
      throw new ValidationError('goalId', 'Goal not found');
    }

    await this.goalRepo.delete(db, goalId);
  }

  /**
   * Get progress for a specific goal
   */
  async getProgress(
    db: StrideDatabase,
    userId: string,
    goalId: string,
    date?: string
  ): Promise<{ current: number; target: number; percentage: number }> {
    // Get goal
    const goal = await this.goalRepo.findById(db, goalId);
    if (!goal) {
      throw new ValidationError('goalId', 'Goal not found');
    }

    // Verify goal belongs to user
    if (goal.userId !== userId) {
      throw new ValidationError('userId', 'Goal does not belong to this user');
    }

    // Calculate current progress
    const current = await this.calculateProgress(db, userId, goal, date);
    const target = goal.targetValue;
    const percentage = target > 0 ? Math.round((current / target) * 100) : 0;

    return {
      current,
      target,
      percentage,
    };
  }

  /**
   * Get progress for all active goals of a user
   */
  async getAllGoalStatuses(
    db: StrideDatabase,
    userId: string,
    date?: string
  ): Promise<GoalProgress[]> {
    // Get all active goals for user
    const goals = await this.goalRepo.findByUser(db, userId);
    const activeGoals = goals.filter(goal => goal.isActive);

    // Calculate progress for each goal
    const progressPromises = activeGoals.map(async goal => {
      const current = await this.calculateProgress(db, userId, goal, date);
      const target = goal.targetValue;
      const percentage = target > 0 ? Math.round((current / target) * 100) : 0;

      return {
        goal,
        current,
        target,
        percentage,
      };
    });

    return Promise.all(progressPromises);
  }
}

/**
 * Singleton instance for convenient access
 */
export const goalService = new GoalService();
