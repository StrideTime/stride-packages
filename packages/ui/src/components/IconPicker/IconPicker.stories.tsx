import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconPicker } from "./IconPicker";
import type { IconValue } from "./IconPicker.types";

const meta: Meta<typeof IconPicker> = {
  title: "Components/IconPicker",
  component: IconPicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof IconPicker>;

/**
 * Default icon picker with Star icon and blue color
 */
export const Default: Story = {
  args: {
    value: { icon: "Star", color: "#3b82f6" },
  },
};

/**
 * Interactive example showing state management
 */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<IconValue>({
      icon: "Heart",
      color: "#ef4444",
    });

    return (
      <div className="space-y-4">
        <IconPicker value={value} onValueChange={setValue} />

        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="font-semibold text-sm">Selected Value:</h3>
          <pre className="text-xs bg-muted p-2 rounded">{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

/**
 * Multiple pickers with different default values
 */
export const MultipleExamples: Story = {
  render: () => {
    const [habit1, setHabit1] = useState<IconValue>({
      icon: "Dumbbell",
      color: "#10b981",
    });
    const [habit2, setHabit2] = useState<IconValue>({
      icon: "Book",
      color: "#8b5cf6",
    });
    const [habit3, setHabit3] = useState<IconValue>({
      icon: "Droplet",
      color: "#06b6d4",
    });

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Exercise Habit</label>
          <IconPicker value={habit1} onValueChange={setHabit1} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Reading Habit</label>
          <IconPicker value={habit2} onValueChange={setHabit2} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Hydration Habit</label>
          <IconPicker value={habit3} onValueChange={setHabit3} />
        </div>
      </div>
    );
  },
};
