import { useState, useEffect } from 'react';
import type { PomodoroBreak } from '../DailyPlanner/DailyPlanner';

type UseBreakChipDragParams = {
  pomodoroBreak: PomodoroBreak;
  index: number;
  slotHeightPx: number;
  slotIncrementMinutes: number;
  onDragBreak?: (breakIndex: number, newStartMinutes: number) => void;
  onDragPreviewChange?: (y: number | null, breakIndex: number) => void;
};

/**
 * Manages HTML5 drag-and-drop for a break chip in the pomodoro margin.
 *
 * Uses the native browser drag API (not dnd-kit) because break chips live
 * outside the DndContext drop zone. Tracks the dragged position, converts
 * clientY into grid-snapped minutes, and notifies the parent on drop.
 */
export function useBreakChipDrag({
  pomodoroBreak,
  index,
  slotHeightPx,
  slotIncrementMinutes,
  onDragBreak,
  onDragPreviewChange,
}: UseBreakChipDragParams) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewY, setDragPreviewY] = useState<number | null>(null);

  /**
   * Prevents the browser's default drop behaviour (e.g. opening a dropped URL)
   * while a drag is in progress. Cleaned up when the drag ends.
   */
  useEffect(() => {
    if (!isDragging) return;
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, [isDragging]);

  /**
   * Rounds a clientY position to the nearest 5-minute increment on the grid.
   * `rect` is the bounding box of the scroll container so we can compute
   * the offset from the top of the time grid.
   */
  const snapToMinutes = (clientY: number, rect: DOMRect) =>
    Math.round(Math.round(((clientY - rect.top) / slotHeightPx) * slotIncrementMinutes) / 5) * 5;

  /**
   * Walks up the DOM to find the scrollable time-grid container.
   * BreakMarginChip is always rendered inside `<div className="absolute inset-0">`,
   * so `.closest('.absolute')?.parentElement` reliably reaches the grid wrapper.
   */
  const getContainerRect = (target: EventTarget | null) =>
    (target as Element | null)?.closest('.absolute')?.parentElement?.getBoundingClientRect() ?? null;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);

    // Replace the browser's default ghost image with an off-screen clone so we
    // control exactly what the user sees while dragging.
    const ghost = e.currentTarget.parentElement?.cloneNode(true) as HTMLElement;
    ghost.style.cssText = 'position:absolute;top:-1000px;';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 20, 10);
    setTimeout(() => document.body.removeChild(ghost), 0);

    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // clientY === 0 means the drag was cancelled or the cursor left the window.
    // Ignore these spurious events to avoid snapping to the top of the grid.
    if (e.clientY === 0) return;

    const rect = getContainerRect(e.currentTarget);
    if (!rect) return;

    const snappedMinutes = snapToMinutes(e.clientY, rect);
    const snappedY = (snappedMinutes / slotIncrementMinutes) * slotHeightPx;
    setDragPreviewY(snappedY);
    onDragPreviewChange?.(snappedY, index);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragPreviewY(null);
    onDragPreviewChange?.(null, index);

    const rect = getContainerRect(e.currentTarget);
    if (!rect || !onDragBreak) return;

    const snappedMinutes = snapToMinutes(e.clientY, rect);
    if (snappedMinutes !== pomodoroBreak.startMinutes && snappedMinutes >= 0) {
      onDragBreak(index, snappedMinutes);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return { isDragging, dragPreviewY, handleDragStart, handleDrag, handleDragEnd, handleDragOver };
}
