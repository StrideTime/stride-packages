import { useState } from "react";
import { Calendar, ListTodo } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../../primitives/Tabs";
import { TodayHeader, type TodayHeaderProps } from "./TodayHeader";
import { TodayStats, type TodayStatsProps } from "./TodayStats";
import { TodaySchedule, type ScheduleEvent } from "./TodaySchedule";
import { ScheduleLink } from "./ScheduleLink";

export type TodayViewMode = "tasks" | "schedule";

export interface TodayViewWithScheduleProps {
  /** Header props */
  header: TodayHeaderProps;
  /** Stats props */
  stats: TodayStatsProps;
  /** Scheduled events for today */
  events?: ScheduleEvent[];
  /** Callback when an event is clicked */
  onEventClick?: (eventId: string) => void;
  /** Callback to navigate to full schedule page */
  onViewFullSchedule?: () => void;
  /** Whether to show schedule tab (default: true if events exist) */
  showScheduleTab?: boolean;
  /** Whether there are any tasks (used to show schedule card when empty) */
  hasTasks?: boolean;
  /** Task list content (render prop) - if using EmptyTasksState, pass onPlanDay to it */
  children: React.ReactNode;
}

/**
 * TodayViewWithSchedule — Layout wrapper that provides task/schedule toggle.
 * Handles the tab switching logic and renders tasks or schedule based on active tab.
 */
export function TodayViewWithSchedule({
  header,
  stats,
  events = [],
  onEventClick,
  onViewFullSchedule,
  showScheduleTab = events.length > 0,
  hasTasks: _hasTasks = true,
  children,
}: TodayViewWithScheduleProps) {
  const [mode, setMode] = useState<TodayViewMode>("tasks");

  return (
    <div className="mx-auto max-w-3xl px-8 py-6">
      {/* Header */}
      <TodayHeader {...header} />

      {/* Stats */}
      <TodayStats {...stats} />

      {/* Tab Toggle (only show if we have schedule data) */}
      {showScheduleTab && (
        <div className="mb-6">
          <Tabs value={mode} onValueChange={(value) => setMode(value as TodayViewMode)}>
            <TabsList>
              <TabsTrigger value="tasks" className="gap-1.5">
                <ListTodo className="h-3.5 w-3.5" />
                Tasks
                {stats.activeTasks > 0 && (
                  <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0 text-[10px] font-medium">
                    {stats.activeTasks}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Schedule
                {events.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0 text-[10px] font-medium">
                    {events.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Tasks Tab */}
      {mode === "tasks" && children}

      {/* Schedule Tab */}
      {mode === "schedule" && (
        <>
          <TodaySchedule events={events} onEventClick={onEventClick} />
          {onViewFullSchedule && (
            <div className="mt-6">
              <ScheduleLink variant="button" onClick={onViewFullSchedule} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
