import { Calendar, Clock } from "lucide-react";
import { ScheduleEventCard } from "./ScheduleEventCard";
import type { ScheduledEventType } from "@stridetime/types";

export interface ScheduleEvent {
  id: string;
  label: string;
  type: ScheduledEventType;
  startTime: string;
  durationMinutes: number;
  taskTitle?: string;
  projectName?: string;
  projectColor?: string;
  externalSource?: string | null;
}

export interface TodayScheduleProps {
  /** List of scheduled events for today */
  events: ScheduleEvent[];
  /** Callback when an event is clicked */
  onEventClick?: (eventId: string) => void;
  /** Whether to show past events (default: true) */
  showPastEvents?: boolean;
}

/**
 * TodaySchedule — Chronological list of scheduled events for today.
 * Shows events in time order with current/past indicators.
 */
export function TodaySchedule({ events, onEventClick, showPastEvents = true }: TodayScheduleProps) {
  const now = new Date();

  // Sort events by start time
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Determine if each event is active or past
  const eventsWithStatus = sortedEvents.map((event) => {
    const startTime = new Date(event.startTime);
    const endTime = new Date(startTime.getTime() + event.durationMinutes * 60 * 1000);
    const isActive = now >= startTime && now <= endTime;
    const isPast = now > endTime;
    return { ...event, isActive, isPast };
  });

  const visibleEvents = showPastEvents
    ? eventsWithStatus
    : eventsWithStatus.filter((e) => !e.isPast);

  if (visibleEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 rounded-full bg-muted p-3">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-sm font-medium">No events scheduled</h3>
        <p className="text-xs text-muted-foreground">
          {showPastEvents ? "Your schedule is clear for today" : "No upcoming events today"}
        </p>
      </div>
    );
  }

  // Group events by time period (morning, afternoon, evening)
  const morning = visibleEvents.filter((e) => {
    const hour = new Date(e.startTime).getHours();
    return hour < 12;
  });
  const afternoon = visibleEvents.filter((e) => {
    const hour = new Date(e.startTime).getHours();
    return hour >= 12 && hour < 17;
  });
  const evening = visibleEvents.filter((e) => {
    const hour = new Date(e.startTime).getHours();
    return hour >= 17;
  });

  const renderGroup = (title: string, events: typeof visibleEvents) => {
    if (events.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3 w-3" />
          {title}
        </div>
        <div className="space-y-2">
          {events.map((event) => (
            <ScheduleEventCard
              key={event.id}
              label={event.label}
              type={event.type}
              startTime={event.startTime}
              durationMinutes={event.durationMinutes}
              taskTitle={event.taskTitle}
              projectName={event.projectName}
              projectColor={event.projectColor}
              externalSource={event.externalSource}
              isActive={event.isActive}
              isPast={event.isPast}
              onClick={onEventClick ? () => onEventClick(event.id) : undefined}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderGroup("Morning", morning)}
      {renderGroup("Afternoon", afternoon)}
      {renderGroup("Evening", evening)}
    </div>
  );
}
