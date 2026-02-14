import type { ExternalSource } from "@stridetime/types";
import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

// ─── Brand SVG icons ────────────────────────────────────

function JiraIcon(props: IconProps) {
  // Real Jira logomark — three overlapping rounded cards
  return (
    <svg viewBox="0 -31 256 287" fill="currentColor" {...props}>
      <path
        d="M244.658 0H121.707a55.502 55.502 0 0 0 55.502 55.502h22.649V77.37c.02 30.625 24.841 55.447 55.466 55.467V10.666C255.324 4.777 250.55 0 244.658 0z"
        opacity="1"
      />
      <path
        d="M183.822 61.262H60.872c.019 30.625 24.84 55.447 55.466 55.467h22.649v21.938c.039 30.625 24.877 55.43 55.502 55.43V71.93c0-5.891-4.776-10.667-10.667-10.667z"
        opacity="0.85"
      />
      <path
        d="M122.951 122.489H0c0 30.653 24.85 55.502 55.502 55.502h22.72v21.867c.02 30.597 24.798 55.408 55.396 55.466V133.156c0-5.891-4.776-10.667-10.667-10.667z"
        opacity="0.7"
      />
    </svg>
  );
}

function TrelloIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
      <rect x="4.5" y="4.5" width="6" height="13" rx="1.5" fill="white" opacity="0.9" />
      <rect x="13.5" y="4.5" width="6" height="8" rx="1.5" fill="white" opacity="0.9" />
    </svg>
  );
}

function GitHubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.338c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

function GoogleCalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="2" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="12" width="4" height="3" rx="0.5" fill="currentColor" />
      <rect x="13" y="12" width="4" height="3" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function OutlookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M13 2v8h9V6a4 4 0 0 0-4-4h-5Z" fill="currentColor" opacity="0.7" />
      <path d="M13 14v8h5a4 4 0 0 0 4-4v-4h-9Z" fill="currentColor" opacity="0.5" />
      <path d="M13 10h9v4h-9v-4Z" fill="currentColor" opacity="0.85" />
      <rect x="2" y="4" width="12" height="16" rx="2" fill="currentColor" />
      <ellipse cx="8" cy="12" rx="3.5" ry="4" stroke="white" strokeWidth="1.8" fill="none" />
    </svg>
  );
}

function SlackIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.527 14.514a1.764 1.764 0 0 1-1.764 1.764 1.764 1.764 0 1 1 0-3.528h1.764v1.764Zm.882 0a1.764 1.764 0 0 1 3.528 0v4.41a1.764 1.764 0 1 1-3.528 0v-4.41ZM9.173 6.527a1.764 1.764 0 0 1-1.764-1.764 1.764 1.764 0 1 1 3.528 0v1.764H9.173Zm0 .882a1.764 1.764 0 0 1 0 3.528H4.763a1.764 1.764 0 1 1 0-3.528h4.41ZM17.16 9.173a1.764 1.764 0 0 1 1.764-1.764 1.764 1.764 0 1 1 0 3.528H17.16V9.173Zm-.882 0a1.764 1.764 0 0 1-3.528 0V4.763a1.764 1.764 0 0 1 3.528 0v4.41ZM14.514 17.16a1.764 1.764 0 0 1 1.764 1.764 1.764 1.764 0 1 1-3.528 0V17.16h1.764Zm0-.882a1.764 1.764 0 0 1 0-3.528h4.41a1.764 1.764 0 0 1 0 3.528h-4.41Z" />
    </svg>
  );
}

function ManualIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

// ─── Config ─────────────────────────────────────────────

export type ExternalSourceConfig = {
  label: string;
  /** Chip background colour */
  bg: string;
  /** Text / icon colour on top of bg */
  fg: string;
  Icon: ComponentType<IconProps>;
};

export const externalSourceConfig: Record<ExternalSource, ExternalSourceConfig> = {
  JIRA: { label: "Jira", bg: "#0052CC", fg: "#ffffff", Icon: JiraIcon },
  TRELLO: { label: "Trello", bg: "#0079BF", fg: "#ffffff", Icon: TrelloIcon },
  GITHUB: { label: "GitHub", bg: "#24292e", fg: "#ffffff", Icon: GitHubIcon },
  GOOGLE_CALENDAR: {
    label: "Google Calendar",
    bg: "#4285F4",
    fg: "#ffffff",
    Icon: GoogleCalendarIcon,
  },
  OUTLOOK: { label: "Outlook", bg: "#0078D4", fg: "#ffffff", Icon: OutlookIcon },
  SLACK: { label: "Slack", bg: "#4A154B", fg: "#ffffff", Icon: SlackIcon },
  MANUAL: { label: "Manual", bg: "#6b7280", fg: "#ffffff", Icon: ManualIcon },
};
