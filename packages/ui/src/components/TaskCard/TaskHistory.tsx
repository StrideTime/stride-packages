import { useState } from "react";
import { Clock, Play, Square, Pencil, Trash2, Check, X } from "lucide-react";
import type { TimeEntry } from "@stridetime/types";
import { Button } from "../../primitives/Button";
import { formatDuration } from "../shared";

export interface TaskHistoryProps {
  timeEntries: TimeEntry[];
  onUpdateTimeEntry?: (id: string, updates: { startedAt: string; endedAt: string | null }) => void;
  onDeleteTimeEntry?: (id: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Returns an `HH:mm` string for an `<input type="time">` value. */
function toTimeInputValue(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Applies `HH:mm` from a time input back onto the original ISO date. */
function applyTimeInput(originalIso: string, timeValue: string): string {
  const d = new Date(originalIso);
  const [hh, mm] = timeValue.split(":").map(Number);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - entryDate.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function entryDuration(entry: TimeEntry): number | null {
  if (!entry.endedAt) return null;
  const ms = new Date(entry.endedAt).getTime() - new Date(entry.startedAt).getTime();
  return Math.round(ms / 60000);
}

/** Groups time entries by date (most recent first). */
function groupByDate(entries: TimeEntry[]) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  const groups: { label: string; entries: TimeEntry[] }[] = [];
  let currentLabel = "";

  for (const entry of sorted) {
    const label = formatDate(entry.startedAt);
    if (label !== currentLabel) {
      groups.push({ label, entries: [entry] });
      currentLabel = label;
    } else {
      groups[groups.length - 1].entries.push(entry);
    }
  }

  return groups;
}

// ─── Time‑input CSS ──────────────────────────────────────

const TIME_INPUT_CLS = [
  "w-[5.5rem] text-center text-sm bg-background",
  "border rounded-md px-2 py-1",
  "focus:outline-none focus:ring-2 focus:ring-ring",
].join(" ");

// ─── Inline entry row ────────────────────────────────────

function EntryRow({
  entry,
  canEdit,
  onUpdate,
  onDelete,
}: {
  entry: TimeEntry;
  canEdit: boolean;
  onUpdate?: TaskHistoryProps["onUpdateTimeEntry"];
  onDelete?: TaskHistoryProps["onDeleteTimeEntry"];
}) {
  const [editing, setEditing] = useState(false);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  const dur = entryDuration(entry);
  const isRunning = !entry.endedAt;

  const beginEdit = () => {
    setEditStart(toTimeInputValue(entry.startedAt));
    setEditEnd(entry.endedAt ? toTimeInputValue(entry.endedAt) : "");
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    const newStart = applyTimeInput(entry.startedAt, editStart);
    const newEnd = entry.endedAt && editEnd ? applyTimeInput(entry.endedAt, editEnd) : null;
    onUpdate?.(entry.id, { startedAt: newStart, endedAt: newEnd });
    setEditing(false);
  };

  // ── Editing row ──────────────────────────────────────
  if (editing) {
    return (
      <div className="px-3 py-2 space-y-2 bg-muted/20" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground w-10 shrink-0">Start</label>
          <input
            type="time"
            value={editStart}
            onChange={(e) => setEditStart(e.target.value)}
            className={TIME_INPUT_CLS}
          />
        </div>
        {!isRunning && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground w-10 shrink-0">End</label>
            <input
              type="time"
              value={editEnd}
              onChange={(e) => setEditEnd(e.target.value)}
              className={TIME_INPUT_CLS}
            />
          </div>
        )}
        <div className="flex items-center gap-1.5 pt-0.5">
          <Button size="sm" className="h-6 px-2 text-xs" onClick={saveEdit}>
            <Check className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={cancelEdit}>
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
              onClick={() => {
                onDelete(entry.id);
                setEditing(false);
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Display row ──────────────────────────────────────
  return (
    <div className="flex items-center gap-2 px-3 py-2 group">
      {/* Icon */}
      <div
        className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
          isRunning ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {isRunning ? (
          <Play className="h-2.5 w-2.5 fill-current" />
        ) : (
          <Square className="h-2.5 w-2.5" />
        )}
      </div>

      {/* Time range */}
      <span className="flex-1 min-w-0 text-sm text-foreground">
        {formatTime(entry.startedAt)}
        {" – "}
        {isRunning ? (
          <span className="text-primary font-medium">running</span>
        ) : (
          formatTime(entry.endedAt!)
        )}
      </span>

      {/* Duration */}
      {dur != null && (
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {formatDuration(dur)}
        </span>
      )}

      {/* Running pulse */}
      {isRunning && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
      )}

      {/* Edit button (hover) */}
      {canEdit && !isRunning && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            beginEdit();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity shrink-0"
        >
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────

export function TaskHistory({
  timeEntries,
  onUpdateTimeEntry,
  onDeleteTimeEntry,
}: TaskHistoryProps) {
  if (timeEntries.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground/60 py-2">
        <Clock className="h-3.5 w-3.5" />
        No time tracked yet
      </div>
    );
  }

  const groups = groupByDate(timeEntries);
  const totalMinutes = timeEntries.reduce((sum, e) => {
    const dur = entryDuration(e);
    return sum + (dur ?? 0);
  }, 0);

  const canEdit = Boolean(onUpdateTimeEntry);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">History</span>
        <span className="text-xs text-muted-foreground/60">
          {formatDuration(totalMinutes)} total
        </span>
      </div>

      {/* Timeline */}
      <div className="border rounded-lg overflow-hidden">
        {groups.map((group, gi) => (
          <div key={group.label}>
            {/* Date label */}
            <div
              className={`px-3 py-1.5 bg-muted/30 text-xs font-medium text-muted-foreground ${
                gi > 0 ? "border-t" : ""
              }`}
            >
              {group.label}
            </div>

            {/* Entries for this date */}
            <div className="divide-y">
              {group.entries.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  canEdit={canEdit}
                  onUpdate={onUpdateTimeEntry}
                  onDelete={onDeleteTimeEntry}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
