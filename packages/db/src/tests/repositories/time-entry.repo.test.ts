/**
 * TimeEntry Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { timeEntryRepo } from '../../repositories/time-entry.repo';
import { createTestDb } from '../setup';
import { createMockTimeEntry } from '@stridetime/test-utils';

describe('TimeEntryRepository', () => {
  let db: any;

  beforeEach(() => {
    db = createTestDb();
  });

  describe('create', () => {
    it('creates a time entry', async () => {
      const { id, createdAt, updatedAt, deleted, ...entryInput } = createMockTimeEntry({
        taskId: 'task_1',
        userId: 'user_1',
      });

      const created = await timeEntryRepo.create(db, entryInput);

      expect(created.id).toBeTruthy();
      expect(created.taskId).toBe('task_1');
      expect(created.userId).toBe('user_1');
      expect(created.endedAt).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns time entry when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...entryInput } = createMockTimeEntry({
        taskId: 'task_1',
        userId: 'user_1',
      });

      const created = await timeEntryRepo.create(db, entryInput);
      const found = await timeEntryRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('returns null when not found', async () => {
      const found = await timeEntryRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByTaskId', () => {
    it('returns all entries for a task', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...entry1Input
      } = createMockTimeEntry({
        taskId: 'task_1',
        userId: 'user_1',
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...entry2Input
      } = createMockTimeEntry({
        taskId: 'task_1',
        userId: 'user_1',
        endedAt: new Date().toISOString(),
      });

      await timeEntryRepo.create(db, entry1Input);
      await timeEntryRepo.create(db, entry2Input);

      const entries = await timeEntryRepo.findByTaskId(db, 'task_1');

      expect(entries).toHaveLength(2);
      expect(entries.every(e => e.taskId === 'task_1')).toBe(true);
    });
  });

  describe('findActive', () => {
    it('returns active (ongoing) time entry', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...activeInput
      } = createMockTimeEntry({
        taskId: 'task_1',
        userId: 'user_1',
        endedAt: null,
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...completedInput
      } = createMockTimeEntry({
        taskId: 'task_2',
        userId: 'user_1',
        endedAt: new Date().toISOString(),
      });

      await timeEntryRepo.create(db, completedInput);
      const created = await timeEntryRepo.create(db, activeInput);

      const active = await timeEntryRepo.findActive(db, 'user_1');

      expect(active).toBeDefined();
      expect(active?.id).toBe(created.id);
      expect(active?.endedAt).toBeNull();
    });

    it('returns null when no active entry', async () => {
      const active = await timeEntryRepo.findActive(db, 'user_1');
      expect(active).toBeNull();
    });
  });

  describe('stop', () => {
    it('stops a time entry by setting endedAt', async () => {
      const { id, createdAt, updatedAt, deleted, ...entryInput } = createMockTimeEntry({
        taskId: 'task_1',
        userId: 'user_1',
        endedAt: null,
      });

      const created = await timeEntryRepo.create(db, entryInput);
      const endTime = new Date().toISOString();
      const stopped = await timeEntryRepo.stop(db, created.id, endTime);

      expect(stopped.endedAt).toBe(endTime);
    });
  });

  describe('calculateTotalMinutes', () => {
    it('calculates total minutes for a task', async () => {
      const start = new Date('2024-01-01T10:00:00Z');
      const end1 = new Date('2024-01-01T10:30:00Z'); // 30 min
      const end2 = new Date('2024-01-01T11:15:00Z'); // 75 min

      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...entry1Input
      } = createMockTimeEntry({
        taskId: 'task_1',
        userId: 'user_1',
        startedAt: start.toISOString(),
        endedAt: end1.toISOString(),
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...entry2Input
      } = createMockTimeEntry({
        taskId: 'task_1',
        userId: 'user_1',
        startedAt: start.toISOString(),
        endedAt: end2.toISOString(),
      });

      await timeEntryRepo.create(db, entry1Input);
      await timeEntryRepo.create(db, entry2Input);

      const totalMinutes = await timeEntryRepo.calculateTotalMinutes(db, 'task_1');

      expect(totalMinutes).toBe(105); // 30 + 75
    });

    it('ignores ongoing entries without endedAt', async () => {
      const { id, createdAt, updatedAt, deleted, ...entryInput } = createMockTimeEntry({
        taskId: 'task_1',
        userId: 'user_1',
        endedAt: null,
      });

      await timeEntryRepo.create(db, entryInput);

      const totalMinutes = await timeEntryRepo.calculateTotalMinutes(db, 'task_1');

      expect(totalMinutes).toBe(0);
    });
  });

  describe('mapper integrity', () => {
    it('includes timestamp fields', async () => {
      const { id, createdAt, updatedAt, deleted, ...entryInput } = createMockTimeEntry({
        taskId: 'task_1',
        userId: 'user_1',
      });

      const created = await timeEntryRepo.create(db, entryInput);

      expect(created.createdAt).toBeTruthy();
    });
  });
});
