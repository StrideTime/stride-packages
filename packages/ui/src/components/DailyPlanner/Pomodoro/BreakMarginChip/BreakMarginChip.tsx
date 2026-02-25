import { useState } from 'react';
import { GripVertical, X } from 'lucide-react';
import { cn } from '@utils';
import { EditBreakDialog } from '../../Dialogs';
import { useBreakChipDrag } from '../../hooks';
import type { PomodoroBreak } from '../../DailyPlanner/DailyPlanner';
import styles from './BreakMarginChip.module.css';

export type BreakMarginChipProps = {
  pomodoroBreak: PomodoroBreak;
  index: number;
  top: number;
  slotHeightPx: number;
  slotIncrementMinutes: number;
  onAdjustDuration?: (breakIndex: number, newDuration: number) => void;
  onDeleteBreak?: (breakIndex: number) => void;
  onDragBreak?: (breakIndex: number, newStartMinutes: number) => void;
  onDragPreviewChange?: (y: number | null, breakIndex: number) => void;
};

export function BreakMarginChip({
  pomodoroBreak,
  index,
  top,
  slotHeightPx,
  slotIncrementMinutes,
  onAdjustDuration,
  onDeleteBreak,
  onDragBreak,
  onDragPreviewChange,
}: BreakMarginChipProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { isDragging, dragPreviewY, handleDragStart, handleDrag, handleDragEnd, handleDragOver } = useBreakChipDrag({
    pomodoroBreak, index, slotHeightPx, slotIncrementMinutes, onDragBreak, onDragPreviewChange,
  });

  const chipColor = pomodoroBreak.durationMinutes >= 15 ? '#10b981' : '#a855f7';

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteBreak?.(index);
  };

  const handleChipClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setDialogOpen(true);
  };

  const handleApply = (newDuration: number) => {
    onAdjustDuration?.(index, newDuration);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    onDeleteBreak?.(index);
    setDialogOpen(false);
  };

  return (
    <>
      <div
        className={cn(styles.chip, isDragging && styles.chipDragging)}
        style={{
          top: `${top + 2}px`,
          borderColor: chipColor,
          color: chipColor,
          backgroundColor: `${chipColor}18`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          type="button"
          className={cn(styles.deleteBtn, isHovered ? styles.deleteBtnVisible : styles.deleteBtnHidden)}
          onClick={handleDeleteClick}
          title="Delete break"
        >
          <X className={styles.deleteIcon} />
        </button>

        <div
          className={styles.dragHandle}
          draggable
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className={cn(styles.gripIconWrapper, isHovered ? styles.gripVisible : styles.gripHidden)}>
            <GripVertical className={styles.gripIcon} />
          </div>
          <div className={styles.chipLabel} onClick={handleChipClick}>
            {pomodoroBreak.durationMinutes}m
          </div>
        </div>
      </div>

      {isDragging && dragPreviewY !== null && (
        <div className={styles.dragPreviewWrapper} style={{ top: `${dragPreviewY + 2}px` }}>
          <div
            className={styles.dragPreviewBadge}
            style={{ borderColor: chipColor, color: chipColor }}
          >
            <GripVertical className={styles.gripIcon} />
            {pomodoroBreak.durationMinutes}m
          </div>
        </div>
      )}

      <EditBreakDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        durationMinutes={pomodoroBreak.durationMinutes}
        onApply={handleApply}
        onDelete={handleDelete}
      />
    </>
  );
}
