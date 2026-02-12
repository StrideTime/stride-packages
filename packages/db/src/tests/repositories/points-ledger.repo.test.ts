/**
 * PointsLedger Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { pointsLedgerRepo } from '../../repositories/points-ledger.repo';
import { userRepo } from '../../repositories/user.repo';
import { workspaceRepo } from '../../repositories/workspace.repo';
import { projectRepo } from '../../repositories/project.repo';
import { taskRepo } from '../../repositories/task.repo';
import { createTestDb } from '../setup';
import {
  createMockPointsLedgerEntry,
  createMockUser,
  createMockWorkspace,
  createMockProject,
  createMockTask,
} from '@stridetime/test-utils';
import type { User, Workspace, Project, Task } from '@stridetime/types';

describe('PointsLedgerRepository', () => {
  let db: any;
  let testUser: User;
  let testWorkspace: Workspace;
  let testProject: Project;
  let testTask: Task;

  beforeEach(async () => {
    db = createTestDb();

    // Create test user
    const {
      id: userId,
      createdAt: uc,
      updatedAt: uu,
      deleted: ud,
      ...userInput
    } = createMockUser();
    testUser = await userRepo.create(db, userInput);

    // Create test workspace
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

    // Create test project
    const {
      id: projectId,
      createdAt: pc,
      updatedAt: pu,
      deleted: pd,
      ...projectInput
    } = createMockProject({
      workspaceId: testWorkspace.id,
      userId: testUser.id,
    });
    testProject = await projectRepo.create(db, projectInput);

    // Create test task
    const {
      id: taskId,
      createdAt: tc,
      updatedAt: tu,
      deleted: td,
      ...taskInput
    } = createMockTask({
      userId: testUser.id,
      projectId: testProject.id,
    });
    testTask = await taskRepo.create(db, taskInput);
  });

  describe('create', () => {
    it('creates a points ledger entry with generated ID', async () => {
      const { id, createdAt, updatedAt, deleted, ...entryInput } = createMockPointsLedgerEntry({
        userId: testUser.id,
        taskId: testTask.id,
        points: 10,
        reason: 'TASK_COMPLETED',
        description: 'Completed test task',
      });

      const created = await pointsLedgerRepo.create(db, entryInput);

      expect(created.id).toBeTruthy();
      expect(created.userId).toBe(testUser.id);
      expect(created.taskId).toBe(testTask.id);
      expect(created.points).toBe(10);
      expect(created.reason).toBe('TASK_COMPLETED');
    });
  });

  describe('findById', () => {
    it('returns entry when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...entryInput } = createMockPointsLedgerEntry({
        userId: testUser.id,
        taskId: testTask.id,
        points: 5,
        description: 'Test entry',
      });

      const created = await pointsLedgerRepo.create(db, entryInput);
      const found = await pointsLedgerRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('returns null when not found', async () => {
      const found = await pointsLedgerRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('returns all entries for a user', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...entry1Input
      } = createMockPointsLedgerEntry({
        userId: testUser.id,
        taskId: testTask.id,
        points: 10,
        description: 'Entry 1',
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...entry2Input
      } = createMockPointsLedgerEntry({
        userId: testUser.id,
        taskId: testTask.id,
        points: 15,
        description: 'Entry 2',
      });

      await pointsLedgerRepo.create(db, entry1Input);
      await pointsLedgerRepo.create(db, entry2Input);

      const entries = await pointsLedgerRepo.findByUser(db, testUser.id);

      expect(entries.length).toBeGreaterThanOrEqual(2);
    });

    it('returns empty array when no entries found', async () => {
      const entries = await pointsLedgerRepo.findByUser(db, 'nonexistent');
      expect(entries).toEqual([]);
    });
  });

  describe('findByWorkspace', () => {
    it('returns all entries for a workspace', async () => {
      const { id, createdAt, updatedAt, deleted, ...entryInput } = createMockPointsLedgerEntry({
        userId: testUser.id,
        taskId: testTask.id,
        points: 20,
        description: 'Workspace entry',
      });

      await pointsLedgerRepo.create(db, entryInput);

      const entries = await pointsLedgerRepo.findByWorkspace(db, testWorkspace.id);

      expect(entries.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty array when no entries found', async () => {
      const entries = await pointsLedgerRepo.findByWorkspace(db, 'nonexistent');
      expect(entries).toEqual([]);
    });
  });

  describe('findByUserInWorkspace', () => {
    it('returns entries for specific user in workspace', async () => {
      const { id, createdAt, updatedAt, deleted, ...entryInput } = createMockPointsLedgerEntry({
        userId: testUser.id,
        taskId: testTask.id,
        points: 25,
        description: 'User workspace entry',
      });

      await pointsLedgerRepo.create(db, entryInput);

      const entries = await pointsLedgerRepo.findByUserInWorkspace(
        db,
        testUser.id,
        testWorkspace.id
      );

      expect(entries.length).toBeGreaterThanOrEqual(1);
      expect(entries[0].userId).toBe(testUser.id);
    });

    it('returns empty array when no entries found', async () => {
      const entries = await pointsLedgerRepo.findByUserInWorkspace(
        db,
        'nonexistent',
        testWorkspace.id
      );
      expect(entries).toEqual([]);
    });
  });
});
