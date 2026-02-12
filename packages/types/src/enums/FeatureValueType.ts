export const FeatureValueType = {
  BOOLEAN: 'BOOLEAN',
  LIMIT: 'LIMIT',
} as const;
export type FeatureValueType = (typeof FeatureValueType)[keyof typeof FeatureValueType];
