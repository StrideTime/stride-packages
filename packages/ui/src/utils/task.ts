import { formatShortDate } from './time';

export const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  TRIVIAL: { label: 'Trivial', color: '#9ca3af' },
  EASY: { label: 'Easy', color: '#22c55e' },
  MEDIUM: { label: 'Medium', color: '#eab308' },
  HARD: { label: 'Hard', color: '#f97316' },
  EXTREME: { label: 'Extreme', color: '#ef4444' },
};

export function getDueStatus(dueDate: string | null): { label: string; color?: string } | null {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, color: '#ef4444' };
  if (diffDays === 0) return { label: 'Due today', color: '#f97316' };
  if (diffDays <= 2) return { label: `Due in ${diffDays}d`, color: '#eab308' };
  return { label: `Due: ${formatShortDate(dueDate)}` };
}

export function getMaxWarning(
  actual: number,
  max: number | null,
): { label: string; color: string } | null {
  if (max == null || max <= 0) return null;
  if (actual > max) return { label: `${actual - max}m over limit`, color: '#ef4444' };
  if (actual >= max * 0.8) return { label: `${max - actual}m to limit`, color: '#f97316' };
  return null;
}
