import type { FeatureValueType } from '../enums/FeatureValueType';

export type Feature = {
  id: string;
  key: string;
  displayName: string;
  description: string | null;
  valueType: FeatureValueType;
  category: string;
  isActive: boolean;
};
