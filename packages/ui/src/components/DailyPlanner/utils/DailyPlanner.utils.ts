/**
 * Time utility functions for DailyPlanner component
 */

/**
 * Convert time string (HH:mm) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:mm)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Format time string to 12-hour format with AM/PM
 */
export function formatTime12Hour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Generate time slots for the day (24 hours)
 * @param incrementMinutes - Minutes between each slot (default: 15)
 */
export function generateTimeSlots(incrementMinutes: number = 15): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour <= 23; hour++) {
    for (let min = 0; min < 60; min += incrementMinutes) {
      if (hour === 23 && min > 45) break;
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }
  return slots;
}

/**
 * Calculate the end time given a start time and duration
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  return minutesToTime(Math.min(endMinutes, 24 * 60 - 1));
}

/**
 * Check if a time slot falls within working hours
 */
export function isWorkingHour(time: string, startHour: number, endHour: number): boolean {
  const [hourStr, minStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minutes = parseInt(minStr, 10);
  return hour >= startHour && (hour < endHour || (hour === endHour && minutes === 0));
}

/**
 * Round time to nearest increment
 */
export function roundToNearestIncrement(time: string, incrementMinutes: number): string {
  const minutes = timeToMinutes(time);
  const rounded = Math.round(minutes / incrementMinutes) * incrementMinutes;
  return minutesToTime(rounded);
}

/**
 * Check if two time blocks overlap
 */
export function blocksOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  return start1Min < end2Min && end1Min > start2Min;
}

/**
 * Calculate pixel position for a scheduled event on the time grid.
 */
export function getEventPosition(
  startTime: string,
  durationMinutes: number,
  slotHeightPx: number,
  slotIncrementMinutes: number,
): { top: number; height: number } {
  const startMinutes = timeToMinutes(startTime);
  return {
    top: (startMinutes / slotIncrementMinutes) * slotHeightPx,
    height: (durationMinutes / slotIncrementMinutes) * slotHeightPx,
  };
}

/**
 * Group overlapping events using connected-component detection (transitive).
 * Returns a Map of eventId → sorted array of all events in its overlap group.
 * Events with no overlaps are not present in the map.
 */
export function calculateOverlappingGroups<
  T extends { id: string; startTime: string; durationMinutes: number },
>(events: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  const processed = new Set<string>();

  const eventsOverlap = (e1: T, e2: T) => {
    const e1Start = timeToMinutes(e1.startTime);
    const e2Start = timeToMinutes(e2.startTime);
    return e1Start < e2Start + e2.durationMinutes && e1Start + e1.durationMinutes > e2Start;
  };

  const findConnectedGroup = (event: T): T[] => {
    const group: T[] = [event];
    const toProcess = [event];
    const inGroup = new Set([event.id]);
    while (toProcess.length > 0) {
      const current = toProcess.pop()!;
      events.forEach(other => {
        if (!inGroup.has(other.id) && eventsOverlap(current, other)) {
          group.push(other);
          toProcess.push(other);
          inGroup.add(other.id);
        }
      });
    }
    return group;
  };

  events.forEach(event => {
    if (!processed.has(event.id)) {
      const group = findConnectedGroup(event);
      if (group.length > 1) {
        group.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
        group.forEach(e => { groups.set(e.id, group); processed.add(e.id); });
      }
    }
  });

  return groups;
}
