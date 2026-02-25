import { useState } from 'react';
import type { ScheduledEventType } from '@stridetime/types';
import { ScheduledEventType as EventTypeEnum } from '@stridetime/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../../primitives/Dialog';
import { Button } from '../../../../primitives/Button';
import { Input } from '../../../../primitives/Input';
import { Label } from '../../../../primitives/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../primitives/Select';
import { Switch } from '../../../../primitives/Switch';
import styles from './AddEventDialog.module.css';

export type AddEventInput = {
  label: string;
  startTime: string;
  durationMinutes: number;
  type: ScheduledEventType;
  recurring: boolean;
};

export type AddEventDialogProps = {
  date: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (event: AddEventInput) => void;
};

function roundToNearest15(date: Date): string {
  const mins = date.getHours() * 60 + date.getMinutes();
  const rounded = Math.round(mins / 15) * 15;
  const h = Math.floor(rounded / 60) % 24;
  const m = rounded % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function AddEventDialog({ date, open, onOpenChange, onAdd }: AddEventDialogProps) {
  const defaultStartTime = roundToNearest15(date);

  const [type, setType] = useState<ScheduledEventType>(EventTypeEnum.TASK);
  const [label, setLabel] = useState('');
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [recurring, setRecurring] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setType(EventTypeEnum.TASK);
      setLabel('');
      setStartTime(roundToNearest15(new Date()));
      setDurationMinutes(60);
      setRecurring(false);
    }
    onOpenChange(nextOpen);
  };

  const handleAdd = () => {
    onAdd({
      label: label.trim() || type,
      startTime,
      durationMinutes,
      type,
      recurring,
    });
    handleOpenChange(false);
  };

  const isValid = startTime.length > 0 && durationMinutes >= 15;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent style={{ maxWidth: '400px' }}>
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>
        <div className={styles.form}>
          <div className={styles.fieldGroup}>
            <Label htmlFor="add-event-type">Type</Label>
            <Select value={type} onValueChange={v => setType(v as ScheduledEventType)}>
              <SelectTrigger id="add-event-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={EventTypeEnum.TASK}>Task</SelectItem>
                <SelectItem value={EventTypeEnum.MEETING}>Meeting</SelectItem>
                <SelectItem value={EventTypeEnum.BREAK}>Break</SelectItem>
                <SelectItem value={EventTypeEnum.FOCUS}>Focus</SelectItem>
                <SelectItem value={EventTypeEnum.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="add-event-label">Label</Label>
            <Input
              id="add-event-label"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Event label"
            />
          </div>

          <div className={styles.twoColGrid}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="add-event-start">Start Time</Label>
              <Input
                id="add-event-start"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <Label htmlFor="add-event-duration">Duration (min)</Label>
              <Input
                id="add-event-duration"
                type="number"
                min="15"
                step="15"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Math.max(15, parseInt(e.target.value) || 15))}
              />
            </div>
          </div>

          <div className={styles.recurringRow}>
            <Switch
              id="add-event-recurring"
              checked={recurring}
              onCheckedChange={setRecurring}
            />
            <Label htmlFor="add-event-recurring" className={styles.recurringLabel}>Recurring</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!isValid}>Add Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
