/**
 * Team Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { teamRepo } from '../../repositories/team.repo';
import { userRepo } from '../../repositories/user.repo';
import { workspaceRepo } from '../../repositories/workspace.repo';
import { createTestDb } from '../setup';
import { createMockTeam, createMockUser, createMockWorkspace } from '@stridetime/test-utils';
import type { User, Workspace } from '@stridetime/types';

describe('TeamRepository', () => {
  let db: any;
  let testUser: User;
  let testWorkspace: Workspace;

  beforeEach(async () => {
    db = createTestDb();

    // Create test user
    const {
      id: userId1,
      createdAt: uc1,
      updatedAt: uu1,
      deleted: ud1,
      ...userInput
    } = createMockUser();
    testUser = await userRepo.create(db, userInput);

    // Create test workspace
    const {
      id: workspaceId1,
      createdAt: wc1,
      updatedAt: wu1,
      deleted: wd1,
      ...workspaceInput
    } = createMockWorkspace({
      ownerUserId: testUser.id,
    });
    testWorkspace = await workspaceRepo.create(db, workspaceInput);
  });

  describe('create', () => {
    it('creates a team with generated ID', async () => {
      const { id, createdAt, updatedAt, deleted, ...teamInput } = createMockTeam({
        workspaceId: testWorkspace.id,
        name: 'Engineering',
        leadUserId: testUser.id,
      });

      const created = await teamRepo.create(db, teamInput);

      expect(created.id).toBeTruthy();
      expect(created.workspaceId).toBe(testWorkspace.id);
      expect(created.name).toBe('Engineering');
      expect(created.leadUserId).toBe(testUser.id);
    });
  });

  describe('findById', () => {
    it('returns team when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...teamInput } = createMockTeam({
        workspaceId: testWorkspace.id,
        name: 'Design',
        leadUserId: testUser.id,
      });

      const created = await teamRepo.create(db, teamInput);
      const found = await teamRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Design');
    });

    it('returns null when not found', async () => {
      const found = await teamRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });

    it('returns null when team is soft deleted', async () => {
      const { id, createdAt, updatedAt, deleted, ...teamInput } = createMockTeam({
        workspaceId: testWorkspace.id,
        name: 'Deleted Team',
        leadUserId: testUser.id,
      });

      const created = await teamRepo.create(db, teamInput);
      await teamRepo.delete(db, created.id);

      const found = await teamRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });

  describe('findByWorkspace', () => {
    it('returns all teams in a workspace', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...team1Input
      } = createMockTeam({
        workspaceId: testWorkspace.id,
        name: 'Team 1',
        leadUserId: testUser.id,
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...team2Input
      } = createMockTeam({
        workspaceId: testWorkspace.id,
        name: 'Team 2',
        leadUserId: testUser.id,
      });

      await teamRepo.create(db, team1Input);
      await teamRepo.create(db, team2Input);

      const teams = await teamRepo.findByWorkspace(db, testWorkspace.id);

      expect(teams).toHaveLength(2);
      expect(teams.map(t => t.name)).toContain('Team 1');
      expect(teams.map(t => t.name)).toContain('Team 2');
    });

    it('returns empty array when no teams found', async () => {
      const teams = await teamRepo.findByWorkspace(db, 'nonexistent');
      expect(teams).toEqual([]);
    });
  });

  describe('findDefault', () => {
    it('returns default team for workspace', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...defaultTeamInput
      } = createMockTeam({
        workspaceId: testWorkspace.id,
        name: 'Default Team',
        isDefault: true,
        leadUserId: testUser.id,
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...nonDefaultTeamInput
      } = createMockTeam({
        workspaceId: testWorkspace.id,
        name: 'Non-Default Team',
        isDefault: false,
        leadUserId: testUser.id,
      });

      await teamRepo.create(db, defaultTeamInput);
      await teamRepo.create(db, nonDefaultTeamInput);

      const found = await teamRepo.findDefault(db, testWorkspace.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe('Default Team');
      expect(found?.isDefault).toBe(true);
    });

    it('returns null when no default team exists', async () => {
      const found = await teamRepo.findDefault(db, testWorkspace.id);
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('updates team properties', async () => {
      const { id, createdAt, updatedAt, deleted, ...teamInput } = createMockTeam({
        workspaceId: testWorkspace.id,
        name: 'Original Name',
        leadUserId: testUser.id,
      });

      const created = await teamRepo.create(db, teamInput);
      const updated = await teamRepo.update(db, created.id, {
        name: 'Updated Name',
        color: '#FF0000',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.color).toBe('#FF0000');
    });
  });

  describe('delete', () => {
    it('soft deletes a team', async () => {
      const { id, createdAt, updatedAt, deleted, ...teamInput } = createMockTeam({
        workspaceId: testWorkspace.id,
        name: 'To Delete',
        leadUserId: testUser.id,
      });

      const created = await teamRepo.create(db, teamInput);
      await teamRepo.delete(db, created.id);

      const found = await teamRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });
});
