import type { ReactElement } from 'react';
import type { ExternalSource } from '@stridetime/types';

// All bgs are pre-multiplied: 0.094 * brandColor + 0.906 * #282c34 (app dark background)

function GoogleCalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" fill="white" />
      {/* Blue header */}
      <rect x="3" y="5" width="18" height="6" rx="2" fill="#4285F4" />
      <rect x="3" y="9" width="18" height="2" fill="#4285F4" />
      {/* Ring posts */}
      <rect x="8" y="3" width="2" height="4.5" rx="1" fill="#DB4437" />
      <rect x="14" y="3" width="2" height="4.5" rx="1" fill="#DB4437" />
      {/* Date "31" */}
      <text x="12" y="18.5" textAnchor="middle" fontSize="7" fontWeight="800" fill="#4285F4" fontFamily="system-ui, sans-serif">31</text>
    </svg>
  );
}

function OutlookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
      {/* Envelope body */}
      <rect x="2" y="5" width="20" height="14" rx="2" fill="#0078D4" />
      <rect x="2" y="5" width="13" height="14" rx="2" fill="#1490DF" />
      {/* "O" letter */}
      <rect x="4" y="8" width="9" height="8" rx="1.5" fill="white" />
      <rect x="5.5" y="9.5" width="6" height="5" rx="1" fill="#1490DF" />
      {/* Right panel lines */}
      <line x1="16" y1="9" x2="21" y2="9" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="16" y1="12" x2="21" y2="12" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="16" y1="15" x2="21" y2="15" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function SlackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A" />
    </svg>
  );
}

function JiraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.975 0C9.372 0 7.248 2.113 7.248 4.722c0 1.184.446 2.265 1.179 3.082L12 11.518l3.573-3.714A4.71 4.71 0 0 0 16.703 4.7C16.682 2.104 14.569 0 11.975 0Z"
        fill="#2684FF"
      />
      <path
        d="M11.975 8.057c-2.603 0-4.726 2.113-4.726 4.722 0 1.184.445 2.265 1.178 3.082l3.548 3.691 3.573-3.714a4.71 4.71 0 0 0 1.153-3.081c-.021-2.597-2.123-4.7-4.726-4.7Z"
        fill="#2684FF"
        opacity="0.7"
      />
      <path
        d="M11.975 16.07c-2.603 0-4.726 2.113-4.726 4.722C7.249 23.4 9.372 24 11.975 24c2.604 0 4.727-.6 4.727-3.208 0-2.609-2.123-4.722-4.727-4.722Z"
        fill="#2684FF"
        opacity="0.4"
      />
    </svg>
  );
}

function GenericCalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface SourceConfig {
  color: string;
  bg: string;
  headerBg: string;
  label: string;
  Icon: (props: { className?: string }) => ReactElement;
}

export function GoogleMeetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
      {/* Camera body */}
      <rect x="2" y="6" width="13" height="12" rx="2" fill="#00AC47" />
      {/* Film-strip triangle */}
      <path d="M15 9.5l7-4.5v14l-7-4.5V9.5z" fill="#00AC47" />
    </svg>
  );
}

export { GoogleCalendarIcon };

const sourceConfigMap: Record<string, SourceConfig> = {
  GOOGLE_CALENDAR: {
    color: '#4285F4',
    bg: '#2a3446',
    headerBg: 'rgba(66,133,244,0.06)',
    label: 'Google Calendar',
    Icon: GoogleCalendarIcon,
  },
  OUTLOOK: {
    color: '#0078D4',
    bg: '#243343',
    headerBg: 'rgba(0,120,212,0.06)',
    label: 'Outlook',
    Icon: OutlookIcon,
  },
  SLACK: {
    color: '#E01E5A',
    bg: '#3a2830',
    headerBg: 'rgba(224,30,90,0.06)',
    label: 'Slack',
    Icon: SlackIcon,
  },
  JIRA: {
    color: '#2684FF',
    bg: '#272f42',
    headerBg: 'rgba(38,132,255,0.06)',
    label: 'Jira',
    Icon: JiraIcon,
  },
};

const fallbackConfig: SourceConfig = {
  color: '#94a3b8',
  bg: '#2b2d36',
  headerBg: 'rgba(148,163,184,0.06)',
  label: 'External Calendar',
  Icon: GenericCalendarIcon,
};

export function getExternalSourceConfig(source: ExternalSource | null | undefined): SourceConfig {
  if (!source) return fallbackConfig;
  return sourceConfigMap[source] ?? fallbackConfig;
}
