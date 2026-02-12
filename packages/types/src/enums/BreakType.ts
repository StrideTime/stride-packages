export const BreakType = {
  COFFEE: 'COFFEE',
  WALK: 'WALK',
  LUNCH: 'LUNCH',
  STRETCH: 'STRETCH',
  CUSTOM: 'CUSTOM',
} as const;
export type BreakType = (typeof BreakType)[keyof typeof BreakType];
