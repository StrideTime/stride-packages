import { PomodoroBreakType, type PomodoroBreak, type PomodoroPreset, type PomodoroSettings } from '../DailyPlanner/DailyPlanner';

// ─── Default presets ──────────────────────────────────────────────────────────

/**
 * Built-in presets seeded into the DB when a user creates their account.
 * Users can modify, delete, or create their own presets from these defaults.
 */
export const DEFAULT_POMODORO_PRESETS: PomodoroPreset[] = [
  { id: 'classic', name: 'Classic', focusMinutes: 25, shortBreakMinutes: 5,  longBreakMinutes: 15, cyclesBeforeLong: 4 },
  { id: 'short',   name: 'Short',   focusMinutes: 15, shortBreakMinutes: 3,  longBreakMinutes: 10, cyclesBeforeLong: 4 },
  { id: 'long',    name: 'Long',    focusMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 30, cyclesBeforeLong: 3 },
];

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  enabled: false,
  startTime: '09:00',
  presetId: 'classic',
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLong: 4,
};

// ─── Break block generation ───────────────────────────────────────────────────

export function calculateBreakBlocks(settings: PomodoroSettings): PomodoroBreak[] {
  if (!settings.enabled) return [];

  const breaks: PomodoroBreak[] = [];
  const { focusMinutes, shortBreakMinutes, longBreakMinutes, cyclesBeforeLong } = settings;

  const [hours, minutes] = settings.startTime.split(':').map(Number);
  let currentMinutes = hours * 60 + minutes;

  const endMinutes = currentMinutes + 10 * 60; // 10-hour window
  let cycleCount = 0;

  while (currentMinutes < endMinutes) {
    currentMinutes += focusMinutes;
    cycleCount++;

    if (currentMinutes < endMinutes) {
      const isLong = cycleCount % cyclesBeforeLong === 0;
      const duration = isLong ? longBreakMinutes : shortBreakMinutes;
      breaks.push({
        type: isLong ? PomodoroBreakType.LONG : PomodoroBreakType.SHORT,
        startMinutes: currentMinutes,
        durationMinutes: duration,
      });
      currentMinutes += duration;
    }
  }

  return breaks;
}

// ─── Smart Distribute (stub) ──────────────────────────────────────────────────

/**
 * TODO: Smart break distribution
 *
 * Should scan the day's scheduled events and insert pomodoro breaks:
 * - Only within TASK-type event windows
 * - Skipping MEETING and BREAK type events entirely
 * - Respecting focusMinutes / shortBreakMinutes / longBreakMinutes / cyclesBeforeLong
 *   from settings, with best-effort overrides when gaps are too short
 *
 * @param settings - User's pomodoro settings
 * @returns PomodoroBreak[] to merge into the custom break schedule
 */
export function applySmartBreakDistribution(_settings: PomodoroSettings): PomodoroBreak[] {
  // TODO: implement
  return [];
}
