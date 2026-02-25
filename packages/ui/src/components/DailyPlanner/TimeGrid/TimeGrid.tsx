import { useState, useRef } from 'react';
import { Coffee, Plus } from 'lucide-react';
import { Badge } from '@primitives';
import { cn } from '@utils';
import { formatTime12Hour, isWorkingHour } from '../utils';
import { TimeSlot } from '../TimeSlot';
import { BreakOverlay } from '../Pomodoro/BreakOverlay';
import { BreakMarginControls } from '../Pomodoro/BreakMarginControls';
import type { ReactNode } from 'react';
import type { PomodoroBreak } from '../DailyPlanner/DailyPlanner';
import styles from './TimeGrid.module.css';

export type TimeGridProps = {
  timeSlots: string[];
  slotHeightPx?: number;
  slotIncrementMinutes?: number;
  pomodoroBreaks?: PomodoroBreak[];
  workingHoursStart?: number;
  workingHoursEnd?: number;
  onAdjustBreakDuration?: (breakIndex: number, newDuration: number) => void;
  onDeleteBreak?: (breakIndex: number) => void;
  onAddBreakAtTime?: (startMinutes: number) => void;
  onDragBreak?: (breakIndex: number, newStartMinutes: number) => void;
  children?: ReactNode;
};

export function TimeGrid({
  timeSlots,
  slotHeightPx = 32,
  slotIncrementMinutes = 15,
  pomodoroBreaks = [],
  workingHoursStart = 9,
  workingHoursEnd = 17,
  onAdjustBreakDuration,
  onDeleteBreak,
  onAddBreakAtTime,
  onDragBreak,
  children,
}: TimeGridProps) {
  const [dragPreview, setDragPreview] = useState<{ y: number; breakIndex: number } | null>(null);
  const [marginHovered, setMarginHovered] = useState(false);
  const [isDraggingAddBreak, setIsDraggingAddBreak] = useState(false);
  const [addBreakPreviewMinutes, setAddBreakPreviewMinutes] = useState<number | null>(null);
  const marginRef = useRef<HTMLDivElement>(null);

  const hourSlots = timeSlots.filter((_, i) => i % 4 === 0);
  const hourHeight = slotHeightPx * 4;
  const hasBreaks = pomodoroBreaks.length > 0;

  const snapToMinutes = (clientY: number, rect: DOMRect) =>
    Math.max(0, Math.round(Math.round(((clientY - rect.top) / slotHeightPx) * slotIncrementMinutes) / 5) * 5);

  const handleDragPreviewChange = (y: number | null, breakIndex: number) => {
    setDragPreview(y === null ? null : { y, breakIndex });
  };

  const handleMarginEnter = () => setMarginHovered(true);
  const handleMarginLeave = () => setMarginHovered(false);
  const preventDragDefault = (e: React.DragEvent) => e.preventDefault();

  const handleAddBreakDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDraggingAddBreak(true);
    const rect = marginRef.current?.getBoundingClientRect();
    if (rect) setAddBreakPreviewMinutes(snapToMinutes(e.clientY, rect));
    const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
    ghost.style.cssText = 'position:absolute;top:-1000px;left:-1000px;';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
    setTimeout(() => document.body.removeChild(ghost), 0);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddBreakDrag = (e: React.DragEvent) => {
    if (e.clientY === 0) return;
    const rect = marginRef.current?.getBoundingClientRect();
    if (rect) setAddBreakPreviewMinutes(snapToMinutes(e.clientY, rect));
  };

  const handleAddBreakDragEnd = (e: React.DragEvent) => {
    const rect = marginRef.current?.getBoundingClientRect();
    if (rect) onAddBreakAtTime?.(snapToMinutes(e.clientY, rect));
    setIsDraggingAddBreak(false);
    setAddBreakPreviewMinutes(null);
  };

  const dragPreviewBreak: PomodoroBreak | null =
    dragPreview ? (pomodoroBreaks[dragPreview.breakIndex] ?? null) : null;
  const dragPreviewIsLong = dragPreviewBreak ? dragPreviewBreak.durationMinutes >= 15 : false;
  const dragPreviewBorderColor = dragPreviewIsLong ? '#10b981' : '#a855f7';
  const dragPreviewBgColor = dragPreviewIsLong ? 'rgba(16, 185, 129, 0.15)' : 'rgba(168, 85, 247, 0.15)';

  return (
    <div className={styles.grid}>
      <div
        ref={marginRef}
        className={cn(styles.margin, hasBreaks ? styles.marginWide : styles.marginNarrow)}
        onDragOver={preventDragDefault}
        onDrop={preventDragDefault}
        onMouseEnter={handleMarginEnter}
        onMouseLeave={handleMarginLeave}
      >
        {hasBreaks && onAddBreakAtTime && (
          <div className={styles.addBreakSticky}>
            <div
              className={cn(
                styles.addBreakButton,
                (marginHovered || isDraggingAddBreak) ? styles.addBreakVisible : styles.addBreakHidden,
              )}
              draggable
              onDragStart={handleAddBreakDragStart}
              onDrag={handleAddBreakDrag}
              onDragEnd={handleAddBreakDragEnd}
            >
              <Plus style={{ height: '0.75rem', width: '0.75rem' }} />
              Add break
            </div>
          </div>
        )}

        {hourSlots.map(time => (
          <div
            key={time}
            style={{ height: `${hourHeight}px` }}
            className={cn(
              styles.hourLabel,
              isWorkingHour(time, workingHoursStart, workingHoursEnd)
                ? styles.hourLabelWorking
                : styles.hourLabelOffHours,
            )}
          >
            {formatTime12Hour(time)}
          </div>
        ))}

        {hasBreaks && (
          <div className={styles.marginOverlay}>
            <BreakMarginControls
              pomodoroBreaks={pomodoroBreaks}
              slotHeightPx={slotHeightPx}
              slotIncrementMinutes={slotIncrementMinutes}
              onAdjustDuration={onAdjustBreakDuration}
              onDeleteBreak={onDeleteBreak}
              onDragBreak={onDragBreak}
              onDragPreviewChange={handleDragPreviewChange}
            />
          </div>
        )}

        {isDraggingAddBreak && addBreakPreviewMinutes !== null && (
          <Badge
            variant="outline"
            className={styles.breakPreviewBadge}
            style={{
              top: `${(addBreakPreviewMinutes / slotIncrementMinutes) * slotHeightPx + 2}px`,
              borderColor: '#3b82f6',
              color: '#3b82f6',
              borderStyle: 'dashed',
              borderWidth: '2px',
              zIndex: 50,
            }}
          >
            <Coffee style={{ height: '0.75rem', width: '0.75rem' }} />
            Break here
          </Badge>
        )}
      </div>

      <div
        className={styles.content}
        onDragOver={preventDragDefault}
        onDrop={preventDragDefault}
      >
        <div className={styles.slotsLayer}>
          {timeSlots.map((time, index) => (
            <TimeSlot
              key={time}
              time={time}
              muted={!isWorkingHour(time, workingHoursStart, workingHoursEnd)}
              index={index}
              slotHeightPx={slotHeightPx}
            />
          ))}
        </div>

        {hasBreaks && (
          <div className={styles.breaksLayer}>
            {pomodoroBreaks.map((pomodoroBreak, index) => (
              <BreakOverlay
                key={`break-${index}`}
                pomodoroBreak={pomodoroBreak}
                slotHeightPx={slotHeightPx}
                slotIncrementMinutes={slotIncrementMinutes}
              />
            ))}
          </div>
        )}

        {dragPreview && dragPreviewBreak && (
          <div
            className={styles.dragPreviewLayer}
            style={{ top: `${dragPreview.y}px`, height: `${(dragPreviewBreak.durationMinutes / slotIncrementMinutes) * slotHeightPx}px`, zIndex: 50 }}
          >
            <div
              className={styles.dragPreviewBox}
              style={{ borderColor: dragPreviewBorderColor, backgroundColor: dragPreviewBgColor }}
            />
          </div>
        )}

        <div
          className={styles.eventsLayer}
          style={{
            minHeight: `${timeSlots.length * slotHeightPx}px`,
            ...(hasBreaks ? { marginLeft: '20px' } : {}),
          }}
        >
          {children}
        </div>

      </div>
    </div>
  );
}
