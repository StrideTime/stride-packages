/**
 * Mock plan generator for testing
 */

import type { Plan } from '@stridetime/types';

/**
 * Create a mock plan with optional overrides
 */
export function createMockPlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: 'plan-123',
    displayName: 'Free Plan',
    description: 'Basic features for individuals',
    isActive: true,
    ...overrides,
  };
}

/**
 * Create multiple mock plans with sequential IDs
 */
export function createMockPlans(count: number, overrides: Partial<Plan> = {}): Plan[] {
  const names = ['Free', 'Pro', 'Team', 'Enterprise'];
  return Array.from({ length: count }, (_, i) =>
    createMockPlan({
      id: `plan-${i + 1}`,
      displayName: `${names[i % names.length]} Plan`,
      description: `Description for ${names[i % names.length]} plan`,
      ...overrides,
    })
  );
}

/**
 * Create a mock Pro plan
 */
export function createMockProPlan(overrides: Partial<Plan> = {}): Plan {
  return createMockPlan({
    displayName: 'Pro Plan',
    description: 'Advanced features for professionals',
    ...overrides,
  });
}

/**
 * Create a mock Team plan
 */
export function createMockTeamPlan(overrides: Partial<Plan> = {}): Plan {
  return createMockPlan({
    displayName: 'Team Plan',
    description: 'Collaboration features for teams',
    ...overrides,
  });
}
