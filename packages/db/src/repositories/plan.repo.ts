/**
 * Plan Repository
 *
 * Provides CRUD operations for plans (using the refactored roles table) and plan_features.
 * NOTE: The roles table is refactored to serve as the plans table (SQL table name stays 'roles').
 */

import { eq, and, inArray } from 'drizzle-orm';
import type { Plan, PlanFeature } from '@stridetime/types';
import { rolesTable, planFeaturesTable, featuresTable } from '../drizzle/schema';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// DB ROW TYPES
// ============================================================================

type PlanRow = typeof rolesTable.$inferSelect;
type NewPlanRow = typeof rolesTable.$inferInsert;
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
    roleId: row.roleId,
    featureId: row.featureId,
    enabled: row.enabled,
    limitValue: row.limitValue,
  };
}

function planFeatureToDbInsert(pf: Omit<PlanFeature, 'id'>): Omit<NewPlanFeatureRow, 'id'> {
  const timestamp = now();
  return {
    roleId: pf.roleId,
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
    const row = await db.query.rolesTable.findFirst({
      where: eq(rolesTable.id, id),
    });
    return row ? toDomain(row) : null;
  }

  async findAll(db: StrideDatabase, includeInactive = false): Promise<Plan[]> {
    const rows = await db.query.rolesTable.findMany({
      where: includeInactive ? undefined : eq(rolesTable.isActive, true),
    });
    return rows.map(toDomain);
  }

  async findActive(db: StrideDatabase): Promise<Plan[]> {
    return this.findAll(db, false);
  }

  async create(db: StrideDatabase, plan: Omit<Plan, 'id'>): Promise<Plan> {
    const id = generateId();
    const dbPlan = toDbInsert(plan);

    await db.insert(rolesTable).values({
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

    await db.update(rolesTable).set(dbUpdates).where(eq(rolesTable.id, id));
  }

  async deactivate(db: StrideDatabase, id: string): Promise<void> {
    await db
      .update(rolesTable)
      .set({ isActive: false, updatedAt: now() })
      .where(eq(rolesTable.id, id));
  }

  // ============================================================================
  // PlanFeature Operations
  // ============================================================================

  async getPlanFeatures(db: StrideDatabase, planId: string): Promise<PlanFeature[]> {
    const rows = await db.query.planFeaturesTable.findMany({
      where: eq(planFeaturesTable.roleId, planId),
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
      where: and(eq(planFeaturesTable.roleId, planId), eq(planFeaturesTable.featureId, featureId)),
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
        roleId: planId,
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
      .where(and(eq(planFeaturesTable.roleId, planId), eq(planFeaturesTable.featureId, featureId)));
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
    const planIds = planFeatures.map(pf => pf.roleId);
    const rows = await db.query.rolesTable.findMany({
      where: inArray(rolesTable.id, planIds),
    });

    return rows.map(toDomain);
  }
}

export const planRepo = new PlanRepository();
