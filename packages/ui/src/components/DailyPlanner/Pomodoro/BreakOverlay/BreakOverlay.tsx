import type { PomodoroBreak } from '../../DailyPlanner/DailyPlanner';
import styles from './BreakOverlay.module.css';

export type BreakOverlayProps = {
  pomodoroBreak: PomodoroBreak;
  slotHeightPx: number;
  slotIncrementMinutes: number;
};

export function BreakOverlay({ pomodoroBreak, slotHeightPx, slotIncrementMinutes }: BreakOverlayProps) {
  const top = (pomodoroBreak.startMinutes / slotIncrementMinutes) * slotHeightPx;
  const height = (pomodoroBreak.durationMinutes / slotIncrementMinutes) * slotHeightPx;
  const isLong = pomodoroBreak.durationMinutes >= 15;
  const patternColor = isLong ? 'rgba(16, 185, 129, 0.12)' : 'rgba(168, 85, 247, 0.12)';
  const borderColor = isLong ? '#10b981' : '#a855f7';

  return (
    <div
      className={styles.overlay}
      style={{
        top: `${top + 2}px`,
        height: `${Math.max(0, height - 4)}px`,
        borderColor,
        backgroundColor: 'hsl(var(--background))',
        backgroundImage: `
          repeating-linear-gradient(45deg, transparent, transparent 4px, ${patternColor} 4px, ${patternColor} 8px),
          repeating-linear-gradient(-45deg, transparent, transparent 4px, ${patternColor} 4px, ${patternColor} 8px)
        `,
      }}
    />
  );
}
