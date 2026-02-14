import {
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
  Timer,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../primitives/Button";
import { Progress } from "../../primitives/Progress";
import { Slider } from "../../primitives/Slider";
import { Badge } from "../../primitives/Badge";
import { Card } from "../../primitives/Card";
import { difficultyConfig, formatDuration, externalSourceConfig } from "../shared";
import { TaskHistory } from "./TaskHistory";
import type { TaskCardProps } from "./TaskCard.types";

export function TaskCard({
  task,
  projectName,
  projectColor,
  subtasks,
  timeEntries,
  onUpdateTimeEntry,
  onDeleteTimeEntry,
  points,
  externalUrl,
  isActive = false,
  expanded = false,
  onToggleSubtask,
  onToggleExpand,
  onOpenDetail,
  onStart,
  onPause,
  onComplete,
  onUpdateProgress,
  onClick,
}: TaskCardProps) {
  const diff = difficultyConfig[task.difficulty];
  const extSource = task.externalSource ? externalSourceConfig[task.externalSource] : null;
  const isCompleted = task.status === "COMPLETED";
  const hasSubtasks = subtasks && subtasks.length > 0;
  const completedSubtasks = subtasks?.filter((st) => st.completed).length ?? 0;

  const timeInfo =
    task.actualMinutes && task.estimatedMinutes
      ? {
          actual: task.actualMinutes,
          estimated: task.estimatedMinutes,
          isUnder: task.estimatedMinutes - task.actualMinutes > 0,
          difference: Math.abs(task.estimatedMinutes - task.actualMinutes),
        }
      : null;

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (onToggleExpand) {
      onToggleExpand();
    } else if (onOpenDetail) {
      onOpenDetail();
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-md border cursor-pointer ${
        isActive ? "ring-2 ring-primary border-primary" : "border-border"
      } ${isCompleted ? "opacity-60" : ""} bg-card`}
      onClick={handleCardClick}
    >
      {/* Compact row — always visible */}
      <div className="px-4 py-3">
        {/* Row 1: Status dot + Title + Start button + Chevron */}
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div
            className={`h-2 w-2 rounded-full shrink-0 ${
              isCompleted
                ? "bg-green-500"
                : isActive
                  ? "bg-primary animate-pulse"
                  : "bg-muted-foreground/30"
            }`}
          />

          {/* Title */}
          <h3
            className={`flex-1 min-w-0 font-medium text-base ${expanded ? "" : "truncate"} ${
              isCompleted ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {task.title}
          </h3>

          {/* Metadata — inline when collapsed */}
          {!expanded && (
            <>
              {/* Difficulty badge */}
              <Badge
                variant="outline"
                className="shrink-0 text-xs px-1.5 py-0"
                style={{
                  borderColor: `${diff.color}40`,
                  color: diff.color,
                }}
              >
                {diff.label}
              </Badge>

              {/* Project (hidden when external source present — saves space) */}
              {!extSource && (
                <span className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: projectColor }}
                  />
                  <span className="hidden sm:inline">{projectName}</span>
                </span>
              )}

              {/* External source chip */}
              {extSource &&
                (externalUrl ? (
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: extSource.bg, color: extSource.fg }}
                  >
                    <extSource.Icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{task.externalId ?? extSource.label}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                  </a>
                ) : (
                  <span
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5"
                    style={{ backgroundColor: extSource.bg, color: extSource.fg }}
                  >
                    <extSource.Icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{task.externalId ?? extSource.label}</span>
                  </span>
                ))}

              {/* Estimate */}
              {task.estimatedMinutes != null && (
                <span className="shrink-0 flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Timer className="h-3 w-3" />~{task.estimatedMinutes}m
                </span>
              )}

              {/* Points (completed only) */}
              {isCompleted && points != null && (
                <span className="shrink-0 text-xs font-medium text-green-600 dark:text-green-400">
                  +{points.toFixed(1)}
                </span>
              )}
            </>
          )}

          {/* Start button (not completed) */}
          {!isCompleted && (
            <div onClick={(e) => e.stopPropagation()}>
              {isActive ? (
                <Button size="sm" variant="ghost" onClick={onPause} className="h-7 w-7 p-0">
                  <Pause className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={onStart} className="h-7 w-7 p-0">
                  <Play className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}

          {/* Expand chevron */}
          {onToggleExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="shrink-0 p-1 hover:bg-accent rounded transition-colors"
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          )}
        </div>

        {/* Row 2: Metadata — below title when expanded */}
        {expanded && (
          <div className="flex items-center gap-2 flex-wrap mt-2 ml-5">
            {/* Difficulty badge */}
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

            {/* Project */}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: projectColor }} />
              {projectName}
            </span>

            {/* External source chip */}
            {extSource &&
              (externalUrl ? (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: extSource.bg, color: extSource.fg }}
                >
                  <extSource.Icon className="h-3 w-3" />
                  {task.externalId ?? extSource.label}
                  <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                </a>
              ) : (
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5"
                  style={{ backgroundColor: extSource.bg, color: extSource.fg }}
                >
                  <extSource.Icon className="h-3 w-3" />
                  {task.externalId ?? extSource.label}
                </span>
              ))}

            {/* Estimate */}
            {task.estimatedMinutes != null && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Timer className="h-3 w-3" />~{task.estimatedMinutes}m
              </span>
            )}

            {/* Points (completed only) */}
            {isCompleted && points != null && (
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                +{points.toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expanded detail — shown when expanded */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t space-y-3">
          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>
          )}

          {/* Progress */}
          {!isCompleted && (
            <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{task.progress}%</span>
              </div>
              {onUpdateProgress ? (
                <Slider
                  value={[task.progress]}
                  onValueChange={([v]) => onUpdateProgress(v)}
                  min={0}
                  max={100}
                  step={5}
                  className="py-1"
                />
              ) : (
                <Progress value={task.progress} className="h-1.5" />
              )}
            </div>
          )}

          {/* Subtasks */}
          {hasSubtasks && (
            <div className="border rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-3 py-2 bg-muted/30 flex items-center gap-2 text-sm font-medium">
                <span>Subtasks</span>
                <span className="text-xs text-muted-foreground">
                  ({completedSubtasks}/{subtasks!.length})
                </span>
              </div>
              <div className="divide-y">
                {subtasks!.map((subtask) => (
                  <div
                    key={subtask.id}
                    className={`flex items-center gap-2 p-2 pl-3 ${
                      onToggleSubtask ? "cursor-pointer hover:bg-muted/50" : ""
                    }`}
                    onClick={() => onToggleSubtask?.(subtask.id)}
                  >
                    <button
                      type="button"
                      className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        subtask.completed
                          ? "bg-green-500 border-green-500"
                          : "border-muted-foreground/30 hover:border-muted-foreground/50"
                      }`}
                    >
                      {subtask.completed && <Check className="h-3 w-3 text-white" />}
                    </button>
                    <span
                      className={`flex-1 min-w-0 text-sm truncate ${
                        subtask.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {timeInfo && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {formatDuration(timeInfo.actual)} / {formatDuration(timeInfo.estimated)}
                </span>
                {timeInfo.isUnder && (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    ({formatDuration(timeInfo.difference)} under)
                  </span>
                )}
              </div>
            )}
            {!timeInfo && task.estimatedMinutes != null && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Est. {formatDuration(task.estimatedMinutes)}
              </div>
            )}
            {task.plannedForDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(task.plannedForDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            )}
          </div>

          {/* Time entry history */}
          {timeEntries && timeEntries.length > 0 && (
            <div onClick={(e) => e.stopPropagation()}>
              <TaskHistory
                timeEntries={timeEntries}
                onUpdateTimeEntry={onUpdateTimeEntry}
                onDeleteTimeEntry={onDeleteTimeEntry}
              />
            </div>
          )}

          {/* Action buttons */}
          {!isCompleted && (
            <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
              {isActive ? (
                <Button size="sm" variant="outline" onClick={onPause}>
                  <Pause className="h-3.5 w-3.5 mr-1.5" />
                  Pause
                </Button>
              ) : (
                <Button size="sm" onClick={onStart}>
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  Start
                </Button>
              )}
              {onOpenDetail && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetail();
                  }}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              )}
              {task.progress >= 80 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  onClick={onComplete}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Complete
                </Button>
              )}
            </div>
          )}

          {/* Points earned */}
          {isCompleted && points != null && (
            <div className="text-sm font-medium text-green-600 dark:text-green-400">
              +{points.toFixed(1)} points earned
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
