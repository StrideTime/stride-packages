/**
 * Unit tests for WorkSessionService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkSessionService } from '../../services/work-session.service';
import type { ClockInParams } from '../../services/work-session.service';
import { createMockWorkSession, createMockDatabase } from '@stridetime/test-utils';
import { WorkSessionStatus, ValidationError } from '@stridetime/types';

// Create hoisted mocks
const { mockWorkSessionRepo } = vi.hoisted(() => {
  const workSessionRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findByUser: vi.fn(),
    findByWorkspace: vi.fn(),
    findByDate: vi.fn(),
  };

  return { mockWorkSessionRepo: workSessionRepo };
});

// Mock the module using hoisted variables
vi.mock('@stridetime/db', () => ({
  workSessionRepo: mockWorkSessionRepo,
  WorkSessionRepository: vi.fn(),
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

describe('WorkSessionService', () => {
  let workSessionService: WorkSessionService;
  let mockDb: any;

  beforeEach(() => {
    // Create WorkSessionService with injected mock repository
    workSessionService = new WorkSessionService(mockWorkSessionRepo);
    mockDb = createMockDatabase();
    vi.clearAllMocks();
  });

  describe('clockIn', () => {
    it('should create a work session with status=ACTIVE, clockedInAt=now(), clockedOutAt=null, totals=0', async () => {
      const params: ClockInParams = {
        userId: 'user-123',
        workspaceId: 'workspace-123',
      };

      const mockSession = createMockWorkSession({
        id: 'session-123',
        userId: 'user-123',
        workspaceId: 'workspace-123',
        status: WorkSessionStatus.ACTIVE,
        clockedOutAt: null,
        totalFocusMinutes: 0,
        totalBreakMinutes: 0,
      });

      // No active session exists
      mockWorkSessionRepo.findByUser.mockResolvedValue([]);
      mockWorkSessionRepo.create.mockResolvedValue(mockSession);

      const result = await workSessionService.clockIn(mockDb, params);

      expect(mockWorkSessionRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          userId: 'user-123',
          workspaceId: 'workspace-123',
          status: WorkSessionStatus.ACTIVE,
          clockedInAt: expect.any(String),
          clockedOutAt: null,
          totalFocusMinutes: 0,
          totalBreakMinutes: 0,
          date: expect.any(String),
        })
      );
      expect(result).toEqual(mockSession);
    });

    it('should set date to today in YYYY-MM-DD format', async () => {
      const params: ClockInParams = {
        userId: 'user-123',
        workspaceId: 'workspace-123',
      };

      mockWorkSessionRepo.findByUser.mockResolvedValue([]);
      mockWorkSessionRepo.create.mockResolvedValue(createMockWorkSession());

      await workSessionService.clockIn(mockDb, params);

      const today = new Date().toISOString().split('T')[0];
      expect(mockWorkSessionRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          date: today,
        })
      );
    });

    it('should throw error when userId is missing', async () => {
      const params: ClockInParams = {
        userId: '',
        workspaceId: 'workspace-123',
      };

      await expect(workSessionService.clockIn(mockDb, params)).rejects.toThrow(ValidationError);
      await expect(workSessionService.clockIn(mockDb, params)).rejects.toThrow(
        'User ID is required'
      );
    });

    it('should throw error when workspaceId is missing', async () => {
      const params: ClockInParams = {
        userId: 'user-123',
        workspaceId: '',
      };

      await expect(workSessionService.clockIn(mockDb, params)).rejects.toThrow(ValidationError);
      await expect(workSessionService.clockIn(mockDb, params)).rejects.toThrow(
        'Workspace ID is required'
      );
    });

    it('should prevent duplicate active sessions', async () => {
      const params: ClockInParams = {
        userId: 'user-123',
        workspaceId: 'workspace-123',
      };

      // Mock existing active session
      const activeSession = createMockWorkSession({
        userId: 'user-123',
        status: WorkSessionStatus.ACTIVE,
      });

      mockWorkSessionRepo.findByUser.mockResolvedValue([activeSession]);

      await expect(workSessionService.clockIn(mockDb, params)).rejects.toThrow(
        'User already has an active work session'
      );
      expect(mockWorkSessionRepo.create).not.toHaveBeenCalled();
    });

    it('should prevent clock in when user has a paused session', async () => {
      const params: ClockInParams = {
        userId: 'user-123',
        workspaceId: 'workspace-123',
      };

      // Mock existing paused session
      const pausedSession = createMockWorkSession({
        userId: 'user-123',
        status: WorkSessionStatus.PAUSED,
      });

      mockWorkSessionRepo.findByUser.mockResolvedValue([pausedSession]);

      await expect(workSessionService.clockIn(mockDb, params)).rejects.toThrow(
        'User already has an active work session'
      );
    });
  });

  describe('clockOut', () => {
    it('should set status=COMPLETED and clockedOutAt=now()', async () => {
      const mockSession = createMockWorkSession({
        id: 'session-123',
        status: WorkSessionStatus.ACTIVE,
      });

      const completedSession = createMockWorkSession({
        id: 'session-123',
        status: WorkSessionStatus.COMPLETED,
        clockedOutAt: new Date().toISOString(),
      });

      mockWorkSessionRepo.findById.mockResolvedValue(mockSession);
      mockWorkSessionRepo.update.mockResolvedValue(completedSession);

      const result = await workSessionService.clockOut(mockDb, 'session-123');

      expect(mockWorkSessionRepo.update).toHaveBeenCalledWith(
        mockDb,
        'session-123',
        expect.objectContaining({
          status: WorkSessionStatus.COMPLETED,
          clockedOutAt: expect.any(String),
        })
      );
      expect(result.status).toBe(WorkSessionStatus.COMPLETED);
      expect(result.clockedOutAt).toBeTruthy();
    });

    it('should throw error when session does not exist', async () => {
      mockWorkSessionRepo.findById.mockResolvedValue(null);

      await expect(workSessionService.clockOut(mockDb, 'nonexistent')).rejects.toThrow(
        ValidationError
      );
      await expect(workSessionService.clockOut(mockDb, 'nonexistent')).rejects.toThrow(
        'Work session not found'
      );
    });

    it('should throw error when session is already completed', async () => {
      const completedSession = createMockWorkSession({
        id: 'session-123',
        status: WorkSessionStatus.COMPLETED,
        clockedOutAt: new Date().toISOString(),
      });

      mockWorkSessionRepo.findById.mockResolvedValue(completedSession);

      await expect(workSessionService.clockOut(mockDb, 'session-123')).rejects.toThrow(
        'Work session is already completed'
      );
      expect(mockWorkSessionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('should set status=PAUSED when session is ACTIVE', async () => {
      const activeSession = createMockWorkSession({
        id: 'session-123',
        status: WorkSessionStatus.ACTIVE,
      });

      const pausedSession = createMockWorkSession({
        id: 'session-123',
        status: WorkSessionStatus.PAUSED,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(activeSession);
      mockWorkSessionRepo.update.mockResolvedValue(pausedSession);

      const result = await workSessionService.pause(mockDb, 'session-123');

      expect(mockWorkSessionRepo.update).toHaveBeenCalledWith(
        mockDb,
        'session-123',
        expect.objectContaining({
          status: WorkSessionStatus.PAUSED,
        })
      );
      expect(result.status).toBe(WorkSessionStatus.PAUSED);
    });

    it('should throw error when session does not exist', async () => {
      mockWorkSessionRepo.findById.mockResolvedValue(null);

      await expect(workSessionService.pause(mockDb, 'nonexistent')).rejects.toThrow(
        'Work session not found'
      );
    });

    it('should throw error when trying to pause an already PAUSED session', async () => {
      const pausedSession = createMockWorkSession({
        id: 'session-123',
        status: WorkSessionStatus.PAUSED,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(pausedSession);

      await expect(workSessionService.pause(mockDb, 'session-123')).rejects.toThrow(
        'Work session is already paused'
      );
      expect(mockWorkSessionRepo.update).not.toHaveBeenCalled();
    });

    it('should throw error when trying to pause a COMPLETED session', async () => {
      const completedSession = createMockWorkSession({
        id: 'session-123',
        status: WorkSessionStatus.COMPLETED,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(completedSession);

      await expect(workSessionService.pause(mockDb, 'session-123')).rejects.toThrow(
        'Cannot pause a completed work session'
      );
      expect(mockWorkSessionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('resume', () => {
    it('should set status=ACTIVE when session is PAUSED', async () => {
      const pausedSession = createMockWorkSession({
        id: 'session-123',
        status: WorkSessionStatus.PAUSED,
      });

      const activeSession = createMockWorkSession({
        id: 'session-123',
        status: WorkSessionStatus.ACTIVE,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(pausedSession);
      mockWorkSessionRepo.update.mockResolvedValue(activeSession);

      const result = await workSessionService.resume(mockDb, 'session-123');

      expect(mockWorkSessionRepo.update).toHaveBeenCalledWith(
        mockDb,
        'session-123',
        expect.objectContaining({
          status: WorkSessionStatus.ACTIVE,
        })
      );
      expect(result.status).toBe(WorkSessionStatus.ACTIVE);
    });

    it('should throw error when session does not exist', async () => {
      mockWorkSessionRepo.findById.mockResolvedValue(null);

      await expect(workSessionService.resume(mockDb, 'nonexistent')).rejects.toThrow(
        'Work session not found'
      );
    });

    it('should throw error when trying to resume an ACTIVE session', async () => {
      const activeSession = createMockWorkSession({
        id: 'session-123',
        status: WorkSessionStatus.ACTIVE,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(activeSession);

      await expect(workSessionService.resume(mockDb, 'session-123')).rejects.toThrow(
        'Work session is already active'
      );
      expect(mockWorkSessionRepo.update).not.toHaveBeenCalled();
    });

    it('should throw error when trying to resume a COMPLETED session', async () => {
      const completedSession = createMockWorkSession({
        id: 'session-123',
        status: WorkSessionStatus.COMPLETED,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(completedSession);

      await expect(workSessionService.resume(mockDb, 'session-123')).rejects.toThrow(
        'Cannot resume a completed work session'
      );
      expect(mockWorkSessionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('findActive', () => {
    it('should return session where status=ACTIVE', async () => {
      const activeSession = createMockWorkSession({
        userId: 'user-123',
        status: WorkSessionStatus.ACTIVE,
      });

      const completedSession = createMockWorkSession({
        userId: 'user-123',
        status: WorkSessionStatus.COMPLETED,
      });

      mockWorkSessionRepo.findByUser.mockResolvedValue([completedSession, activeSession]);

      const result = await workSessionService.findActive(mockDb, 'user-123');

      expect(result).toEqual(activeSession);
    });

    it('should return session where status=PAUSED', async () => {
      const pausedSession = createMockWorkSession({
        userId: 'user-123',
        status: WorkSessionStatus.PAUSED,
      });

      const completedSession = createMockWorkSession({
        userId: 'user-123',
        status: WorkSessionStatus.COMPLETED,
      });

      mockWorkSessionRepo.findByUser.mockResolvedValue([completedSession, pausedSession]);

      const result = await workSessionService.findActive(mockDb, 'user-123');

      expect(result).toEqual(pausedSession);
    });

    it('should return null when no active or paused session exists', async () => {
      const completedSession1 = createMockWorkSession({
        userId: 'user-123',
        status: WorkSessionStatus.COMPLETED,
      });

      const completedSession2 = createMockWorkSession({
        userId: 'user-123',
        status: WorkSessionStatus.COMPLETED,
      });

      mockWorkSessionRepo.findByUser.mockResolvedValue([completedSession1, completedSession2]);

      const result = await workSessionService.findActive(mockDb, 'user-123');

      expect(result).toBeNull();
    });

    it('should return null when user has no sessions', async () => {
      mockWorkSessionRepo.findByUser.mockResolvedValue([]);

      const result = await workSessionService.findActive(mockDb, 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('getDaySession', () => {
    it('should return session for specific date in YYYY-MM-DD format', async () => {
      const session1 = createMockWorkSession({
        userId: 'user-123',
        date: '2026-02-12',
      });

      const session2 = createMockWorkSession({
        userId: 'user-123',
        date: '2026-02-11',
      });

      mockWorkSessionRepo.findByUser.mockResolvedValue([session1, session2]);

      const result = await workSessionService.getDaySession(mockDb, 'user-123', '2026-02-12');

      expect(result).toEqual(session1);
    });

    it('should return null when no session exists for date', async () => {
      const session = createMockWorkSession({
        userId: 'user-123',
        date: '2026-02-11',
      });

      mockWorkSessionRepo.findByUser.mockResolvedValue([session]);

      const result = await workSessionService.getDaySession(mockDb, 'user-123', '2026-02-12');

      expect(result).toBeNull();
    });

    it('should return null when user has no sessions', async () => {
      mockWorkSessionRepo.findByUser.mockResolvedValue([]);

      const result = await workSessionService.getDaySession(mockDb, 'user-123', '2026-02-12');

      expect(result).toBeNull();
    });
  });

  describe('state machine validation', () => {
    it('should allow state transition: ACTIVE → PAUSED', async () => {
      const activeSession = createMockWorkSession({
        status: WorkSessionStatus.ACTIVE,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(activeSession);
      mockWorkSessionRepo.update.mockResolvedValue(
        createMockWorkSession({ status: WorkSessionStatus.PAUSED })
      );

      await expect(workSessionService.pause(mockDb, 'session-123')).resolves.toBeDefined();
    });

    it('should allow state transition: PAUSED → ACTIVE', async () => {
      const pausedSession = createMockWorkSession({
        status: WorkSessionStatus.PAUSED,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(pausedSession);
      mockWorkSessionRepo.update.mockResolvedValue(
        createMockWorkSession({ status: WorkSessionStatus.ACTIVE })
      );

      await expect(workSessionService.resume(mockDb, 'session-123')).resolves.toBeDefined();
    });

    it('should allow state transition: ACTIVE → COMPLETED', async () => {
      const activeSession = createMockWorkSession({
        status: WorkSessionStatus.ACTIVE,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(activeSession);
      mockWorkSessionRepo.update.mockResolvedValue(
        createMockWorkSession({ status: WorkSessionStatus.COMPLETED })
      );

      await expect(workSessionService.clockOut(mockDb, 'session-123')).resolves.toBeDefined();
    });

    it('should reject invalid state transition: PAUSED → PAUSED', async () => {
      const pausedSession = createMockWorkSession({
        status: WorkSessionStatus.PAUSED,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(pausedSession);

      await expect(workSessionService.pause(mockDb, 'session-123')).rejects.toThrow(
        'Work session is already paused'
      );
    });

    it('should reject invalid state transition: ACTIVE → ACTIVE', async () => {
      const activeSession = createMockWorkSession({
        status: WorkSessionStatus.ACTIVE,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(activeSession);

      await expect(workSessionService.resume(mockDb, 'session-123')).rejects.toThrow(
        'Work session is already active'
      );
    });

    it('should reject invalid state transition: COMPLETED → PAUSED', async () => {
      const completedSession = createMockWorkSession({
        status: WorkSessionStatus.COMPLETED,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(completedSession);

      await expect(workSessionService.pause(mockDb, 'session-123')).rejects.toThrow(
        'Cannot pause a completed work session'
      );
    });

    it('should reject invalid state transition: COMPLETED → ACTIVE', async () => {
      const completedSession = createMockWorkSession({
        status: WorkSessionStatus.COMPLETED,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(completedSession);

      await expect(workSessionService.resume(mockDb, 'session-123')).rejects.toThrow(
        'Cannot resume a completed work session'
      );
    });

    it('should reject invalid state transition: COMPLETED → COMPLETED', async () => {
      const completedSession = createMockWorkSession({
        status: WorkSessionStatus.COMPLETED,
      });

      mockWorkSessionRepo.findById.mockResolvedValue(completedSession);

      await expect(workSessionService.clockOut(mockDb, 'session-123')).rejects.toThrow(
        'Work session is already completed'
      );
    });
  });
});
