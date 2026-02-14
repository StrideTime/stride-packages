/**
 * Admin Audit Repository
 *
 * Provides operations for the admin audit log (append-only).
 * NOTE: This table is append-only — no updates or deletes, no soft delete column.
 */

import { eq, and, desc } from 'drizzle-orm';
import type { AdminAuditEntry } from '@stridetime/types';
import { adminAuditLogTable } from '../drizzle/schema';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// DB ROW TYPES
// ============================================================================

type AdminAuditRow = typeof adminAuditLogTable.$inferSelect;
type NewAdminAuditRow = typeof adminAuditLogTable.$inferInsert;

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: AdminAuditRow): AdminAuditEntry {
  return {
    id: row.id,
    adminUserId: row.adminUserId,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    details: row.details,
    performedAt: row.performedAt,
  };
}

function toDbInsert(entry: Omit<AdminAuditEntry, 'id'>): Omit<NewAdminAuditRow, 'id'> {
  return {
    adminUserId: entry.adminUserId,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    details: entry.details,
    performedAt: entry.performedAt || now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class AdminAuditRepository {
  async create(db: StrideDatabase, entry: Omit<AdminAuditEntry, 'id'>): Promise<AdminAuditEntry> {
    const id = generateId();
    const dbEntry = toDbInsert(entry);

    await db.insert(adminAuditLogTable).values({
      id,
      ...dbEntry,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create audit entry');
    }
    return created;
  }

  async findById(db: StrideDatabase, id: string): Promise<AdminAuditEntry | null> {
    const row = await db.query.adminAuditLogTable.findFirst({
      where: eq(adminAuditLogTable.id, id),
    });
    return row ? toDomain(row) : null;
  }

  async findByEntity(
    db: StrideDatabase,
    entityType: string,
    entityId: string
  ): Promise<AdminAuditEntry[]> {
    const rows = await db.query.adminAuditLogTable.findMany({
      where: and(
        eq(adminAuditLogTable.entityType, entityType),
        eq(adminAuditLogTable.entityId, entityId)
      ),
      orderBy: [desc(adminAuditLogTable.performedAt)],
    });
    return rows.map(toDomain);
  }

  async findByAdmin(
    db: StrideDatabase,
    adminUserId: string,
    limit = 100
  ): Promise<AdminAuditEntry[]> {
    const rows = await db.query.adminAuditLogTable.findMany({
      where: eq(adminAuditLogTable.adminUserId, adminUserId),
      orderBy: [desc(adminAuditLogTable.performedAt)],
      limit,
    });
    return rows.map(toDomain);
  }

  async findRecent(db: StrideDatabase, limit = 50): Promise<AdminAuditEntry[]> {
    const rows = await db.query.adminAuditLogTable.findMany({
      orderBy: [desc(adminAuditLogTable.performedAt)],
      limit,
    });
    return rows.map(toDomain);
  }
}

export const adminAuditRepo = new AdminAuditRepository();
