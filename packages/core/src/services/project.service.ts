import {
  projectRepo as defaultProjectRepo,
  type ProjectRepository,
  workspaceRepo as defaultWorkspaceRepo,
  type WorkspaceRepository,
  taskRepo as defaultTaskRepo,
  type TaskRepository,
  type StrideDatabase,
} from '@stridetime/db';
import type { Project, UpdateProjectInput } from '@stridetime/types';
import { ValidationError, ProjectStatus, TaskStatus } from '@stridetime/types';

/**
 * Parameters for creating a new project
 */
export interface CreateProjectParams {
  name: string;
  workspaceId: string;
  userId: string;
  description?: string;
  color?: string;
  icon?: string;
}

/**
 * Project Service for business logic
 */
export class ProjectService {
  constructor(
    private projectRepo: ProjectRepository = defaultProjectRepo,
    private workspaceRepo: WorkspaceRepository = defaultWorkspaceRepo,
    private taskRepo: TaskRepository = defaultTaskRepo
  ) {}

  /**
   * Validate hex color format
   */
  private isValidHexColor(color: string): boolean {
    return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(color);
  }

  /**
   * Validate project creation parameters
   */
  private validateCreate(params: CreateProjectParams): void {
    // Name validation
    if (!params.name || params.name.trim().length === 0) {
      throw new ValidationError('name', 'Project name is required');
    }

    if (params.name.length > 100) {
      throw new ValidationError('name', 'Project name must be under 100 characters');
    }

    // Workspace validation
    if (!params.workspaceId) {
      throw new ValidationError('workspaceId', 'Workspace ID is required');
    }

    // User validation
    if (!params.userId) {
      throw new ValidationError('userId', 'User ID is required');
    }

    // Color validation (if provided)
    if (params.color && !this.isValidHexColor(params.color)) {
      throw new ValidationError('color', 'Color must be a valid hex color (#xxx or #xxxxxx)');
    }
  }

  /**
   * Validate project update parameters
   */
  private validateUpdate(params: UpdateProjectInput): void {
    // Name validation (if provided)
    if (params.name !== undefined) {
      if (params.name.trim().length === 0) {
        throw new ValidationError('name', 'Project name cannot be empty');
      }

      if (params.name.length > 100) {
        throw new ValidationError('name', 'Project name must be under 100 characters');
      }
    }

    // Color validation (if provided)
    if (params.color && !this.isValidHexColor(params.color)) {
      throw new ValidationError('color', 'Color must be a valid hex color (#xxx or #xxxxxx)');
    }
  }

  /**
   * Create a new project
   */
  async create(db: StrideDatabase, params: CreateProjectParams): Promise<Project> {
    // 1. Validate synchronously
    this.validateCreate(params);

    // 2. Async DB checks - verify workspace exists
    const workspace = await this.workspaceRepo.findById(db, params.workspaceId);
    if (!workspace) {
      throw new ValidationError('workspaceId', 'Workspace not found');
    }

    // 3. Create project via repo with defaults
    const project = await this.projectRepo.create(db, {
      userId: params.userId,
      workspaceId: params.workspaceId,
      name: params.name.trim(),
      description: params.description?.trim() || null,
      color: params.color || null,
      icon: params.icon || null,
      status: ProjectStatus.ACTIVE,
      completionPercentage: 0,
    });

    return project;
  }

  /**
   * Update a project
   */
  async update(db: StrideDatabase, id: string, params: UpdateProjectInput): Promise<Project> {
    // 1. Validate synchronously
    this.validateUpdate(params);

    // 2. Check if project exists
    const existingProject = await this.projectRepo.findById(db, id);
    if (!existingProject) {
      throw new ValidationError('id', 'Project not found');
    }

    // 3. Prepare updates
    const updates: Partial<Project> = {};

    if (params.name !== undefined) {
      updates.name = params.name.trim();
    }

    if (params.description !== undefined) {
      updates.description = params.description?.trim() || null;
    }

    if (params.color !== undefined) {
      updates.color = params.color || null;
    }

    if (params.icon !== undefined) {
      updates.icon = params.icon || null;
    }

    if (params.status !== undefined) {
      updates.status = params.status;
    }

    // 4. Update project via repo
    const updatedProject = await this.projectRepo.update(db, id, updates);

    return updatedProject;
  }

  /**
   * Delete a project (soft delete)
   */
  async delete(db: StrideDatabase, id: string): Promise<void> {
    // Check if project exists
    const project = await this.projectRepo.findById(db, id);
    if (!project) {
      throw new ValidationError('id', 'Project not found');
    }

    await this.projectRepo.delete(db, id);
  }

  /**
   * Archive a project (sets status to ARCHIVED)
   */
  async archive(db: StrideDatabase, id: string): Promise<void> {
    // Check if project exists
    const project = await this.projectRepo.findById(db, id);
    if (!project) {
      throw new ValidationError('id', 'Project not found');
    }

    // Update status to ARCHIVED
    await this.projectRepo.update(db, id, { status: ProjectStatus.ARCHIVED });
  }

  /**
   * Get project by ID
   */
  async findById(db: StrideDatabase, id: string): Promise<Project | null> {
    return this.projectRepo.findById(db, id);
  }

  /**
   * Get all projects in a workspace
   */
  async findByWorkspace(db: StrideDatabase, workspaceId: string): Promise<Project[]> {
    return this.projectRepo.findByWorkspaceId(db, workspaceId);
  }

  // ==========================================================================
  // REACTIVE QUERIES (return CompilableQuery for use with useQuery)
  // ==========================================================================

  /**
   * Reactive query: all projects for a user.
   * Pass the result to useQuery() from @powersync/react.
   */
  watchByUser(db: StrideDatabase, userId: string) {
    return this.projectRepo.watchByUser(db, userId);
  }

  /**
   * Update project completion percentage based on task completion
   */
  async updateCompletion(db: StrideDatabase, projectId: string): Promise<void> {
    // Check if project exists
    const project = await this.projectRepo.findById(db, projectId);
    if (!project) {
      throw new ValidationError('projectId', 'Project not found');
    }

    // Get all tasks for this project
    const tasks = await this.taskRepo.findByProjectId(db, projectId);

    // If no tasks, set completion to 0
    if (tasks.length === 0) {
      await this.projectRepo.update(db, projectId, { completionPercentage: 0 });
      return;
    }

    // Calculate completion percentage
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const completionPercentage = Math.round((completedTasks / tasks.length) * 100);

    // Update project completion
    await this.projectRepo.update(db, projectId, { completionPercentage });
  }
}

/**
 * Singleton instance for convenient access
 */
export const projectService = new ProjectService();
