/**
 * Workspace Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { workspaceRepo } from '../../repositories/workspace.repo';
import { createTestDb } from '../setup';
import { createMockWorkspace } from '@stridetime/test-utils';

describe('WorkspaceRepository', () => {
  let db: any;

  beforeEach(() => {
    db = createTestDb();
  });

  describe('create', () => {
    it('creates a workspace', async () => {
      const { id, createdAt, updatedAt, deleted, ...input } = createMockWorkspace({
        ownerUserId: 'user-1',
        name: 'My Workspace',
        type: 'PERSONAL',
      });

      const created = await workspaceRepo.create(db, input);

      expect(created.id).toBeTruthy();
      expect(created.ownerUserId).toBe('user-1');
      expect(created.name).toBe('My Workspace');
      expect(created.type).toBe('PERSONAL');
      expect(created.deleted).toBe(false);
    });

    it('creates a workspace with optional fields', async () => {
      const { id, createdAt, updatedAt, deleted, ...input } = createMockWorkspace({
        color: '#3b82f6',
        timezone: 'America/New_York',
        weekStartsOn: 1,
        description: 'Test workspace',
      });

      const created = await workspaceRepo.create(db, input);

      expect(created.color).toBe('#3b82f6');
      expect(created.timezone).toBe('America/New_York');
      expect(created.weekStartsOn).toBe(1);
      expect(created.description).toBe('Test workspace');
    });
  });

  describe('findById', () => {
    it('returns workspace when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...input } = createMockWorkspace();
      const created = await workspaceRepo.create(db, input);

      const found = await workspaceRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(input.name);
    });

    it('returns null when not found', async () => {
      const found = await workspaceRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });

    it('returns null when workspace is soft deleted', async () => {
      const { id, createdAt, updatedAt, deleted, ...input } = createMockWorkspace();
      const created = await workspaceRepo.create(db, input);

      await workspaceRepo.delete(db, created.id);
      const found = await workspaceRepo.findById(db, created.id);

      expect(found).toBeNull();
    });
  });

  describe('findByOwner', () => {
    it('returns workspaces for an owner', async () => {
      const {
        id: _1,
        createdAt: _1c,
        updatedAt: _1u,
        deleted: _1d,
        ...ws1
      } = createMockWorkspace({
        ownerUserId: 'user-1',
        name: 'Workspace 1',
      });
      const {
        id: _2,
        createdAt: _2c,
        updatedAt: _2u,
        deleted: _2d,
        ...ws2
      } = createMockWorkspace({
        ownerUserId: 'user-1',
        name: 'Workspace 2',
      });
      const {
        id: _3,
        createdAt: _3c,
        updatedAt: _3u,
        deleted: _3d,
        ...ws3
      } = createMockWorkspace({
        ownerUserId: 'user-2',
        name: 'Other Workspace',
      });

      await workspaceRepo.create(db, ws1);
      await workspaceRepo.create(db, ws2);
      await workspaceRepo.create(db, ws3);

      const results = await workspaceRepo.findByOwner(db, 'user-1');
      expect(results).toHaveLength(2);
      expect(results.every(w => w.ownerUserId === 'user-1')).toBe(true);
    });

    it('excludes soft deleted workspaces', async () => {
      const { id, createdAt, updatedAt, deleted, ...input } = createMockWorkspace({
        ownerUserId: 'user-1',
      });
      const created = await workspaceRepo.create(db, input);
      await workspaceRepo.delete(db, created.id);

      const results = await workspaceRepo.findByOwner(db, 'user-1');
      expect(results).toHaveLength(0);
    });

    it('returns empty array when no workspaces found', async () => {
      const results = await workspaceRepo.findByOwner(db, 'nonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates workspace fields', async () => {
      const { id, createdAt, updatedAt, deleted, ...input } = createMockWorkspace();
      const created = await workspaceRepo.create(db, input);

      const updated = await workspaceRepo.update(db, created.id, {
        name: 'Updated Name',
        description: 'Updated description',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('Updated description');
      expect(updated.ownerUserId).toBe(input.ownerUserId); // Unchanged
    });

    it('throws when workspace not found', async () => {
      await expect(workspaceRepo.update(db, 'nonexistent', { name: 'test' })).rejects.toThrow(
        'Workspace not found or was deleted'
      );
    });
  });

  describe('delete', () => {
    it('soft deletes a workspace', async () => {
      const { id, createdAt, updatedAt, deleted, ...input } = createMockWorkspace();
      const created = await workspaceRepo.create(db, input);

      await workspaceRepo.delete(db, created.id);

      const found = await workspaceRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });

  describe('count', () => {
    it('counts workspaces for an owner', async () => {
      const {
        id: _1,
        createdAt: _1c,
        updatedAt: _1u,
        deleted: _1d,
        ...ws1
      } = createMockWorkspace({
        ownerUserId: 'user-1',
        name: 'WS 1',
      });
      const {
        id: _2,
        createdAt: _2c,
        updatedAt: _2u,
        deleted: _2d,
        ...ws2
      } = createMockWorkspace({
        ownerUserId: 'user-1',
        name: 'WS 2',
      });

      await workspaceRepo.create(db, ws1);
      await workspaceRepo.create(db, ws2);

      const count = await workspaceRepo.count(db, 'user-1');
      expect(count).toBe(2);
    });

    it('excludes soft deleted workspaces from count', async () => {
      const { id, createdAt, updatedAt, deleted, ...input } = createMockWorkspace({
        ownerUserId: 'user-1',
      });
      const created = await workspaceRepo.create(db, input);
      await workspaceRepo.delete(db, created.id);

      const count = await workspaceRepo.count(db, 'user-1');
      expect(count).toBe(0);
    });

    it('returns 0 when no workspaces', async () => {
      const count = await workspaceRepo.count(db, 'nonexistent');
      expect(count).toBe(0);
    });
  });

  describe('mapper integrity', () => {
    it('includes timestamp and soft delete fields', async () => {
      const { id, createdAt, updatedAt, deleted, ...input } = createMockWorkspace();

      const created = await workspaceRepo.create(db, input);

      expect(created.createdAt).toBeTruthy();
      expect(created.updatedAt).toBeTruthy();
      expect(created.deleted).toBe(false);
    });
  });
});
