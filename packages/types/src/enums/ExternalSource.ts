export const ExternalSource = {
  GOOGLE_CALENDAR: 'GOOGLE_CALENDAR',
  JIRA: 'JIRA',
  TRELLO: 'TRELLO',
  GITHUB: 'GITHUB',
  OUTLOOK: 'OUTLOOK',
  SLACK: 'SLACK',
  MANUAL: 'MANUAL',
} as const;
export type ExternalSource = (typeof ExternalSource)[keyof typeof ExternalSource];
