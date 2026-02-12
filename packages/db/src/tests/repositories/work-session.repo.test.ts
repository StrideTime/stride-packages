/**
 * WorkSession Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { workSessionRepo } from '../../repositories/work-session.repo';
import { userRepo } from '../../repositories/user.repo';
import { workspaceRepo } from '../../repositories/workspace.repo';
import { createTestDb } from '../setup';
import { createMockUser, createMockWorkspace, createMockWorkSession } from '@stridetime/test-utils';
import type { User, Workspace } from '@stridetime/types';

describe('WorkSessionRepository', () => {
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
    it('creates a work session with generated ID', async () => {
      const { id, createdAt, updatedAt, deleted, ...sessionInput } = createMockWorkSession({
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        status: 'ACTIVE',
        date: '2026-02-12',
      });

      const created = await workSessionRepo.create(db, sessionInput);

      expect(created.id).toBeTruthy();
      expect(created.userId).toBe(testUser.id);
      expect(created.status).toBe('ACTIVE');
    });
  });

  describe('findById', () => {
    it('returns work session when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...sessionInput } = createMockWorkSession({
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        status: 'ACTIVE',
        date: '2026-02-12',
      });

      const created = await workSessionRepo.create(db, sessionInput);
      const found = await workSessionRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('returns null when not found', async () => {
      const found = await workSessionRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('returns all work sessions for a user', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...session1Input
      } = createMockWorkSession({
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        status: 'COMPLETED',
        totalFocusMinutes: 60,
        totalBreakMinutes: 10,
        date: '2026-02-12',
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...session2Input
      } = createMockWorkSession({
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        status: 'ACTIVE',
        clockedOutAt: null,
        date: '2026-02-13',
      });

      await workSessionRepo.create(db, session1Input);
      await workSessionRepo.create(db, session2Input);

      const sessions = await workSessionRepo.findByUser(db, testUser.id);

      expect(sessions).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('updates work session properties', async () => {
      const { id, createdAt, updatedAt, deleted, ...sessionInput } = createMockWorkSession({
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        status: 'ACTIVE',
        date: '2026-02-12',
      });

      const created = await workSessionRepo.create(db, sessionInput);
      const updated = await workSessionRepo.update(db, created.id, {
        status: 'COMPLETED',
        totalFocusMinutes: 90,
      });

      expect(updated.status).toBe('COMPLETED');
      expect(updated.totalFocusMinutes).toBe(90);
    });
  });

  describe('delete', () => {
    it('soft deletes a work session', async () => {
      const { id, createdAt, updatedAt, deleted, ...sessionInput } = createMockWorkSession({
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        status: 'ACTIVE',
        date: '2026-02-12',
      });

      const created = await workSessionRepo.create(db, sessionInput);
      await workSessionRepo.delete(db, created.id);

      const found = await workSessionRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });
});
