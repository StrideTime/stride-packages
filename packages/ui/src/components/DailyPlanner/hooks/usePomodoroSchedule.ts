import { useState, useMemo, useEffect } from 'react';
import {
  calculateBreakBlocks,
  applySmartBreakDistribution,
  DEFAULT_POMODORO_SETTINGS,
  DEFAULT_POMODORO_PRESETS,
} from '../utils';
import type { PomodoroPreset, PomodoroSettings, PomodoroBreak } from '../DailyPlanner/DailyPlanner';

/**
 * Owns all pomodoro timer state and break management for a single day.
 *
 * Accepts user presets and optional externally-controlled settings (from DB).
 * Computes the ordered list of breaks from the current settings and any user
 * edits (drag, resize, add, delete). `customBreaks` overrides the calculated
 * breaks whenever the user makes a manual edit; it resets to null any time
 * settings change.
 */
export function usePomodoroSchedule(
  presets: PomodoroPreset[] = DEFAULT_POMODORO_PRESETS,
  externalSettings?: PomodoroSettings,
  onSettingsChange?: (settings: PomodoroSettings) => void,
) {
  const [settings, setSettings] = useState<PomodoroSettings>(
    externalSettings ?? DEFAULT_POMODORO_SETTINGS,
  );
  const [customBreaks, setCustomBreaks] = useState<PomodoroBreak[] | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  useEffect(() => {
    if (externalSettings) setSettings(externalSettings);
  }, [externalSettings]);

  useEffect(() => {
    setCustomBreaks(null);
  }, [settings]);

  const updateSettings = (updates: Partial<PomodoroSettings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    onSettingsChange?.(next);
  };

  const pomodoroBreaks = useMemo(() => {
    if (!settings.enabled) return [];
    return customBreaks ?? calculateBreakBlocks(settings);
  }, [settings, customBreaks]);

  const totalBreakMinutes = useMemo(
    () => pomodoroBreaks.reduce((acc, b) => acc + b.durationMinutes, 0),
    [pomodoroBreaks],
  );

  const handleToggle = (enabled: boolean) => {
    updateSettings({ enabled });
    setCustomBreaks(null);
  };

  const handlePresetChange = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    updateSettings({
      presetId,
      focusMinutes: preset.focusMinutes,
      shortBreakMinutes: preset.shortBreakMinutes,
      longBreakMinutes: preset.longBreakMinutes,
      cyclesBeforeLong: preset.cyclesBeforeLong,
    });
    setCustomBreaks(null);
  };

  const handleAdjustBreakDuration = (breakIndex: number, newDuration: number) => {
    if (breakIndex >= pomodoroBreaks.length) return;
    const durationDelta = newDuration - pomodoroBreaks[breakIndex].durationMinutes;
    if (durationDelta === 0) return;
    setCustomBreaks(pomodoroBreaks.map((b, idx) => {
      if (idx === breakIndex) return { ...b, durationMinutes: newDuration };
      if (idx > breakIndex) return { ...b, startMinutes: b.startMinutes + durationDelta };
      return b;
    }));
  };

  const handleDeleteBreak = (breakIndex: number) => {
    if (breakIndex >= pomodoroBreaks.length) return;
    const deletedDuration = pomodoroBreaks[breakIndex].durationMinutes;
    setCustomBreaks(
      pomodoroBreaks
        .filter((_, idx) => idx !== breakIndex)
        .map((b, idx) => {
          const originalIdx = idx >= breakIndex ? idx + 1 : idx;
          return originalIdx > breakIndex
            ? { ...b, startMinutes: b.startMinutes - deletedDuration }
            : b;
        }),
    );
  };

  const handleAddBreakAtTime = (startMinutes: number) => {
    const defaultDuration = 10;
    const newBreak: PomodoroBreak = { type: 'short', startMinutes, durationMinutes: defaultDuration };
    const insertIdx = pomodoroBreaks.findIndex(b => b.startMinutes >= startMinutes);
    const before = insertIdx === -1 ? pomodoroBreaks : pomodoroBreaks.slice(0, insertIdx);
    const after = (insertIdx === -1 ? [] : pomodoroBreaks.slice(insertIdx)).map(b => ({
      ...b,
      startMinutes: b.startMinutes + defaultDuration,
    }));
    setCustomBreaks([...before, newBreak, ...after]);
  };

  const handleDragBreak = (breakIndex: number, newStartMinutes: number) => {
    if (breakIndex >= pomodoroBreaks.length) return;
    const timeDelta = newStartMinutes - pomodoroBreaks[breakIndex].startMinutes;
    if (timeDelta === 0) return;
    setCustomBreaks(pomodoroBreaks.map((b, idx) =>
      idx >= breakIndex ? { ...b, startMinutes: b.startMinutes + timeDelta } : b,
    ));
  };

  const handleConfigure = () => setConfigDialogOpen(true);

  const handleSmartDistribute = () => {
    const breaks = applySmartBreakDistribution(settings);
    setCustomBreaks(breaks.length > 0 ? breaks : null);
  };

  return {
    pomodoroBreaks,
    settings,
    updateSettings,
    totalBreakMinutes,
    configDialogOpen,
    setConfigDialogOpen,
    handleToggle,
    handlePresetChange,
    handleAdjustBreakDuration,
    handleDeleteBreak,
    handleAddBreakAtTime,
    handleDragBreak,
    handleConfigure,
    handleSmartDistribute,
  };
}
