/**
 * Database mock helpers for testing
 */

import { vi } from 'vitest';

/**
 * Create a mock database instance
 * Compatible with StrideDatabase type from @stridetime/db
 */
export function createMockDatabase() {
  return {
    transaction: vi.fn((callback: any) => callback(createMockDatabase())),
    query: {} as any,
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as any;
}
