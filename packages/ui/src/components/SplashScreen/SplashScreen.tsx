import { useEffect, useRef, useState } from "react";
import "./SplashScreen.css";

const MIN_DISPLAY_MS = 4000;

export interface SplashScreenProps {
  /** While true the splash stays visible; once false the fade-out countdown begins. */
  loading: boolean;
  /** Fired after the fade-out transition finishes. */
  onComplete: () => void;
}

/**
 * Uses the exact logo SVG (viewBox 0 0 400 400, strokeWidth 31) rendered
 * as three separate paths inside one SVG. Each path starts as a vertical
 * line at its chevron's X-center and morphs to the real chevron shape.
 *
 * Logo paths:
 *   chevron 1: M94  109 L172 200 L94  291   opacity 0.35
 *   chevron 2: M172 109 L250 200 L172 291   opacity 0.65
 *   chevron 3: M250 109 L328 200 L250 291   opacity 1.0
 *
 * Vertical line equivalents (same X for top, mid, bottom):
 *   line 1: M133 109 L133 200 L133 291   (center of 94–172)
 *   line 2: M211 109 L211 200 L211 291   (center of 172–250)
 *   line 3: M289 109 L289 200 L289 291   (center of 250–328)
 */

const CHEVRONS = [
  {
    opacity: 0.35,
    line: "M 133 109 L 133 200 L 133 291",
    chevron: "M 94 109 L 172 200 L 94 291",
  },
  {
    opacity: 0.65,
    line: "M 211 109 L 211 200 L 211 291",
    chevron: "M 172 109 L 250 200 L 172 291",
  },
  {
    opacity: 1.0,
    line: "M 289 109 L 289 200 L 289 291",
    chevron: "M 250 109 L 328 200 L 250 291",
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
              d={c.line}
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
