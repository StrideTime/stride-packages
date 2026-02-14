import { useEffect, useRef, useState } from "react";
import "./SplashScreen.css";

const MIN_DISPLAY_MS = 4200;

export interface SplashScreenProps {
  /** While true the splash stays visible; once false the fade-out countdown begins. */
  loading: boolean;
  /** Fired after the fade-out transition finishes. */
  onComplete: () => void;
}

/**
 * Splash screen with animated logo.
 *
 * Three vertical lines rise up, snap into chevrons via a domino cascade,
 * slide right, then settle into the final logo positions. The "Stride" text
 * and tagline fade in alongside.
 *
 * Path morphing is driven by JavaScript (requestAnimationFrame) because:
 *   - CSS `d: path(...)` is NOT supported in Safari/WebKit (Tauri on macOS)
 *   - SMIL `<animate>` may not work reliably in all WebView contexts
 *
 * CSS handles: opacity, translateY (rise), group sweep, text fade-in.
 */

/** Interpolate between two path strings that share the same command structure. */
function interpolatePath(from: string, to: string, t: number): string {
  const numsFrom = from.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const numsTo = to.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const result = numsFrom.map((v, i) => {
    const interp = v + (numsTo[i] - v) * t;
    return Math.round(interp * 10) / 10;
  });
  // Rebuild "M {x} {y} L {x} {y} L {x} {y}" structure
  return `M ${result[0]} ${result[1]} L ${result[2]} ${result[3]} L ${result[4]} ${result[5]}`;
}

/** Clamp 0-1. */
function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/*
 * Each path animation is defined as a series of segments.
 * Each segment: [startFraction, endFraction, fromPath, toPath]
 * Fractions are relative to the path's total duration.
 *
 * Between segments the path holds at the last toPath value.
 */
type Segment = [number, number, string, string];

interface PathAnim {
  opacity: number;
  dur: number; // seconds
  delay: number; // seconds
  segments: Segment[];
  finalPath: string;
}

const STRAIGHT_0 = "M 30 109 L 30 200 L 30 291";
const STRAIGHT_1 = "M 165 109 L 165 200 L 165 291";
const STRAIGHT_2 = "M 340 109 L 340 200 L 340 291";

const PATH_ANIMS: PathAnim[] = [
  {
    // Path 0 (leftmost): 2.6s, delay 0s
    opacity: 0.35,
    dur: 2.6,
    delay: 0,
    finalPath: "M 94 109 L 172 200 L 94 291",
    segments: [
      // Hold straight line 0% → 35%
      [0, 0.35, STRAIGHT_0, STRAIGHT_0],
      // Snap to chevron 35% → 44%
      [0.35, 0.44, STRAIGHT_0, "M 74 109 L 152 200 L 74 291"],
      // Slide right 44% → 90%
      [0.44, 0.52, "M 74 109 L 152 200 L 74 291", "M 100 109 L 178 200 L 100 291"],
      [0.52, 0.6, "M 100 109 L 178 200 L 100 291", "M 125 109 L 203 200 L 125 291"],
      [0.6, 0.68, "M 125 109 L 203 200 L 125 291", "M 148 109 L 226 200 L 148 291"],
      [0.68, 0.76, "M 148 109 L 226 200 L 148 291", "M 168 109 L 246 200 L 168 291"],
      [0.76, 0.84, "M 168 109 L 246 200 L 168 291", "M 183 109 L 261 200 L 183 291"],
      [0.84, 0.9, "M 183 109 L 261 200 L 183 291", "M 190 109 L 268 200 L 190 291"],
      // Settle back 90% → 100%
      [0.9, 1.0, "M 190 109 L 268 200 L 190 291", "M 94 109 L 172 200 L 94 291"],
    ],
  },
  {
    // Path 1 (middle): 2.5s, delay 0.1s
    opacity: 0.65,
    dur: 2.5,
    delay: 0.1,
    finalPath: "M 172 109 L 250 200 L 172 291",
    segments: [
      // Hold straight 0% → 50%
      [0, 0.5, STRAIGHT_1, STRAIGHT_1],
      // Snap to chevron 50% → 58%
      [0.5, 0.58, STRAIGHT_1, "M 210 109 L 288 200 L 210 291"],
      // Slide right 58% → 90%
      [0.58, 0.66, "M 210 109 L 288 200 L 210 291", "M 235 109 L 313 200 L 235 291"],
      [0.66, 0.72, "M 235 109 L 313 200 L 235 291", "M 253 109 L 331 200 L 253 291"],
      [0.72, 0.78, "M 253 109 L 331 200 L 253 291", "M 268 109 L 346 200 L 268 291"],
      [0.78, 0.84, "M 268 109 L 346 200 L 268 291", "M 278 109 L 356 200 L 278 291"],
      [0.84, 0.9, "M 278 109 L 356 200 L 278 291", "M 285 109 L 363 200 L 285 291"],
      // Settle back 90% → 100%
      [0.9, 1.0, "M 285 109 L 363 200 L 285 291", "M 172 109 L 250 200 L 172 291"],
    ],
  },
  {
    // Path 2 (rightmost): 2.4s, delay 0.2s
    opacity: 1.0,
    dur: 2.4,
    delay: 0.2,
    finalPath: "M 250 109 L 328 200 L 250 291",
    segments: [
      // Hold straight 0% → 75%
      [0, 0.75, STRAIGHT_2, STRAIGHT_2],
      // Snap to chevron 75% → 83%
      [0.75, 0.83, STRAIGHT_2, "M 290 109 L 368 200 L 290 291"],
      // Hold 83% → 90%
      [0.83, 0.9, "M 290 109 L 368 200 L 290 291", "M 290 109 L 368 200 L 290 291"],
      // Settle back 90% → 100%
      [0.9, 1.0, "M 290 109 L 368 200 L 290 291", "M 250 109 L 328 200 L 250 291"],
    ],
  },
];

function evaluatePath(anim: PathAnim, elapsed: number): string {
  const localTime = elapsed - anim.delay;
  if (localTime <= 0) return anim.segments[0][2]; // before start → initial path
  const frac = clamp01(localTime / anim.dur);
  if (frac >= 1) return anim.finalPath;

  for (const [start, end, from, to] of anim.segments) {
    if (frac >= start && frac < end) {
      const segT = clamp01((frac - start) / (end - start));
      return interpolatePath(from, to, segT);
    }
  }
  // Past all segments → final path
  return anim.finalPath;
}

export function SplashScreen({ loading, onComplete }: SplashScreenProps) {
  const [fading, setFading] = useState(false);
  const mountTime = useRef(Date.now());
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>(0);

  // JS-driven path animation
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const paths = svg.querySelectorAll<SVGPathElement>("path");
    const startTime = performance.now();

    // Total animation time: max(delay + dur) across all paths
    const totalDuration = Math.max(...PATH_ANIMS.map((a) => (a.delay + a.dur) * 1000));

    function tick(now: number) {
      const elapsed = (now - startTime) / 1000; // seconds

      for (let i = 0; i < PATH_ANIMS.length; i++) {
        const d = evaluatePath(PATH_ANIMS[i], elapsed);
        paths[i].setAttribute("d", d);
      }

      if (now - startTime < totalDuration) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (loading) return;

    const elapsed = Date.now() - mountTime.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    const timer = setTimeout(() => {
      setFading(true);
    }, remaining);

    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!fading) return;

    const timer = setTimeout(() => {
      onComplete();
    }, 500);

    return () => clearTimeout(timer);
  }, [fading, onComplete]);

  return (
    <div className={`splash-screen ${fading ? "splash-screen--fading" : ""}`}>
      <div className="splash-group">
        <svg
          ref={svgRef}
          className="splash-chevrons"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {PATH_ANIMS.map((p, i) => (
            <path
              key={i}
              className={`splash-stroke splash-stroke--${i}`}
              d={p.segments[0][2]}
              stroke="#1A99E6"
              strokeWidth="31"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={p.opacity}
            />
          ))}
        </svg>

        <span className="splash-title">Stride</span>
      </div>

      <p className="splash-tagline">Master Your Productivity</p>
    </div>
  );
}
