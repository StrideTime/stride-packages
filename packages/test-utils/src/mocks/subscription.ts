/**
 * Mock subscription generator for testing
 */

import type { UserSubscription } from '@stridetime/types';

/**
 * Create a mock subscription with optional overrides
 */
export function createMockSubscription(
  overrides: Partial<UserSubscription> = {}
): UserSubscription {
  return {
    id: 'sub-123',
    userId: 'user-123',
    roleId: 'role-123',
    status: 'ACTIVE',
    priceCents: 999,
    currency: 'USD',
    billingPeriod: 'MONTHLY',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    startedAt: new Date().toISOString(),
    currentPeriodStart: null,
    currentPeriodEnd: null,
    canceledAt: null,
    trialEndsAt: null,
    isGrandfathered: false,
    grandfatheredReason: null,
    ...overrides,
  };
}

/**
 * Create a mock trial subscription
 */
export function createMockTrialSubscription(
  overrides: Partial<UserSubscription> = {}
): UserSubscription {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);
  return createMockSubscription({
    status: 'TRIAL',
    priceCents: 0,
    trialEndsAt: trialEnd.toISOString(),
    ...overrides,
  });
}
