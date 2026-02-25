/**
 * Convert HSL to RGB — used for blending a semi-transparent color over the background.
 */
export function hslToRgb(h: number, sPct: number, lPct: number): [number, number, number] {
  const s = sPct / 100;
  const l = lPct / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

/**
 * Parse a CSS color value into [r, g, b] (0-255 each).
 * Handles hex (#rrggbb, #rgb) and space-separated HSL ("H S% L%").
 */
function parseCssColor(value: string): [number, number, number] | null {
  const v = value.trim();
  if (v.startsWith("#")) {
    if (v.length === 7) {
      return [
        parseInt(v.slice(1, 3), 16),
        parseInt(v.slice(3, 5), 16),
        parseInt(v.slice(5, 7), 16),
      ];
    }
    if (v.length === 4) {
      return [parseInt(v[1] + v[1], 16), parseInt(v[2] + v[2], 16), parseInt(v[3] + v[3], 16)];
    }
  }
  const parts = v.split(/\s+/).map((p) => parseFloat(p));
  if (parts.length >= 3 && !parts.some(isNaN)) {
    return hslToRgb(parts[0], parts[1], parts[2]);
  }
  return null;
}

/**
 * Blend a hex color at `alpha` opacity over the CSS --background variable.
 * Returns a solid rgb() string so there's no alpha transparency in the DOM.
 * Falls back to white if --background is unavailable (e.g. Storybook without global CSS).
 * Supports both hex (#rrggbb) and HSL ("H S% L%") CSS variable formats.
 */
export function solidTint(hexColor: string, alpha: number): string {
  let br = 255,
    bg = 255,
    bb = 255;
  try {
    const bgVal = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--background");
    const parsed = parseCssColor(bgVal);
    if (parsed) [br, bg, bb] = parsed;
  } catch (e) {
    console.error(e);
  }
  const cr = parseInt(hexColor.slice(1, 3), 16);
  const cg = parseInt(hexColor.slice(3, 5), 16);
  const cb = parseInt(hexColor.slice(5, 7), 16);
  const r = Math.round(br * (1 - alpha) + cr * alpha);
  const g = Math.round(bg * (1 - alpha) + cg * alpha);
  const b = Math.round(bb * (1 - alpha) + cb * alpha);
  return `rgb(${r}, ${g}, ${b})`;
}
