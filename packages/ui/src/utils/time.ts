export const formatMinutes = (min: number): string => {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

export const formatShortDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });