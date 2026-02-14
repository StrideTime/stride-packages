import { useState, useId, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Check,
  Timer,
  Flag,
  Zap,
  X,
  ChevronDown,
  Plus,
  Trash2,
  User,
  Users,
  ShieldCheck,
  Hourglass,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import type { Task, TaskDifficulty, TaskPriority } from "@stridetime/types";
import { Button } from "../../primitives/Button";
import { Label } from "../../primitives/Label";
import { Slider } from "../../primitives/Slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../primitives/Dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../primitives/Popover";
import { Separator } from "../../primitives/Separator";
import { difficultyConfig, formatDuration, externalSourceConfig } from "../shared";
import type { TaskDetailModalProps, TaskDetailContentProps, SubtaskItem } from "./TaskCard.types";

// ─── Priority helpers ──────────────────────────────────────

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; fill?: boolean }> = {
  NONE: { label: "None", color: "#6b7280" },
  LOW: { label: "Low", color: "#3b82f6" },
  MEDIUM: { label: "Medium", color: "#eab308" },
  HIGH: { label: "High", color: "#f97316" },
  CRITICAL: { label: "Critical", color: "#ef4444", fill: true },
};

const ALL_PRIORITIES: TaskPriority[] = ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const ALL_DIFFICULTIES: TaskDifficulty[] = ["TRIVIAL", "EASY", "MEDIUM", "HARD", "EXTREME"];

function PriorityIcon({
  priority,
  className = "h-3.5 w-3.5",
}: {
  priority?: TaskPriority;
  className?: string;
}) {
  const cfg = PRIORITY_CONFIG[priority ?? "NONE"];
  return (
    <Flag
      className={className}
      style={{ color: cfg.color }}
      {...(cfg.fill ? { fill: "currentColor" } : {})}
    />
  );
}

// ─── Time helpers ──────────────────────────────────────────

function splitMinutes(total: number | null | undefined): { hours: number; minutes: number } {
  if (total == null || total <= 0) return { hours: 0, minutes: 0 };
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}

function combineMinutes(hours: number, minutes: number): number | null {
  const total = (hours || 0) * 60 + (minutes || 0);
  return total > 0 ? total : null;
}

const NUM_INPUT_CLS = [
  "w-12 text-center bg-transparent text-sm font-medium",
  "focus:outline-none",
  "[appearance:textfield]",
  "[&::-webkit-outer-spin-button]:appearance-none",
  "[&::-webkit-inner-spin-button]:appearance-none",
].join(" ");

// ─── Inline time input ─────────────────────────────────────

function TimeInput({
  value,
  onChange,
  label,
  icon: Icon,
}: {
  value: number | null | undefined;
  onChange: (val: number | null) => void;
  label: string;
  icon: React.ElementType;
}) {
  const { hours, minutes } = splitMinutes(value);
  return (
    <div className="flex-1 space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Label>
      <div className="flex items-center border rounded-md bg-background px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-ring">
        <input
          type="number"
          min="0"
          max="999"
          placeholder="0"
          value={hours || ""}
          onChange={(e) => {
            const h = parseInt(e.target.value) || 0;
            onChange(combineMinutes(h, minutes));
          }}
          className={NUM_INPUT_CLS}
        />
        <span className="text-xs text-muted-foreground">hr</span>
        <input
          type="number"
          min="0"
          max="59"
          step="15"
          placeholder="0"
          value={minutes || ""}
          onChange={(e) => {
            const m = parseInt(e.target.value) || 0;
            onChange(combineMinutes(hours, m));
          }}
          className={NUM_INPUT_CLS}
        />
        <span className="text-xs text-muted-foreground">min</span>
      </div>
    </div>
  );
}

// ─── TaskDetailContent (inner, reusable without Dialog) ────

export function TaskDetailContent({
  task,
  projectName,
  projectColor,
  subtasks: initialSubtasks,
  onUpdateTask,
  onUpdateSubtasks,
  onAssigneeChange,
  onComplete,
  onClose,
  externalUrl,
  projects,
  teamMembers,
  assignmentPolicy = "LEADS_ONLY",
  currentUserIsLead = false,
  quickAddMode,
}: TaskDetailContentProps) {
  const newSubtaskInputId = useId();

  // ── Edit state (always active) ──────────────────────────
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editDifficulty, setEditDifficulty] = useState(task.difficulty);
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority);
  const [editProgress, setEditProgress] = useState(task.progress);
  const [editEstMinutes, setEditEstMinutes] = useState(task.estimatedMinutes);
  const [editMaxMinutes, setEditMaxMinutes] = useState(task.maxMinutes);
  const [editSubtasks, setEditSubtasks] = useState<SubtaskItem[]>(initialSubtasks ?? []);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [editAssigneeId, setEditAssigneeId] = useState(task.assigneeUserId);
  const [editProjectId, setEditProjectId] = useState(task.projectId);

  // Reset edit state when task changes
  useEffect(() => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditDifficulty(task.difficulty);
    setEditPriority(task.priority);
    setEditProgress(task.progress);
    setEditEstMinutes(task.estimatedMinutes);
    setEditMaxMinutes(task.maxMinutes);
    setEditSubtasks(initialSubtasks ?? []);
    setEditAssigneeId(task.assigneeUserId);
    setEditProjectId(task.projectId);
    setNewSubtaskText("");
  }, [task, initialSubtasks]);

  // ── Derived ─────────────────────────────────────────────
  const diff = difficultyConfig[editDifficulty];
  const isCompleted = task.status === "COMPLETED";
  const priorityCfg = PRIORITY_CONFIG[editPriority ?? "NONE"];

  const hasSubtasks = editSubtasks.length > 0;
  const completedSubtasks = editSubtasks.filter((s) => s.completed).length;

  const currentProject = projects?.find((p) => p.id === editProjectId) ?? {
    id: task.projectId,
    name: projectName,
    color: projectColor,
  };

  const extSource = task.externalSource ? externalSourceConfig[task.externalSource] : null;

  const assignedMember = teamMembers?.find((m) => m.id === editAssigneeId);

  const canAssign =
    onAssigneeChange &&
    teamMembers &&
    teamMembers.length > 0 &&
    (assignmentPolicy === "LEADS_AND_MEMBERS" || currentUserIsLead);

  // ── Actual time info (read-only, comes from tracked time) ──
  const timeInfo =
    task.actualMinutes && task.estimatedMinutes
      ? {
          actual: task.actualMinutes,
          estimated: task.estimatedMinutes,
          isUnder: task.estimatedMinutes - task.actualMinutes > 0,
          difference: Math.abs(task.estimatedMinutes - task.actualMinutes),
        }
      : null;

  // ── Handlers ────────────────────────────────────────────
  const handleSave = () => {
    const updates: Partial<Task> = {};
    if (editTitle !== task.title) updates.title = editTitle;
    if (editDescription !== (task.description || "")) {
      updates.description = editDescription || null;
    }
    if (editDifficulty !== task.difficulty) {
      updates.difficulty = editDifficulty;
    }
    if (editPriority !== task.priority) updates.priority = editPriority;
    if (editProgress !== task.progress) updates.progress = editProgress;
    if (editEstMinutes !== task.estimatedMinutes) {
      updates.estimatedMinutes = editEstMinutes;
    }
    if (editMaxMinutes !== task.maxMinutes) {
      updates.maxMinutes = editMaxMinutes;
    }
    if (editProjectId !== task.projectId) {
      updates.projectId = editProjectId;
    }
    if (editAssigneeId !== task.assigneeUserId) {
      updates.assigneeUserId = editAssigneeId;
      onAssigneeChange?.(editAssigneeId);
    }

    if (Object.keys(updates).length > 0) {
      onUpdateTask?.(updates);
    }

    const subtasksChanged = JSON.stringify(editSubtasks) !== JSON.stringify(initialSubtasks ?? []);
    if (subtasksChanged) {
      onUpdateSubtasks?.(editSubtasks);
    }

    onClose?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  // ── Subtask helpers ─────────────────────────────────────
  const handleAddSubtask = () => {
    const text = newSubtaskText.trim();
    if (!text) return;
    setEditSubtasks((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, title: text, completed: false },
    ]);
    setNewSubtaskText("");
  };

  const handleToggleSubtask = (id: string) => {
    setEditSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setEditSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubtaskRename = (id: string, title: string) => {
    setEditSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  // ── Dropdown chip ───────────────────────────────────────
  function DropdownChip({
    children,
    ...props
  }: {
    children: React.ReactNode;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
      <button
        {...props}
        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border hover:bg-accent transition-colors"
      >
        {children}
        <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <>
      {/* Header */}
      <DialogHeader className="shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Back arrow (quick-add mode) */}
          {quickAddMode && (
            <button
              onClick={() => {
                handleSave();
                quickAddMode.onBackToList();
              }}
              className="p-1 hover:bg-accent rounded transition-colors -ml-1"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {/* Difficulty picker */}
          <Popover>
            <PopoverTrigger asChild>
              <DropdownChip>
                <Zap className="h-3 w-3" style={{ color: diff.color }} />
                <span style={{ color: diff.color }}>{diff.label}</span>
              </DropdownChip>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="start">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Difficulty
              </div>
              {ALL_DIFFICULTIES.map((d) => {
                const dc = difficultyConfig[d];
                const selected = d === editDifficulty;
                return (
                  <button
                    key={d}
                    onClick={() => setEditDifficulty(d)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent ${
                      selected ? "bg-accent" : ""
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" style={{ color: dc.color }} />
                    <span style={{ color: dc.color }}>{dc.label}</span>
                    {selected && <Check className="h-3 w-3 ml-auto text-primary" />}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>

          {/* Priority picker */}
          <Popover>
            <PopoverTrigger asChild>
              <DropdownChip>
                <PriorityIcon priority={editPriority} className="h-3 w-3" />
                <span>{priorityCfg.label}</span>
              </DropdownChip>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="start">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Priority</div>
              {ALL_PRIORITIES.map((p) => {
                const selected = p === editPriority;
                return (
                  <button
                    key={p}
                    onClick={() => setEditPriority(p)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent ${
                      selected ? "bg-accent" : ""
                    }`}
                  >
                    <PriorityIcon priority={p} className="h-3.5 w-3.5" />
                    <span>{PRIORITY_CONFIG[p].label}</span>
                    {selected && <Check className="h-3 w-3 ml-auto text-primary" />}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>

          {/* Project picker */}
          {projects && projects.length > 0 ? (
            <Popover>
              <PopoverTrigger asChild>
                <DropdownChip>
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: currentProject.color }}
                  />
                  <span>{currentProject.name}</span>
                </DropdownChip>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="start">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Project</div>
                {projects.map((p) => {
                  const selected = p.id === editProjectId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setEditProjectId(p.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent ${
                        selected ? "bg-accent" : ""
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="flex-1 truncate text-left">{p.name}</span>
                      {selected && <Check className="h-3 w-3 ml-auto text-primary" />}
                    </button>
                  );
                })}
              </PopoverContent>
            </Popover>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: projectColor }} />
              {projectName}
            </span>
          )}

          {isCompleted && <span className="text-xs text-green-600 font-medium">Completed</span>}
        </div>

        {/* Title */}
        <DialogTitle asChild>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none py-1 w-full transition-colors"
          />
        </DialogTitle>
      </DialogHeader>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto -mx-6 px-6">
        <div className="space-y-4 pb-2">
          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add details about this task..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{editProgress}%</span>
            </div>
            <Slider
              value={[editProgress]}
              onValueChange={([v]) => setEditProgress(v)}
              min={0}
              max={100}
              step={5}
              className="py-1"
            />
          </div>

          {/* Tracked time (read-only) */}
          {timeInfo && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatDuration(timeInfo.actual)} / {formatDuration(timeInfo.estimated)} tracked
              {timeInfo.isUnder && (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  ({formatDuration(timeInfo.difference)} under)
                </span>
              )}
            </div>
          )}

          {/* Dates (read-only context) */}
          {(task.plannedForDate || task.dueDate) && (
            <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
              {task.plannedForDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(task.plannedForDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400">
                    Due{" "}
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* External source */}
          {extSource && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Linked source</Label>
              <div className="flex items-center gap-2">
                {externalUrl ? (
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: extSource.bg, color: extSource.fg }}
                  >
                    <extSource.Icon className="h-4 w-4" />
                    <span>{extSource.label}</span>
                    {task.externalId && <span style={{ opacity: 0.8 }}>#{task.externalId}</span>}
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>
                ) : (
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
                    style={{ backgroundColor: extSource.bg, color: extSource.fg }}
                  >
                    <extSource.Icon className="h-4 w-4" />
                    <span>{extSource.label}</span>
                    {task.externalId && <span style={{ opacity: 0.8 }}>#{task.externalId}</span>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Time estimates */}
          <div className="grid grid-cols-2 gap-3">
            <TimeInput
              value={editEstMinutes}
              onChange={setEditEstMinutes}
              label="Estimated time"
              icon={Timer}
            />
            <TimeInput
              value={editMaxMinutes}
              onChange={setEditMaxMinutes}
              label="Max time (auto-stop)"
              icon={Hourglass}
            />
          </div>

          {/* ── Subtasks ─────────────────────────────────── */}
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Subtasks
              {hasSubtasks && (
                <span className="ml-1.5 text-muted-foreground/60">
                  ({completedSubtasks}/{editSubtasks.length})
                </span>
              )}
            </Label>

            {/* Subtask list */}
            {hasSubtasks && (
              <div className="space-y-1">
                {editSubtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 group rounded-md hover:bg-muted/50 px-1 py-0.5"
                  >
                    <button
                      onClick={() => handleToggleSubtask(subtask.id)}
                      className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        subtask.completed
                          ? "bg-green-500 border-green-500"
                          : "border-muted-foreground/30 hover:border-muted-foreground/50"
                      }`}
                    >
                      {subtask.completed && <Check className="h-3 w-3 text-white" />}
                    </button>

                    <input
                      type="text"
                      value={subtask.title}
                      onChange={(e) => handleSubtaskRename(subtask.id, e.target.value)}
                      className={`flex-1 min-w-0 text-sm bg-transparent focus:outline-none border-b border-transparent focus:border-border ${
                        subtask.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    />

                    <button
                      onClick={() => handleRemoveSubtask(subtask.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/10 rounded transition-opacity"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add subtask input */}
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                id={newSubtaskInputId}
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add a subtask..."
                className="flex-1 text-sm bg-transparent border-b border-dashed border-border focus:border-primary focus:outline-none py-1 placeholder:text-muted-foreground/50"
              />
              {newSubtaskText.trim() && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={handleAddSubtask}
                >
                  Add
                </Button>
              )}
            </div>
          </div>

          {/* ── Assign to ────────────────────────────────── */}
          {(canAssign || assignedMember) && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs text-muted-foreground">Assign to</Label>
                  {assignmentPolicy === "LEADS_ONLY" && (
                    <ShieldCheck className="h-3 w-3 text-muted-foreground/50" />
                  )}
                </div>

                {canAssign ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-accent transition-colors text-left">
                        {assignedMember ? (
                          <>
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                              {assignedMember.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="flex-1 truncate">{assignedMember.name}</span>
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1 text-muted-foreground">Unassigned</span>
                          </>
                        )}
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-1"
                      align="start"
                    >
                      <button
                        onClick={() => setEditAssigneeId(null)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent ${
                          !editAssigneeId ? "bg-accent" : ""
                        }`}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Unassigned</span>
                        {!editAssigneeId && <Check className="h-3 w-3 ml-auto text-primary" />}
                      </button>
                      {teamMembers!.map((member) => {
                        const selected = member.id === editAssigneeId;
                        return (
                          <button
                            key={member.id}
                            onClick={() => setEditAssigneeId(member.id)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent ${
                              selected ? "bg-accent" : ""
                            }`}
                          >
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="flex-1 truncate text-left">{member.name}</span>
                            {selected && <Check className="h-3 w-3 ml-auto text-primary" />}
                          </button>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                ) : assignedMember ? (
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                      {assignedMember.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{assignedMember.name}</span>
                  </div>
                ) : null}

                <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {assignmentPolicy === "LEADS_ONLY"
                    ? "Only team leads can reassign tasks"
                    : "Team leads and members can reassign tasks"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="shrink-0 flex flex-row justify-between gap-2 sm:justify-between">
        {quickAddMode ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleSave();
                quickAddMode.onBackToList();
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to List
            </Button>
            <Button
              size="sm"
              onClick={() => {
                handleSave();
                quickAddMode.onCreateAll();
              }}
            >
              <Check className="h-4 w-4 mr-1.5" />
              Create All ({quickAddMode.taskCount})
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1.5" />
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              {!isCompleted && onComplete && editProgress >= 80 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  onClick={onComplete}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Complete
                </Button>
              )}
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4 mr-1.5" />
                Save
              </Button>
            </div>
          </>
        )}
      </DialogFooter>
    </>
  );
}

// ─── TaskDetailModal (Dialog wrapper) ──────────────────────

export function TaskDetailModal({ open, onOpenChange, ...contentProps }: TaskDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] !flex !flex-col">
        <TaskDetailContent {...contentProps} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
