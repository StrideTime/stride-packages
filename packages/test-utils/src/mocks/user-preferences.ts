import type { UserPreferences } from '@stridetime/types';

/**
 * Creates a mock UserPreferences for testing
 */
export function createMockUserPreferences(overrides?: Partial<UserPreferences>): UserPreferences {
  const ts = new Date().toISOString();
  return {
    userId: 'user_123',
    theme: 'LIGHT',
    checkInFrequency: 60,
    checkInEnabled: true,
    endOfDaySummaryTime: '18:00',
    endOfDaySummaryEnabled: true,
    autoPauseMinutes: 15,
    autoPauseEnabled: false,
    breakReminderEnabled: true,
    breakReminderMinutes: 90,
    accentColor: '#3B82F6',
    fontSize: 'MEDIUM',
    density: 'COMFORTABLE',
    keyboardShortcuts: null,
    soundEnabled: true,
    soundVolume: 80,
    enableHapticFeedback: false,
    autoStartTimer: true,
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}
