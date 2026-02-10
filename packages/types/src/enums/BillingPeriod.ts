export const BillingPeriod = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  LIFETIME: 'LIFETIME',
} as const;
export type BillingPeriod = (typeof BillingPeriod)[keyof typeof BillingPeriod];
