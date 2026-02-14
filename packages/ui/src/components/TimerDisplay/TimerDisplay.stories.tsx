import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import type { Task } from "@stridetime/types";
import { TimerDisplay } from "./TimerDisplay";

const ts = new Date().toISOString();

function mockTask(overrides?: Partial<Task>): Task {
  return {
    id: "task-1",
    userId: "user-1",
    projectId: "proj-1",
    parentTaskId: null,
    title: "Implement user authentication",
    description: "Set up OAuth providers and email/password auth",
    difficulty: "MEDIUM",
    priority: "HIGH",
    progress: 45,
    status: "IN_PROGRESS",
    assigneeUserId: null,
    teamId: null,
    estimatedMinutes: 120,
    maxMinutes: 180,
    actualMinutes: 30,
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

const meta: Meta<typeof TimerDisplay> = {
  title: "Components/TimerDisplay",
  component: TimerDisplay,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    onStopSession: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 800, padding: "2rem", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TimerDisplay>;

/** Simple elapsed timer (Pomodoro off), mid-session with project info. */
export const Default: Story = {
  args: {
    task: mockTask(),
    sessionSeconds: 1845,
    projectName: "Stride App",
    projectColor: "#3b82f6",
  },
};

/** Pomodoro focus session with countdown timer and cycle dots. */
export const PomodoroFocus: Story = {
  args: {
    task: mockTask(),
    sessionSeconds: 653,
    projectName: "Stride App",
    projectColor: "#3b82f6",
    pomodoroEnabled: true,
    sessionType: "FOCUS",
    sessionDurationMinutes: 25,
    remainingSeconds: 847,
    currentCycle: 2,
    totalCycles: 4,
  },
};

/** Pomodoro short break — shows break message instead of task info. */
export const PomodoroShortBreak: Story = {
  args: {
    task: mockTask(),
    sessionSeconds: 120,
    pomodoroEnabled: true,
    sessionType: "SHORT_BREAK",
    sessionDurationMinutes: 5,
    remainingSeconds: 180,
    currentCycle: 2,
    totalCycles: 4,
  },
};

/** Pomodoro long break on the final cycle. */
export const PomodoroLongBreak: Story = {
  args: {
    task: mockTask(),
    sessionSeconds: 300,
    pomodoroEnabled: true,
    sessionType: "LONG_BREAK",
    sessionDurationMinutes: 15,
    remainingSeconds: 600,
    currentCycle: 4,
    totalCycles: 4,
  },
};

/** Elapsed time exceeds the estimated minutes (amber warning). */
export const OverEstimate: Story = {
  args: {
    task: mockTask({ estimatedMinutes: 60, maxMinutes: null }),
    sessionSeconds: 4320,
    projectName: "Stride App",
    projectColor: "#3b82f6",
  },
};

/** Elapsed time exceeds the max minutes (red warning banner). */
export const OverMaxTime: Story = {
  args: {
    task: mockTask({ estimatedMinutes: 60, maxMinutes: 90 }),
    sessionSeconds: 5700,
    projectName: "Stride App",
    projectColor: "#3b82f6",
  },
};

/** Task has no estimate or max — just elapsed time, no subtitle. */
export const NoEstimate: Story = {
  args: {
    task: mockTask({ estimatedMinutes: null, maxMinutes: null }),
    sessionSeconds: 600,
    projectName: "Stride App",
    projectColor: "#3b82f6",
  },
};

/** Hard difficulty task with different project. */
export const HardDifficulty: Story = {
  args: {
    task: mockTask({
      title: "Complex database migration",
      difficulty: "HARD",
    }),
    sessionSeconds: 2400,
    projectName: "Backend",
    projectColor: "#f97316",
  },
};

/** No project info — project dot and name are hidden. */
export const NoProject: Story = {
  args: {
    task: mockTask(),
    sessionSeconds: 300,
  },
};
