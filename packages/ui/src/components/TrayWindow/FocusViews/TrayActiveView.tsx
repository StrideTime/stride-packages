import { Square, Clock, Calendar, Coffee, Timer, ArrowRightLeft } from "lucide-react";
import { Button } from "../../../primitives/Button";
import { Badge } from "../../../primitives/Badge";
import { difficultyConfig, formatTimerDisplay } from "../../shared";
import type { FocusSessionType } from "../TrayWindow.types";
import type { TrayActiveViewProps } from "./TrayActiveView.types";

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

export function TrayActiveView({
  task,
  sessionSeconds,
  onStopSession,
  pomodoroEnabled = false,
  sessionType = "FOCUS",
  currentCycle = 1,
  totalCycles = 4,
  sessionDurationMinutes = 25,
  remainingSeconds,
  onSwitchTask,
  upcomingEvent,
  onStartEvent,
}: TrayActiveViewProps) {
  const difficulty = difficultyConfig[task.difficulty];
  const isBreak = sessionType !== "FOCUS";
  const timerColor = SESSION_COLORS[sessionType];

  // Circular timer calculations
  const size = 260;
  const viewBox = size + 40;
  const center = viewBox / 2;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const displaySeconds = remainingSeconds ?? sessionSeconds;
  const totalSessionSeconds = sessionDurationMinutes * 60;
  const sessionProgress = pomodoroEnabled
    ? ((totalSessionSeconds - displaySeconds) / totalSessionSeconds) * 100
    : (sessionSeconds / totalSessionSeconds) * 100;
  const progressOffset = circumference - (Math.min(sessionProgress, 100) / 100) * circumference;

  // Time tracking
  const elapsedMinutes = Math.floor(sessionSeconds / 60);
  const isOverMax = !isBreak && task.maxMinutes != null && elapsedMinutes >= task.maxMinutes;
  const isOverEstimate =
    !isBreak && task.estimatedMinutes != null && elapsedMinutes >= task.estimatedMinutes;

  // Subtitle inside circle — one clean line
  const getTimerSubtitle = (): { text: string; className: string } | null => {
    if (isBreak) return null;
    if (task.maxMinutes != null) {
      const remaining = task.maxMinutes - elapsedMinutes;
      if (remaining <= 0) {
        return { text: `${-remaining}m past time limit`, className: "text-red-500 font-medium" };
      }
      return {
        text: `${remaining}m left of ${task.maxMinutes}m`,
        className: "text-muted-foreground",
      };
    }
    if (task.estimatedMinutes != null) {
      const remaining = task.estimatedMinutes - elapsedMinutes;
      if (remaining <= 0) {
        return { text: `${-remaining}m over estimate`, className: "text-amber-500 font-medium" };
      }
      return { text: `~${remaining}m remaining`, className: "text-muted-foreground" };
    }
    return null;
  };
  const timerSubtitle = getTimerSubtitle();

  return (
    <div className="flex-1 p-4 flex flex-col items-center">
      {/* Upcoming event banner */}
      {upcomingEvent && (
        <div className="w-full rounded-lg border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium text-yellow-700 dark:text-yellow-300 truncate">
                  {upcomingEvent.label}
                </div>
                <div className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
                  in {upcomingEvent.minutesUntil} min &bull; {upcomingEvent.startTime}
                </div>
              </div>
            </div>
            {onStartEvent && (
              <Button
                variant="outline"
                size="sm"
                onClick={onStartEvent}
                className="h-7 text-xs shrink-0 border-yellow-500/30 text-yellow-700 dark:text-yellow-300"
              >
                Start
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Spacer — pushes task info to 1/4 mark (flex-1) */}
      <div className="flex-1" />

      {/* Task info (shrink-0) */}
      <div className="shrink-0 w-full">
        {isBreak && pomodoroEnabled ? (
          <div className="text-center">
            <Badge
              variant="outline"
              className="text-sm px-3 py-1"
              style={{ borderColor: timerColor, color: timerColor }}
            >
              <Coffee className="h-3.5 w-3.5 mr-1.5" />
              {sessionDurationMinutes} Minute {SESSION_LABELS[sessionType]}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Take a rest, you&apos;ve earned it!
            </p>
          </div>
        ) : (
          <div className="text-center w-full">
            <h3 className="text-base font-semibold leading-tight line-clamp-2 mb-2">
              {task.title}
            </h3>
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground flex-wrap">
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due: {task.dueDate}
                </span>
              )}
              <Badge
                variant="outline"
                style={{ borderColor: difficulty.color, color: difficulty.color }}
                className="text-xs"
              >
                {difficulty.label}
              </Badge>
              {task.estimatedMinutes != null && (
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />~{task.estimatedMinutes}m
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spacer — between title and circle (flex-1, same weight as above) */}
      <div className="flex-1" />

      {/* Circular timer (shrink-0, centered at the vertical midpoint) */}
      <div className="shrink-0 flex flex-col items-center w-full">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${viewBox} ${viewBox}`}
            className="-rotate-90"
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="14"
              className="text-border"
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={isOverMax ? "#ef4444" : isOverEstimate ? "#f59e0b" : timerColor}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              style={{ transition: "stroke-dashoffset 0.5s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold tabular-nums tracking-tight">
              {pomodoroEnabled
                ? formatTimerDisplay(displaySeconds)
                : formatTimerDisplay(sessionSeconds)}
            </div>
            {timerSubtitle && (
              <div className={`text-xs mt-1.5 ${timerSubtitle.className}`}>
                {timerSubtitle.text}
              </div>
            )}
          </div>
        </div>

        {/* Pomodoro cycle dots */}
        {pomodoroEnabled && (
          <div className="flex items-center gap-1.5 mt-3">
            {Array.from({ length: totalCycles }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${
                  i < currentCycle - 1
                    ? "bg-primary"
                    : i === currentCycle - 1
                      ? "bg-primary scale-125"
                      : "bg-muted"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1.5">
              Cycle {currentCycle}/{totalCycles}
            </span>
          </div>
        )}

        {/* Time limit warning */}
        {isOverMax && (
          <div className="w-full rounded-lg border border-red-500/20 bg-red-500/5 p-2.5 mt-3">
            <p className="text-xs text-red-600 dark:text-red-400 text-center">
              Time limit reached — consider wrapping up
            </p>
          </div>
        )}
      </div>

      {/* Spacer — below circle (flex-2 = double weight, keeps circle at center) */}
      <div className="flex-[2]" />

      {/* Bottom actions — pinned to bottom */}
      <div className="w-full pt-4 shrink-0 space-y-2">
        {pomodoroEnabled && !isBreak && onSwitchTask && (
          <Button
            onClick={onSwitchTask}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
            Switch Task
          </Button>
        )}
        <Button onClick={onStopSession} variant="outline" size="lg" className="w-full">
          <Square className="h-4 w-4 mr-2" />
          Stop Session
        </Button>
      </div>
    </div>
  );
}
