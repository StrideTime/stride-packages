/**
 * Plan Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { planRepo } from '../../repositories/plan.repo';
import { featureRepo } from '../../repositories/feature.repo';
import { createTestDb } from '../setup';
import {
  createMockPlan,
  createMockProPlan,
  createMockFeature,
  createMockLimitFeature,
} from '@stridetime/test-utils';
import type { Plan, Feature } from '@stridetime/types';

describe('PlanRepository', () => {
  let db: any;

  beforeEach(async () => {
    db = createTestDb();
  });

  describe('create', () => {
    it('creates a plan with generated ID', async () => {
      const { id, ...planInput } = createMockPlan({
        displayName: 'Free Plan',
        description: 'Basic features',
      });

      const created = await planRepo.create(db, planInput);

      expect(created.id).toBeTruthy();
      expect(created.displayName).toBe('Free Plan');
      expect(created.description).toBe('Basic features');
      expect(created.isActive).toBe(true);
    });
  });

  describe('findAll', () => {
    it('returns only active plans by default', async () => {
      const { id: id1, ...plan1 } = createMockPlan({ displayName: 'Free' });
      const { id: id2, ...plan2 } = createMockProPlan({ displayName: 'Pro' });
      await planRepo.create(db, plan1);
      await planRepo.create(db, plan2);

      const { id: id3, ...plan3 } = createMockPlan({ displayName: 'Inactive' });
      const inactive = await planRepo.create(db, plan3);
      await planRepo.deactivate(db, inactive.id);

      const active = await planRepo.findAll(db);

      expect(active.length).toBe(2);
      expect(active.every(p => p.isActive)).toBe(true);
    });

    it('returns all plans when includeInactive is true', async () => {
      const { id: id1, ...plan1 } = createMockPlan();
      const created = await planRepo.create(db, plan1);
      await planRepo.deactivate(db, created.id);

      const all = await planRepo.findAll(db, true);

      expect(all.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('deactivate', () => {
    it('sets isActive to false', async () => {
      const { id, ...planInput } = createMockPlan();
      const created = await planRepo.create(db, planInput);

      await planRepo.deactivate(db, created.id);

      const deactivated = await planRepo.findById(db, created.id);

      expect(deactivated?.isActive).toBe(false);
    });
  });

  describe('getPlanFeatures', () => {
    it('returns all features for a plan', async () => {
      const { id: planId, ...planInput } = createMockPlan();
      const plan = await planRepo.create(db, planInput);

      const { id: f1, ...feature1 } = createMockFeature({ key: 'cloud_sync' });
      const { id: f2, ...feature2 } = createMockFeature({ key: 'mobile_app' });
      const feat1 = await featureRepo.create(db, feature1);
      const feat2 = await featureRepo.create(db, feature2);

      await planRepo.setPlanFeature(db, plan.id, feat1.id, true);
      await planRepo.setPlanFeature(db, plan.id, feat2.id, true);

      const planFeatures = await planRepo.getPlanFeatures(db, plan.id);

      expect(planFeatures.length).toBe(2);
      expect(planFeatures.every(pf => pf.roleId === plan.id)).toBe(true);
    });
  });

  describe('setPlanFeature', () => {
    it('sets a boolean feature (enabled)', async () => {
      const { id: planId, ...planInput } = createMockPlan();
      const plan = await planRepo.create(db, planInput);

      const { id: fId, ...featureInput } = createMockFeature({ key: 'cloud_sync' });
      const feature = await featureRepo.create(db, featureInput);

      await planRepo.setPlanFeature(db, plan.id, feature.id, true);

      const planFeatures = await planRepo.getPlanFeatures(db, plan.id);

      expect(planFeatures.length).toBe(1);
      expect(planFeatures[0].enabled).toBe(true);
      expect(planFeatures[0].limitValue).toBeNull();
    });

    it('sets a limit feature with a value', async () => {
      const { id: planId, ...planInput } = createMockPlan();
      const plan = await planRepo.create(db, planInput);

      const { id: fId, ...featureInput } = createMockLimitFeature({ key: 'max_workspaces' });
      const feature = await featureRepo.create(db, featureInput);

      await planRepo.setPlanFeature(db, plan.id, feature.id, true, 5);

      const planFeatures = await planRepo.getPlanFeatures(db, plan.id);

      expect(planFeatures.length).toBe(1);
      expect(planFeatures[0].enabled).toBe(true);
      expect(planFeatures[0].limitValue).toBe(5);
    });

    it('updates existing plan feature', async () => {
      const { id: planId, ...planInput } = createMockPlan();
      const plan = await planRepo.create(db, planInput);

      const { id: fId, ...featureInput } = createMockLimitFeature({ key: 'max_projects' });
      const feature = await featureRepo.create(db, featureInput);

      await planRepo.setPlanFeature(db, plan.id, feature.id, true, 10);
      await planRepo.setPlanFeature(db, plan.id, feature.id, true, 20);

      const planFeatures = await planRepo.getPlanFeatures(db, plan.id);

      expect(planFeatures.length).toBe(1);
      expect(planFeatures[0].limitValue).toBe(20);
    });
  });

  describe('removePlanFeature', () => {
    it('removes a plan feature', async () => {
      const { id: planId, ...planInput } = createMockPlan();
      const plan = await planRepo.create(db, planInput);

      const { id: fId, ...featureInput } = createMockFeature({ key: 'api_access' });
      const feature = await featureRepo.create(db, featureInput);

      await planRepo.setPlanFeature(db, plan.id, feature.id, true);
      await planRepo.removePlanFeature(db, plan.id, feature.id);

      const planFeatures = await planRepo.getPlanFeatures(db, plan.id);

      expect(planFeatures.length).toBe(0);
    });
  });

  describe('getPlansWithFeature', () => {
    it('returns all plans that include a specific feature', async () => {
      const { id: p1, ...plan1 } = createMockPlan({ displayName: 'Free' });
      const { id: p2, ...plan2 } = createMockProPlan({ displayName: 'Pro' });
      const free = await planRepo.create(db, plan1);
      const pro = await planRepo.create(db, plan2);

      const { id: fId, ...featureInput } = createMockFeature({ key: 'cloud_sync' });
      const feature = await featureRepo.create(db, featureInput);

      await planRepo.setPlanFeature(db, free.id, feature.id, false); // Free: disabled
      await planRepo.setPlanFeature(db, pro.id, feature.id, true); // Pro: enabled

      const plansWithFeature = await planRepo.getPlansWithFeature(db, 'cloud_sync');

      expect(plansWithFeature.length).toBe(1);
      expect(plansWithFeature[0].displayName).toBe('Pro');
    });

    it('returns empty array when feature key does not exist', async () => {
      const plans = await planRepo.getPlansWithFeature(db, 'nonexistent_feature');
      expect(plans.length).toBe(0);
    });
  });
});
