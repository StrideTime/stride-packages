import { useRef } from "react";
import {
  Users,
  Flag,
  Clock,
  Zap,
  Plus,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import type { TaskPriority } from "@stridetime/types";
import { Button } from "../../primitives/Button";
import { Label } from "../../primitives/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../primitives/Select";
import { Popover, PopoverContent, PopoverTrigger } from "../../primitives/Popover";
import { getDifficultyClasses } from "../shared";
import type { DraftTask, TaskConfigViewProps } from "./QuickAddTask.types";

// ─── Priority helpers ──────────────────────────────────────

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; colorClass: string; fill?: boolean }> =
  {
    NONE: { label: "None", colorClass: "text-muted-foreground" },
    LOW: { label: "Low", colorClass: "text-blue-500" },
    MEDIUM: { label: "Medium", colorClass: "text-yellow-500" },
    HIGH: { label: "High", colorClass: "text-orange-500" },
    CRITICAL: { label: "Critical", colorClass: "text-red-500", fill: true },
  };

const ALL_PRIORITIES: TaskPriority[] = ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

function PriorityIcon({ priority }: { priority?: TaskPriority }) {
  const cfg = PRIORITY_CONFIG[priority ?? "NONE"];
  return (
    <Flag className={`h-3 w-3 ${cfg.colorClass}`} {...(cfg.fill ? { fill: "currentColor" } : {})} />
  );
}

// ─── Time helpers ──────────────────────────────────────────

/** Split total minutes into hours + remaining minutes for display. */
function splitMinutes(total: number | null | undefined): { hours: number; minutes: number } {
  if (total == null || total <= 0) return { hours: 0, minutes: 0 };
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}

/** Combine hours + minutes input into total minutes. */
function combineMinutes(hours: number, minutes: number): number | null {
  const total = (hours || 0) * 60 + (minutes || 0);
  return total > 0 ? total : null;
}

// ─── Component ─────────────────────────────────────────────

export function TaskConfigView({
  task,
  tasks,
  projects,
  taskTypes,
  selectedProjectId,
  isWorkspaceAdmin = false,
  onUpdateTask,
  onTasksChange,
}: TaskConfigViewProps) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const selectedProject = projects.find((p) => p.id === (task.projectId || selectedProjectId));
  const subtasks = tasks.filter((t) => t.parentTaskId === task.id);
  const selectedTaskType = taskTypes.find((tt) => tt.id === task.taskTypeId);

  const estTime = splitMinutes(task.estimatedMinutes);
  const maxTime = splitMinutes(task.maxMinutes);

  const handleAddSubtask = () => {
    const newSubtask: DraftTask = {
      id: `task-${Date.now()}`,
      title: "",
      indent: 1,
      parentTaskId: task.id,
      difficulty: "MEDIUM",
    };
    onTasksChange([...tasks, newSubtask]);
    setTimeout(() => inputRefs.current[newSubtask.id]?.focus(), 0);
  };

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="space-y-4">
        {/* Project */}
        <div className="space-y-2">
          <Label htmlFor="task-project">Project *</Label>
          <Select
            value={task.projectId || selectedProjectId}
            onValueChange={(v) => onUpdateTask(task.id, { projectId: v })}
          >
            <SelectTrigger id="task-project">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: p.color ?? undefined }}
                    />
                    {p.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chips Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground text-center block">Priority</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs rounded-full border bg-background hover:bg-accent transition-colors">
                  <PriorityIcon priority={task.priority} />
                  <span className="truncate">{PRIORITY_CONFIG[task.priority ?? "NONE"].label}</span>
                  <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  {ALL_PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => onUpdateTask(task.id, { priority: p })}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent"
                    >
                      <PriorityIcon priority={p} />
                      <span>{PRIORITY_CONFIG[p].label}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground text-center block">Type</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs rounded-full border bg-background hover:bg-accent transition-colors">
                  {selectedTaskType?.icon && (
                    <span className="text-xs">{selectedTaskType.icon}</span>
                  )}
                  <span className="truncate">{selectedTaskType?.name ?? "None"}</span>
                  <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  <button
                    onClick={() => onUpdateTask(task.id, { taskTypeId: null })}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent"
                  >
                    <span className="text-muted-foreground">None</span>
                  </button>
                  {taskTypes.map((tt) => (
                    <button
                      key={tt.id}
                      onClick={() => onUpdateTask(task.id, { taskTypeId: tt.id })}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent"
                    >
                      {tt.icon && <span className="text-xs">{tt.icon}</span>}
                      <span>{tt.name}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground text-center block">Due date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs rounded-full border bg-background hover:bg-accent transition-colors">
                  <CalendarIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "None"}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <p className="text-sm text-muted-foreground">Calendar not yet implemented</p>
              </PopoverContent>
            </Popover>
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground text-center block">Difficulty</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs rounded-full border transition-colors ${getDifficultyClasses(task.difficulty || "MEDIUM")}`}
                >
                  <Zap className="h-3 w-3 shrink-0" />
                  <span className="truncate">{task.difficulty || "Medium"}</span>
                  <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  {(["TRIVIAL", "EASY", "MEDIUM", "HARD", "EXTREME"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => onUpdateTask(task.id, { difficulty: d })}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded ${getDifficultyClasses(d)}`}
                    >
                      <Zap className="h-3 w-3" />
                      <span>{d.charAt(0) + d.slice(1).toLowerCase()}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            placeholder="Add details about this task..."
            value={task.description || ""}
            onChange={(e) => onUpdateTask(task.id, { description: e.target.value })}
            rows={6}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Subtasks */}
        {task.indent === 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Subtasks</Label>
            <div className="border rounded-lg overflow-hidden">
              {subtasks.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">No subtasks yet</div>
              ) : (
                <div className="divide-y">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-2 p-2 hover:bg-accent/30">
                      <input
                        ref={(el) => {
                          inputRefs.current[st.id] = el;
                        }}
                        type="text"
                        value={st.title}
                        onChange={(e) => onUpdateTask(st.id, { title: e.target.value })}
                        placeholder="Subtask name..."
                        className="flex-1 border-0 h-8 px-2 bg-transparent text-sm focus:outline-none"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTasksChange(tasks.filter((t) => t.id !== st.id))}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleAddSubtask} className="w-full">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Subtask
            </Button>
          </div>
        )}

        {/* Assign To (admin only) */}
        {isWorkspaceAdmin && (
          <div className="space-y-2">
            <Label htmlFor="assign-to" className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Assign to
            </Label>
            <Select
              value={task.assigneeUserId || "backlog"}
              onValueChange={(v) =>
                onUpdateTask(task.id, { assigneeUserId: v === "backlog" ? null : v })
              }
            >
              <SelectTrigger id="assign-to">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: selectedProject?.color || "#6b7280" }}
                    />
                    Project Backlog
                  </div>
                </SelectItem>
                <SelectItem value="user_1">John Doe</SelectItem>
                <SelectItem value="user_2">Jane Smith</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Time Estimates */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Estimated time
            </Label>
            <div className="flex items-center border rounded-md bg-background px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-ring">
              <input
                type="number"
                min="0"
                max="999"
                placeholder="0"
                value={estTime.hours || ""}
                onChange={(e) => {
                  const h = parseInt(e.target.value) || 0;
                  onUpdateTask(task.id, { estimatedMinutes: combineMinutes(h, estTime.minutes) });
                }}
                className="w-12 text-center bg-transparent text-sm font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-muted-foreground">hr</span>
              <span className="text-muted-foreground/40">·</span>
              <input
                type="number"
                min="0"
                max="59"
                step="15"
                placeholder="0"
                value={estTime.minutes || ""}
                onChange={(e) => {
                  const m = parseInt(e.target.value) || 0;
                  onUpdateTask(task.id, { estimatedMinutes: combineMinutes(estTime.hours, m) });
                }}
                className="w-12 text-center bg-transparent text-sm font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Max time
              <span className="text-xs text-muted-foreground font-normal">(stop after this)</span>
            </Label>
            <div className="flex items-center border rounded-md bg-background px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-ring">
              <input
                type="number"
                min="0"
                max="999"
                placeholder="0"
                value={maxTime.hours || ""}
                onChange={(e) => {
                  const h = parseInt(e.target.value) || 0;
                  onUpdateTask(task.id, { maxMinutes: combineMinutes(h, maxTime.minutes) });
                }}
                className="w-12 text-center bg-transparent text-sm font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-muted-foreground">hr</span>
              <span className="text-muted-foreground/40">·</span>
              <input
                type="number"
                min="0"
                max="59"
                step="15"
                placeholder="0"
                value={maxTime.minutes || ""}
                onChange={(e) => {
                  const m = parseInt(e.target.value) || 0;
                  onUpdateTask(task.id, { maxMinutes: combineMinutes(maxTime.hours, m) });
                }}
                className="w-12 text-center bg-transparent text-sm font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
