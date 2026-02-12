/**
 * Database mock helpers for testing
 */

import { vi } from 'vitest';

/**
 * Create a mock database instance
 * Compatible with StrideDatabase type from @stridetime/db
 */
export function createMockDatabase() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: vi.fn((callback: any) => callback(createMockDatabase())),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: {} as any,
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}
