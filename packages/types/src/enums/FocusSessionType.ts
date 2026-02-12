export const FocusSessionType = {
  FOCUS: 'FOCUS',
  SHORT_BREAK: 'SHORT_BREAK',
  LONG_BREAK: 'LONG_BREAK',
} as const;
export type FocusSessionType = (typeof FocusSessionType)[keyof typeof FocusSessionType];
