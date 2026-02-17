// Shared utilities
export {
  type DifficultyLevel,
  difficultyConfig,
  getDifficultyClasses,
  formatDuration,
  formatTime,
  formatTimerDisplay,
  formatClockTime,
} from "./shared";

// Components
export {
  TaskCard,
  TaskDetailModal,
  TaskHistory,
  type TaskCardProps,
  type TaskDetailModalProps,
  type SubtaskItem,
  type ProjectOption,
  type TeamMember,
  type AssignmentPolicy,
} from "./TaskCard";
export {
  HabitCard,
  HabitEditModal,
  HabitHistory,
  type HabitCardProps,
  type HabitCompletionDay,
  type HabitEditModalProps,
  type HabitFormData,
} from "./HabitCard";
export { IconPicker, type IconPickerProps, type IconValue } from "./IconPicker";
export { TimerDisplay } from "./TimerDisplay";
export { QuickAddTask, type DraftTask } from "./QuickAddTask";
export { TrayWindow, ProgressBar } from "./TrayWindow";
export { SplashScreen, type SplashScreenProps } from "./SplashScreen";
export {
  ActiveTimerBanner,
  TodayHeader,
  TodayStats,
  TaskSection,
  EmptyTasksState,
  ScheduleEventCard,
  TodaySchedule,
  ScheduleLink,
  EventDetailPopover,
  TodayViewWithSchedule,
  type ActiveTimerBannerProps,
  type TodayHeaderProps,
  type TodayStatsProps,
  type TaskSectionProps,
  type EmptyTasksStateProps,
  type ScheduleEventCardProps,
  type TodayScheduleProps,
  type ScheduleEvent,
  type ScheduleLinkProps,
  type EventDetailPopoverProps,
  type TodayViewWithScheduleProps,
  type TodayViewMode,
} from "./TodayView";
