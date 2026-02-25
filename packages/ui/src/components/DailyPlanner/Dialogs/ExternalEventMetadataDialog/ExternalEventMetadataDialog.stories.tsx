import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExternalEventMetadataDialog } from './ExternalEventMetadataDialog';
import type { ScheduledEvent } from '@stridetime/types';
import { ScheduledEventType } from '@stridetime/types';

const meta = {
  title: 'Components/DailyPlanner/ExternalEventMetadataDialog',
  component: ExternalEventMetadataDialog,
  parameters: { layout: 'centered' },
  args: { onOpenChange: () => {} },
} satisfies Meta<typeof ExternalEventMetadataDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const gcalMeeting: ScheduledEvent = {
  id: 'ext-gcal-1',
  taskId: null,
  userId: 'user-1',
  startTime: '10:00',
  durationMinutes: 60,
  label: 'Q2 Engineering Planning Sync',
  type: ScheduledEventType.MEETING,
  externalId: 'gcal_7x3kq2m9y4',
  externalSource: 'GOOGLE_CALENDAR',
  metadata: JSON.stringify({
    calendarName: 'Work',
    calendarId: 'jaren@stride.com',
    organizer: { name: 'Sarah Chen', email: 'sarah.chen@stride.com' },
    attendees: [
      { name: 'Jaren Moore',     email: 'jaren@stride.com',       responseStatus: 'accepted'    },
      { name: 'Sarah Chen',      email: 'sarah.chen@stride.com',  responseStatus: 'accepted'    },
      { name: 'Marcus Johnson',  email: 'marcus.j@stride.com',    responseStatus: 'accepted'    },
      { name: 'Emily Rodriguez', email: 'emily.r@stride.com',     responseStatus: 'tentative'   },
      { name: 'David Park',      email: 'david.park@stride.com',  responseStatus: 'needsAction' },
    ],
    location: 'Google Meet',
    description: 'Weekly engineering sync to review sprint progress.\n\nAgenda:\n1. Sprint review\n2. Blockers\n3. Q2 roadmap',
    htmlLink: 'https://calendar.google.com/calendar/event?eid=example123',
    hangoutLink: 'https://meet.google.com/abc-defg-hij',
    status: 'confirmed',
  }),
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deleted: false,
};

const gcal1on1: ScheduledEvent = {
  id: 'ext-gcal-2',
  taskId: null,
  userId: 'user-1',
  startTime: '14:30',
  durationMinutes: 30,
  label: '1:1 with Marcus',
  type: ScheduledEventType.MEETING,
  externalId: 'gcal_9a2zb1c5d8',
  externalSource: 'GOOGLE_CALENDAR',
  metadata: JSON.stringify({
    calendarName: 'Work',
    organizer: { name: 'Marcus Johnson', email: 'marcus.j@stride.com' },
    attendees: [
      { name: 'Jaren Moore',    email: 'jaren@stride.com',     responseStatus: 'accepted' },
      { name: 'Marcus Johnson', email: 'marcus.j@stride.com',  responseStatus: 'accepted' },
    ],
    location: '3rd Floor — Room Denali',
    description: 'Regular 1:1 check-in.\n\nTopics:\n- Priorities\n- Blockers\n- Feedback',
    htmlLink: 'https://calendar.google.com/calendar/event?eid=example456',
    status: 'confirmed',
  }),
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deleted: false,
};

const gcalMinimal: ScheduledEvent = {
  id: 'ext-gcal-3',
  taskId: null,
  userId: 'user-1',
  startTime: '09:00',
  durationMinutes: 15,
  label: 'Team Standup',
  type: ScheduledEventType.MEETING,
  externalId: 'gcal_standup01',
  externalSource: 'GOOGLE_CALENDAR',
  metadata: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deleted: false,
};

const outlookMeeting: ScheduledEvent = {
  id: 'ext-outlook-1',
  taskId: null,
  userId: 'user-1',
  startTime: '11:00',
  durationMinutes: 45,
  label: 'Customer Discovery Call — Acme Corp',
  type: ScheduledEventType.MEETING,
  externalId: 'outlook_abc789',
  externalSource: 'OUTLOOK',
  metadata: JSON.stringify({
    calendarName: 'Calendar',
    organizer: { name: 'Priya Kapoor', email: 'priya.kapoor@acmecorp.com' },
    attendees: [
      { name: 'Jaren Moore',  email: 'jaren@stride.com',          responseStatus: 'accepted' },
      { name: 'Priya Kapoor', email: 'priya.kapoor@acmecorp.com', responseStatus: 'accepted' },
    ],
    location: 'Microsoft Teams',
    description: 'Discovery call to understand workflow pain points.',
    htmlLink: 'https://outlook.office.com/calendar/view/event/example789',
    status: 'confirmed',
  }),
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deleted: false,
};

export const GoogleCalendarMeeting: Story = { args: { event: gcalMeeting, open: true } };
export const GoogleCalendar1on1: Story = { args: { event: gcal1on1, open: true } };
export const GoogleCalendarNoMetadata: Story = { args: { event: gcalMinimal, open: true } };
export const OutlookMeeting: Story = { args: { event: outlookMeeting, open: true } };
