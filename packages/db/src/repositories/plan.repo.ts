/**
 * Plan Repository
 *
 * Provides CRUD operations for plans and plan_features.
 */

import { eq, and, inArray } from 'drizzle-orm';
import type { Plan, PlanFeature } from '@stridetime/types';
import { plansTable, planFeaturesTable, featuresTable } from '../drizzle/schema';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// DB ROW TYPES
// ============================================================================

type PlanRow = typeof plansTable.$inferSelect;
type NewPlanRow = typeof plansTable.$inferInsert;
type PlanFeatureRow = typeof planFeaturesTable.$inferSelect;
type NewPlanFeatureRow = typeof planFeaturesTable.$inferInsert;

// ============================================================================
// MAPPERS (Plan)
// ============================================================================

function toDomain(row: PlanRow): Plan {
  return {
    id: row.id,
    displayName: row.displayName,
    description: row.description,
    isActive: row.isActive,
  };
}

function toDbInsert(plan: Omit<Plan, 'id'>): Omit<NewPlanRow, 'id'> {
  const timestamp = now();
  return {
    displayName: plan.displayName,
    description: plan.description,
    isActive: plan.isActive,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function toDbUpdate(plan: Partial<Plan>): Partial<PlanRow> {
  return {
    ...plan,
    updatedAt: now(),
  };
}

// ============================================================================
// MAPPERS (PlanFeature)
// ============================================================================

function planFeatureToDomain(row: PlanFeatureRow): PlanFeature {
  return {
    id: row.id,
    planId: row.planId,
    featureId: row.featureId,
    enabled: row.enabled,
    limitValue: row.limitValue,
  };
}

function planFeatureToDbInsert(pf: Omit<PlanFeature, 'id'>): Omit<NewPlanFeatureRow, 'id'> {
  const timestamp = now();
  return {
    planId: pf.planId,
    featureId: pf.featureId,
    enabled: pf.enabled,
    limitValue: pf.limitValue,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function planFeatureToDbUpdate(pf: Partial<PlanFeature>): Partial<PlanFeatureRow> {
  return {
    ...pf,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class PlanRepository {
  // ============================================================================
  // Plan CRUD
  // ============================================================================

  async findById(db: StrideDatabase, id: string): Promise<Plan | null> {
    const row = await db.query.plansTable.findFirst({
      where: eq(plansTable.id, id),
    });
    return row ? toDomain(row) : null;
  }

  async findAll(db: StrideDatabase, includeInactive = false): Promise<Plan[]> {
    const rows = await db.query.plansTable.findMany({
      where: includeInactive ? undefined : eq(plansTable.isActive, true),
    });
    return rows.map(toDomain);
  }

  async findActive(db: StrideDatabase): Promise<Plan[]> {
    return this.findAll(db, false);
  }

  async create(db: StrideDatabase, plan: Omit<Plan, 'id'>): Promise<Plan> {
    const id = generateId();
    const dbPlan = toDbInsert(plan);

    await db.insert(plansTable).values({
      id,
      ...dbPlan,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create plan');
    }
    return created;
  }

  async update(db: StrideDatabase, id: string, updates: Partial<Plan>): Promise<void> {
    const dbUpdates = toDbUpdate(updates);

    await db.update(plansTable).set(dbUpdates).where(eq(plansTable.id, id));
  }

  async deactivate(db: StrideDatabase, id: string): Promise<void> {
    await db
      .update(plansTable)
      .set({ isActive: false, updatedAt: now() })
      .where(eq(plansTable.id, id));
  }

  // ============================================================================
  // PlanFeature Operations
  // ============================================================================

  async getPlanFeatures(db: StrideDatabase, planId: string): Promise<PlanFeature[]> {
    const rows = await db.query.planFeaturesTable.findMany({
      where: eq(planFeaturesTable.planId, planId),
    });
    return rows.map(planFeatureToDomain);
  }

  async setPlanFeature(
    db: StrideDatabase,
    planId: string,
    featureId: string,
    enabled: boolean,
    limitValue?: number | null
  ): Promise<void> {
    // Check if the plan-feature entry already exists
    const existing = await db.query.planFeaturesTable.findFirst({
      where: and(eq(planFeaturesTable.planId, planId), eq(planFeaturesTable.featureId, featureId)),
    });

    if (existing) {
      // Update existing entry
      const updates = planFeatureToDbUpdate({
        enabled,
        limitValue: limitValue !== undefined ? limitValue : existing.limitValue,
      });
      await db.update(planFeaturesTable).set(updates).where(eq(planFeaturesTable.id, existing.id));
    } else {
      // Insert new entry
      const id = generateId();
      const dbPlanFeature = planFeatureToDbInsert({
        planId,
        featureId,
        enabled,
        limitValue: limitValue !== undefined ? limitValue : null,
      });
      await db.insert(planFeaturesTable).values({
        id,
        ...dbPlanFeature,
      });
    }
  }

  async removePlanFeature(db: StrideDatabase, planId: string, featureId: string): Promise<void> {
    await db
      .delete(planFeaturesTable)
      .where(and(eq(planFeaturesTable.planId, planId), eq(planFeaturesTable.featureId, featureId)));
  }

  async getPlansWithFeature(db: StrideDatabase, featureKey: string): Promise<Plan[]> {
    // First, find the feature by key
    const feature = await db.query.featuresTable.findFirst({
      where: eq(featuresTable.key, featureKey),
    });

    if (!feature) {
      return [];
    }

    // Find all plan_features entries with this featureId and enabled=true
    const planFeatures = await db.query.planFeaturesTable.findMany({
      where: and(eq(planFeaturesTable.featureId, feature.id), eq(planFeaturesTable.enabled, true)),
    });

    if (planFeatures.length === 0) {
      return [];
    }

    // Fetch the plans
    const planIds = planFeatures.map(pf => pf.planId);
    const rows = await db.query.plansTable.findMany({
      where: inArray(plansTable.id, planIds),
    });

    return rows.map(toDomain);
  }
}

export const planRepo = new PlanRepository();
