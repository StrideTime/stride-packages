/**
 * PointsLedger Repository
 *
 * Provides CRUD operations for points ledger entries with proper domain/DB type mapping.
 * All methods accept a DB instance to support transactions.
 */

import { eq, desc, and } from 'drizzle-orm';
import type { PointsLedgerEntry, CreatePointsLedgerEntryInput } from '@stridetime/types';
import { pointsLedgerTable, tasksTable, projectsTable } from '../drizzle/schema';
import type { PointsLedgerRow, NewPointsLedgerRow } from '../drizzle/types';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: PointsLedgerRow): PointsLedgerEntry {
  return {
    id: row.id,
    userId: row.userId,
    taskId: row.taskId,
    timeEntryId: row.timeEntryId,
    points: row.points,
    reason: row.reason,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: row.deleted,
  };
}

function toDbInsert(entry: CreatePointsLedgerEntryInput): Omit<NewPointsLedgerRow, 'id'> {
  const timestamp = now();
  return {
    userId: entry.userId,
    taskId: entry.taskId,
    timeEntryId: entry.timeEntryId,
    points: entry.points,
    reason: entry.reason,
    description: entry.description,
    createdAt: timestamp,
    updatedAt: timestamp,
    deleted: false,
  };
}

// No update method needed - points ledger entries are immutable

// ============================================================================
// REPOSITORY
// ============================================================================

export class PointsLedgerRepository {
  async findById(db: StrideDatabase, id: string): Promise<PointsLedgerEntry | null> {
    const row = await db.query.pointsLedgerTable.findFirst({
      where: eq(pointsLedgerTable.id, id),
    });
    return row ? toDomain(row) : null;
  }

  async findByUser(db: StrideDatabase, userId: string): Promise<PointsLedgerEntry[]> {
    const rows = await db.query.pointsLedgerTable.findMany({
      where: eq(pointsLedgerTable.userId, userId),
      orderBy: [desc(pointsLedgerTable.createdAt)],
    });
    return rows.map(toDomain);
  }

  async findByWorkspace(db: StrideDatabase, workspaceId: string): Promise<PointsLedgerEntry[]> {
    const rows = await db
      .select({
        points_ledger: pointsLedgerTable,
      })
      .from(pointsLedgerTable)
      .innerJoin(tasksTable, eq(pointsLedgerTable.taskId, tasksTable.id))
      .innerJoin(projectsTable, eq(tasksTable.projectId, projectsTable.id))
      .where(eq(projectsTable.workspaceId, workspaceId))
      .orderBy(desc(pointsLedgerTable.createdAt));

    return rows.map(row => toDomain(row.points_ledger));
  }

  async findByUserInWorkspace(
    db: StrideDatabase,
    userId: string,
    workspaceId: string
  ): Promise<PointsLedgerEntry[]> {
    const rows = await db
      .select({
        points_ledger: pointsLedgerTable,
      })
      .from(pointsLedgerTable)
      .innerJoin(tasksTable, eq(pointsLedgerTable.taskId, tasksTable.id))
      .innerJoin(projectsTable, eq(tasksTable.projectId, projectsTable.id))
      .where(and(eq(pointsLedgerTable.userId, userId), eq(projectsTable.workspaceId, workspaceId)))
      .orderBy(desc(pointsLedgerTable.createdAt));

    return rows.map(row => toDomain(row.points_ledger));
  }

  async create(
    db: StrideDatabase,
    entry: CreatePointsLedgerEntryInput
  ): Promise<PointsLedgerEntry> {
    const id = generateId();
    const dbEntry = toDbInsert(entry);

    await db.insert(pointsLedgerTable).values({
      id,
      ...dbEntry,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create points ledger entry');
    }
    return created;
  }
}

export const pointsLedgerRepo = new PointsLedgerRepository();
