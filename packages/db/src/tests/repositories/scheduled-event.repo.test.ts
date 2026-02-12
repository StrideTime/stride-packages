/**
 * ScheduledEvent Repository Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { scheduledEventRepo } from '../../repositories/scheduled-event.repo';
import { userRepo } from '../../repositories/user.repo';
import { createTestDb } from '../setup';
import { createMockScheduledEvent, createMockUser } from '@stridetime/test-utils';
import type { User } from '@stridetime/types';

describe('ScheduledEventRepository', () => {
  let db: any;
  let testUser: User;

  beforeEach(async () => {
    db = createTestDb();

    // Create test user
    const { id, createdAt, updatedAt, deleted, ...userInput } = createMockUser();
    testUser = await userRepo.create(db, userInput);
  });

  describe('create', () => {
    it('creates a scheduled event with generated ID', async () => {
      const { id, createdAt, updatedAt, deleted, ...eventInput } = createMockScheduledEvent({
        userId: testUser.id,
        label: 'Team Meeting',
        type: 'MEETING',
      });

      const created = await scheduledEventRepo.create(db, eventInput);

      expect(created.id).toBeTruthy();
      expect(created.userId).toBe(testUser.id);
      expect(created.label).toBe('Team Meeting');
      expect(created.type).toBe('MEETING');
    });

    it('creates a focus session event', async () => {
      const { id, createdAt, updatedAt, deleted, ...eventInput } = createMockScheduledEvent({
        userId: testUser.id,
        label: 'Deep Work',
        type: 'FOCUS',
      });

      const created = await scheduledEventRepo.create(db, eventInput);

      expect(created.type).toBe('FOCUS');
      expect(created.label).toBe('Deep Work');
    });

    it('creates an external event with metadata', async () => {
      const { id, createdAt, updatedAt, deleted, ...eventInput } = createMockScheduledEvent({
        userId: testUser.id,
        label: 'External Meeting',
        type: 'MEETING',
        externalId: 'gcal_123456',
        externalSource: 'GOOGLE_CALENDAR',
        metadata: JSON.stringify({
          attendees: ['alice@example.com'],
          location: 'Conference Room A',
        }),
      });

      const created = await scheduledEventRepo.create(db, eventInput);

      expect(created.externalId).toBe('gcal_123456');
      expect(created.externalSource).toBe('GOOGLE_CALENDAR');
      expect(created.metadata).toBeTruthy();
    });
  });

  describe('findById', () => {
    it('returns event when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...eventInput } = createMockScheduledEvent({
        userId: testUser.id,
        label: 'Test Event',
      });

      const created = await scheduledEventRepo.create(db, eventInput);
      const found = await scheduledEventRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('returns null when not found', async () => {
      const found = await scheduledEventRepo.findById(db, 'nonexistent');
      expect(found).toBeNull();
    });

    it('returns null when event is soft deleted', async () => {
      const { id, createdAt, updatedAt, deleted, ...eventInput } = createMockScheduledEvent({
        userId: testUser.id,
        label: 'To Delete',
      });

      const created = await scheduledEventRepo.create(db, eventInput);
      await scheduledEventRepo.delete(db, created.id);

      const found = await scheduledEventRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('returns all events for a user', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...event1Input
      } = createMockScheduledEvent({
        userId: testUser.id,
        label: 'Event 1',
        type: 'MEETING',
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...event2Input
      } = createMockScheduledEvent({
        userId: testUser.id,
        label: 'Event 2',
        type: 'FOCUS',
      });

      await scheduledEventRepo.create(db, event1Input);
      await scheduledEventRepo.create(db, event2Input);

      const events = await scheduledEventRepo.findByUser(db, testUser.id);

      expect(events).toHaveLength(2);
      expect(events.map(e => e.label)).toContain('Event 1');
      expect(events.map(e => e.label)).toContain('Event 2');
    });

    it('returns empty array when no events found', async () => {
      const events = await scheduledEventRepo.findByUser(db, 'nonexistent');
      expect(events).toEqual([]);
    });
  });

  describe('findByUserInRange', () => {
    it('returns events within time range', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...event1Input
      } = createMockScheduledEvent({
        userId: testUser.id,
        startTime: '2026-02-12T10:00:00Z',
        label: 'In Range',
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...event2Input
      } = createMockScheduledEvent({
        userId: testUser.id,
        startTime: '2026-02-15T10:00:00Z',
        label: 'Out of Range',
      });

      await scheduledEventRepo.create(db, event1Input);
      await scheduledEventRepo.create(db, event2Input);

      const events = await scheduledEventRepo.findByUserInRange(
        db,
        testUser.id,
        '2026-02-12T00:00:00Z',
        '2026-02-13T00:00:00Z'
      );

      expect(events).toHaveLength(1);
      expect(events[0].label).toBe('In Range');
    });
  });

  describe('update', () => {
    it('updates event properties', async () => {
      const { id, createdAt, updatedAt, deleted, ...eventInput } = createMockScheduledEvent({
        userId: testUser.id,
        label: 'Original Label',
      });

      const created = await scheduledEventRepo.create(db, eventInput);
      const updated = await scheduledEventRepo.update(db, created.id, {
        label: 'Updated Label',
      });

      expect(updated.label).toBe('Updated Label');
    });
  });

  describe('delete', () => {
    it('soft deletes an event', async () => {
      const { id, createdAt, updatedAt, deleted, ...eventInput } = createMockScheduledEvent({
        userId: testUser.id,
        label: 'To Delete',
      });

      const created = await scheduledEventRepo.create(db, eventInput);
      await scheduledEventRepo.delete(db, created.id);

      const found = await scheduledEventRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });
});
