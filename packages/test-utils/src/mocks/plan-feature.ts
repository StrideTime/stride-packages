/**
 * Mock plan feature generator for testing
 */

import type { PlanFeature } from '@stridetime/types';

/**
 * Create a mock plan feature with optional overrides
 */
export function createMockPlanFeature(overrides: Partial<PlanFeature> = {}): PlanFeature {
  return {
    id: 'plan-feature-123',
    roleId: 'plan-123',
    featureId: 'feature-123',
    enabled: true,
    limitValue: null,
    ...overrides,
  };
}

/**
 * Create a mock boolean plan feature (enabled/disabled)
 */
export function createMockBooleanPlanFeature(overrides: Partial<PlanFeature> = {}): PlanFeature {
  return createMockPlanFeature({
    enabled: true,
    limitValue: null,
    ...overrides,
  });
}

/**
 * Create a mock limit-based plan feature (with a numeric limit)
 */
export function createMockLimitPlanFeature(
  limit: number,
  overrides: Partial<PlanFeature> = {}
): PlanFeature {
  return createMockPlanFeature({
    enabled: true,
    limitValue: limit,
    ...overrides,
  });
}
