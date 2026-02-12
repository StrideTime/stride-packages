/**
 * TeamMember Repository
 *
 * Provides CRUD operations for team members with proper domain/DB type mapping.
 * All methods accept a DB instance to support transactions.
 */

import { eq, and } from 'drizzle-orm';
import type { TeamMember, CreateTeamMemberInput } from '@stridetime/types';
import { teamMembersTable } from '../drizzle/schema';
import type { TeamMemberRow, NewTeamMemberRow } from '../drizzle/types';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    teamId: row.teamId,
    userId: row.userId,
    role: row.role,
    addedBy: row.addedBy,
    addedAt: row.addedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: row.deleted,
  };
}

function toDbInsert(member: CreateTeamMemberInput): Omit<NewTeamMemberRow, 'id'> {
  const timestamp = now();
  return {
    teamId: member.teamId,
    userId: member.userId,
    role: member.role,
    addedBy: member.addedBy,
    addedAt: member.addedAt,
    createdAt: timestamp,
    updatedAt: timestamp,
    deleted: false,
  };
}

function toDbUpdate(member: Partial<TeamMember>): Partial<TeamMemberRow> {
  return {
    ...member,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class TeamMemberRepository {
  async findById(db: StrideDatabase, id: string): Promise<TeamMember | null> {
    const row = await db.query.teamMembersTable.findFirst({
      where: and(eq(teamMembersTable.id, id), eq(teamMembersTable.deleted, false)),
    });
    return row ? toDomain(row) : null;
  }

  async findByTeam(db: StrideDatabase, teamId: string): Promise<TeamMember[]> {
    const rows = await db.query.teamMembersTable.findMany({
      where: and(eq(teamMembersTable.teamId, teamId), eq(teamMembersTable.deleted, false)),
    });
    return rows.map(toDomain);
  }

  async findByUser(db: StrideDatabase, userId: string): Promise<TeamMember[]> {
    const rows = await db.query.teamMembersTable.findMany({
      where: and(eq(teamMembersTable.userId, userId), eq(teamMembersTable.deleted, false)),
    });
    return rows.map(toDomain);
  }

  async create(db: StrideDatabase, member: CreateTeamMemberInput): Promise<TeamMember> {
    const id = generateId();
    const dbMember = toDbInsert(member);

    await db.insert(teamMembersTable).values({
      id,
      ...dbMember,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create team member');
    }
    return created;
  }

  async update(db: StrideDatabase, id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    const dbUpdates = toDbUpdate(updates);

    await db
      .update(teamMembersTable)
      .set(dbUpdates)
      .where(and(eq(teamMembersTable.id, id), eq(teamMembersTable.deleted, false)));

    const updated = await this.findById(db, id);
    if (!updated) {
      throw new Error('Team member not found or was deleted');
    }
    return updated;
  }

  async delete(db: StrideDatabase, id: string): Promise<void> {
    await db
      .update(teamMembersTable)
      .set({ deleted: true, updatedAt: now() } as any)
      .where(eq(teamMembersTable.id, id));
  }
}

export const teamMemberRepo = new TeamMemberRepository();
