/**
 * Pricing Service
 *
 * Handles dynamic feature resolution and subscription lifecycle management.
 * Features are resolved from plan_features table (not hardcoded columns).
 */

import {
  featureRepo as defaultFeatureRepo,
  type FeatureRepository,
  planRepo as defaultPlanRepo,
  type PlanRepository,
  planPriceRepo as defaultPlanPriceRepo,
  type PlanPriceRepository,
  subscriptionRepo as defaultSubscriptionRepo,
  type SubscriptionRepository,
  type StrideDatabase,
} from '@stridetime/db';
import type {
  Plan,
  PlanPrice,
  PlanFeature,
  Feature,
  UserSubscription,
  BillingPeriod,
} from '@stridetime/types';
import { sanitizeFields } from '../utils/sanitize';
import { ValidationError } from '@stridetime/types';

// ============================================================================
// COMPOSITE TYPES
// ============================================================================

export interface PlanWithPrices {
  plan: Plan;
  prices: PlanPrice[];
  features: PlanFeature[];
}

export interface UserPlanDetails {
  plan: Plan;
  subscription: UserSubscription;
  features: PlanFeature[];
  prices: PlanPrice[];
}

export interface PlanComparison {
  gained: Feature[];
  lost: Feature[];
  limitChanges: Array<{
    feature: Feature;
    currentLimit: number | null;
    newLimit: number | null;
  }>;
}

// ============================================================================
// SERVICE
// ============================================================================

export class PricingService {
  constructor(
    private featureRepo: FeatureRepository = defaultFeatureRepo,
    private planRepo: PlanRepository = defaultPlanRepo,
    private planPriceRepo: PlanPriceRepository = defaultPlanPriceRepo,
    private subscriptionRepo: SubscriptionRepository = defaultSubscriptionRepo
  ) {}

  /**
   * Get all available plans with their prices and features
   */
  async getAvailablePlans(db: StrideDatabase): Promise<PlanWithPrices[]> {
    const plans = await this.planRepo.findActive(db);
    const result: PlanWithPrices[] = [];

    for (const plan of plans) {
      const prices = await this.planPriceRepo.findByPlan(db, plan.id);
      const features = await this.planRepo.getPlanFeatures(db, plan.id);
      result.push({ plan, prices, features });
    }

    return result;
  }

  /**
   * Get user's current plan details
   */
  async getUserPlan(db: StrideDatabase, userId: string): Promise<UserPlanDetails> {
    const subscription = await this.subscriptionRepo.findByUser(db, userId);
    if (!subscription) {
      throw new ValidationError('userId', 'User has no subscription');
    }

    const plan = await this.planRepo.findById(db, subscription.roleId);
    if (!plan) {
      throw new ValidationError('subscription', 'Plan not found');
    }

    const features = await this.planRepo.getPlanFeatures(db, plan.id);
    const prices = await this.planPriceRepo.findByPlan(db, plan.id);

    return { plan, subscription, features, prices };
  }

  /**
   * Check if user's plan includes a specific feature
   */
  async hasFeature(db: StrideDatabase, userId: string, featureKey: string): Promise<boolean> {
    const subscription = await this.subscriptionRepo.findByUser(db, userId);
    if (!subscription) {
      return false;
    }

    const feature = await this.featureRepo.findByKey(db, featureKey);
    if (!feature) {
      return false;
    }

    const planFeatures = await this.planRepo.getPlanFeatures(db, subscription.roleId);
    const planFeature = planFeatures.find(pf => pf.featureId === feature.id);

    return planFeature?.enabled ?? false;
  }

  /**
   * Get the limit value for a LIMIT-type feature (null = unlimited)
   */
  async getFeatureLimit(
    db: StrideDatabase,
    userId: string,
    featureKey: string
  ): Promise<number | null> {
    const subscription = await this.subscriptionRepo.findByUser(db, userId);
    if (!subscription) {
      return null;
    }

    const feature = await this.featureRepo.findByKey(db, featureKey);
    if (!feature) {
      return null;
    }

    const planFeatures = await this.planRepo.getPlanFeatures(db, subscription.roleId);
    const planFeature = planFeatures.find(pf => pf.featureId === feature.id);

    if (!planFeature || !planFeature.enabled) {
      return null;
    }

    return planFeature.limitValue;
  }

  /**
   * Compare two plans (features gained/lost/limit changes)
   */
  async comparePlans(
    db: StrideDatabase,
    currentPlanId: string,
    targetPlanId: string
  ): Promise<PlanComparison> {
    const currentFeatures = await this.planRepo.getPlanFeatures(db, currentPlanId);
    const targetFeatures = await this.planRepo.getPlanFeatures(db, targetPlanId);

    const currentFeatureMap = new Map(currentFeatures.map(pf => [pf.featureId, pf]));
    const targetFeatureMap = new Map(targetFeatures.map(pf => [pf.featureId, pf]));

    const gained: Feature[] = [];
    const lost: Feature[] = [];
    const limitChanges: PlanComparison['limitChanges'] = [];

    // Find gained features
    for (const [featureId, pf] of targetFeatureMap) {
      if (pf.enabled && !currentFeatureMap.has(featureId)) {
        const feature = await this.featureRepo.findById(db, featureId);
        if (feature) gained.push(feature);
      }
    }

    // Find lost features and limit changes
    for (const [featureId, currentPf] of currentFeatureMap) {
      const targetPf = targetFeatureMap.get(featureId);

      if (currentPf.enabled && (!targetPf || !targetPf.enabled)) {
        const feature = await this.featureRepo.findById(db, featureId);
        if (feature) lost.push(feature);
      } else if (currentPf.enabled && targetPf?.enabled) {
        if (currentPf.limitValue !== targetPf.limitValue) {
          const feature = await this.featureRepo.findById(db, featureId);
          if (feature) {
            limitChanges.push({
              feature,
              currentLimit: currentPf.limitValue,
              newLimit: targetPf.limitValue,
            });
          }
        }
      }
    }

    return { gained, lost, limitChanges };
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    db: StrideDatabase,
    userId: string,
    planId: string,
    billingPeriod: BillingPeriod,
    trialDays?: number
  ): Promise<UserSubscription> {
    const sanitized = sanitizeFields({ userId, planId, billingPeriod });

    // Validate plan exists and is active
    const plan = await this.planRepo.findById(db, sanitized.planId);
    if (!plan || !plan.isActive) {
      throw new ValidationError('planId', 'Invalid or inactive plan');
    }

    // Check if user already has a subscription
    const existing = await this.subscriptionRepo.findByUser(db, sanitized.userId);
    if (existing) {
      throw new ValidationError('userId', 'User already has a subscription');
    }

    // Get price
    const price = await this.planPriceRepo.findByPlanAndPeriod(db, sanitized.planId, billingPeriod);
    if (!price) {
      throw new ValidationError('billingPeriod', 'No price found for this billing period');
    }

    const currentTime = new Date().toISOString();
    const subscription: Omit<UserSubscription, 'id'> = {
      userId: sanitized.userId,
      roleId: sanitized.planId,
      status: trialDays ? 'TRIAL' : 'ACTIVE',
      priceCents: price.priceCents,
      currency: price.currency,
      billingPeriod,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: price.stripePriceId,
      startedAt: currentTime,
      currentPeriodStart: trialDays ? null : currentTime,
      currentPeriodEnd: null,
      canceledAt: null,
      trialEndsAt: trialDays ? this.addDays(currentTime, trialDays) : null,
      isGrandfathered: false,
      grandfatheredReason: null,
    };

    return this.subscriptionRepo.create(db, subscription);
  }

  /**
   * Upgrade user's plan
   */
  async upgradePlan(
    db: StrideDatabase,
    userId: string,
    newPlanId: string,
    billingPeriod: BillingPeriod
  ): Promise<UserSubscription> {
    const sanitized = sanitizeFields({ userId, newPlanId, billingPeriod });

    const subscription = await this.subscriptionRepo.findByUser(db, sanitized.userId);
    if (!subscription) {
      throw new ValidationError('userId', 'User has no subscription');
    }

    const newPlan = await this.planRepo.findById(db, sanitized.newPlanId);
    if (!newPlan || !newPlan.isActive) {
      throw new ValidationError('newPlanId', 'Invalid or inactive plan');
    }

    const newPrice = await this.planPriceRepo.findByPlanAndPeriod(
      db,
      sanitized.newPlanId,
      billingPeriod
    );
    if (!newPrice) {
      throw new ValidationError('billingPeriod', 'No price found for this billing period');
    }

    // Update subscription
    await this.subscriptionRepo.update(db, subscription.id, {
      roleId: sanitized.newPlanId,
      priceCents: newPrice.priceCents,
      billingPeriod,
      stripePriceId: newPrice.stripePriceId,
    });

    // TODO: Log to subscription_history (table doesn't exist yet)

    const updated = await this.subscriptionRepo.findById(db, subscription.id);
    if (!updated) {
      throw new Error('Failed to retrieve updated subscription');
    }

    return updated;
  }

  /**
   * Downgrade user's plan (effective at period end)
   */
  async downgradePlan(
    db: StrideDatabase,
    userId: string,
    newPlanId: string,
    billingPeriod: BillingPeriod
  ): Promise<UserSubscription> {
    // For now, same as upgrade but with different timing logic
    // In production, this would schedule the change for currentPeriodEnd
    return this.upgradePlan(db, userId, newPlanId, billingPeriod);
  }

  /**
   * Cancel user's subscription (effective at period end)
   */
  async cancelSubscription(db: StrideDatabase, userId: string): Promise<void> {
    const subscription = await this.subscriptionRepo.findByUser(db, userId);
    if (!subscription) {
      throw new ValidationError('userId', 'User has no subscription');
    }

    await this.subscriptionRepo.update(db, subscription.id, {
      canceledAt: new Date().toISOString(),
    });
  }

  /**
   * Start a trial for a user
   */
  async startTrial(
    db: StrideDatabase,
    userId: string,
    planId: string,
    durationDays: number
  ): Promise<UserSubscription> {
    const sanitized = sanitizeFields({ userId, planId, durationDays });

    // Check if user already had a trial
    const existing = await this.subscriptionRepo.findByUser(db, sanitized.userId);
    if (existing) {
      throw new ValidationError('userId', 'User already has or had a subscription');
    }

    return this.createSubscription(db, sanitized.userId, sanitized.planId, 'MONTHLY', durationDays);
  }

  /**
   * Batch expire trials (cron job)
   */
  async expireTrials(db: StrideDatabase): Promise<number> {
    const expiredTrials = await this.subscriptionRepo.findExpiredTrials(db);

    for (const subscription of expiredTrials) {
      // Downgrade to free plan
      // TODO: Get free plan ID from config
      await this.subscriptionRepo.update(db, subscription.id, {
        status: 'CANCELED',
      });
    }

    return expiredTrials.length;
  }

  /**
   * Check if user is grandfathered
   */
  async isGrandfathered(db: StrideDatabase, userId: string): Promise<boolean> {
    const subscription = await this.subscriptionRepo.findByUser(db, userId);
    return subscription?.isGrandfathered ?? false;
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private addDays(isoDate: string, days: number): string {
    const date = new Date(isoDate);
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }
}

export const pricingService = new PricingService();
