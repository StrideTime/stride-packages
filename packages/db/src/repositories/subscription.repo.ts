/**
 * Subscription Repository
 *
 * Provides CRUD operations for user subscriptions.
 */

import { eq, and, lt } from 'drizzle-orm';
import type { UserSubscription } from '@stridetime/types';
import { userSubscriptionsTable } from '../drizzle/schema';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// DB ROW TYPES
// ============================================================================

type SubscriptionRow = typeof userSubscriptionsTable.$inferSelect;
type NewSubscriptionRow = typeof userSubscriptionsTable.$inferInsert;

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: SubscriptionRow): UserSubscription {
  return {
    id: row.id,
    userId: row.userId,
    roleId: row.roleId,
    status: row.status,
    priceCents: row.priceCents,
    currency: row.currency,
    billingPeriod: row.billingPeriod,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    stripePriceId: row.stripePriceId,
    startedAt: row.startedAt,
    currentPeriodStart: row.currentPeriodStart,
    currentPeriodEnd: row.currentPeriodEnd,
    canceledAt: row.canceledAt,
    trialEndsAt: row.trialEndsAt,
    isGrandfathered: row.isGrandfathered,
    grandfatheredReason: row.grandfatheredReason,
  };
}

function toDbInsert(sub: Omit<UserSubscription, 'id'>): Omit<NewSubscriptionRow, 'id'> {
  const timestamp = now();
  return {
    userId: sub.userId,
    roleId: sub.roleId,
    status: sub.status,
    priceCents: sub.priceCents,
    currency: sub.currency,
    billingPeriod: sub.billingPeriod,
    stripeCustomerId: sub.stripeCustomerId,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    stripePriceId: sub.stripePriceId,
    startedAt: sub.startedAt,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    canceledAt: sub.canceledAt,
    trialEndsAt: sub.trialEndsAt,
    isGrandfathered: sub.isGrandfathered,
    grandfatheredReason: sub.grandfatheredReason,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function toDbUpdate(sub: Partial<UserSubscription>): Partial<SubscriptionRow> {
  return {
    ...sub,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class SubscriptionRepository {
  async findById(db: StrideDatabase, id: string): Promise<UserSubscription | null> {
    const row = await db.query.userSubscriptionsTable.findFirst({
      where: eq(userSubscriptionsTable.id, id),
    });
    return row ? toDomain(row) : null;
  }

  async findByUser(db: StrideDatabase, userId: string): Promise<UserSubscription | null> {
    const row = await db.query.userSubscriptionsTable.findFirst({
      where: eq(userSubscriptionsTable.userId, userId),
    });
    return row ? toDomain(row) : null;
  }

  async findByStatus(db: StrideDatabase, status: string): Promise<UserSubscription[]> {
    const rows = await db.query.userSubscriptionsTable.findMany({
      where: eq(userSubscriptionsTable.status, status as any),
    });
    return rows.map(toDomain);
  }

  async findByRole(db: StrideDatabase, roleId: string): Promise<UserSubscription[]> {
    const rows = await db.query.userSubscriptionsTable.findMany({
      where: eq(userSubscriptionsTable.roleId, roleId),
    });
    return rows.map(toDomain);
  }

  async findExpiredTrials(db: StrideDatabase): Promise<UserSubscription[]> {
    const currentTime = now();
    const rows = await db.query.userSubscriptionsTable.findMany({
      where: and(
        eq(userSubscriptionsTable.status, 'TRIAL' as any),
        lt(userSubscriptionsTable.trialEndsAt, currentTime)
      ),
    });
    return rows.map(toDomain);
  }

  async create(db: StrideDatabase, sub: Omit<UserSubscription, 'id'>): Promise<UserSubscription> {
    const id = generateId();
    const dbSub = toDbInsert(sub);

    await db.insert(userSubscriptionsTable).values({
      id,
      ...dbSub,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create subscription');
    }
    return created;
  }

  async update(db: StrideDatabase, id: string, updates: Partial<UserSubscription>): Promise<void> {
    const dbUpdates = toDbUpdate(updates);

    await db.update(userSubscriptionsTable).set(dbUpdates).where(eq(userSubscriptionsTable.id, id));
  }
}

export const subscriptionRepo = new SubscriptionRepository();
