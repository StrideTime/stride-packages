export type PlanFeature = {
  id: string;
  planId: string;
  featureId: string;
  enabled: boolean;
  limitValue: number | null;
};
