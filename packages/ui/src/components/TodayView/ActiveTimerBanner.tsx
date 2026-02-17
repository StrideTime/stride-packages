import { useState, useEffect } from "react";
import { Play, Pause, Check, Clock } from "lucide-react";
import { Button } from "../../primitives/Button";
import { Badge } from "../../primitives/Badge";
import { formatTimerDisplay } from "../shared";

export interface ActiveTimerBannerProps {
  taskTitle: string;
  projectName: string;
  projectColor: string;
  startedAt: string; // ISO timestamp
  onPause?: () => void;
  onComplete?: () => void;
  onResume?: () => void;
  isPaused?: boolean;
}

/**
 * ActiveTimerBanner — Shows the currently active timer at the top of Today view.
 * Updates every second to show elapsed time. Supports pause/resume/complete actions.
 */
export function ActiveTimerBanner({
  taskTitle,
  projectName,
  projectColor,
  startedAt,
  onPause,
  onComplete,
  onResume,
  isPaused = false,
}: ActiveTimerBannerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const calculateElapsed = () => {
      const now = Date.now();
      const start = new Date(startedAt).getTime();
      return Math.floor((now - start) / 1000);
    };

    setElapsed(calculateElapsed());
    const interval = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, isPaused]);

  return (
    <div
      className="mb-6 flex items-center gap-4 rounded-lg border-2 bg-card p-4"
      style={{
        borderColor: projectColor,
        boxShadow: `0 0 0 2px ${projectColor}15`,
      }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Clock className="h-5 w-5 text-primary animate-pulse" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant="outline"
            style={{
              borderColor: projectColor,
              color: projectColor,
            }}
            className="text-xs"
          >
            {projectName}
          </Badge>
        </div>
        <h3 className="font-medium text-sm truncate">{taskTitle}</h3>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-2xl font-mono font-bold tabular-nums">
            {formatTimerDisplay(elapsed)}
          </div>
          {isPaused && <div className="text-xs text-muted-foreground">Paused</div>}
        </div>

        <div className="flex gap-2">
          {isPaused ? (
            <Button size="sm" variant="outline" onClick={onResume} title="Resume timer">
              <Play className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onPause} title="Pause timer">
              <Pause className="h-4 w-4" />
            </Button>
          )}

          <Button size="sm" onClick={onComplete} title="Complete task">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
