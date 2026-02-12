import type { UserPreferences } from '@stridetime/types';

/**
 * Creates a mock UserPreferences for testing
 */
export function createMockUserPreferences(overrides?: Partial<UserPreferences>): UserPreferences {
  return {
    userId: 'user_123',
    theme: 'LIGHT',
    planningMode: 'DAILY',
    checkInFrequency: 60,
    checkInEnabled: true,
    endOfDaySummaryTime: '18:00',
    endOfDaySummaryEnabled: true,
    autoPauseMinutes: 15,
    autoPauseEnabled: false,
    breakReminderEnabled: true,
    breakReminderMinutes: 90,
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    workingDays: '1,2,3,4,5',
    accentColor: '#3B82F6',
    fontSize: 'MEDIUM',
    density: 'COMFORTABLE',
    keyboardShortcuts: null,
    enableSoundEffects: true,
    enableHapticFeedback: false,
    autoStartTimer: true,
    ...overrides,
  };
}
