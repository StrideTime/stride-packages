import type { Meta, StoryObj } from '@storybook/react-vite';
import { DndContext } from '@dnd-kit/core';
import { TimeBlock } from './TimeBlock';
import type { ScheduledEvent, Task, Project } from '@stridetime/types';
import { ScheduledEventType } from '@stridetime/types';

const meta = {
  title: 'Components/DailyPlanner/TimeBlock',
  component: TimeBlock,
  parameters: { layout: 'padded' },
  decorators: [
    Story => (
      <DndContext>
        <div className="relative h-64 w-80">
          <Story />
        </div>
      </DndContext>
    ),
  ],
} satisfies Meta<typeof TimeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockProject: Project = {
  id: 'proj-1',
  workspaceId: 'ws-1',
  userId: 'user-1',
  name: 'Website Redesign',
  description: null,
  color: '#3b82f6',
  icon: '🎨',
  status: 'ACTIVE',
  completionPercentage: 45,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deleted: false,
};

const mockTask: Task = {
  id: 'task-1',
  userId: 'user-1',
  projectId: 'proj-1',
  parentTaskId: null,
  title: 'Design homepage mockup',
  description: null,
  difficulty: 'MEDIUM',
  priority: 'HIGH',
  progress: 0,
  status: 'IN_PROGRESS',
  assigneeUserId: null,
  teamId: null,
  estimatedMinutes: 120,
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
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deleted: false,
};

const baseEvent: ScheduledEvent = {
  id: 'event-1',
  taskId: 'task-1',
  userId: 'user-1',
  startTime: '09:00',
  durationMinutes: 90,
  label: 'Design homepage mockup',
  type: ScheduledEventType.TASK,
  externalId: null,
  externalSource: null,
  metadata: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deleted: false,
};

const commonProps = {
  event: baseEvent,
  task: mockTask,
  project: mockProject,
  tasks: [mockTask],
  projects: [mockProject],
  top: 0,
  height: 192,
  width: '100%',
  left: '0%',
  slotHeightPx: 32,
  slotIncrementMinutes: 15,
  onRemove: (id: string) => console.log('remove', id),
  onResize: (id: string, mins: number) => console.log('resize', id, mins),
  onMoveStart: (id: string, time: string) => console.log('move', id, time),
};

export const TaskEvent: Story = { args: { ...commonProps } };

export const SmallEvent: Story = {
  args: { ...commonProps, event: { ...baseEvent, durationMinutes: 30 }, height: 64 },
};

export const TinyEvent: Story = {
  args: { ...commonProps, event: { ...baseEvent, durationMinutes: 15 }, height: 32 },
};

export const Meeting: Story = {
  args: {
    ...commonProps,
    event: { ...baseEvent, taskId: null, type: ScheduledEventType.MEETING, label: 'Team Standup' },
    task: undefined,
  },
};
