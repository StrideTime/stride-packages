import { useDraggable } from '@dnd-kit/core';
import { CalendarClock, Timer } from 'lucide-react';
import { Card, Badge } from '@primitives';
import { cn, DIFFICULTY_CONFIG, getDueStatus, getMaxWarning } from '@utils';
import type { Task, Project } from '@stridetime/types';
import styles from './PlannedTaskCard.module.css';

export type PlannedTaskCardProps = {
  task: Task;
  project: Project;
  draggableId: string;
};

function InfoChip({
  icon: Icon,
  label,
  warningColor,
}: {
  icon: typeof CalendarClock;
  label: string;
  warningColor?: string;
}) {
  return (
    <span
      className={cn(styles.infoChip, warningColor ? styles.infoChipWarning : styles.infoChipDefault)}
      style={warningColor ? { '--chip-color': warningColor } as React.CSSProperties : undefined}
    >
      <Icon className={styles.infoChipIcon} />
      {label}
    </span>
  );
}

export function PlannedTaskCard({ task, project, draggableId }: PlannedTaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableId,
  });

  const difficultyConfig = task.difficulty ? DIFFICULTY_CONFIG[task.difficulty] : null;
  const dueStatus = getDueStatus(task.dueDate);
  const actual = task.actualMinutes ?? 0;
  const maxWarning = getMaxWarning(actual, task.maxMinutes);

  const timeLabel: string | null = (() => {
    if (task.estimatedMinutes != null && task.estimatedMinutes > 0) return `${actual}/${task.estimatedMinutes}m`;
    if (actual > 0) return `${actual}m`;
    return null;
  })();

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(styles.card, isDragging && styles.isDragging)}
    >
      <div className={styles.titleRow}>
        <div className={styles.title}>{task.title}</div>
        {difficultyConfig && (
          <Badge
            variant="outline"
            className={styles.difficultyBadge}
            style={{ '--badge-color': difficultyConfig.color } as React.CSSProperties}
          >
            {difficultyConfig.label}
          </Badge>
        )}
      </div>

      <div className={styles.metaRow}>
        <div className={styles.projectChip}>
          <div className={styles.projectDot} style={{ backgroundColor: project.color || '#3b82f6' }} />
          <span className={styles.projectName}>{project.name}</span>
        </div>
        {dueStatus != null && (
          <InfoChip icon={CalendarClock} label={dueStatus.label} warningColor={dueStatus.color} />
        )}
        {timeLabel != null && (
          <InfoChip icon={Timer} label={timeLabel} />
        )}
        {maxWarning != null && (
          <InfoChip icon={Timer} label={maxWarning.label} warningColor={maxWarning.color} />
        )}
      </div>
    </Card>
  );
}
