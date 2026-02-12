/**
 * Break Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { breakRepo } from '../../repositories/break.repo';
import { userRepo } from '../../repositories/user.repo';
import { createTestDb } from '../setup';
import { createMockUser, createMockBreak } from '@stridetime/test-utils';
import type { User } from '@stridetime/types';

describe('BreakRepository', () => {
  let db: any;
  let testUser: User;

  beforeEach(async () => {
    db = createTestDb();

    const { id, createdAt, updatedAt, deleted, ...userInput } = createMockUser();
    testUser = await userRepo.create(db, userInput);
  });

  describe('create', () => {
    it('creates a break with generated ID', async () => {
      const { id, createdAt, updatedAt, deleted, ...breakInput } = createMockBreak({
        userId: testUser.id,
        type: 'WALK',
      });

      const created = await breakRepo.create(db, breakInput);

      expect(created.id).toBeTruthy();
      expect(created.userId).toBe(testUser.id);
      expect(created.type).toBe('WALK');
    });
  });

  describe('findById', () => {
    it('returns break when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...breakInput } = createMockBreak({
        userId: testUser.id,
        type: 'WALK',
      });

      const created = await breakRepo.create(db, breakInput);
      const found = await breakRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('returns null when not found', async () => {
      const found = await breakRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('returns all breaks for a user', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...break1Input
      } = createMockBreak({
        userId: testUser.id,
        type: 'WALK',
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...break2Input
      } = createMockBreak({
        userId: testUser.id,
        type: 'COFFEE',
      });

      await breakRepo.create(db, break1Input);
      await breakRepo.create(db, break2Input);

      const breaks = await breakRepo.findByUser(db, testUser.id);

      expect(breaks).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('updates break properties', async () => {
      const { id, createdAt, updatedAt, deleted, ...breakInput } = createMockBreak({
        userId: testUser.id,
        type: 'WALK',
        endedAt: null,
        durationMinutes: null,
      });

      const created = await breakRepo.create(db, breakInput);
      const endTime = new Date().toISOString();
      const updated = await breakRepo.update(db, created.id, {
        endedAt: endTime,
        durationMinutes: 5,
      });

      expect(updated.endedAt).toBe(endTime);
      expect(updated.durationMinutes).toBe(5);
    });
  });

  describe('delete', () => {
    it('soft deletes a break', async () => {
      const { id, createdAt, updatedAt, deleted, ...breakInput } = createMockBreak({
        userId: testUser.id,
        type: 'WALK',
      });

      const created = await breakRepo.create(db, breakInput);
      await breakRepo.delete(db, created.id);

      const found = await breakRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });
});
