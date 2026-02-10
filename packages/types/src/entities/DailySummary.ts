export type DailySummary = {
  id: string;
  userId: string;
  date: string;
  tasksCompleted: number;
  tasksWorkedOn: number;
  totalPoints: number;
  focusMinutes: number;
  efficiencyRating: number;
  standoutMoment: string | null;
};
