/**
 * TeamMember Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { teamMemberRepo } from '../../repositories/team-member.repo';
import { teamRepo } from '../../repositories/team.repo';
import { userRepo } from '../../repositories/user.repo';
import { workspaceRepo } from '../../repositories/workspace.repo';
import { createTestDb } from '../setup';
import {
  createMockTeamMember,
  createMockTeam,
  createMockUser,
  createMockWorkspace,
} from '@stridetime/test-utils';
import type { Team, User, Workspace } from '@stridetime/types';

describe('TeamMemberRepository', () => {
  let db: any;
  let testUser: User;
  let testWorkspace: Workspace;
  let testTeam: Team;

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

    // Create test team
    const {
      id: teamId,
      createdAt: tc,
      updatedAt: tu,
      deleted: td,
      ...teamInput
    } = createMockTeam({
      workspaceId: testWorkspace.id,
      leadUserId: testUser.id,
    });
    testTeam = await teamRepo.create(db, teamInput);
  });

  describe('create', () => {
    it('creates a team member with generated ID', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockTeamMember({
        teamId: testTeam.id,
        userId: testUser.id,
        addedBy: testUser.id,
      });

      const created = await teamMemberRepo.create(db, memberInput);

      expect(created.id).toBeTruthy();
      expect(created.teamId).toBe(testTeam.id);
      expect(created.userId).toBe(testUser.id);
      expect(created.role).toBe('MEMBER');
    });
  });

  describe('findById', () => {
    it('returns team member when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockTeamMember({
        teamId: testTeam.id,
        userId: testUser.id,
        role: 'LEAD',
        addedBy: testUser.id,
      });

      const created = await teamMemberRepo.create(db, memberInput);
      const found = await teamMemberRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.role).toBe('LEAD');
    });

    it('returns null when not found', async () => {
      const found = await teamMemberRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });

    it('returns null when team member is soft deleted', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockTeamMember({
        teamId: testTeam.id,
        userId: testUser.id,
        addedBy: testUser.id,
      });

      const created = await teamMemberRepo.create(db, memberInput);
      await teamMemberRepo.delete(db, created.id);

      const found = await teamMemberRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });

  describe('findByTeam', () => {
    it('returns all members of a team', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockTeamMember({
        teamId: testTeam.id,
        userId: testUser.id,
        role: 'LEAD',
        addedBy: testUser.id,
      });

      await teamMemberRepo.create(db, memberInput);

      const members = await teamMemberRepo.findByTeam(db, testTeam.id);

      expect(members).toHaveLength(1);
      expect(members[0].teamId).toBe(testTeam.id);
    });

    it('returns empty array when no members found', async () => {
      const members = await teamMemberRepo.findByTeam(db, 'nonexistent');
      expect(members).toEqual([]);
    });
  });

  describe('findByUser', () => {
    it('returns all teams a user is member of', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockTeamMember({
        teamId: testTeam.id,
        userId: testUser.id,
        addedBy: testUser.id,
      });

      await teamMemberRepo.create(db, memberInput);

      const memberships = await teamMemberRepo.findByUser(db, testUser.id);

      expect(memberships).toHaveLength(1);
      expect(memberships[0].userId).toBe(testUser.id);
    });

    it('returns empty array when user has no memberships', async () => {
      const memberships = await teamMemberRepo.findByUser(db, 'nonexistent');
      expect(memberships).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates team member role', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockTeamMember({
        teamId: testTeam.id,
        userId: testUser.id,
        role: 'MEMBER',
        addedBy: testUser.id,
      });

      const created = await teamMemberRepo.create(db, memberInput);
      const updated = await teamMemberRepo.update(db, created.id, { role: 'LEAD' });

      expect(updated.role).toBe('LEAD');
    });
  });

  describe('delete', () => {
    it('soft deletes a team member', async () => {
      const { id, createdAt, updatedAt, deleted, ...memberInput } = createMockTeamMember({
        teamId: testTeam.id,
        userId: testUser.id,
        addedBy: testUser.id,
      });

      const created = await teamMemberRepo.create(db, memberInput);
      await teamMemberRepo.delete(db, created.id);

      const found = await teamMemberRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });
});
