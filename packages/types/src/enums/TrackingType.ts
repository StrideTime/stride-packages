export const TrackingType = {
  COMPLETED: 'COMPLETED',
  COUNTER: 'COUNTER',
} as const;
export type TrackingType = (typeof TrackingType)[keyof typeof TrackingType];
