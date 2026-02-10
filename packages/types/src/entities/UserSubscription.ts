import type { SubscriptionStatus } from '../enums/SubscriptionStatus';
import type { BillingPeriod } from '../enums/BillingPeriod';

export type UserSubscription = {
  id: string;
  userId: string;
  roleId: string;

  status: SubscriptionStatus;

  priceCents: number;
  currency: string;
  billingPeriod: BillingPeriod;

  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;

  startedAt: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  trialEndsAt: string | null;

  isGrandfathered: boolean;
  grandfatheredReason: string | null;
};
