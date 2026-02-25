import type { Meta, StoryObj } from '@storybook/react-vite';
import { DndContext } from '@dnd-kit/core';
import { TimeSlot } from './TimeSlot';

const meta = {
  title: 'Components/DailyPlanner/TimeSlot',
  component: TimeSlot,
  parameters: { layout: 'padded' },
  decorators: [
    Story => (
      <DndContext>
        <div className="relative w-full">
          <Story />
        </div>
      </DndContext>
    ),
  ],
  args: {
    time: '09:00',
    index: 0,
    slotHeightPx: 32,
    muted: false,
  },
} satisfies Meta<typeof TimeSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HourMarker: Story = {
  args: { time: '09:00', index: 0 },
};

export const QuarterHour: Story = {
  args: { time: '09:15', index: 1 },
};

export const HalfHour: Story = {
  args: { time: '09:30', index: 2 },
};

export const ThreeQuarterHour: Story = {
  args: { time: '09:45', index: 3 },
};
