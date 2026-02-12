/**
 * Unit tests for ProjectService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectService } from '../../services/project.service';
import type { CreateProjectParams } from '../../services/project.service';
import type { UpdateProjectInput } from '@stridetime/types';
import { ValidationError, ProjectStatus, TaskStatus } from '@stridetime/types';
import { createMockProject } from '@stridetime/test-utils';

// Hoist mocks
const { mockProjectRepo, mockWorkspaceRepo, mockTaskRepo } = vi.hoisted(() => ({
  mockProjectRepo: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findByWorkspaceId: vi.fn(),
  },
  mockWorkspaceRepo: {
    findById: vi.fn(),
  },
  mockTaskRepo: {
    findByProjectId: vi.fn(),
  },
}));

vi.mock('@stridetime/db', () => ({
  projectRepo: mockProjectRepo,
  ProjectRepository: vi.fn(),
  workspaceRepo: mockWorkspaceRepo,
  WorkspaceRepository: vi.fn(),
  taskRepo: mockTaskRepo,
  TaskRepository: vi.fn(),
}));

describe('ProjectService', () => {
  let service: ProjectService;
  let mockDb: any;

  beforeEach(() => {
    service = new ProjectService(mockProjectRepo, mockWorkspaceRepo, mockTaskRepo);
    mockDb = {};
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a project with valid parameters', async () => {
      const params: CreateProjectParams = {
        name: 'My Project',
        workspaceId: 'workspace-123',
        userId: 'user-123',
        description: 'A test project',
        color: '#3B82F6',
        icon: '📁',
      };

      const mockProject = createMockProject({
        id: 'project-123',
        name: 'My Project',
        workspaceId: 'workspace-123',
        userId: 'user-123',
        description: 'A test project',
        color: '#3B82F6',
        icon: '📁',
        status: ProjectStatus.ACTIVE,
        completionPercentage: 0,
      });

      mockWorkspaceRepo.findById.mockResolvedValue({ id: 'workspace-123' });
      mockProjectRepo.create.mockResolvedValue(mockProject);

      const result = await service.create(mockDb, params);

      expect(mockWorkspaceRepo.findById).toHaveBeenCalledWith(mockDb, 'workspace-123');
      expect(mockProjectRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          name: 'My Project',
          workspaceId: 'workspace-123',
          userId: 'user-123',
          description: 'A test project',
          color: '#3B82F6',
          icon: '📁',
          status: ProjectStatus.ACTIVE,
          completionPercentage: 0,
        })
      );
      expect(result).toEqual(mockProject);
    });

    it('should throw error when name is empty', async () => {
      const params: CreateProjectParams = {
        name: '',
        workspaceId: 'workspace-123',
        userId: 'user-123',
      };

      await expect(service.create(mockDb, params)).rejects.toThrow(ValidationError);
      await expect(service.create(mockDb, params)).rejects.toThrow('Project name is required');
    });

    it('should throw error when name is only whitespace', async () => {
      const params: CreateProjectParams = {
        name: '   ',
        workspaceId: 'workspace-123',
        userId: 'user-123',
      };

      await expect(service.create(mockDb, params)).rejects.toThrow('Project name is required');
    });

    it('should throw error when name exceeds 100 characters', async () => {
      const params: CreateProjectParams = {
        name: 'a'.repeat(101),
        workspaceId: 'workspace-123',
        userId: 'user-123',
      };

      await expect(service.create(mockDb, params)).rejects.toThrow(
        'Project name must be under 100 characters'
      );
    });

    it('should throw error when workspace does not exist', async () => {
      const params: CreateProjectParams = {
        name: 'Valid Name',
        workspaceId: 'nonexistent',
        userId: 'user-123',
      };

      mockWorkspaceRepo.findById.mockResolvedValue(null);

      await expect(service.create(mockDb, params)).rejects.toThrow('Workspace not found');
      expect(mockProjectRepo.create).not.toHaveBeenCalled();
    });

    it('should throw error when color format is invalid', async () => {
      const params: CreateProjectParams = {
        name: 'Valid Name',
        workspaceId: 'workspace-123',
        userId: 'user-123',
        color: 'invalid-color',
      };

      await expect(service.create(mockDb, params)).rejects.toThrow(
        'Color must be a valid hex color (#xxx or #xxxxxx)'
      );
    });

    it('should accept short hex color format (#xxx)', async () => {
      const params: CreateProjectParams = {
        name: 'Valid Name',
        workspaceId: 'workspace-123',
        userId: 'user-123',
        color: '#F00',
      };

      mockWorkspaceRepo.findById.mockResolvedValue({ id: 'workspace-123' });
      mockProjectRepo.create.mockResolvedValue(createMockProject());

      await service.create(mockDb, params);

      expect(mockProjectRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          color: '#F00',
        })
      );
    });

    it('should accept long hex color format (#xxxxxx)', async () => {
      const params: CreateProjectParams = {
        name: 'Valid Name',
        workspaceId: 'workspace-123',
        userId: 'user-123',
        color: '#FF0000',
      };

      mockWorkspaceRepo.findById.mockResolvedValue({ id: 'workspace-123' });
      mockProjectRepo.create.mockResolvedValue(createMockProject());

      await service.create(mockDb, params);

      expect(mockProjectRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          color: '#FF0000',
        })
      );
    });

    it('should trim name when creating', async () => {
      const params: CreateProjectParams = {
        name: '  My Project  ',
        workspaceId: 'workspace-123',
        userId: 'user-123',
      };

      mockWorkspaceRepo.findById.mockResolvedValue({ id: 'workspace-123' });
      mockProjectRepo.create.mockResolvedValue(createMockProject());

      await service.create(mockDb, params);

      expect(mockProjectRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          name: 'My Project',
        })
      );
    });

    it('should set default status to ACTIVE', async () => {
      const params: CreateProjectParams = {
        name: 'My Project',
        workspaceId: 'workspace-123',
        userId: 'user-123',
      };

      mockWorkspaceRepo.findById.mockResolvedValue({ id: 'workspace-123' });
      mockProjectRepo.create.mockResolvedValue(createMockProject());

      await service.create(mockDb, params);

      expect(mockProjectRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          status: ProjectStatus.ACTIVE,
          completionPercentage: 0,
        })
      );
    });
  });

  describe('update', () => {
    it('should update a project with valid parameters', async () => {
      const existingProject = createMockProject({ id: 'project-123' });
      const updatedProject = createMockProject({
        id: 'project-123',
        name: 'Updated Project',
      });

      mockProjectRepo.findById.mockResolvedValue(existingProject);
      mockProjectRepo.update.mockResolvedValue(updatedProject);

      const params: UpdateProjectInput = {
        name: 'Updated Project',
        description: 'New description',
        color: '#FF0000',
      };

      const result = await service.update(mockDb, 'project-123', params);

      expect(mockProjectRepo.findById).toHaveBeenCalledWith(mockDb, 'project-123');
      expect(mockProjectRepo.update).toHaveBeenCalledWith(
        mockDb,
        'project-123',
        expect.objectContaining({
          name: 'Updated Project',
          description: 'New description',
          color: '#FF0000',
        })
      );
      expect(result).toEqual(updatedProject);
    });

    it('should throw error when project does not exist', async () => {
      mockProjectRepo.findById.mockResolvedValue(null);

      const params: UpdateProjectInput = {
        name: 'Updated Name',
      };

      await expect(service.update(mockDb, 'nonexistent', params)).rejects.toThrow(
        'Project not found'
      );
    });

    it('should throw error when updated name is empty', async () => {
      const existingProject = createMockProject({ id: 'project-123' });
      mockProjectRepo.findById.mockResolvedValue(existingProject);

      const params: UpdateProjectInput = {
        name: '   ',
      };

      await expect(service.update(mockDb, 'project-123', params)).rejects.toThrow(
        'Project name cannot be empty'
      );
    });

    it('should throw error when updated name exceeds 100 characters', async () => {
      const existingProject = createMockProject({ id: 'project-123' });
      mockProjectRepo.findById.mockResolvedValue(existingProject);

      const params: UpdateProjectInput = {
        name: 'a'.repeat(101),
      };

      await expect(service.update(mockDb, 'project-123', params)).rejects.toThrow(
        'Project name must be under 100 characters'
      );
    });

    it('should throw error when color format is invalid', async () => {
      const existingProject = createMockProject({ id: 'project-123' });
      mockProjectRepo.findById.mockResolvedValue(existingProject);

      const params: UpdateProjectInput = {
        color: 'not-a-hex-color',
      };

      await expect(service.update(mockDb, 'project-123', params)).rejects.toThrow(
        'Color must be a valid hex color (#xxx or #xxxxxx)'
      );
    });

    it('should trim name when updating', async () => {
      const existingProject = createMockProject({ id: 'project-123' });
      const updatedProject = createMockProject({
        id: 'project-123',
        name: 'Trimmed Name',
      });

      mockProjectRepo.findById.mockResolvedValue(existingProject);
      mockProjectRepo.update.mockResolvedValue(updatedProject);

      const params: UpdateProjectInput = {
        name: '  Trimmed Name  ',
      };

      await service.update(mockDb, 'project-123', params);

      expect(mockProjectRepo.update).toHaveBeenCalledWith(
        mockDb,
        'project-123',
        expect.objectContaining({
          name: 'Trimmed Name',
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete a project (soft delete)', async () => {
      const mockProject = createMockProject({ id: 'project-123' });
      mockProjectRepo.findById.mockResolvedValue(mockProject);
      mockProjectRepo.delete.mockResolvedValue(undefined);

      await service.delete(mockDb, 'project-123');

      expect(mockProjectRepo.findById).toHaveBeenCalledWith(mockDb, 'project-123');
      expect(mockProjectRepo.delete).toHaveBeenCalledWith(mockDb, 'project-123');
    });

    it('should throw error when project does not exist', async () => {
      mockProjectRepo.findById.mockResolvedValue(null);

      await expect(service.delete(mockDb, 'nonexistent')).rejects.toThrow('Project not found');
      expect(mockProjectRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    it('should archive a project by setting status to ARCHIVED', async () => {
      const mockProject = createMockProject({ id: 'project-123' });
      mockProjectRepo.findById.mockResolvedValue(mockProject);
      mockProjectRepo.update.mockResolvedValue({ ...mockProject, status: ProjectStatus.ARCHIVED });

      await service.archive(mockDb, 'project-123');

      expect(mockProjectRepo.findById).toHaveBeenCalledWith(mockDb, 'project-123');
      expect(mockProjectRepo.update).toHaveBeenCalledWith(mockDb, 'project-123', {
        status: ProjectStatus.ARCHIVED,
      });
    });

    it('should throw error when project does not exist', async () => {
      mockProjectRepo.findById.mockResolvedValue(null);

      await expect(service.archive(mockDb, 'nonexistent')).rejects.toThrow('Project not found');
      expect(mockProjectRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return project when found', async () => {
      const mockProject = createMockProject({ id: 'project-123' });
      mockProjectRepo.findById.mockResolvedValue(mockProject);

      const result = await service.findById(mockDb, 'project-123');

      expect(mockProjectRepo.findById).toHaveBeenCalledWith(mockDb, 'project-123');
      expect(result).toEqual(mockProject);
    });

    it('should return null when project not found', async () => {
      mockProjectRepo.findById.mockResolvedValue(null);

      const result = await service.findById(mockDb, 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByWorkspace', () => {
    it('should return projects for a given workspace', async () => {
      const mockProjects = [
        createMockProject({ id: 'project-1', workspaceId: 'workspace-123' }),
        createMockProject({ id: 'project-2', workspaceId: 'workspace-123' }),
      ];

      mockProjectRepo.findByWorkspaceId.mockResolvedValue(mockProjects);

      const result = await service.findByWorkspace(mockDb, 'workspace-123');

      expect(mockProjectRepo.findByWorkspaceId).toHaveBeenCalledWith(mockDb, 'workspace-123');
      expect(result).toEqual(mockProjects);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when workspace has no projects', async () => {
      mockProjectRepo.findByWorkspaceId.mockResolvedValue([]);

      const result = await service.findByWorkspace(mockDb, 'workspace-456');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('updateCompletion', () => {
    it('should set completion to 0% when project has no tasks', async () => {
      const mockProject = createMockProject({ id: 'project-123' });
      mockProjectRepo.findById.mockResolvedValue(mockProject);
      mockTaskRepo.findByProjectId.mockResolvedValue([]);
      mockProjectRepo.update.mockResolvedValue({ ...mockProject, completionPercentage: 0 });

      await service.updateCompletion(mockDb, 'project-123');

      expect(mockTaskRepo.findByProjectId).toHaveBeenCalledWith(mockDb, 'project-123');
      expect(mockProjectRepo.update).toHaveBeenCalledWith(mockDb, 'project-123', {
        completionPercentage: 0,
      });
    });

    it('should calculate 30% completion when 3 of 10 tasks are completed', async () => {
      const mockProject = createMockProject({ id: 'project-123' });
      const mockTasks = [
        { id: 'task-1', status: TaskStatus.COMPLETED },
        { id: 'task-2', status: TaskStatus.COMPLETED },
        { id: 'task-3', status: TaskStatus.COMPLETED },
        { id: 'task-4', status: TaskStatus.IN_PROGRESS },
        { id: 'task-5', status: TaskStatus.TODO },
        { id: 'task-6', status: TaskStatus.TODO },
        { id: 'task-7', status: TaskStatus.TODO },
        { id: 'task-8', status: TaskStatus.TODO },
        { id: 'task-9', status: TaskStatus.TODO },
        { id: 'task-10', status: TaskStatus.TODO },
      ];

      mockProjectRepo.findById.mockResolvedValue(mockProject);
      mockTaskRepo.findByProjectId.mockResolvedValue(mockTasks);
      mockProjectRepo.update.mockResolvedValue({ ...mockProject, completionPercentage: 30 });

      await service.updateCompletion(mockDb, 'project-123');

      expect(mockProjectRepo.update).toHaveBeenCalledWith(mockDb, 'project-123', {
        completionPercentage: 30,
      });
    });

    it('should calculate 100% completion when all tasks are completed', async () => {
      const mockProject = createMockProject({ id: 'project-123' });
      const mockTasks = [
        { id: 'task-1', status: TaskStatus.COMPLETED },
        { id: 'task-2', status: TaskStatus.COMPLETED },
        { id: 'task-3', status: TaskStatus.COMPLETED },
      ];

      mockProjectRepo.findById.mockResolvedValue(mockProject);
      mockTaskRepo.findByProjectId.mockResolvedValue(mockTasks);
      mockProjectRepo.update.mockResolvedValue({ ...mockProject, completionPercentage: 100 });

      await service.updateCompletion(mockDb, 'project-123');

      expect(mockProjectRepo.update).toHaveBeenCalledWith(mockDb, 'project-123', {
        completionPercentage: 100,
      });
    });

    it('should round completion percentage to nearest integer', async () => {
      const mockProject = createMockProject({ id: 'project-123' });
      const mockTasks = [
        { id: 'task-1', status: TaskStatus.COMPLETED },
        { id: 'task-2', status: TaskStatus.TODO },
        { id: 'task-3', status: TaskStatus.TODO },
      ];

      mockProjectRepo.findById.mockResolvedValue(mockProject);
      mockTaskRepo.findByProjectId.mockResolvedValue(mockTasks);
      mockProjectRepo.update.mockResolvedValue({ ...mockProject, completionPercentage: 33 });

      await service.updateCompletion(mockDb, 'project-123');

      expect(mockProjectRepo.update).toHaveBeenCalledWith(mockDb, 'project-123', {
        completionPercentage: 33,
      });
    });

    it('should throw error when project does not exist', async () => {
      mockProjectRepo.findById.mockResolvedValue(null);

      await expect(service.updateCompletion(mockDb, 'nonexistent')).rejects.toThrow(
        'Project not found'
      );
      expect(mockTaskRepo.findByProjectId).not.toHaveBeenCalled();
    });
  });
});
