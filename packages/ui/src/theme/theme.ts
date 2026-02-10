import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";
import { typography } from "./typography";
import { borderRadius, shadows } from "./spacing";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.primary[500],
      light: colors.primary[300],
      dark: colors.primary[700],
      contrastText: "#ffffff",
    },
    secondary: {
      main: colors.secondary[500],
      light: colors.secondary[300],
      dark: colors.secondary[700],
      contrastText: "#ffffff",
    },
    success: {
      main: colors.success[500],
      light: colors.success[300],
      dark: colors.success[700],
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[300],
      dark: colors.warning[700],
    },
    error: {
      main: colors.error[500],
      light: colors.error[300],
      dark: colors.error[700],
    },
    info: {
      main: colors.info[500],
      light: colors.info[300],
      dark: colors.info[700],
    },
    grey: colors.neutral,
    background: {
      default: "#ffffff",
      paper: colors.neutral[50],
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
    },
  },
  typography: {
    fontFamily: typography.fontFamily.base,
    h1: {
      fontSize: typography.heading.h1.fontSize,
      fontWeight: typography.heading.h1.fontWeight,
      lineHeight: typography.heading.h1.lineHeight,
      letterSpacing: typography.heading.h1.letterSpacing,
    },
    h2: {
      fontSize: typography.heading.h2.fontSize,
      fontWeight: typography.heading.h2.fontWeight,
      lineHeight: typography.heading.h2.lineHeight,
      letterSpacing: typography.heading.h2.letterSpacing,
    },
    h3: {
      fontSize: typography.heading.h3.fontSize,
      fontWeight: typography.heading.h3.fontWeight,
      lineHeight: typography.heading.h3.lineHeight,
      letterSpacing: typography.heading.h3.letterSpacing,
    },
    h4: {
      fontSize: typography.heading.h4.fontSize,
      fontWeight: typography.heading.h4.fontWeight,
      lineHeight: typography.heading.h4.lineHeight,
    },
    h5: {
      fontSize: typography.heading.h5.fontSize,
      fontWeight: typography.heading.h5.fontWeight,
      lineHeight: typography.heading.h5.lineHeight,
    },
    h6: {
      fontSize: typography.heading.h6.fontSize,
      fontWeight: typography.heading.h6.fontWeight,
      lineHeight: typography.heading.h6.lineHeight,
    },
    body1: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.relaxed,
    },
    body2: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
    },
  },
  shape: {
    borderRadius: borderRadius.md,
  },
  shadows: [
    "none",
    shadows.sm,
    shadows.base,
    shadows.md,
    shadows.md,
    shadows.lg,
    shadows.lg,
    shadows.xl,
    shadows.xl,
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: typography.fontWeight.semibold,
          borderRadius: borderRadius.lg,
          padding: "12px 24px",
          fontSize: typography.fontSize.base,
          boxShadow: "none",
          "&:hover": {
            boxShadow: shadows.md,
            transform: "translateY(-1px)",
            transition: "all 0.2s ease-in-out",
          },
        },
        sizeLarge: {
          padding: "14px 32px",
          fontSize: typography.fontSize.lg,
        },
        sizeMedium: {
          padding: "10px 20px",
        },
        sizeSmall: {
          padding: "8px 16px",
          fontSize: typography.fontSize.sm,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.xl,
          boxShadow: shadows.base,
          border: `1px solid ${colors.neutral[200]}`,
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            boxShadow: shadows.lg,
            transform: "translateY(-4px)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderBottom: `1px solid ${colors.neutral[200]}`,
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.base,
          fontWeight: typography.fontWeight.medium,
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.primary[400],
      light: colors.primary[300],
      dark: colors.primary[600],
      contrastText: colors.neutral[900],
    },
    secondary: {
      main: colors.secondary[400],
      light: colors.secondary[300],
      dark: colors.secondary[600],
      contrastText: colors.neutral[900],
    },
    success: {
      main: colors.success[400],
      light: colors.success[300],
      dark: colors.success[600],
    },
    warning: {
      main: colors.warning[400],
      light: colors.warning[300],
      dark: colors.warning[600],
    },
    error: {
      main: colors.error[400],
      light: colors.error[300],
      dark: colors.error[600],
    },
    info: {
      main: colors.info[400],
      light: colors.info[300],
      dark: colors.info[600],
    },
    grey: colors.neutral,
    background: {
      default: colors.neutral[900],
      paper: colors.neutral[800],
    },
    text: {
      primary: colors.neutral[50],
      secondary: colors.neutral[400],
    },
  },
  typography: {
    fontFamily: typography.fontFamily.base,
    h1: {
      fontSize: typography.heading.h1.fontSize,
      fontWeight: typography.heading.h1.fontWeight,
      lineHeight: typography.heading.h1.lineHeight,
      letterSpacing: typography.heading.h1.letterSpacing,
    },
    h2: {
      fontSize: typography.heading.h2.fontSize,
      fontWeight: typography.heading.h2.fontWeight,
      lineHeight: typography.heading.h2.lineHeight,
      letterSpacing: typography.heading.h2.letterSpacing,
    },
    h3: {
      fontSize: typography.heading.h3.fontSize,
      fontWeight: typography.heading.h3.fontWeight,
      lineHeight: typography.heading.h3.lineHeight,
      letterSpacing: typography.heading.h3.letterSpacing,
    },
    h4: {
      fontSize: typography.heading.h4.fontSize,
      fontWeight: typography.heading.h4.fontWeight,
      lineHeight: typography.heading.h4.lineHeight,
    },
    h5: {
      fontSize: typography.heading.h5.fontSize,
      fontWeight: typography.heading.h5.fontWeight,
      lineHeight: typography.heading.h5.lineHeight,
    },
    h6: {
      fontSize: typography.heading.h6.fontSize,
      fontWeight: typography.heading.h6.fontWeight,
      lineHeight: typography.heading.h6.lineHeight,
    },
    body1: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.relaxed,
    },
    body2: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
    },
  },
  shape: {
    borderRadius: borderRadius.md,
  },
  shadows: [
    "none",
    "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
    "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)",
    "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)",
    "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)",
    "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)",
    "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)",
    "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
    "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: typography.fontWeight.semibold,
          borderRadius: borderRadius.lg,
          padding: "12px 24px",
          fontSize: typography.fontSize.base,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
            transform: "translateY(-1px)",
            transition: "all 0.2s ease-in-out",
          },
        },
        sizeLarge: {
          padding: "14px 32px",
          fontSize: typography.fontSize.lg,
        },
        sizeMedium: {
          padding: "10px 20px",
        },
        sizeSmall: {
          padding: "8px 16px",
          fontSize: typography.fontSize.sm,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.xl,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.4)",
          border: `1px solid ${colors.neutral[700]}`,
          transition: "all 0.3s ease-in-out",
          backgroundImage: "none",
          "&:hover": {
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
            transform: "translateY(-4px)",
            borderColor: colors.neutral[600],
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderBottom: `1px solid ${colors.neutral[800]}`,
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(24, 24, 27, 0.8)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.base,
          fontWeight: typography.fontWeight.medium,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});
