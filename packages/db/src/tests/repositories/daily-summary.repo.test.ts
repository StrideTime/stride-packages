/**
 * DailySummary Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { dailySummaryRepo } from '../../repositories/daily-summary.repo';
import { createTestDb } from '../setup';
import { createMockDailySummary } from '@stridetime/test-utils';

describe('DailySummaryRepository', () => {
  let db: any;

  beforeEach(() => {
    db = createTestDb();
  });

  describe('create', () => {
    it('creates a daily summary', async () => {
      const { id, createdAt, ...summaryInput } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
        tasksCompleted: 5,
        tasksWorkedOn: 8,
        totalPoints: 120,
        focusMinutes: 240,
        efficiencyRating: 0.85,
        standoutMoment: 'Completed the refactoring!',
      });

      const created = await dailySummaryRepo.create(db, summaryInput);

      expect(created.id).toBeTruthy();
      expect(created.userId).toBe('user_1');
      expect(created.date).toBe('2024-01-15');
      expect(created.tasksCompleted).toBe(5);
      expect(created.totalPoints).toBe(120);
      expect(created.efficiencyRating).toBe(0.85);
    });
  });

  describe('findById', () => {
    it('returns summary when found', async () => {
      const { id, createdAt, ...summaryInput } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
        tasksCompleted: 5,
        tasksWorkedOn: 8,
        totalPoints: 120,
        focusMinutes: 240,
        efficiencyRating: 0.85,
      });

      const created = await dailySummaryRepo.create(db, summaryInput);
      const found = await dailySummaryRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.date).toBe('2024-01-15');
    });

    it('returns null when not found', async () => {
      const found = await dailySummaryRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByDate', () => {
    it('returns summary for specific date', async () => {
      const { id, createdAt, ...summaryInput } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
      });

      await dailySummaryRepo.create(db, summaryInput);
      const found = await dailySummaryRepo.findByDate(db, 'user_1', '2024-01-15');

      expect(found).toBeDefined();
      expect(found?.date).toBe('2024-01-15');
    });

    it('returns null when date not found', async () => {
      const found = await dailySummaryRepo.findByDate(db, 'user_1', '2024-01-15');
      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('returns all summaries for a user', async () => {
      const {
        id: id1,
        createdAt: c1,
        ...summary1Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
        tasksCompleted: 5,
        totalPoints: 120,
      });

      const {
        id: id2,
        createdAt: c2,
        ...summary2Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-16',
        tasksCompleted: 3,
        totalPoints: 80,
      });

      await dailySummaryRepo.create(db, summary1Input);
      await dailySummaryRepo.create(db, summary2Input);

      const summaries = await dailySummaryRepo.findByUserId(db, 'user_1');

      expect(summaries).toHaveLength(2);
      expect(summaries.every(s => s.userId === 'user_1')).toBe(true);
      // Should be ordered by date descending
      expect(summaries[0].date).toBe('2024-01-16');
      expect(summaries[1].date).toBe('2024-01-15');
    });
  });

  describe('findByDateRange', () => {
    it('returns summaries within date range', async () => {
      const {
        id: id1,
        createdAt: c1,
        ...summary1Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-10',
        tasksCompleted: 2,
        totalPoints: 50,
      });

      const {
        id: id2,
        createdAt: c2,
        ...summary2Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
        tasksCompleted: 5,
        totalPoints: 120,
      });

      const {
        id: id3,
        createdAt: c3,
        ...summary3Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-20',
        tasksCompleted: 4,
        totalPoints: 100,
      });

      await dailySummaryRepo.create(db, summary1Input);
      await dailySummaryRepo.create(db, summary2Input);
      await dailySummaryRepo.create(db, summary3Input);

      const summaries = await dailySummaryRepo.findByDateRange(
        db,
        'user_1',
        '2024-01-12',
        '2024-01-18'
      );

      expect(summaries).toHaveLength(1);
      expect(summaries[0].date).toBe('2024-01-15');
    });
  });

  describe('findRecent', () => {
    it('returns recent summaries limited by days', async () => {
      const {
        id: id1,
        createdAt: c1,
        ...summary1Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-10',
        tasksCompleted: 2,
        totalPoints: 50,
      });

      const {
        id: id2,
        createdAt: c2,
        ...summary2Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
        tasksCompleted: 5,
        totalPoints: 120,
      });

      const {
        id: id3,
        createdAt: c3,
        ...summary3Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-20',
        tasksCompleted: 4,
        totalPoints: 100,
      });

      await dailySummaryRepo.create(db, summary1Input);
      await dailySummaryRepo.create(db, summary2Input);
      await dailySummaryRepo.create(db, summary3Input);

      const summaries = await dailySummaryRepo.findRecent(db, 'user_1', 2);

      expect(summaries).toHaveLength(2);
      // Should be ordered by date descending
      expect(summaries[0].date).toBe('2024-01-20');
      expect(summaries[1].date).toBe('2024-01-15');
    });
  });

  describe('update', () => {
    it('updates summary fields', async () => {
      const { id, createdAt, ...summaryInput } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
        tasksCompleted: 5,
        totalPoints: 120,
      });

      const created = await dailySummaryRepo.create(db, summaryInput);
      const updated = await dailySummaryRepo.update(db, created.id, {
        standoutMoment: 'Achieved great progress!',
        tasksCompleted: 6,
      });

      expect(updated.standoutMoment).toBe('Achieved great progress!');
      expect(updated.tasksCompleted).toBe(6);
      expect(updated.totalPoints).toBe(120); // Unchanged
    });
  });

  describe('upsert', () => {
    it('creates summary if it does not exist', async () => {
      const { id, createdAt, ...summaryInput } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
        tasksCompleted: 5,
        totalPoints: 120,
      });

      const upserted = await dailySummaryRepo.upsert(db, summaryInput);

      expect(upserted.id).toBeTruthy();
      expect(upserted.date).toBe('2024-01-15');
      expect(upserted.tasksCompleted).toBe(5);
    });

    it('updates summary if it already exists', async () => {
      const { id, createdAt, ...summaryInput } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
        tasksCompleted: 5,
        totalPoints: 120,
      });

      // Create first time
      const created = await dailySummaryRepo.upsert(db, summaryInput);

      // Upsert with updated values
      const updatedSummary = {
        ...summaryInput,
        tasksCompleted: 6,
        totalPoints: 140,
      };

      const upserted = await dailySummaryRepo.upsert(db, updatedSummary);

      expect(upserted.id).toBe(created.id); // Same ID
      expect(upserted.tasksCompleted).toBe(6); // Updated
      expect(upserted.totalPoints).toBe(140); // Updated
    });
  });

  describe('delete', () => {
    it('deletes a summary', async () => {
      const { id, createdAt, ...summaryInput } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
      });

      const created = await dailySummaryRepo.create(db, summaryInput);
      await dailySummaryRepo.delete(db, created.id);

      const found = await dailySummaryRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });

  describe('calculateAveragePoints', () => {
    it('calculates average points over N days', async () => {
      const {
        id: id1,
        createdAt: c1,
        ...summary1Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
        totalPoints: 100,
      });

      const {
        id: id2,
        createdAt: c2,
        ...summary2Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-16',
        totalPoints: 80,
      });

      const {
        id: id3,
        createdAt: c3,
        ...summary3Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-17',
        totalPoints: 120,
      });

      await dailySummaryRepo.create(db, summary1Input);
      await dailySummaryRepo.create(db, summary2Input);
      await dailySummaryRepo.create(db, summary3Input);

      const avgPoints = await dailySummaryRepo.calculateAveragePoints(db, 'user_1', 3);

      expect(avgPoints).toBe(100); // (100 + 80 + 120) / 3
    });

    it('returns 0 when no summaries exist', async () => {
      const avgPoints = await dailySummaryRepo.calculateAveragePoints(db, 'user_1', 7);
      expect(avgPoints).toBe(0);
    });
  });

  describe('calculateTotalFocusMinutes', () => {
    it('calculates total focus minutes in date range', async () => {
      const {
        id: id1,
        createdAt: c1,
        ...summary1Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-10',
        focusMinutes: 120,
      });

      const {
        id: id2,
        createdAt: c2,
        ...summary2Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
        focusMinutes: 240,
      });

      const {
        id: id3,
        createdAt: c3,
        ...summary3Input
      } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-20',
        focusMinutes: 180,
      });

      await dailySummaryRepo.create(db, summary1Input);
      await dailySummaryRepo.create(db, summary2Input);
      await dailySummaryRepo.create(db, summary3Input);

      const totalMinutes = await dailySummaryRepo.calculateTotalFocusMinutes(
        db,
        'user_1',
        '2024-01-12',
        '2024-01-18'
      );

      expect(totalMinutes).toBe(240); // Only summary2 in range
    });
  });

  describe('mapper integrity', () => {
    it('includes timestamp fields', async () => {
      const { id, createdAt, ...summaryInput } = createMockDailySummary({
        userId: 'user_1',
        date: '2024-01-15',
      });

      const created = await dailySummaryRepo.create(db, summaryInput);

      expect(created.createdAt).toBeTruthy();
    });
  });
});
