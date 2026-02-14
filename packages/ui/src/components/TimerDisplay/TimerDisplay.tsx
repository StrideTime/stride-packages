import { Square, Timer, Coffee } from "lucide-react";
import { Button } from "../../primitives/Button";
import { Badge } from "../../primitives/Badge";
import { Card } from "../../primitives/Card";
import { difficultyConfig, formatTime, formatTimerDisplay } from "../shared";
import type { FocusSessionType } from "@stridetime/types";
import type { TimerDisplayProps } from "./TimerDisplay.types";

const SESSION_LABELS: Record<FocusSessionType, string> = {
  FOCUS: "Focus",
  SHORT_BREAK: "Short Break",
  LONG_BREAK: "Long Break",
};

const SESSION_COLORS: Record<FocusSessionType, string> = {
  FOCUS: "#3b82f6",
  SHORT_BREAK: "#10b981",
  LONG_BREAK: "#8b5cf6",
};

export function TimerDisplay({
  task,
  sessionSeconds,
  onStopSession,
  projectName,
  projectColor,
  pomodoroEnabled = false,
  sessionType = "FOCUS",
  currentCycle = 1,
  totalCycles = 4,
  sessionDurationMinutes = 25,
  remainingSeconds,
}: TimerDisplayProps) {
  const diff = difficultyConfig[task.difficulty];
  const isBreak = sessionType !== "FOCUS";
  const timerColor = SESSION_COLORS[sessionType];
  const displaySeconds = remainingSeconds ?? sessionSeconds;
  const elapsedMinutes = Math.floor(sessionSeconds / 60);

  const isOverMax = !isBreak && task.maxMinutes != null && elapsedMinutes >= task.maxMinutes;
  const isOverEstimate =
    !isBreak && task.estimatedMinutes != null && elapsedMinutes >= task.estimatedMinutes;

  const getTimerSubtitle = (): { text: string; className: string } | null => {
    if (isBreak) return null;
    if (task.maxMinutes != null) {
      const remaining = task.maxMinutes - elapsedMinutes;
      if (remaining <= 0) {
        return {
          text: `${-remaining}m past time limit`,
          className: "text-red-500 font-medium",
        };
      }
      return {
        text: `${remaining}m left of ${task.maxMinutes}m`,
        className: "text-muted-foreground",
      };
    }
    if (task.estimatedMinutes != null) {
      const remaining = task.estimatedMinutes - elapsedMinutes;
      if (remaining <= 0) {
        return {
          text: `${-remaining}m over estimate`,
          className: "text-amber-500 font-medium",
        };
      }
      return {
        text: `~${remaining}m remaining`,
        className: "text-muted-foreground",
      };
    }
    return null;
  };

  const timerSubtitle = getTimerSubtitle();

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      {/* Over-max warning banner */}
      {isOverMax && (
        <div className="px-4 py-2 border-b border-red-500/20 bg-red-500/5">
          <p className="text-xs text-red-600 dark:text-red-400 text-center">
            Time limit reached — consider wrapping up
          </p>
        </div>
      )}

      <div className="flex items-center gap-5 p-5">
        {/* Session type badge (Pomodoro only) */}
        {pomodoroEnabled && (
          <Badge
            variant="outline"
            className="shrink-0 text-xs px-3 py-1.5"
            style={{ borderColor: timerColor, color: timerColor }}
          >
            {isBreak ? (
              <Coffee className="h-3.5 w-3.5 mr-1.5" />
            ) : (
              <Timer className="h-3.5 w-3.5 mr-1.5" />
            )}
            {SESSION_LABELS[sessionType]}
          </Badge>
        )}

        {/* Task info */}
        <div className="flex-1 min-w-0">
          {isBreak && pomodoroEnabled ? (
            <div>
              <p className="text-sm font-medium">
                {sessionDurationMinutes} Minute {SESSION_LABELS[sessionType]}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Take a rest, you&apos;ve earned it!
              </p>
            </div>
          ) : (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Currently working on</div>
              <h3 className="font-semibold text-sm truncate">{task.title}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {projectName && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: projectColor }}
                    />
                    {projectName}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0"
                  style={{
                    borderColor: `${diff.color}40`,
                    color: diff.color,
                  }}
                >
                  {diff.label}
                </Badge>
                {task.estimatedMinutes != null && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Timer className="h-3 w-3" />~{task.estimatedMinutes}m
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Timer display */}
        <div className="text-right shrink-0">
          <div
            className="text-3xl font-bold font-mono tabular-nums"
            style={{
              color: isOverMax ? "#ef4444" : isOverEstimate ? "#f59e0b" : timerColor,
            }}
          >
            {pomodoroEnabled ? formatTimerDisplay(displaySeconds) : formatTime(sessionSeconds)}
          </div>
          {timerSubtitle && (
            <div className={`text-xs mt-0.5 ${timerSubtitle.className}`}>{timerSubtitle.text}</div>
          )}
          {pomodoroEnabled && (
            <div className="flex items-center justify-end gap-1 mt-1">
              {Array.from({ length: totalCycles }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    i < currentCycle - 1
                      ? "bg-primary"
                      : i === currentCycle - 1
                        ? "bg-primary scale-125"
                        : "bg-muted"
                  }`}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">
                {currentCycle}/{totalCycles}
              </span>
            </div>
          )}
        </div>

        {/* Separator + Stop button */}
        <div className="h-8 w-px bg-border shrink-0" />
        <Button variant="outline" size="sm" onClick={onStopSession} className="shrink-0">
          <Square className="h-3.5 w-3.5 mr-1.5" />
          Stop
        </Button>
      </div>
    </Card>
  );
}
