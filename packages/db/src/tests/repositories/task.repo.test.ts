/**
 * Task Repository Tests
 *
 * Tests CRUD operations, mapper correctness, and transaction support.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { taskRepo } from '../../repositories/task.repo';
import { createTestDb } from '../setup';
import { createMockTask } from '@stridetime/test-utils';

describe('TaskRepository', () => {
  let db: any;

  beforeEach(() => {
    db = createTestDb();
  });

  describe('create', () => {
    it('creates a task with generated ID', async () => {
      const { id, createdAt, updatedAt, deleted, ...taskInput } = createMockTask({
        userId: 'user_1',
        projectId: 'project_1',
        title: 'Test Task',
        description: 'Test Description',
        difficulty: 'MEDIUM',
      });

      const created = await taskRepo.create(db, taskInput);

      expect(created).toBeDefined();
      expect(created.id).toBeTruthy();
      expect(created.title).toBe('Test Task');
      expect(created.userId).toBe('user_1');
      expect(created.difficulty).toBe('MEDIUM');
    });

    it('creates task with all optional fields null', async () => {
      const { id, createdAt, updatedAt, deleted, ...taskInput } = createMockTask({
        userId: 'user_1',
        projectId: 'project_1',
        title: 'Minimal Task',
        description: null,
        difficulty: 'EASY',
        estimatedMinutes: null,
        maxMinutes: null,
      });

      const created = await taskRepo.create(db, taskInput);

      expect(created.description).toBeNull();
      expect(created.estimatedMinutes).toBeNull();
      expect(created.maxMinutes).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns task when found', async () => {
      const { id, createdAt, updatedAt, deleted, ...taskInput } = createMockTask({
        title: 'Find Me',
      });

      const created = await taskRepo.create(db, taskInput);
      const found = await taskRepo.findById(db, created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Find Me');
    });

    it('returns null when task not found', async () => {
      const found = await taskRepo.findById(db, 'nonexistent_id');
      expect(found).toBeNull();
    });

    it('returns null when task is deleted', async () => {
      const { id, createdAt, updatedAt, deleted, ...taskInput } = createMockTask({
        title: 'To Be Deleted',
      });

      const created = await taskRepo.create(db, taskInput);
      await taskRepo.delete(db, created.id);

      const found = await taskRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('returns all tasks for a user', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...task1Input
      } = createMockTask({
        userId: 'user_1',
        title: 'Task 1',
        difficulty: 'EASY',
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...task2Input
      } = createMockTask({
        userId: 'user_1',
        title: 'Task 2',
        difficulty: 'MEDIUM',
      });

      await taskRepo.create(db, task1Input);
      await taskRepo.create(db, task2Input);

      const tasks = await taskRepo.findByUserId(db, 'user_1');

      expect(tasks).toHaveLength(2);
      expect(tasks.map(t => t.title)).toContain('Task 1');
      expect(tasks.map(t => t.title)).toContain('Task 2');
    });

    it('excludes deleted tasks', async () => {
      const { id, createdAt, updatedAt, deleted, ...taskInput } = createMockTask({
        userId: 'user_1',
        title: 'Task to Delete',
      });

      const created = await taskRepo.create(db, taskInput);
      await taskRepo.delete(db, created.id);

      const tasks = await taskRepo.findByUserId(db, 'user_1');
      expect(tasks).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('updates task fields', async () => {
      const { id, createdAt, updatedAt, deleted, ...taskInput } = createMockTask({
        title: 'Original Title',
      });

      const created = await taskRepo.create(db, taskInput);
      const updated = await taskRepo.update(db, created.id, {
        title: 'Updated Title',
        progress: 50,
        status: 'IN_PROGRESS',
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.progress).toBe(50);
      expect(updated.status).toBe('IN_PROGRESS');
      expect(updated.userId).toBe(taskInput.userId); // Unchanged
    });
  });

  describe('delete', () => {
    it('soft deletes a task', async () => {
      const { id, createdAt, updatedAt, deleted, ...taskInput } = createMockTask({
        title: 'To Delete',
      });

      const created = await taskRepo.create(db, taskInput);
      await taskRepo.delete(db, created.id);

      const found = await taskRepo.findById(db, created.id);
      expect(found).toBeNull();
    });
  });

  describe('count', () => {
    it('counts tasks for a user', async () => {
      const {
        id: id1,
        createdAt: c1,
        updatedAt: u1,
        deleted: d1,
        ...task1Input
      } = createMockTask({
        userId: 'user_1',
        title: 'Task 1',
      });

      const {
        id: id2,
        createdAt: c2,
        updatedAt: u2,
        deleted: d2,
        ...task2Input
      } = createMockTask({
        userId: 'user_1',
        title: 'Task 2',
      });

      await taskRepo.create(db, task1Input);
      await taskRepo.create(db, task2Input);

      const count = await taskRepo.count(db, 'user_1');
      expect(count).toBe(2);
    });
  });

  describe('mapper integrity', () => {
    it('preserves domain fields through create/read cycle', async () => {
      const { id, createdAt, updatedAt, deleted, ...taskInput } = createMockTask({
        userId: 'user_1',
        projectId: 'project_1',
        parentTaskId: 'parent_1',
        title: 'Mapper Test',
        description: 'Testing mapper',
        difficulty: 'HARD',
        progress: 75,
        status: 'IN_PROGRESS',
        estimatedMinutes: 120,
        maxMinutes: 180,
        actualMinutes: 90,
        plannedForDate: '2024-01-15',
        dueDate: '2024-01-20',
        taskTypeId: 'type_1',
        completedAt: null,
      });

      const created = await taskRepo.create(db, taskInput);

      // All domain fields should match
      expect(created.userId).toBe(taskInput.userId);
      expect(created.projectId).toBe(taskInput.projectId);
      expect(created.parentTaskId).toBe(taskInput.parentTaskId);
      expect(created.title).toBe(taskInput.title);
      expect(created.description).toBe(taskInput.description);
      expect(created.difficulty).toBe(taskInput.difficulty);
      expect(created.progress).toBe(taskInput.progress);
      expect(created.status).toBe(taskInput.status);
      expect(created.estimatedMinutes).toBe(taskInput.estimatedMinutes);
      expect(created.maxMinutes).toBe(taskInput.maxMinutes);
      expect(created.actualMinutes).toBe(taskInput.actualMinutes);
      expect(created.plannedForDate).toBe(taskInput.plannedForDate);
      expect(created.dueDate).toBe(taskInput.dueDate);
      expect(created.taskTypeId).toBe(taskInput.taskTypeId);
      expect(created.completedAt).toBe(taskInput.completedAt);
    });

    it('includes timestamp and soft delete fields', async () => {
      const { id, createdAt, updatedAt, deleted, ...taskInput } = createMockTask();

      const created = await taskRepo.create(db, taskInput);

      // These DB fields should be in the domain type
      expect(created.createdAt).toBeTruthy();
      expect(created.updatedAt).toBeTruthy();
      expect(created.deleted).toBe(false);
    });
  });
});
