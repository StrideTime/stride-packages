/**
 * Mock feature generator for testing
 */

import type { Feature, FeatureValueType } from '@stridetime/types';

/**
 * Create a mock feature with optional overrides
 */
export function createMockFeature(overrides: Partial<Feature> = {}): Feature {
  return {
    id: 'feature-123',
    key: 'cloud_sync',
    displayName: 'Cloud Sync',
    description: 'Sync data across devices',
    valueType: 'BOOLEAN' as FeatureValueType,
    category: 'sync',
    isActive: true,
    ...overrides,
  };
}

/**
 * Create multiple mock features with sequential IDs
 */
export function createMockFeatures(count: number, overrides: Partial<Feature> = {}): Feature[] {
  const categories = ['sync', 'collaboration', 'limits', 'security', 'developer'];
  const valueTypes: FeatureValueType[] = ['BOOLEAN', 'LIMIT'];

  return Array.from({ length: count }, (_, i) =>
    createMockFeature({
      id: `feature-${i + 1}`,
      key: `test_feature_${i + 1}`,
      displayName: `Test Feature ${i + 1}`,
      category: categories[i % categories.length],
      valueType: valueTypes[i % valueTypes.length],
      ...overrides,
    })
  );
}

/**
 * Create a mock LIMIT-type feature
 */
export function createMockLimitFeature(overrides: Partial<Feature> = {}): Feature {
  return createMockFeature({
    key: 'max_workspaces',
    displayName: 'Workspace Limit',
    description: 'Maximum number of workspaces',
    valueType: 'LIMIT' as FeatureValueType,
    category: 'limits',
    ...overrides,
  });
}
