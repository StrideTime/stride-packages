import {
  workSessionRepo as defaultWorkSessionRepo,
  type WorkSessionRepository,
  type StrideDatabase,
} from '@stridetime/db';
import type { WorkSession, CreateWorkSessionInput } from '@stridetime/types';
import { WorkSessionStatus, ValidationError } from '@stridetime/types';
import { sanitizeFields } from '../utils/sanitize';

/**
 * Parameters for clocking in
 */
export type ClockInParams = {
  userId: string;
  workspaceId: string;
};

/**
 * Work Session Service for business logic
 */
export class WorkSessionService {
  constructor(private workSessionRepo: WorkSessionRepository = defaultWorkSessionRepo) {}

  /**
   * Clock in - creates a new active work session
   */
  async clockIn(db: StrideDatabase, params: ClockInParams): Promise<WorkSession> {
    // Sanitize inputs
    const sanitized = sanitizeFields(params);

    // Validate parameters
    this.validateClockIn(sanitized);

    // Check if user already has an active session
    const activeSession = await this.findActive(db, sanitized.userId);
    if (activeSession) {
      throw new ValidationError('userId', 'User already has an active work session');
    }

    // Get current timestamp and date
    const now = new Date().toISOString();
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Create work session
    const sessionInput: CreateWorkSessionInput = {
      userId: sanitized.userId,
      workspaceId: sanitized.workspaceId,
      status: WorkSessionStatus.ACTIVE,
      clockedInAt: now,
      clockedOutAt: null,
      totalFocusMinutes: 0,
      totalBreakMinutes: 0,
      date,
    };

    return this.workSessionRepo.create(db, sessionInput);
  }

  /**
   * Clock out - completes the work session
   */
  async clockOut(db: StrideDatabase, sessionId: string): Promise<WorkSession> {
    // Validate session exists
    const session = await this.workSessionRepo.findById(db, sessionId);
    if (!session) {
      throw new ValidationError('sessionId', 'Work session not found');
    }

    // Validate session state
    if (session.status === WorkSessionStatus.COMPLETED) {
      throw new ValidationError('sessionId', 'Work session is already completed');
    }

    // Update session
    const now = new Date().toISOString();
    return this.workSessionRepo.update(db, sessionId, {
      status: WorkSessionStatus.COMPLETED,
      clockedOutAt: now,
    });
  }

  /**
   * Pause - pauses the active work session
   */
  async pause(db: StrideDatabase, sessionId: string): Promise<WorkSession> {
    // Validate session exists
    const session = await this.workSessionRepo.findById(db, sessionId);
    if (!session) {
      throw new ValidationError('sessionId', 'Work session not found');
    }

    // Validate session state
    if (session.status === WorkSessionStatus.COMPLETED) {
      throw new ValidationError('sessionId', 'Cannot pause a completed work session');
    }

    if (session.status === WorkSessionStatus.PAUSED) {
      throw new ValidationError('sessionId', 'Work session is already paused');
    }

    // Update session
    return this.workSessionRepo.update(db, sessionId, {
      status: WorkSessionStatus.PAUSED,
    });
  }

  /**
   * Resume - resumes a paused work session
   */
  async resume(db: StrideDatabase, sessionId: string): Promise<WorkSession> {
    // Validate session exists
    const session = await this.workSessionRepo.findById(db, sessionId);
    if (!session) {
      throw new ValidationError('sessionId', 'Work session not found');
    }

    // Validate session state
    if (session.status === WorkSessionStatus.COMPLETED) {
      throw new ValidationError('sessionId', 'Cannot resume a completed work session');
    }

    if (session.status === WorkSessionStatus.ACTIVE) {
      throw new ValidationError('sessionId', 'Work session is already active');
    }

    // Update session
    return this.workSessionRepo.update(db, sessionId, {
      status: WorkSessionStatus.ACTIVE,
    });
  }

  /**
   * Find active session for a user (ACTIVE or PAUSED)
   */
  async findActive(db: StrideDatabase, userId: string): Promise<WorkSession | null> {
    const sessions = await this.workSessionRepo.findByUser(db, userId);
    return (
      sessions.find(
        session =>
          session.status === WorkSessionStatus.ACTIVE || session.status === WorkSessionStatus.PAUSED
      ) || null
    );
  }

  /**
   * Get day session for a user on a specific date
   */
  async getDaySession(
    db: StrideDatabase,
    userId: string,
    date: string
  ): Promise<WorkSession | null> {
    const sessions = await this.workSessionRepo.findByUser(db, userId);
    return sessions.find(session => session.date === date) || null;
  }

  /**
   * Validate clock in parameters
   */
  private validateClockIn(params: ClockInParams): void {
    if (!params.userId || params.userId.trim().length === 0) {
      throw new ValidationError('userId', 'User ID is required');
    }

    if (!params.workspaceId || params.workspaceId.trim().length === 0) {
      throw new ValidationError('workspaceId', 'Workspace ID is required');
    }
  }
}

/**
 * Singleton instance for convenient access
 */
export const workSessionService = new WorkSessionService();
