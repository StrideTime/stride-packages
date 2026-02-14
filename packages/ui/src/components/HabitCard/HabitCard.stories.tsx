import type { Meta, StoryObj } from "@storybook/react-vite";
import { HabitCard } from "./HabitCard";

const meta: Meta<typeof HabitCard> = {
  title: "Components/HabitCard",
  component: HabitCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, padding: "2rem", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HabitCard>;

export const Default: Story = {
  args: {
    name: "Morning Exercise",
    description: "30 minutes of cardio or strength training",
    icon: "\uD83C\uDFC3",
    trackingType: "COMPLETED",
    completed: false,
    currentStreak: 5,
    longestStreak: 12,
    completionRate: 85,
  },
};

export const Completed: Story = {
  args: {
    ...Default.args,
    completed: true,
  },
};

export const Counter: Story = {
  args: {
    name: "Drink water",
    description: "Stay hydrated throughout the day",
    icon: "\uD83D\uDCA7",
    trackingType: "COUNTER",
    unit: "glasses",
    targetCount: 8,
    completed: false,
    value: 5,
    currentStreak: 3,
    completionRate: 71,
  },
};
