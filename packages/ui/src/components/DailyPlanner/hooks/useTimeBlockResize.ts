import { useState, useEffect, useRef } from 'react';
import { timeToMinutes, minutesToTime } from '../utils';

type UseTimeBlockResizeParams = {
  top: number;
  height: number;
  startTime: string;
  durationMinutes: number;
  eventId: string;
  slotHeightPx: number;
  slotIncrementMinutes: number;
  onResize?: (eventId: string, newDurationMinutes: number) => void;
  onMoveStart?: (eventId: string, newStartTime: string) => void;
};

/**
 * Manages mouse-driven resize and top-edge drag for a TimeBlock.
 *
 * Returns display positions that track the in-progress resize preview,
 * a `justResizedRef` flag to distinguish resize-end clicks from real clicks,
 * and the `handleResizeStart` initiator to attach to drag-handle elements.
 *
 * Bottom edge → resizes duration only.
 * Top edge    → moves start time and adjusts duration to keep the end fixed.
 */
export function useTimeBlockResize({
  top,
  height,
  startTime,
  durationMinutes,
  eventId,
  slotHeightPx,
  slotIncrementMinutes,
  onResize,
  onMoveStart,
}: UseTimeBlockResizeParams) {
  const [resizing, setResizing] = useState<'top' | 'bottom' | null>(null);
  const [resizePreview, setResizePreview] = useState<{ top: number; height: number } | null>(null);

  /** Set after a resize completes so that the click handler can ignore the
   *  mouseup event that follows every drag. Cleared after 100 ms. */
  const justResizedRef = useRef(false);

  // Clear the preview whenever the server-committed position changes.
  useEffect(() => {
    if (!resizing) setResizePreview(null);
  }, [top, height, resizing]);

  /**
   * Attaches global mousemove / mouseup listeners for the duration of the
   * resize gesture and cleans them up on completion.
   *
   * `edge` controls whether we're dragging the bottom handle (resize only)
   * or the top handle (move start + resize to keep end fixed).
   */
  const handleResizeStart = (e: React.MouseEvent, edge: 'top' | 'bottom') => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(edge);

    document.body.style.overflow = 'hidden';
    document.body.style.userSelect = 'none';

    const startY = e.clientY;
    const startTop = top;
    const startHeight = height;
    const startTimeMinutes = timeToMinutes(startTime);
    const endTimeMinutes = startTimeMinutes + durationMinutes;

    let currentTop = top;
    let currentHeight = height;

    const handleMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaSlots = Math.round((moveEvent.clientY - startY) / slotHeightPx);
      const snappedDelta = deltaSlots * slotHeightPx;

      if (edge === 'bottom') {
        currentHeight = Math.max(slotHeightPx, startHeight + snappedDelta);
        currentTop = startTop;
      } else {
        currentTop = startTop + snappedDelta;
        currentHeight = Math.max(slotHeightPx, startHeight - snappedDelta);
      }

      setResizePreview({ top: currentTop, height: currentHeight });
    };

    const handleEnd = () => {
      if (edge === 'bottom') {
        const newDuration = Math.round(currentHeight / slotHeightPx) * slotIncrementMinutes;
        onResize?.(eventId, newDuration);
      } else {
        const topDeltaSlots = Math.round((currentTop - startTop) / slotHeightPx);
        const newStartMinutes = startTimeMinutes + topDeltaSlots * slotIncrementMinutes;
        onMoveStart?.(eventId, minutesToTime(newStartMinutes));
        onResize?.(eventId, endTimeMinutes - newStartMinutes);
      }

      document.body.style.overflow = '';
      document.body.style.userSelect = '';
      setResizing(null);
      setResizePreview(null);
      justResizedRef.current = true;
      setTimeout(() => { justResizedRef.current = false; }, 100);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
  };

  const displayTop = resizePreview?.top ?? top;
  const displayHeight = resizePreview?.height ?? height;

  return { resizing, displayTop, displayHeight, handleResizeStart, justResizedRef };
}
