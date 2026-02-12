/**
 * Mock scheduled event generator for testing
 */

import type { ScheduledEvent, ScheduledEventType } from '@stridetime/types';

/**
 * Create a mock scheduled event with optional overrides
 */
export function createMockScheduledEvent(overrides: Partial<ScheduledEvent> = {}): ScheduledEvent {
  const now = new Date();
  return {
    id: 'event-123',
    taskId: null,
    userId: 'user-123',
    startTime: now.toISOString(),
    durationMinutes: 60,
    label: 'Test Event',
    type: 'MEETING' as ScheduledEventType,
    externalId: null,
    externalSource: null,
    metadata: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

/**
 * Create multiple mock scheduled events with sequential IDs
 */
export function createMockScheduledEvents(
  count: number,
  overrides: Partial<ScheduledEvent> = {}
): ScheduledEvent[] {
  return Array.from({ length: count }, (_, i) => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + i);
    return createMockScheduledEvent({
      id: `event-${i + 1}`,
      startTime: startTime.toISOString(),
      ...overrides,
    });
  });
}

/**
 * Create a mock focus session scheduled event
 */
export function createMockFocusEvent(overrides: Partial<ScheduledEvent> = {}): ScheduledEvent {
  return createMockScheduledEvent({
    type: 'FOCUS' as ScheduledEventType,
    label: 'Focus Session',
    durationMinutes: 25,
    ...overrides,
  });
}
