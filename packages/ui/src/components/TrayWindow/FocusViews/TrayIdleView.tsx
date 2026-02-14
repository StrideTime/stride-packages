import {
  Play,
  Zap,
  Coffee,
  CheckCircle2,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../../../primitives/Button";
import type { IdleSection, TrayIdleViewProps } from "./TrayIdleView.types";

const BREAK_PRESETS = [
  { label: "5m", minutes: 5 },
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
  { label: "60m", minutes: 60 },
];

export function TrayIdleView({
  dailySeconds,
  goals,
  availableTasks,
  onStartTask,
  onTakeBreak,
  onClockOut,
  onOpenMain,
}: TrayIdleViewProps) {
  const [expanded, setExpanded] = useState<IdleSection>("pick");
  const dailyPointsProgress = (goals.pointsCurrent / goals.pointsTarget) * 100;

  const Chevron = ({ section }: { section: IdleSection }) =>
    expanded === section ? (
      <ChevronUp className="h-4 w-4 text-muted-foreground" />
    ) : (
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    );

  return (
    <>
      {/* Quick info chips */}
      <div className="px-4 py-3 border-b bg-accent/20 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Time:</span>
            <span className="font-medium">
              {Math.floor(dailySeconds / 3600)}h {Math.floor((dailySeconds % 3600) / 60)}m
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border text-xs">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span className="text-muted-foreground font-medium">Points:</span>
            <span className="font-medium">{goals.pointsCurrent}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border text-xs">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span className="text-muted-foreground font-medium">Tasks:</span>
            <span className="font-medium">
              {goals.tasksCurrent}/{goals.tasksTarget}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border text-xs">
            <Target className="h-3 w-3 text-purple-500" />
            <span className="text-muted-foreground font-medium">Goal:</span>
            <span className="font-medium">{Math.round(dailyPointsProgress)}%</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        <div className="text-center text-base font-bold mb-3">WHAT&apos;S NEXT?</div>

        <div className="space-y-2">
          {/* Pick Another Task */}
          <div className="border rounded-lg bg-primary/5 border-primary/20 overflow-hidden">
            <button
              onClick={() => setExpanded("pick")}
              className="w-full flex items-center justify-between p-3 hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <div className="text-sm font-semibold">Pick Another Task</div>
              </div>
              <Chevron section="pick" />
            </button>
            {expanded === "pick" && (
              <div className="px-3 pb-3">
                {availableTasks.length > 0 ? (
                  <div className="space-y-1.5">
                    {availableTasks.slice(0, 2).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onStartTask(t)}
                        className="w-full p-2 rounded-md bg-background hover:bg-accent/50 text-left transition-colors group border border-border"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium flex-1 line-clamp-1">{t.title}</div>
                          <Play className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                        </div>
                        {t.estimatedMinutes && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {t.estimatedMinutes}min
                          </div>
                        )}
                      </button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onOpenMain}
                      className="w-full h-8 text-xs mt-1"
                    >
                      More Tasks <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={onOpenMain} className="w-full mt-2">
                    <Play className="h-3.5 w-3.5 mr-2" />
                    Choose Task
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Take a Break */}
          <div className="border rounded-lg bg-orange-500/5 border-orange-500/20 overflow-hidden">
            <button
              onClick={() => setExpanded("break")}
              className="w-full flex items-center justify-between p-3 hover:bg-orange-500/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-orange-500" />
                <div className="text-sm font-semibold">Take Break</div>
              </div>
              <Chevron section="break" />
            </button>
            {expanded === "break" && (
              <div className="px-3 pb-3">
                <div className="grid grid-cols-4 gap-1.5">
                  {BREAK_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => onTakeBreak(preset.minutes)}
                      className="w-full h-8 text-xs px-1"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clock Out */}
          <div className="border rounded-lg bg-green-500/5 border-green-500/20 overflow-hidden">
            <button
              onClick={() => setExpanded("finish")}
              className="w-full flex items-center justify-between p-3 hover:bg-green-500/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div className="text-sm font-semibold">Clock Out</div>
              </div>
              <Chevron section="finish" />
            </button>
            {expanded === "finish" && (
              <div className="px-3 pb-3">
                <Button variant="outline" size="sm" onClick={onClockOut} className="w-full h-8">
                  Finish Day
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
