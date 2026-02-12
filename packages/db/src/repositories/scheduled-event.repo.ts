/**
 * ScheduledEvent Repository
 *
 * Provides CRUD operations for scheduled events with proper domain/DB type mapping.
 * All methods accept a DB instance to support transactions.
 */

import { eq, and, gte, lte } from 'drizzle-orm';
import type { ScheduledEvent } from '@stridetime/types';
import { scheduledEventsTable } from '../drizzle/schema';
import type { ScheduledEventRow, NewScheduledEventRow } from '../drizzle/types';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: ScheduledEventRow): ScheduledEvent {
  return {
    id: row.id,
    taskId: row.taskId,
    userId: row.userId,
    startTime: row.startTime,
    durationMinutes: row.durationMinutes,
    label: row.label,
    type: row.type,
    externalId: row.externalId,
    externalSource: row.externalSource,
    metadata: row.metadata,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: row.deleted,
  };
}

function toDbInsert(
  event: Omit<ScheduledEvent, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>
): Omit<NewScheduledEventRow, 'id'> {
  const timestamp = now();
  return {
    taskId: event.taskId,
    userId: event.userId,
    startTime: event.startTime,
    durationMinutes: event.durationMinutes,
    label: event.label,
    type: event.type,
    externalId: event.externalId,
    externalSource: event.externalSource,
    metadata: event.metadata,
    createdAt: timestamp,
    updatedAt: timestamp,
    deleted: false,
  };
}

function toDbUpdate(event: Partial<ScheduledEvent>): Partial<ScheduledEventRow> {
  return {
    ...event,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class ScheduledEventRepository {
  async findById(db: StrideDatabase, id: string): Promise<ScheduledEvent | null> {
    const row = await db.query.scheduledEventsTable.findFirst({
      where: and(eq(scheduledEventsTable.id, id), eq(scheduledEventsTable.deleted, false)),
    });
    return row ? toDomain(row) : null;
  }

  async findByUser(db: StrideDatabase, userId: string): Promise<ScheduledEvent[]> {
    const rows = await db.query.scheduledEventsTable.findMany({
      where: and(eq(scheduledEventsTable.userId, userId), eq(scheduledEventsTable.deleted, false)),
    });
    return rows.map(toDomain);
  }

  async findByUserInRange(
    db: StrideDatabase,
    userId: string,
    startTime: string,
    endTime: string
  ): Promise<ScheduledEvent[]> {
    const rows = await db.query.scheduledEventsTable.findMany({
      where: and(
        eq(scheduledEventsTable.userId, userId),
        gte(scheduledEventsTable.startTime, startTime),
        lte(scheduledEventsTable.startTime, endTime),
        eq(scheduledEventsTable.deleted, false)
      ),
    });
    return rows.map(toDomain);
  }

  async create(
    db: StrideDatabase,
    event: Omit<ScheduledEvent, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>
  ): Promise<ScheduledEvent> {
    const id = generateId();
    const dbEvent = toDbInsert(event);

    await db.insert(scheduledEventsTable).values({
      id,
      ...dbEvent,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create scheduled event');
    }
    return created;
  }

  async update(
    db: StrideDatabase,
    id: string,
    updates: Partial<ScheduledEvent>
  ): Promise<ScheduledEvent> {
    const dbUpdates = toDbUpdate(updates);

    await db
      .update(scheduledEventsTable)
      .set(dbUpdates)
      .where(and(eq(scheduledEventsTable.id, id), eq(scheduledEventsTable.deleted, false)));

    const updated = await this.findById(db, id);
    if (!updated) {
      throw new Error('Scheduled event not found or was deleted');
    }
    return updated;
  }

  async delete(db: StrideDatabase, id: string): Promise<void> {
    await db
      .update(scheduledEventsTable)
      .set({ deleted: true, updatedAt: now() } as any)
      .where(eq(scheduledEventsTable.id, id));
  }
}

export const scheduledEventRepo = new ScheduledEventRepository();
