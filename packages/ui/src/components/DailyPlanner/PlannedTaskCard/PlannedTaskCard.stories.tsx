import type { Meta, StoryObj } from '@storybook/react-vite';
import { DndContext } from '@dnd-kit/core';
import { PlannedTaskCard } from './PlannedTaskCard';
import type { Task, Project } from '@stridetime/types';

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
  estimatedMinutes: 90,
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

const meta = {
  title: 'Components/DailyPlanner/PlannedTaskCard',
  component: PlannedTaskCard,
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <DndContext>
        <div className="w-72">
          <Story />
        </div>
      </DndContext>
    ),
  ],
  args: {
    task: mockTask,
    project: mockProject,
    draggableId: 'planned-task-1',
  },
} satisfies Meta<typeof PlannedTaskCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShortTask: Story = {
  args: {
    task: { ...mockTask, title: 'Quick fix', estimatedMinutes: 15, difficulty: 'EASY', priority: 'LOW', dueDate: new Date(new Date().setDate(29)).toISOString()  },
    draggableId: 'planned-task-short',
  },
};

export const LongTitle: Story = {
  args: {
    task: {
      ...mockTask,
      title: 'Refactor the entire authentication system and update all related tests',
      estimatedMinutes: 240,
    },
    draggableId: 'planned-task-long',
  },
};

export const DueToday: Story = {
  args: {
    task: { ...mockTask, dueDate: new Date().toISOString().split('T')[0] },
    draggableId: 'planned-task-due-today',
  },
};

export const Overdue: Story = {
  args: {
    task: { ...mockTask, dueDate: '2024-01-01' },
    draggableId: 'planned-task-overdue',
  },
};

export const DueSoon: Story = {
  args: {
    task: {
      ...mockTask,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    draggableId: 'planned-task-due-soon',
  },
};

export const OverCap: Story = {
  args: {
    task: { ...mockTask, maxMinutes: 60, actualMinutes: 75 },
    draggableId: 'planned-task-over-cap',
  },
};

export const NearCap: Story = {
  args: {
    task: { ...mockTask, maxMinutes: 60, actualMinutes: 50 },
    draggableId: 'planned-task-near-cap',
  },
};

export const AllWarnings: Story = {
  args: {
    task: { ...mockTask, dueDate: '2024-01-01', maxMinutes: 60, actualMinutes: 75 },
    draggableId: 'planned-task-all-warnings',
  },
};
