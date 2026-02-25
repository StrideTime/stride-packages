import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { EditEventDialog } from './EditEventDialog';
import type { ScheduledEvent, Task, Project } from '@stridetime/types';
import { ScheduledEventType } from '@stridetime/types';

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

const mockEvent: ScheduledEvent = {
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

const meta = {
  title: 'Components/DailyPlanner/Dialogs/EditEventDialog',
  component: EditEventDialog,
  parameters: { layout: 'centered' },
  args: {
    event: mockEvent,
    tasks: [mockTask],
    projects: [mockProject],
    open: true,
    onOpenChange: () => {},
    onSave: () => {},
  },
} satisfies Meta<typeof EditEventDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => {
    const [open, setOpen] = useState(true);
    return <EditEventDialog {...args} open={open} onOpenChange={setOpen} />;
  },
};

export const MeetingEvent: Story = {
  render: args => {
    const [open, setOpen] = useState(true);
    return (
      <EditEventDialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        event={{ ...mockEvent, taskId: null, type: ScheduledEventType.MEETING, label: 'Team Standup' }}
      />
    );
  },
};
