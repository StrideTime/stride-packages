import type { FeatureValueType } from '../enums/FeatureValueType';

export interface CreateFeatureInput {
  key: string;
  displayName: string;
  description?: string;
  valueType: FeatureValueType;
  category: string;
}
