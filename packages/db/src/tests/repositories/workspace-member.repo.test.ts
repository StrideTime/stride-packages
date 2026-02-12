/**
 * WorkspaceMember Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { workspaceMemberRepo } from '../../repositories/workspace-member.repo';
import { userRepo } from '../../repositories/user.repo';
import { workspaceRepo } from '../../repositories/workspace.repo';
import { createTestDb } from '../setup';
import {
  createMockUser,
  createMockWorkspace,
  createMockWorkspaceMember,
} from '@stridetime/test-utils';
import type { User, Workspace } from '@stridetime/types';

describe('WorkspaceMemberRepository', () => {
  let db: any;
  let testUser: User;
  let testWorkspace: Workspace;

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
  });

  describe('create', () => {
    it('creates a workspace member', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockWorkspaceMember({
        workspaceId: testWorkspace.id,
        userId: testUser.id,
        role: 'OWNER',
      });

      const created = await workspaceMemberRepo.create(db, memberInput);

      expect(created.id).toBeTruthy();
      expect(created.workspaceId).toBe(testWorkspace.id);
      expect(created.userId).toBe(testUser.id);
      expect(created.role).toBe('OWNER');
    });
  });

  describe('findById', () => {
    it('returns member when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockWorkspaceMember({
        workspaceId: testWorkspace.id,
        userId: testUser.id,
        role: 'MEMBER',
      });

      const created = await workspaceMemberRepo.create(db, memberInput);
      const found = await workspaceMemberRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.workspaceId).toBe(testWorkspace.id);
    });

    it('returns null when not found', async () => {
      const found = await workspaceMemberRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });

    it('returns null when member is soft deleted', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockWorkspaceMember({
        workspaceId: testWorkspace.id,
        userId: testUser.id,
        role: 'MEMBER',
      });

      const created = await workspaceMemberRepo.create(db, memberInput);
      await workspaceMemberRepo.delete(db, created.id);

      const found = await workspaceMemberRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });

  describe('findByWorkspace', () => {
    it('returns all members of a workspace', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockWorkspaceMember({
        workspaceId: testWorkspace.id,
        userId: testUser.id,
        role: 'OWNER',
      });

      await workspaceMemberRepo.create(db, memberInput);

      const members = await workspaceMemberRepo.findByWorkspace(db, testWorkspace.id);

      expect(members).toHaveLength(1);
      expect(members[0].workspaceId).toBe(testWorkspace.id);
    });

    it('returns empty array when no members found', async () => {
      const members = await workspaceMemberRepo.findByWorkspace(db, 'nonexistent');
      expect(members).toEqual([]);
    });
  });

  describe('findByUser', () => {
    it('returns all workspaces a user is member of', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockWorkspaceMember({
        workspaceId: testWorkspace.id,
        userId: testUser.id,
        role: 'OWNER',
      });

      await workspaceMemberRepo.create(db, memberInput);

      const memberships = await workspaceMemberRepo.findByUser(db, testUser.id);

      expect(memberships).toHaveLength(1);
      expect(memberships[0].userId).toBe(testUser.id);
    });

    it('returns empty array when user has no memberships', async () => {
      const memberships = await workspaceMemberRepo.findByUser(db, 'nonexistent');
      expect(memberships).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates workspace member role', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockWorkspaceMember({
        workspaceId: testWorkspace.id,
        userId: testUser.id,
        role: 'MEMBER',
      });

      const created = await workspaceMemberRepo.create(db, memberInput);
      const updated = await workspaceMemberRepo.update(db, created.id, { role: 'ADMIN' });

      expect(updated.role).toBe('ADMIN');
    });
  });

  describe('delete', () => {
    it('soft deletes a workspace member', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockWorkspaceMember({
        workspaceId: testWorkspace.id,
        userId: testUser.id,
        role: 'MEMBER',
      });

      const created = await workspaceMemberRepo.create(db, memberInput);
      await workspaceMemberRepo.delete(db, created.id);

      const found = await workspaceMemberRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });
});
