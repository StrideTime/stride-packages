import { CheckCircle2, Sparkles } from "lucide-react";
import { Card } from "../../../primitives/Card";
import { Badge } from "../../../primitives/Badge";
import { Button } from "../../../primitives/Button";
import { TrayHabitItem } from "./TrayHabitItem";
import type { TrayStatsViewProps } from "./TrayStatsView.types";

function StatBar({
  label,
  current,
  target,
  color,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const formatValue = (v: number) => {
    if (label === "Focus Time") {
      const h = Math.floor(v / 60);
      const m = v % 60;
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
    return Number.isInteger(v) ? v.toString() : v.toFixed(1);
  };
  const formatTarget = (v: number) => {
    if (label === "Focus Time") {
      const h = Math.floor(v / 60);
      return h > 0 ? `${h}h` : `${v}m`;
    }
    return v.toString();
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-base font-bold">
          {formatValue(current)}
          <span className="text-sm text-muted-foreground font-normal">
            {" "}
            / {formatTarget(target)}
          </span>
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-xs text-muted-foreground mt-1.5">
        {pct >= 100
          ? "Target reached!"
          : label === "Focus Time"
            ? `${Math.floor((target - current) / 60)}h ${(target - current) % 60}m remaining`
            : `${(target - current).toFixed(label === "Points" ? 1 : 0)} to go`}
      </div>
    </div>
  );
}

function CircularProgress({ current, target }: { current: number; target: number }) {
  const pct = target > 0 ? Math.min(current / target, 1) : 0;
  const r = 35;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="relative shrink-0">
      <svg width={80} height={80} className="transform -rotate-90">
        <circle
          cx={40}
          cy={40}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={8}
          className="text-border"
        />
        <circle
          cx={40}
          cy={40}
          r={r}
          fill="none"
          stroke="#16a34a"
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xl font-bold">{current}</div>
        <div className="text-[10px] text-muted-foreground">/ {target}</div>
      </div>
    </div>
  );
}

export function TrayStatsView({
  stats,
  habits,
  habitsEnabled = true,
  onStatsPeriodChange,
  onToggleHabit,
  onUpdateHabitValue,
  onUpgrade,
}: TrayStatsViewProps) {
  const completedHabits = habits.filter((h) => h.completed).length;

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {/* Stats card */}
      <Card className="p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">
              {stats.period === "DAILY" ? "Daily Stats" : "Weekly Stats"}
            </h3>
          </div>

          {/* Period toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1">
            <button
              onClick={() => onStatsPeriodChange("DAILY")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                stats.period === "DAILY"
                  ? "bg-background text-foreground shadow-md border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => onStatsPeriodChange("WEEKLY")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                stats.period === "WEEKLY"
                  ? "bg-background text-foreground shadow-md border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Tasks with circular progress */}
          <div className="flex items-center gap-4">
            <CircularProgress current={stats.tasksCompleted} target={stats.tasksTarget} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium mb-1">Tasks</div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-green-600"
                  style={{
                    width: `${Math.min((stats.tasksCompleted / stats.tasksTarget) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {Math.round((stats.tasksCompleted / stats.tasksTarget) * 100)}% complete &bull;{" "}
                {stats.tasksTarget - stats.tasksCompleted} remaining
              </div>
            </div>
          </div>

          {/* Points, Focus Time, Habits */}
          <StatBar
            label="Points"
            current={stats.pointsEarned}
            target={stats.pointsTarget}
            color="#2563eb"
          />
          <StatBar
            label="Focus Time"
            current={stats.focusMinutes}
            target={stats.focusTarget}
            color="#9333ea"
          />
          {habitsEnabled ? (
            <StatBar
              label="Habits"
              current={stats.habitsCompleted}
              target={stats.habitsTotal}
              color="#db2777"
            />
          ) : (
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium">Habits</span>
                <Badge variant="outline" className="text-xs font-normal">
                  Pro
                </Badge>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-muted-foreground/20"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">Upgrade to track habits</div>
            </div>
          )}
        </div>
      </Card>

      {/* Habits section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Today&apos;s Habits</h3>
          {habitsEnabled && (
            <Badge variant="outline">
              {completedHabits}/{habits.length}
            </Badge>
          )}
        </div>

        {habitsEnabled ? (
          <div className="space-y-2">
            {habits.length === 0 ? (
              <Card className="p-4 text-center text-sm text-muted-foreground">
                No habits scheduled for today
              </Card>
            ) : (
              habits.map((habit) => (
                <TrayHabitItem
                  key={habit.id}
                  {...habit}
                  onToggle={() => onToggleHabit(habit.id)}
                  onUpdateValue={(v) => onUpdateHabitValue(habit.id, v)}
                />
              ))
            )}
          </div>
        ) : (
          <Card className="p-3 border-dashed">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500/15 to-purple-500/15 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-pink-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Habit Tracking</p>
                <p className="text-xs text-muted-foreground">Build streaks with a Pro plan</p>
              </div>
              {onUpgrade && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onUpgrade}
                  className="shrink-0 h-7 text-xs"
                >
                  Upgrade
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
