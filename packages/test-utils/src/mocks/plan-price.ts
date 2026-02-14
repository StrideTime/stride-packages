/**
 * Mock plan price generator for testing
 */

import type { PlanPrice, BillingPeriod } from '@stridetime/types';

/**
 * Create a mock plan price with optional overrides
 */
export function createMockPlanPrice(overrides: Partial<PlanPrice> = {}): PlanPrice {
  return {
    id: 'price-123',
    roleId: 'plan-123',
    billingPeriod: 'MONTHLY' as BillingPeriod,
    priceCents: 999,
    currency: 'USD',
    stripePriceId: 'price_stripe123',
    isActive: true,
    ...overrides,
  };
}

/**
 * Create a mock monthly price
 */
export function createMockMonthlyPrice(overrides: Partial<PlanPrice> = {}): PlanPrice {
  return createMockPlanPrice({
    billingPeriod: 'MONTHLY' as BillingPeriod,
    priceCents: 999,
    ...overrides,
  });
}

/**
 * Create a mock yearly price
 */
export function createMockYearlyPrice(overrides: Partial<PlanPrice> = {}): PlanPrice {
  return createMockPlanPrice({
    billingPeriod: 'YEARLY' as BillingPeriod,
    priceCents: 9999,
    ...overrides,
  });
}

/**
 * Create a mock lifetime price
 */
export function createMockLifetimePrice(overrides: Partial<PlanPrice> = {}): PlanPrice {
  return createMockPlanPrice({
    billingPeriod: 'LIFETIME' as BillingPeriod,
    priceCents: 29999,
    ...overrides,
  });
}
