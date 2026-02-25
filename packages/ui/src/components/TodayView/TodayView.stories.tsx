import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import type { Task } from "@stridetime/types";
import { TodayViewWithSchedule } from "./TodayViewWithSchedule";
import { ActiveTimerBanner } from "./ActiveTimerBanner";
import { TaskSection } from "./TaskSection";
import { EmptyTasksState } from "./EmptyTasksState";
import { TaskCard } from "../TaskCard";
import { ScrollArea } from "../../primitives/ScrollArea";
import type { ScheduleEvent } from "./TodaySchedule";

const meta: Meta = {
  title: "Components/TodayView",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

const ts = new Date().toISOString();

function mockTask(overrides: Partial<Task>): Task {
  return {
    id: overrides.id || "task-1",
    userId: "user-1",
    projectId: overrides.projectId || "proj-1",
    parentTaskId: null,
    title: overrides.title || "Default task",
    description: null,
    difficulty: "MEDIUM",
    priority: "MEDIUM",
    progress: 0,
    status: "TODO",
    assigneeUserId: null,
    teamId: null,
    estimatedMinutes: null,
    maxMinutes: null,
    actualMinutes: null,
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

const todayAt = (hour: number, minute = 0) => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
  return date.toISOString();
};

const mockProjects = [
  { id: "proj-1", name: "Stride App", color: "#3b82f6" },
  { id: "proj-2", name: "Marketing Site", color: "#10b981" },
  { id: "proj-3", name: "Design System", color: "#8b5cf6" },
];

const mockTasks = [
  mockTask({
    id: "task-1",
    title: "Implement user authentication",
    status: "IN_PROGRESS",
    projectId: "proj-1",
    progress: 45,
  }),
  mockTask({
    id: "task-2",
    title: "Design onboarding flow",
    projectId: "proj-2",
  }),
  mockTask({
    id: "task-3",
    title: "Refactor database schema",
    projectId: "proj-3",
  }),
];

const mockScheduledTasks = [
  mockTask({
    id: "task-1",
    title: "Implement user authentication",
    status: "IN_PROGRESS",
    projectId: "proj-1",
    progress: 45,
  }),
  mockTask({
    id: "task-4",
    title: "Client demo prep",
    projectId: "proj-2",
  }),
];

const mockEvents: ScheduleEvent[] = [
  {
    id: "1",
    label: "Morning Standup",
    type: "MEETING",
    startTime: todayAt(9, 0),
    durationMinutes: 15,
  },
  {
    id: "2",
    label: "Deep Work: Authentication",
    type: "FOCUS",
    startTime: todayAt(10, 0),
    durationMinutes: 90,
    taskTitle: "Implement OAuth providers",
    projectName: "Stride App",
    projectColor: "#3b82f6",
  },
  {
    id: "3",
    label: "Lunch Break",
    type: "BREAK",
    startTime: todayAt(12, 30),
    durationMinutes: 30,
  },
  {
    id: "4",
    label: "Sprint Planning",
    type: "MEETING",
    startTime: todayAt(14, 0),
    durationMinutes: 60,
    externalSource: "Google Calendar",
  },
  {
    id: "5",
    label: "Client Demo Prep",
    type: "TASK",
    startTime: todayAt(15, 30),
    durationMinutes: 45,
    projectName: "Marketing Site",
    projectColor: "#10b981",
  },
];

/**
 * Complete Today view with active timer and tasks
 */
export const WithActiveTimer: StoryObj = {
  render: () => {
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);

    const completedTasks = [
      mockTask({
        id: "task-c1",
        title: "Update documentation",
        status: "COMPLETED",
        progress: 100,
        projectId: "proj-1",
      }),
    ];

    return (
      <ScrollArea className="flex-1">
        <TodayViewWithSchedule
          header={{
            formattedDate: "Friday, February 16",
            onNewTask: fn(),
          }}
          stats={{
            activeTasks: mockTasks.length,
            completedTasks: completedTasks.length,
            minutesTracked: 87,
          }}
          events={mockEvents}
          onViewFullSchedule={fn()}
          hasTasks={mockTasks.length > 0}
        >
          {/* Active Timer */}
          <div className="mb-6">
            <ActiveTimerBanner
              taskTitle="Implement user authentication"
              projectName="Stride App"
              projectColor="#3b82f6"
              startedAt={new Date(Date.now() - 15 * 60 * 1000).toISOString()}
              onPause={fn()}
              onComplete={fn()}
            />
          </div>

          {/* Active Tasks */}
          <TaskSection>
            {mockTasks.map((task) => {
              const project = mockProjects.find((p) => p.id === task.projectId)!;
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  projectName={project.name}
                  projectColor={project.color}
                  hasActiveTimer={true}
                  expanded={expandedTaskId === task.id}
                  onToggleExpand={() =>
                    setExpandedTaskId(expandedTaskId === task.id ? null : task.id)
                  }
                  onOpenDetail={fn()}
                  onStart={fn()}
                  onPause={fn()}
                  onComplete={fn()}
                />
              );
            })}
          </TaskSection>

          {/* Completed Section */}
          {completedTasks.length > 0 && (
            <div className="mt-6">
              <TaskSection
                title="Completed"
                count={completedTasks.length}
                collapsible
                expanded={showCompleted}
                onToggle={() => setShowCompleted(!showCompleted)}
                className="opacity-60"
              >
                {completedTasks.map((task) => {
                  const project = mockProjects.find((p) => p.id === task.projectId)!;
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projectName={project.name}
                      projectColor={project.color}
                      onOpenDetail={fn()}
                    />
                  );
                })}
              </TaskSection>
            </div>
          )}
        </TodayViewWithSchedule>
      </ScrollArea>
    );
  },
};

/**
 * Tasks with scheduled times shown
 */
export const WithScheduledTasks: StoryObj = {
  render: () => {
    return (
      <ScrollArea className="flex-1">
        <TodayViewWithSchedule
          header={{
            formattedDate: "Friday, February 16",
            onNewTask: fn(),
          }}
          stats={{
            activeTasks: mockScheduledTasks.length,
            completedTasks: 0,
          }}
          events={mockEvents}
          onViewFullSchedule={fn()}
          hasTasks={mockScheduledTasks.length > 0}
        >
          <TaskSection>
            {mockScheduledTasks.map((task) => {
              const project = mockProjects.find((p) => p.id === task.projectId)!;
              // Find matching scheduled event
              const matchingEvent = mockEvents.find((e) => e.type === "TASK" || e.type === "FOCUS");
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  projectName={project.name}
                  projectColor={project.color}
                  scheduledTime={
                    matchingEvent
                      ? {
                          startTime: matchingEvent.startTime,
                          durationMinutes: matchingEvent.durationMinutes,
                        }
                      : undefined
                  }
                  isActive={task.id === "task-1"}
                  onOpenDetail={fn()}
                  onStart={fn()}
                  onPause={fn()}
                  onComplete={fn()}
                />
              );
            })}
          </TaskSection>
        </TodayViewWithSchedule>
      </ScrollArea>
    );
  },
};

/**
 * Empty state - no tasks and no events (shows "Plan Your Day" button)
 */
export const EmptyState: StoryObj = {
  render: () => {
    return (
      <ScrollArea className="flex-1">
        <TodayViewWithSchedule
          header={{
            formattedDate: "Friday, February 16",
            onNewTask: fn(),
          }}
          stats={{
            activeTasks: 0,
            completedTasks: 0,
          }}
          showScheduleTab={false}
          hasTasks={false}
        >
          <EmptyTasksState
            onAddTask={() => alert("Open quick add task")}
            onPlanDay={() => alert("Navigate to /schedule/weekly")}
          />
        </TodayViewWithSchedule>
      </ScrollArea>
    );
  },
};

/**
 * Interactive - switch between tasks and schedule tabs
 */
export const Interactive: StoryObj = {
  render: () => {
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

    return (
      <ScrollArea className="flex-1">
        <TodayViewWithSchedule
          header={{
            formattedDate: "Friday, February 16",
            onNewTask: () => alert("Open quick add"),
          }}
          stats={{
            activeTasks: mockTasks.length,
            completedTasks: 2,
            minutesTracked: 87,
          }}
          events={mockEvents}
          onViewFullSchedule={() => alert("Navigate to /schedule/weekly")}
          hasTasks={mockTasks.length > 0}
        >
          {/* Active Timer */}
          <div className="mb-6">
            <ActiveTimerBanner
              taskTitle="Implement user authentication"
              projectName="Stride App"
              projectColor="#3b82f6"
              startedAt={new Date(Date.now() - 15 * 60 * 1000).toISOString()}
              onPause={() => alert("Pause timer")}
              onComplete={() => alert("Complete task")}
            />
          </div>

          <TaskSection>
            {mockTasks.map((task) => {
              const project = mockProjects.find((p) => p.id === task.projectId)!;
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  projectName={project.name}
                  projectColor={project.color}
                  hasActiveTimer={true}
                  expanded={expandedTaskId === task.id}
                  onToggleExpand={() =>
                    setExpandedTaskId(expandedTaskId === task.id ? null : task.id)
                  }
                  onOpenDetail={() => alert(`Edit task: ${task.title}`)}
                  onStart={() => alert(`Switch timer to: ${task.title}`)}
                  onPause={() => alert(`Pause: ${task.title}`)}
                  onComplete={() => alert(`Complete: ${task.title}`)}
                />
              );
            })}
          </TaskSection>
        </TodayViewWithSchedule>
      </ScrollArea>
    );
  },
};
