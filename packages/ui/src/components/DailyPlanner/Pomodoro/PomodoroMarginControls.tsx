import { BreakMarginChip } from './BreakMarginChip';
import type { PomodoroBreak } from '../DailyPlanner/DailyPlanner';

/** @deprecated Use BreakMarginControls instead */
type PomodoroMarginControlsProps = {
  blocks: PomodoroBreak[];
  slotHeightPx: number;
  slotIncrementMinutes: number;
  onAdjustDuration?: (breakIndex: number, newDuration: number) => void;
  onDeleteBreak?: (breakIndex: number) => void;
  onDragBreak?: (breakIndex: number, newStartMinutes: number) => void;
  onDragPreviewChange?: (y: number | null, breakIndex: number) => void;
};

export function PomodoroMarginControls({
  blocks,
  slotHeightPx,
  slotIncrementMinutes,
  onAdjustDuration,
  onDeleteBreak,
  onDragBreak,
  onDragPreviewChange,
}: PomodoroMarginControlsProps) {
  return (
    <>
      {blocks.map((pomodoroBreak, index) => {
        const top = (pomodoroBreak.startMinutes / slotIncrementMinutes) * slotHeightPx;
        return (
          <BreakMarginChip
            key={index}
            pomodoroBreak={pomodoroBreak}
            index={index}
            top={top}
            slotHeightPx={slotHeightPx}
            slotIncrementMinutes={slotIncrementMinutes}
            onAdjustDuration={onAdjustDuration}
            onDeleteBreak={onDeleteBreak}
            onDragBreak={onDragBreak}
            onDragPreviewChange={onDragPreviewChange}
          />
        );
      })}
    </>
  );
}
