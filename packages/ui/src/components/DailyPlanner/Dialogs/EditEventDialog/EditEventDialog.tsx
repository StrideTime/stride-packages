import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../../primitives/Dialog';
import { Button } from '../../../../primitives/Button';
import { Input } from '../../../../primitives/Input';
import { Label } from '../../../../primitives/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../primitives/Select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../../primitives/Command';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../primitives/Popover';
import { Badge } from '../../../../primitives/Badge';
import type { ScheduledEvent, ScheduledEventType, Task, Project } from '@stridetime/types';
import { ScheduledEventType as EventTypeEnum } from '@stridetime/types';
import styles from './EditEventDialog.module.css';

export type EditEventDialogProps = {
  event: ScheduledEvent;
  tasks: Task[];
  projects: Project[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    eventId: string,
    updates: {
      label?: string;
      startTime?: string;
      durationMinutes?: number;
      type?: ScheduledEventType;
      taskId?: string | null;
    },
  ) => void;
  onDelete?: (eventId: string) => void;
};

export function EditEventDialog({ event, tasks, projects, open, onOpenChange, onSave, onDelete }: EditEventDialogProps) {
  const [label, setLabel] = useState(event.label);
  const [startTime, setStartTime] = useState(event.startTime);
  const [durationMinutes, setDurationMinutes] = useState(event.durationMinutes);
  const [type, setType] = useState<ScheduledEventType>(event.type);
  const [taskId, setTaskId] = useState<string | null>(event.taskId);
  const [taskPopoverOpen, setTaskPopoverOpen] = useState(false);

  const linkedTask = useMemo(() => tasks.find(t => t.id === taskId), [tasks, taskId]);
  const linkedProject = useMemo(
    () => linkedTask ? projects.find(p => p.id === linkedTask.projectId) : undefined,
    [linkedTask, projects],
  );

  const isExternal = event.externalSource !== null;
  const isTaskRequired = type === EventTypeEnum.TASK;

  const handleSave = () => {
    if (isTaskRequired && !taskId) return;

    const updates: Parameters<typeof onSave>[1] = {};
    if (label !== event.label) updates.label = label;
    if (startTime !== event.startTime) updates.startTime = startTime;
    if (durationMinutes !== event.durationMinutes) updates.durationMinutes = durationMinutes;
    if (type !== event.type) updates.type = type;
    if (taskId !== event.taskId) updates.taskId = taskId;

    if (Object.keys(updates).length > 0) onSave(event.id, updates);
    onOpenChange(false);
  };

  const handleTaskSelect = (selectedTaskId: string) => {
    const task = tasks.find(t => t.id === selectedTaskId);
    if (task) {
      setTaskId(selectedTaskId);
      if (linkedTask && label === linkedTask.title) setLabel(task.title);
      setTaskPopoverOpen(false);
    }
  };

  const handleClearTask = () => {
    setTaskId(null);
    setTimeout(() => setTaskPopoverOpen(true), 10);
  };

  const handleTypeChange = (newType: ScheduledEventType) => {
    setType(newType);
    if (newType === EventTypeEnum.TASK && !taskId) setTaskPopoverOpen(true);
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '425px' }}>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <div className={styles.form}>
          <div className={styles.fieldGroup}>
            <Label htmlFor="label">Title</Label>
            <Input
              id="label"
              value={label}
              onChange={e => setLabel(e.target.value)}
              disabled={isExternal}
              placeholder="Event title"
            />
            {isExternal && (
              <p className={styles.externalNote}>
                This is an external event from {event.externalSource}
              </p>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="type">Event Type</Label>
            <Select value={type} onValueChange={handleTypeChange} disabled={isExternal}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={EventTypeEnum.TASK}>Task</SelectItem>
                <SelectItem value={EventTypeEnum.MEETING}>Meeting</SelectItem>
                <SelectItem value={EventTypeEnum.BREAK}>Break</SelectItem>
                <SelectItem value={EventTypeEnum.FOCUS}>Focus</SelectItem>
                <SelectItem value={EventTypeEnum.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isExternal && isTaskRequired && (
            <div className={styles.fieldGroup}>
              <Label>Task <span className={styles.required}>*</span></Label>
              {linkedTask ? (
                <div className={styles.linkedTaskDisplay}>
                  {linkedProject && (
                    <div className={styles.projectDot} style={{ backgroundColor: linkedProject.color || '#3b82f6' }} />
                  )}
                  <span className={styles.linkedTaskTitle}>{linkedTask.title}</span>
                  <Button variant="ghost" size="sm" onClick={handleClearTask} className={styles.clearTaskBtn}>
                    <X style={{ height: '0.75rem', width: '0.75rem' }} />
                  </Button>
                </div>
              ) : (
                <Popover open={taskPopoverOpen} onOpenChange={setTaskPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={isTaskRequired && !taskId ? styles.taskComboboxError : styles.taskCombobox}
                      style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', fontWeight: 'normal' }}
                    >
                      {taskId ? 'Task selected' : 'Search tasks...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent style={{ width: '380px', padding: 0 }} align="start">
                    <Command>
                      <CommandInput placeholder="Search tasks..." />
                      <CommandList>
                        <CommandEmpty>No tasks found.</CommandEmpty>
                        <CommandGroup>
                          {tasks.map(task => {
                            const project = projects.find(p => p.id === task.projectId);
                            return (
                              <CommandItem
                                key={task.id}
                                value={task.title}
                                onSelect={() => handleTaskSelect(task.id)}
                                className={styles.commandItem}
                              >
                                {project && (
                                  <div className={styles.projectDot} style={{ backgroundColor: project.color || '#3b82f6' }} />
                                )}
                                <div className={styles.commandItemInfo}>
                                  <div className={styles.commandItemTitle}>{task.title}</div>
                                  {project && <div className={styles.commandItemProject}>{project.name}</div>}
                                </div>
                                {task.estimatedMinutes && (
                                  <Badge variant="outline" style={{ fontSize: '0.75rem' }}>~{Math.round(task.estimatedMinutes / 60)}h</Badge>
                                )}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
              {isTaskRequired && !taskId && (
                <p className={styles.validationError}>Task is required for TASK event type</p>
              )}
            </div>
          )}

          <div className={styles.twoColGrid}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                disabled={isExternal}
              />
            </div>
            <div className={styles.fieldGroup}>
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={durationMinutes}
                onChange={e => setDurationMinutes(parseInt(e.target.value))}
                disabled={isExternal}
              />
            </div>
          </div>
        </div>

        <DialogFooter style={{ gap: '0.5rem' }}>
          {!isExternal && onDelete && (
            <Button variant="destructive" onClick={handleDelete} className={styles.deleteBtn}>Delete</Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isExternal || (isTaskRequired && !taskId)}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
