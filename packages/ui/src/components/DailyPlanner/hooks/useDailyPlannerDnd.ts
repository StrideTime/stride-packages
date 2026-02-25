import { useState, useEffect, useCallback, useMemo } from 'react';
import type { RefObject } from 'react';
import {
  type DragStartEvent,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { ScheduledEvent, Task, Project } from '@stridetime/types';

type UseDailyPlannerDndParams = {
  plannedTasks: Task[];
  recommendedTasks?: Task[];
  searchResults?: Task[];
  scheduledEvents: ScheduledEvent[];
  tasks: Task[];
  projects: Project[];
  onScheduleTask?: (taskId: string, startTime: string, durationMinutes: number) => void;
  onMoveEvent?: (eventId: string, newStartTime: string) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
};

const TASK_PREFIXES = ['planned-', 'rec-', 'search-'] as const;

function extractTaskId(id: string): string | null {
  for (const prefix of TASK_PREFIXES) {
    if (id.startsWith(prefix)) return id.slice(prefix.length);
  }
  return null;
}

/**
 * Manages dnd-kit drag-and-drop for the DailyPlanner.
 *
 * Handles two drag sources:
 *   - Planned/recommended/search task cards → dropped on a time slot to schedule them.
 *   - Existing TimeBlocks                   → dropped on a time slot to move them.
 *
 * Also tracks the live cursor position so `DailyPlanner` can render a
 * floating preview card that follows the mouse during a drag.
 *
 * Locks scroll and user-select on the body for the duration of a drag to
 * prevent accidental page movement.
 */
export function useDailyPlannerDnd({
  plannedTasks,
  recommendedTasks,
  searchResults,
  scheduledEvents,
  tasks,
  projects,
  onScheduleTask,
  onMoveEvent,
  scrollRef,
}: UseDailyPlannerDndParams) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [activeId, handleMouseMove]);

  const allDraggableTasks = useMemo(
    () => new Map([
      ...plannedTasks.map(t => [t.id, t] as const),
      ...(recommendedTasks ?? []).map(t => [t.id, t] as const),
      ...(searchResults ?? []).map(t => [t.id, t] as const),
    ]),
    [plannedTasks, recommendedTasks, searchResults],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    document.body.style.overflow = 'hidden';
    document.body.style.userSelect = 'none';
    if (scrollRef.current) scrollRef.current.style.overflow = 'hidden';
    const { activatorEvent } = event;
    if (activatorEvent && 'clientX' in activatorEvent && 'clientY' in activatorEvent) {
      setCursorPosition({ x: activatorEvent.clientX as number, y: activatorEvent.clientY as number });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setCursorPosition(null);
    document.body.style.overflow = '';
    document.body.style.userSelect = '';
    if (scrollRef.current) scrollRef.current.style.overflow = 'auto';

    if (!over) return;
    const overId = over.id.toString();
    if (!overId.startsWith('time-slot-')) return;

    const detectedTimeSlot = overId.replace('time-slot-', '');
    const activeIdStr = active.id.toString();
    const taskId = extractTaskId(activeIdStr);

    if (taskId !== null) {
      const task = allDraggableTasks.get(taskId);
      if (task && onScheduleTask) {
        onScheduleTask(taskId, detectedTimeSlot, 60);
      }
    } else {
      onMoveEvent?.(activeIdStr, detectedTimeSlot);
    }
  };

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    const taskId = extractTaskId(activeId);
    if (taskId !== null) {
      const task = allDraggableTasks.get(taskId);
      if (!task) return null;
      const project = projects.find(p => p.id === task.projectId);
      return {
        title: task.title,
        projectColor: project?.color,
        projectName: project?.name,
        duration: task.estimatedMinutes,
      };
    }
    const event = scheduledEvents.find(e => e.id === activeId);
    if (!event) return null;
    const task = event.taskId ? tasks.find(t => t.id === event.taskId) : undefined;
    const project = task ? projects.find(p => p.id === task.projectId) : undefined;
    return {
      title: task?.title || event.label,
      projectColor: project?.color,
      projectName: project?.name,
      duration: event.durationMinutes,
    };
  }, [activeId, allDraggableTasks, scheduledEvents, tasks, projects]);

  return { activeId, cursorPosition, sensors, handleDragStart, handleDragEnd, activeItem };
}
