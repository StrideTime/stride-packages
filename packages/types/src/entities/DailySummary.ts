export type DailySummary = {
  id: string;
  userId: string;
  date: string;
  tasksCompleted: number;
  tasksWorkedOn: number;
  totalPoints: number;
  focusMinutes: number;
  breakMinutes: number;
  workSessionCount: number;
  efficiencyRating: number;
  standoutMoment: string | null;
  clockInTime: string | null;
  clockOutTime: string | null;
  createdAt: string;
};
