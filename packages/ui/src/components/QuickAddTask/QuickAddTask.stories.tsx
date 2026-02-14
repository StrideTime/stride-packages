import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { Project, TaskType } from "@stridetime/types";
import { QuickAddTask } from "./QuickAddTask";
import type { DraftTask } from "./QuickAddTask.types";

const ts = new Date().toISOString();

const mockProjects: Project[] = [
  {
    id: "project-1",
    workspaceId: "ws-1",
    userId: "user-1",
    name: "Stride App",
    description: null,
    color: "#3b82f6",
    icon: null,
    status: "ACTIVE",
    completionPercentage: 0,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
  },
  {
    id: "project-2",
    workspaceId: "ws-1",
    userId: "user-1",
    name: "Marketing Site",
    description: null,
    color: "#10b981",
    icon: null,
    status: "ACTIVE",
    completionPercentage: 0,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
  },
  {
    id: "project-3",
    workspaceId: "ws-1",
    userId: "user-1",
    name: "Internal Tools",
    description: null,
    color: "#f59e0b",
    icon: null,
    status: "ACTIVE",
    completionPercentage: 0,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
  },
];

const mockTaskTypes: TaskType[] = [
  {
    id: "tt-1",
    workspaceId: "ws-1",
    userId: "user-1",
    name: "Feature",
    icon: "\u2728",
    color: "#8b5cf6",
    isDefault: true,
    displayOrder: 0,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
  },
  {
    id: "tt-2",
    workspaceId: "ws-1",
    userId: "user-1",
    name: "Bug",
    icon: "\uD83D\uDC1B",
    color: "#ef4444",
    isDefault: false,
    displayOrder: 1,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
  },
  {
    id: "tt-3",
    workspaceId: "ws-1",
    userId: "user-1",
    name: "Improvement",
    icon: "\uD83C\uDFAF",
    color: "#3b82f6",
    isDefault: false,
    displayOrder: 2,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
  },
  {
    id: "tt-4",
    workspaceId: "ws-1",
    userId: "user-1",
    name: "Refactor",
    icon: "\uD83D\uDD27",
    color: "#6b7280",
    isDefault: false,
    displayOrder: 3,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
  },
  {
    id: "tt-5",
    workspaceId: "ws-1",
    userId: "user-1",
    name: "Research",
    icon: "\uD83D\uDCA1",
    color: "#eab308",
    isDefault: false,
    displayOrder: 4,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
  },
];

const meta: Meta<typeof QuickAddTask> = {
  title: "Components/QuickAddTask",
  component: QuickAddTask,
  tags: ["autodocs"],
  decorators: [
    (Story, { args }) => {
      const [isOpen, setIsOpen] = useState(true);
      const [tasks, setTasks] = useState<DraftTask[]>(
        args.tasks || [
          {
            id: "task-0",
            title: "",
            indent: 0,
            parentTaskId: null,
            difficulty: "MEDIUM",
          },
        ]
      );
      const [selectedProjectId, setSelectedProjectId] = useState("project-1");
      const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
      const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);

      return (
        <div style={{ padding: "2rem" }}>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Open Quick Add Task
          </button>
          <Story
            args={{
              ...args,
              projects: mockProjects,
              taskTypes: mockTaskTypes,
              open: isOpen,
              onOpenChange: setIsOpen,
              tasks,
              onTasksChange: setTasks,
              selectedProjectId,
              onSelectedProjectChange: setSelectedProjectId,
              selectedTaskId,
              onSelectedTaskChange: setSelectedTaskId,
              hoveredGroupId,
              onHoveredGroupChange: setHoveredGroupId,
              onCreate: (t) => {
                console.log("Created:", t);
                setIsOpen(false);
              },
            }}
          />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof QuickAddTask>;

export const Default: Story = {
  args: {
    isWorkspaceAdmin: false,
  },
};

export const WithTasks: Story = {
  args: {
    isWorkspaceAdmin: false,
    tasks: [
      {
        id: "task-1",
        title: "Authentication system",
        indent: 0,
        parentTaskId: null,
        difficulty: "MEDIUM" as const,
        taskTypeId: "tt-1",
      },
      {
        id: "task-2",
        title: "Login page UI",
        indent: 1,
        parentTaskId: "task-1",
        difficulty: "EASY" as const,
        taskTypeId: "tt-1",
      },
      {
        id: "task-3",
        title: "OAuth integration",
        indent: 1,
        parentTaskId: "task-1",
        difficulty: "HARD" as const,
        taskTypeId: "tt-1",
      },
      {
        id: "task-4",
        title: "Dashboard redesign",
        indent: 0,
        parentTaskId: null,
        difficulty: "MEDIUM" as const,
        taskTypeId: "tt-3",
      },
    ],
  },
};
