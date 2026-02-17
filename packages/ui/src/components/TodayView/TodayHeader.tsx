import { Plus, Calendar } from "lucide-react";
import { Button } from "../../primitives/Button";

export interface TodayHeaderProps {
  /** Formatted date string (e.g., "Friday, February 16") */
  formattedDate: string;
  /** Callback when "New Task" button is clicked */
  onNewTask?: () => void;
}

/**
 * TodayHeader — Header section for the Today view with date and action buttons.
 */
export function TodayHeader({ formattedDate, onNewTask }: TodayHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Today</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formattedDate}
        </p>
      </div>
      <Button size="sm" onClick={onNewTask}>
        <Plus className="mr-1.5 h-4 w-4" />
        New Task
      </Button>
    </div>
  );
}
