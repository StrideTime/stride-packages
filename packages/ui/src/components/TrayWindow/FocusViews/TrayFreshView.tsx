import {
  Play,
  Sparkles,
  CalendarDays,
  Target,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../../../primitives/Button";
import { Badge } from "../../../primitives/Badge";
import type { FreshSection, TrayFreshViewProps } from "./TrayFreshView.types";

export function TrayFreshView({
  goals,
  availableTasks,
  scheduledTasks = [],
  onStartTask,
  onOpenSchedule,
  onViewGoals,
  onOpenMain,
}: TrayFreshViewProps) {
  const [expanded, setExpanded] = useState<FreshSection>("plan");

  const Chevron = ({ section }: { section: FreshSection }) =>
    expanded === section ? (
      <ChevronUp className="h-4 w-4 text-muted-foreground" />
    ) : (
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    );

  return (
    <>
      {/* Greeting */}
      <div className="px-4 py-6 border-b bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Good morning!</h2>
            <p className="text-sm text-muted-foreground">
              {scheduledTasks.length > 0
                ? `${scheduledTasks.length} task${scheduledTasks.length === 1 ? "" : "s"} scheduled today`
                : "Let's make today count"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Scheduled tasks timeline */}
        {scheduledTasks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-muted-foreground tracking-wide">
                TODAY&apos;S SCHEDULE
              </h3>
              <button onClick={onOpenSchedule} className="text-xs text-primary hover:underline">
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {scheduledTasks.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => onStartTask(t)}
                  className="w-full p-3 rounded-lg bg-accent/30 hover:bg-accent/50 text-left transition-all border border-border/50 hover:border-primary/20 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-0.5 shrink-0">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground mb-0.5" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {t.scheduledTime}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {t.projectColor && (
                          <div
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: t.projectColor }}
                          />
                        )}
                        {t.projectName && (
                          <span className="text-xs text-muted-foreground truncate">
                            {t.projectName}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium leading-tight line-clamp-1">
                        {t.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {t.priority && t.priority !== "NONE" && (
                          <Badge
                            variant="outline"
                            className="text-xs capitalize px-1.5 py-0 h-4 font-medium"
                          >
                            {t.priority.toLowerCase()}
                          </Badge>
                        )}
                        {t.estimatedMinutes && (
                          <span className="text-xs text-muted-foreground">
                            {t.estimatedMinutes}min
                          </span>
                        )}
                      </div>
                    </div>
                    <Play className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                  </div>
                  {i < scheduledTasks.length - 1 && (
                    <div className="ml-[18px] mt-2 h-2 border-l border-dashed border-border" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mb-4">
          <h3 className="text-sm font-bold text-muted-foreground tracking-wide">
            {scheduledTasks.length > 0 ? "OR GET STARTED" : "START YOUR DAY"}
          </h3>
        </div>

        <div className="space-y-3">
          {/* Plan Your Day */}
          <div className="rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 shadow-sm hover:shadow-md transition-all">
            <button
              onClick={() => setExpanded("plan")}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold">Plan Your Day</div>
                  <div className="text-xs text-muted-foreground">Schedule & prioritize</div>
                </div>
              </div>
              <Chevron section="plan" />
            </button>
            {expanded === "plan" && (
              <div className="px-4 pb-4">
                <div className="bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Open your schedule to organize tasks and set up your day
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenSchedule}
                    className="w-full h-9 font-medium"
                  >
                    <CalendarDays className="h-3.5 w-3.5 mr-2" />
                    Open Schedule
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Pick a Task */}
          <div className="rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm hover:shadow-md transition-all">
            <button
              onClick={() => setExpanded("pick")}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold">Pick a Task</div>
                  <div className="text-xs text-muted-foreground">Jump right in</div>
                </div>
              </div>
              <Chevron section="pick" />
            </button>
            {expanded === "pick" && (
              <div className="px-4 pb-4">
                <div className="bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Start working on high-priority tasks immediately
                  </p>
                  <div className="space-y-2">
                    {availableTasks.slice(0, 3).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onStartTask(t)}
                        className="w-full p-2.5 rounded-lg bg-background hover:bg-accent/50 text-left transition-all border border-border hover:border-primary/20 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="text-sm font-medium flex-1 line-clamp-1">{t.title}</div>
                          <Play className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        </div>
                        <div className="flex items-center gap-2">
                          {t.priority && t.priority !== "NONE" && (
                            <Badge
                              variant="outline"
                              className="text-xs capitalize px-1.5 py-0 h-4 border-red-500/30 text-red-500 font-medium"
                            >
                              {t.priority.toLowerCase()}
                            </Badge>
                          )}
                          {t.estimatedMinutes && (
                            <span className="text-xs text-muted-foreground">
                              {t.estimatedMinutes}min
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onOpenMain}
                      className="w-full h-8 text-xs font-medium"
                    >
                      View All Tasks <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Set Daily Focus */}
          <div className="rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 shadow-sm hover:shadow-md transition-all">
            <button
              onClick={() => setExpanded("focus")}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold">Set Daily Focus</div>
                  <div className="text-xs text-muted-foreground">Review your goals</div>
                </div>
              </div>
              <Chevron section="focus" />
            </button>
            {expanded === "focus" && (
              <div className="px-4 pb-4">
                <div className="bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Review your daily targets and set your intention
                  </p>
                  <div className="bg-gradient-to-br from-purple-500/5 to-transparent rounded-lg p-3 border border-purple-500/10 space-y-2.5 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-muted-foreground">Points Target</span>
                      </div>
                      <span className="font-semibold">{goals.pointsTarget}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-muted-foreground">Tasks Goal</span>
                      </div>
                      <span className="font-semibold">{goals.tasksTarget}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onViewGoals}
                    className="w-full h-9 font-medium"
                  >
                    View All Goals
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
