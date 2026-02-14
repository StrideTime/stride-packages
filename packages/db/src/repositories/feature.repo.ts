/**
 * Feature Repository
 *
 * Provides CRUD operations for the dynamic features registry.
 * NOTE: Features use isActive (not deleted) — features are deactivated, not soft-deleted.
 */

import { eq, and } from 'drizzle-orm';
import type { Feature } from '@stridetime/types';
import { featuresTable } from '../drizzle/schema';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// DB ROW TYPES
// ============================================================================

type FeatureRow = typeof featuresTable.$inferSelect;
type NewFeatureRow = typeof featuresTable.$inferInsert;

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: FeatureRow): Feature {
  return {
    id: row.id,
    key: row.key,
    displayName: row.displayName,
    description: row.description,
    valueType: row.valueType,
    category: row.category,
    isActive: row.isActive,
  };
}

function toDbInsert(feature: Omit<Feature, 'id'>): Omit<NewFeatureRow, 'id'> {
  const timestamp = now();
  return {
    key: feature.key,
    displayName: feature.displayName,
    description: feature.description,
    valueType: feature.valueType,
    category: feature.category,
    isActive: feature.isActive,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function toDbUpdate(feature: Partial<Feature>): Partial<FeatureRow> {
  return {
    ...feature,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class FeatureRepository {
  async findById(db: StrideDatabase, id: string): Promise<Feature | null> {
    const row = await db.query.featuresTable.findFirst({
      where: eq(featuresTable.id, id),
    });
    return row ? toDomain(row) : null;
  }

  async findByKey(db: StrideDatabase, key: string): Promise<Feature | null> {
    const row = await db.query.featuresTable.findFirst({
      where: eq(featuresTable.key, key),
    });
    return row ? toDomain(row) : null;
  }

  async findAll(db: StrideDatabase, includeInactive = false): Promise<Feature[]> {
    const rows = await db.query.featuresTable.findMany({
      where: includeInactive ? undefined : eq(featuresTable.isActive, true),
    });
    return rows.map(toDomain);
  }

  async findByCategory(db: StrideDatabase, category: string): Promise<Feature[]> {
    const rows = await db.query.featuresTable.findMany({
      where: and(eq(featuresTable.category, category), eq(featuresTable.isActive, true)),
    });
    return rows.map(toDomain);
  }

  async create(db: StrideDatabase, feature: Omit<Feature, 'id'>): Promise<Feature> {
    const id = generateId();
    const dbFeature = toDbInsert(feature);

    await db.insert(featuresTable).values({
      id,
      ...dbFeature,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create feature');
    }
    return created;
  }

  async update(db: StrideDatabase, id: string, updates: Partial<Feature>): Promise<void> {
    const dbUpdates = toDbUpdate(updates);

    await db.update(featuresTable).set(dbUpdates).where(eq(featuresTable.id, id));
  }

  async deactivate(db: StrideDatabase, id: string): Promise<void> {
    await db
      .update(featuresTable)
      .set({ isActive: false, updatedAt: now() })
      .where(eq(featuresTable.id, id));
  }
}

export const featureRepo = new FeatureRepository();
