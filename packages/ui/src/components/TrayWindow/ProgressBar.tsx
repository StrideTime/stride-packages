import type { ProgressBarProps } from "./ProgressBar.types";

export function ProgressBar({
  progress,
  color = "var(--primary)",
  className = "",
}: ProgressBarProps) {
  return (
    <div className={`w-full h-1.5 bg-muted rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color }}
      />
    </div>
  );
}
