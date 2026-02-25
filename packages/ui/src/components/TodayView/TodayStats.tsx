import { Badge } from "../../primitives/Badge";
import { Target, CheckCircle2, Clock } from "lucide-react";

export interface TodayStatsProps {
  /** Number of active (not completed) tasks */
  activeTasks: number;
  /** Number of completed tasks */
  completedTasks: number;
  /** Total minutes tracked today (optional) */
  minutesTracked?: number;
}

/**
 * TodayStats — Quick stats badges showing task counts and time tracked.
 */
export function TodayStats({ activeTasks, completedTasks, minutesTracked }: TodayStatsProps) {
  const formatMinutes = (mins: number): string => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
  };

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <Badge variant="secondary" className="px-3 py-1.5 gap-1.5">
        <Target className="h-3.5 w-3.5" />
        {activeTasks} planned
      </Badge>

      <Badge variant={completedTasks > 0 ? "default" : "outline"} className="px-3 py-1.5 gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {completedTasks} completed
      </Badge>

      {minutesTracked !== undefined && (
        <Badge variant="outline" className="px-3 py-1.5 gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {formatMinutes(minutesTracked)} tracked
        </Badge>
      )}
    </div>
  );
}
