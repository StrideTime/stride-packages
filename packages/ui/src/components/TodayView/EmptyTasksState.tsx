import { Calendar, Plus, CalendarClock } from "lucide-react";
import { Button } from "../../primitives/Button";

export interface EmptyTasksStateProps {
  /** Callback when "Add Task" button is clicked */
  onAddTask?: () => void;
  /** Callback when "Plan Your Day" button is clicked (navigates to schedule) */
  onPlanDay?: () => void;
}

/**
 * EmptyTasksState — Empty state shown when no tasks are planned for today.
 */
export function EmptyTasksState({ onAddTask, onPlanDay }: EmptyTasksStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-lg font-medium">No tasks planned</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Add tasks or plan your schedule to get started
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={onAddTask}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Task
        </Button>
        {onPlanDay && (
          <Button size="sm" variant="outline" onClick={onPlanDay}>
            <CalendarClock className="mr-1.5 h-4 w-4" />
            Plan Your Day
          </Button>
        )}
      </div>
    </div>
  );
}
