/**
 * WorkspaceStatus Repository
 *
 * Provides CRUD operations for workspace statuses with proper domain/DB type mapping.
 * All methods accept a DB instance to support transactions.
 */

import { eq } from 'drizzle-orm';
import type { WorkspaceStatus, CreateWorkspaceStatusInput } from '@stridetime/types';
import { workspaceStatusesTable } from '../drizzle/schema';
import type { WorkspaceStatusRow, NewWorkspaceStatusRow } from '../drizzle/types';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: WorkspaceStatusRow): WorkspaceStatus {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    name: row.name,
    description: row.description,
    icon: row.icon,
    color: row.color,
    isEnabled: row.isEnabled,
    displayOrder: row.displayOrder,
    isDefault: row.isDefault,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: row.deleted,
  };
}

function toDbInsert(status: CreateWorkspaceStatusInput): Omit<NewWorkspaceStatusRow, 'id'> {
  const timestamp = now();
  return {
    workspaceId: status.workspaceId,
    name: status.name,
    description: status.description,
    icon: status.icon,
    color: status.color,
    isEnabled: status.isEnabled,
    displayOrder: status.displayOrder,
    isDefault: status.isDefault,
    createdAt: timestamp,
    updatedAt: timestamp,
    deleted: false,
  };
}

function toDbUpdate(status: Partial<WorkspaceStatus>): Partial<WorkspaceStatusRow> {
  return {
    ...status,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class WorkspaceStatusRepository {
  async findById(db: StrideDatabase, id: string): Promise<WorkspaceStatus | null> {
    const row = await db.query.workspaceStatusesTable.findFirst({
      where: eq(workspaceStatusesTable.id, id),
    });
    return row ? toDomain(row) : null;
  }

  async findByWorkspace(db: StrideDatabase, workspaceId: string): Promise<WorkspaceStatus[]> {
    const rows = await db.query.workspaceStatusesTable.findMany({
      where: eq(workspaceStatusesTable.workspaceId, workspaceId),
      orderBy: (_table, { asc }) => [asc(workspaceStatusesTable.displayOrder)],
    });
    return rows.map(toDomain);
  }

  async create(db: StrideDatabase, status: CreateWorkspaceStatusInput): Promise<WorkspaceStatus> {
    const id = generateId();
    const dbStatus = toDbInsert(status);

    await db.insert(workspaceStatusesTable).values({
      id,
      ...dbStatus,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create workspace status');
    }
    return created;
  }

  async update(
    db: StrideDatabase,
    id: string,
    updates: Partial<WorkspaceStatus>
  ): Promise<WorkspaceStatus> {
    const dbUpdates = toDbUpdate(updates);

    await db.update(workspaceStatusesTable).set(dbUpdates).where(eq(workspaceStatusesTable.id, id));

    const updated = await this.findById(db, id);
    if (!updated) {
      throw new Error('Workspace status not found');
    }
    return updated;
  }

  async delete(db: StrideDatabase, id: string): Promise<void> {
    await db.delete(workspaceStatusesTable).where(eq(workspaceStatusesTable.id, id));
  }
}

export const workspaceStatusRepo = new WorkspaceStatusRepository();
