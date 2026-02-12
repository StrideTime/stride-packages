export const spacing = {
  base: 8,
  scale: {
    0: 0,
    0.5: 4, // 0.5 * 8
    1: 8, // 1 * 8
    2: 16, // 2 * 8
    3: 24, // 3 * 8
    4: 32, // 4 * 8
    5: 40, // 5 * 8
    6: 48, // 6 * 8
    8: 64, // 8 * 8
    10: 80, // 10 * 8
    12: 96, // 12 * 8
    16: 128, // 16 * 8
  },
} as const;

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 6,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  colored: {
    primary: "0 10px 25px -5px rgba(14, 165, 233, 0.3)",
    secondary: "0 10px 25px -5px rgba(168, 85, 247, 0.3)",
  },
} as const;
