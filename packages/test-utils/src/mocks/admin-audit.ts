/**
 * Mock admin audit entry generator for testing
 */

import type { AdminAuditEntry } from '@stridetime/types';

/**
 * Create a mock admin audit entry with optional overrides
 */
export function createMockAdminAuditEntry(
  overrides: Partial<AdminAuditEntry> = {}
): AdminAuditEntry {
  return {
    id: 'audit-123',
    adminUserId: 'admin-user-123',
    action: 'UPDATE_PLAN',
    entityType: 'plan',
    entityId: 'plan-123',
    details: null,
    performedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create multiple mock admin audit entries with sequential IDs
 */
export function createMockAdminAuditEntries(
  count: number,
  overrides: Partial<AdminAuditEntry> = {}
): AdminAuditEntry[] {
  return Array.from({ length: count }, (_, i) =>
    createMockAdminAuditEntry({
      id: `audit-${i + 1}`,
      ...overrides,
    })
  );
}
