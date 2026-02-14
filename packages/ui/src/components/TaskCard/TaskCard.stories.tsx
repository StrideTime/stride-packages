import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import type { Task, TimeEntry } from "@stridetime/types";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";
import type { SubtaskItem, TeamMember, ProjectOption } from "./TaskCard.types";

const ts = new Date().toISOString();

function mockTask(overrides?: Partial<Task>): Task {
  return {
    id: "task-1",
    userId: "user-1",
    projectId: "proj-1",
    parentTaskId: null,
    title: "Implement user authentication",
    description:
      "Set up OAuth providers for Google and GitHub, implement email/password auth flow, and add session management with JWT tokens.",
    difficulty: "MEDIUM",
    priority: "HIGH",
    progress: 45,
    status: "IN_PROGRESS",
    assigneeUserId: "user-2",
    teamId: "team-1",
    estimatedMinutes: 120,
    maxMinutes: 180,
    actualMinutes: 55,
    plannedForDate: new Date(Date.now() + 86400000).toISOString(),
    dueDate: null,
    taskTypeId: "tt-1",
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

function mockSubtasks(): SubtaskItem[] {
  return [
    { id: "st-1", title: "Set up authentication routes", completed: true },
    { id: "st-2", title: "Create login form UI", completed: false },
    { id: "st-3", title: "Add OAuth integration", completed: false },
  ];
}

const mockTeamMembers: TeamMember[] = [
  { id: "user-1", name: "Alice Johnson" },
  { id: "user-2", name: "Bob Smith" },
  { id: "user-3", name: "Charlie Brown" },
  { id: "user-4", name: "Diana Prince" },
];

const mockProjects: ProjectOption[] = [
  { id: "proj-1", name: "Stride App", color: "#3b82f6" },
  { id: "proj-2", name: "Marketing Site", color: "#10b981" },
  { id: "proj-3", name: "Design System", color: "#8b5cf6" },
  { id: "proj-4", name: "Internal Tools", color: "#f59e0b" },
];

function mockTimeEntries(): TimeEntry[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  return [
    {
      id: "te-1",
      taskId: "task-1",
      userId: "user-1",
      startedAt: new Date(yesterday.getTime() + 9 * 3600000).toISOString(),
      endedAt: new Date(yesterday.getTime() + 9.5 * 3600000).toISOString(),
      createdAt: ts,
      updatedAt: ts,
      deleted: false,
    },
    {
      id: "te-2",
      taskId: "task-1",
      userId: "user-1",
      startedAt: new Date(yesterday.getTime() + 14 * 3600000).toISOString(),
      endedAt: new Date(yesterday.getTime() + 14.75 * 3600000).toISOString(),
      createdAt: ts,
      updatedAt: ts,
      deleted: false,
    },
    {
      id: "te-3",
      taskId: "task-1",
      userId: "user-1",
      startedAt: new Date(today.getTime() + 10 * 3600000).toISOString(),
      endedAt: new Date(today.getTime() + 10.5 * 3600000).toISOString(),
      createdAt: ts,
      updatedAt: ts,
      deleted: false,
    },
  ];
}

// ─── Meta ────────────────────────────────────────────────

const meta: Meta<typeof TaskCard> = {
  title: "Components/TaskCard",
  component: TaskCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    projectName: "Stride App",
    projectColor: "#3b82f6",
    onStart: fn(),
    onPause: fn(),
    onComplete: fn(),
    onClick: undefined,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 700, padding: "2rem", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TaskCard>;

// ─── Static States ───────────────────────────────────────

/** Default compact card. */
export const Default: Story = {
  args: {
    task: mockTask(),
    subtasks: mockSubtasks(),
  },
};

/** Active task with ring highlight. */
export const Active: Story = {
  args: {
    task: mockTask(),
    isActive: true,
  },
};

/** Completed task with points earned. */
export const Completed: Story = {
  args: {
    task: mockTask({
      status: "COMPLETED",
      progress: 100,
      actualMinutes: 95,
      completedAt: ts,
    }),
    points: 24.5,
  },
};

// ─── External Sources ────────────────────────────────────

/** Task linked to a Jira issue. */
export const LinkedToJira: Story = {
  args: {
    task: mockTask({
      externalSource: "JIRA",
      externalId: "STRIDE-142",
    }),
    externalUrl: "https://myteam.atlassian.net/browse/STRIDE-142",
    subtasks: mockSubtasks(),
  },
};

/** Task linked to a GitHub issue. */
export const LinkedToGitHub: Story = {
  args: {
    task: mockTask({
      title: "Fix race condition in sync engine",
      externalSource: "GITHUB",
      externalId: "287",
      difficulty: "HARD",
      priority: "CRITICAL",
    }),
    externalUrl: "https://github.com/stridetime/stride/issues/287",
  },
};

/** Task linked to a Trello card. */
export const LinkedToTrello: Story = {
  args: {
    task: mockTask({
      title: "Design onboarding flow",
      externalSource: "TRELLO",
      externalId: "abc123",
      difficulty: "EASY",
      priority: "MEDIUM",
    }),
    externalUrl: "https://trello.com/c/abc123",
  },
};

// ─── Interactive: Expand → Edit Modal ────────────────────

/** Full flow: expand card, click Edit to open the edit modal (Jira-linked). */
export const Interactive: Story = {
  render: (args) => {
    const [task, setTask] = useState(
      mockTask({
        externalSource: "JIRA",
        externalId: "STRIDE-142",
      })
    );
    const [subtasks, setSubtasks] = useState(mockSubtasks());
    const [entries, setEntries] = useState(mockTimeEntries());
    const [expanded, setExpanded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const jiraUrl = "https://myteam.atlassian.net/browse/STRIDE-142";

    return (
      <div>
        <TaskCard
          {...args}
          task={task}
          projectName="Stride App"
          projectColor="#3b82f6"
          subtasks={subtasks}
          timeEntries={entries}
          externalUrl={jiraUrl}
          onUpdateTimeEntry={(id, updates) =>
            setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
          }
          onDeleteTimeEntry={(id) => setEntries((prev) => prev.filter((e) => e.id !== id))}
          onToggleSubtask={(id) =>
            setSubtasks((prev) =>
              prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
            )
          }
          onUpdateProgress={(progress) => setTask((prev) => ({ ...prev, progress }))}
          expanded={expanded}
          onToggleExpand={() => setExpanded(!expanded)}
          onOpenDetail={() => setModalOpen(true)}
          onClick={undefined}
        />
        <TaskDetailModal
          task={task}
          projectName="Stride App"
          projectColor="#3b82f6"
          subtasks={subtasks}
          externalUrl={jiraUrl}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onUpdateTask={(updates) => setTask((prev) => ({ ...prev, ...updates }))}
          onUpdateSubtasks={setSubtasks}
          onAssigneeChange={fn()}
          projects={mockProjects}
          teamMembers={mockTeamMembers}
          assignmentPolicy="LEADS_AND_MEMBERS"
          currentUserIsLead
          onComplete={fn()}
        />
      </div>
    );
  },
};

// ─── Edit Modal (standalone) ─────────────────────────────

/** Edit modal in isolation — GitHub-linked task. */
export const EditModal: StoryObj = {
  render: () => {
    const [task, setTask] = useState(
      mockTask({
        title: "Fix race condition in sync engine",
        externalSource: "GITHUB",
        externalId: "287",
        difficulty: "HARD",
        priority: "CRITICAL",
      })
    );
    const [subtasks, setSubtasks] = useState(mockSubtasks());
    const [open, setOpen] = useState(true);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          Open Task Detail
        </button>
        <TaskDetailModal
          task={task}
          projectName="Stride App"
          projectColor="#3b82f6"
          subtasks={subtasks}
          externalUrl="https://github.com/stridetime/stride/issues/287"
          open={open}
          onOpenChange={setOpen}
          onUpdateTask={(updates) => setTask((prev) => ({ ...prev, ...updates }))}
          onUpdateSubtasks={setSubtasks}
          onAssigneeChange={fn()}
          projects={mockProjects}
          teamMembers={mockTeamMembers}
          assignmentPolicy="LEADS_AND_MEMBERS"
          currentUserIsLead
          onComplete={fn()}
        />
      </div>
    );
  },
};
