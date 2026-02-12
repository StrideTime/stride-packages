import type { Project } from '../entities/Project';

export type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>;
