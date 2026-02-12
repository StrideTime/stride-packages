/**
 * WorkSession Repository
 *
 * Provides CRUD operations for work sessions with proper domain/DB type mapping.
 * All methods accept a DB instance to support transactions.
 */

import { eq, and } from 'drizzle-orm';
import type { WorkSession, CreateWorkSessionInput } from '@stridetime/types';
import { workSessionsTable } from '../drizzle/schema';
import type { WorkSessionRow, NewWorkSessionRow } from '../drizzle/types';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: WorkSessionRow): WorkSession {
  return {
    id: row.id,
    userId: row.userId,
    workspaceId: row.workspaceId,
    status: row.status,
    clockedInAt: row.clockedInAt,
    clockedOutAt: row.clockedOutAt,
    totalFocusMinutes: row.totalFocusMinutes,
    totalBreakMinutes: row.totalBreakMinutes,
    date: row.date,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: row.deleted,
  };
}

function toDbInsert(session: CreateWorkSessionInput): Omit<NewWorkSessionRow, 'id'> {
  const timestamp = now();
  return {
    userId: session.userId,
    workspaceId: session.workspaceId,
    status: session.status,
    clockedInAt: session.clockedInAt,
    clockedOutAt: session.clockedOutAt,
    totalFocusMinutes: session.totalFocusMinutes,
    totalBreakMinutes: session.totalBreakMinutes,
    date: session.date,
    createdAt: timestamp,
    updatedAt: timestamp,
    deleted: false,
  };
}

function toDbUpdate(session: Partial<WorkSession>): Partial<WorkSessionRow> {
  return {
    ...session,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class WorkSessionRepository {
  async findById(db: StrideDatabase, id: string): Promise<WorkSession | null> {
    const row = await db.query.workSessionsTable.findFirst({
      where: and(eq(workSessionsTable.id, id), eq(workSessionsTable.deleted, false)),
    });
    return row ? toDomain(row) : null;
  }

  async findByUser(db: StrideDatabase, userId: string): Promise<WorkSession[]> {
    const rows = await db.query.workSessionsTable.findMany({
      where: and(eq(workSessionsTable.userId, userId), eq(workSessionsTable.deleted, false)),
    });
    return rows.map(toDomain);
  }

  async create(db: StrideDatabase, session: CreateWorkSessionInput): Promise<WorkSession> {
    const id = generateId();
    const dbSession = toDbInsert(session);

    await db.insert(workSessionsTable).values({
      id,
      ...dbSession,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create work session');
    }
    return created;
  }

  async update(
    db: StrideDatabase,
    id: string,
    updates: Partial<WorkSession>
  ): Promise<WorkSession> {
    const dbUpdates = toDbUpdate(updates);

    await db
      .update(workSessionsTable)
      .set(dbUpdates)
      .where(and(eq(workSessionsTable.id, id), eq(workSessionsTable.deleted, false)));

    const updated = await this.findById(db, id);
    if (!updated) {
      throw new Error('Work session not found or was deleted');
    }
    return updated;
  }

  async delete(db: StrideDatabase, id: string): Promise<void> {
    await db
      .update(workSessionsTable)
      .set({ deleted: true, updatedAt: now() } as any)
      .where(eq(workSessionsTable.id, id));
  }
}

export const workSessionRepo = new WorkSessionRepository();
