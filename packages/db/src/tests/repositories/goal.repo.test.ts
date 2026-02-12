/**
 * Goal Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { goalRepo } from '../../repositories/goal.repo';
import { userRepo } from '../../repositories/user.repo';
import { workspaceRepo } from '../../repositories/workspace.repo';
import { createTestDb } from '../setup';
import { createMockUser, createMockWorkspace, createMockGoal } from '@stridetime/test-utils';
import type { User, Workspace } from '@stridetime/types';

describe('GoalRepository', () => {
  let db: any;
  let testUser: User;
  let testWorkspace: Workspace;

  beforeEach(async () => {
    db = createTestDb();

    const {
      id: userId,
      createdAt: uc,
      updatedAt: uu,
      deleted: ud,
      ...userInput
    } = createMockUser();
    testUser = await userRepo.create(db, userInput);

    const {
      id: workspaceId,
      createdAt: wc,
      updatedAt: wu,
      deleted: wd,
      ...workspaceInput
    } = createMockWorkspace({
      ownerUserId: testUser.id,
    });
    testWorkspace = await workspaceRepo.create(db, workspaceInput);
  });

  describe('create', () => {
    it('creates a goal with generated ID', async () => {
      const { id, createdAt, updatedAt, deleted, ...goalInput } = createMockGoal({
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        type: 'TASKS_COMPLETED',
        targetValue: 10,
        period: 'DAILY',
      });

      const created = await goalRepo.create(db, goalInput);

      expect(created.id).toBeTruthy();
      expect(created.userId).toBe(testUser.id);
      expect(created.targetValue).toBe(10);
      expect(created.type).toBe('TASKS_COMPLETED');
    });
  });

  describe('findById', () => {
    it('returns goal when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...goalInput } = createMockGoal({
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        type: 'FOCUS_MINUTES',
        targetValue: 120,
        period: 'WEEKLY',
      });

      const created = await goalRepo.create(db, goalInput);
      const found = await goalRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('returns null when not found', async () => {
      const found = await goalRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('returns all goals for a user', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...goal1Input
      } = createMockGoal({
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        type: 'TASKS_COMPLETED',
        targetValue: 5,
        period: 'DAILY',
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...goal2Input
      } = createMockGoal({
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        type: 'FOCUS_MINUTES',
        targetValue: 240,
        period: 'WEEKLY',
      });

      await goalRepo.create(db, goal1Input);
      await goalRepo.create(db, goal2Input);

      const goals = await goalRepo.findByUser(db, testUser.id);

      expect(goals).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('updates goal properties', async () => {
      const { id, createdAt, updatedAt, deleted, ...goalInput } = createMockGoal({
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        type: 'TASKS_COMPLETED',
        targetValue: 10,
        period: 'DAILY',
      });

      const created = await goalRepo.create(db, goalInput);
      const updated = await goalRepo.update(db, created.id, { targetValue: 15 });

      expect(updated.targetValue).toBe(15);
    });
  });

  describe('delete', () => {
    it('soft deletes a goal', async () => {
      const { id, createdAt, updatedAt, deleted, ...goalInput } = createMockGoal({
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        type: 'TASKS_COMPLETED',
        targetValue: 10,
        period: 'DAILY',
      });

      const created = await goalRepo.create(db, goalInput);
      await goalRepo.delete(db, created.id);

      const found = await goalRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });
});
