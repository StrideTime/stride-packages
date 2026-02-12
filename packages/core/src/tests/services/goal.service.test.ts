/**
 * Unit tests for GoalService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoalService } from '../../services/goal.service';
import type { CreateGoalParams, UpdateGoalParams } from '../../services/goal.service';
import { ValidationError, TaskStatus } from '@stridetime/types';
import { createMockGoal } from '@stridetime/test-utils';

// Hoist mocks
const { mockGoalRepo, mockTaskRepo, mockTimeEntryRepo, mockPointsLedgerRepo } = vi.hoisted(() => ({
  mockGoalRepo: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findByUser: vi.fn(),
  },
  mockTaskRepo: {
    findByUserId: vi.fn(),
  },
  mockTimeEntryRepo: {
    findByDateRange: vi.fn(),
  },
  mockPointsLedgerRepo: {
    findByUser: vi.fn(),
  },
}));

vi.mock('@stridetime/db', () => ({
  goalRepo: mockGoalRepo,
  GoalRepository: vi.fn(),
  taskRepo: mockTaskRepo,
  TaskRepository: vi.fn(),
  timeEntryRepo: mockTimeEntryRepo,
  TimeEntryRepository: vi.fn(),
  pointsLedgerRepo: mockPointsLedgerRepo,
  PointsLedgerRepository: vi.fn(),
}));

describe('GoalService', () => {
  let service: GoalService;
  let mockDb: any;

  beforeEach(() => {
    service = new GoalService(mockGoalRepo, mockTaskRepo, mockTimeEntryRepo, mockPointsLedgerRepo);
    mockDb = {};
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a goal with valid parameters', async () => {
      const params: CreateGoalParams = {
        userId: 'user-123',
        workspaceId: 'workspace-123',
        type: 'TASKS_COMPLETED',
        targetValue: 10,
        period: 'DAILY',
      };

      const mockGoal = createMockGoal({
        id: 'goal-123',
        userId: 'user-123',
        workspaceId: 'workspace-123',
        type: 'TASKS_COMPLETED',
        targetValue: 10,
        period: 'DAILY',
        isActive: true,
      });

      mockGoalRepo.create.mockResolvedValue(mockGoal);

      const result = await service.create(mockDb, params);

      expect(mockGoalRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          userId: 'user-123',
          workspaceId: 'workspace-123',
          type: 'TASKS_COMPLETED',
          targetValue: 10,
          period: 'DAILY',
          isActive: true,
        })
      );
      expect(result).toEqual(mockGoal);
    });

    it('should throw error when userId is missing', async () => {
      const params: CreateGoalParams = {
        userId: '',
        workspaceId: 'workspace-123',
        type: 'TASKS_COMPLETED',
        targetValue: 10,
        period: 'DAILY',
      };

      await expect(service.create(mockDb, params)).rejects.toThrow(ValidationError);
      await expect(service.create(mockDb, params)).rejects.toThrow('User ID is required');
    });

    it('should throw error when workspaceId is missing', async () => {
      const params: CreateGoalParams = {
        userId: 'user-123',
        workspaceId: '',
        type: 'TASKS_COMPLETED',
        targetValue: 10,
        period: 'DAILY',
      };

      await expect(service.create(mockDb, params)).rejects.toThrow('Workspace ID is required');
    });

    it('should throw error when type is missing', async () => {
      const params = {
        userId: 'user-123',
        workspaceId: 'workspace-123',
        type: '',
        targetValue: 10,
        period: 'DAILY',
      } as CreateGoalParams;

      await expect(service.create(mockDb, params)).rejects.toThrow('Goal type is required');
    });

    it('should throw error when period is missing', async () => {
      const params = {
        userId: 'user-123',
        workspaceId: 'workspace-123',
        type: 'TASKS_COMPLETED',
        targetValue: 10,
        period: '',
      } as CreateGoalParams;

      await expect(service.create(mockDb, params)).rejects.toThrow('Goal period is required');
    });

    it('should throw error when targetValue is 0', async () => {
      const params: CreateGoalParams = {
        userId: 'user-123',
        workspaceId: 'workspace-123',
        type: 'TASKS_COMPLETED',
        targetValue: 0,
        period: 'DAILY',
      };

      await expect(service.create(mockDb, params)).rejects.toThrow(
        'Target value must be greater than 0'
      );
    });

    it('should throw error when targetValue is negative', async () => {
      const params: CreateGoalParams = {
        userId: 'user-123',
        workspaceId: 'workspace-123',
        type: 'TASKS_COMPLETED',
        targetValue: -5,
        period: 'DAILY',
      };

      await expect(service.create(mockDb, params)).rejects.toThrow(
        'Target value must be greater than 0'
      );
    });

    it('should set isActive to true by default', async () => {
      const params: CreateGoalParams = {
        userId: 'user-123',
        workspaceId: 'workspace-123',
        type: 'FOCUS_MINUTES',
        targetValue: 120,
        period: 'WEEKLY',
      };

      mockGoalRepo.create.mockResolvedValue(createMockGoal());

      await service.create(mockDb, params);

      expect(mockGoalRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          isActive: true,
        })
      );
    });
  });

  describe('update', () => {
    it('should update a goal with valid parameters', async () => {
      const existingGoal = createMockGoal({ id: 'goal-123' });
      const updatedGoal = createMockGoal({
        id: 'goal-123',
        targetValue: 20,
      });

      mockGoalRepo.findById.mockResolvedValue(existingGoal);
      mockGoalRepo.update.mockResolvedValue(updatedGoal);

      const params: UpdateGoalParams = {
        targetValue: 20,
      };

      const result = await service.update(mockDb, 'goal-123', params);

      expect(mockGoalRepo.findById).toHaveBeenCalledWith(mockDb, 'goal-123');
      expect(mockGoalRepo.update).toHaveBeenCalledWith(
        mockDb,
        'goal-123',
        expect.objectContaining({
          targetValue: 20,
        })
      );
      expect(result).toEqual(updatedGoal);
    });

    it('should throw error when goal does not exist', async () => {
      mockGoalRepo.findById.mockResolvedValue(null);

      const params: UpdateGoalParams = {
        targetValue: 15,
      };

      await expect(service.update(mockDb, 'nonexistent', params)).rejects.toThrow('Goal not found');
    });

    it('should throw error when targetValue is 0', async () => {
      const existingGoal = createMockGoal({ id: 'goal-123' });
      mockGoalRepo.findById.mockResolvedValue(existingGoal);

      const params: UpdateGoalParams = {
        targetValue: 0,
      };

      await expect(service.update(mockDb, 'goal-123', params)).rejects.toThrow(
        'Target value must be greater than 0'
      );
    });

    it('should throw error when targetValue is negative', async () => {
      const existingGoal = createMockGoal({ id: 'goal-123' });
      mockGoalRepo.findById.mockResolvedValue(existingGoal);

      const params: UpdateGoalParams = {
        targetValue: -10,
      };

      await expect(service.update(mockDb, 'goal-123', params)).rejects.toThrow(
        'Target value must be greater than 0'
      );
    });

    it('should update isActive status', async () => {
      const existingGoal = createMockGoal({ id: 'goal-123', isActive: true });
      const updatedGoal = createMockGoal({ id: 'goal-123', isActive: false });

      mockGoalRepo.findById.mockResolvedValue(existingGoal);
      mockGoalRepo.update.mockResolvedValue(updatedGoal);

      const params: UpdateGoalParams = {
        isActive: false,
      };

      await service.update(mockDb, 'goal-123', params);

      expect(mockGoalRepo.update).toHaveBeenCalledWith(
        mockDb,
        'goal-123',
        expect.objectContaining({
          isActive: false,
        })
      );
    });

    it('should only update provided fields', async () => {
      const existingGoal = createMockGoal({ id: 'goal-123' });
      const updatedGoal = createMockGoal({
        id: 'goal-123',
        type: 'FOCUS_MINUTES',
      });

      mockGoalRepo.findById.mockResolvedValue(existingGoal);
      mockGoalRepo.update.mockResolvedValue(updatedGoal);

      const params: UpdateGoalParams = {
        type: 'FOCUS_MINUTES',
      };

      await service.update(mockDb, 'goal-123', params);

      expect(mockGoalRepo.update).toHaveBeenCalledWith(mockDb, 'goal-123', {
        type: 'FOCUS_MINUTES',
      });
    });
  });

  describe('delete', () => {
    it('should delete a goal (soft delete)', async () => {
      const mockGoal = createMockGoal({ id: 'goal-123' });
      mockGoalRepo.findById.mockResolvedValue(mockGoal);
      mockGoalRepo.delete.mockResolvedValue(undefined);

      await service.delete(mockDb, 'goal-123');

      expect(mockGoalRepo.findById).toHaveBeenCalledWith(mockDb, 'goal-123');
      expect(mockGoalRepo.delete).toHaveBeenCalledWith(mockDb, 'goal-123');
    });

    it('should throw error when goal does not exist', async () => {
      mockGoalRepo.findById.mockResolvedValue(null);

      await expect(service.delete(mockDb, 'nonexistent')).rejects.toThrow('Goal not found');
      expect(mockGoalRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('getProgress', () => {
    describe('TASKS_COMPLETED goal type', () => {
      it('should count completed tasks for DAILY period', async () => {
        const mockGoal = createMockGoal({
          id: 'goal-123',
          userId: 'user-123',
          type: 'TASKS_COMPLETED',
          targetValue: 5,
          period: 'DAILY',
        });

        const mockTasks = [
          { id: 'task-1', status: TaskStatus.COMPLETED, completedAt: '2026-02-12T10:00:00.000Z' },
          { id: 'task-2', status: TaskStatus.COMPLETED, completedAt: '2026-02-12T14:30:00.000Z' },
          { id: 'task-3', status: TaskStatus.IN_PROGRESS, completedAt: null },
          { id: 'task-4', status: TaskStatus.COMPLETED, completedAt: '2026-02-11T10:00:00.000Z' },
        ];

        mockGoalRepo.findById.mockResolvedValue(mockGoal);
        mockTaskRepo.findByUserId.mockResolvedValue(mockTasks);

        const result = await service.getProgress(
          mockDb,
          'user-123',
          'goal-123',
          '2026-02-12T12:00:00.000Z'
        );

        expect(result.current).toBe(2);
        expect(result.target).toBe(5);
        expect(result.percentage).toBe(40);
      });

      it('should count completed tasks for WEEKLY period', async () => {
        const mockGoal = createMockGoal({
          id: 'goal-123',
          userId: 'user-123',
          type: 'TASKS_COMPLETED',
          targetValue: 10,
          period: 'WEEKLY',
        });

        const mockTasks = [
          { id: 'task-1', status: TaskStatus.COMPLETED, completedAt: '2026-02-10T10:00:00.000Z' },
          { id: 'task-2', status: TaskStatus.COMPLETED, completedAt: '2026-02-11T14:30:00.000Z' },
          { id: 'task-3', status: TaskStatus.COMPLETED, completedAt: '2026-02-12T08:00:00.000Z' },
        ];

        mockGoalRepo.findById.mockResolvedValue(mockGoal);
        mockTaskRepo.findByUserId.mockResolvedValue(mockTasks);

        const result = await service.getProgress(
          mockDb,
          'user-123',
          'goal-123',
          '2026-02-12T12:00:00.000Z'
        );

        expect(result.current).toBe(3);
        expect(result.target).toBe(10);
        expect(result.percentage).toBe(30);
      });
    });

    describe('FOCUS_MINUTES goal type', () => {
      it('should sum time entry durations for DAILY period', async () => {
        const mockGoal = createMockGoal({
          id: 'goal-123',
          userId: 'user-123',
          type: 'FOCUS_MINUTES',
          targetValue: 120,
          period: 'DAILY',
        });

        const mockTimeEntries = [
          {
            id: 'entry-1',
            startedAt: '2026-02-12T09:00:00.000Z',
            endedAt: '2026-02-12T09:30:00.000Z',
          },
          {
            id: 'entry-2',
            startedAt: '2026-02-12T10:00:00.000Z',
            endedAt: '2026-02-12T11:00:00.000Z',
          },
          { id: 'entry-3', startedAt: '2026-02-12T14:00:00.000Z', endedAt: null },
        ];

        mockGoalRepo.findById.mockResolvedValue(mockGoal);
        mockTimeEntryRepo.findByDateRange.mockResolvedValue(mockTimeEntries);

        const result = await service.getProgress(
          mockDb,
          'user-123',
          'goal-123',
          '2026-02-12T12:00:00.000Z'
        );

        expect(result.current).toBe(90);
        expect(result.target).toBe(120);
        expect(result.percentage).toBe(75);
      });

      it('should sum time entry durations for WEEKLY period', async () => {
        const mockGoal = createMockGoal({
          id: 'goal-123',
          userId: 'user-123',
          type: 'FOCUS_MINUTES',
          targetValue: 600,
          period: 'WEEKLY',
        });

        const mockTimeEntries = [
          {
            id: 'entry-1',
            startedAt: '2026-02-10T09:00:00.000Z',
            endedAt: '2026-02-10T11:00:00.000Z',
          },
          {
            id: 'entry-2',
            startedAt: '2026-02-11T14:00:00.000Z',
            endedAt: '2026-02-11T15:30:00.000Z',
          },
          {
            id: 'entry-3',
            startedAt: '2026-02-12T10:00:00.000Z',
            endedAt: '2026-02-12T12:00:00.000Z',
          },
        ];

        mockGoalRepo.findById.mockResolvedValue(mockGoal);
        mockTimeEntryRepo.findByDateRange.mockResolvedValue(mockTimeEntries);

        const result = await service.getProgress(
          mockDb,
          'user-123',
          'goal-123',
          '2026-02-12T12:00:00.000Z'
        );

        expect(result.current).toBe(330);
        expect(result.target).toBe(600);
        expect(result.percentage).toBe(55);
      });
    });

    describe('POINTS_EARNED goal type', () => {
      it('should sum points for DAILY period', async () => {
        const mockGoal = createMockGoal({
          id: 'goal-123',
          userId: 'user-123',
          type: 'POINTS_EARNED',
          targetValue: 100,
          period: 'DAILY',
        });

        const mockPointsEntries = [
          { id: 'points-1', userId: 'user-123', points: 20, createdAt: '2026-02-12T09:00:00.000Z' },
          { id: 'points-2', userId: 'user-123', points: 35, createdAt: '2026-02-12T14:00:00.000Z' },
          { id: 'points-3', userId: 'user-123', points: 50, createdAt: '2026-02-11T10:00:00.000Z' },
        ];

        mockGoalRepo.findById.mockResolvedValue(mockGoal);
        mockPointsLedgerRepo.findByUser.mockResolvedValue(mockPointsEntries);

        const result = await service.getProgress(
          mockDb,
          'user-123',
          'goal-123',
          '2026-02-12T12:00:00.000Z'
        );

        expect(result.current).toBe(55);
        expect(result.target).toBe(100);
        expect(result.percentage).toBe(55);
      });

      it('should sum points for WEEKLY period', async () => {
        const mockGoal = createMockGoal({
          id: 'goal-123',
          userId: 'user-123',
          type: 'POINTS_EARNED',
          targetValue: 500,
          period: 'WEEKLY',
        });

        const mockPointsEntries = [
          {
            id: 'points-1',
            userId: 'user-123',
            points: 100,
            createdAt: '2026-02-10T09:00:00.000Z',
          },
          {
            id: 'points-2',
            userId: 'user-123',
            points: 150,
            createdAt: '2026-02-11T14:00:00.000Z',
          },
          { id: 'points-3', userId: 'user-123', points: 80, createdAt: '2026-02-12T10:00:00.000Z' },
        ];

        mockGoalRepo.findById.mockResolvedValue(mockGoal);
        mockPointsLedgerRepo.findByUser.mockResolvedValue(mockPointsEntries);

        const result = await service.getProgress(
          mockDb,
          'user-123',
          'goal-123',
          '2026-02-12T12:00:00.000Z'
        );

        expect(result.current).toBe(330);
        expect(result.target).toBe(500);
        expect(result.percentage).toBe(66);
      });
    });

    describe('CUSTOM goal type', () => {
      it('should return 0 current progress for CUSTOM goals', async () => {
        const mockGoal = createMockGoal({
          id: 'goal-123',
          userId: 'user-123',
          type: 'CUSTOM',
          targetValue: 50,
          period: 'DAILY',
        });

        mockGoalRepo.findById.mockResolvedValue(mockGoal);

        const result = await service.getProgress(mockDb, 'user-123', 'goal-123');

        expect(result.current).toBe(0);
        expect(result.target).toBe(50);
        expect(result.percentage).toBe(0);
      });
    });

    it('should round percentage to nearest integer', async () => {
      const mockGoal = createMockGoal({
        id: 'goal-123',
        userId: 'user-123',
        type: 'TASKS_COMPLETED',
        targetValue: 3,
        period: 'DAILY',
      });

      const mockTasks = [
        { id: 'task-1', status: TaskStatus.COMPLETED, completedAt: '2026-02-12T10:00:00.000Z' },
      ];

      mockGoalRepo.findById.mockResolvedValue(mockGoal);
      mockTaskRepo.findByUserId.mockResolvedValue(mockTasks);

      const result = await service.getProgress(
        mockDb,
        'user-123',
        'goal-123',
        '2026-02-12T12:00:00.000Z'
      );

      expect(result.current).toBe(1);
      expect(result.target).toBe(3);
      expect(result.percentage).toBe(33);
    });

    it('should throw error when goal does not exist', async () => {
      mockGoalRepo.findById.mockResolvedValue(null);

      await expect(service.getProgress(mockDb, 'user-123', 'nonexistent')).rejects.toThrow(
        'Goal not found'
      );
    });

    it('should throw error when goal does not belong to user', async () => {
      const mockGoal = createMockGoal({
        id: 'goal-123',
        userId: 'user-456',
      });

      mockGoalRepo.findById.mockResolvedValue(mockGoal);

      await expect(service.getProgress(mockDb, 'user-123', 'goal-123')).rejects.toThrow(
        'Goal does not belong to this user'
      );
    });
  });

  describe('getAllGoalStatuses', () => {
    it('should return progress for all active goals', async () => {
      const mockGoals = [
        createMockGoal({
          id: 'goal-1',
          userId: 'user-123',
          type: 'TASKS_COMPLETED',
          targetValue: 5,
          period: 'DAILY',
          isActive: true,
        }),
        createMockGoal({
          id: 'goal-2',
          userId: 'user-123',
          type: 'FOCUS_MINUTES',
          targetValue: 120,
          period: 'DAILY',
          isActive: true,
        }),
      ];

      const mockTasks = [
        { id: 'task-1', status: TaskStatus.COMPLETED, completedAt: '2026-02-12T10:00:00.000Z' },
        { id: 'task-2', status: TaskStatus.COMPLETED, completedAt: '2026-02-12T14:30:00.000Z' },
      ];

      const mockTimeEntries = [
        {
          id: 'entry-1',
          startedAt: '2026-02-12T09:00:00.000Z',
          endedAt: '2026-02-12T09:30:00.000Z',
        },
      ];

      mockGoalRepo.findByUser.mockResolvedValue(mockGoals);
      mockTaskRepo.findByUserId.mockResolvedValue(mockTasks);
      mockTimeEntryRepo.findByDateRange.mockResolvedValue(mockTimeEntries);

      const result = await service.getAllGoalStatuses(
        mockDb,
        'user-123',
        '2026-02-12T12:00:00.000Z'
      );

      expect(result).toHaveLength(2);
      expect(result[0].goal.id).toBe('goal-1');
      expect(result[0].current).toBe(2);
      expect(result[0].target).toBe(5);
      expect(result[0].percentage).toBe(40);
      expect(result[1].goal.id).toBe('goal-2');
      expect(result[1].current).toBe(30);
      expect(result[1].target).toBe(120);
      expect(result[1].percentage).toBe(25);
    });

    it('should filter out inactive goals', async () => {
      const mockGoals = [
        createMockGoal({
          id: 'goal-1',
          userId: 'user-123',
          type: 'TASKS_COMPLETED',
          targetValue: 5,
          period: 'DAILY',
          isActive: true,
        }),
        createMockGoal({
          id: 'goal-2',
          userId: 'user-123',
          type: 'FOCUS_MINUTES',
          targetValue: 120,
          period: 'DAILY',
          isActive: false,
        }),
      ];

      const mockTasks = [
        { id: 'task-1', status: TaskStatus.COMPLETED, completedAt: '2026-02-12T10:00:00.000Z' },
      ];

      mockGoalRepo.findByUser.mockResolvedValue(mockGoals);
      mockTaskRepo.findByUserId.mockResolvedValue(mockTasks);

      const result = await service.getAllGoalStatuses(
        mockDb,
        'user-123',
        '2026-02-12T12:00:00.000Z'
      );

      expect(result).toHaveLength(1);
      expect(result[0].goal.id).toBe('goal-1');
      expect(result[0].goal.isActive).toBe(true);
    });

    it('should return empty array when user has no active goals', async () => {
      mockGoalRepo.findByUser.mockResolvedValue([]);

      const result = await service.getAllGoalStatuses(mockDb, 'user-123');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
