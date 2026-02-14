/**
 * Unit tests for AdminService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminService } from '../../services/admin.service';
import type {
  CreatePlanInput,
  UpdatePlanInput,
  CreateFeatureInput,
  UpdateFeatureInput,
} from '../../services/admin.service';
import {
  createMockDatabase,
  createMockPlan,
  createMockFeature,
  createMockPlanPrice,
  createMockSubscription,
  createMockUser,
  createMockPlanFeature,
  createMockAdminAuditEntry,
} from '@stridetime/test-utils';
import { ValidationError } from '@stridetime/types';

// Create hoisted mocks
const {
  mockFeatureRepo,
  mockPlanRepo,
  mockPlanPriceRepo,
  mockSubscriptionRepo,
  mockUserRepo,
  mockAdminAuditRepo,
} = vi.hoisted(() => ({
  mockFeatureRepo: {
    create: vi.fn(),
    findById: vi.fn(),
    findByKey: vi.fn(),
    findAll: vi.fn(),
    findActive: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    delete: vi.fn(),
  },
  mockPlanRepo: {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findActive: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    delete: vi.fn(),
    setPlanFeature: vi.fn(),
    getPlanFeatures: vi.fn(),
  },
  mockPlanPriceRepo: {
    create: vi.fn(),
    findById: vi.fn(),
    findByPlan: vi.fn(),
    findByPlanAndPeriod: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockSubscriptionRepo: {
    create: vi.fn(),
    findById: vi.fn(),
    findByUser: vi.fn(),
    findByStatus: vi.fn(),
    findByRole: vi.fn(),
    findExpiredTrials: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockUserRepo: {
    create: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockAdminAuditRepo: {
    create: vi.fn(),
    findById: vi.fn(),
    findByEntity: vi.fn(),
    findByAdmin: vi.fn(),
    findRecent: vi.fn(),
  },
}));

// Mock the module
vi.mock('@stridetime/db', () => ({
  featureRepo: mockFeatureRepo,
  FeatureRepository: vi.fn(),
  planRepo: mockPlanRepo,
  PlanRepository: vi.fn(),
  planPriceRepo: mockPlanPriceRepo,
  PlanPriceRepository: vi.fn(),
  subscriptionRepo: mockSubscriptionRepo,
  SubscriptionRepository: vi.fn(),
  userRepo: mockUserRepo,
  UserRepository: vi.fn(),
  adminAuditRepo: mockAdminAuditRepo,
  AdminAuditRepository: vi.fn(),
  initDatabase: vi.fn(),
  getDatabase: vi.fn(),
  closeDatabase: vi.fn(),
  isDatabaseInitialized: vi.fn(),
  getPowerSyncDatabase: vi.fn(),
  getConnector: vi.fn(),
  connectSync: vi.fn(),
  disconnectSync: vi.fn(),
  isSyncEnabled: vi.fn(),
  getSyncStatus: vi.fn(),
  onSyncStatusChange: vi.fn(),
  SupabaseConnector: vi.fn(),
  SupabaseAuthProvider: vi.fn(),
  WorkspaceRepository: vi.fn(),
  workspaceRepo: vi.fn(),
  TimeEntryRepository: vi.fn(),
  timeEntryRepo: vi.fn(),
  TaskRepository: vi.fn(),
  taskRepo: vi.fn(),
  ProjectRepository: vi.fn(),
  projectRepo: vi.fn(),
  BreakRepository: vi.fn(),
  breakRepo: vi.fn(),
  DailySummaryRepository: vi.fn(),
  dailySummaryRepo: vi.fn(),
  generateId: vi.fn(),
  now: vi.fn(),
  today: vi.fn(),
}));

describe('AdminService', () => {
  let service: AdminService;
  let mockDb: any;

  beforeEach(() => {
    service = new AdminService(
      mockFeatureRepo as any,
      mockPlanRepo as any,
      mockPlanPriceRepo as any,
      mockSubscriptionRepo as any,
      mockUserRepo as any,
      mockAdminAuditRepo as any
    );
    mockDb = createMockDatabase();
    vi.clearAllMocks();
  });

  // ==========================================================================
  // PLAN MANAGEMENT
  // ==========================================================================

  describe('createPlan', () => {
    it('should create a plan with valid input', async () => {
      const input: CreatePlanInput = {
        displayName: 'Pro Plan',
        description: 'Advanced features',
      };
      const mockPlan = createMockPlan({ id: 'plan-new', displayName: 'Pro Plan' });
      mockPlanRepo.create.mockResolvedValue(mockPlan);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      const result = await service.createPlan(mockDb, 'admin-1', input);

      expect(result.id).toBe('plan-new');
      expect(result.displayName).toBe('Pro Plan');
      expect(mockPlanRepo.create).toHaveBeenCalledWith(mockDb, {
        displayName: 'Pro Plan',
        description: 'Advanced features',
        isActive: true,
      });
      expect(mockAdminAuditRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          adminUserId: 'admin-1',
          action: 'create_plan',
          entityType: 'plan',
          entityId: 'plan-new',
        })
      );
    });

    it('should throw ValidationError when displayName is empty', async () => {
      await expect(
        service.createPlan(mockDb, 'admin-1', { displayName: '', description: null })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when displayName is only whitespace', async () => {
      await expect(
        service.createPlan(mockDb, 'admin-1', { displayName: '   ', description: null })
      ).rejects.toThrow(ValidationError);
    });

    it('should trim displayName and description', async () => {
      const mockPlan = createMockPlan({ id: 'plan-new' });
      mockPlanRepo.create.mockResolvedValue(mockPlan);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.createPlan(mockDb, 'admin-1', {
        displayName: '  Pro Plan  ',
        description: '  desc  ',
      });

      expect(mockPlanRepo.create).toHaveBeenCalledWith(mockDb, {
        displayName: 'Pro Plan',
        description: 'desc',
        isActive: true,
      });
    });

    it('should handle null description', async () => {
      const mockPlan = createMockPlan({ id: 'plan-new' });
      mockPlanRepo.create.mockResolvedValue(mockPlan);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.createPlan(mockDb, 'admin-1', {
        displayName: 'Plan',
        description: null,
      });

      expect(mockPlanRepo.create).toHaveBeenCalledWith(mockDb, {
        displayName: 'Plan',
        description: null,
        isActive: true,
      });
    });
  });

  describe('updatePlan', () => {
    it('should update plan fields', async () => {
      mockPlanRepo.update.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      const input: UpdatePlanInput = {
        displayName: 'Updated Plan',
        description: 'Updated desc',
      };

      await service.updatePlan(mockDb, 'admin-1', 'plan-1', input);

      expect(mockPlanRepo.update).toHaveBeenCalledWith(mockDb, 'plan-1', {
        displayName: 'Updated Plan',
        description: 'Updated desc',
      });
      expect(mockAdminAuditRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          adminUserId: 'admin-1',
          action: 'update_plan',
          entityType: 'plan',
          entityId: 'plan-1',
        })
      );
    });

    it('should handle partial updates', async () => {
      mockPlanRepo.update.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.updatePlan(mockDb, 'admin-1', 'plan-1', {
        displayName: 'New Name',
      });

      expect(mockPlanRepo.update).toHaveBeenCalledWith(mockDb, 'plan-1', {
        displayName: 'New Name',
      });
    });
  });

  describe('retirePlan', () => {
    it('should deactivate a plan', async () => {
      mockPlanRepo.deactivate.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.retirePlan(mockDb, 'admin-1', 'plan-1');

      expect(mockPlanRepo.deactivate).toHaveBeenCalledWith(mockDb, 'plan-1');
      expect(mockAdminAuditRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          action: 'retire_plan',
          entityType: 'plan',
          entityId: 'plan-1',
        })
      );
    });

    it('should log replacement plan ID in audit', async () => {
      mockPlanRepo.deactivate.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.retirePlan(mockDb, 'admin-1', 'plan-1', 'plan-2');

      expect(mockAdminAuditRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          details: JSON.stringify({ replacementPlanId: 'plan-2' }),
        })
      );
    });
  });

  describe('setPlanFeature', () => {
    it('should set a plan feature when feature exists', async () => {
      const feature = createMockFeature({ id: 'feat-1', key: 'cloud_sync' });
      mockFeatureRepo.findByKey.mockResolvedValue(feature);
      mockPlanRepo.setPlanFeature.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.setPlanFeature(mockDb, 'admin-1', 'plan-1', 'cloud_sync', true, 10);

      expect(mockFeatureRepo.findByKey).toHaveBeenCalledWith(mockDb, 'cloud_sync');
      expect(mockPlanRepo.setPlanFeature).toHaveBeenCalledWith(
        mockDb,
        'plan-1',
        'feat-1',
        true,
        10
      );
    });

    it('should throw ValidationError when feature not found', async () => {
      mockFeatureRepo.findByKey.mockResolvedValue(null);

      await expect(
        service.setPlanFeature(mockDb, 'admin-1', 'plan-1', 'nonexistent', true)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('setPlanPrice', () => {
    it('should update existing price', async () => {
      const existingPrice = createMockPlanPrice({ id: 'price-1' });
      mockPlanPriceRepo.findByPlanAndPeriod.mockResolvedValue(existingPrice);
      mockPlanPriceRepo.update.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.setPlanPrice(mockDb, 'admin-1', 'plan-1', 'MONTHLY', 1999, 'stripe_123');

      expect(mockPlanPriceRepo.update).toHaveBeenCalledWith(mockDb, 'price-1', {
        priceCents: 1999,
        stripePriceId: 'stripe_123',
      });
      expect(mockPlanPriceRepo.create).not.toHaveBeenCalled();
    });

    it('should create new price when none exists', async () => {
      mockPlanPriceRepo.findByPlanAndPeriod.mockResolvedValue(null);
      mockPlanPriceRepo.create.mockResolvedValue(createMockPlanPrice());
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.setPlanPrice(mockDb, 'admin-1', 'plan-1', 'YEARLY', 9999);

      expect(mockPlanPriceRepo.create).toHaveBeenCalledWith(mockDb, {
        roleId: 'plan-1',
        billingPeriod: 'YEARLY',
        priceCents: 9999,
        currency: 'USD',
        stripePriceId: null,
        isActive: true,
      });
      expect(mockPlanPriceRepo.update).not.toHaveBeenCalled();
    });

    it('should log audit entry for price changes', async () => {
      mockPlanPriceRepo.findByPlanAndPeriod.mockResolvedValue(null);
      mockPlanPriceRepo.create.mockResolvedValue(createMockPlanPrice());
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.setPlanPrice(mockDb, 'admin-1', 'plan-1', 'MONTHLY', 1999);

      expect(mockAdminAuditRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          action: 'set_plan_price',
          entityType: 'plan',
          entityId: 'plan-1',
        })
      );
    });
  });

  // ==========================================================================
  // FEATURE MANAGEMENT
  // ==========================================================================

  describe('createFeature', () => {
    it('should create a feature with valid input', async () => {
      const input: CreateFeatureInput = {
        key: 'cloud_sync',
        displayName: 'Cloud Sync',
        description: 'Sync across devices',
        valueType: 'BOOLEAN',
        category: 'sync',
      };
      const mockFeat = createMockFeature({ id: 'feat-new', key: 'cloud_sync' });
      mockFeatureRepo.create.mockResolvedValue(mockFeat);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      const result = await service.createFeature(mockDb, 'admin-1', input);

      expect(result.id).toBe('feat-new');
      expect(mockFeatureRepo.create).toHaveBeenCalledWith(mockDb, {
        key: 'cloud_sync',
        displayName: 'Cloud Sync',
        description: 'Sync across devices',
        valueType: 'BOOLEAN',
        category: 'sync',
        isActive: true,
      });
    });

    it('should throw ValidationError when key is empty', async () => {
      await expect(
        service.createFeature(mockDb, 'admin-1', {
          key: '',
          displayName: 'Test',
          description: null,
          valueType: 'BOOLEAN',
          category: 'test',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should trim all string fields', async () => {
      const mockFeat = createMockFeature({ id: 'feat-new' });
      mockFeatureRepo.create.mockResolvedValue(mockFeat);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.createFeature(mockDb, 'admin-1', {
        key: '  my_feature  ',
        displayName: '  My Feature  ',
        description: '  desc  ',
        valueType: 'LIMIT',
        category: '  limits  ',
      });

      expect(mockFeatureRepo.create).toHaveBeenCalledWith(mockDb, {
        key: 'my_feature',
        displayName: 'My Feature',
        description: 'desc',
        valueType: 'LIMIT',
        category: 'limits',
        isActive: true,
      });
    });
  });

  describe('updateFeature', () => {
    it('should update feature fields', async () => {
      mockFeatureRepo.update.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      const input: UpdateFeatureInput = {
        displayName: 'Updated Feature',
        description: 'Updated desc',
        category: 'new-cat',
      };

      await service.updateFeature(mockDb, 'admin-1', 'feat-1', input);

      expect(mockFeatureRepo.update).toHaveBeenCalledWith(mockDb, 'feat-1', {
        displayName: 'Updated Feature',
        description: 'Updated desc',
        category: 'new-cat',
      });
    });

    it('should handle partial updates', async () => {
      mockFeatureRepo.update.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.updateFeature(mockDb, 'admin-1', 'feat-1', {
        displayName: 'New Name',
      });

      expect(mockFeatureRepo.update).toHaveBeenCalledWith(mockDb, 'feat-1', {
        displayName: 'New Name',
      });
    });

    it('should log audit entry', async () => {
      mockFeatureRepo.update.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.updateFeature(mockDb, 'admin-1', 'feat-1', { displayName: 'X' });

      expect(mockAdminAuditRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          action: 'update_feature',
          entityType: 'feature',
          entityId: 'feat-1',
        })
      );
    });
  });

  describe('deactivateFeature', () => {
    it('should deactivate a feature', async () => {
      mockFeatureRepo.deactivate.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.deactivateFeature(mockDb, 'admin-1', 'feat-1');

      expect(mockFeatureRepo.deactivate).toHaveBeenCalledWith(mockDb, 'feat-1');
    });

    it('should log audit with null details', async () => {
      mockFeatureRepo.deactivate.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.deactivateFeature(mockDb, 'admin-1', 'feat-1');

      expect(mockAdminAuditRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          action: 'deactivate_feature',
          details: null,
        })
      );
    });
  });

  // ==========================================================================
  // USER/SUBSCRIPTION MANAGEMENT
  // ==========================================================================

  describe('listUsers', () => {
    it('should list users filtered by status', async () => {
      const sub = createMockSubscription({
        id: 'sub-1',
        userId: 'user-1',
        roleId: 'plan-1',
        status: 'ACTIVE',
      });
      const user = createMockUser({ id: 'user-1', email: 'test@test.com' });
      const plan = createMockPlan({ id: 'plan-1' });

      mockSubscriptionRepo.findByStatus.mockResolvedValue([sub]);
      mockUserRepo.findById.mockResolvedValue(user);
      mockPlanRepo.findById.mockResolvedValue(plan);

      const result = await service.listUsers(mockDb, { status: 'ACTIVE' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].user.id).toBe('user-1');
      expect(result.data[0].subscription?.id).toBe('sub-1');
      expect(result.data[0].plan?.id).toBe('plan-1');
      expect(result.total).toBe(1);
    });

    it('should filter users by search term', async () => {
      const sub1 = createMockSubscription({ userId: 'user-1', roleId: 'plan-1' });
      const sub2 = createMockSubscription({ userId: 'user-2', roleId: 'plan-1' });
      const user1 = createMockUser({ id: 'user-1', email: 'alice@test.com', firstName: 'Alice' });
      const user2 = createMockUser({ id: 'user-2', email: 'bob@test.com', firstName: 'Bob' });

      mockSubscriptionRepo.findByStatus.mockResolvedValue([sub1, sub2]);
      mockUserRepo.findById.mockImplementation((_db: any, id: string) => {
        if (id === 'user-1') return Promise.resolve(user1);
        if (id === 'user-2') return Promise.resolve(user2);
        return Promise.resolve(null);
      });
      mockPlanRepo.findById.mockResolvedValue(createMockPlan());

      const result = await service.listUsers(mockDb, {
        status: 'ACTIVE',
        search: 'alice',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].user.firstName).toBe('Alice');
    });

    it('should filter users by planId', async () => {
      const sub = createMockSubscription({ userId: 'user-1', roleId: 'plan-pro' });
      mockSubscriptionRepo.findByRole.mockResolvedValue([sub]);
      mockUserRepo.findById.mockResolvedValue(createMockUser({ id: 'user-1' }));
      mockPlanRepo.findById.mockResolvedValue(createMockPlan({ id: 'plan-pro' }));

      const result = await service.listUsers(mockDb, { planId: 'plan-pro' });

      expect(mockSubscriptionRepo.findByRole).toHaveBeenCalledWith(mockDb, 'plan-pro');
      expect(result.data).toHaveLength(1);
    });

    it('should paginate results', async () => {
      const subs = Array.from({ length: 5 }, (_, i) =>
        createMockSubscription({ userId: `user-${i}`, roleId: 'plan-1' })
      );
      mockSubscriptionRepo.findByStatus.mockResolvedValue(subs);
      mockUserRepo.findById.mockImplementation((_db: any, id: string) =>
        Promise.resolve(createMockUser({ id }))
      );
      mockPlanRepo.findById.mockResolvedValue(createMockPlan());

      const result = await service.listUsers(mockDb, {
        status: 'ACTIVE',
        page: 2,
        pageSize: 2,
      });

      expect(result.data).toHaveLength(2);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.total).toBe(5);
      expect(result.totalPages).toBe(3);
    });

    it('should return empty results when no filters match', async () => {
      mockSubscriptionRepo.findByStatus.mockResolvedValue([]);

      const result = await service.listUsers(mockDb, { status: 'CANCELED' });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should skip users that no longer exist', async () => {
      const sub = createMockSubscription({ userId: 'user-deleted', roleId: 'plan-1' });
      mockSubscriptionRepo.findByStatus.mockResolvedValue([sub]);
      mockUserRepo.findById.mockResolvedValue(null);

      const result = await service.listUsers(mockDb, { status: 'ACTIVE' });

      expect(result.data).toHaveLength(0);
    });
  });

  describe('getUserDetails', () => {
    it('should return user with subscription details', async () => {
      const user = createMockUser({ id: 'user-1' });
      const sub = createMockSubscription({ userId: 'user-1', roleId: 'plan-1' });
      const plan = createMockPlan({ id: 'plan-1' });
      const features = [createMockPlanFeature()];
      const auditEntries = [createMockAdminAuditEntry()];

      mockUserRepo.findById.mockResolvedValue(user);
      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockPlanRepo.findById.mockResolvedValue(plan);
      mockPlanRepo.getPlanFeatures.mockResolvedValue(features);
      mockAdminAuditRepo.findByEntity.mockResolvedValue(auditEntries);

      const result = await service.getUserDetails(mockDb, 'user-1');

      expect(result.user.id).toBe('user-1');
      expect(result.subscription).toBeDefined();
      expect(result.plan?.id).toBe('plan-1');
      expect(result.features).toHaveLength(1);
      expect(result.auditLog).toHaveLength(1);
    });

    it('should throw ValidationError when user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(service.getUserDetails(mockDb, 'nonexistent')).rejects.toThrow(ValidationError);
    });

    it('should handle user with no subscription', async () => {
      const user = createMockUser({ id: 'user-1' });
      mockUserRepo.findById.mockResolvedValue(user);
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);
      mockAdminAuditRepo.findByEntity.mockResolvedValue([]);

      const result = await service.getUserDetails(mockDb, 'user-1');

      expect(result.subscription).toBeNull();
      expect(result.plan).toBeNull();
      expect(result.features).toEqual([]);
    });
  });

  describe('changeUserPlan', () => {
    it('should change user plan with valid params', async () => {
      const sub = createMockSubscription({
        id: 'sub-1',
        userId: 'user-1',
        roleId: 'plan-old',
      });
      const newPlan = createMockPlan({ id: 'plan-new' });

      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockPlanRepo.findById.mockResolvedValue(newPlan);
      mockSubscriptionRepo.update.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.changeUserPlan(mockDb, 'admin-1', 'user-1', 'plan-new', 'Upgrade request');

      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith(mockDb, 'sub-1', {
        roleId: 'plan-new',
      });
    });

    it('should throw when user has no subscription', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);

      await expect(
        service.changeUserPlan(mockDb, 'admin-1', 'user-1', 'plan-new', 'reason')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw when new plan not found', async () => {
      const sub = createMockSubscription({ userId: 'user-1' });
      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockPlanRepo.findById.mockResolvedValue(null);

      await expect(
        service.changeUserPlan(mockDb, 'admin-1', 'user-1', 'nonexistent', 'reason')
      ).rejects.toThrow(ValidationError);
    });

    it('should log audit with old and new plan IDs', async () => {
      const sub = createMockSubscription({
        id: 'sub-1',
        userId: 'user-1',
        roleId: 'plan-old',
      });
      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockPlanRepo.findById.mockResolvedValue(createMockPlan({ id: 'plan-new' }));
      mockSubscriptionRepo.update.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.changeUserPlan(mockDb, 'admin-1', 'user-1', 'plan-new', 'Upgrade');

      expect(mockAdminAuditRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          action: 'change_user_plan',
          entityType: 'user',
          entityId: 'user-1',
        })
      );
      const details = JSON.parse(mockAdminAuditRepo.create.mock.calls[0][1].details);
      expect(details.oldPlanId).toBe('plan-old');
      expect(details.newPlanId).toBe('plan-new');
    });
  });

  describe('startUserTrial', () => {
    it('should start a trial for a user', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);
      mockSubscriptionRepo.create.mockResolvedValue(createMockSubscription({ status: 'TRIAL' }));
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.startUserTrial(mockDb, 'admin-1', 'user-1', 'plan-pro', 14);

      expect(mockSubscriptionRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          userId: 'user-1',
          roleId: 'plan-pro',
          status: 'TRIAL',
          priceCents: 0,
        })
      );
    });

    it('should set trialEndsAt to correct future date', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);
      mockSubscriptionRepo.create.mockResolvedValue(createMockSubscription({ status: 'TRIAL' }));
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.startUserTrial(mockDb, 'admin-1', 'user-1', 'plan-pro', 14);

      const createCall = mockSubscriptionRepo.create.mock.calls[0][1];
      const trialEnd = new Date(createCall.trialEndsAt);
      const now = new Date();
      const diffDays = (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeCloseTo(14, 0);
    });

    it('should throw when user already has subscription', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(
        createMockSubscription({ userId: 'user-1' })
      );

      await expect(
        service.startUserTrial(mockDb, 'admin-1', 'user-1', 'plan-pro', 14)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('cancelUserSubscription', () => {
    it('should cancel an existing subscription', async () => {
      const sub = createMockSubscription({ id: 'sub-1', userId: 'user-1' });
      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockSubscriptionRepo.update.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.cancelUserSubscription(mockDb, 'admin-1', 'user-1', 'User requested');

      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith(
        mockDb,
        'sub-1',
        expect.objectContaining({
          canceledAt: expect.any(String),
          status: 'CANCELED',
        })
      );
    });

    it('should throw when user has no subscription', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);

      await expect(
        service.cancelUserSubscription(mockDb, 'admin-1', 'user-1', 'reason')
      ).rejects.toThrow(ValidationError);
    });

    it('should log audit with reason', async () => {
      const sub = createMockSubscription({ id: 'sub-1', userId: 'user-1' });
      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockSubscriptionRepo.update.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.cancelUserSubscription(mockDb, 'admin-1', 'user-1', 'Violated TOS');

      const details = JSON.parse(mockAdminAuditRepo.create.mock.calls[0][1].details);
      expect(details.reason).toBe('Violated TOS');
    });
  });

  describe('grantGrandfatheredStatus', () => {
    it('should grant grandfathered status', async () => {
      const sub = createMockSubscription({ id: 'sub-1', userId: 'user-1' });
      mockSubscriptionRepo.findByUser.mockResolvedValue(sub);
      mockSubscriptionRepo.update.mockResolvedValue(undefined);
      mockAdminAuditRepo.create.mockResolvedValue(createMockAdminAuditEntry());

      await service.grantGrandfatheredStatus(mockDb, 'admin-1', 'user-1', 'Plan retired');

      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith(mockDb, 'sub-1', {
        isGrandfathered: true,
        grandfatheredReason: 'Plan retired',
      });
    });

    it('should throw when user has no subscription', async () => {
      mockSubscriptionRepo.findByUser.mockResolvedValue(null);

      await expect(
        service.grantGrandfatheredStatus(mockDb, 'admin-1', 'user-1', 'reason')
      ).rejects.toThrow(ValidationError);
    });
  });

  // ==========================================================================
  // DASHBOARD
  // ==========================================================================

  describe('getSubscriptionStats', () => {
    it('should return aggregate subscription statistics', async () => {
      mockSubscriptionRepo.findByStatus.mockImplementation((_db: any, status: string) => {
        if (status === 'ACTIVE') {
          return Promise.resolve([
            createMockSubscription({ status: 'ACTIVE', priceCents: 999, billingPeriod: 'MONTHLY' }),
            createMockSubscription({
              status: 'ACTIVE',
              priceCents: 1999,
              billingPeriod: 'MONTHLY',
            }),
          ]);
        }
        if (status === 'TRIAL') {
          return Promise.resolve([createMockSubscription({ status: 'TRIAL' })]);
        }
        return Promise.resolve([]);
      });

      const plan = createMockPlan({ id: 'plan-1' });
      mockPlanRepo.findAll.mockResolvedValue([plan]);
      mockSubscriptionRepo.findByRole.mockResolvedValue([
        createMockSubscription({ status: 'ACTIVE', priceCents: 999, billingPeriod: 'MONTHLY' }),
        createMockSubscription({ status: 'ACTIVE', priceCents: 1999, billingPeriod: 'MONTHLY' }),
      ]);

      const stats = await service.getSubscriptionStats(mockDb);

      expect(stats.activeSubscriptions).toBe(2);
      expect(stats.trialSubscriptions).toBe(1);
      expect(stats.mrr).toBe(2998); // 999 + 1999
      expect(stats.trialConversionRate).toBe(2); // 2 active / 1 trial
      expect(stats.perPlan).toHaveLength(1);
    });

    it('should handle no subscriptions', async () => {
      mockSubscriptionRepo.findByStatus.mockResolvedValue([]);
      mockPlanRepo.findAll.mockResolvedValue([]);

      const stats = await service.getSubscriptionStats(mockDb);

      expect(stats.activeSubscriptions).toBe(0);
      expect(stats.trialSubscriptions).toBe(0);
      expect(stats.mrr).toBe(0);
      expect(stats.trialConversionRate).toBe(0);
      expect(stats.totalUsers).toBe(0);
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent audit entries', async () => {
      const entries = [
        createMockAdminAuditEntry({ action: 'create_plan' }),
        createMockAdminAuditEntry({ action: 'update_plan' }),
      ];
      mockAdminAuditRepo.findRecent.mockResolvedValue(entries);

      const result = await service.getRecentActivity(mockDb);

      expect(result).toHaveLength(2);
      expect(mockAdminAuditRepo.findRecent).toHaveBeenCalledWith(mockDb, 50);
    });

    it('should respect custom limit', async () => {
      mockAdminAuditRepo.findRecent.mockResolvedValue([]);

      await service.getRecentActivity(mockDb, 10);

      expect(mockAdminAuditRepo.findRecent).toHaveBeenCalledWith(mockDb, 10);
    });
  });
});
