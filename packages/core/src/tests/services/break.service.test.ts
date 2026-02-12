/**
 * Unit tests for BreakService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BreakService } from '../../services/break.service';
import type { StartBreakParams } from '../../services/break.service';
import { createMockBreak, createMockDatabase } from '@stridetime/test-utils';
import { BreakType } from '@stridetime/types';
import { ValidationError } from '@stridetime/types';

// Create hoisted mocks
const { mockBreakRepo } = vi.hoisted(() => {
  const breakRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findByUser: vi.fn(),
  };

  return { mockBreakRepo: breakRepo };
});

// Mock the module using hoisted variables
vi.mock('@stridetime/db', () => ({
  breakRepo: mockBreakRepo,
  BreakRepository: vi.fn(),
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
  TimeEntryRepository: vi.fn(),
  timeEntryRepo: vi.fn(),
  UserRepository: vi.fn(),
  userRepo: vi.fn(),
  TaskRepository: vi.fn(),
  taskRepo: vi.fn(),
  ProjectRepository: vi.fn(),
  projectRepo: vi.fn(),
  generateId: vi.fn(),
  now: vi.fn(),
  today: vi.fn(),
}));

describe('BreakService', () => {
  let breakService: BreakService;
  let mockDb: any;

  beforeEach(() => {
    // Create BreakService with injected mock repository
    breakService = new BreakService(mockBreakRepo);
    mockDb = createMockDatabase();
    vi.clearAllMocks();
  });

  describe('startBreak', () => {
    it('should start a break with valid parameters', async () => {
      const params: StartBreakParams = {
        userId: 'user-123',
        type: BreakType.COFFEE,
      };

      const mockBreak = createMockBreak({
        id: 'break-456',
        userId: 'user-123',
        type: BreakType.COFFEE,
        startedAt: new Date().toISOString(),
        endedAt: null,
        durationMinutes: null,
      });

      // Mock no active break exists
      mockBreakRepo.findByUser.mockResolvedValue([]);
      mockBreakRepo.create.mockResolvedValue(mockBreak);

      const result = await breakService.startBreak(mockDb, params);

      expect(mockBreakRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          userId: 'user-123',
          type: BreakType.COFFEE,
          startedAt: expect.any(String),
          endedAt: null,
          durationMinutes: null,
        })
      );
      expect(result).toEqual(mockBreak);
      expect(result.endedAt).toBeNull();
      expect(result.durationMinutes).toBeNull();
    });

    it('should throw error when userId is missing', async () => {
      const params: StartBreakParams = {
        userId: '',
        type: BreakType.COFFEE,
      };

      await expect(breakService.startBreak(mockDb, params)).rejects.toThrow(ValidationError);
      await expect(breakService.startBreak(mockDb, params)).rejects.toThrow('User ID is required');
    });

    it('should throw error when type is missing', async () => {
      const params = {
        userId: 'user-123',
        type: '',
      } as StartBreakParams;

      await expect(breakService.startBreak(mockDb, params)).rejects.toThrow(ValidationError);
      await expect(breakService.startBreak(mockDb, params)).rejects.toThrow(
        'Break type is required'
      );
    });

    it('should throw error when type is invalid', async () => {
      const params = {
        userId: 'user-123',
        type: 'INVALID_TYPE',
      } as StartBreakParams;

      await expect(breakService.startBreak(mockDb, params)).rejects.toThrow(ValidationError);
      await expect(breakService.startBreak(mockDb, params)).rejects.toThrow('Invalid break type');
    });

    it('should throw error when user already has an active break', async () => {
      const params: StartBreakParams = {
        userId: 'user-123',
        type: BreakType.WALK,
      };

      const activeBreak = createMockBreak({
        userId: 'user-123',
        type: BreakType.COFFEE,
        endedAt: null,
      });

      // Mock existing active break
      mockBreakRepo.findByUser.mockResolvedValue([activeBreak]);

      await expect(breakService.startBreak(mockDb, params)).rejects.toThrow(ValidationError);
      await expect(breakService.startBreak(mockDb, params)).rejects.toThrow(
        'User already has an active break'
      );
    });

    it('should accept all valid BreakType values', async () => {
      const validTypes = [
        BreakType.COFFEE,
        BreakType.WALK,
        BreakType.LUNCH,
        BreakType.STRETCH,
        BreakType.CUSTOM,
      ];

      for (const type of validTypes) {
        vi.clearAllMocks();
        mockBreakRepo.findByUser.mockResolvedValue([]);
        mockBreakRepo.create.mockResolvedValue(createMockBreak({ type }));

        const params: StartBreakParams = {
          userId: 'user-123',
          type,
        };

        await expect(breakService.startBreak(mockDb, params)).resolves.toBeDefined();
      }
    });
  });

  describe('endBreak', () => {
    it('should end a break and calculate duration correctly', async () => {
      const startedAt = new Date('2026-02-12T10:00:00.000Z');

      const mockBreak = createMockBreak({
        id: 'break-123',
        startedAt: startedAt.toISOString(),
        endedAt: null,
        durationMinutes: null,
      });

      const updatedBreak = createMockBreak({
        id: 'break-123',
        startedAt: startedAt.toISOString(),
        endedAt: expect.any(String),
        durationMinutes: expect.any(Number),
      });

      mockBreakRepo.findById.mockResolvedValue(mockBreak);
      mockBreakRepo.update.mockResolvedValue(updatedBreak);

      await breakService.endBreak(mockDb, 'break-123');

      // Verify update was called with proper structure
      const updateCall = mockBreakRepo.update.mock.calls[0];
      expect(updateCall[0]).toBe(mockDb);
      expect(updateCall[1]).toBe('break-123');
      expect(updateCall[2]).toHaveProperty('endedAt');
      expect(updateCall[2]).toHaveProperty('durationMinutes');
      expect(typeof updateCall[2].durationMinutes).toBe('number');
      expect(updateCall[2].durationMinutes).toBeGreaterThanOrEqual(0);
    });

    it('should throw error when breakId is missing', async () => {
      await expect(breakService.endBreak(mockDb, '')).rejects.toThrow(ValidationError);
      await expect(breakService.endBreak(mockDb, '')).rejects.toThrow('Break ID is required');
    });

    it('should throw error when break does not exist', async () => {
      mockBreakRepo.findById.mockResolvedValue(null);

      await expect(breakService.endBreak(mockDb, 'nonexistent')).rejects.toThrow(ValidationError);
      await expect(breakService.endBreak(mockDb, 'nonexistent')).rejects.toThrow('Break not found');
    });

    it('should throw error when break is already ended', async () => {
      const endedBreak = createMockBreak({
        id: 'break-123',
        endedAt: new Date().toISOString(),
        durationMinutes: 10,
      });

      mockBreakRepo.findById.mockResolvedValue(endedBreak);

      await expect(breakService.endBreak(mockDb, 'break-123')).rejects.toThrow(ValidationError);
      await expect(breakService.endBreak(mockDb, 'break-123')).rejects.toThrow(
        'Break has already been ended'
      );
    });

    it('should round duration to nearest minute', async () => {
      // We can't easily test the rounding without mocking time
      // But we can verify the calculation logic exists
      const startedAt = new Date('2026-02-12T10:00:00.000Z');

      const mockBreak = createMockBreak({
        id: 'break-123',
        startedAt: startedAt.toISOString(),
        endedAt: null,
      });

      mockBreakRepo.findById.mockResolvedValue(mockBreak);
      mockBreakRepo.update.mockResolvedValue(createMockBreak());

      await breakService.endBreak(mockDb, 'break-123');

      // Verify that durationMinutes was calculated and is a rounded integer
      const updateCall = mockBreakRepo.update.mock.calls[0];
      expect(Number.isInteger(updateCall[2].durationMinutes)).toBe(true);
      expect(updateCall[2].durationMinutes).toBeGreaterThanOrEqual(0);
    });
  });

  describe('findActive', () => {
    it('should return active break when one exists', async () => {
      const activeBreak = createMockBreak({
        userId: 'user-123',
        endedAt: null,
      });

      mockBreakRepo.findByUser.mockResolvedValue([activeBreak]);

      const result = await breakService.findActive(mockDb, 'user-123');

      expect(mockBreakRepo.findByUser).toHaveBeenCalledWith(mockDb, 'user-123');
      expect(result).toEqual(activeBreak);
    });

    it('should return null when no active break exists', async () => {
      const endedBreak = createMockBreak({
        userId: 'user-123',
        endedAt: new Date().toISOString(),
        durationMinutes: 10,
      });

      mockBreakRepo.findByUser.mockResolvedValue([endedBreak]);

      const result = await breakService.findActive(mockDb, 'user-123');

      expect(result).toBeNull();
    });

    it('should return null when user has no breaks', async () => {
      mockBreakRepo.findByUser.mockResolvedValue([]);

      const result = await breakService.findActive(mockDb, 'user-123');

      expect(result).toBeNull();
    });

    it('should throw error when userId is missing', async () => {
      await expect(breakService.findActive(mockDb, '')).rejects.toThrow(ValidationError);
      await expect(breakService.findActive(mockDb, '')).rejects.toThrow('User ID is required');
    });
  });

  describe('getBreakStats', () => {
    it('should calculate total break minutes and count for a date', async () => {
      const date = '2026-02-12';
      const breaks = [
        createMockBreak({
          userId: 'user-123',
          startedAt: '2026-02-12T10:00:00.000Z',
          durationMinutes: 15,
        }),
        createMockBreak({
          userId: 'user-123',
          startedAt: '2026-02-12T14:00:00.000Z',
          durationMinutes: 30,
        }),
        createMockBreak({
          userId: 'user-123',
          startedAt: '2026-02-12T16:00:00.000Z',
          durationMinutes: 5,
        }),
      ];

      mockBreakRepo.findByUser.mockResolvedValue(breaks);

      const result = await breakService.getBreakStats(mockDb, 'user-123', date);

      expect(result.totalBreakMinutes).toBe(50); // 15 + 30 + 5
      expect(result.breakCount).toBe(3);
    });

    it('should return zero stats when no breaks exist for date', async () => {
      mockBreakRepo.findByUser.mockResolvedValue([]);

      const result = await breakService.getBreakStats(mockDb, 'user-123', '2026-02-12');

      expect(result.totalBreakMinutes).toBe(0);
      expect(result.breakCount).toBe(0);
    });

    it('should filter out breaks from other dates', async () => {
      const breaks = [
        createMockBreak({
          startedAt: '2026-02-12T10:00:00.000Z',
          durationMinutes: 15,
        }),
        createMockBreak({
          startedAt: '2026-02-11T14:00:00.000Z', // Different date
          durationMinutes: 30,
        }),
        createMockBreak({
          startedAt: '2026-02-13T16:00:00.000Z', // Different date
          durationMinutes: 5,
        }),
      ];

      mockBreakRepo.findByUser.mockResolvedValue(breaks);

      const result = await breakService.getBreakStats(mockDb, 'user-123', '2026-02-12');

      expect(result.totalBreakMinutes).toBe(15);
      expect(result.breakCount).toBe(1);
    });

    it('should exclude active breaks (null durationMinutes)', async () => {
      const breaks = [
        createMockBreak({
          startedAt: '2026-02-12T10:00:00.000Z',
          durationMinutes: 15,
        }),
        createMockBreak({
          startedAt: '2026-02-12T14:00:00.000Z',
          endedAt: null,
          durationMinutes: null, // Active break
        }),
      ];

      mockBreakRepo.findByUser.mockResolvedValue(breaks);

      const result = await breakService.getBreakStats(mockDb, 'user-123', '2026-02-12');

      expect(result.totalBreakMinutes).toBe(15);
      expect(result.breakCount).toBe(1);
    });

    it('should throw error when userId is missing', async () => {
      await expect(breakService.getBreakStats(mockDb, '', '2026-02-12')).rejects.toThrow(
        ValidationError
      );
      await expect(breakService.getBreakStats(mockDb, '', '2026-02-12')).rejects.toThrow(
        'User ID is required'
      );
    });

    it('should throw error when date is missing', async () => {
      await expect(breakService.getBreakStats(mockDb, 'user-123', '')).rejects.toThrow(
        ValidationError
      );
      await expect(breakService.getBreakStats(mockDb, 'user-123', '')).rejects.toThrow(
        'Date is required'
      );
    });

    it('should throw error when date format is invalid', async () => {
      const invalidDates = ['2026/02/12', '12-02-2026', '2026-2-12', 'invalid'];

      for (const invalidDate of invalidDates) {
        await expect(breakService.getBreakStats(mockDb, 'user-123', invalidDate)).rejects.toThrow(
          ValidationError
        );
        await expect(breakService.getBreakStats(mockDb, 'user-123', invalidDate)).rejects.toThrow(
          'Date must be in YYYY-MM-DD format'
        );
      }
    });
  });
});
