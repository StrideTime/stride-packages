/**
 * UserPreferences Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { userPreferencesRepo } from '../../repositories/user-preferences.repo';
import { userRepo } from '../../repositories/user.repo';
import { createTestDb } from '../setup';
import { createMockUserPreferences, createMockUser } from '@stridetime/test-utils';
import type { User } from '@stridetime/types';

describe('UserPreferencesRepository', () => {
  let db: any;
  let testUser: User;

  beforeEach(async () => {
    db = createTestDb();

    // Create test user
    const { id, createdAt, updatedAt, deleted, ...userInput } = createMockUser();
    testUser = await userRepo.create(db, userInput);
  });

  describe('create', () => {
    it('creates user preferences', async () => {
      const prefs = createMockUserPreferences({
        userId: testUser.id,
      });

      const created = await userPreferencesRepo.create(db, prefs);

      expect(created.userId).toBe(testUser.id);
      expect(created.theme).toBe('LIGHT');
      expect(created.fontSize).toBe('MEDIUM');
      expect(created.density).toBe('COMFORTABLE');
    });
  });

  describe('findByUserId', () => {
    it('returns preferences when found', async () => {
      const prefs = createMockUserPreferences({
        userId: testUser.id,
      });

      const created = await userPreferencesRepo.create(db, prefs);
      const found = await userPreferencesRepo.findByUserId(db, created.userId);

      expect(found).toBeDefined();
      expect(found?.userId).toBe(created.userId);
    });

    it('returns null when not found', async () => {
      const found = await userPreferencesRepo.findByUserId(db, 'nonexistent');
      expect(found).toBeNull();
    });

    it('returns null when preferences are deleted', async () => {
      const prefs = createMockUserPreferences({
        userId: testUser.id,
      });

      const created = await userPreferencesRepo.create(db, prefs);
      await userPreferencesRepo.delete(db, created.userId);

      const found = await userPreferencesRepo.findByUserId(db, created.userId);
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('updates preferences properties', async () => {
      const prefs = createMockUserPreferences({
        userId: testUser.id,
        theme: 'LIGHT',
      });

      const created = await userPreferencesRepo.create(db, prefs);
      const updated = await userPreferencesRepo.update(db, created.userId, {
        theme: 'DARK',
        fontSize: 'LARGE',
      });

      expect(updated.theme).toBe('DARK');
      expect(updated.fontSize).toBe('LARGE');
    });
  });

  describe('update by userId (additional test)', () => {
    it('updates preferences by user ID', async () => {
      const prefs = createMockUserPreferences({
        userId: testUser.id,
      });

      await userPreferencesRepo.create(db, prefs);
      const updated = await userPreferencesRepo.update(db, testUser.id, {
        enableSoundEffects: false,
        enableHapticFeedback: true,
      });

      expect(updated.enableSoundEffects).toBe(false);
      expect(updated.enableHapticFeedback).toBe(true);
    });

    it('throws error when user has no preferences', async () => {
      await expect(
        userPreferencesRepo.update(db, 'nonexistent', { theme: 'DARK' })
      ).rejects.toThrow('User preferences not found');
    });
  });

  describe('delete', () => {
    it('deletes preferences', async () => {
      const prefs = createMockUserPreferences({
        userId: testUser.id,
      });

      const created = await userPreferencesRepo.create(db, prefs);
      await userPreferencesRepo.delete(db, created.userId);

      const found = await userPreferencesRepo.findByUserId(db, created.userId);
      expect(found).toBeNull();
    });
  });
});
