import { Clock, Calendar, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../primitives/Popover";
import { Button } from "../../primitives/Button";
import { Badge } from "../../primitives/Badge";
import { Separator } from "../../primitives/Separator";
import { formatClockTime } from "../shared";
import type { ScheduledEventType } from "@stridetime/types";

export interface EventDetailPopoverProps {
  /** Event label/title */
  label: string;
  /** Event type */
  type: ScheduledEventType;
  /** Start time as ISO string */
  startTime: string;
  /** Duration in minutes */
  durationMinutes: number;
  /** Optional description */
  description?: string;
  /** Optional task link */
  taskTitle?: string;
  onTaskClick?: () => void;
  /** Optional project info */
  projectName?: string;
  projectColor?: string;
  /** External source */
  externalSource?: string | null;
  externalUrl?: string | null;
  /** Actions */
  onEdit?: () => void;
  onDelete?: () => void;
  /** Control popover state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Trigger element */
  children: React.ReactNode;
}

const eventTypeConfig = {
  TASK: { label: "Task", color: "#3b82f6" },
  MEETING: { label: "Meeting", color: "#8b5cf6" },
  BREAK: { label: "Break", color: "#10b981" },
  FOCUS: { label: "Focus", color: "#f59e0b" },
  OTHER: { label: "Event", color: "#6b7280" },
};

/**
 * EventDetailPopover — Shows event details in a popover when clicked.
 * Displays time, description, linked task, and actions (edit/delete).
 */
export function EventDetailPopover({
  label,
  type,
  startTime,
  durationMinutes,
  description,
  taskTitle,
  onTaskClick,
  projectName,
  projectColor,
  externalSource,
  externalUrl,
  onEdit,
  onDelete,
  open,
  onOpenChange,
  children,
}: EventDetailPopoverProps) {
  const config = eventTypeConfig[type] || eventTypeConfig.OTHER;
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          {/* Header */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: `${config.color}15`,
                  color: config.color,
                  borderColor: `${config.color}30`,
                }}
                className="text-xs px-2 py-0.5 font-semibold border"
              >
                {config.label}
              </Badge>
              {externalSource && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {externalSource}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base">{label}</h3>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {formatClockTime(startDate)} - {formatClockTime(endDate)}
            </span>
            <span className="text-xs">({durationMinutes}m)</span>
          </div>

          {/* Project */}
          {projectName && (
            <div className="flex items-center gap-2 text-sm">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: projectColor }} />
              <span>{projectName}</span>
            </div>
          )}

          {/* Linked Task */}
          {taskTitle && (
            <div>
              <Separator className="mb-2" />
              <button
                onClick={onTaskClick}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Calendar className="h-4 w-4" />
                <span>{taskTitle}</span>
              </button>
            </div>
          )}

          {/* Description */}
          {description && (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground">{description}</p>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex items-center gap-2">
            {externalUrl && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(externalUrl, "_blank")}
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Open
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
