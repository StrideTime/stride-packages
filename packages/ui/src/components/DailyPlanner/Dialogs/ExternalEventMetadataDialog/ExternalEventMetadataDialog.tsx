import { Dialog, DialogContent } from '../../../../primitives/Dialog';
import { Button } from '../../../../primitives/Button';
import { Clock, MapPin, Users, User, Calendar } from 'lucide-react';
import { formatTime12Hour, timeToMinutes, minutesToTime } from '../../utils/DailyPlanner.utils';
import { getExternalSourceConfig, GoogleCalendarIcon, GoogleMeetIcon } from '../../utils/externalSourceConfig';
import type { ScheduledEvent } from '@stridetime/types';

export type ExternalEventMetadataDialogProps = {
  event: ScheduledEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

interface GoogleCalendarMetadata {
  calendarName?: string;
  calendarId?: string;
  organizer?: { name?: string; email?: string };
  attendees?: Array<{
    name?: string;
    email: string;
    responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
  location?: string;
  description?: string;
  htmlLink?: string;
  hangoutLink?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

const RESPONSE_STATUS_LABEL: Record<string, string> = {
  accepted: 'Accepted',
  declined: 'Declined',
  tentative: 'Maybe',
  needsAction: 'Pending',
};

const RESPONSE_STATUS_COLOR: Record<string, string> = {
  accepted: '#10b981',
  declined: '#ef4444',
  tentative: '#f59e0b',
  needsAction: '#6b7280',
};

export function ExternalEventMetadataDialog({ event, open, onOpenChange }: ExternalEventMetadataDialogProps) {
  const endTimeStr = minutesToTime(timeToMinutes(event.startTime) + event.durationMinutes);
  const sourceConfig = getExternalSourceConfig(event.externalSource);
  const SourceIcon = sourceConfig.Icon;

  let meta: GoogleCalendarMetadata = {};
  if (event.metadata) {
    try { meta = JSON.parse(event.metadata); } catch {}
  }

  const calendarName = meta.calendarName ?? sourceConfig.label;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-4" style={{ backgroundColor: sourceConfig.headerBg }}>
          <div className="flex items-center gap-1.5 mb-3">
            <SourceIcon className="h-4 w-4" />
            <span className="text-xs font-medium" style={{ color: sourceConfig.color }}>{calendarName}</span>
          </div>
          <h2 className="text-base font-semibold text-foreground leading-snug">{event.label}</h2>
          <div className="flex items-center gap-1.5 mt-2">
            <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: sourceConfig.color }} />
            <span className="text-sm text-muted-foreground tabular-nums">
              {formatTime12Hour(event.startTime)} – {formatTime12Hour(endTimeStr)}
              <span className="text-xs ml-1.5 opacity-70">({event.durationMinutes} min)</span>
            </span>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          {meta.location && (
            <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 mt-px" />
              <span className="leading-snug">{meta.location}</span>
            </div>
          )}

          {meta.organizer && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span>
                {meta.organizer.name ?? meta.organizer.email}
                {meta.organizer.name && meta.organizer.email && (
                  <span className="text-xs opacity-60 ml-1">({meta.organizer.email})</span>
                )}
              </span>
            </div>
          )}

          {meta.attendees && meta.attendees.length > 0 && (
            <div className="flex items-start gap-2.5">
              <Users className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
              <div className="flex flex-wrap gap-1.5">
                {meta.attendees.map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-muted rounded-full px-2 py-0.5">
                    {a.responseStatus && (
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: RESPONSE_STATUS_COLOR[a.responseStatus] ?? '#6b7280' }}
                      />
                    )}
                    <span>{a.name ?? a.email}</span>
                    {a.responseStatus && (
                      <span className="opacity-60">{RESPONSE_STATUS_LABEL[a.responseStatus]}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {meta.description && (
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-5 whitespace-pre-line">
                {meta.description}
              </p>
            </div>
          )}

          {!meta.location && !meta.organizer && !meta.attendees?.length && !meta.description && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>No additional details available.</span>
            </div>
          )}
        </div>

        {(meta.htmlLink || meta.hangoutLink) && (
          <div className="px-5 pb-5 flex gap-2 border-t pt-4">
            {meta.hangoutLink && (
              <Button
                size="sm"
                className="flex-1 gap-2 text-xs font-medium"
                style={{ backgroundColor: '#00AC47', color: 'white' }}
                onClick={() => window.open(meta.hangoutLink, '_blank')}
              >
                <GoogleMeetIcon className="h-3.5 w-3.5" />
                Join with Meet
              </Button>
            )}
            {meta.htmlLink && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 text-xs"
                onClick={() => window.open(meta.htmlLink, '_blank')}
              >
                <GoogleCalendarIcon className="h-3.5 w-3.5" />
                Open in Calendar
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
