import { useState } from "react";
import { Target, Calendar, Play, ChevronDown, ChevronUp, PartyPopper, Clock } from "lucide-react";
import { Button } from "../../../primitives/Button";
import { Badge } from "../../../primitives/Badge";
import { difficultyConfig } from "../../shared";
import { ProgressBar } from "../ProgressBar";
import type { TrayUpNextViewProps } from "./TrayUpNextView.types";

export function TrayUpNextView({
  scheduledTasks,
  recommendedTasks,
  onStartTask,
  onOpenSchedule,
  onBack,
}: TrayUpNextViewProps) {
  const [scheduledExpanded, setScheduledExpanded] = useState(true);
  const [recommendedExpanded, setRecommendedExpanded] = useState(scheduledTasks.length === 0);
  const allDone = scheduledTasks.length === 0 && recommendedTasks.length === 0;

  return (
    <div className="flex-1 p-4 overflow-auto space-y-4">
      {/* Header banner */}
      <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-4">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-purple-500 shrink-0" />
          <div>
            <h3 className="text-base font-bold">Up Next</h3>
            <p className="text-xs text-muted-foreground">
              Continue with your scheduled tasks for today
            </p>
          </div>
        </div>
      </div>

      {/* All done state */}
      {allDone && (
        <div className="rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5 p-5 text-center">
          <PartyPopper className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <h3 className="text-base font-bold mb-1">All Tasks Complete!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You&apos;ve finished all scheduled tasks for today.
          </p>
          <Button variant="outline" size="sm" onClick={onOpenSchedule}>
            <Calendar className="h-3.5 w-3.5 mr-2" />
            View Today&apos;s Schedule
          </Button>
        </div>
      )}

      {/* Scheduled for Today */}
      {scheduledTasks.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setScheduledExpanded(!scheduledExpanded)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Scheduled for Today</span>
              <Badge variant="outline" className="text-xs">
                {scheduledTasks.length}
              </Badge>
            </div>
            {scheduledExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {scheduledExpanded && (
            <div className="space-y-2">
              {scheduledTasks.map((t) => {
                const diff = difficultyConfig[t.difficulty];
                return (
                  <button
                    key={t.id}
                    onClick={() => onStartTask(t.id)}
                    className="w-full p-3 rounded-lg border border-border hover:bg-accent/50 text-left transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      {t.priority && t.priority !== "NONE" && (
                        <div
                          className={`w-1 self-stretch rounded-full shrink-0 ${
                            t.priority === "CRITICAL"
                              ? "bg-red-500"
                              : t.priority === "HIGH"
                                ? "bg-orange-500"
                                : "bg-gray-400"
                          }`}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium line-clamp-1">{t.title}</span>
                          {t.scheduledTime && (
                            <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {t.scheduledTime}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            style={{ borderColor: diff.color, color: diff.color }}
                            className="text-xs"
                          >
                            {diff.label}
                          </Badge>
                          {t.estimatedMinutes && (
                            <span className="text-xs text-muted-foreground">
                              ~{t.estimatedMinutes}m
                            </span>
                          )}
                        </div>
                      </div>
                      <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View schedule button */}
      <Button variant="outline" className="w-full" onClick={onOpenSchedule}>
        <Calendar className="h-4 w-4 mr-2" />
        View Today&apos;s Schedule
      </Button>

      {/* Recommended tasks */}
      {recommendedTasks.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setRecommendedExpanded(!recommendedExpanded)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Recommendations</span>
            </div>
            {recommendedExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {recommendedExpanded && (
            <div className="space-y-2">
              {recommendedTasks.map((t) => {
                const diff = difficultyConfig[t.difficulty];
                return (
                  <button
                    key={t.id}
                    onClick={() => onStartTask(t.id)}
                    className="w-full p-3 rounded-lg border border-border hover:bg-accent/50 text-left transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-medium line-clamp-1">{t.title}</span>
                      <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        style={{ borderColor: diff.color, color: diff.color }}
                        className="text-xs"
                      >
                        {diff.label}
                      </Badge>
                      {t.estimatedMinutes && (
                        <span className="text-xs text-muted-foreground">
                          ~{t.estimatedMinutes}m
                        </span>
                      )}
                      {t.dueDate && (
                        <span className="text-xs text-muted-foreground">Due: {t.dueDate}</span>
                      )}
                    </div>
                    {t.progress !== undefined && t.progress > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <ProgressBar progress={t.progress} color="#3b82f6" className="flex-1" />
                        <span className="text-xs text-muted-foreground">{t.progress}%</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Back button */}
      <Button variant="ghost" className="w-full text-muted-foreground" onClick={onBack}>
        Back to Task Selection
      </Button>
    </div>
  );
}
