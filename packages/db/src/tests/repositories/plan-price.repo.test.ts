/**
 * Plan Price Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { planPriceRepo } from '../../repositories/plan-price.repo';
import { planRepo } from '../../repositories/plan.repo';
import { createTestDb } from '../setup';
import {
  createMockPlan,
  createMockPlanPrice,
  createMockMonthlyPrice,
  createMockYearlyPrice,
} from '@stridetime/test-utils';
import type { Plan } from '@stridetime/types';

describe('PlanPriceRepository', () => {
  let db: any;
  let testPlan: Plan;

  beforeEach(async () => {
    db = createTestDb();

    // Create a test plan
    const { id, ...planInput } = createMockPlan({ displayName: 'Test Plan' });
    testPlan = await planRepo.create(db, planInput);
  });

  describe('create', () => {
    it('creates a plan price with generated ID', async () => {
      const { id, ...priceInput } = createMockMonthlyPrice({
        roleId: testPlan.id,
        priceCents: 999,
      });

      const created = await planPriceRepo.create(db, priceInput);

      expect(created.id).toBeTruthy();
      expect(created.roleId).toBe(testPlan.id);
      expect(created.billingPeriod).toBe('MONTHLY');
      expect(created.priceCents).toBe(999);
      expect(created.isActive).toBe(true);
    });
  });

  describe('findByPlan', () => {
    it('returns all prices for a plan', async () => {
      const { id: id1, ...monthly } = createMockMonthlyPrice({ roleId: testPlan.id });
      const { id: id2, ...yearly } = createMockYearlyPrice({ roleId: testPlan.id });

      await planPriceRepo.create(db, monthly);
      await planPriceRepo.create(db, yearly);

      const prices = await planPriceRepo.findByPlan(db, testPlan.id);

      expect(prices.length).toBe(2);
      expect(prices.every(p => p.roleId === testPlan.id)).toBe(true);
    });
  });

  describe('findByPlanAndPeriod', () => {
    it('returns the price for a specific plan and billing period', async () => {
      const { id: id1, ...monthly } = createMockMonthlyPrice({ roleId: testPlan.id });
      const { id: id2, ...yearly } = createMockYearlyPrice({ roleId: testPlan.id });

      await planPriceRepo.create(db, monthly);
      await planPriceRepo.create(db, yearly);

      const monthlyPrice = await planPriceRepo.findByPlanAndPeriod(db, testPlan.id, 'MONTHLY');

      expect(monthlyPrice).toBeDefined();
      expect(monthlyPrice?.billingPeriod).toBe('MONTHLY');
    });

    it('returns null when no matching price exists', async () => {
      const price = await planPriceRepo.findByPlanAndPeriod(db, testPlan.id, 'LIFETIME');
      expect(price).toBeNull();
    });
  });

  describe('findActive', () => {
    it('returns only active prices across all plans', async () => {
      const { id: p1, ...plan1 } = createMockPlan({ displayName: 'Plan 1' });
      const { id: p2, ...plan2 } = createMockPlan({ displayName: 'Plan 2' });
      const testPlan1 = await planRepo.create(db, plan1);
      const testPlan2 = await planRepo.create(db, plan2);

      const { id: id1, ...price1 } = createMockMonthlyPrice({ roleId: testPlan1.id });
      const { id: id2, ...price2 } = createMockYearlyPrice({ roleId: testPlan2.id });
      await planPriceRepo.create(db, price1);
      const created2 = await planPriceRepo.create(db, price2);

      await planPriceRepo.deactivate(db, created2.id);

      const active = await planPriceRepo.findActive(db);

      expect(active.length).toBeGreaterThanOrEqual(1);
      expect(active.every(p => p.isActive)).toBe(true);
    });
  });

  describe('update', () => {
    it('updates price fields', async () => {
      const { id, ...priceInput } = createMockMonthlyPrice({ roleId: testPlan.id });
      const created = await planPriceRepo.create(db, priceInput);

      await planPriceRepo.update(db, created.id, {
        priceCents: 1299,
        stripePriceId: 'price_updated',
      });

      const updated = await planPriceRepo.findById(db, created.id);

      expect(updated?.priceCents).toBe(1299);
      expect(updated?.stripePriceId).toBe('price_updated');
    });
  });

  describe('deactivate', () => {
    it('sets isActive to false', async () => {
      const { id, ...priceInput } = createMockMonthlyPrice({ roleId: testPlan.id });
      const created = await planPriceRepo.create(db, priceInput);

      await planPriceRepo.deactivate(db, created.id);

      const deactivated = await planPriceRepo.findById(db, created.id);

      expect(deactivated?.isActive).toBe(false);
    });
  });
});
