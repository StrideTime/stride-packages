export const FontSize = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
} as const;
export type FontSize = (typeof FontSize)[keyof typeof FontSize];
