/**
 * Break Service
 * Business logic for break tracking using repository pattern
 */

import type { StrideDatabase, BreakRepository } from '@stridetime/db';
import { breakRepo as defaultBreakRepo } from '@stridetime/db';
import type { Break, BreakType } from '@stridetime/types';
import { ValidationError } from '@stridetime/types';

/**
 * Parameters for starting a break
 */
export interface StartBreakParams {
  userId: string;
  type: BreakType;
}

/**
 * Break statistics for a specific date
 */
export interface BreakStats {
  totalBreakMinutes: number;
  breakCount: number;
}

/**
 * Break Service for business logic
 */
export class BreakService {
  constructor(private breakRepo: BreakRepository = defaultBreakRepo) {}

  /**
   * Start a new break
   */
  async startBreak(db: StrideDatabase, params: StartBreakParams): Promise<Break> {
    // Validate inputs
    this.validateStartBreak(params);

    // Check if user already has an active break
    const activeBreak = await this.findActive(db, params.userId);
    if (activeBreak) {
      throw new ValidationError(
        'userId',
        'User already has an active break. End the current break first.'
      );
    }

    // Create break entry
    const breakEntry = await this.breakRepo.create(db, {
      userId: params.userId,
      type: params.type,
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationMinutes: null,
    });

    return breakEntry;
  }

  /**
   * End an active break
   */
  async endBreak(db: StrideDatabase, breakId: string): Promise<Break> {
    // Validate breakId
    if (!breakId || !breakId.trim()) {
      throw new ValidationError('breakId', 'Break ID is required');
    }

    // Find the break
    const breakEntry = await this.breakRepo.findById(db, breakId);
    if (!breakEntry) {
      throw new ValidationError('breakId', 'Break not found');
    }

    // Check if already ended
    if (breakEntry.endedAt) {
      throw new ValidationError('breakId', 'Break has already been ended');
    }

    // Calculate duration
    const endedAt = new Date().toISOString();
    const startTime = new Date(breakEntry.startedAt).getTime();
    const endTime = new Date(endedAt).getTime();
    const durationMinutes = Math.round((endTime - startTime) / 60000);

    // Update break entry
    const updated = await this.breakRepo.update(db, breakId, {
      endedAt,
      durationMinutes,
    });

    return updated;
  }

  /**
   * Find active break for a user
   */
  async findActive(db: StrideDatabase, userId: string): Promise<Break | null> {
    if (!userId || !userId.trim()) {
      throw new ValidationError('userId', 'User ID is required');
    }

    // Query for active break (endedAt is null)
    const breaks = await this.breakRepo.findByUser(db, userId);
    const activeBreak = breaks.find(b => b.endedAt === null);

    return activeBreak || null;
  }

  /**
   * Get break statistics for a specific date
   */
  async getBreakStats(db: StrideDatabase, userId: string, date: string): Promise<BreakStats> {
    // Validate inputs
    if (!userId || !userId.trim()) {
      throw new ValidationError('userId', 'User ID is required');
    }

    if (!date || !date.trim()) {
      throw new ValidationError('date', 'Date is required');
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new ValidationError('date', 'Date must be in YYYY-MM-DD format');
    }

    // Calculate start and end of day in UTC
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    // Get all breaks for the user
    const allBreaks = await this.breakRepo.findByUser(db, userId);

    // Filter breaks for the specific date
    const dateBreaks = allBreaks.filter(b => {
      const breakStart = b.startedAt;
      return breakStart >= startOfDay && breakStart <= endOfDay && b.durationMinutes !== null;
    });

    // Calculate statistics
    const totalBreakMinutes = dateBreaks.reduce((sum, b) => sum + (b.durationMinutes || 0), 0);
    const breakCount = dateBreaks.length;

    return {
      totalBreakMinutes,
      breakCount,
    };
  }

  /**
   * Validate start break parameters
   */
  private validateStartBreak(params: StartBreakParams): void {
    if (!params.userId || !params.userId.trim()) {
      throw new ValidationError('userId', 'User ID is required');
    }

    if (!params.type || !params.type.trim()) {
      throw new ValidationError('type', 'Break type is required');
    }

    // Validate break type (should be one of the valid BreakType values)
    const validTypes = ['COFFEE', 'WALK', 'LUNCH', 'STRETCH', 'CUSTOM'];
    if (!validTypes.includes(params.type)) {
      throw new ValidationError('type', 'Invalid break type');
    }
  }
}

/**
 * Singleton instance for convenient access
 */
export const breakService = new BreakService();
