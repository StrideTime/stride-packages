import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useState, useEffect, useCallback } from "react";
import type { Task, Workspace, ScheduledEvent, UserStatus } from "@stridetime/types";
import { TrayWindow } from "./TrayWindow";
import type { TrayWindowProps, ScheduledTask, UpcomingEvent } from "./TrayWindow.types";

// ─── Helpers ──────────────────────────────────────────────
const ts = new Date().toISOString();

/** Build a full Task object with sensible defaults, overriding selected fields. */
function mockTask(overrides: Partial<Task> & Pick<Task, "id" | "title">): Task {
  return {
    userId: "user-1",
    projectId: "proj-1",
    parentTaskId: null,
    description: null,
    difficulty: "MEDIUM",
    priority: "NONE",
    progress: 0,
    status: "PLANNED",
    assigneeUserId: null,
    teamId: null,
    estimatedMinutes: null,
    maxMinutes: null,
    actualMinutes: 0,
    plannedForDate: null,
    dueDate: null,
    taskTypeId: null,
    displayOrder: 0,
    tags: null,
    externalId: null,
    externalSource: null,
    completedAt: null,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
    ...overrides,
  };
}

/** Build a full ScheduledEvent with sensible defaults. */
function mockEvent(
  overrides: Partial<ScheduledEvent> & Pick<ScheduledEvent, "id" | "label">
): ScheduledEvent {
  return {
    taskId: null,
    userId: "user-1",
    startTime: ts,
    durationMinutes: 30,
    type: "MEETING",
    externalId: null,
    externalSource: null,
    metadata: null,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
    ...overrides,
  };
}

// ─── Mock data ─────────────────────────────────────────────

const mockWorkspaces: Workspace[] = [
  {
    id: "ws_1",
    ownerUserId: "user-1",
    name: "Personal",
    description: null,
    icon: null,
    type: "PERSONAL",
    color: "#3b82f6",
    timezone: "America/New_York",
    weekStartsOn: 0,
    defaultProjectId: null,
    defaultTeamId: null,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
  },
  {
    id: "ws_2",
    ownerUserId: "user-1",
    name: "Acme Corp",
    description: null,
    icon: null,
    type: "TEAM",
    color: "#8b5cf6",
    timezone: "America/New_York",
    weekStartsOn: 1,
    defaultProjectId: null,
    defaultTeamId: null,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
  },
  {
    id: "ws_3",
    ownerUserId: "user-1",
    name: "Side Projects",
    description: null,
    icon: null,
    type: "PERSONAL",
    color: "#10b981",
    timezone: "America/New_York",
    weekStartsOn: 0,
    defaultProjectId: null,
    defaultTeamId: null,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
  },
];

const mockTasks: Task[] = [
  mockTask({
    id: "1",
    title: "Fix critical bug in production",
    difficulty: "HARD",
    priority: "CRITICAL",
    estimatedMinutes: 90,
    maxMinutes: 120,
  }),
  mockTask({
    id: "2",
    title: "Prepare client presentation",
    difficulty: "MEDIUM",
    priority: "HIGH",
    estimatedMinutes: 60,
  }),
  mockTask({
    id: "3",
    title: "Review pull requests",
    difficulty: "EASY",
    priority: "HIGH",
    estimatedMinutes: 30,
    maxMinutes: 45,
  }),
];

const mockScheduledTasks: ScheduledTask[] = [
  {
    ...mockTask({
      id: "s1",
      title: "Daily standup sync",
      difficulty: "TRIVIAL",
      estimatedMinutes: 15,
    }),
    scheduledTime: "9:00 AM",
    projectName: "Stride App",
    projectColor: "#8b5cf6",
  },
  {
    ...mockTask({
      id: "s2",
      title: "Fix critical bug in production",
      difficulty: "HARD",
      priority: "CRITICAL",
      estimatedMinutes: 90,
    }),
    scheduledTime: "9:30 AM",
    projectName: "Stride App",
    projectColor: "#8b5cf6",
  },
  {
    ...mockTask({
      id: "s3",
      title: "Design review with team",
      difficulty: "MEDIUM",
      estimatedMinutes: 45,
    }),
    scheduledTime: "11:00 AM",
    projectName: "Side Project",
    projectColor: "#10b981",
  },
  {
    ...mockTask({
      id: "s4",
      title: "Write API documentation",
      difficulty: "EASY",
      estimatedMinutes: 60,
    }),
    scheduledTime: "1:00 PM",
  },
];

const mockRecommendedTasks: Task[] = [
  mockTask({
    id: "r1",
    title: "Refactor auth middleware",
    difficulty: "HARD",
    priority: "HIGH",
    estimatedMinutes: 120,
    dueDate: "2026-02-15",
    progress: 30,
  }),
  mockTask({
    id: "r2",
    title: "Add error boundaries",
    difficulty: "MEDIUM",
    estimatedMinutes: 45,
    dueDate: "2026-02-18",
  }),
  mockTask({
    id: "r3",
    title: "Update dependencies",
    difficulty: "EASY",
    estimatedMinutes: 30,
    progress: 50,
  }),
];

const mockSubtasks: Task[] = [
  mockTask({
    id: "sub1",
    title: "Set up auth provider",
    parentTaskId: "task_1",
    status: "COMPLETED",
    difficulty: "EASY",
    estimatedMinutes: 20,
    completedAt: ts,
  }),
  mockTask({
    id: "sub2",
    title: "Create login form",
    parentTaskId: "task_1",
    status: "COMPLETED",
    difficulty: "EASY",
    estimatedMinutes: 15,
    completedAt: ts,
  }),
  mockTask({
    id: "sub3",
    title: "Implement token refresh",
    parentTaskId: "task_1",
    status: "PLANNED",
    difficulty: "MEDIUM",
    estimatedMinutes: 45,
  }),
  mockTask({
    id: "sub4",
    title: "Add protected routes",
    parentTaskId: "task_1",
    status: "PLANNED",
    difficulty: "MEDIUM",
    estimatedMinutes: 30,
  }),
];

const mockHabits = [
  {
    id: "h1",
    name: "Morning Exercise",
    icon: "\uD83C\uDFC3",
    trackingType: "COMPLETED" as const,
    unit: null,
    targetCount: null,
    completed: false,
    value: null,
    currentStreak: 5,
  },
  {
    id: "h2",
    name: "Drink water",
    icon: "\uD83D\uDCA7",
    trackingType: "COUNTER" as const,
    unit: "glasses",
    targetCount: 8,
    completed: false,
    value: 3,
    currentStreak: 12,
  },
  {
    id: "h3",
    name: "Read 20 min",
    icon: "\uD83D\uDCDA",
    trackingType: "COMPLETED" as const,
    unit: null,
    targetCount: null,
    completed: true,
    value: null,
    currentStreak: 28,
  },
];

const baseCallbacks = {
  onWorkspaceChange: fn(),
  onOpenMain: fn(),
  onStopSession: fn(),
  onStartTask: fn(),
  onOpenSchedule: fn(),
  onTakeBreak: fn(),
  onClockOut: fn(),
  onViewGoals: fn(),
  onTabChange: fn(),
  onStatsPeriodChange: fn(),
  onToggleHabit: fn(),
  onUpdateHabitValue: fn(),
  onStartEvent: fn(),
  onStatusChange: fn(),
  onProgressChange: fn(),
  onToggleSubtask: fn(),
  onSwitchTask: fn(),
  onSelectNewTask: fn(),
  onBackToInitial: fn(),
  onCompleteTask: fn(),
  onStartNextEvent: fn(),
  onStartNewDay: fn(),
  onUpgrade: fn(),
};

const sharedArgs = {
  workspaces: mockWorkspaces,
  selectedWorkspace: mockWorkspaces[0],
  goals: { pointsCurrent: 4.5, pointsTarget: 12, tasksCurrent: 3, tasksTarget: 8 },
  stats: {
    period: "DAILY" as const,
    tasksCompleted: 3,
    tasksTarget: 8,
    pointsEarned: 4.5,
    pointsTarget: 12,
    focusMinutes: 145,
    focusTarget: 360,
    habitsCompleted: 1,
    habitsTotal: 3,
  },
  habits: mockHabits,
  habitsEnabled: true,
  availableTasks: mockTasks,
  scheduledTasks: mockScheduledTasks,
  recommendedTasks: mockRecommendedTasks,
  userStatus: "ONLINE" as UserStatus,
  daySummary: {
    totalMinutes: 385,
    tasksCompleted: 6,
    tasksTarget: 8,
    pointsEarned: 9.5,
    pointsTarget: 12,
    focusMinutes: 310,
    focusTarget: 360,
  },
  ...baseCallbacks,
};

// ─── Meta ──────────────────────────────────────────────────

const meta: Meta<typeof TrayWindow> = {
  title: "Components/TrayWindow",
  component: TrayWindow,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "360px",
          height: "640px",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    // ── Core ────────────────────────────────────────────
    activeTab: { control: "radio", options: ["focus", "stats"] },
    viewState: {
      control: "radio",
      options: ["fresh", "idle", "active", "stopped", "upnext", "clockedout"],
    },
    isTimerRunning: { control: "boolean" },
    userStatus: {
      control: "radio",
      options: ["ONLINE", "AWAY", "BUSY", "OFFLINE"],
    },
    habitsEnabled: { control: "boolean" },

    // ── Pomodoro ────────────────────────────────────────
    pomodoroEnabled: { control: "boolean" },
    sessionType: {
      control: "radio",
      options: ["FOCUS", "SHORT_BREAK", "LONG_BREAK"],
      if: { arg: "pomodoroEnabled" },
    },
    currentCycle: {
      control: { type: "range", min: 1, max: 8, step: 1 },
      if: { arg: "pomodoroEnabled" },
    },
    totalCycles: {
      control: { type: "range", min: 2, max: 8, step: 1 },
      if: { arg: "pomodoroEnabled" },
    },
    remainingSeconds: {
      control: { type: "range", min: 0, max: 3600, step: 30 },
      if: { arg: "pomodoroEnabled" },
    },

    // ── Timer ───────────────────────────────────────────
    sessionDurationMinutes: {
      control: { type: "range", min: 5, max: 120, step: 5 },
    },
    sessionSeconds: {
      control: { type: "range", min: 0, max: 7200, step: 60 },
    },
    dailySeconds: {
      control: { type: "range", min: 0, max: 36000, step: 600 },
    },

    // ── Stopped ─────────────────────────────────────────
    minutesWorked: {
      control: { type: "range", min: 0, max: 120, step: 5 },
    },
    currentProgress: {
      control: { type: "range", min: 0, max: 100, step: 5 },
    },
    stoppedReason: { control: "radio", options: ["manual", "event"] },
    nextEventTitle: { control: "text" },

    // ── Hide complex objects & callbacks from controls panel ──
    task: { table: { disable: true } },
    goals: { table: { disable: true } },
    stats: { table: { disable: true } },
    habits: { table: { disable: true } },
    workspaces: { table: { disable: true } },
    selectedWorkspace: { table: { disable: true } },
    availableTasks: { table: { disable: true } },
    scheduledTasks: { table: { disable: true } },
    recommendedTasks: { table: { disable: true } },
    subtasks: { table: { disable: true } },
    upcomingEvent: { table: { disable: true } },
    daySummary: { table: { disable: true } },
    onTabChange: { table: { disable: true } },
    onWorkspaceChange: { table: { disable: true } },
    onOpenMain: { table: { disable: true } },
    onStopSession: { table: { disable: true } },
    onStartTask: { table: { disable: true } },
    onOpenSchedule: { table: { disable: true } },
    onTakeBreak: { table: { disable: true } },
    onClockOut: { table: { disable: true } },
    onViewGoals: { table: { disable: true } },
    onStatsPeriodChange: { table: { disable: true } },
    onToggleHabit: { table: { disable: true } },
    onUpdateHabitValue: { table: { disable: true } },
    onStartEvent: { table: { disable: true } },
    onStatusChange: { table: { disable: true } },
    onProgressChange: { table: { disable: true } },
    onToggleSubtask: { table: { disable: true } },
    onSwitchTask: { table: { disable: true } },
    onSelectNewTask: { table: { disable: true } },
    onBackToInitial: { table: { disable: true } },
    onCompleteTask: { table: { disable: true } },
    onStartNextEvent: { table: { disable: true } },
    onStartNewDay: { table: { disable: true } },
    onUpgrade: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof TrayWindow>;

// ─── Focus Tab ──────────────────────────────────────────────

export const FocusTab: Story = {
  args: {
    ...sharedArgs,
    activeTab: "focus",
    viewState: "fresh",
  },
};

// ─── Active Session ─────────────────────────────────────────

type ActiveArgs = {
  "task.title": string;
  "task.difficulty": Task["difficulty"];
  "task.dueDate": string;
  "task.estimatedMinutes": number;
  "task.maxMinutes": number;
  showUpcomingEvent: boolean;
  [key: string]: unknown;
};

export const ActiveSession: StoryObj<ActiveArgs> = {
  argTypes: {
    "task.title": { control: "text", name: "Task Title" },
    "task.difficulty": {
      control: "radio",
      options: ["TRIVIAL", "EASY", "MEDIUM", "HARD", "EXTREME"],
      name: "Difficulty",
    },
    "task.dueDate": { control: "text", name: "Due Date" },
    "task.estimatedMinutes": {
      control: { type: "range", min: 0, max: 180, step: 5 },
      name: "Estimated Minutes",
      description: "0 = no estimate",
    },
    "task.maxMinutes": {
      control: { type: "range", min: 0, max: 180, step: 5 },
      name: "Max Minutes (time limit)",
      description: "0 = no limit",
    },
    showUpcomingEvent: {
      control: "boolean",
      name: "Show Upcoming Event",
    },
  },
  args: {
    ...sharedArgs,
    activeTab: "focus",
    viewState: "active",
    isTimerRunning: true,
    sessionSeconds: 2145,
    sessionDurationMinutes: 120,
    "task.title": "Design system tray UI",
    "task.difficulty": "MEDIUM",
    "task.dueDate": "2026-02-14",
    "task.estimatedMinutes": 60,
    "task.maxMinutes": 90,
    showUpcomingEvent: false,
  } as ActiveArgs,
  render: (args: ActiveArgs) => {
    const {
      "task.title": title,
      "task.difficulty": difficulty,
      "task.dueDate": dueDate,
      "task.estimatedMinutes": estimatedMinutes,
      "task.maxMinutes": maxMinutes,
      showUpcomingEvent,
      ...rest
    } = args;
    return (
      <TrayWindow
        {...(rest as unknown as TrayWindowProps)}
        task={mockTask({
          id: "task_1",
          title,
          difficulty,
          priority: "NONE",
          dueDate: dueDate || null,
          estimatedMinutes: estimatedMinutes || null,
          maxMinutes: maxMinutes || null,
          progress: 35,
        })}
        upcomingEvent={
          showUpcomingEvent
            ? {
                ...mockEvent({ id: "evt_1", label: "Sprint Planning Meeting" }),
                startTime: "2:00 PM",
                minutesUntil: 12,
              }
            : undefined
        }
      />
    );
  },
};

// ─── Session Stopped ────────────────────────────────────────

const stoppedUpcomingEvent: UpcomingEvent = {
  ...mockEvent({ id: "evt_1", label: "Sprint Planning Meeting" }),
  startTime: "2:00 PM",
  minutesUntil: 12,
};

export const SessionStopped: Story = {
  args: {
    ...sharedArgs,
    activeTab: "focus",
    viewState: "stopped",
    task: mockTask({
      id: "task_1",
      title: "Implement authentication flow",
      difficulty: "HARD",
      priority: "HIGH",
      estimatedMinutes: 90,
      progress: 50,
    }),
    minutesWorked: 25,
    currentProgress: 50,
    subtasks: mockSubtasks,
    stoppedReason: "manual",
    nextEventTitle: "Sprint Planning Meeting",
    upcomingEvent: stoppedUpcomingEvent,
  },
};

// ─── Clocked Out ────────────────────────────────────────────

export const ClockedOut: Story = {
  args: {
    ...sharedArgs,
    activeTab: "focus",
    viewState: "clockedout",
  },
};

// ─── Stats Tab ──────────────────────────────────────────────

export const StatsTab: Story = {
  args: {
    ...sharedArgs,
    activeTab: "stats",
    viewState: "idle",
  },
};

// ─── Stats (Free Tier) ──────────────────────────────────────

export const StatsFreeTier: Story = {
  args: {
    ...sharedArgs,
    activeTab: "stats",
    viewState: "idle",
    habitsEnabled: false,
  },
};

// ─── Interactive Playground ─────────────────────────────────

type ViewState = "fresh" | "idle" | "active" | "stopped" | "upnext" | "clockedout";
type ActiveTab = "focus" | "stats";

const playgroundUpcomingEvent: UpcomingEvent = {
  ...mockEvent({ id: "evt_1", label: "Sprint Planning Meeting" }),
  startTime: "2:00 PM",
  minutesUntil: 12,
};

function PlaygroundWrapper() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("focus");
  const [viewState, setViewState] = useState<ViewState>("fresh");
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userStatus, setUserStatus] = useState<UserStatus>("ONLINE");
  const [stoppedReason, setStoppedReason] = useState<"manual" | "event">("manual");
  const [subtaskState, setSubtaskState] = useState<Task[]>(mockSubtasks.map((st) => ({ ...st })));

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStartTask = useCallback(
    (taskOrId: Task | string) => {
      const task =
        typeof taskOrId === "string"
          ? (mockTasks.find((t) => t.id === taskOrId) ??
            mockScheduledTasks.find((t) => t.id === taskOrId) ??
            mockRecommendedTasks.find((t) => t.id === taskOrId))
          : taskOrId;
      if (!task) return;
      const switching = isTimerRunning;
      setCurrentTask(task);
      if (!switching) {
        setSessionSeconds(0);
        setSubtaskState(mockSubtasks.map((st) => ({ ...st })));
      }
      setIsTimerRunning(true);
      setViewState("active");
      setActiveTab("focus");
      setStoppedReason("manual");
    },
    [isTimerRunning]
  );

  const handleStopSession = useCallback(() => {
    setIsTimerRunning(false);
    setProgress(currentTask?.progress ?? 0);
    setStoppedReason("manual");
    setViewState("stopped");
  }, [currentTask]);

  const handleStartEvent = useCallback(() => {
    setIsTimerRunning(false);
    setProgress(currentTask?.progress ?? 0);
    setStoppedReason("event");
    setViewState("stopped");
  }, [currentTask]);

  const handleStartNextEvent = useCallback(() => {
    setCurrentTask(
      mockTask({
        id: "evt_1",
        title: playgroundUpcomingEvent.label,
        difficulty: "MEDIUM",
        estimatedMinutes: 60,
      })
    );
    setSessionSeconds(0);
    setIsTimerRunning(true);
    setViewState("active");
  }, []);

  const handleCompleteTask = useCallback(() => {
    setProgress(100);
    setViewState("upnext");
  }, []);

  const handleSwitchTask = useCallback(() => {
    setViewState("upnext");
  }, []);

  const handleSelectNewTask = useCallback(() => {
    setViewState("upnext");
  }, []);

  const handleBackToInitial = useCallback(() => {
    if (isTimerRunning) {
      setViewState("active");
    } else {
      setViewState("idle");
      setCurrentTask(null);
    }
  }, [isTimerRunning]);

  const handleTakeBreak = useCallback((minutes: number) => {
    setCurrentTask(
      mockTask({
        id: "break",
        title: `${minutes} Minute Break`,
        difficulty: "TRIVIAL",
        estimatedMinutes: minutes,
      })
    );
    setSessionSeconds(0);
    setIsTimerRunning(true);
    setViewState("active");
  }, []);

  const handleClockOut = useCallback(() => {
    setIsTimerRunning(false);
    setCurrentTask(null);
    setViewState("clockedout");
  }, []);

  const handleStartNewDay = useCallback(() => {
    setSessionSeconds(0);
    setProgress(0);
    setSubtaskState(mockSubtasks.map((st) => ({ ...st })));
    setViewState("fresh");
    setActiveTab("focus");
  }, []);

  const handleToggleSubtask = useCallback((subtaskId: string) => {
    setSubtaskState((prev) =>
      prev.map((st) =>
        st.id === subtaskId
          ? {
              ...st,
              status: st.status === "COMPLETED" ? ("PLANNED" as const) : ("COMPLETED" as const),
            }
          : st
      )
    );
  }, []);

  return (
    <TrayWindow
      activeTab={activeTab}
      onTabChange={setActiveTab}
      viewState={viewState}
      isTimerRunning={isTimerRunning}
      task={currentTask ?? undefined}
      sessionSeconds={sessionSeconds}
      sessionDurationMinutes={currentTask?.estimatedMinutes ?? 60}
      dailySeconds={14400 + sessionSeconds}
      goals={{ pointsCurrent: 4.5, pointsTarget: 12, tasksCurrent: 3, tasksTarget: 8 }}
      stats={{
        period: "DAILY",
        tasksCompleted: 3,
        tasksTarget: 8,
        pointsEarned: 4.5,
        pointsTarget: 12,
        focusMinutes: 145,
        focusTarget: 360,
        habitsCompleted: 1,
        habitsTotal: 3,
      }}
      habits={mockHabits}
      availableTasks={mockTasks}
      scheduledTasks={mockScheduledTasks}
      recommendedTasks={mockRecommendedTasks}
      workspaces={mockWorkspaces}
      selectedWorkspace={mockWorkspaces[0]}
      userStatus={userStatus}
      onStatusChange={setUserStatus}
      minutesWorked={Math.floor(sessionSeconds / 60)}
      currentProgress={progress}
      subtasks={subtaskState}
      stoppedReason={stoppedReason}
      nextEventTitle={playgroundUpcomingEvent.label}
      onProgressChange={setProgress}
      onToggleSubtask={handleToggleSubtask}
      onCompleteTask={handleCompleteTask}
      onStartNextEvent={handleStartNextEvent}
      upcomingEvent={playgroundUpcomingEvent}
      onStartEvent={handleStartEvent}
      onWorkspaceChange={fn()}
      onOpenMain={fn()}
      onStopSession={handleStopSession}
      onStartTask={handleStartTask}
      onOpenSchedule={fn()}
      onTakeBreak={handleTakeBreak}
      onClockOut={handleClockOut}
      daySummary={{
        totalMinutes: Math.floor((14400 + sessionSeconds) / 60),
        tasksCompleted: 3,
        tasksTarget: 8,
        pointsEarned: 4.5,
        pointsTarget: 12,
        focusMinutes: Math.floor((14400 + sessionSeconds) / 60),
        focusTarget: 360,
      }}
      onStartNewDay={handleStartNewDay}
      onViewGoals={fn()}
      onStatsPeriodChange={fn()}
      onToggleHabit={fn()}
      onUpdateHabitValue={fn()}
      onSwitchTask={handleSwitchTask}
      onSelectNewTask={handleSelectNewTask}
      onBackToInitial={handleBackToInitial}
    />
  );
}

export const Playground: Story = {
  render: () => <PlaygroundWrapper />,
  parameters: {
    docs: {
      description: {
        story:
          "Fully interactive demo. Click through the real flow:\n\n" +
          "1. **Fresh** — pick a task from the schedule or task list\n" +
          '2. **Active** — timer ticks live, click "Start" on the upcoming event banner to trigger the event-switch flow, or "Stop Session" to stop manually\n' +
          "3. **Stopped (manual)** — adjust progress slider, check off subtasks, mark complete, pick next action\n" +
          '3. **Stopped (event)** — progress update + "Start Event" only\n' +
          "4. **Up Next** — choose from scheduled/recommended tasks\n" +
          '5. **Clocked Out** — end-of-day summary with "Start New Day"\n' +
          "6. **Stats** — switch tabs anytime to see goals & habits",
      },
    },
  },
};
