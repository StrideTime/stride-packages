import {
  workspaceRepo as defaultWorkspaceRepo,
  type WorkspaceRepository,
  type StrideDatabase,
} from '@stridetime/db';
import type { Workspace, WorkspaceType } from '@stridetime/types';
import { ValidationError } from '@stridetime/types';

/**
 * Parameters for creating a new workspace
 */
export interface CreateWorkspaceParams {
  name: string;
  ownerUserId: string;
  type: WorkspaceType;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  timezone?: string;
  weekStartsOn?: number;
}

/**
 * Parameters for updating a workspace
 */
export interface UpdateWorkspaceParams {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  timezone?: string;
  weekStartsOn?: number;
  defaultProjectId?: string | null;
  defaultTeamId?: string | null;
}

/**
 * Workspace Service for business logic
 */
export class WorkspaceService {
  constructor(private workspaceRepo: WorkspaceRepository = defaultWorkspaceRepo) {}

  /**
   * Validate workspace creation parameters
   */
  private validateCreate(params: CreateWorkspaceParams): void {
    // Name validation
    if (!params.name || params.name.trim().length === 0) {
      throw new ValidationError('name', 'Workspace name is required');
    }

    if (params.name.length > 100) {
      throw new ValidationError('name', 'Workspace name must be under 100 characters');
    }

    // Owner validation
    if (!params.ownerUserId) {
      throw new ValidationError('ownerUserId', 'Workspace must have an owner');
    }

    // Type validation
    if (!params.type) {
      throw new ValidationError('type', 'Workspace type is required');
    }

    // Description validation (if provided)
    if (params.description && params.description.length > 500) {
      throw new ValidationError('description', 'Description must be under 500 characters');
    }

    // Week starts on validation
    if (params.weekStartsOn !== undefined) {
      if (params.weekStartsOn < 0 || params.weekStartsOn > 6) {
        throw new ValidationError(
          'weekStartsOn',
          'Week start day must be between 0 (Sunday) and 6 (Saturday)'
        );
      }
    }
  }

  /**
   * Validate workspace update parameters
   */
  private validateUpdate(params: UpdateWorkspaceParams): void {
    // Name validation (if provided)
    if (params.name !== undefined) {
      if (params.name.trim().length === 0) {
        throw new ValidationError('name', 'Workspace name cannot be empty');
      }

      if (params.name.length > 100) {
        throw new ValidationError('name', 'Workspace name must be under 100 characters');
      }
    }

    // Description validation (if provided)
    if (params.description !== undefined && params.description && params.description.length > 500) {
      throw new ValidationError('description', 'Description must be under 500 characters');
    }

    // Week starts on validation
    if (params.weekStartsOn !== undefined) {
      if (params.weekStartsOn < 0 || params.weekStartsOn > 6) {
        throw new ValidationError(
          'weekStartsOn',
          'Week start day must be between 0 (Sunday) and 6 (Saturday)'
        );
      }
    }
  }

  /**
   * Create a new workspace
   */
  async create(db: StrideDatabase, params: CreateWorkspaceParams): Promise<Workspace> {
    // 1. Validate synchronously
    this.validateCreate(params);

    // 2. Create workspace via repo
    const workspace = await this.workspaceRepo.create(db, {
      ownerUserId: params.ownerUserId,
      name: params.name.trim(),
      description: params.description?.trim() || null,
      icon: params.icon || null,
      type: params.type,
      color: params.color || null,
      timezone: params.timezone || 'UTC',
      weekStartsOn: params.weekStartsOn ?? 0,
      defaultProjectId: null,
      defaultTeamId: null,
    });

    return workspace;
  }

  /**
   * Update a workspace
   */
  async update(db: StrideDatabase, id: string, params: UpdateWorkspaceParams): Promise<Workspace> {
    // 1. Validate synchronously
    this.validateUpdate(params);

    // 2. Check if workspace exists
    const existingWorkspace = await this.workspaceRepo.findById(db, id);
    if (!existingWorkspace) {
      throw new ValidationError('id', 'Workspace not found');
    }

    // 3. Prepare updates
    const updates: Partial<Workspace> = {};

    if (params.name !== undefined) {
      updates.name = params.name.trim();
    }

    if (params.description !== undefined) {
      updates.description = params.description?.trim() || null;
    }

    if (params.icon !== undefined) {
      updates.icon = params.icon || null;
    }

    if (params.color !== undefined) {
      updates.color = params.color || null;
    }

    if (params.timezone !== undefined) {
      updates.timezone = params.timezone;
    }

    if (params.weekStartsOn !== undefined) {
      updates.weekStartsOn = params.weekStartsOn;
    }

    if (params.defaultProjectId !== undefined) {
      updates.defaultProjectId = params.defaultProjectId;
    }

    if (params.defaultTeamId !== undefined) {
      updates.defaultTeamId = params.defaultTeamId;
    }

    // 4. Update workspace via repo
    const updatedWorkspace = await this.workspaceRepo.update(db, id, updates);

    return updatedWorkspace;
  }

  /**
   * Delete a workspace (soft delete)
   */
  async delete(db: StrideDatabase, id: string): Promise<void> {
    // Check if workspace exists
    const workspace = await this.workspaceRepo.findById(db, id);
    if (!workspace) {
      throw new ValidationError('id', 'Workspace not found');
    }

    await this.workspaceRepo.delete(db, id);
  }

  /**
   * Get workspace by ID
   */
  async findById(db: StrideDatabase, id: string): Promise<Workspace | null> {
    return this.workspaceRepo.findById(db, id);
  }

  /**
   * Get all workspaces owned by a user
   */
  async findByOwner(db: StrideDatabase, userId: string): Promise<Workspace[]> {
    return this.workspaceRepo.findByOwner(db, userId);
  }
}

/**
 * Singleton instance for convenient access
 */
export const workspaceService = new WorkspaceService();
