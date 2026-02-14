import type { GoalPeriod, HabitView, Stats } from "../TrayWindow.types";

export interface TrayStatsViewProps {
  stats: Stats;
  habits: HabitView[];
  /** Whether habit tracking is enabled for the user's plan */
  habitsEnabled?: boolean;
  onStatsPeriodChange: (period: GoalPeriod) => void;
  onToggleHabit: (habitId: string) => void;
  onUpdateHabitValue: (habitId: string, value: number) => void;
  onUpgrade?: () => void;
}
