import { Moon, Clock, CheckCircle2, Zap, Timer, Sunrise } from "lucide-react";
import { Button } from "../../../primitives/Button";
import { ProgressBar } from "../ProgressBar";
import type { TrayClockedOutViewProps } from "./TrayClockedOutView.types";

export function TrayClockedOutView({
  summary,
  onStartNewDay,
  onOpenMain,
}: TrayClockedOutViewProps) {
  const hours = Math.floor(summary.totalMinutes / 60);
  const mins = summary.totalMinutes % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const tasksPercent =
    summary.tasksTarget > 0 ? Math.round((summary.tasksCompleted / summary.tasksTarget) * 100) : 0;
  const pointsPercent =
    summary.pointsTarget > 0 ? Math.round((summary.pointsEarned / summary.pointsTarget) * 100) : 0;
  const focusPercent =
    summary.focusTarget > 0 ? Math.round((summary.focusMinutes / summary.focusTarget) * 100) : 0;

  const allGoalsMet = tasksPercent >= 100 && pointsPercent >= 100;

  return (
    <div className="flex-1 p-4 flex flex-col">
      {/* Day complete banner */}
      <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/5 p-5 text-center">
        <div className="h-12 w-12 rounded-full bg-indigo-500/15 flex items-center justify-center mx-auto mb-3">
          <Moon className="h-6 w-6 text-indigo-500" />
        </div>
        <h3 className="text-lg font-bold mb-1">{allGoalsMet ? "Amazing Day!" : "Day Complete"}</h3>
        <p className="text-sm text-muted-foreground">
          {allGoalsMet ? "You crushed all your goals today" : "Great effort — every bit counts"}
        </p>
      </div>

      {/* Summary stats */}
      <div className="mt-5 space-y-4">
        {/* Total time */}
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-accent/20">
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Clock className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Time Worked</div>
            <div className="text-lg font-bold">{timeDisplay}</div>
          </div>
        </div>

        {/* Tasks completed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="font-medium">Tasks</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {summary.tasksCompleted}/{summary.tasksTarget}
            </span>
          </div>
          <ProgressBar progress={Math.min(tasksPercent, 100)} color="#22c55e" />
        </div>

        {/* Points earned */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Points</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {summary.pointsEarned}/{summary.pointsTarget}
            </span>
          </div>
          <ProgressBar progress={Math.min(pointsPercent, 100)} color="#eab308" />
        </div>

        {/* Focus minutes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Focus Time</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {summary.focusMinutes}m/{summary.focusTarget}m
            </span>
          </div>
          <ProgressBar progress={Math.min(focusPercent, 100)} color="#3b82f6" />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="space-y-2 pt-4 shrink-0">
        <Button onClick={onStartNewDay} className="w-full">
          <Sunrise className="h-4 w-4 mr-2" />
          Start New Day
        </Button>
        <Button variant="ghost" className="w-full text-muted-foreground" onClick={onOpenMain}>
          Open Stride
        </Button>
      </div>
    </div>
  );
}
