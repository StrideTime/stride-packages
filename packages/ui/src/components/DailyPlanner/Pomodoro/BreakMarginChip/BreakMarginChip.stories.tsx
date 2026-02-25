import type { Meta, StoryObj } from '@storybook/react-vite';
import { BreakMarginChip } from './BreakMarginChip';
import type { PomodoroBreak } from '../../DailyPlanner/DailyPlanner';

const meta = {
  title: 'Components/DailyPlanner/Pomodoro/BreakMarginChip',
  component: BreakMarginChip,
  parameters: { layout: 'padded' },
  decorators: [
    Story => (
      <div className="relative w-80" style={{ height: '120px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    index: 0,
    top: 0,
    slotHeightPx: 32,
    slotIncrementMinutes: 15,
  },
} satisfies Meta<typeof BreakMarginChip>;

export default meta;
type Story = StoryObj<typeof meta>;

const shortBreak: PomodoroBreak = {
  type: 'short',
  startMinutes: 0,
  durationMinutes: 5,
};

const longBreak: PomodoroBreak = {
  type: 'long',
  startMinutes: 0,
  durationMinutes: 15,
};

export const ShortBreak: Story = {
  args: { pomodoroBreak: shortBreak },
};

export const LongBreak: Story = {
  args: { pomodoroBreak: longBreak },
};
