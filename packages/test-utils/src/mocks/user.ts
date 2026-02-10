/**
 * Mock user generator for testing
 */

import type { User } from '@stridetime/types';

/**
 * Create a mock user with optional overrides
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    avatarUrl: null,
    timezone: 'UTC',
    ...overrides,
  };
}

/**
 * Create multiple mock users with sequential IDs
 */
export function createMockUsers(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      id: `user-${i + 1}`,
      email: `test${i + 1}@example.com`,
      firstName: `Test${i + 1}`,
      ...overrides,
    })
  );
}
