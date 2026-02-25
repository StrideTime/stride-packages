import type { Meta, StoryObj } from '@storybook/react-vite';
import { DndContext } from '@dnd-kit/core';
import { TimeGrid } from './TimeGrid';
import { generateTimeSlots } from '../utils/DailyPlanner.utils';
import type { PomodoroBreak } from '../DailyPlanner/DailyPlanner';

const timeSlots = generateTimeSlots(15);

const pomodoroBreaks: PomodoroBreak[] = [
  { type: 'short', startMinutes: 9 * 60 + 25, durationMinutes: 5 },
  { type: 'short', startMinutes: 9 * 60 + 55, durationMinutes: 5 },
  { type: 'long', startMinutes: 10 * 60 + 25, durationMinutes: 15 },
];

const meta = {
  title: 'Components/DailyPlanner/TimeGrid',
  component: TimeGrid,
  parameters: { layout: 'padded' },
  decorators: [
    Story => (
      <DndContext>
        <div className="relative w-full" style={{ height: '600px', overflowY: 'auto' }}>
          <Story />
        </div>
      </DndContext>
    ),
  ],
  args: {
    timeSlots,
    slotHeightPx: 32,
    slotIncrementMinutes: 15,
    workingHoursStart: 8,
    workingHoursEnd: 18,
  },
} satisfies Meta<typeof TimeGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithWorkingHours: Story = {
  args: { workingHoursStart: 9, workingHoursEnd: 17 },
};

export const WithPomodoroBreaks: Story = {
  args: { pomodoroBreaks },
};
