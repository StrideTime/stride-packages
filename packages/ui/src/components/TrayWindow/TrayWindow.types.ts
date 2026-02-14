/**
 * Types for the TrayWindow component tree.
 *
 * Entity types, enums, and domain types come directly from @stridetime/types.
 * Only truly composite view models (aggregates of multiple entities that don't
 * exist in the types package) are defined here.
 */
import type {
  FocusSessionType,
  GoalPeriod,
  Habit,
  HabitCompletion,
  HabitStreak,
  ScheduledEvent,
  Task,
  UserStatus,
  Workspace,
} from "@stridetime/types";

// Re-export so consumers don't need a separate @stridetime/types import
export type {
  FocusSessionType,
  GoalPeriod,
  Habit,
  HabitCompletion,
  HabitStreak,
  ScheduledEvent,
  Task,
  UserStatus,
  Workspace,
};

// ─── Joined / augmented types ───────────────────────────────────────

/** Task + joined display fields from project and scheduled event */
export type ScheduledTask = Task & {
  scheduledTime?: string;
  projectName?: string;
  projectColor?: string;
};

/** ScheduledEvent + computed field for display in upcoming-event banners */
export type UpcomingEvent = ScheduledEvent & {
  minutesUntil: number;
};

/**
 * Habit + today's completion state + streak data.
 * Composite of Habit, HabitCompletion, and HabitStreak.
 */
export type HabitView = Pick<
  Habit,
  "id" | "name" | "icon" | "trackingType" | "unit" | "targetCount"
> &
  Pick<HabitStreak, "currentStreak"> &
  Pick<HabitCompletion, "completed" | "value">;

// ─── Aggregate view models (no single entity equivalent) ────────────

export type Goals = {
  pointsCurrent: number;
  pointsTarget: number;
  tasksCurrent: number;
  tasksTarget: number;
};

export type Stats = {
  period: GoalPeriod;
  tasksCompleted: number;
  tasksTarget: number;
  pointsEarned: number;
  pointsTarget: number;
  focusMinutes: number;
  focusTarget: number;
  habitsCompleted: number;
  habitsTotal: number;
};

export type DaySummary = {
  totalMinutes: number;
  tasksCompleted: number;
  tasksTarget: number;
  pointsEarned: number;
  pointsTarget: number;
  focusMinutes: number;
  focusTarget: number;
};

// ─── Component props ─────────────────────────────────────────────

export interface TrayWindowProps {
  activeTab: "focus" | "stats";
  onTabChange: (tab: "focus" | "stats") => void;
  viewState: "fresh" | "idle" | "active" | "stopped" | "upnext" | "clockedout";
  isTimerRunning?: boolean;

  // Active task
  task?: Task;
  sessionSeconds?: number;

  // Pomodoro
  pomodoroEnabled?: boolean;
  sessionType?: FocusSessionType;
  currentCycle?: number;
  totalCycles?: number;
  sessionDurationMinutes?: number;
  remainingSeconds?: number;

  // Upcoming event
  upcomingEvent?: UpcomingEvent;
  onStartEvent?: () => void;

  // Stopped view
  minutesWorked?: number;
  currentProgress?: number;
  subtasks?: Task[];
  /** Why the session stopped — 'event' shows simplified next actions */
  stoppedReason?: "manual" | "event";
  /** Event title shown when stoppedReason='event' */
  nextEventTitle?: string;
  onProgressChange?: (progress: number) => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onCompleteTask?: () => void;
  onStartNextEvent?: () => void;

  // Up next view
  scheduledTasks?: ScheduledTask[];
  recommendedTasks?: Task[];

  // Idle / Fresh
  dailySeconds?: number;
  goals: Goals;
  availableTasks?: Task[];

  // Clocked out
  daySummary?: DaySummary;
  onStartNewDay?: () => void;

  // Stats
  stats: Stats;
  onStatsPeriodChange: (period: GoalPeriod) => void;

  // Habits
  habits: HabitView[];
  habitsEnabled?: boolean;
  onToggleHabit: (habitId: string) => void;
  onUpdateHabitValue: (habitId: string, value: number) => void;
  onUpgrade?: () => void;

  // Workspace
  workspaces: Workspace[];
  selectedWorkspace: Workspace;

  // User status
  userStatus?: UserStatus;
  onStatusChange?: (status: UserStatus) => void;

  // Callbacks
  onWorkspaceChange: (workspace: Workspace) => void;
  onOpenMain: () => void;
  onStopSession: () => void;
  onStartTask: (taskOrId: Task | string) => void;
  onOpenSchedule: () => void;
  onTakeBreak: (minutes: number) => void;
  onClockOut: () => void;
  onViewGoals: () => void;
  onSwitchTask?: () => void;
  onSelectNewTask: () => void;
  onBackToInitial: () => void;
}
