/**
 * Break Repository
 *
 * Provides CRUD operations for breaks with proper domain/DB type mapping.
 * All methods accept a DB instance to support transactions.
 */

import { eq, and } from 'drizzle-orm';
import type { Break, CreateBreakInput } from '@stridetime/types';
import { breaksTable } from '../drizzle/schema';
import type { BreakRow, NewBreakRow } from '../drizzle/types';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: BreakRow): Break {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    durationMinutes: row.durationMinutes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: row.deleted,
  };
}

function toDbInsert(breakItem: CreateBreakInput): Omit<NewBreakRow, 'id'> {
  const timestamp = now();
  return {
    userId: breakItem.userId,
    type: breakItem.type,
    startedAt: breakItem.startedAt,
    endedAt: breakItem.endedAt,
    durationMinutes: breakItem.durationMinutes,
    createdAt: timestamp,
    updatedAt: timestamp,
    deleted: false,
  };
}

function toDbUpdate(breakItem: Partial<Break>): Partial<BreakRow> {
  return {
    ...breakItem,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class BreakRepository {
  async findById(db: StrideDatabase, id: string): Promise<Break | null> {
    const row = await db.query.breaksTable.findFirst({
      where: and(eq(breaksTable.id, id), eq(breaksTable.deleted, false)),
    });
    return row ? toDomain(row) : null;
  }

  async findByUser(db: StrideDatabase, userId: string): Promise<Break[]> {
    const rows = await db.query.breaksTable.findMany({
      where: and(eq(breaksTable.userId, userId), eq(breaksTable.deleted, false)),
    });
    return rows.map(toDomain);
  }

  async create(db: StrideDatabase, breakItem: CreateBreakInput): Promise<Break> {
    const id = generateId();
    const dbBreak = toDbInsert(breakItem);

    await db.insert(breaksTable).values({
      id,
      ...dbBreak,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create break');
    }
    return created;
  }

  async update(db: StrideDatabase, id: string, updates: Partial<Break>): Promise<Break> {
    const dbUpdates = toDbUpdate(updates);

    await db
      .update(breaksTable)
      .set(dbUpdates)
      .where(and(eq(breaksTable.id, id), eq(breaksTable.deleted, false)));

    const updated = await this.findById(db, id);
    if (!updated) {
      throw new Error('Break not found or was deleted');
    }
    return updated;
  }

  async delete(db: StrideDatabase, id: string): Promise<void> {
    await db
      .update(breaksTable)
      .set({ deleted: true, updatedAt: now() } as any)
      .where(eq(breaksTable.id, id));
  }
}

export const breakRepo = new BreakRepository();
