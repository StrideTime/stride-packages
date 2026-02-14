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
 * Uses the exact logo SVG (viewBox 0 0 400 400, strokeWidth 31).
 *
 * Three vertical lines start spread out on the left. The leftmost
 * line snaps into a chevron — its midpoint swings right and reaches
 * the next line, visually "pushing" it. That line then snaps and
 * pushes the third. Domino cascade.
 *
 * Starting positions (vertical lines, spread apart):
 *   line 0: x=30    → snaps + slides right past line 1 at x=165, keeps going
 *   line 1: x=165   → snaps + slides right with #0 toward line 2 at x=370
 *   line 2: x=340   → snaps when #0+#1 reach it
 *
 * Logo final positions:
 *   chevron 0: M 94  109 L 172 200 L 94  291   opacity 0.35
 *   chevron 1: M 172 109 L 250 200 L 172 291   opacity 0.65
 *   chevron 2: M 250 109 L 328 200 L 250 291   opacity 1.0
 */

const CHEVRONS = [
  {
    opacity: 0.35,
    start: "M 30 109 L 30 200 L 30 291",
    end: "M 94 109 L 172 200 L 94 291",
  },
  {
    opacity: 0.65,
    start: "M 165 109 L 165 200 L 165 291",
    end: "M 172 109 L 250 200 L 172 291",
  },
  {
    opacity: 1.0,
    start: "M 340 109 L 340 200 L 340 291",
    end: "M 250 109 L 328 200 L 250 291",
  },
];

export function SplashScreen({ loading, onComplete }: SplashScreenProps) {
  const [fading, setFading] = useState(false);
  const mountTime = useRef(Date.now());

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
          className="splash-chevrons"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {CHEVRONS.map((c, i) => (
            <path
              key={i}
              className={`splash-stroke splash-stroke--${i}`}
              d={c.start}
              stroke="#1A99E6"
              strokeWidth="31"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={c.opacity}
            />
          ))}
        </svg>

        <span className="splash-title">Stride</span>
      </div>

      <p className="splash-tagline">Master Your Productivity</p>
    </div>
  );
}
