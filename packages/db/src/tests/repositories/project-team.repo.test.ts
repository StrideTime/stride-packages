/**
 * ProjectTeam Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { projectTeamRepo } from '../../repositories/project-team.repo';
import { projectRepo } from '../../repositories/project.repo';
import { teamRepo } from '../../repositories/team.repo';
import { userRepo } from '../../repositories/user.repo';
import { workspaceRepo } from '../../repositories/workspace.repo';
import { createTestDb } from '../setup';
import {
  createMockProjectTeam,
  createMockProject,
  createMockTeam,
  createMockUser,
  createMockWorkspace,
} from '@stridetime/test-utils';
import type { Project, Team, User, Workspace } from '@stridetime/types';

describe('ProjectTeamRepository', () => {
  let db: any;
  let testUser: User;
  let testWorkspace: Workspace;
  let testProject: Project;
  let testTeam: Team;

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
    it('creates a project-team association with generated ID', async () => {
      const { id, createdAt, updatedAt, deleted, ...associationInput } = createMockProjectTeam({
        projectId: testProject.id,
        teamId: testTeam.id,
      });

      const created = await projectTeamRepo.create(db, associationInput);

      expect(created.id).toBeTruthy();
      expect(created.projectId).toBe(testProject.id);
      expect(created.teamId).toBe(testTeam.id);
    });
  });

  describe('findById', () => {
    it('returns association when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...associationInput } = createMockProjectTeam({
        projectId: testProject.id,
        teamId: testTeam.id,
      });

      const created = await projectTeamRepo.create(db, associationInput);
      const found = await projectTeamRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('returns null when not found', async () => {
      const found = await projectTeamRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByProject', () => {
    it('returns all teams for a project', async () => {
      const { id, createdAt, updatedAt, deleted, ...associationInput } = createMockProjectTeam({
        projectId: testProject.id,
        teamId: testTeam.id,
      });

      await projectTeamRepo.create(db, associationInput);

      const associations = await projectTeamRepo.findByProject(db, testProject.id);

      expect(associations).toHaveLength(1);
      expect(associations[0].projectId).toBe(testProject.id);
    });

    it('returns empty array when no associations found', async () => {
      const associations = await projectTeamRepo.findByProject(db, 'nonexistent');
      expect(associations).toEqual([]);
    });
  });

  describe('findByTeam', () => {
    it('returns all projects for a team', async () => {
      const { id, createdAt, updatedAt, deleted, ...associationInput } = createMockProjectTeam({
        projectId: testProject.id,
        teamId: testTeam.id,
      });

      await projectTeamRepo.create(db, associationInput);

      const associations = await projectTeamRepo.findByTeam(db, testTeam.id);

      expect(associations).toHaveLength(1);
      expect(associations[0].teamId).toBe(testTeam.id);
    });

    it('returns empty array when no associations found', async () => {
      const associations = await projectTeamRepo.findByTeam(db, 'nonexistent');
      expect(associations).toEqual([]);
    });
  });

  describe('delete', () => {
    it('deletes a project-team association', async () => {
      const { id, createdAt, updatedAt, deleted, ...associationInput } = createMockProjectTeam({
        projectId: testProject.id,
        teamId: testTeam.id,
      });

      const created = await projectTeamRepo.create(db, associationInput);
      await projectTeamRepo.delete(db, created.id);

      const found = await projectTeamRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });
});
