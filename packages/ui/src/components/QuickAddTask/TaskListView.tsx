import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "../../primitives/Badge";
import type { DraftTask, TaskListViewProps } from "./QuickAddTask.types";

export function TaskListView({
  tasks,
  projects,
  selectedProjectId,
  hoveredGroupId: externalHoveredId,
  onTasksChange,
  onHoveredGroupChange,
  onSelectTask,
}: TaskListViewProps) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const hoveredGroupId = externalHoveredId ?? localHoveredId;

  const defaultProject = projects.find((p) => p.id === selectedProjectId);

  const getTaskFamily = (taskId: string): string[] => {
    const family = [taskId];
    tasks
      .filter((t) => t.parentTaskId === taskId)
      .forEach((child) => family.push(...getTaskFamily(child.id)));
    return family;
  };

  const handleTaskChange = (id: string, value: string) => {
    onTasksChange(tasks.map((t) => (t.id === id ? { ...t, title: value } : t)));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, taskId: string) => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    const task = tasks[taskIndex];

    if (e.key === "Enter") {
      e.preventDefault();
      const newTask: DraftTask = {
        id: `task-${Date.now()}`,
        title: "",
        indent: task.indent,
        parentTaskId: task.parentTaskId,
        difficulty: "MEDIUM",
      };
      const newTasks = [...tasks];
      newTasks.splice(taskIndex + 1, 0, newTask);
      onTasksChange(newTasks);
      setTimeout(() => inputRefs.current[newTask.id]?.focus(), 0);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        if (task.indent > 0) {
          onTasksChange(
            tasks.map((t) =>
              t.id === taskId ? { ...t, indent: t.indent - 1, parentTaskId: null } : t
            )
          );
          setTimeout(() => inputRefs.current[taskId]?.focus(), 0);
        }
      } else {
        const prevTask = tasks[taskIndex - 1];
        if (prevTask && task.indent < 3) {
          onTasksChange(
            tasks.map((t) =>
              t.id === taskId ? { ...t, indent: task.indent + 1, parentTaskId: prevTask.id } : t
            )
          );
          setTimeout(() => inputRefs.current[taskId]?.focus(), 0);
        }
      }
    } else if (e.key === "Backspace" && task.title === "" && tasks.length > 1) {
      e.preventDefault();
      onTasksChange(tasks.filter((t) => t.id !== taskId));
      if (taskIndex > 0) {
        setTimeout(() => inputRefs.current[tasks[taskIndex - 1].id]?.focus(), 0);
      }
    }
  };

  /**
   * Smart double-click: if the user double-clicks on actual text inside an
   * input they're selecting a word — let the browser handle it. If they
   * click in the empty space to the right of the text (or outside any input)
   * treat it as an "open editor" gesture.
   */
  const handleGroupDoubleClick = (e: MouseEvent, parentTask: DraftTask) => {
    if (!parentTask.title.trim()) return;

    const target = e.target as HTMLElement;

    if (target.tagName === "INPUT") {
      const input = target as HTMLInputElement;
      const text = input.value;
      if (!text) {
        // Empty input — open editor
        onSelectTask(parentTask.id);
        return;
      }

      // Measure the rendered text width with a temporary canvas
      const style = window.getComputedStyle(input);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const textWidth = ctx.measureText(text).width;

        // Where the click landed relative to the input's left content edge
        const rect = input.getBoundingClientRect();
        const paddingLeft = parseFloat(style.paddingLeft) || 0;
        const clickX = e.clientX - rect.left - paddingLeft;

        // If click is beyond the text + a small buffer, it's empty space
        if (clickX > textWidth + 8) {
          // Prevent the browser from selecting text
          e.preventDefault();
          window.getSelection()?.removeAllRanges();
          onSelectTask(parentTask.id);
          return;
        }
      }
      // Click was on actual text — let the browser select the word
      return;
    }

    if (target.tagName === "TEXTAREA") return;

    // Clicked on bullet, badge, whitespace, etc. — open editor
    onSelectTask(parentTask.id);
  };

  // Group tasks by parent
  const taskGroups: DraftTask[][] = [];
  const processedIds = new Set<string>();
  tasks.forEach((task) => {
    if (task.indent === 0 && !processedIds.has(task.id)) {
      const group = [
        task,
        ...getTaskFamily(task.id)
          .slice(1)
          .map((id) => tasks.find((t) => t.id === id)!)
          .filter(Boolean),
      ];
      taskGroups.push(group);
      group.forEach((t) => processedIds.add(t.id));
    }
  });

  return (
    <div className="flex-1 border rounded-lg overflow-hidden bg-background">
      <div className="h-full overflow-y-auto p-4">
        {taskGroups.map((group) => {
          const parentTask = group[0];
          const isHovered = hoveredGroupId === parentTask.id;

          return (
            <div
              key={parentTask.id}
              className="rounded-md transition-all duration-200 mb-2"
              style={
                isHovered
                  ? { backgroundColor: "color-mix(in srgb, var(--muted) 40%, transparent)" }
                  : undefined
              }
              onMouseEnter={() => {
                setLocalHoveredId(parentTask.id);
                onHoveredGroupChange?.(parentTask.id);
              }}
              onMouseLeave={() => {
                setLocalHoveredId(null);
                onHoveredGroupChange?.(null);
              }}
              onDoubleClick={(e) => handleGroupDoubleClick(e, parentTask)}
            >
              {group.map((task) => {
                // Resolve the project for this task (own override or default)
                const taskProject =
                  task.indent === 0 && task.title.trim()
                    ? task.projectId && task.projectId !== selectedProjectId
                      ? projects.find((p) => p.id === task.projectId)
                      : defaultProject
                    : null;

                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 py-1.5"
                    style={{ paddingLeft: `${8 + task.indent * 24}px` }}
                  >
                    {/* Bullet */}
                    <div className="shrink-0 flex items-center justify-center w-4 h-4">
                      {task.indent === 0 ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      ) : task.indent === 1 ? (
                        <div className="w-1.5 h-1.5 rounded-full border border-foreground" />
                      ) : (
                        <div
                          className="w-1.5 h-1.5 bg-foreground"
                          style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
                        />
                      )}
                    </div>

                    <input
                      ref={(el) => {
                        inputRefs.current[task.id] = el;
                      }}
                      type="text"
                      value={task.title}
                      onChange={(e) => handleTaskChange(task.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, task.id)}
                      placeholder="Task name..."
                      className="flex-1 h-7 px-2 bg-transparent border-0 text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                    />

                    {/* Project badge for root tasks with a title */}
                    {taskProject && (
                      <Badge variant="outline" className="shrink-0 text-xs h-5 px-1.5 gap-1">
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: taskProject.color ?? undefined }}
                        />
                        {taskProject.name}
                      </Badge>
                    )}

                    {/* Configure arrow */}
                    {task.indent === 0 && task.title.trim() && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(task.id);
                        }}
                        className={`shrink-0 p-1 hover:bg-accent rounded transition-all duration-200 ${
                          isHovered ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Keyboard hints */}
      <div
        className="border-t px-4 py-2 text-xs text-muted-foreground"
        style={{ backgroundColor: "color-mix(in srgb, var(--muted) 30%, transparent)" }}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Enter</kbd> New
            Task
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Tab</kbd> Indent
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Shift+Tab</kbd>{" "}
            Outdent
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">
              Double-click
            </kbd>{" "}
            Edit Task
          </span>
        </div>
      </div>
    </div>
  );
}
