import { ExternalLink, Check, ChevronDown } from "lucide-react";
import { Button } from "../../primitives/Button";
import { Popover, PopoverContent, PopoverTrigger } from "../../primitives/Popover";
import type { UserStatus } from "./TrayWindow.types";
import type { TrayHeaderProps } from "./TrayHeader.types";

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string }> = {
  ONLINE: { label: "Online", color: "#22c55e" },
  AWAY: { label: "Away", color: "#eab308" },
  BUSY: { label: "Busy", color: "#ef4444" },
  OFFLINE: { label: "Offline", color: "#6b7280" },
};

const ALL_STATUSES: UserStatus[] = ["ONLINE", "AWAY", "BUSY", "OFFLINE"];

export function TrayHeader({
  activeTab,
  onTabChange,
  isTimerRunning = false,
  workspaces,
  selectedWorkspace,
  onWorkspaceChange,
  onOpenMain,
  userStatus = "ONLINE",
  onStatusChange,
}: TrayHeaderProps) {
  const currentStatus = STATUS_CONFIG[userStatus];

  return (
    <div className="border-b shrink-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Status dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-accent/50 rounded-md px-2 py-1 -ml-2 transition-colors">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: currentStatus.color }}
              />
              <span className="text-sm font-semibold">{currentStatus.label}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-2" align="start">
            <div className="space-y-1">
              {ALL_STATUSES.map((status) => {
                const config = STATUS_CONFIG[status];
                return (
                  <button
                    key={status}
                    onClick={() => onStatusChange?.(status)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors ${
                      status === userStatus ? "bg-accent" : ""
                    }`}
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="flex-1 text-left">{config.label}</span>
                    {status === userStatus && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="sm" onClick={onOpenMain} className="h-7 text-xs px-2">
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {/* Workspace selector — hidden during active focus */}
      {!isTimerRunning && (
        <div className="px-4 pb-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-accent/30 hover:bg-accent/50 transition-colors text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: selectedWorkspace.color ?? undefined }}
                  />
                  <span className="font-medium">{selectedWorkspace.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => onWorkspaceChange(ws)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors ${
                      ws.id === selectedWorkspace.id ? "bg-accent" : ""
                    }`}
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: ws.color ?? undefined }}
                    />
                    <span className="flex-1 text-left">{ws.name}</span>
                    {ws.id === selectedWorkspace.id && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Tabs */}
      <div className="flex px-4">
        <button
          onClick={() => onTabChange("focus")}
          className={`flex-1 text-sm font-medium pb-3 transition-colors ${
            activeTab === "focus"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => onTabChange("stats")}
          className={`flex-1 text-sm font-medium pb-3 transition-colors ${
            activeTab === "stats"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Goals & Stats
        </button>
      </div>
    </div>
  );
}
