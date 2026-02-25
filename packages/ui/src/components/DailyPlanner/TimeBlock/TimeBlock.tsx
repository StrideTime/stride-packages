import { useEffect, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { X, ListTodo, Users, Coffee, Focus, Circle } from 'lucide-react';
import { Button } from '@primitives';
import { cn } from '@utils';
import { formatTime12Hour, timeToMinutes, minutesToTime } from '../utils';
import { getExternalSourceConfig } from '../utils/externalSourceConfig';
import { useTimeBlockResize } from '../hooks';
import type { ScheduledEvent, Task, Project } from '@stridetime/types';
import styles from './TimeBlock.module.css';

export type TimeBlockProps = {
  event: ScheduledEvent;
  task?: Task;
  project?: Project;
  top: number;
  height: number;
  width: string;
  left: string;
  isDraggable?: boolean;
  slotHeightPx?: number;
  slotIncrementMinutes?: number;
  onRemove?: (eventId: string) => void;
  onResize?: (eventId: string, newDurationMinutes: number) => void;
  onMoveStart?: (eventId: string, newStartTime: string) => void;
  onRequestEdit?: (eventId: string) => void;
  onRequestViewMetadata?: (eventId: string) => void;
};

export const EVENT_TYPE_CONFIG: Record<string, { icon: typeof ListTodo }> = {
  TASK:    { icon: ListTodo },
  MEETING: { icon: Users    },
  BREAK:   { icon: Coffee   },
  FOCUS:   { icon: Focus    },
  OTHER:   { icon: Circle   },
};

const TYPE_CLASS: Record<string, string> = {
  TASK:    styles.typeTask,
  MEETING: styles.typeMeeting,
  BREAK:   styles.typeBreak,
  FOCUS:   styles.typeFocus,
  OTHER:   styles.typeOther,
};

const SOURCE_CLASS: Record<string, string> = {
  GOOGLE_CALENDAR: styles.sourceGoogleCalendar,
  OUTLOOK:         styles.sourceOutlook,
  SLACK:           styles.sourceSlack,
  JIRA:            styles.sourceJira,
};

export function TimeBlock({
  event,
  task,
  project,
  top,
  height,
  width,
  left,
  isDraggable = true,
  slotHeightPx = 32,
  slotIncrementMinutes = 15,
  onRemove,
  onResize,
  onMoveStart,
  onRequestEdit,
  onRequestViewMetadata,
}: TimeBlockProps) {
  const justDraggedRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExternalEvent = event.externalSource !== null;
  const typeConfig = EVENT_TYPE_CONFIG[event.type];
  const TypeIcon = typeConfig.icon;
  const sourceConfig = isExternalEvent ? getExternalSourceConfig(event.externalSource) : null;
  const SourceIcon = sourceConfig?.Icon ?? null;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: event.id,
    disabled: !isDraggable,
  });

  const { resizing, displayTop, displayHeight, handleResizeStart, justResizedRef } = useTimeBlockResize({
    top,
    height,
    startTime: event.startTime,
    durationMinutes: event.durationMinutes,
    eventId: event.id,
    slotHeightPx,
    slotIncrementMinutes,
    onResize,
    onMoveStart,
  });

  useEffect(() => {
    if (!isDragging && justDraggedRef.current) {
      setTimeout(() => { justDraggedRef.current = false; }, 100);
    } else if (isDragging) {
      justDraggedRef.current = true;
    }
  }, [isDragging]);

  const endTimeStr = minutesToTime(timeToMinutes(event.startTime) + event.durationMinutes);
  const isSmallEvent = event.durationMinutes < 45;
  const isTinyEvent = event.durationMinutes <= 15;

  const colorClass = isExternalEvent
    ? (SOURCE_CLASS[event.externalSource ?? ''] ?? styles.sourceExternal)
    : (TYPE_CLASS[event.type] ?? styles.typeOther);

  let externalCalendarName: string | undefined;
  if (isExternalEvent && event.metadata) {
    try { externalCalendarName = JSON.parse(event.metadata).calendarName; } catch {}
  }

  const handleBlockClick = (e: React.MouseEvent) => {
    if (justResizedRef.current || justDraggedRef.current || isDragging || resizing) return;
    if ((e.target as HTMLElement).closest('button')) return;
    if (isExternalEvent) {
      onRequestViewMetadata?.(event.id);
    } else {
      onRequestEdit?.(event.id);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(event.id);
  };

  const handleResizeTopMouseDown = (e: React.MouseEvent) => handleResizeStart(e, 'top');
  const handleResizeBottomMouseDown = (e: React.MouseEvent) => handleResizeStart(e, 'bottom');
  const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        styles.block,
        colorClass,
        isTinyEvent ? styles.blockTiny : styles.blockPadded,
        isDragging && styles.isDragging,
        resizing && styles.isResizing,
        isHovered && !isDragging && !resizing && styles.isHovered,
        isDraggable && !isExternalEvent && !resizing && styles.isDraggable,
      )}
      style={{
        top: `${displayTop + 2}px`,
        height: `${Math.max(0, displayHeight - 4)}px`,
        width: `calc(${width} - 4px)`,
        left: `calc(${left} + 2px)`,
        ...(isDragging && { zIndex: 50 }),
      }}
      onClick={handleBlockClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...attributes}
      {...(isDraggable && !isExternalEvent && !resizing ? listeners : {})}
    >
      <div className={styles.body}>
        {isTinyEvent ? (
          <div className={styles.tinyRow}>
            {isExternalEvent && SourceIcon
              ? <SourceIcon className={styles.iconXs} />
              : <TypeIcon className={styles.iconXsFaded} />
            }
            <span className={styles.titleTiny}>
              {task ? task.title : event.label}
            </span>
            <span className={styles.startTime}>
              {formatTime12Hour(event.startTime)}
            </span>
            {!isExternalEvent && onRemove && (
              <Button
                size="icon"
                variant="ghost"
                className={cn(styles.removeBtn, styles.removeBtnTiny, isHovered ? styles.btnVisible : styles.btnHidden)}
                style={{ backgroundColor: 'transparent' }}
                onClick={handleRemoveClick}
              >
                <X style={{ height: '0.5rem', width: '0.5rem' }} />
              </Button>
            )}
          </div>
        ) : isSmallEvent ? (
          <>
            <div className={styles.smallHeader}>
              {isExternalEvent && SourceIcon
                ? <SourceIcon className={styles.iconSm} />
                : <TypeIcon className={styles.iconXsFaded} />
              }
              <span className={styles.titleSmall}>
                {task ? task.title : event.label}
              </span>
              {!isExternalEvent && onRemove && (
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(styles.removeBtn, styles.removeBtnSmall, isHovered ? styles.btnVisible : styles.btnHidden)}
                  style={{ backgroundColor: 'transparent' }}
                  onClick={handleRemoveClick}
                >
                  <X style={{ height: '0.5rem', width: '0.5rem' }} />
                </Button>
              )}
            </div>
            <div className={styles.smallFooter}>
              {isExternalEvent ? (
                <span className={styles.calendarLabel}>{externalCalendarName ?? sourceConfig?.label}</span>
              ) : (
                <>
                  {project && (
                    <div className={styles.projectDot} style={{ backgroundColor: project.color || '#3b82f6' }} />
                  )}
                  <span className={styles.timeRange}>
                    {formatTime12Hour(event.startTime)}–{formatTime12Hour(endTimeStr)}
                  </span>
                </>
              )}
            </div>
          </>
        ) : isExternalEvent ? (
          <>
            <div className={styles.largeExternalHeader}>
              {SourceIcon && <SourceIcon className={styles.iconMd} />}
              <span className={styles.titleLarge}>{event.label}</span>
            </div>
            <div className={styles.largeCalendarName}>
              {externalCalendarName ?? sourceConfig?.label}
            </div>
            <div className={styles.largeTimeRange}>
              {formatTime12Hour(event.startTime)} – {formatTime12Hour(endTimeStr)}
            </div>
          </>
        ) : (
          <>
            <div className={styles.largeHeader}>
              <TypeIcon className={styles.iconSmFaded} />
              <span className={styles.largeTitle}>
                {task ? task.title : event.label}
              </span>
              {onRemove && (
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(styles.removeBtn, styles.removeBtnLarge, isHovered ? styles.btnVisible : styles.btnHidden)}
                  style={{ backgroundColor: 'transparent' }}
                  onClick={handleRemoveClick}
                >
                  <X style={{ height: '0.75rem', width: '0.75rem' }} />
                </Button>
              )}
            </div>
            {project && (
              <div className={styles.projectRow}>
                <div className={styles.projectDot} style={{ backgroundColor: project.color || '#3b82f6' }} />
                <span className={styles.projectName}>{project.name}</span>
              </div>
            )}
            <div className={styles.largeFooterTime}>
              {formatTime12Hour(event.startTime)} – {formatTime12Hour(endTimeStr)}
            </div>
          </>
        )}
      </div>

      {!isExternalEvent && !isTinyEvent && (onResize || onMoveStart) && (
        <>
          {onMoveStart && onResize && (
            <div
              className={cn(
                styles.resizeHandle,
                styles.resizeHandleTop,
                isHovered ? styles.resizeHandleVisible : styles.resizeHandleHidden,
              )}
              onMouseDown={handleResizeTopMouseDown}
              onPointerDown={stopPropagation}
              onClick={stopPropagation}
            >
              <div className={styles.resizeBar} />
            </div>
          )}
          {onResize && (
            <div
              className={cn(
                styles.resizeHandle,
                styles.resizeHandleBottom,
                isHovered ? styles.resizeHandleVisible : styles.resizeHandleHidden,
              )}
              onMouseDown={handleResizeBottomMouseDown}
              onPointerDown={stopPropagation}
              onClick={stopPropagation}
            >
              <div className={styles.resizeBar} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
