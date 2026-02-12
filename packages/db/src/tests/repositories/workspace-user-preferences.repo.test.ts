/**
 * WorkspaceUserPreferences Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { workspaceUserPreferencesRepo } from '../../repositories/workspace-user-preferences.repo';
import { userRepo } from '../../repositories/user.repo';
import { workspaceRepo } from '../../repositories/workspace.repo';
import { createTestDb } from '../setup';
import {
  createMockWorkspaceUserPreferences,
  createMockUser,
  createMockWorkspace,
} from '@stridetime/test-utils';
import type { User, Workspace } from '@stridetime/types';

describe('WorkspaceUserPreferencesRepository', () => {
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
    it('creates workspace user preferences with generated ID', async () => {
      const { id, createdAt, updatedAt, deleted, ...prefsInput } =
        createMockWorkspaceUserPreferences({
          userId: testUser.id,
          workspaceId: testWorkspace.id,
        });

      const created = await workspaceUserPreferencesRepo.create(db, prefsInput);

      expect(created.id).toBeTruthy();
      expect(created.userId).toBe(testUser.id);
      expect(created.workspaceId).toBe(testWorkspace.id);
      expect(created.defaultView).toBe('TODAY');
    });
  });

  describe('findById', () => {
    it('returns preferences when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...prefsInput } =
        createMockWorkspaceUserPreferences({
          userId: testUser.id,
          workspaceId: testWorkspace.id,
        });

      const created = await workspaceUserPreferencesRepo.create(db, prefsInput);
      const found = await workspaceUserPreferencesRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('returns null when not found', async () => {
      const found = await workspaceUserPreferencesRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByUserAndWorkspace', () => {
    it('returns preferences for user and workspace', async () => {
      const { id, createdAt, updatedAt, deleted, ...prefsInput } =
        createMockWorkspaceUserPreferences({
          userId: testUser.id,
          workspaceId: testWorkspace.id,
        });

      await workspaceUserPreferencesRepo.create(db, prefsInput);

      const found = await workspaceUserPreferencesRepo.findByUserAndWorkspace(
        db,
        testUser.id,
        testWorkspace.id
      );

      expect(found).toBeDefined();
      expect(found?.userId).toBe(testUser.id);
      expect(found?.workspaceId).toBe(testWorkspace.id);
    });
  });

  describe('update', () => {
    it('updates preferences', async () => {
      const { id, createdAt, updatedAt, deleted, ...prefsInput } =
        createMockWorkspaceUserPreferences({
          userId: testUser.id,
          workspaceId: testWorkspace.id,
        });

      const created = await workspaceUserPreferencesRepo.create(db, prefsInput);
      const updated = await workspaceUserPreferencesRepo.update(db, created.id, {
        defaultView: 'WEEK',
        trackProjectSwitching: true,
      });

      expect(updated.defaultView).toBe('WEEK');
      expect(updated.trackProjectSwitching).toBe(true);
    });
  });

  describe('delete', () => {
    it('deletes preferences', async () => {
      const { id, createdAt, updatedAt, deleted, ...prefsInput } =
        createMockWorkspaceUserPreferences({
          userId: testUser.id,
          workspaceId: testWorkspace.id,
        });

      const created = await workspaceUserPreferencesRepo.create(db, prefsInput);
      await workspaceUserPreferencesRepo.delete(db, created.id);

      const found = await workspaceUserPreferencesRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });
});
