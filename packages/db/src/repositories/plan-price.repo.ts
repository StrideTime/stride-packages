/**
 * Plan Price Repository
 *
 * Provides CRUD operations for plan prices (pricing per billing period per plan).
 */

import { eq, and } from 'drizzle-orm';
import type { PlanPrice } from '@stridetime/types';
import { planPricesTable } from '../drizzle/schema';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// DB ROW TYPES
// ============================================================================

type PlanPriceRow = typeof planPricesTable.$inferSelect;
type NewPlanPriceRow = typeof planPricesTable.$inferInsert;

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: PlanPriceRow): PlanPrice {
  return {
    id: row.id,
    roleId: row.roleId,
    billingPeriod: row.billingPeriod,
    priceCents: row.priceCents,
    currency: row.currency,
    stripePriceId: row.stripePriceId,
    isActive: row.isActive,
  };
}

function toDbInsert(price: Omit<PlanPrice, 'id'>): Omit<NewPlanPriceRow, 'id'> {
  const timestamp = now();
  return {
    roleId: price.roleId,
    billingPeriod: price.billingPeriod,
    priceCents: price.priceCents,
    currency: price.currency,
    stripePriceId: price.stripePriceId,
    isActive: price.isActive,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function toDbUpdate(price: Partial<PlanPrice>): Partial<PlanPriceRow> {
  return {
    ...price,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class PlanPriceRepository {
  async findById(db: StrideDatabase, id: string): Promise<PlanPrice | null> {
    const row = await db.query.planPricesTable.findFirst({
      where: eq(planPricesTable.id, id),
    });
    return row ? toDomain(row) : null;
  }

  async findByPlan(db: StrideDatabase, roleId: string): Promise<PlanPrice[]> {
    const rows = await db.query.planPricesTable.findMany({
      where: eq(planPricesTable.roleId, roleId),
    });
    return rows.map(toDomain);
  }

  async findByPlanAndPeriod(
    db: StrideDatabase,
    roleId: string,
    billingPeriod: string
  ): Promise<PlanPrice | null> {
    const row = await db.query.planPricesTable.findFirst({
      where: and(
        eq(planPricesTable.roleId, roleId),
        eq(planPricesTable.billingPeriod, billingPeriod as any)
      ),
    });
    return row ? toDomain(row) : null;
  }

  async findActive(db: StrideDatabase): Promise<PlanPrice[]> {
    const rows = await db.query.planPricesTable.findMany({
      where: eq(planPricesTable.isActive, true),
    });
    return rows.map(toDomain);
  }

  async create(db: StrideDatabase, price: Omit<PlanPrice, 'id'>): Promise<PlanPrice> {
    const id = generateId();
    const dbPrice = toDbInsert(price);

    await db.insert(planPricesTable).values({
      id,
      ...dbPrice,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create plan price');
    }
    return created;
  }

  async update(db: StrideDatabase, id: string, updates: Partial<PlanPrice>): Promise<void> {
    const dbUpdates = toDbUpdate(updates);

    await db.update(planPricesTable).set(dbUpdates).where(eq(planPricesTable.id, id));
  }

  async deactivate(db: StrideDatabase, id: string): Promise<void> {
    await db
      .update(planPricesTable)
      .set({ isActive: false, updatedAt: now() })
      .where(eq(planPricesTable.id, id));
  }
}

export const planPriceRepo = new PlanPriceRepository();
