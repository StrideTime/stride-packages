/**
 * Unit tests for WorkspaceService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkspaceService } from '../../services/workspace.service';
import type {
  CreateWorkspaceParams,
  UpdateWorkspaceParams,
} from '../../services/workspace.service';
import { ValidationError, WorkspaceType } from '@stridetime/types';
import { createMockWorkspace } from '@stridetime/test-utils';

// Hoist mocks
const { mockWorkspaceRepo } = vi.hoisted(() => ({
  mockWorkspaceRepo: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findByOwner: vi.fn(),
  },
}));

vi.mock('@stridetime/db', () => ({
  workspaceRepo: mockWorkspaceRepo,
  WorkspaceRepository: vi.fn(),
}));

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let mockDb: any;

  beforeEach(() => {
    service = new WorkspaceService(mockWorkspaceRepo);
    mockDb = {};
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a workspace with valid parameters', async () => {
      const params: CreateWorkspaceParams = {
        name: 'My Workspace',
        ownerUserId: 'user-123',
        type: WorkspaceType.PERSONAL,
        description: 'A test workspace',
        icon: '🏢',
        color: '#3B82F6',
        timezone: 'America/New_York',
        weekStartsOn: 1,
      };

      const mockWorkspace = createMockWorkspace({
        id: 'workspace-123',
        name: 'My Workspace',
        ownerUserId: 'user-123',
        type: WorkspaceType.PERSONAL,
        description: 'A test workspace',
        icon: '🏢',
        color: '#3B82F6',
        timezone: 'America/New_York',
        weekStartsOn: 1,
      });

      mockWorkspaceRepo.create.mockResolvedValue(mockWorkspace);

      const result = await service.create(mockDb, params);

      expect(mockWorkspaceRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          name: 'My Workspace',
          ownerUserId: 'user-123',
          type: WorkspaceType.PERSONAL,
          description: 'A test workspace',
          icon: '🏢',
          color: '#3B82F6',
          timezone: 'America/New_York',
          weekStartsOn: 1,
          defaultProjectId: null,
          defaultTeamId: null,
        })
      );
      expect(result).toEqual(mockWorkspace);
    });

    it('should throw error when name is empty', async () => {
      const params: CreateWorkspaceParams = {
        name: '',
        ownerUserId: 'user-123',
        type: WorkspaceType.PERSONAL,
      };

      await expect(service.create(mockDb, params)).rejects.toThrow(ValidationError);
      await expect(service.create(mockDb, params)).rejects.toThrow('Workspace name is required');
    });

    it('should throw error when name is only whitespace', async () => {
      const params: CreateWorkspaceParams = {
        name: '   ',
        ownerUserId: 'user-123',
        type: WorkspaceType.PERSONAL,
      };

      await expect(service.create(mockDb, params)).rejects.toThrow('Workspace name is required');
    });

    it('should throw error when name exceeds 100 characters', async () => {
      const params: CreateWorkspaceParams = {
        name: 'a'.repeat(101),
        ownerUserId: 'user-123',
        type: WorkspaceType.PERSONAL,
      };

      await expect(service.create(mockDb, params)).rejects.toThrow(
        'Workspace name must be under 100 characters'
      );
    });

    it('should throw error when ownerUserId is missing', async () => {
      const params: CreateWorkspaceParams = {
        name: 'Valid Name',
        ownerUserId: '',
        type: WorkspaceType.PERSONAL,
      };

      await expect(service.create(mockDb, params)).rejects.toThrow('Workspace must have an owner');
    });

    it('should throw error when type is missing', async () => {
      const params = {
        name: 'Valid Name',
        ownerUserId: 'user-123',
        type: '',
      } as CreateWorkspaceParams;

      await expect(service.create(mockDb, params)).rejects.toThrow('Workspace type is required');
    });

    it('should throw error when description exceeds 500 characters', async () => {
      const params: CreateWorkspaceParams = {
        name: 'Valid Name',
        ownerUserId: 'user-123',
        type: WorkspaceType.PERSONAL,
        description: 'a'.repeat(501),
      };

      await expect(service.create(mockDb, params)).rejects.toThrow(
        'Description must be under 500 characters'
      );
    });

    it('should throw error when weekStartsOn is less than 0', async () => {
      const params: CreateWorkspaceParams = {
        name: 'Valid Name',
        ownerUserId: 'user-123',
        type: WorkspaceType.PERSONAL,
        weekStartsOn: -1,
      };

      await expect(service.create(mockDb, params)).rejects.toThrow(
        'Week start day must be between 0 (Sunday) and 6 (Saturday)'
      );
    });

    it('should throw error when weekStartsOn is greater than 6', async () => {
      const params: CreateWorkspaceParams = {
        name: 'Valid Name',
        ownerUserId: 'user-123',
        type: WorkspaceType.PERSONAL,
        weekStartsOn: 7,
      };

      await expect(service.create(mockDb, params)).rejects.toThrow(
        'Week start day must be between 0 (Sunday) and 6 (Saturday)'
      );
    });

    it('should trim name when creating', async () => {
      const params: CreateWorkspaceParams = {
        name: '  My Workspace  ',
        ownerUserId: 'user-123',
        type: WorkspaceType.PERSONAL,
      };

      mockWorkspaceRepo.create.mockResolvedValue(createMockWorkspace());

      await service.create(mockDb, params);

      expect(mockWorkspaceRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          name: 'My Workspace',
        })
      );
    });

    it('should trim description when creating', async () => {
      const params: CreateWorkspaceParams = {
        name: 'My Workspace',
        ownerUserId: 'user-123',
        type: WorkspaceType.PERSONAL,
        description: '  A description  ',
      };

      mockWorkspaceRepo.create.mockResolvedValue(createMockWorkspace());

      await service.create(mockDb, params);

      expect(mockWorkspaceRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          description: 'A description',
        })
      );
    });

    it('should set default values for optional fields', async () => {
      const params: CreateWorkspaceParams = {
        name: 'Minimal Workspace',
        ownerUserId: 'user-123',
        type: WorkspaceType.PERSONAL,
      };

      mockWorkspaceRepo.create.mockResolvedValue(createMockWorkspace());

      await service.create(mockDb, params);

      expect(mockWorkspaceRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          timezone: 'UTC',
          weekStartsOn: 0,
          defaultProjectId: null,
          defaultTeamId: null,
        })
      );
    });
  });

  describe('update', () => {
    it('should update a workspace with valid parameters', async () => {
      const existingWorkspace = createMockWorkspace({ id: 'workspace-123' });
      const updatedWorkspace = createMockWorkspace({
        id: 'workspace-123',
        name: 'Updated Workspace',
      });

      mockWorkspaceRepo.findById.mockResolvedValue(existingWorkspace);
      mockWorkspaceRepo.update.mockResolvedValue(updatedWorkspace);

      const params: UpdateWorkspaceParams = {
        name: 'Updated Workspace',
        description: 'New description',
        timezone: 'America/Los_Angeles',
      };

      const result = await service.update(mockDb, 'workspace-123', params);

      expect(mockWorkspaceRepo.findById).toHaveBeenCalledWith(mockDb, 'workspace-123');
      expect(mockWorkspaceRepo.update).toHaveBeenCalledWith(
        mockDb,
        'workspace-123',
        expect.objectContaining({
          name: 'Updated Workspace',
          description: 'New description',
          timezone: 'America/Los_Angeles',
        })
      );
      expect(result).toEqual(updatedWorkspace);
    });

    it('should throw error when workspace does not exist', async () => {
      mockWorkspaceRepo.findById.mockResolvedValue(null);

      const params: UpdateWorkspaceParams = {
        name: 'Updated Name',
      };

      await expect(service.update(mockDb, 'nonexistent', params)).rejects.toThrow(
        'Workspace not found'
      );
    });

    it('should throw error when updated name is empty', async () => {
      const existingWorkspace = createMockWorkspace({ id: 'workspace-123' });
      mockWorkspaceRepo.findById.mockResolvedValue(existingWorkspace);

      const params: UpdateWorkspaceParams = {
        name: '   ',
      };

      await expect(service.update(mockDb, 'workspace-123', params)).rejects.toThrow(
        'Workspace name cannot be empty'
      );
    });

    it('should throw error when updated name exceeds 100 characters', async () => {
      const existingWorkspace = createMockWorkspace({ id: 'workspace-123' });
      mockWorkspaceRepo.findById.mockResolvedValue(existingWorkspace);

      const params: UpdateWorkspaceParams = {
        name: 'a'.repeat(101),
      };

      await expect(service.update(mockDb, 'workspace-123', params)).rejects.toThrow(
        'Workspace name must be under 100 characters'
      );
    });

    it('should throw error when updated description exceeds 500 characters', async () => {
      const existingWorkspace = createMockWorkspace({ id: 'workspace-123' });
      mockWorkspaceRepo.findById.mockResolvedValue(existingWorkspace);

      const params: UpdateWorkspaceParams = {
        description: 'a'.repeat(501),
      };

      await expect(service.update(mockDb, 'workspace-123', params)).rejects.toThrow(
        'Description must be under 500 characters'
      );
    });

    it('should throw error when weekStartsOn is invalid', async () => {
      const existingWorkspace = createMockWorkspace({ id: 'workspace-123' });
      mockWorkspaceRepo.findById.mockResolvedValue(existingWorkspace);

      const params: UpdateWorkspaceParams = {
        weekStartsOn: 7,
      };

      await expect(service.update(mockDb, 'workspace-123', params)).rejects.toThrow(
        'Week start day must be between 0 (Sunday) and 6 (Saturday)'
      );
    });

    it('should trim name when updating', async () => {
      const existingWorkspace = createMockWorkspace({ id: 'workspace-123' });
      const updatedWorkspace = createMockWorkspace({
        id: 'workspace-123',
        name: 'Trimmed Name',
      });

      mockWorkspaceRepo.findById.mockResolvedValue(existingWorkspace);
      mockWorkspaceRepo.update.mockResolvedValue(updatedWorkspace);

      const params: UpdateWorkspaceParams = {
        name: '  Trimmed Name  ',
      };

      await service.update(mockDb, 'workspace-123', params);

      expect(mockWorkspaceRepo.update).toHaveBeenCalledWith(
        mockDb,
        'workspace-123',
        expect.objectContaining({
          name: 'Trimmed Name',
        })
      );
    });

    it('should only update provided fields', async () => {
      const existingWorkspace = createMockWorkspace({ id: 'workspace-123' });
      const updatedWorkspace = createMockWorkspace({
        id: 'workspace-123',
        color: '#FF0000',
      });

      mockWorkspaceRepo.findById.mockResolvedValue(existingWorkspace);
      mockWorkspaceRepo.update.mockResolvedValue(updatedWorkspace);

      const params: UpdateWorkspaceParams = {
        color: '#FF0000',
      };

      await service.update(mockDb, 'workspace-123', params);

      expect(mockWorkspaceRepo.update).toHaveBeenCalledWith(mockDb, 'workspace-123', {
        color: '#FF0000',
      });
    });
  });

  describe('delete', () => {
    it('should delete a workspace', async () => {
      const mockWorkspace = createMockWorkspace({ id: 'workspace-123' });
      mockWorkspaceRepo.findById.mockResolvedValue(mockWorkspace);
      mockWorkspaceRepo.delete.mockResolvedValue(undefined);

      await service.delete(mockDb, 'workspace-123');

      expect(mockWorkspaceRepo.findById).toHaveBeenCalledWith(mockDb, 'workspace-123');
      expect(mockWorkspaceRepo.delete).toHaveBeenCalledWith(mockDb, 'workspace-123');
    });

    it('should throw error when workspace does not exist', async () => {
      mockWorkspaceRepo.findById.mockResolvedValue(null);

      await expect(service.delete(mockDb, 'nonexistent')).rejects.toThrow('Workspace not found');
      expect(mockWorkspaceRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return workspace when found', async () => {
      const mockWorkspace = createMockWorkspace({ id: 'workspace-123' });
      mockWorkspaceRepo.findById.mockResolvedValue(mockWorkspace);

      const result = await service.findById(mockDb, 'workspace-123');

      expect(mockWorkspaceRepo.findById).toHaveBeenCalledWith(mockDb, 'workspace-123');
      expect(result).toEqual(mockWorkspace);
    });

    it('should return null when workspace not found', async () => {
      mockWorkspaceRepo.findById.mockResolvedValue(null);

      const result = await service.findById(mockDb, 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByOwner', () => {
    it('should return workspaces for a given owner', async () => {
      const mockWorkspaces = [
        createMockWorkspace({ id: 'workspace-1', ownerUserId: 'user-123' }),
        createMockWorkspace({ id: 'workspace-2', ownerUserId: 'user-123' }),
      ];

      mockWorkspaceRepo.findByOwner.mockResolvedValue(mockWorkspaces);

      const result = await service.findByOwner(mockDb, 'user-123');

      expect(mockWorkspaceRepo.findByOwner).toHaveBeenCalledWith(mockDb, 'user-123');
      expect(result).toEqual(mockWorkspaces);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when owner has no workspaces', async () => {
      mockWorkspaceRepo.findByOwner.mockResolvedValue([]);

      const result = await service.findByOwner(mockDb, 'user-456');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
