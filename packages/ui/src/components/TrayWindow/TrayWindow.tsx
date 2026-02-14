import { TrayHeader } from "./TrayHeader";
import {
  TrayFreshView,
  TrayIdleView,
  TrayActiveView,
  TrayStoppedView,
  TrayUpNextView,
  TrayClockedOutView,
} from "./FocusViews";
import { TrayStatsView } from "./StatsView";

import type { TrayWindowProps } from "./TrayWindow.types";

export function TrayWindow({
  activeTab,
  onTabChange,
  viewState,
  isTimerRunning = false,

  task,
  sessionSeconds = 0,

  pomodoroEnabled,
  sessionType,
  currentCycle,
  totalCycles,
  sessionDurationMinutes,
  remainingSeconds,

  upcomingEvent,
  onStartEvent,

  minutesWorked = 0,
  currentProgress = 0,
  subtasks,
  stoppedReason = "manual",
  nextEventTitle,
  onProgressChange,
  onToggleSubtask,
  onCompleteTask,
  onStartNextEvent,

  scheduledTasks = [],
  recommendedTasks = [],

  dailySeconds = 0,
  goals,
  availableTasks = [],

  daySummary,
  onStartNewDay,

  stats,
  onStatsPeriodChange,

  habits,
  habitsEnabled,
  onToggleHabit,
  onUpdateHabitValue,
  onUpgrade,

  workspaces,
  selectedWorkspace,

  userStatus,
  onStatusChange,

  onWorkspaceChange,
  onOpenMain,
  onStopSession,
  onStartTask,
  onOpenSchedule,
  onTakeBreak,
  onClockOut,
  onViewGoals,
  onSwitchTask,
  onSelectNewTask,
  onBackToInitial,
}: TrayWindowProps) {
  const isActiveOrRunning = viewState === "active" && isTimerRunning;

  return (
    <div className="w-full h-full bg-background flex flex-col">
      <TrayHeader
        activeTab={activeTab}
        onTabChange={onTabChange}
        isTimerRunning={isActiveOrRunning}
        workspaces={workspaces}
        selectedWorkspace={selectedWorkspace}
        onWorkspaceChange={onWorkspaceChange}
        onOpenMain={onOpenMain}
        userStatus={userStatus}
        onStatusChange={onStatusChange}
      />

      {activeTab === "stats" ? (
        <TrayStatsView
          stats={stats}
          habits={habits}
          habitsEnabled={habitsEnabled}
          onStatsPeriodChange={onStatsPeriodChange}
          onToggleHabit={onToggleHabit}
          onUpdateHabitValue={onUpdateHabitValue}
          onUpgrade={onUpgrade}
        />
      ) : viewState === "fresh" ? (
        <TrayFreshView
          goals={goals}
          availableTasks={availableTasks}
          scheduledTasks={scheduledTasks}
          onStartTask={(t) => onStartTask(t)}
          onOpenSchedule={onOpenSchedule}
          onViewGoals={onViewGoals}
          onOpenMain={onOpenMain}
        />
      ) : viewState === "active" && task ? (
        <TrayActiveView
          task={task}
          sessionSeconds={sessionSeconds}
          onStopSession={onStopSession}
          pomodoroEnabled={pomodoroEnabled}
          sessionType={sessionType}
          currentCycle={currentCycle}
          totalCycles={totalCycles}
          sessionDurationMinutes={sessionDurationMinutes}
          remainingSeconds={remainingSeconds}
          onSwitchTask={onSwitchTask}
          upcomingEvent={upcomingEvent}
          onStartEvent={onStartEvent}
        />
      ) : viewState === "stopped" ? (
        <TrayStoppedView
          taskTitle={task?.title ?? ""}
          minutesWorked={minutesWorked}
          currentProgress={currentProgress}
          subtasks={subtasks}
          reason={stoppedReason}
          nextEventTitle={nextEventTitle}
          upcomingEvent={upcomingEvent}
          onProgressChange={onProgressChange ?? (() => {})}
          onToggleSubtask={onToggleSubtask}
          onCompleteTask={onCompleteTask}
          onSelectNewTask={onSelectNewTask}
          onStartNextEvent={onStartNextEvent}
          onStartEvent={onStartEvent}
          onTakeBreak={onTakeBreak}
          onClockOut={onClockOut}
        />
      ) : viewState === "upnext" ? (
        <TrayUpNextView
          scheduledTasks={scheduledTasks}
          recommendedTasks={recommendedTasks}
          onStartTask={(id) => onStartTask(id)}
          onOpenSchedule={onOpenSchedule}
          onBack={onBackToInitial}
        />
      ) : viewState === "clockedout" && daySummary ? (
        <TrayClockedOutView
          summary={daySummary}
          onStartNewDay={onStartNewDay ?? (() => {})}
          onOpenMain={onOpenMain}
        />
      ) : (
        <TrayIdleView
          dailySeconds={dailySeconds}
          goals={goals}
          availableTasks={availableTasks}
          onStartTask={(t) => onStartTask(t)}
          onTakeBreak={onTakeBreak}
          onClockOut={onClockOut}
          onOpenMain={onOpenMain}
        />
      )}
    </div>
  );
}
