import type { HabitView } from "../TrayWindow.types";

export interface TrayHabitItemProps extends HabitView {
  onToggle: () => void;
  onUpdateValue: (value: number) => void;
}
