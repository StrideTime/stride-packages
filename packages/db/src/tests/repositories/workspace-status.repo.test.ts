/**
 * WorkspaceStatus Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { workspaceStatusRepo } from '../../repositories/workspace-status.repo';
import { userRepo } from '../../repositories/user.repo';
import { workspaceRepo } from '../../repositories/workspace.repo';
import { createTestDb } from '../setup';
import {
  createMockWorkspaceStatus,
  createMockUser,
  createMockWorkspace,
} from '@stridetime/test-utils';
import type { User, Workspace } from '@stridetime/types';

describe('WorkspaceStatusRepository', () => {
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
    it('creates a workspace status with generated ID', async () => {
      const { id, createdAt, updatedAt, deleted, ...statusInput } = createMockWorkspaceStatus({
        workspaceId: testWorkspace.id,
        name: 'Online',
      });

      const created = await workspaceStatusRepo.create(db, statusInput);

      expect(created.id).toBeTruthy();
      expect(created.workspaceId).toBe(testWorkspace.id);
      expect(created.name).toBe('Online');
    });
  });

  describe('findById', () => {
    it('returns status when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...statusInput } = createMockWorkspaceStatus({
        workspaceId: testWorkspace.id,
        name: 'Away',
      });

      const created = await workspaceStatusRepo.create(db, statusInput);
      const found = await workspaceStatusRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('returns null when not found', async () => {
      const found = await workspaceStatusRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByWorkspace', () => {
    it('returns all statuses for a workspace ordered by displayOrder', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...status1Input
      } = createMockWorkspaceStatus({
        workspaceId: testWorkspace.id,
        name: 'Online',
        displayOrder: 0,
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...status2Input
      } = createMockWorkspaceStatus({
        workspaceId: testWorkspace.id,
        name: 'Away',
        displayOrder: 1,
      });

      await workspaceStatusRepo.create(db, status1Input);
      await workspaceStatusRepo.create(db, status2Input);

      const statuses = await workspaceStatusRepo.findByWorkspace(db, testWorkspace.id);

      expect(statuses).toHaveLength(2);
      expect(statuses[0].displayOrder).toBe(0);
      expect(statuses[1].displayOrder).toBe(1);
    });
  });

  describe('update', () => {
    it('updates status properties', async () => {
      const { id, createdAt, updatedAt, deleted, ...statusInput } = createMockWorkspaceStatus({
        workspaceId: testWorkspace.id,
        name: 'Online',
      });

      const created = await workspaceStatusRepo.create(db, statusInput);
      const updated = await workspaceStatusRepo.update(db, created.id, {
        name: 'Available',
        description: 'Ready to collaborate',
      });

      expect(updated.name).toBe('Available');
      expect(updated.description).toBe('Ready to collaborate');
    });
  });

  describe('delete', () => {
    it('deletes a workspace status', async () => {
      const { id, createdAt, updatedAt, deleted, ...statusInput } = createMockWorkspaceStatus({
        workspaceId: testWorkspace.id,
        name: 'Custom Status',
      });

      const created = await workspaceStatusRepo.create(db, statusInput);
      await workspaceStatusRepo.delete(db, created.id);

      const found = await workspaceStatusRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });
});
