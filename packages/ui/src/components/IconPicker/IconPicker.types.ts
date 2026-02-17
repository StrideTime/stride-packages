export interface IconValue {
  /** Icon name from lucide-react */
  icon: string;
  /** Hex color code */
  color: string;
}

export interface IconPickerProps {
  /** Current selected icon and color */
  value?: IconValue;
  /** Callback when icon/color changes */
  onValueChange?: (value: IconValue) => void;
  /** Trigger button label (default: shows selected icon) */
  triggerLabel?: string;
  /** Disabled state */
  disabled?: boolean;
}
