/**
 * Admin Audit Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { adminAuditRepo } from '../../repositories/admin-audit.repo';
import { createTestDb } from '../setup';
import { createMockAdminAuditEntry } from '@stridetime/test-utils';

describe('AdminAuditRepository', () => {
  let db: any;

  beforeEach(() => {
    db = createTestDb();
  });

  describe('create', () => {
    it('creates an audit entry', async () => {
      const { id, ...input } = createMockAdminAuditEntry({
        adminUserId: 'admin-1',
        action: 'CREATE_PLAN',
        entityType: 'plan',
        entityId: 'plan-1',
        details: '{"name":"Pro"}',
      });

      const created = await adminAuditRepo.create(db, input);

      expect(created.id).toBeTruthy();
      expect(created.adminUserId).toBe('admin-1');
      expect(created.action).toBe('CREATE_PLAN');
      expect(created.entityType).toBe('plan');
      expect(created.entityId).toBe('plan-1');
      expect(created.details).toBe('{"name":"Pro"}');
      expect(created.performedAt).toBeTruthy();
    });

    it('creates an entry with null details', async () => {
      const { id, ...input } = createMockAdminAuditEntry({
        details: null,
      });

      const created = await adminAuditRepo.create(db, input);

      expect(created.details).toBeNull();
    });

    it('sets performedAt automatically when not provided', async () => {
      const { id, performedAt, ...input } = createMockAdminAuditEntry();

      const created = await adminAuditRepo.create(db, {
        ...input,
        performedAt: '',
      });

      expect(created.performedAt).toBeTruthy();
    });
  });

  describe('findById', () => {
    it('returns entry when found', async () => {
      const { id, ...input } = createMockAdminAuditEntry();
      const created = await adminAuditRepo.create(db, input);

      const found = await adminAuditRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.action).toBe(input.action);
    });

    it('returns null when not found', async () => {
      const found = await adminAuditRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByEntity', () => {
    it('returns entries matching entity type and ID', async () => {
      const { id: _1, ...input1 } = createMockAdminAuditEntry({
        entityType: 'plan',
        entityId: 'plan-1',
        action: 'UPDATE_PLAN',
      });
      const { id: _2, ...input2 } = createMockAdminAuditEntry({
        entityType: 'plan',
        entityId: 'plan-1',
        action: 'ACTIVATE_PLAN',
      });
      const { id: _3, ...input3 } = createMockAdminAuditEntry({
        entityType: 'user',
        entityId: 'user-1',
        action: 'BAN_USER',
      });

      await adminAuditRepo.create(db, input1);
      await adminAuditRepo.create(db, input2);
      await adminAuditRepo.create(db, input3);

      const results = await adminAuditRepo.findByEntity(db, 'plan', 'plan-1');
      expect(results).toHaveLength(2);
      expect(results.every(r => r.entityType === 'plan' && r.entityId === 'plan-1')).toBe(true);
    });

    it('returns empty array when no matches', async () => {
      const results = await adminAuditRepo.findByEntity(db, 'plan', 'nonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('findByAdmin', () => {
    it('returns entries for a specific admin', async () => {
      const { id: _1, ...input1 } = createMockAdminAuditEntry({
        adminUserId: 'admin-1',
        action: 'UPDATE_PLAN',
      });
      const { id: _2, ...input2 } = createMockAdminAuditEntry({
        adminUserId: 'admin-2',
        action: 'CREATE_PLAN',
      });

      await adminAuditRepo.create(db, input1);
      await adminAuditRepo.create(db, input2);

      const results = await adminAuditRepo.findByAdmin(db, 'admin-1');
      expect(results).toHaveLength(1);
      expect(results[0].adminUserId).toBe('admin-1');
    });

    it('respects limit parameter', async () => {
      for (let i = 0; i < 5; i++) {
        const { id, ...input } = createMockAdminAuditEntry({
          adminUserId: 'admin-1',
          action: `ACTION_${i}`,
        });
        await adminAuditRepo.create(db, input);
      }

      const results = await adminAuditRepo.findByAdmin(db, 'admin-1', 3);
      expect(results).toHaveLength(3);
    });
  });

  describe('findRecent', () => {
    it('returns recent entries', async () => {
      for (let i = 0; i < 3; i++) {
        const { id, ...input } = createMockAdminAuditEntry({
          action: `ACTION_${i}`,
        });
        await adminAuditRepo.create(db, input);
      }

      const results = await adminAuditRepo.findRecent(db);
      expect(results).toHaveLength(3);
    });

    it('respects limit parameter', async () => {
      for (let i = 0; i < 5; i++) {
        const { id, ...input } = createMockAdminAuditEntry({
          action: `ACTION_${i}`,
        });
        await adminAuditRepo.create(db, input);
      }

      const results = await adminAuditRepo.findRecent(db, 2);
      expect(results).toHaveLength(2);
    });
  });
});
