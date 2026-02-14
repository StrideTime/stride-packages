/**
 * Feature Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { featureRepo } from '../../repositories/feature.repo';
import { createTestDb } from '../setup';
import { createMockFeature, createMockLimitFeature } from '@stridetime/test-utils';
import type { Feature } from '@stridetime/types';

describe('FeatureRepository', () => {
  let db: any;

  beforeEach(async () => {
    db = createTestDb();
  });

  describe('create', () => {
    it('creates a feature with generated ID', async () => {
      const { id, ...featureInput } = createMockFeature({
        key: 'cloud_sync',
        displayName: 'Cloud Sync',
        category: 'sync',
      });

      const created = await featureRepo.create(db, featureInput);

      expect(created.id).toBeTruthy();
      expect(created.key).toBe('cloud_sync');
      expect(created.displayName).toBe('Cloud Sync');
      expect(created.isActive).toBe(true);
    });

    it('creates a LIMIT-type feature', async () => {
      const { id, ...featureInput } = createMockLimitFeature({
        key: 'max_workspaces',
      });

      const created = await featureRepo.create(db, featureInput);

      expect(created.valueType).toBe('LIMIT');
      expect(created.category).toBe('limits');
    });
  });

  describe('findByKey', () => {
    it('returns feature when found by key', async () => {
      const { id, ...featureInput } = createMockFeature({ key: 'api_access' });
      const created = await featureRepo.create(db, featureInput);

      const found = await featureRepo.findByKey(db, 'api_access');

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.key).toBe('api_access');
    });

    it('returns null when not found', async () => {
      const found = await featureRepo.findByKey(db, 'nonexistent_feature');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns only active features by default', async () => {
      // Create active features
      const { id: id1, ...feature1 } = createMockFeature({ key: 'feature_1', isActive: true });
      const { id: id2, ...feature2 } = createMockFeature({ key: 'feature_2', isActive: true });
      await featureRepo.create(db, feature1);
      await featureRepo.create(db, feature2);

      // Create inactive feature
      const { id: id3, ...feature3 } = createMockFeature({ key: 'feature_3', isActive: false });
      const created3 = await featureRepo.create(db, feature3);
      await featureRepo.deactivate(db, created3.id);

      const active = await featureRepo.findAll(db);

      expect(active.length).toBe(2);
      expect(active.every(f => f.isActive)).toBe(true);
    });

    it('returns all features when includeInactive is true', async () => {
      const { id: id1, ...feature1 } = createMockFeature({ key: 'feature_1', isActive: true });
      const { id: id2, ...feature2 } = createMockFeature({ key: 'feature_2', isActive: false });
      await featureRepo.create(db, feature1);
      const created2 = await featureRepo.create(db, { ...feature2, isActive: true });
      await featureRepo.deactivate(db, created2.id);

      const all = await featureRepo.findAll(db, true);

      expect(all.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('findByCategory', () => {
    it('returns all active features in a category', async () => {
      const { id: id1, ...sync1 } = createMockFeature({ key: 'cloud_sync', category: 'sync' });
      const { id: id2, ...sync2 } = createMockFeature({ key: 'offline_sync', category: 'sync' });
      const { id: id3, ...collab } = createMockFeature({
        key: 'team_collab',
        category: 'collaboration',
      });

      await featureRepo.create(db, sync1);
      await featureRepo.create(db, sync2);
      await featureRepo.create(db, collab);

      const syncFeatures = await featureRepo.findByCategory(db, 'sync');

      expect(syncFeatures.length).toBe(2);
      expect(syncFeatures.every(f => f.category === 'sync')).toBe(true);
    });

    it('excludes inactive features from category results', async () => {
      const { id: id1, ...feature1 } = createMockFeature({ key: 'feature_1', category: 'sync' });
      const created1 = await featureRepo.create(db, feature1);
      await featureRepo.deactivate(db, created1.id);

      const { id: id2, ...feature2 } = createMockFeature({ key: 'feature_2', category: 'sync' });
      await featureRepo.create(db, feature2);

      const syncFeatures = await featureRepo.findByCategory(db, 'sync');

      expect(syncFeatures.length).toBe(1);
      expect(syncFeatures[0].key).toBe('feature_2');
    });
  });

  describe('update', () => {
    it('updates feature fields', async () => {
      const { id, ...featureInput } = createMockFeature();
      const created = await featureRepo.create(db, featureInput);

      await featureRepo.update(db, created.id, {
        displayName: 'Updated Name',
        description: 'Updated description',
      });

      const updated = await featureRepo.findById(db, created.id);

      expect(updated?.displayName).toBe('Updated Name');
      expect(updated?.description).toBe('Updated description');
    });
  });

  describe('deactivate', () => {
    it('sets isActive to false', async () => {
      const { id, ...featureInput } = createMockFeature();
      const created = await featureRepo.create(db, featureInput);

      await featureRepo.deactivate(db, created.id);

      const deactivated = await featureRepo.findById(db, created.id);

      expect(deactivated?.isActive).toBe(false);
    });

    it('deactivated features are excluded from findAll by default', async () => {
      const { id, ...featureInput } = createMockFeature();
      const created = await featureRepo.create(db, featureInput);

      await featureRepo.deactivate(db, created.id);

      const active = await featureRepo.findAll(db);

      expect(active.find(f => f.id === created.id)).toBeUndefined();
    });
  });
});
