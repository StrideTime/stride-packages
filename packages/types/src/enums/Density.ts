export const Density = {
  COMPACT: 'COMPACT',
  COMFORTABLE: 'COMFORTABLE',
  SPACIOUS: 'SPACIOUS',
} as const;
export type Density = (typeof Density)[keyof typeof Density];
