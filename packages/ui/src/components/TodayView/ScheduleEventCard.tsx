import { Calendar, Video, Coffee, Focus, MoreHorizontal } from "lucide-react";
import { Badge } from "../../primitives/Badge";
import { formatClockTime } from "../shared";
import type { ScheduledEventType } from "@stridetime/types";

export interface ScheduleEventCardProps {
  /** Event label/title */
  label: string;
  /** Event type (TASK, MEETING, BREAK, FOCUS, OTHER) */
  type: ScheduledEventType;
  /** Start time as ISO string */
  startTime: string;
  /** Duration in minutes */
  durationMinutes: number;
  /** Optional task name if linked to a task */
  taskTitle?: string;
  /** Optional project info if linked to a task */
  projectName?: string;
  projectColor?: string;
  /** Whether this event is currently happening */
  isActive?: boolean;
  /** Whether this event is in the past */
  isPast?: boolean;
  /** External source (Google Calendar, Outlook, etc.) */
  externalSource?: string | null;
  /** Callback when event is clicked */
  onClick?: () => void;
}

const eventTypeConfig = {
  TASK: { icon: Calendar, color: "#3b82f6", label: "Task" },
  MEETING: { icon: Video, color: "#8b5cf6", label: "Meeting" },
  BREAK: { icon: Coffee, color: "#10b981", label: "Break" },
  FOCUS: { icon: Focus, color: "#f59e0b", label: "Focus" },
  OTHER: { icon: MoreHorizontal, color: "#6b7280", label: "Event" },
};

/**
 * ScheduleEventCard — Individual event in the daily schedule view.
 * Shows time, duration, type, and optional task/project linkage.
 */
export function ScheduleEventCard({
  label,
  type,
  startTime,
  durationMinutes,
  taskTitle,
  projectName,
  projectColor,
  isActive = false,
  isPast: _isPast = false,
  externalSource,
  onClick: _onClick,
}: ScheduleEventCardProps) {
  const config = eventTypeConfig[type] || eventTypeConfig.OTHER;
  const Icon = config.icon;
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  return (
    <div
      className={`
        flex gap-3 rounded-lg border p-3
        ${isActive ? "border-2 bg-accent" : "border"}
      `}
      style={
        isActive
          ? {
              borderColor: config.color,
              boxShadow: `0 0 0 1px ${config.color}20`,
            }
          : undefined
      }
    >
      {/* Time column */}
      <div className="flex flex-col items-center justify-center gap-1 text-sm text-muted-foreground w-[65px] shrink-0">
        <div className="font-semibold text-foreground">{formatClockTime(startDate)}</div>
        <div className="text-xs text-muted-foreground/70">{durationMinutes}m</div>
        <div className="text-xs text-muted-foreground/70">{formatClockTime(endDate)}</div>
      </div>

      {/* Type indicator */}
      <div className="flex flex-col items-center gap-1.5 shrink-0 self-start">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color: config.color }} />
        </div>
        <Badge
          variant="secondary"
          style={{
            backgroundColor: `${config.color}15`,
            color: config.color,
            borderColor: `${config.color}30`,
          }}
          className="text-[10px] px-1.5 py-0.5 font-semibold border"
        >
          {config.label}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm truncate">{label}</h4>
          {isActive && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              Now
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {projectName && (
            <Badge
              variant="outline"
              style={
                projectColor
                  ? {
                      borderColor: projectColor,
                      color: projectColor,
                    }
                  : undefined
              }
              className="text-[10px] px-1.5 py-0"
            >
              {projectName}
            </Badge>
          )}

          {externalSource && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {externalSource}
            </Badge>
          )}

          {taskTitle && (
            <span className="text-xs text-muted-foreground truncate">→ {taskTitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}
