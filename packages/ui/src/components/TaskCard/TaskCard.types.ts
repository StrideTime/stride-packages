import type { Task, TimeEntry } from "@stridetime/types";

// ─── Subtask (simple checklist item) ─────────────────────

export interface SubtaskItem {
  id: string;
  title: string;
  completed: boolean;
}

// ─── Project ─────────────────────────────────────────────

export interface ProjectOption {
  id: string;
  name: string;
  color: string;
}

// ─── Assignment ──────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
}

export type AssignmentPolicy = "LEADS_ONLY" | "LEADS_AND_MEMBERS";

// ─── TaskCard ────────────────────────────────────────────

export interface TaskCardProps {
  task: Task;
  projectName: string;
  projectColor: string;
  taskTypeName?: string;
  taskTypeIcon?: string;
  subtasks?: SubtaskItem[];
  timeEntries?: TimeEntry[];
  onUpdateTimeEntry?: (id: string, updates: { startedAt: string; endedAt: string | null }) => void;
  onDeleteTimeEntry?: (id: string) => void;
  points?: number;

  /** URL to the linked entity on the external platform (Jira, GitHub, etc.) */
  externalUrl?: string;

  // State
  isActive?: boolean;
  expanded?: boolean;

  // Callbacks
  onToggleSubtask?: (subtaskId: string) => void;
  onToggleExpand?: () => void;
  onOpenDetail?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onUpdateProgress?: (progress: number) => void;
  onClick?: () => void;
}

// ─── TaskDetailContent (inner, no Dialog wrapper) ────────

export interface TaskDetailContentProps {
  task: Task;
  projectName: string;
  projectColor: string;
  subtasks?: SubtaskItem[];
  onUpdateTask?: (updates: Partial<Task>) => void;
  onUpdateSubtasks?: (subtasks: SubtaskItem[]) => void;
  onAssigneeChange?: (userId: string | null) => void;
  onComplete?: () => void;
  /** Called when the content wants to close (Save / Cancel / Back). */
  onClose?: () => void;

  /** URL to the linked entity on the external platform */
  externalUrl?: string;

  // Projects
  projects?: ProjectOption[];

  // Assignment
  teamMembers?: TeamMember[];
  assignmentPolicy?: AssignmentPolicy;
  currentUserIsLead?: boolean;

  // Quick-add mode (replaces default footer)
  /** When set, replaces the default Cancel/Save footer with Back to List / Create All */
  quickAddMode?: {
    taskCount: number;
    onBackToList: () => void;
    onCreateAll: () => void;
  };
}

// ─── TaskDetailModal (Dialog wrapper) ────────────────────

export interface TaskDetailModalProps extends TaskDetailContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
