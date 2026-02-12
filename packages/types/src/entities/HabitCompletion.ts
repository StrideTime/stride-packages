export type HabitCompletion = {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
  value: number | null;
  completedAt: string | null;
  notes: string | null;
  mood: number | null;
};
