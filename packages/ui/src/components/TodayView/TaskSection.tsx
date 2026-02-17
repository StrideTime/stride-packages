import { ChevronDown, ChevronRight } from "lucide-react";

export interface TaskSectionProps {
  /** Section title (e.g., "Completed") */
  title?: string;
  /** Number of tasks in section (shown in title if collapsible) */
  count?: number;
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Whether section is currently expanded (only used if collapsible) */
  expanded?: boolean;
  /** Callback when section is toggled */
  onToggle?: () => void;
  /** Task cards or other content to display */
  children: React.ReactNode;
  /** Additional classes for the section */
  className?: string;
}

/**
 * TaskSection — Reusable container for task lists with optional collapse functionality.
 * Used for both active and completed task sections in Today view.
 */
export function TaskSection({
  title,
  count,
  collapsible = false,
  expanded = true,
  onToggle,
  children,
  className = "",
}: TaskSectionProps) {
  if (collapsible && title) {
    return (
      <div className={className}>
        <button
          onClick={onToggle}
          className="mb-2 flex items-center gap-2 text-sm font-medium
            text-muted-foreground transition-colors hover:text-foreground"
          aria-expanded={expanded}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {title}
          {count !== undefined && ` (${count})`}
        </button>
        {expanded && <div className={`space-y-2 ${className}`}>{children}</div>}
      </div>
    );
  }

  return (
    <div className={className}>
      {title && <h2 className="mb-3 text-sm font-medium">{title}</h2>}
      <div className="space-y-2">{children}</div>
    </div>
  );
}
