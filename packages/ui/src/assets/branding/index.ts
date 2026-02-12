/**
 * Stride Branding Assets
 *
 * This module exports paths to all SVG and PNG logo variants.
 * Use these for static assets (e.g., email templates, PDFs, external sharing).
 * For React components, import from '@stridetime/ui/logos' instead.
 */

// SVG Assets
export const svg = {
  profile: new URL("./svg/stride-logo-profile.svg", import.meta.url).href,
  square: new URL("./svg/stride-logo-square.svg", import.meta.url).href,
  horizontalLight: new URL("./svg/stride-logo-horizontal-light.svg", import.meta.url).href,
  horizontalDark: new URL("./svg/stride-logo-horizontal-dark.svg", import.meta.url).href,
  horizontalTransparent: new URL("./svg/stride-logo-horizontal-transparent.svg", import.meta.url)
    .href,
  stackedLight: new URL("./svg/stride-logo-stacked-light.svg", import.meta.url).href,
  stackedDark: new URL("./svg/stride-logo-stacked-dark.svg", import.meta.url).href,
  markTransparent: new URL("./svg/stride-logo-mark-transparent.svg", import.meta.url).href,
  markWhite: new URL("./svg/stride-logo-mark-white.svg", import.meta.url).href,
  textLight: new URL("./svg/stride-logo-text-only-light.svg", import.meta.url).href,
  textDark: new URL("./svg/stride-logo-text-only-dark.svg", import.meta.url).href,
  textPrimary: new URL("./svg/stride-logo-text-only-primary.svg", import.meta.url).href,
} as const;

// PNG Assets
export const png = {
  profile: {
    512: new URL("./png/stride-logo-profile-512.png", import.meta.url).href,
    256: new URL("./png/stride-logo-profile-256.png", import.meta.url).href,
    128: new URL("./png/stride-logo-profile-128.png", import.meta.url).href,
    64: new URL("./png/stride-logo-profile-64.png", import.meta.url).href,
    32: new URL("./png/stride-logo-profile-32.png", import.meta.url).href,
  },
  square: {
    512: new URL("./png/stride-logo-square-512.png", import.meta.url).href,
    256: new URL("./png/stride-logo-square-256.png", import.meta.url).href,
    128: new URL("./png/stride-logo-square-128.png", import.meta.url).href,
    64: new URL("./png/stride-logo-square-64.png", import.meta.url).href,
    32: new URL("./png/stride-logo-square-32.png", import.meta.url).href,
  },
  horizontalLight: {
    1000: new URL("./png/stride-logo-horizontal-light.png", import.meta.url).href,
    500: new URL("./png/stride-logo-horizontal-light-500w.png", import.meta.url).href,
    250: new URL("./png/stride-logo-horizontal-light-250w.png", import.meta.url).href,
  },
  horizontalDark: {
    1000: new URL("./png/stride-logo-horizontal-dark.png", import.meta.url).href,
    500: new URL("./png/stride-logo-horizontal-dark-500w.png", import.meta.url).href,
    250: new URL("./png/stride-logo-horizontal-dark-250w.png", import.meta.url).href,
  },
  horizontalTransparent: {
    1000: new URL("./png/stride-logo-horizontal-transparent.png", import.meta.url).href,
    500: new URL("./png/stride-logo-horizontal-transparent-500w.png", import.meta.url).href,
    250: new URL("./png/stride-logo-horizontal-transparent-250w.png", import.meta.url).href,
  },
  stackedLight: {
    600: new URL("./png/stride-logo-stacked-light.png", import.meta.url).href,
    300: new URL("./png/stride-logo-stacked-light-300.png", import.meta.url).href,
    150: new URL("./png/stride-logo-stacked-light-150.png", import.meta.url).href,
  },
  stackedDark: {
    600: new URL("./png/stride-logo-stacked-dark.png", import.meta.url).href,
    300: new URL("./png/stride-logo-stacked-dark-300.png", import.meta.url).href,
    150: new URL("./png/stride-logo-stacked-dark-150.png", import.meta.url).href,
  },
  markTransparent: {
    400: new URL("./png/stride-logo-mark-transparent.png", import.meta.url).href,
    200: new URL("./png/stride-logo-mark-transparent-200.png", import.meta.url).href,
    100: new URL("./png/stride-logo-mark-transparent-100.png", import.meta.url).href,
    48: new URL("./png/stride-logo-mark-transparent-48.png", import.meta.url).href,
  },
  markWhite: {
    400: new URL("./png/stride-logo-mark-white.png", import.meta.url).href,
    200: new URL("./png/stride-logo-mark-white-200.png", import.meta.url).href,
    100: new URL("./png/stride-logo-mark-white-100.png", import.meta.url).href,
    48: new URL("./png/stride-logo-mark-white-48.png", import.meta.url).href,
  },
  textLight: {
    800: new URL("./png/stride-logo-text-only-light.png", import.meta.url).href,
    400: new URL("./png/stride-logo-text-only-light-400w.png", import.meta.url).href,
  },
  textDark: {
    800: new URL("./png/stride-logo-text-only-dark.png", import.meta.url).href,
    400: new URL("./png/stride-logo-text-only-dark-400w.png", import.meta.url).href,
  },
  textPrimary: {
    800: new URL("./png/stride-logo-text-only-primary.png", import.meta.url).href,
    400: new URL("./png/stride-logo-text-only-primary-400w.png", import.meta.url).href,
  },
} as const;
