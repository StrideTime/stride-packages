/**
 * Team Repository
 *
 * Provides CRUD operations for teams with proper domain/DB type mapping.
 * All methods accept a DB instance to support transactions.
 */

import { eq, and } from 'drizzle-orm';
import type { Team } from '@stridetime/types';
import { teamsTable } from '../drizzle/schema';
import type { TeamRow, NewTeamRow } from '../drizzle/types';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: TeamRow): Team {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    name: row.name,
    description: row.description,
    color: row.color,
    icon: row.icon,
    isDefault: row.isDefault,
    leadUserId: row.leadUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: row.deleted,
  };
}

function toDbInsert(
  team: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>
): Omit<NewTeamRow, 'id'> {
  const timestamp = now();
  return {
    workspaceId: team.workspaceId,
    name: team.name,
    description: team.description,
    color: team.color,
    icon: team.icon,
    isDefault: team.isDefault,
    leadUserId: team.leadUserId,
    createdAt: timestamp,
    updatedAt: timestamp,
    deleted: false,
  };
}

function toDbUpdate(team: Partial<Team>): Partial<TeamRow> {
  return {
    ...team,
    updatedAt: now(),
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class TeamRepository {
  async findById(db: StrideDatabase, id: string): Promise<Team | null> {
    const row = await db.query.teamsTable.findFirst({
      where: and(eq(teamsTable.id, id), eq(teamsTable.deleted, false)),
    });
    return row ? toDomain(row) : null;
  }

  async findByWorkspace(db: StrideDatabase, workspaceId: string): Promise<Team[]> {
    const rows = await db.query.teamsTable.findMany({
      where: and(eq(teamsTable.workspaceId, workspaceId), eq(teamsTable.deleted, false)),
    });
    return rows.map(toDomain);
  }

  async findDefault(db: StrideDatabase, workspaceId: string): Promise<Team | null> {
    const row = await db.query.teamsTable.findFirst({
      where: and(
        eq(teamsTable.workspaceId, workspaceId),
        eq(teamsTable.isDefault, true),
        eq(teamsTable.deleted, false)
      ),
    });
    return row ? toDomain(row) : null;
  }

  async create(
    db: StrideDatabase,
    team: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>
  ): Promise<Team> {
    const id = generateId();
    const dbTeam = toDbInsert(team);

    await db.insert(teamsTable).values({
      id,
      ...dbTeam,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create team');
    }
    return created;
  }

  async update(db: StrideDatabase, id: string, updates: Partial<Team>): Promise<Team> {
    const dbUpdates = toDbUpdate(updates);

    await db
      .update(teamsTable)
      .set(dbUpdates)
      .where(and(eq(teamsTable.id, id), eq(teamsTable.deleted, false)));

    const updated = await this.findById(db, id);
    if (!updated) {
      throw new Error('Team not found or was deleted');
    }
    return updated;
  }

  async delete(db: StrideDatabase, id: string): Promise<void> {
    await db
      .update(teamsTable)
      .set({ deleted: true, updatedAt: now() } as any)
      .where(eq(teamsTable.id, id));
  }
}

export const teamRepo = new TeamRepository();
