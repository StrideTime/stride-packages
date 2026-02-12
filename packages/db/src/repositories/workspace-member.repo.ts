/**
 * WorkspaceMember Repository
 *
 * Provides CRUD operations for workspace members with proper domain/DB type mapping.
 * All methods accept a DB instance to support transactions.
 */

import { eq, and } from 'drizzle-orm';
import type { WorkspaceMember, CreateWorkspaceMemberInput } from '@stridetime/types';
import { workspaceMembersTable } from '../drizzle/schema';
import type { WorkspaceMemberRow, NewWorkspaceMemberRow } from '../drizzle/types';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// MAPPERS
// ============================================================================

/**
 * Map database row to domain WorkspaceMember type.
 */
function toDomain(row: WorkspaceMemberRow): WorkspaceMember {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    userId: row.userId,
    role: row.role,
    invitedBy: row.invitedBy,
    joinedAt: row.joinedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: row.deleted,
  };
}

/**
 * Map domain WorkspaceMember to database insert row.
 */
function toDbInsert(member: CreateWorkspaceMemberInput): Omit<NewWorkspaceMemberRow, 'id'> {
  const timestamp = now();
  return {
    workspaceId: member.workspaceId,
    userId: member.userId,
    role: member.role,
    invitedBy: member.invitedBy,
    joinedAt: member.joinedAt,
    createdAt: timestamp,
    updatedAt: timestamp,
    deleted: false,
  };
}

/**
 * Map domain WorkspaceMember partial update to database update row.
 */
function toDbUpdate(member: Partial<WorkspaceMember>): Partial<WorkspaceMemberRow> {
  return {
    ...member,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class WorkspaceMemberRepository {
  /**
   * Find a workspace member by ID.
   * Returns null if not found or deleted.
   */
  async findById(db: StrideDatabase, id: string): Promise<WorkspaceMember | null> {
    const row = await db.query.workspaceMembersTable.findFirst({
      where: and(eq(workspaceMembersTable.id, id), eq(workspaceMembersTable.deleted, false)),
    });
    return row ? toDomain(row) : null;
  }

  /**
   * Find all members of a workspace.
   * Returns empty array if none found.
   */
  async findByWorkspace(db: StrideDatabase, workspaceId: string): Promise<WorkspaceMember[]> {
    const rows = await db.query.workspaceMembersTable.findMany({
      where: and(
        eq(workspaceMembersTable.workspaceId, workspaceId),
        eq(workspaceMembersTable.deleted, false)
      ),
    });
    return rows.map(toDomain);
  }

  /**
   * Find all workspaces a user is a member of.
   * Returns empty array if none found.
   */
  async findByUser(db: StrideDatabase, userId: string): Promise<WorkspaceMember[]> {
    const rows = await db.query.workspaceMembersTable.findMany({
      where: and(
        eq(workspaceMembersTable.userId, userId),
        eq(workspaceMembersTable.deleted, false)
      ),
    });
    return rows.map(toDomain);
  }

  /**
   * Create a new workspace member.
   * Returns the created member with generated ID.
   */
  async create(db: StrideDatabase, member: CreateWorkspaceMemberInput): Promise<WorkspaceMember> {
    const id = generateId();
    const dbMember = toDbInsert(member);

    await db.insert(workspaceMembersTable).values({
      id,
      ...dbMember,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create workspace member');
    }
    return created;
  }

  /**
   * Update a workspace member.
   * Only updates provided fields (typically role).
   */
  async update(
    db: StrideDatabase,
    id: string,
    updates: Partial<WorkspaceMember>
  ): Promise<WorkspaceMember> {
    const dbUpdates = toDbUpdate(updates);

    await db
      .update(workspaceMembersTable)
      .set(dbUpdates)
      .where(and(eq(workspaceMembersTable.id, id), eq(workspaceMembersTable.deleted, false)));

    const updated = await this.findById(db, id);
    if (!updated) {
      throw new Error('Workspace member not found or was deleted');
    }
    return updated;
  }

  /**
   * Soft delete a workspace member.
   * Sets deleted flag to true.
   */
  async delete(db: StrideDatabase, id: string): Promise<void> {
    await db
      .update(workspaceMembersTable)
      .set({ deleted: true, updatedAt: now() } as any)
      .where(eq(workspaceMembersTable.id, id));
  }
}

// Export singleton instance
export const workspaceMemberRepo = new WorkspaceMemberRepository();
