import { useState } from "react";
import { CheckCircle2, Coffee, Target, Calendar, Trophy, Clock, LogOut } from "lucide-react";
import { Button } from "../../../primitives/Button";
import { Slider } from "../../../primitives/Slider";
import { Checkbox } from "../../../primitives/Checkbox";
import type { TrayStoppedViewProps } from "./TrayStoppedView.types";

const BREAK_PRESETS = [
  { label: "5m", minutes: 5 },
  { label: "10m", minutes: 10 },
  { label: "15m", minutes: 15 },
];

export function TrayStoppedView({
  taskTitle,
  minutesWorked,
  currentProgress,
  subtasks = [],
  reason = "manual",
  nextEventTitle,
  upcomingEvent,
  onProgressChange,
  onToggleSubtask,
  onCompleteTask,
  onSelectNewTask,
  onStartNextEvent,
  onStartEvent,
  onTakeBreak,
  onClockOut,
}: TrayStoppedViewProps) {
  const [customMinutes, setCustomMinutes] = useState("");

  const handleCustomBreak = () => {
    const mins = parseInt(customMinutes, 10);
    if (mins > 0 && mins <= 120) {
      onTakeBreak(mins);
      setCustomMinutes("");
    }
  };

  return (
    <div className="flex-1 p-4 overflow-auto space-y-5">
      {/* Great Work banner */}
      <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Great Work!</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {minutesWorked} minute{minutesWorked !== 1 ? "s" : ""} on {taskTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Task progress slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Task Progress</span>
          <span className="text-sm font-bold" style={{ color: "#3b82f6" }}>
            {currentProgress}%
          </span>
        </div>
        <Slider
          value={[currentProgress]}
          onValueChange={(v) => onProgressChange(v[0])}
          min={0}
          max={100}
          step={5}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Just started</span>
          <span>Halfway</span>
          <span>Complete!</span>
        </div>
      </div>

      {/* Complete task button */}
      {onCompleteTask && (
        <Button
          onClick={onCompleteTask}
          variant="outline"
          className="w-full border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-700"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Mark Task Complete
        </Button>
      )}

      {/* Subtask checkoffs */}
      {subtasks.length > 0 && onToggleSubtask && (
        <div className="space-y-2">
          <span className="text-sm font-medium">Subtasks</span>
          <div className="space-y-1.5">
            {subtasks.map((st) => {
              const isDone = st.status === "COMPLETED";
              return (
                <button
                  key={st.id}
                  onClick={() => onToggleSubtask(st.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors ${
                    isDone
                      ? "bg-green-500/5 border-green-500/30"
                      : "border-border hover:bg-accent/50"
                  }`}
                >
                  <Checkbox checked={isDone} />
                  <span
                    className={`text-sm flex-1 ${isDone ? "line-through text-muted-foreground" : ""}`}
                  >
                    {st.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Next actions — depends on reason */}
      {reason === "event" ? (
        <div className="space-y-3">
          {nextEventTitle && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Up next</p>
              <p className="text-sm font-semibold">{nextEventTitle}</p>
            </div>
          )}
          <Button onClick={onStartNextEvent} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Start Event
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Upcoming event banner */}
          {upcomingEvent && (
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  UP NEXT
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1">{upcomingEvent.label}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {upcomingEvent.startTime} · in {upcomingEvent.minutesUntil}m
                    </span>
                  </div>
                </div>
                <Button size="sm" onClick={onStartEvent} className="shrink-0 h-8">
                  Start
                </Button>
              </div>
            </div>
          )}

          <h4 className="text-sm font-semibold">Pick another task to work on</h4>

          <Button onClick={onSelectNewTask} className="w-full">
            <Target className="h-4 w-4 mr-2" />
            View Tasks
          </Button>

          {/* Break presets + custom */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Take a Break</span>
            </div>
            <div className="flex items-center gap-2">
              {BREAK_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => onTakeBreak(preset.minutes)}
                  className="h-9 text-xs font-medium flex-1"
                >
                  {preset.label}
                </Button>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomBreak()}
                  placeholder="min"
                  min={1}
                  max={120}
                  className="h-9 w-14 rounded-md border border-border bg-background px-2 text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {customMinutes && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCustomBreak}
                    className="h-9 px-2 text-xs"
                  >
                    Go
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={onClockOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Clock Out for the Day
          </Button>
        </div>
      )}
    </div>
  );
}
