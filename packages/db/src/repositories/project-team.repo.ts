/**
 * ProjectTeam Repository
 *
 * Provides CRUD operations for project-team associations with proper domain/DB type mapping.
 * All methods accept a DB instance to support transactions.
 */

import { eq } from 'drizzle-orm';
import type { ProjectTeam, CreateProjectTeamInput } from '@stridetime/types';
import { projectTeamsTable } from '../drizzle/schema';
import type { ProjectTeamRow, NewProjectTeamRow } from '../drizzle/types';
import type { StrideDatabase } from '../db/client';
import { generateId, now } from '../db/utils';

// ============================================================================
// MAPPERS
// ============================================================================

function toDomain(row: ProjectTeamRow): ProjectTeam {
  return {
    id: row.id,
    projectId: row.projectId,
    teamId: row.teamId,
    addedAt: row.addedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: row.deleted,
  };
}

function toDbInsert(pt: CreateProjectTeamInput): Omit<NewProjectTeamRow, 'id'> {
  const timestamp = now();
  return {
    projectId: pt.projectId,
    teamId: pt.teamId,
    addedAt: pt.addedAt,
    createdAt: timestamp,
    updatedAt: timestamp,
    deleted: false,
  };
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class ProjectTeamRepository {
  async findById(db: StrideDatabase, id: string): Promise<ProjectTeam | null> {
    const row = await db.query.projectTeamsTable.findFirst({
      where: eq(projectTeamsTable.id, id),
    });
    return row ? toDomain(row) : null;
  }

  async findByProject(db: StrideDatabase, projectId: string): Promise<ProjectTeam[]> {
    const rows = await db.query.projectTeamsTable.findMany({
      where: eq(projectTeamsTable.projectId, projectId),
    });
    return rows.map(toDomain);
  }

  async findByTeam(db: StrideDatabase, teamId: string): Promise<ProjectTeam[]> {
    const rows = await db.query.projectTeamsTable.findMany({
      where: eq(projectTeamsTable.teamId, teamId),
    });
    return rows.map(toDomain);
  }

  async create(db: StrideDatabase, pt: CreateProjectTeamInput): Promise<ProjectTeam> {
    const id = generateId();
    const dbPt = toDbInsert(pt);

    await db.insert(projectTeamsTable).values({
      id,
      ...dbPt,
    });

    const created = await this.findById(db, id);
    if (!created) {
      throw new Error('Failed to create project-team association');
    }
    return created;
  }

  async delete(db: StrideDatabase, id: string): Promise<void> {
    await db.delete(projectTeamsTable).where(eq(projectTeamsTable.id, id));
  }
}

export const projectTeamRepo = new ProjectTeamRepository();
