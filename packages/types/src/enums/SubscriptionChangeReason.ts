export const SubscriptionChangeReason = {
  UPGRADE: 'UPGRADE',
  DOWNGRADE: 'DOWNGRADE',
  PRICE_CHANGE: 'PRICE_CHANGE',
} as const;
export type SubscriptionChangeReason = (typeof SubscriptionChangeReason)[keyof typeof SubscriptionChangeReason];
