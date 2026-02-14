/**
 * Admin Service
 *
 * Handles admin operations: plan/feature CRUD, user/subscription management, audit logging.
 * All mutations create audit log entries.
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
  userRepo as defaultUserRepo,
  type UserRepository,
  adminAuditRepo as defaultAdminAuditRepo,
  type AdminAuditRepository,
  type StrideDatabase,
} from '@stridetime/db';
import type {
  Plan,
  Feature,
  User,
  UserSubscription,
  PlanFeature,
  AdminAuditEntry,
  BillingPeriod,
  SubscriptionStatus,
} from '@stridetime/types';
import { sanitizeFields } from '../utils/sanitize';
import { ValidationError } from '@stridetime/types';

// ============================================================================
// COMPOSITE TYPES
// ============================================================================

export interface UserFilters {
  search?: string;
  planId?: string;
  status?: SubscriptionStatus;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserWithSubscription {
  user: User;
  subscription: UserSubscription | null;
  plan: Plan | null;
}

export interface UserWithSubscriptionDetails extends UserWithSubscription {
  features: PlanFeature[];
  auditLog: AdminAuditEntry[];
}

export interface SubscriptionStats {
  totalUsers: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  perPlan: Array<{ plan: Plan; count: number; revenue: number }>;
  mrr: number;
  trialConversionRate: number;
}

export interface CreatePlanInput {
  displayName: string;
  description: string | null;
}

export interface UpdatePlanInput {
  displayName?: string;
  description?: string | null;
}

export interface CreateFeatureInput {
  key: string;
  displayName: string;
  description: string | null;
  valueType: 'BOOLEAN' | 'LIMIT';
  category: string;
}

export interface UpdateFeatureInput {
  displayName?: string;
  description?: string | null;
  category?: string;
}

// ============================================================================
// SERVICE
// ============================================================================

export class AdminService {
  constructor(
    private featureRepo: FeatureRepository = defaultFeatureRepo,
    private planRepo: PlanRepository = defaultPlanRepo,
    private planPriceRepo: PlanPriceRepository = defaultPlanPriceRepo,
    private subscriptionRepo: SubscriptionRepository = defaultSubscriptionRepo,
    private userRepo: UserRepository = defaultUserRepo,
    private adminAuditRepo: AdminAuditRepository = defaultAdminAuditRepo
  ) {}

  // ============================================================================
  // PLAN MANAGEMENT
  // ============================================================================

  async createPlan(db: StrideDatabase, adminUserId: string, input: CreatePlanInput): Promise<Plan> {
    if (!input.displayName?.trim()) {
      throw new ValidationError('displayName', 'Plan name is required');
    }

    const plan = await this.planRepo.create(db, {
      displayName: input.displayName.trim(),
      description: input.description?.trim() || null,
      isActive: true,
    });

    await this.logAudit(db, {
      adminUserId,
      action: 'create_plan',
      entityType: 'plan',
      entityId: plan.id,
      details: JSON.stringify({ displayName: plan.displayName }),
    });

    return plan;
  }

  async updatePlan(
    db: StrideDatabase,
    adminUserId: string,
    planId: string,
    input: UpdatePlanInput
  ): Promise<void> {
    const updates: Partial<Plan> = {};
    if (input.displayName !== undefined) updates.displayName = input.displayName.trim();
    if (input.description !== undefined) updates.description = input.description?.trim() || null;

    await this.planRepo.update(db, planId, updates);

    await this.logAudit(db, {
      adminUserId,
      action: 'update_plan',
      entityType: 'plan',
      entityId: planId,
      details: JSON.stringify(input),
    });
  }

  async retirePlan(
    db: StrideDatabase,
    adminUserId: string,
    planId: string,
    replacementPlanId?: string
  ): Promise<void> {
    await this.planRepo.deactivate(db, planId);

    await this.logAudit(db, {
      adminUserId,
      action: 'retire_plan',
      entityType: 'plan',
      entityId: planId,
      details: JSON.stringify({ replacementPlanId }),
    });
  }

  async setPlanFeature(
    db: StrideDatabase,
    adminUserId: string,
    planId: string,
    featureKey: string,
    enabled: boolean,
    limitValue?: number | null
  ): Promise<void> {
    const feature = await this.featureRepo.findByKey(db, featureKey);
    if (!feature) {
      throw new ValidationError('featureKey', 'Feature not found');
    }

    await this.planRepo.setPlanFeature(db, planId, feature.id, enabled, limitValue);

    await this.logAudit(db, {
      adminUserId,
      action: 'set_plan_feature',
      entityType: 'plan',
      entityId: planId,
      details: JSON.stringify({ featureKey, enabled, limitValue }),
    });
  }

  async setPlanPrice(
    db: StrideDatabase,
    adminUserId: string,
    planId: string,
    billingPeriod: BillingPeriod,
    priceCents: number,
    stripePriceId?: string | null
  ): Promise<void> {
    const existing = await this.planPriceRepo.findByPlanAndPeriod(db, planId, billingPeriod);

    if (existing) {
      await this.planPriceRepo.update(db, existing.id, { priceCents, stripePriceId });
    } else {
      await this.planPriceRepo.create(db, {
        roleId: planId,
        billingPeriod,
        priceCents,
        currency: 'USD',
        stripePriceId: stripePriceId || null,
        isActive: true,
      });
    }

    await this.logAudit(db, {
      adminUserId,
      action: 'set_plan_price',
      entityType: 'plan',
      entityId: planId,
      details: JSON.stringify({ billingPeriod, priceCents, stripePriceId }),
    });
  }

  // ============================================================================
  // FEATURE MANAGEMENT
  // ============================================================================

  async createFeature(
    db: StrideDatabase,
    adminUserId: string,
    input: CreateFeatureInput
  ): Promise<Feature> {
    if (!input.key?.trim()) {
      throw new ValidationError('key', 'Feature key is required');
    }

    const feature = await this.featureRepo.create(db, {
      key: input.key.trim(),
      displayName: input.displayName.trim(),
      description: input.description?.trim() || null,
      valueType: input.valueType,
      category: input.category.trim(),
      isActive: true,
    });

    await this.logAudit(db, {
      adminUserId,
      action: 'create_feature',
      entityType: 'feature',
      entityId: feature.id,
      details: JSON.stringify({ key: feature.key }),
    });

    return feature;
  }

  async updateFeature(
    db: StrideDatabase,
    adminUserId: string,
    featureId: string,
    input: UpdateFeatureInput
  ): Promise<void> {
    const updates: Partial<Feature> = {};
    if (input.displayName !== undefined) updates.displayName = input.displayName.trim();
    if (input.description !== undefined) updates.description = input.description?.trim() || null;
    if (input.category !== undefined) updates.category = input.category.trim();

    await this.featureRepo.update(db, featureId, updates);

    await this.logAudit(db, {
      adminUserId,
      action: 'update_feature',
      entityType: 'feature',
      entityId: featureId,
      details: JSON.stringify(input),
    });
  }

  async deactivateFeature(
    db: StrideDatabase,
    adminUserId: string,
    featureId: string
  ): Promise<void> {
    await this.featureRepo.deactivate(db, featureId);

    await this.logAudit(db, {
      adminUserId,
      action: 'deactivate_feature',
      entityType: 'feature',
      entityId: featureId,
      details: null,
    });
  }

  // ============================================================================
  // USER/SUBSCRIPTION MANAGEMENT
  // ============================================================================

  async listUsers(
    db: StrideDatabase,
    filters: UserFilters = {}
  ): Promise<PaginatedResult<UserWithSubscription>> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;

    // Get all subscriptions and build user list from there
    const allSubscriptions = filters.status
      ? await this.subscriptionRepo.findByStatus(db, filters.status)
      : filters.planId
        ? await this.subscriptionRepo.findByRole(db, filters.planId)
        : [];

    const results: UserWithSubscription[] = [];

    for (const subscription of allSubscriptions) {
      const user = await this.userRepo.findById(db, subscription.userId);
      if (!user) continue;

      const plan = await this.planRepo.findById(db, subscription.roleId);

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) continue;
      }

      results.push({ user, subscription, plan });
    }

    return {
      data: results.slice((page - 1) * pageSize, page * pageSize),
      total: results.length,
      page,
      pageSize,
      totalPages: Math.ceil(results.length / pageSize),
    };
  }

  async getUserDetails(db: StrideDatabase, userId: string): Promise<UserWithSubscriptionDetails> {
    const user = await this.userRepo.findById(db, userId);
    if (!user) {
      throw new ValidationError('userId', 'User not found');
    }

    const subscription = await this.subscriptionRepo.findByUser(db, userId);
    const plan = subscription ? await this.planRepo.findById(db, subscription.roleId) : null;

    const features = plan ? await this.planRepo.getPlanFeatures(db, plan.id) : [];

    const auditLog = await this.adminAuditRepo.findByEntity(db, 'user', userId);

    return {
      user,
      subscription,
      plan,
      features,
      auditLog,
    };
  }

  async changeUserPlan(
    db: StrideDatabase,
    adminUserId: string,
    userId: string,
    newPlanId: string,
    reason: string
  ): Promise<void> {
    const sanitized = sanitizeFields({ userId, newPlanId, reason });

    const subscription = await this.subscriptionRepo.findByUser(db, sanitized.userId);
    if (!subscription) {
      throw new ValidationError('userId', 'User has no subscription');
    }

    const newPlan = await this.planRepo.findById(db, sanitized.newPlanId);
    if (!newPlan) {
      throw new ValidationError('newPlanId', 'Plan not found');
    }

    const oldPlanId = subscription.roleId;

    await this.subscriptionRepo.update(db, subscription.id, {
      roleId: sanitized.newPlanId,
    });

    await this.logAudit(db, {
      adminUserId,
      action: 'change_user_plan',
      entityType: 'user',
      entityId: sanitized.userId,
      details: JSON.stringify({
        oldPlanId,
        newPlanId: sanitized.newPlanId,
        reason: sanitized.reason,
      }),
    });
  }

  async startUserTrial(
    db: StrideDatabase,
    adminUserId: string,
    userId: string,
    planId: string,
    durationDays: number
  ): Promise<void> {
    const sanitized = sanitizeFields({ userId, planId, durationDays });

    const existing = await this.subscriptionRepo.findByUser(db, sanitized.userId);
    if (existing) {
      throw new ValidationError('userId', 'User already has a subscription');
    }

    const currentTime = new Date().toISOString();
    const trialEndsAt = this.addDays(currentTime, sanitized.durationDays);

    await this.subscriptionRepo.create(db, {
      userId: sanitized.userId,
      roleId: sanitized.planId,
      status: 'TRIAL',
      priceCents: 0,
      currency: 'USD',
      billingPeriod: 'MONTHLY',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      startedAt: currentTime,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      canceledAt: null,
      trialEndsAt,
      isGrandfathered: false,
      grandfatheredReason: null,
    });

    await this.logAudit(db, {
      adminUserId,
      action: 'start_user_trial',
      entityType: 'user',
      entityId: sanitized.userId,
      details: JSON.stringify({ planId: sanitized.planId, durationDays: sanitized.durationDays }),
    });
  }

  async cancelUserSubscription(
    db: StrideDatabase,
    adminUserId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    const sanitized = sanitizeFields({ userId, reason });

    const subscription = await this.subscriptionRepo.findByUser(db, sanitized.userId);
    if (!subscription) {
      throw new ValidationError('userId', 'User has no subscription');
    }

    await this.subscriptionRepo.update(db, subscription.id, {
      canceledAt: new Date().toISOString(),
      status: 'CANCELED',
    });

    await this.logAudit(db, {
      adminUserId,
      action: 'cancel_user_subscription',
      entityType: 'user',
      entityId: sanitized.userId,
      details: JSON.stringify({ reason: sanitized.reason }),
    });
  }

  async grantGrandfatheredStatus(
    db: StrideDatabase,
    adminUserId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    const sanitized = sanitizeFields({ userId, reason });

    const subscription = await this.subscriptionRepo.findByUser(db, sanitized.userId);
    if (!subscription) {
      throw new ValidationError('userId', 'User has no subscription');
    }

    await this.subscriptionRepo.update(db, subscription.id, {
      isGrandfathered: true,
      grandfatheredReason: sanitized.reason,
    });

    await this.logAudit(db, {
      adminUserId,
      action: 'grant_grandfathered_status',
      entityType: 'user',
      entityId: sanitized.userId,
      details: JSON.stringify({ reason: sanitized.reason }),
    });
  }

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  async getSubscriptionStats(db: StrideDatabase): Promise<SubscriptionStats> {
    const activeSubscriptions = (await this.subscriptionRepo.findByStatus(db, 'ACTIVE')).length;
    const trialSubscriptions = (await this.subscriptionRepo.findByStatus(db, 'TRIAL')).length;

    // Per-plan stats (simplified)
    const plans = await this.planRepo.findAll(db);
    const perPlan = [];
    let mrr = 0;
    let totalUsers = 0;

    for (const plan of plans) {
      const subs = await this.subscriptionRepo.findByRole(db, plan.id);
      const count = subs.length;
      totalUsers += count;
      const revenue = subs
        .filter(s => s.status === 'ACTIVE' && s.billingPeriod === 'MONTHLY')
        .reduce((sum, s) => sum + s.priceCents, 0);

      mrr += revenue;
      perPlan.push({ plan, count, revenue });
    }

    const trialConversionRate =
      trialSubscriptions > 0 ? activeSubscriptions / trialSubscriptions : 0;

    return {
      totalUsers,
      activeSubscriptions,
      trialSubscriptions,
      perPlan,
      mrr,
      trialConversionRate,
    };
  }

  async getRecentActivity(db: StrideDatabase, limit = 50): Promise<AdminAuditEntry[]> {
    return this.adminAuditRepo.findRecent(db, limit);
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private async logAudit(
    db: StrideDatabase,
    entry: Omit<AdminAuditEntry, 'id' | 'performedAt'>
  ): Promise<void> {
    await this.adminAuditRepo.create(db, {
      ...entry,
      performedAt: new Date().toISOString(),
    });
  }

  private addDays(isoDate: string, days: number): string {
    const date = new Date(isoDate);
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }
}

export const adminService = new AdminService();
