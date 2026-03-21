import type { BillingPeriod } from '../enums/BillingPeriod';

export type PlanPrice = {
  id: string;
  planId: string;
  billingPeriod: BillingPeriod;
  priceCents: number;
  currency: string;
  stripePriceId: string | null;
  isActive: boolean;
};
