import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../../utils/cn';
import styles from './TimeSlot.module.css';

export type TimeSlotProps = {
  time: string;
  index: number;
  slotHeightPx: number;
  muted: boolean;
};

export function TimeSlot({ time, index, slotHeightPx, muted = false }: TimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `time-slot-${time}` });
  const isHourMarker = time.split(':')[1] === '00';

  return (
    <div
      ref={setNodeRef}
      className={cn(
        styles.slot,
        isOver && styles.slotOver,
        muted && styles.slotMuted,
        isHourMarker ? styles.slotHourMarker : styles.slotSubMarker,
      )}
      style={{ top: `${index * slotHeightPx}px`, height: `${slotHeightPx}px` }}
    />
  );
}
