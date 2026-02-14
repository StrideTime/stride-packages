/**
 * Subscription Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { subscriptionRepo } from '../../repositories/subscription.repo';
import { createTestDb } from '../setup';
import { createMockSubscription, createMockTrialSubscription } from '@stridetime/test-utils';

describe('SubscriptionRepository', () => {
  let db: any;

  beforeEach(() => {
    db = createTestDb();
  });

  describe('create', () => {
    it('creates a subscription', async () => {
      const { id, ...input } = createMockSubscription({
        userId: 'user-1',
        roleId: 'role-pro',
        status: 'ACTIVE',
        priceCents: 1999,
        billingPeriod: 'MONTHLY',
      });

      const created = await subscriptionRepo.create(db, input);

      expect(created.id).toBeTruthy();
      expect(created.userId).toBe('user-1');
      expect(created.roleId).toBe('role-pro');
      expect(created.status).toBe('ACTIVE');
      expect(created.priceCents).toBe(1999);
      expect(created.billingPeriod).toBe('MONTHLY');
      expect(created.isGrandfathered).toBe(false);
    });

    it('creates a trial subscription', async () => {
      const { id, ...input } = createMockTrialSubscription({
        userId: 'user-2',
      });

      const created = await subscriptionRepo.create(db, input);

      expect(created.status).toBe('TRIAL');
      expect(created.priceCents).toBe(0);
      expect(created.trialEndsAt).toBeTruthy();
    });
  });

  describe('findById', () => {
    it('returns subscription when found', async () => {
      const { id, ...input } = createMockSubscription();
      const created = await subscriptionRepo.create(db, input);

      const found = await subscriptionRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.userId).toBe(input.userId);
    });

    it('returns null when not found', async () => {
      const found = await subscriptionRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('returns subscription for a user', async () => {
      const { id, ...input } = createMockSubscription({
        userId: 'user-1',
      });
      await subscriptionRepo.create(db, input);

      const found = await subscriptionRepo.findByUser(db, 'user-1');

      expect(found).toBeDefined();
      expect(found?.userId).toBe('user-1');
    });

    it('returns null when user has no subscription', async () => {
      const found = await subscriptionRepo.findByUser(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('returns subscriptions with matching status', async () => {
      const { id: _1, ...active } = createMockSubscription({
        userId: 'user-1',
        status: 'ACTIVE',
      });
      const { id: _2, ...trial } = createMockTrialSubscription({
        userId: 'user-2',
      });

      await subscriptionRepo.create(db, active);
      await subscriptionRepo.create(db, trial);

      const activeResults = await subscriptionRepo.findByStatus(db, 'ACTIVE');
      expect(activeResults).toHaveLength(1);
      expect(activeResults[0].status).toBe('ACTIVE');

      const trialResults = await subscriptionRepo.findByStatus(db, 'TRIAL');
      expect(trialResults).toHaveLength(1);
      expect(trialResults[0].status).toBe('TRIAL');
    });

    it('returns empty array when no matches', async () => {
      const results = await subscriptionRepo.findByStatus(db, 'CANCELED');
      expect(results).toEqual([]);
    });
  });

  describe('findByRole', () => {
    it('returns subscriptions for a role', async () => {
      const { id: _1, ...sub1 } = createMockSubscription({
        userId: 'user-1',
        roleId: 'role-pro',
      });
      const { id: _2, ...sub2 } = createMockSubscription({
        userId: 'user-2',
        roleId: 'role-team',
      });

      await subscriptionRepo.create(db, sub1);
      await subscriptionRepo.create(db, sub2);

      const results = await subscriptionRepo.findByRole(db, 'role-pro');
      expect(results).toHaveLength(1);
      expect(results[0].roleId).toBe('role-pro');
    });
  });

  describe('findExpiredTrials', () => {
    it('returns trial subscriptions past their end date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const { id: _1, ...expired } = createMockTrialSubscription({
        userId: 'user-1',
        trialEndsAt: pastDate.toISOString(),
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);

      const { id: _2, ...active } = createMockTrialSubscription({
        userId: 'user-2',
        trialEndsAt: futureDate.toISOString(),
      });

      await subscriptionRepo.create(db, expired);
      await subscriptionRepo.create(db, active);

      const results = await subscriptionRepo.findExpiredTrials(db);
      expect(results).toHaveLength(1);
      expect(results[0].userId).toBe('user-1');
    });

    it('returns empty array when no expired trials', async () => {
      const results = await subscriptionRepo.findExpiredTrials(db);
      expect(results).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates subscription fields', async () => {
      const { id, ...input } = createMockSubscription({
        userId: 'user-1',
        status: 'ACTIVE',
      });
      const created = await subscriptionRepo.create(db, input);

      await subscriptionRepo.update(db, created.id, {
        status: 'CANCELED',
        canceledAt: new Date().toISOString(),
      });

      const found = await subscriptionRepo.findById(db, created.id);
      expect(found?.status).toBe('CANCELED');
      expect(found?.canceledAt).toBeTruthy();
    });

    it('updates grandfathering', async () => {
      const { id, ...input } = createMockSubscription({
        userId: 'user-1',
      });
      const created = await subscriptionRepo.create(db, input);

      await subscriptionRepo.update(db, created.id, {
        isGrandfathered: true,
        grandfatheredReason: 'Plan retired',
      });

      const found = await subscriptionRepo.findById(db, created.id);
      expect(found?.isGrandfathered).toBe(true);
      expect(found?.grandfatheredReason).toBe('Plan retired');
    });
  });
});
