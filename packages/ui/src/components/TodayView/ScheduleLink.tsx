import { Calendar, ChevronRight } from "lucide-react";
import { Button } from "../../primitives/Button";
import { Card } from "../../primitives/Card";

export interface ScheduleLinkProps {
  /** Number of events scheduled today */
  eventCount?: number;
  /** Callback when the link is clicked */
  onClick?: () => void;
  /** Link variant: 'card' | 'button' | 'inline' */
  variant?: "card" | "button" | "inline";
}

/**
 * ScheduleLink — Prompts users to view their full schedule/calendar.
 * Links from Today page to the Schedule (Weekly/Daily Planner) page.
 */
export function ScheduleLink({ eventCount, onClick, variant = "card" }: ScheduleLinkProps) {
  if (variant === "button") {
    return (
      <Button variant="outline" onClick={onClick} className="w-full">
        <Calendar className="mr-2 h-4 w-4" />
        View Schedule
        {eventCount !== undefined && eventCount > 0 && (
          <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium">
            {eventCount}
          </span>
        )}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    );
  }

  if (variant === "inline") {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed p-3
          text-sm transition-colors hover:border-solid hover:bg-accent"
      >
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-left">View full schedule</span>
        {eventCount !== undefined && eventCount > 0 && (
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium">
            {eventCount} events
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  // Default: card variant
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Calendar className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1">
          <h3 className="font-medium">View Your Schedule</h3>
          <p className="text-sm text-muted-foreground">
            {eventCount !== undefined && eventCount > 0
              ? `${eventCount} event${eventCount === 1 ? "" : "s"} scheduled today`
              : "Plan your week with time blocking"}
          </p>
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </Card>
  );
}
