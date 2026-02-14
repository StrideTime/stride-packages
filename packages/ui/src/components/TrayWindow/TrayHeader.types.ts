import type { UserStatus, Workspace } from "./TrayWindow.types";

export interface TrayHeaderProps {
  activeTab: "focus" | "stats";
  onTabChange: (tab: "focus" | "stats") => void;
  isTimerRunning?: boolean;
  hasActiveTask?: boolean;
  workspaces: Workspace[];
  selectedWorkspace: Workspace;
  onWorkspaceChange: (workspace: Workspace) => void;
  onOpenMain: () => void;
  userStatus?: UserStatus;
  onStatusChange?: (status: UserStatus) => void;
}
