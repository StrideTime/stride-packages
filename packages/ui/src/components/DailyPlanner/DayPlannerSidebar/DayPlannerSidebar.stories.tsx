import type { Meta, StoryObj } from '@storybook/react-vite';
import { DndContext } from '@dnd-kit/core';
import { DayPlannerSidebar } from './DayPlannerSidebar';
import type { Task, Project } from '@stridetime/types';

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

const mockProject2: Project = {
  id: 'proj-2',
  workspaceId: 'ws-1',
  userId: 'user-1',
  name: 'Mobile App',
  description: null,
  color: '#10b981',
  icon: '📱',
  status: 'ACTIVE',
  completionPercentage: 30,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deleted: false,
};

const base: Omit<Task, 'id' | 'title' | 'estimatedMinutes'> = {
  userId: 'user-1',
  projectId: 'proj-1',
  parentTaskId: null,
  description: null,
  difficulty: 'MEDIUM',
  priority: 'MEDIUM',
  progress: 0,
  status: 'IN_PROGRESS',
  assigneeUserId: null,
  teamId: null,
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

const mockPlannedTasks: Task[] = [
  { ...base, id: 'task-1', title: 'Design homepage mockup', estimatedMinutes: 90, priority: 'HIGH', difficulty: 'HARD' },
  { ...base, id: 'task-2', title: 'Write unit tests', estimatedMinutes: 60, priority: 'MEDIUM', difficulty: 'MEDIUM' },
  { ...base, id: 'task-3', title: 'Fix login bug', estimatedMinutes: 30, priority: 'CRITICAL', difficulty: 'EASY' },
];

const mockRecommendedTasks: Task[] = [
  { ...base, id: 'task-4', title: 'Review analytics report', estimatedMinutes: 45, projectId: 'proj-2', difficulty: 'EASY' },
  { ...base, id: 'task-5', title: 'Update documentation', estimatedMinutes: 60, projectId: 'proj-2', difficulty: 'TRIVIAL' },
];

const meta = {
  title: 'Components/DailyPlanner/DayPlannerSidebar',
  component: DayPlannerSidebar,
  parameters: { layout: 'padded' },
  decorators: [
    Story => (
      <DndContext>
        <div style={{ height: '600px', display: 'flex' }}>
          <Story />
        </div>
      </DndContext>
    ),
  ],
  args: {
    plannedTasks: mockPlannedTasks,
    projects: [mockProject, mockProject2],
  },
} satisfies Meta<typeof DayPlannerSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRecommendations: Story = {
  args: {
    recommendedTasks: mockRecommendedTasks,
  },
};

export const WithSearchResults: Story = {
  args: {
    searchResults: mockPlannedTasks.slice(0, 2),
    onSearchTasks: (q: string) => console.log('search:', q),
  },
};

export const Empty: Story = {
  args: { plannedTasks: [], recommendedTasks: mockRecommendedTasks },
};

