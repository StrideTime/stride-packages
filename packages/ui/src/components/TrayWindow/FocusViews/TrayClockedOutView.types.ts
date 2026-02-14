import type { DaySummary } from "../TrayWindow.types";

export interface TrayClockedOutViewProps {
  summary: DaySummary;
  onStartNewDay: () => void;
  onOpenMain: () => void;
}
