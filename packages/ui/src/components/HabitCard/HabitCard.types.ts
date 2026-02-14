import type { TrackingType } from "@stridetime/types";

export interface HabitCardProps {
  // From Habit
  name: string;
  description: string | null;
  icon: string;
  trackingType: TrackingType;
  unit: string | null;
  targetCount: number | null;

  // From HabitCompletion
  completed: boolean;
  value: number | null;

  // From HabitStreak
  currentStreak: number;
  longestStreak?: number;

  // Computed
  completionRate?: number;

  // Callbacks
  onToggle?: () => void;
  onValueUpdate?: (value: number) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
