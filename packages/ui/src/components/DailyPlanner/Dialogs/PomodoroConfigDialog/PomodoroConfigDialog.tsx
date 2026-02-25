import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../../primitives/Dialog';
import { Button } from '../../../../primitives/Button';
import { Input } from '../../../../primitives/Input';
import { Label } from '../../../../primitives/Label';
import { Separator } from '../../../../primitives/Separator';
import type { PomodoroPreset, PomodoroSettings } from '../../DailyPlanner/DailyPlanner';
import styles from './PomodoroConfigDialog.module.css';

export type PomodoroConfigDialogProps = {
  settings: PomodoroSettings;
  presets: PomodoroPreset[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSettings: (settings: PomodoroSettings) => void;
  onCreatePreset?: (preset: Omit<PomodoroPreset, 'id'>) => void;
  onUpdatePreset?: (id: string, updates: Partial<Omit<PomodoroPreset, 'id'>>) => void;
  onDeletePreset?: (id: string) => void;
};

type EditingPreset = Omit<PomodoroPreset, 'id'> & { id?: string };

const emptyPreset = (): EditingPreset => ({
  name: '',
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLong: 4,
});

export function PomodoroConfigDialog({
  settings,
  presets,
  open,
  onOpenChange,
  onSaveSettings,
  onCreatePreset,
  onUpdatePreset,
  onDeletePreset,
}: PomodoroConfigDialogProps) {
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(settings);
  const [editingPreset, setEditingPreset] = useState<EditingPreset | null>(null);
  const [isAddingPreset, setIsAddingPreset] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalSettings(settings);
      setEditingPreset(null);
      setIsAddingPreset(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const setField = (field: keyof PomodoroSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'startTime' ? e.target.value : parseInt(e.target.value, 10) || 0;
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const setPresetField = (field: keyof EditingPreset) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'name' ? e.target.value : parseInt(e.target.value, 10) || 0;
    setEditingPreset(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onOpenChange(false);
  };

  const handleEditPreset = (preset: PomodoroPreset) => {
    setIsAddingPreset(false);
    setEditingPreset({ ...preset });
  };

  const handleSavePreset = () => {
    if (!editingPreset) return;
    if (editingPreset.id) {
      const { id, ...updates } = editingPreset;
      onUpdatePreset?.(id, updates);
    } else {
      onCreatePreset?.(editingPreset);
    }
    setEditingPreset(null);
    setIsAddingPreset(false);
  };

  const handleAddPreset = () => {
    setEditingPreset(emptyPreset());
    setIsAddingPreset(true);
  };

  const handleCancelEditPreset = () => {
    setEditingPreset(null);
    setIsAddingPreset(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '420px' }}>
        <DialogHeader>
          <DialogTitle>Pomodoro Settings</DialogTitle>
        </DialogHeader>

        <div className={styles.form}>
          {/* Today's settings */}
          <div className={styles.section}>
            <Label className={styles.sectionLabel}>Today</Label>
            <div className={styles.fieldGroup}>
              <Label htmlFor="pomodoro-start-time">Start Time</Label>
              <Input
                id="pomodoro-start-time"
                type="time"
                value={localSettings.startTime}
                onChange={setField('startTime')}
              />
            </div>
            <div className={styles.twoColGrid}>
              <div className={styles.fieldGroup}>
                <Label htmlFor="focus-minutes">Focus (min)</Label>
                <Input id="focus-minutes" type="number" min={1} max={120} value={localSettings.focusMinutes} onChange={setField('focusMinutes')} />
              </div>
              <div className={styles.fieldGroup}>
                <Label htmlFor="cycles-before-long">Cycles before long</Label>
                <Input id="cycles-before-long" type="number" min={1} max={10} value={localSettings.cyclesBeforeLong} onChange={setField('cyclesBeforeLong')} />
              </div>
              <div className={styles.fieldGroup}>
                <Label htmlFor="short-break-minutes">Short break (min)</Label>
                <Input id="short-break-minutes" type="number" min={1} max={60} value={localSettings.shortBreakMinutes} onChange={setField('shortBreakMinutes')} />
              </div>
              <div className={styles.fieldGroup}>
                <Label htmlFor="long-break-minutes">Long break (min)</Label>
                <Input id="long-break-minutes" type="number" min={1} max={120} value={localSettings.longBreakMinutes} onChange={setField('longBreakMinutes')} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Presets */}
          <div className={styles.section}>
            <div className={styles.presetsHeader}>
              <Label className={styles.sectionLabel}>Presets</Label>
              {!isAddingPreset && (
                <Button variant="ghost" size="sm" className={styles.addPresetBtn} onClick={handleAddPreset}>
                  <Plus style={{ height: '0.75rem', width: '0.75rem' }} />
                  Add
                </Button>
              )}
            </div>

            <div className={styles.presetList}>
              {presets.map(preset => (
                <div key={preset.id}>
                  {editingPreset?.id === preset.id ? (
                    <PresetEditor
                      preset={editingPreset}
                      onSetField={setPresetField}
                      onSave={handleSavePreset}
                      onCancel={handleCancelEditPreset}
                    />
                  ) : (
                    <div className={styles.presetRow}>
                      <div>
                        <span className={styles.presetName}>{preset.name}</span>
                        <span className={styles.presetDetails}>
                          {preset.focusMinutes}/{preset.shortBreakMinutes}/{preset.longBreakMinutes}
                        </span>
                      </div>
                      <div className={styles.presetActions}>
                        <Button variant="ghost" size="icon" className={styles.presetActionBtn} onClick={() => handleEditPreset(preset)}>
                          <Pencil style={{ height: '0.75rem', width: '0.75rem' }} />
                        </Button>
                        <Button variant="ghost" size="icon" className={styles.presetDeleteBtn} onClick={() => onDeletePreset?.(preset.id)}>
                          <Trash2 style={{ height: '0.75rem', width: '0.75rem' }} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isAddingPreset && editingPreset && !editingPreset.id && (
                <PresetEditor
                  preset={editingPreset}
                  onSetField={setPresetField}
                  onSave={handleSavePreset}
                  onCancel={handleCancelEditPreset}
                />
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PresetEditor({
  preset,
  onSetField,
  onSave,
  onCancel,
}: {
  preset: EditingPreset;
  onSetField: (field: keyof EditingPreset) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className={styles.presetEditor}>
      <Input
        placeholder="Preset name"
        value={preset.name}
        onChange={onSetField('name')}
        style={{ height: '1.75rem', fontSize: '0.875rem' }}
      />
      <div className={styles.fourColGrid}>
        <div className={styles.editorField}>
          <Label className={styles.editorFieldLabel}>Focus</Label>
          <Input type="number" min={1} max={120} value={preset.focusMinutes} onChange={onSetField('focusMinutes')} style={{ height: '1.75rem', fontSize: '0.75rem' }} />
        </div>
        <div className={styles.editorField}>
          <Label className={styles.editorFieldLabel}>Short</Label>
          <Input type="number" min={1} max={60} value={preset.shortBreakMinutes} onChange={onSetField('shortBreakMinutes')} style={{ height: '1.75rem', fontSize: '0.75rem' }} />
        </div>
        <div className={styles.editorField}>
          <Label className={styles.editorFieldLabel}>Long</Label>
          <Input type="number" min={1} max={120} value={preset.longBreakMinutes} onChange={onSetField('longBreakMinutes')} style={{ height: '1.75rem', fontSize: '0.75rem' }} />
        </div>
        <div className={styles.editorField}>
          <Label className={styles.editorFieldLabel}>Cycles</Label>
          <Input type="number" min={1} max={10} value={preset.cyclesBeforeLong} onChange={onSetField('cyclesBeforeLong')} style={{ height: '1.75rem', fontSize: '0.75rem' }} />
        </div>
      </div>
      <div className={styles.presetEditorActions}>
        <Button variant="ghost" size="sm" className={styles.presetEditorActionBtn} onClick={onCancel}>
          <X style={{ height: '0.75rem', width: '0.75rem' }} />
        </Button>
        <Button size="sm" className={styles.presetEditorActionBtn} onClick={onSave}>
          <Check style={{ height: '0.75rem', width: '0.75rem' }} />
        </Button>
      </div>
    </div>
  );
}
