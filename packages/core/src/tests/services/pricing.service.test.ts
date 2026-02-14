/**
 * Unit tests for PricingService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PricingService } from '../../services/pricing.service';
import {
  createMockDatabase,
  createMockPlan,
  createMockFeature,
  createMockLimitFeature,
  createMockPlanPrice,
  createMockPlanFeature,
  createMockLimitPlanFeature,
  createMockSubscription,
  createMockTrialSubscription,
} from '@stridetime/test-utils';
import { ValidationError } from '@stridetime/types';

// Create hoisted mocks
const { mockFeatureRepo, mockPlanRepo, mockPlanPriceRepo, mockSubscriptionRepo } = vi.hoisted(
  () => ({
    mockFeatureRepo: {
      create: vi.fn(),
      findById: vi.fn(),
      findByKey: vi.fn(),
      findAll: vi.fn(),
      findActive: vi.fn(),
      update: vi.fn(),
      deactivate: vi.fn(),
      delete: vi.fn(),
    },
    mockPlanRepo: {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findActive: vi.fn(),
      update: vi.fn(),
      deactivate: vi.fn(),
      delete: vi.fn(),
      setPlanFeature: vi.fn(),
      getPlanFeatures: vi.fn(),
    },
    mockPlanPriceRepo: {
      create: vi.fn(),
      findById: vi.fn(),
      findByPlan: vi.fn(),
      findByPlanAndPeriod: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    mockSubscriptionRepo: {
      create: vi.fn(),
      findById: vi.fn(),
      findByUser: vi.fn(),
      findByStatus: vi.fn(),
      findByRole: vi.fn(),
      findExpiredTrials: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  })
);

// Mock the module
vi.mock('@stridetime/db', () => ({
  featureRepo: mockFeatureRepo,
  FeatureRepository: vi.fn(),
  planRepo: mockPlanRepo,
  PlanRepository: vi.fn(),
  planPriceRepo: mockPlanPriceRepo,
  PlanPriceRepository: vi.fn(),
  subscriptionRepo: mockSubscriptionRepo,
  SubscriptionRepository: vi.fn(),
  initDatabase: vi.fn(),
  getDatabase: vi.fn(),
  closeDatabase: vi.fn(),
  isDatabaseInitialized: vi.fn(),
  getPowerSyncDatabase: vi.fn(),
  getConnector: vi.fn(),
  connectSync: vi.fn(),
  disconnectSync: vi.fn(),
  isSyncEnabled: vi.fn(),
  getSyncStatus: vi.fn(),
  onSyncStatusChange: vi.fn(),
  SupabaseConnector: vi.fn(),
  SupabaseAuthProvider: vi.fn(),
  WorkspaceRepository: vi.fn(),
  workspaceRepo: vi.fn(),
  TimeEntryRepository: vi.fn(),
  timeEntryRepo: vi.fn(),
  UserRepository: vi.fn(),
  userRepo: vi.fn(),
  TaskRepository: vi.fn(),
  taskRepo: vi.fn(),
  ProjectRepository: vi.fn(),
  projectRepo: vi.fn(),
  AdminAuditRepository: vi.fn(),
  adminAuditRepo: vi.fn(),
  BreakRepository: vi.fn(),
  breakRepo: vi.fn(),
  DailySummaryRepository: vi.fn(),
  dailySummaryRepo: vi.fn(),
  generateId: vi.fn(),
  now: vi.fn(),
  today: vi.fn(),
}));

describe('PricingService', () => {
  let service: PricingService;
  let mockDb: any;

  beforeEach(() => {
    service = new PricingService(
      mockFeatureRepo as any,
      mockPlanRepo as any,
      mockPlanPriceRepo as any,
      mockSubscriptionRepo as any
    );
    mockDb = createMockDatabase();
    vi.clearAllMocks();
  });

  // ==========================================================================
  // PLAN QUERIES
  // ==========================================================================

  describe('getAvailablePlans', () => {
    it('should return all active plans with prices and features', async () => {
      const plans = [
        createMockPlan({ id: 'plan-1', displayName: 'Free' }),
        createMockPlan({ id: 'plan-2', displayName: 'Pro' }),
      ];
      mockPlanRepo.findActive.mockResolvedValue(plans);
      mockPlanPriceRepo.findByPlan.mockImplementation((_db: any, planId: string) => {
        if (planId === 'plan-1') return Promise.resolve([]);
        return Promise.resolve([createMockPlanPrice({ roleId: 'plan-2' })]);
      });
      mockPlanRepo.getPlanFeatures.mockResolvedValue([createMockPlanFeature()]);

      const result = await service.getAvailablePlans(mockDb);

      expect(result).toHaveLength(2);
      expect(result[0].plan.displayName).toBe('Free');
      expect(result[0].prices).toHaveLength(0);
      expect(result[1].prices).toHaveLength(1);
      expect(result[0].features).toHaveLength(1);
    });

    it('should return empty array when no active plans', async () => {
      mockPlanRepo.findActive.mockResolvedValue([]);

      const result = await service.getAvailablePlans(mockDb);

      expect(result).toEqual([]);
    });
  });

  describe('getUserPlan', () => {
    it('should return user plan details', async () => {
      const sub = createMockSubscription({ userId: 'user-1', roleId: 'plan-pro' });
      const plan = createMockPlan({ id: 'plan-pro', displayName: 'Pro' });
      const features = [createMockPlanFeature()];
      const prices = [createMockPlanPrice({ roleId: 'plan-pro' })];

      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockPlanRepo.findById.mockResolvedValue(plan);
      mockPlanRepo.getPlanFeatures.mockResolvedValue(features);
      mockPlanPriceRepo.findByPlan.mockResolvedValue(prices);

      const result = await service.getUserPlan(mockDb, 'user-1');

      expect(result.plan.id).toBe('plan-pro');
      expect(result.subscription.userId).toBe('user-1');
      expect(result.features).toHaveLength(1);
      expect(result.prices).toHaveLength(1);
    });

    it('should throw when user has no subscription', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);

      await expect(service.getUserPlan(mockDb, 'user-1')).rejects.toThrow(ValidationError);
    });

    it('should throw when subscription references nonexistent plan', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(
        createMockSubscription({ roleId: 'deleted-plan' })
      );
      mockPlanRepo.findById.mockResolvedValue(null);

      await expect(service.getUserPlan(mockDb, 'user-1')).rejects.toThrow(ValidationError);
    });
  });

  // ==========================================================================
  // FEATURE CHECKS
  // ==========================================================================

  describe('hasFeature', () => {
    it('should return true when user has enabled feature', async () => {
      const sub = createMockSubscription({ roleId: 'plan-pro' });
      const feature = createMockFeature({ id: 'feat-1', key: 'cloud_sync' });
      const planFeature = createMockPlanFeature({
        featureId: 'feat-1',
        enabled: true,
      });

      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockFeatureRepo.findByKey.mockResolvedValue(feature);
      mockPlanRepo.getPlanFeatures.mockResolvedValue([planFeature]);

      const result = await service.hasFeature(mockDb, 'user-1', 'cloud_sync');

      expect(result).toBe(true);
    });

    it('should return false when user has no subscription', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);

      const result = await service.hasFeature(mockDb, 'user-1', 'cloud_sync');

      expect(result).toBe(false);
    });

    it('should return false when feature does not exist', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(createMockSubscription());
      mockFeatureRepo.findByKey.mockResolvedValue(null);

      const result = await service.hasFeature(mockDb, 'user-1', 'nonexistent');

      expect(result).toBe(false);
    });

    it('should return false when feature is not enabled for plan', async () => {
      const sub = createMockSubscription({ roleId: 'plan-free' });
      const feature = createMockFeature({ id: 'feat-1', key: 'cloud_sync' });
      const planFeature = createMockPlanFeature({
        featureId: 'feat-1',
        enabled: false,
      });

      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockFeatureRepo.findByKey.mockResolvedValue(feature);
      mockPlanRepo.getPlanFeatures.mockResolvedValue([planFeature]);

      const result = await service.hasFeature(mockDb, 'user-1', 'cloud_sync');

      expect(result).toBe(false);
    });

    it('should return false when plan has no matching feature', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(createMockSubscription());
      mockFeatureRepo.findByKey.mockResolvedValue(createMockFeature({ id: 'feat-99' }));
      mockPlanRepo.getPlanFeatures.mockResolvedValue([
        createMockPlanFeature({ featureId: 'feat-1' }),
      ]);

      const result = await service.hasFeature(mockDb, 'user-1', 'some_feature');

      expect(result).toBe(false);
    });
  });

  describe('getFeatureLimit', () => {
    it('should return limit value for enabled LIMIT feature', async () => {
      const sub = createMockSubscription({ roleId: 'plan-pro' });
      const feature = createMockLimitFeature({ id: 'feat-1', key: 'max_workspaces' });
      const planFeature = createMockLimitPlanFeature(5, {
        featureId: 'feat-1',
        enabled: true,
      });

      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockFeatureRepo.findByKey.mockResolvedValue(feature);
      mockPlanRepo.getPlanFeatures.mockResolvedValue([planFeature]);

      const result = await service.getFeatureLimit(mockDb, 'user-1', 'max_workspaces');

      expect(result).toBe(5);
    });

    it('should return null when user has no subscription', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);

      const result = await service.getFeatureLimit(mockDb, 'user-1', 'max_workspaces');

      expect(result).toBeNull();
    });

    it('should return null when feature not found', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(createMockSubscription());
      mockFeatureRepo.findByKey.mockResolvedValue(null);

      const result = await service.getFeatureLimit(mockDb, 'user-1', 'nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when feature is disabled', async () => {
      const sub = createMockSubscription({ roleId: 'plan-free' });
      const feature = createMockLimitFeature({ id: 'feat-1' });
      const planFeature = createMockPlanFeature({
        featureId: 'feat-1',
        enabled: false,
        limitValue: 5,
      });

      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockFeatureRepo.findByKey.mockResolvedValue(feature);
      mockPlanRepo.getPlanFeatures.mockResolvedValue([planFeature]);

      const result = await service.getFeatureLimit(mockDb, 'user-1', 'max_workspaces');

      expect(result).toBeNull();
    });
  });

  // ==========================================================================
  // PLAN COMPARISON
  // ==========================================================================

  describe('comparePlans', () => {
    it('should identify gained features', async () => {
      const currentFeatures = [createMockPlanFeature({ featureId: 'feat-1', enabled: true })];
      const targetFeatures = [
        createMockPlanFeature({ featureId: 'feat-1', enabled: true }),
        createMockPlanFeature({ featureId: 'feat-2', enabled: true }),
      ];

      mockPlanRepo.getPlanFeatures
        .mockResolvedValueOnce(currentFeatures)
        .mockResolvedValueOnce(targetFeatures);
      mockFeatureRepo.findById.mockResolvedValue(
        createMockFeature({ id: 'feat-2', key: 'new_feature' })
      );

      const result = await service.comparePlans(mockDb, 'plan-free', 'plan-pro');

      expect(result.gained).toHaveLength(1);
      expect(result.gained[0].id).toBe('feat-2');
      expect(result.lost).toHaveLength(0);
    });

    it('should identify lost features', async () => {
      const currentFeatures = [
        createMockPlanFeature({ featureId: 'feat-1', enabled: true }),
        createMockPlanFeature({ featureId: 'feat-2', enabled: true }),
      ];
      const targetFeatures = [createMockPlanFeature({ featureId: 'feat-1', enabled: true })];

      mockPlanRepo.getPlanFeatures
        .mockResolvedValueOnce(currentFeatures)
        .mockResolvedValueOnce(targetFeatures);
      mockFeatureRepo.findById.mockResolvedValue(
        createMockFeature({ id: 'feat-2', key: 'lost_feature' })
      );

      const result = await service.comparePlans(mockDb, 'plan-pro', 'plan-free');

      expect(result.gained).toHaveLength(0);
      expect(result.lost).toHaveLength(1);
      expect(result.lost[0].id).toBe('feat-2');
    });

    it('should identify limit changes', async () => {
      const currentFeatures = [
        createMockLimitPlanFeature(5, { featureId: 'feat-1', enabled: true }),
      ];
      const targetFeatures = [
        createMockLimitPlanFeature(10, { featureId: 'feat-1', enabled: true }),
      ];

      mockPlanRepo.getPlanFeatures
        .mockResolvedValueOnce(currentFeatures)
        .mockResolvedValueOnce(targetFeatures);
      mockFeatureRepo.findById.mockResolvedValue(createMockLimitFeature({ id: 'feat-1' }));

      const result = await service.comparePlans(mockDb, 'plan-free', 'plan-pro');

      expect(result.limitChanges).toHaveLength(1);
      expect(result.limitChanges[0].currentLimit).toBe(5);
      expect(result.limitChanges[0].newLimit).toBe(10);
    });

    it('should return empty comparison for identical plans', async () => {
      const features = [
        createMockPlanFeature({ featureId: 'feat-1', enabled: true, limitValue: null }),
      ];
      mockPlanRepo.getPlanFeatures.mockResolvedValueOnce(features).mockResolvedValueOnce(features);

      const result = await service.comparePlans(mockDb, 'plan-1', 'plan-1');

      expect(result.gained).toHaveLength(0);
      expect(result.lost).toHaveLength(0);
      expect(result.limitChanges).toHaveLength(0);
    });
  });

  // ==========================================================================
  // SUBSCRIPTION LIFECYCLE
  // ==========================================================================

  describe('createSubscription', () => {
    it('should create a subscription with valid params', async () => {
      const plan = createMockPlan({ id: 'plan-pro', isActive: true });
      const price = createMockPlanPrice({
        priceCents: 999,
        currency: 'USD',
        stripePriceId: 'sp_1',
      });
      const createdSub = createMockSubscription({
        userId: 'user-1',
        roleId: 'plan-pro',
        status: 'ACTIVE',
      });

      mockPlanRepo.findById.mockResolvedValue(plan);
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);
      mockPlanPriceRepo.findByPlanAndPeriod.mockResolvedValue(price);
      mockSubscriptionRepo.create.mockResolvedValue(createdSub);

      const result = await service.createSubscription(mockDb, 'user-1', 'plan-pro', 'MONTHLY');

      expect(result.userId).toBe('user-1');
      expect(mockSubscriptionRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          userId: 'user-1',
          roleId: 'plan-pro',
          status: 'ACTIVE',
          priceCents: 999,
        })
      );
    });

    it('should create a trial subscription when trialDays provided', async () => {
      const plan = createMockPlan({ id: 'plan-pro', isActive: true });
      const price = createMockPlanPrice({ priceCents: 999 });
      const createdSub = createMockSubscription({ status: 'TRIAL' });

      mockPlanRepo.findById.mockResolvedValue(plan);
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);
      mockPlanPriceRepo.findByPlanAndPeriod.mockResolvedValue(price);
      mockSubscriptionRepo.create.mockResolvedValue(createdSub);

      await service.createSubscription(mockDb, 'user-1', 'plan-pro', 'MONTHLY', 14);

      expect(mockSubscriptionRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          status: 'TRIAL',
          trialEndsAt: expect.any(String),
        })
      );
    });

    it('should throw when plan is inactive', async () => {
      mockPlanRepo.findById.mockResolvedValue(createMockPlan({ isActive: false }));

      await expect(
        service.createSubscription(mockDb, 'user-1', 'plan-1', 'MONTHLY')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw when plan not found', async () => {
      mockPlanRepo.findById.mockResolvedValue(null);

      await expect(
        service.createSubscription(mockDb, 'user-1', 'nonexistent', 'MONTHLY')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw when user already has a subscription', async () => {
      mockPlanRepo.findById.mockResolvedValue(createMockPlan({ isActive: true }));
      mockSubscriptionRepo.findByUser.mockResolvedValue(createMockSubscription());

      await expect(
        service.createSubscription(mockDb, 'user-1', 'plan-1', 'MONTHLY')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw when no price found for billing period', async () => {
      mockPlanRepo.findById.mockResolvedValue(createMockPlan({ isActive: true }));
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);
      mockPlanPriceRepo.findByPlanAndPeriod.mockResolvedValue(null);

      await expect(
        service.createSubscription(mockDb, 'user-1', 'plan-1', 'YEARLY')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('upgradePlan', () => {
    it('should upgrade user plan', async () => {
      const sub = createMockSubscription({ id: 'sub-1', userId: 'user-1', roleId: 'plan-free' });
      const newPlan = createMockPlan({ id: 'plan-pro', isActive: true });
      const newPrice = createMockPlanPrice({ priceCents: 1999, stripePriceId: 'sp_pro' });
      const updatedSub = createMockSubscription({
        id: 'sub-1',
        roleId: 'plan-pro',
        priceCents: 1999,
      });

      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockPlanRepo.findById.mockResolvedValue(newPlan);
      mockPlanPriceRepo.findByPlanAndPeriod.mockResolvedValue(newPrice);
      mockSubscriptionRepo.update.mockResolvedValue(undefined);
      mockSubscriptionRepo.findById.mockResolvedValue(updatedSub);

      const result = await service.upgradePlan(mockDb, 'user-1', 'plan-pro', 'MONTHLY');

      expect(result.roleId).toBe('plan-pro');
      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith(
        mockDb,
        'sub-1',
        expect.objectContaining({
          roleId: 'plan-pro',
          priceCents: 1999,
        })
      );
    });

    it('should throw when user has no subscription', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);

      await expect(service.upgradePlan(mockDb, 'user-1', 'plan-pro', 'MONTHLY')).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw when target plan is inactive', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(createMockSubscription());
      mockPlanRepo.findById.mockResolvedValue(createMockPlan({ isActive: false }));

      await expect(service.upgradePlan(mockDb, 'user-1', 'plan-pro', 'MONTHLY')).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw when no price found', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(createMockSubscription());
      mockPlanRepo.findById.mockResolvedValue(createMockPlan({ isActive: true }));
      mockPlanPriceRepo.findByPlanAndPeriod.mockResolvedValue(null);

      await expect(service.upgradePlan(mockDb, 'user-1', 'plan-pro', 'MONTHLY')).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('downgradePlan', () => {
    it('should delegate to upgradePlan (same logic for now)', async () => {
      const sub = createMockSubscription({ id: 'sub-1', roleId: 'plan-pro' });
      const newPlan = createMockPlan({ id: 'plan-free', isActive: true });
      const newPrice = createMockPlanPrice({ priceCents: 0 });
      const updatedSub = createMockSubscription({ id: 'sub-1', roleId: 'plan-free' });

      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockPlanRepo.findById.mockResolvedValue(newPlan);
      mockPlanPriceRepo.findByPlanAndPeriod.mockResolvedValue(newPrice);
      mockSubscriptionRepo.update.mockResolvedValue(undefined);
      mockSubscriptionRepo.findById.mockResolvedValue(updatedSub);

      const result = await service.downgradePlan(mockDb, 'user-1', 'plan-free', 'MONTHLY');

      expect(result.roleId).toBe('plan-free');
    });
  });

  describe('cancelSubscription', () => {
    it('should set canceledAt on subscription', async () => {
      const sub = createMockSubscription({ id: 'sub-1', userId: 'user-1' });
      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockSubscriptionRepo.update.mockResolvedValue(undefined);

      await service.cancelSubscription(mockDb, 'user-1');

      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith(
        mockDb,
        'sub-1',
        expect.objectContaining({
          canceledAt: expect.any(String),
        })
      );
    });

    it('should throw when user has no subscription', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);

      await expect(service.cancelSubscription(mockDb, 'user-1')).rejects.toThrow(ValidationError);
    });
  });

  describe('startTrial', () => {
    it('should start a trial using createSubscription', async () => {
      const plan = createMockPlan({ id: 'plan-pro', isActive: true });
      const price = createMockPlanPrice({ priceCents: 999 });
      const createdSub = createMockTrialSubscription({ userId: 'user-1' });

      mockSubscriptionRepo.findByUser.mockResolvedValue(null);
      mockPlanRepo.findById.mockResolvedValue(plan);
      mockPlanPriceRepo.findByPlanAndPeriod.mockResolvedValue(price);
      mockSubscriptionRepo.create.mockResolvedValue(createdSub);

      const result = await service.startTrial(mockDb, 'user-1', 'plan-pro', 14);

      expect(result.status).toBe('TRIAL');
    });

    it('should throw when user already has subscription', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(createMockSubscription());

      await expect(service.startTrial(mockDb, 'user-1', 'plan-pro', 14)).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('expireTrials', () => {
    it('should cancel all expired trials', async () => {
      const expired = [
        createMockTrialSubscription({ id: 'sub-1', userId: 'user-1' }),
        createMockTrialSubscription({ id: 'sub-2', userId: 'user-2' }),
      ];
      mockSubscriptionRepo.findExpiredTrials.mockResolvedValue(expired);
      mockSubscriptionRepo.update.mockResolvedValue(undefined);

      const count = await service.expireTrials(mockDb);

      expect(count).toBe(2);
      expect(mockSubscriptionRepo.update).toHaveBeenCalledTimes(2);
      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith(mockDb, 'sub-1', {
        status: 'CANCELED',
      });
    });

    it('should return 0 when no expired trials', async () => {
      mockSubscriptionRepo.findExpiredTrials.mockResolvedValue([]);

      const count = await service.expireTrials(mockDb);

      expect(count).toBe(0);
      expect(mockSubscriptionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('isGrandfathered', () => {
    it('should return true when subscription is grandfathered', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(
        createMockSubscription({ isGrandfathered: true })
      );

      const result = await service.isGrandfathered(mockDb, 'user-1');

      expect(result).toBe(true);
    });

    it('should return false when subscription is not grandfathered', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(
        createMockSubscription({ isGrandfathered: false })
      );

      const result = await service.isGrandfathered(mockDb, 'user-1');

      expect(result).toBe(false);
    });

    it('should return false when user has no subscription', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);

      const result = await service.isGrandfathered(mockDb, 'user-1');

      expect(result).toBe(false);
    });
  });
});
