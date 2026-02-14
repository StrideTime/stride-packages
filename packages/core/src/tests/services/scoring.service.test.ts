/**
 * Unit tests for ScoringService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScoringService, DIFFICULTY_MULTIPLIERS } from '../../services/scoring.service';
import {
  createMockTask,
  createMockCompletedTask,
  createMockDatabase,
  createMockCompletedTimeEntry,
  createMockActiveTimeEntry,
} from '@stridetime/test-utils';
import type { ScoringContext } from '../../services/scoring.service';

// Create hoisted mocks
const { mockTaskRepo, mockTimeEntryRepo, mockDailySummaryRepo } = vi.hoisted(() => ({
  mockTaskRepo: {
    findById: vi.fn(),
    findByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockTimeEntryRepo: {
    findByDateRange: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockDailySummaryRepo: {
    upsert: vi.fn(),
    calculateAveragePoints: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the module
vi.mock('@stridetime/db', () => ({
  taskRepo: mockTaskRepo,
  TaskRepository: vi.fn(),
  timeEntryRepo: mockTimeEntryRepo,
  TimeEntryRepository: vi.fn(),
  dailySummaryRepo: mockDailySummaryRepo,
  DailySummaryRepository: vi.fn(),
  initDatabase: vi.fn(),
  getDatabase: vi.fn(),
  closeDatabase: vi.fn(),
  isDatabaseInitialized: vi.fn(),
  getPowerSyncDatabase: vi.fn(),
  getConnector: vi.fn(),
  connectSync: vi.fn(),
  disconnectSync: vi.fn(),
  isSyncEnabled: vi.fn(),
  getSyncStatus: vi.fn(),
  onSyncStatusChange: vi.fn(),
  SupabaseConnector: vi.fn(),
  SupabaseAuthProvider: vi.fn(),
  WorkspaceRepository: vi.fn(),
  workspaceRepo: vi.fn(),
  UserRepository: vi.fn(),
  userRepo: vi.fn(),
  ProjectRepository: vi.fn(),
  projectRepo: vi.fn(),
  BreakRepository: vi.fn(),
  breakRepo: vi.fn(),
  FeatureRepository: vi.fn(),
  featureRepo: vi.fn(),
  PlanRepository: vi.fn(),
  planRepo: vi.fn(),
  PlanPriceRepository: vi.fn(),
  planPriceRepo: vi.fn(),
  SubscriptionRepository: vi.fn(),
  subscriptionRepo: vi.fn(),
  AdminAuditRepository: vi.fn(),
  adminAuditRepo: vi.fn(),
  generateId: vi.fn(),
  now: vi.fn(),
  today: vi.fn(),
}));

describe('ScoringService', () => {
  let scoringService: ScoringService;
  let mockDb: any;

  beforeEach(() => {
    scoringService = new ScoringService(
      mockTaskRepo as any,
      mockTimeEntryRepo as any,
      mockDailySummaryRepo as any
    );
    mockDb = createMockDatabase();
    vi.clearAllMocks();
  });

  describe('calculateTaskScore', () => {
    it('should calculate base points correctly for different difficulties', () => {
      const context: ScoringContext = { taskTypesWorkedToday: 0 };

      // TRIVIAL: 1 point at 100%
      const trivialTask = createMockTask({
        difficulty: 'TRIVIAL',
        progress: 100,
        actualMinutes: 60,
      });
      const trivialScore = scoringService.calculateTaskScore(trivialTask, context);
      expect(trivialScore.basePoints).toBe(1);
      expect(trivialScore.totalPoints).toBe(1);

      // EASY: 2 points at 100%
      const easyTask = createMockTask({ difficulty: 'EASY', progress: 100, actualMinutes: 60 });
      const easyScore = scoringService.calculateTaskScore(easyTask, context);
      expect(easyScore.basePoints).toBe(2);
      expect(easyScore.totalPoints).toBe(2);

      // MEDIUM: 3 points at 100%
      const mediumTask = createMockTask({ difficulty: 'MEDIUM', progress: 100, actualMinutes: 60 });
      const mediumScore = scoringService.calculateTaskScore(mediumTask, context);
      expect(mediumScore.basePoints).toBe(3);
      expect(mediumScore.totalPoints).toBe(3);

      // HARD: 5 points at 100%
      const hardTask = createMockTask({ difficulty: 'HARD', progress: 100, actualMinutes: 60 });
      const hardScore = scoringService.calculateTaskScore(hardTask, context);
      expect(hardScore.basePoints).toBe(5);
      expect(hardScore.totalPoints).toBe(5);

      // EXTREME: 8 points at 100%
      const extremeTask = createMockTask({
        difficulty: 'EXTREME',
        progress: 100,
        actualMinutes: 60,
      });
      const extremeScore = scoringService.calculateTaskScore(extremeTask, context);
      expect(extremeScore.basePoints).toBe(8);
      expect(extremeScore.totalPoints).toBe(8);
    });

    it('should scale points by progress percentage', () => {
      const context: ScoringContext = { taskTypesWorkedToday: 0 };

      // 50% progress on HARD (5 points) = 2.5 points
      const task = createMockTask({ difficulty: 'HARD', progress: 50 });
      const score = scoringService.calculateTaskScore(task, context);
      expect(score.basePoints).toBe(2.5);
      expect(score.totalPoints).toBe(3); // Rounded
    });

    it('should award 20% efficiency bonus when completed under estimate', () => {
      const context: ScoringContext = { taskTypesWorkedToday: 0 };

      const task = createMockCompletedTask({
        difficulty: 'MEDIUM',
        estimatedMinutes: 60,
        actualMinutes: 45, // Completed in 45 minutes vs 60 estimated
      });

      const score = scoringService.calculateTaskScore(task, context);

      expect(score.basePoints).toBe(3);
      expect(score.efficiencyBonus).toBe(0.6); // 20% of 3
      expect(score.totalPoints).toBe(4); // 3 + 0.6 rounded
    });

    it('should NOT award efficiency bonus when over estimate', () => {
      const context: ScoringContext = { taskTypesWorkedToday: 0 };

      const task = createMockCompletedTask({
        difficulty: 'MEDIUM',
        estimatedMinutes: 60,
        actualMinutes: 90, // Took longer than estimated
      });

      const score = scoringService.calculateTaskScore(task, context);

      expect(score.efficiencyBonus).toBe(0);
    });

    it('should NOT award efficiency bonus for incomplete tasks', () => {
      const context: ScoringContext = { taskTypesWorkedToday: 0 };

      const task = createMockTask({
        difficulty: 'MEDIUM',
        progress: 80, // Not complete
        estimatedMinutes: 60,
        actualMinutes: 40,
      });

      const score = scoringService.calculateTaskScore(task, context);

      expect(score.efficiencyBonus).toBe(0);
    });

    it('should award 10% focus bonus when worked on 3+ task types', () => {
      const context: ScoringContext = { taskTypesWorkedToday: 3 };

      const task = createMockCompletedTask({ difficulty: 'MEDIUM' });
      const score = scoringService.calculateTaskScore(task, context);

      expect(score.basePoints).toBe(3);
      expect(score.focusBonus).toBe(0.3); // 10% of 3
      expect(score.totalPoints).toBe(3); // 3 + 0.3 rounded
    });

    it('should NOT award focus bonus when worked on less than 3 task types', () => {
      const context: ScoringContext = { taskTypesWorkedToday: 2 };

      const task = createMockCompletedTask({ difficulty: 'MEDIUM' });
      const score = scoringService.calculateTaskScore(task, context);

      expect(score.focusBonus).toBe(0);
    });

    it('should combine all bonuses when applicable', () => {
      const context: ScoringContext = { taskTypesWorkedToday: 3 };

      const task = createMockCompletedTask({
        difficulty: 'HARD', // 5 base points
        estimatedMinutes: 60,
        actualMinutes: 45,
      });

      const score = scoringService.calculateTaskScore(task, context);

      expect(score.basePoints).toBe(5);
      expect(score.efficiencyBonus).toBe(1); // 20% of 5
      expect(score.focusBonus).toBe(0.5); // 10% of 5
      expect(score.totalPoints).toBe(7); // 5 + 1 + 0.5 rounded
    });
  });

  describe('calculateEfficiency', () => {
    it('should return 1.0 when no estimate', () => {
      const task = createMockTask({ estimatedMinutes: null, actualMinutes: 45 });
      const efficiency = scoringService.calculateEfficiency(task);
      expect(efficiency).toBe(1.0);
    });

    it('should return 1.0 when no actual time', () => {
      const task = createMockTask({ estimatedMinutes: 60, actualMinutes: 0 });
      const efficiency = scoringService.calculateEfficiency(task);
      expect(efficiency).toBe(1.0);
    });

    it('should calculate efficiency correctly when under time', () => {
      const task = createMockTask({ estimatedMinutes: 60, actualMinutes: 45 });
      const efficiency = scoringService.calculateEfficiency(task);
      expect(efficiency).toBeCloseTo(1.33, 2); // 60/45 = 1.33
    });

    it('should calculate efficiency correctly when over time', () => {
      const task = createMockTask({ estimatedMinutes: 60, actualMinutes: 90 });
      const efficiency = scoringService.calculateEfficiency(task);
      expect(efficiency).toBeCloseTo(0.67, 2); // 60/90 = 0.67
    });
  });

  describe('getEfficiencyLabel', () => {
    it('should return correct labels for efficiency ranges', () => {
      expect(scoringService.getEfficiencyLabel(1.6)).toBe('Exceptional');
      expect(scoringService.getEfficiencyLabel(1.5)).toBe('Exceptional');
      expect(scoringService.getEfficiencyLabel(1.3)).toBe('Excellent');
      expect(scoringService.getEfficiencyLabel(1.2)).toBe('Excellent');
      expect(scoringService.getEfficiencyLabel(1.1)).toBe('Good');
      expect(scoringService.getEfficiencyLabel(1.0)).toBe('Good');
      expect(scoringService.getEfficiencyLabel(0.9)).toBe('Fair');
      expect(scoringService.getEfficiencyLabel(0.8)).toBe('Fair');
      expect(scoringService.getEfficiencyLabel(0.7)).toBe('Needs Improvement');
      expect(scoringService.getEfficiencyLabel(0.5)).toBe('Needs Improvement');
    });
  });

  describe('calculateDailyScore', () => {
    it('should sum scores from multiple completed tasks', () => {
      const context: ScoringContext = { taskTypesWorkedToday: 0 };
      const tasks = [
        createMockCompletedTask({ difficulty: 'EASY' }), // 2 points
        createMockCompletedTask({ difficulty: 'MEDIUM' }), // 3 points
        createMockCompletedTask({ difficulty: 'HARD' }), // 5 points
      ];

      const totalScore = scoringService.calculateDailyScore(tasks, context);
      expect(totalScore).toBe(10); // 2 + 3 + 5
    });

    it('should return 0 for empty task list', () => {
      const context: ScoringContext = { taskTypesWorkedToday: 0 };
      const totalScore = scoringService.calculateDailyScore([], context);
      expect(totalScore).toBe(0);
    });
  });

  describe('calculateTrend', () => {
    it('should return 1.0 when average is 0', () => {
      const trend = scoringService.calculateTrend(10, 0);
      expect(trend).toBe(1.0);
    });

    it('should calculate trend correctly when above average', () => {
      const trend = scoringService.calculateTrend(15, 10);
      expect(trend).toBe(1.5); // 150% of average
    });

    it('should calculate trend correctly when below average', () => {
      const trend = scoringService.calculateTrend(5, 10);
      expect(trend).toBe(0.5); // 50% of average
    });

    it('should return 1.0 when equal to average', () => {
      const trend = scoringService.calculateTrend(10, 10);
      expect(trend).toBe(1.0);
    });
  });

  describe('getTrendLabel', () => {
    it('should return encouraging message when significantly above average', () => {
      const label = scoringService.getTrendLabel(1.3); // 30% above
      expect(label).toContain('30% above your average');
      expect(label).toContain('great focus today');
    });

    it('should return positive message when slightly above average', () => {
      const label = scoringService.getTrendLabel(1.1); // 10% above
      expect(label).toBe('10% above your average');
    });

    it('should return neutral message when on average', () => {
      const label = scoringService.getTrendLabel(1.0);
      expect(label).toBe('Right on your average');
    });

    it('should return supportive message when slightly below average', () => {
      const label = scoringService.getTrendLabel(0.9); // 10% below
      expect(label).toBe('10% below your average');
    });

    it('should return encouraging rest message when significantly below', () => {
      const label = scoringService.getTrendLabel(0.7); // 30% below
      expect(label).toContain('30% below your average');
      expect(label).toContain('take it easy');
    });
  });

  describe('DIFFICULTY_MULTIPLIERS', () => {
    it('should have correct multipliers for all difficulty levels', () => {
      expect(DIFFICULTY_MULTIPLIERS.TRIVIAL).toBe(1);
      expect(DIFFICULTY_MULTIPLIERS.EASY).toBe(2);
      expect(DIFFICULTY_MULTIPLIERS.MEDIUM).toBe(3);
      expect(DIFFICULTY_MULTIPLIERS.HARD).toBe(5);
      expect(DIFFICULTY_MULTIPLIERS.EXTREME).toBe(8);
    });
  });

  // ==========================================================================
  // ASYNC METHODS (require mocked repos)
  // ==========================================================================

  describe('getTaskTypesWorkedToday', () => {
    it('should count unique task types from time entries', async () => {
      const entries = [
        createMockCompletedTimeEntry(30, { taskId: 'task-1' }),
        createMockCompletedTimeEntry(45, { taskId: 'task-2' }),
        createMockCompletedTimeEntry(60, { taskId: 'task-3' }),
      ];
      mockTimeEntryRepo.findByDateRange.mockResolvedValue(entries);

      const task1 = createMockTask({ id: 'task-1', taskTypeId: 'type-dev' });
      const task2 = createMockTask({ id: 'task-2', taskTypeId: 'type-design' });
      const task3 = createMockTask({ id: 'task-3', taskTypeId: 'type-dev' }); // same as task1

      mockTaskRepo.findById.mockImplementation((_db: any, id: string) => {
        if (id === 'task-1') return Promise.resolve(task1);
        if (id === 'task-2') return Promise.resolve(task2);
        if (id === 'task-3') return Promise.resolve(task3);
        return Promise.resolve(null);
      });

      const count = await scoringService.getTaskTypesWorkedToday(mockDb, 'user-1', '2026-02-13');

      expect(count).toBe(2); // type-dev and type-design
    });

    it('should return 0 when no time entries', async () => {
      mockTimeEntryRepo.findByDateRange.mockResolvedValue([]);

      const count = await scoringService.getTaskTypesWorkedToday(mockDb, 'user-1', '2026-02-13');

      expect(count).toBe(0);
    });

    it('should exclude tasks with null taskTypeId', async () => {
      const entries = [
        createMockCompletedTimeEntry(30, { taskId: 'task-1' }),
        createMockCompletedTimeEntry(30, { taskId: 'task-2' }),
      ];
      mockTimeEntryRepo.findByDateRange.mockResolvedValue(entries);

      mockTaskRepo.findById.mockImplementation((_db: any, id: string) => {
        if (id === 'task-1')
          return Promise.resolve(createMockTask({ id: 'task-1', taskTypeId: 'type-dev' }));
        if (id === 'task-2')
          return Promise.resolve(createMockTask({ id: 'task-2', taskTypeId: null }));
        return Promise.resolve(null);
      });

      const count = await scoringService.getTaskTypesWorkedToday(mockDb, 'user-1', '2026-02-13');

      expect(count).toBe(1);
    });

    it('should deduplicate task IDs from multiple entries', async () => {
      const entries = [
        createMockCompletedTimeEntry(30, { taskId: 'task-1' }),
        createMockCompletedTimeEntry(30, { taskId: 'task-1' }), // same task
      ];
      mockTimeEntryRepo.findByDateRange.mockResolvedValue(entries);

      mockTaskRepo.findById.mockResolvedValue(
        createMockTask({ id: 'task-1', taskTypeId: 'type-dev' })
      );

      const count = await scoringService.getTaskTypesWorkedToday(mockDb, 'user-1', '2026-02-13');

      // findById should only be called once due to deduplication
      expect(mockTaskRepo.findById).toHaveBeenCalledTimes(1);
      expect(count).toBe(1);
    });
  });

  describe('calculateDailySummary', () => {
    it('should calculate summary for a day with completed tasks', async () => {
      const startTime = new Date('2026-02-13T09:00:00.000Z');
      const endTime = new Date('2026-02-13T10:00:00.000Z');

      const entries = [
        createMockCompletedTimeEntry(60, {
          taskId: 'task-1',
          startedAt: startTime.toISOString(),
          endedAt: endTime.toISOString(),
        }),
      ];
      mockTimeEntryRepo.findByDateRange.mockResolvedValue(entries);

      const completedTask = createMockCompletedTask({
        id: 'task-1',
        difficulty: 'MEDIUM',
        status: 'COMPLETED',
        taskTypeId: 'type-dev',
        estimatedMinutes: 90,
        actualMinutes: 60,
      });
      mockTaskRepo.findById.mockResolvedValue(completedTask);

      const summary = await scoringService.calculateDailySummary(mockDb, 'user-1', '2026-02-13');

      expect(summary.tasksCompleted).toBe(1);
      expect(summary.tasksWorkedOn).toBe(1);
      expect(summary.focusMinutes).toBe(60);
      expect(summary.totalPoints).toBeGreaterThan(0);
      expect(summary.efficiencyRating).toBeGreaterThan(1.0); // Under estimate
    });

    it('should return zero summary for day with no entries', async () => {
      mockTimeEntryRepo.findByDateRange.mockResolvedValue([]);

      const summary = await scoringService.calculateDailySummary(mockDb, 'user-1', '2026-02-13');

      expect(summary.tasksCompleted).toBe(0);
      expect(summary.tasksWorkedOn).toBe(0);
      expect(summary.totalPoints).toBe(0);
      expect(summary.focusMinutes).toBe(0);
      expect(summary.efficiencyRating).toBe(1.0);
    });

    it('should handle active time entries (no endedAt)', async () => {
      const entries = [createMockActiveTimeEntry({ taskId: 'task-1' })];
      mockTimeEntryRepo.findByDateRange.mockResolvedValue(entries);

      const task = createMockTask({ id: 'task-1', status: 'IN_PROGRESS' });
      mockTaskRepo.findById.mockResolvedValue(task);

      const summary = await scoringService.calculateDailySummary(mockDb, 'user-1', '2026-02-13');

      expect(summary.focusMinutes).toBe(0); // Active entries contribute 0 minutes
      expect(summary.tasksWorkedOn).toBe(1);
      expect(summary.tasksCompleted).toBe(0);
    });

    it('should calculate average efficiency across tasks with estimates', async () => {
      const entries = [
        createMockCompletedTimeEntry(30, { taskId: 'task-1' }),
        createMockCompletedTimeEntry(45, { taskId: 'task-2' }),
      ];
      mockTimeEntryRepo.findByDateRange.mockResolvedValue(entries);

      const task1 = createMockTask({
        id: 'task-1',
        status: 'COMPLETED',
        estimatedMinutes: 60,
        actualMinutes: 30,
        taskTypeId: null,
      });
      const task2 = createMockTask({
        id: 'task-2',
        status: 'COMPLETED',
        estimatedMinutes: 60,
        actualMinutes: 60,
        taskTypeId: null,
      });

      mockTaskRepo.findById.mockImplementation((_db: any, id: string) => {
        if (id === 'task-1') return Promise.resolve(task1);
        if (id === 'task-2') return Promise.resolve(task2);
        return Promise.resolve(null);
      });

      const summary = await scoringService.calculateDailySummary(mockDb, 'user-1', '2026-02-13');

      // task1: 60/30 = 2.0, task2: 60/60 = 1.0, average = 1.5
      expect(summary.efficiencyRating).toBe(1.5);
    });
  });

  describe('saveDailySummary', () => {
    it('should calculate and upsert daily summary', async () => {
      mockTimeEntryRepo.findByDateRange.mockResolvedValue([]);
      mockDailySummaryRepo.upsert.mockResolvedValue(undefined);

      await scoringService.saveDailySummary(mockDb, 'user-1', '2026-02-13');

      expect(mockDailySummaryRepo.upsert).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          userId: 'user-1',
          date: '2026-02-13',
          tasksCompleted: 0,
          tasksWorkedOn: 0,
          standoutMoment: null,
        })
      );
    });

    it('should pass standout moment to summary', async () => {
      mockTimeEntryRepo.findByDateRange.mockResolvedValue([]);
      mockDailySummaryRepo.upsert.mockResolvedValue(undefined);

      await scoringService.saveDailySummary(
        mockDb,
        'user-1',
        '2026-02-13',
        'Finished the big refactor!'
      );

      expect(mockDailySummaryRepo.upsert).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          standoutMoment: 'Finished the big refactor!',
        })
      );
    });
  });

  describe('getAverageScore', () => {
    it('should return average score from daily summary repo', async () => {
      mockDailySummaryRepo.calculateAveragePoints.mockResolvedValue(42);

      const avg = await scoringService.getAverageScore(mockDb, 'user-1');

      expect(avg).toBe(42);
      expect(mockDailySummaryRepo.calculateAveragePoints).toHaveBeenCalledWith(
        mockDb,
        'user-1',
        30
      );
    });

    it('should pass custom days parameter', async () => {
      mockDailySummaryRepo.calculateAveragePoints.mockResolvedValue(10);

      await scoringService.getAverageScore(mockDb, 'user-1', 7);

      expect(mockDailySummaryRepo.calculateAveragePoints).toHaveBeenCalledWith(mockDb, 'user-1', 7);
    });
  });
});
