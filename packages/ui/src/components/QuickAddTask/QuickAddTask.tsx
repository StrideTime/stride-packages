import { Check } from "lucide-react";
import type { Task } from "@stridetime/types";
import { Button } from "../../primitives/Button";
import { Label } from "../../primitives/Label";
import { Badge } from "../../primitives/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../primitives/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../primitives/Select";
import { TaskDetailContent } from "../TaskCard/TaskDetailModal";
import { TaskListView } from "./TaskListView";
import type { DraftTask, QuickAddTaskProps } from "./QuickAddTask.types";

const ts = new Date().toISOString();

/** Convert a DraftTask into a full Task with sensible defaults. */
function draftToTask(draft: DraftTask, projectId?: string): Task {
  return {
    id: draft.id,
    userId: draft.userId ?? "",
    projectId: draft.projectId ?? projectId ?? "",
    parentTaskId: draft.parentTaskId ?? null,
    title: draft.title,
    description: draft.description ?? null,
    difficulty: draft.difficulty ?? "MEDIUM",
    priority: draft.priority ?? "NONE",
    progress: draft.progress ?? 0,
    status: draft.status ?? "BACKLOG",
    assigneeUserId: draft.assigneeUserId ?? null,
    teamId: draft.teamId ?? null,
    estimatedMinutes: draft.estimatedMinutes ?? null,
    maxMinutes: draft.maxMinutes ?? null,
    actualMinutes: draft.actualMinutes ?? 0,
    plannedForDate: draft.plannedForDate ?? null,
    dueDate: draft.dueDate ?? null,
    taskTypeId: draft.taskTypeId ?? null,
    displayOrder: draft.displayOrder ?? 0,
    tags: draft.tags ?? null,
    externalId: draft.externalId ?? null,
    externalSource: draft.externalSource ?? null,
    completedAt: draft.completedAt ?? null,
    createdAt: draft.createdAt ?? ts,
    updatedAt: draft.updatedAt ?? ts,
    deleted: draft.deleted ?? false,
  };
}

export function QuickAddTask({
  projects,
  // taskTypes and isWorkspaceAdmin kept in props type for TaskConfigView compatibility
  open,
  onOpenChange,
  tasks,
  onTasksChange,
  selectedProjectId,
  onSelectedProjectChange,
  selectedTaskId,
  onSelectedTaskChange,
  hoveredGroupId,
  onHoveredGroupChange,
  onCreate,
}: QuickAddTaskProps) {
  const selectedDraft = tasks.find((t) => t.id === selectedTaskId);
  const isEditing = selectedTaskId != null && selectedDraft != null;
  const nonEmptyCount = tasks.filter((t) => t.title.trim() && t.indent === 0).length;

  const handleCreate = () => {
    const nonEmpty = tasks.filter((t) => t.title.trim());
    onCreate?.(nonEmpty);
  };

  const handleUpdateDraftFromModal = (updates: Partial<Task>) => {
    if (!selectedTaskId) return;
    onTasksChange(tasks.map((t) => (t.id === selectedTaskId ? { ...t, ...updates } : t)));
  };

  const handleBackToList = () => {
    onSelectedTaskChange?.(null);
  };

  // Build project options for TaskDetailContent
  const modalProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color ?? "#6b7280",
  }));

  const selectedProject = projects.find(
    (p) => p.id === (selectedDraft?.projectId || selectedProjectId)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        {isEditing ? (
          /* ── Edit view: replaces list with task detail ── */
          <TaskDetailContent
            task={draftToTask(selectedDraft, selectedProjectId)}
            projectName={selectedProject?.name ?? ""}
            projectColor={selectedProject?.color ?? "#6b7280"}
            subtasks={tasks
              .filter((t) => t.parentTaskId === selectedDraft.id)
              .map((t) => ({ id: t.id, title: t.title, completed: false }))}
            onUpdateTask={handleUpdateDraftFromModal}
            onClose={handleBackToList}
            projects={modalProjects}
            quickAddMode={{
              taskCount: nonEmptyCount,
              onBackToList: handleBackToList,
              onCreateAll: () => {
                handleBackToList();
                handleCreate();
              },
            }}
          />
        ) : (
          /* ── List view: default task list ── */
          <>
            <DialogHeader>
              <DialogTitle>Quick Create Tasks</DialogTitle>
              <DialogDescription>
                Create tasks with bullet-list style. Use Tab/Shift+Tab to indent/outdent.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 min-h-0">
              <div className="h-full flex flex-col gap-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="project">Default Project</Label>
                    <Select value={selectedProjectId} onValueChange={onSelectedProjectChange}>
                      <SelectTrigger id="project">
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
                  {nonEmptyCount > 0 && (
                    <Badge variant="secondary" className="mb-2 shrink-0">
                      {nonEmptyCount} task{nonEmptyCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                <TaskListView
                  tasks={tasks}
                  projects={projects}
                  selectedProjectId={selectedProjectId}
                  hoveredGroupId={hoveredGroupId}
                  onTasksChange={onTasksChange}
                  onHoveredGroupChange={onHoveredGroupChange}
                  onSelectTask={(id) => onSelectedTaskChange?.(id)}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={nonEmptyCount === 0}>
                <Check className="h-4 w-4 mr-2" />
                Create ({nonEmptyCount})
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
