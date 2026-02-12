/**
 * Goal Repository
 *
 * Provides CRUD operations for goals with proper domain/DB type mapping.
 * All methods accept a DB instance to support transactions.
 */

import { eq, and } from 'drizzle-orm';
import type { Goal } from '@stridetime/types';
import { goalsTable } from '../drizzle/schema';
import type { GoalRow, NewGoalRow } from '../drizzle/types';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: GoalRow): Goal {
  return {
    id: row.id,
    userId: row.userId,
    workspaceId: row.workspaceId,
    type: row.type,
    targetValue: row.targetValue,
    period: row.period,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: row.deleted,
  };
}

function toDbInsert(
  goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>
): Omit<NewGoalRow, 'id'> {
  const timestamp = now();
  return {
    userId: goal.userId,
    workspaceId: goal.workspaceId,
    type: goal.type,
    targetValue: goal.targetValue,
    period: goal.period,
    isActive: goal.isActive,
    createdAt: timestamp,
    updatedAt: timestamp,
    deleted: false,
  };
}

function toDbUpdate(goal: Partial<Goal>): Partial<GoalRow> {
  return {
    ...goal,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class GoalRepository {
  async findById(db: StrideDatabase, id: string): Promise<Goal | null> {
    const row = await db.query.goalsTable.findFirst({
      where: and(eq(goalsTable.id, id), eq(goalsTable.deleted, false)),
    });
    return row ? toDomain(row) : null;
  }

  async findByUser(db: StrideDatabase, userId: string): Promise<Goal[]> {
    const rows = await db.query.goalsTable.findMany({
      where: and(eq(goalsTable.userId, userId), eq(goalsTable.deleted, false)),
    });
    return rows.map(toDomain);
  }

  async findByWorkspace(db: StrideDatabase, workspaceId: string): Promise<Goal[]> {
    const rows = await db.query.goalsTable.findMany({
      where: and(eq(goalsTable.workspaceId, workspaceId), eq(goalsTable.deleted, false)),
    });
    return rows.map(toDomain);
  }

  async findByUserInWorkspace(
    db: StrideDatabase,
    userId: string,
    workspaceId: string
  ): Promise<Goal[]> {
    const rows = await db.query.goalsTable.findMany({
      where: and(
        eq(goalsTable.userId, userId),
        eq(goalsTable.workspaceId, workspaceId),
        eq(goalsTable.deleted, false)
      ),
    });
    return rows.map(toDomain);
  }

  async create(
    db: StrideDatabase,
    goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>
  ): Promise<Goal> {
    const id = generateId();
    const dbGoal = toDbInsert(goal);

    await db.insert(goalsTable).values({
      id,
      ...dbGoal,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create goal');
    }
    return created;
  }

  async update(db: StrideDatabase, id: string, updates: Partial<Goal>): Promise<Goal> {
    const dbUpdates = toDbUpdate(updates);

    await db
      .update(goalsTable)
      .set(dbUpdates)
      .where(and(eq(goalsTable.id, id), eq(goalsTable.deleted, false)));

    const updated = await this.findById(db, id);
    if (!updated) {
      throw new Error('Goal not found or was deleted');
    }
    return updated;
  }

  async delete(db: StrideDatabase, id: string): Promise<void> {
    await db
      .update(goalsTable)
      .set({ deleted: true, updatedAt: now() } as any)
      .where(eq(goalsTable.id, id));
  }
}

export const goalRepo = new GoalRepository();
