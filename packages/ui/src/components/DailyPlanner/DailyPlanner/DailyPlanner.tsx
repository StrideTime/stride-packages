import { useState, useRef, useEffect, useMemo } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { ChevronLeft, ChevronRight, Check, Coffee, Plus, RotateCcw, Timer, Wand2 } from 'lucide-react';
import {
  Button, Badge, Card,
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectSeparator, SelectTrigger, SelectValue,
} from '@primitives';
import { TimeGrid } from '../TimeGrid';
import { TimeBlock } from '../TimeBlock';
import { DayPlannerSidebar } from '../DayPlannerSidebar';
import {
  AddEventDialog,
  PomodoroConfigDialog,
  EditEventDialog,
  ExternalEventMetadataDialog,
} from '../Dialogs';
import { generateTimeSlots, formatDuration, getEventPosition, calculateOverlappingGroups } from '../utils';
import { usePomodoroSchedule, useDailyPlannerDnd } from '../hooks';
import { DEFAULT_POMODORO_PRESETS } from '../utils/DailyPlanner.pomodoro.utils';
import type { ScheduledEvent, ScheduledEventType, Task, Project } from '@stridetime/types';
import { formatMinutes, cn } from '@utils';
import styles from './DailyPlanner.module.css';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const PomodoroBreakType = {
  SHORT: 'short',
  LONG: 'long',
} as const;
export type PomodoroBreakType = (typeof PomodoroBreakType)[keyof typeof PomodoroBreakType];

// ─── Pomodoro types ───────────────────────────────────────────────────────────

export type PomodoroPreset = {
  id: string;
  name: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLong: number;
};

export type PomodoroSettings = {
  enabled: boolean;
  /** HH:mm — start time for schedule generation */
  startTime: string;
  /** The preset this session was initialized from; null when no preset is selected */
  presetId: string | null;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLong: number;
};

export type PomodoroBreak = {
  type: PomodoroBreakType;
  startMinutes: number;
  durationMinutes: number;
};

// ─── Component props ──────────────────────────────────────────────────────────

export type DailyPlannerProps = {
  date: Date;
  scheduledEvents: ScheduledEvent[];
  plannedTasks: Task[];
  recommendedTasks?: Task[];
  searchResults?: Task[];
  tasks: Task[];
  projects: Project[];
  onDateChange?: (date: Date) => void;
  onScheduleTask?: (taskId: string, startTime: string, durationMinutes: number) => void;
  onSearchTasks?: (query: string) => void;
  onAddEvent?: (event: {
    label: string;
    startTime: string;
    durationMinutes: number;
    type: ScheduledEventType;
    recurring: boolean;
  }) => void;
  onMoveEvent?: (eventId: string, newStartTime: string) => void;
  onResizeEvent?: (eventId: string, newDurationMinutes: number) => void;
  onRemoveEvent?: (eventId: string) => void;
  onEditEvent?: (
    eventId: string,
    updates: {
      label?: string;
      startTime?: string;
      durationMinutes?: number;
      type?: ScheduledEventType;
      taskId?: string | null;
    },
  ) => void;
  slotHeightPx?: number;
  slotIncrementMinutes?: number;
  scrollToHour?: number;
  workingHoursStart?: number;
  workingHoursEnd?: number;
  pomodoroPresets?: PomodoroPreset[];
  pomodoroSettings?: PomodoroSettings;
  onPomodoroSettingsChange?: (settings: PomodoroSettings) => void;
  onCreatePomodoroPreset?: (preset: Omit<PomodoroPreset, 'id'>) => void;
  onUpdatePomodoroPreset?: (id: string, updates: Partial<Omit<PomodoroPreset, 'id'>>) => void;
  onDeletePomodoroPreset?: (id: string) => void;
};

export function DailyPlanner({
  date,
  scheduledEvents,
  plannedTasks,
  recommendedTasks,
  searchResults,
  tasks,
  projects,
  onDateChange,
  onScheduleTask,
  onSearchTasks,
  onAddEvent,
  onMoveEvent,
  onResizeEvent,
  onRemoveEvent,
  onEditEvent,
  slotHeightPx = 32,
  slotIncrementMinutes = 15,
  scrollToHour = 6,
  workingHoursStart = 9,
  workingHoursEnd = 17,
  pomodoroPresets,
  pomodoroSettings,
  onPomodoroSettingsChange,
  onCreatePomodoroPreset,
  onUpdatePomodoroPreset,
  onDeletePomodoroPreset,
}: DailyPlannerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [metadataEventId, setMetadataEventId] = useState<string | null>(null);
  const [addEventOpen, setAddEventOpen] = useState(false);

  const presets = pomodoroPresets ?? DEFAULT_POMODORO_PRESETS;

  const pomodoro = usePomodoroSchedule(presets, pomodoroSettings, onPomodoroSettingsChange);
  const dnd = useDailyPlannerDnd({
    plannedTasks, recommendedTasks, searchResults, scheduledEvents, tasks, projects,
    onScheduleTask, onMoveEvent, scrollRef,
  });

  const timeSlots = useMemo(() => generateTimeSlots(slotIncrementMinutes), [slotIncrementMinutes]);
  const isToday = date.toDateString() === new Date().toDateString();

  useEffect(() => {
    if (scrollRef.current && !hasScrolledRef.current) {
      const targetIndex = timeSlots.indexOf(`${scrollToHour.toString().padStart(2, '0')}:00`);
      if (targetIndex !== -1) {
        const scrollPosition = targetIndex * slotHeightPx;
        setTimeout(() => {
          scrollRef.current?.scrollTo({ top: scrollPosition, behavior: 'smooth' });
          hasScrolledRef.current = true;
        }, 100);
      }
    }
  }, [scrollToHour, slotHeightPx, timeSlots]);

  useEffect(() => { hasScrolledRef.current = false; }, [date]);

  const navigateDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    onDateChange?.(newDate);
  };

  const handlePreviousDay = () => navigateDate(-1);
  const handleNextDay = () => navigateDate(1);
  const handleTodayClick = () => onDateChange?.(new Date());

  const handleRequestEdit = (eventId: string) => setEditingEventId(eventId);
  const handleRequestViewMetadata = (eventId: string) => setMetadataEventId(eventId);
  const handleEditDialogOpenChange = (open: boolean) => { if (!open) setEditingEventId(null); };
  const handleMetadataDialogOpenChange = (open: boolean) => { if (!open) setMetadataEventId(null); };

  const handleEditSave = (
    eventId: string,
    updates: Parameters<NonNullable<DailyPlannerProps['onEditEvent']>>[1],
  ) => {
    onEditEvent?.(eventId, updates);
    setEditingEventId(null);
  };

  const handleEditDelete = (eventId: string) => {
    onRemoveEvent?.(eventId);
    setEditingEventId(null);
  };

  const totalFocusMinutes = useMemo(
    () => scheduledEvents.reduce((acc, e) => acc + e.durationMinutes, 0),
    [scheduledEvents],
  );

  const totalBreakMinutes = useMemo(
    () => pomodoro.totalBreakMinutes
      + scheduledEvents
          .filter(e => e.type === 'BREAK')
          .reduce((acc, e) => acc + e.durationMinutes, 0),
    [pomodoro.totalBreakMinutes, scheduledEvents],
  );

  const overlappingGroups = useMemo(
    () => calculateOverlappingGroups(scheduledEvents),
    [scheduledEvents],
  );

  const enrichedEvents = useMemo(() =>
    scheduledEvents.map(event => {
      const task = event.taskId ? tasks.find(t => t.id === event.taskId) : undefined;
      const project = task ? projects.find(p => p.id === task.projectId) : undefined;
      const overlapGroup = overlappingGroups.get(event.id);
      const overlapCount = overlapGroup ? overlapGroup.length : 1;
      const overlapIndex = overlapGroup ? overlapGroup.findIndex(e => e.id === event.id) : 0;
      const { top, height } = getEventPosition(event.startTime, event.durationMinutes, slotHeightPx, slotIncrementMinutes);
      return {
        event, task, project, top, height,
        width: `${100 / overlapCount}%`,
        left: `${(overlapIndex / overlapCount) * 100}%`,
      };
    }),
    [scheduledEvents, tasks, projects, overlappingGroups, slotHeightPx, slotIncrementMinutes],
  );

  const editingEvent = editingEventId ? scheduledEvents.find(e => e.id === editingEventId) ?? null : null;
  const metadataEvent = metadataEventId ? scheduledEvents.find(e => e.id === metadataEventId) ?? null : null;

  const activePomodoroPreset = presets.find(p => p.id === pomodoro.settings.presetId);
  const pomodoroValuesMatchPreset = !!activePomodoroPreset
    && activePomodoroPreset.focusMinutes === pomodoro.settings.focusMinutes
    && activePomodoroPreset.shortBreakMinutes === pomodoro.settings.shortBreakMinutes
    && activePomodoroPreset.longBreakMinutes === pomodoro.settings.longBreakMinutes
    && activePomodoroPreset.cyclesBeforeLong === pomodoro.settings.cyclesBeforeLong;
  const pomodoroSelectValue = pomodoroValuesMatchPreset ? pomodoro.settings.presetId! : '__custom__';

  const handlePomodoroSelectChange = (value: string) => {
    if (value === '__edit__') pomodoro.handleConfigure();
    else if (value === '__custom__') pomodoro.updateSettings({ presetId: null });
    else pomodoro.handlePresetChange(value);
  };

  return (
    <DndContext sensors={dnd.sensors} onDragStart={dnd.handleDragStart} onDragEnd={dnd.handleDragEnd} collisionDetection={closestCenter}>
      <div className={styles.container}>
        <DayPlannerSidebar
          plannedTasks={plannedTasks}
          recommendedTasks={recommendedTasks}
          searchResults={searchResults}
          projects={projects}
          onSearchTasks={onSearchTasks}
        />

        <div className={styles.mainPanel}>
          <div className={styles.header}>
            <div className={styles.dateNav}>
              <Button variant="outline" size="icon" className={styles.navBtn} onClick={handlePreviousDay}>
                <ChevronLeft className={styles.navIcon} />
              </Button>
              <div className={styles.dateInfo}>
                <span className={styles.dateTitle}>
                  {date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                </span>
                {isToday
                  ? <span className={styles.todayPill}>Today</span>
                  : onDateChange && (
                    <button className={styles.jumpToToday} onClick={handleTodayClick}>
                      <RotateCcw style={{ height: '0.625rem', width: '0.625rem' }} />
                      Today
                    </button>
                  )
                }
              </div>
              <Button variant="outline" size="icon" className={styles.navBtn} onClick={handleNextDay}>
                <ChevronRight className={styles.navIcon} />
              </Button>
            </div>
            {(totalFocusMinutes > 0 || totalBreakMinutes > 0) && (
              <>
                <div className={styles.headerDivider} />
                <div className={styles.headerStats}>
                  {totalFocusMinutes > 0 && (
                    <span className={cn(styles.statChip, styles.statChipFocus)}>
                      <Timer style={{ height: '0.75rem', width: '0.75rem' }} />
                      {formatMinutes(totalFocusMinutes)} focus
                    </span>
                  )}
                  {totalBreakMinutes > 0 && (
                    <span className={cn(styles.statChip, styles.statChipBreak)}>
                      <Coffee style={{ height: '0.75rem', width: '0.75rem' }} />
                      {formatMinutes(totalBreakMinutes)} break
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <div className={styles.pomodoroBar}>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                styles.pomodoroToggle,
                pomodoro.settings.enabled ? styles.pomodoroToggleOn : styles.pomodoroToggleOff,
              )}
              onClick={() => pomodoro.handleToggle(!pomodoro.settings.enabled)}
            >
              <span className={cn(styles.checkboxIcon, pomodoro.settings.enabled && styles.checkboxIconChecked)}>
                {pomodoro.settings.enabled && <Check style={{ height: '0.5rem', width: '0.5rem', strokeWidth: 3 }} />}
              </span>
              Pomodoro
            </Button>
            {pomodoro.settings.enabled && (
              <>
                <Select value={pomodoroSelectValue} onValueChange={handlePomodoroSelectChange}>
                  <SelectTrigger className={styles.pomodoroSelect}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className={cn('px-2 pt-1.5 pb-0.5', styles.pomodoroSelectLabel)}>
                        Presets
                      </SelectLabel>
                      {presets.map(preset => (
                        <SelectItem checkRight key={preset.id} value={preset.id}>{preset.name}</SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectItem checkRight value="__custom__">Custom</SelectItem>
                    <SelectItem checkRight value="__edit__" className={styles.pomodoroSelectMuted}>
                      Edit Presets…
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className={styles.smartDistributeBtn}
                  onClick={pomodoro.handleSmartDistribute}
                  title="Smart Distribute"
                >
                  <Wand2 style={{ height: '0.875rem', width: '0.875rem' }} />
                </Button>
              </>
            )}
          </div>

          <div className={styles.content}>
            {onAddEvent && (
              <>
                <button className={styles.fab} onClick={() => setAddEventOpen(true)}>
                  <Plus style={{ height: '1.25rem', width: '1.25rem' }} strokeWidth={3} />
                </button>
                <AddEventDialog
                  date={date}
                  open={addEventOpen}
                  onOpenChange={setAddEventOpen}
                  onAdd={onAddEvent}
                />
              </>
            )}
            <div className={styles.scrollArea} ref={scrollRef}>
              <TimeGrid
                timeSlots={timeSlots}
                slotHeightPx={slotHeightPx}
                slotIncrementMinutes={slotIncrementMinutes}
                pomodoroBreaks={pomodoro.pomodoroBreaks}
                workingHoursStart={workingHoursStart}
                workingHoursEnd={workingHoursEnd}
                onAdjustBreakDuration={pomodoro.handleAdjustBreakDuration}
                onDeleteBreak={pomodoro.handleDeleteBreak}
                onAddBreakAtTime={pomodoro.handleAddBreakAtTime}
                onDragBreak={pomodoro.handleDragBreak}
              >
                {enrichedEvents.map(({ event, task, project, top, height, width, left }) => (
                  <TimeBlock
                    key={event.id}
                    event={event}
                    task={task}
                    project={project}
                    top={top}
                    height={height}
                    width={width}
                    left={left}
                    isDraggable={event.externalSource === null}
                    slotHeightPx={slotHeightPx}
                    slotIncrementMinutes={slotIncrementMinutes}
                    onRemove={onRemoveEvent}
                    onResize={onResizeEvent}
                    onMoveStart={onMoveEvent}
                    onRequestEdit={handleRequestEdit}
                    onRequestViewMetadata={handleRequestViewMetadata}
                  />
                ))}
              </TimeGrid>
            </div>
          </div>
        </div>

        {dnd.activeItem && dnd.cursorPosition && (
          <div
            className={styles.dragPreviewWrapper}
            style={{
              position: 'fixed',
              left: dnd.cursorPosition.x,
              top: dnd.cursorPosition.y,
              transform: 'translate(-50%, -20px)',
            }}
          >
            <Card className={styles.dragPreviewCard}>
              <div className={styles.dragPreviewContent}>
                <div className={styles.dragPreviewMain}>
                  <div className={styles.dragPreviewTitle}>{dnd.activeItem.title}</div>
                  {dnd.activeItem.projectName && (
                    <div className={styles.dragPreviewProject}>
                      <div
                        className={styles.dragPreviewProjectDot}
                        style={{ backgroundColor: dnd.activeItem.projectColor || '#3b82f6' }}
                      />
                      <span className={styles.dragPreviewProjectName}>{dnd.activeItem.projectName}</span>
                    </div>
                  )}
                </div>
                {dnd.activeItem.duration && (
                  <Badge variant="outline">{formatDuration(dnd.activeItem.duration)}</Badge>
                )}
              </div>
            </Card>
          </div>
        )}

        {pomodoro.settings.enabled && (
          <PomodoroConfigDialog
            settings={pomodoro.settings}
            presets={presets}
            open={pomodoro.configDialogOpen}
            onOpenChange={pomodoro.setConfigDialogOpen}
            onSaveSettings={pomodoro.updateSettings}
            onCreatePreset={onCreatePomodoroPreset}
            onUpdatePreset={onUpdatePomodoroPreset}
            onDeletePreset={onDeletePomodoroPreset}
          />
        )}

        {editingEvent && (
          <EditEventDialog
            event={editingEvent}
            tasks={tasks}
            projects={projects}
            open={editingEventId !== null}
            onOpenChange={handleEditDialogOpenChange}
            onSave={handleEditSave}
            onDelete={handleEditDelete}
          />
        )}

        {metadataEvent && (
          <ExternalEventMetadataDialog
            event={metadataEvent}
            open={metadataEventId !== null}
            onOpenChange={handleMetadataDialogOpenChange}
          />
        )}
      </div>
    </DndContext>
  );
}
