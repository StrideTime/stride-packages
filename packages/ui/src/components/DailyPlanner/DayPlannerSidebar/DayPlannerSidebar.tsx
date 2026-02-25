import { useState, useMemo } from 'react';
import { Search, CalendarDays } from 'lucide-react';
import { Input, ScrollArea } from '@primitives';
import { PlannedTaskCard } from '../PlannedTaskCard';
import type { Task, Project } from '@stridetime/types';
import styles from './DayPlannerSidebar.module.css';

export type DayPlannerSidebarProps = {
  plannedTasks: Task[];
  recommendedTasks?: Task[];
  searchResults?: Task[];
  projects: Project[];
  onSearchTasks?: (query: string) => void;
};

export function DayPlannerSidebar({
  plannedTasks,
  recommendedTasks,
  searchResults,
  projects,
  onSearchTasks,
}: DayPlannerSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const projectById = useMemo(
    () => new Map(projects.map(p => [p.id, p])),
    [projects],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchTasks?.(query);
  };

  const isSearching = searchQuery.trim().length > 0;
  const hasRecommendations = (recommendedTasks?.length ?? 0) > 0;

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Day Planner</h2>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <Input
            className={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <ScrollArea className={styles.scrollArea}>
        {isSearching ? (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>
              Search Results {searchResults ? `(${searchResults.length})` : ''}
            </p>
            {(searchResults ?? []).map(task => (
              <PlannedTaskCard
                key={task.id}
                task={task}
                project={projectById.get(task.projectId ?? '')!}
                draggableId={`search-${task.id}`}
              />
            ))}
            {(searchResults ?? []).length === 0 && (
              <div className={styles.emptyState}>No results found</div>
            )}
          </div>
        ) : (
          <>
            <div className={styles.section}>
              <p className={styles.sectionLabel}>
                Planned for Today <span style={{ textTransform: 'none' }}>({plannedTasks.length})</span>
              </p>
              {plannedTasks.map(task => (
                <PlannedTaskCard
                  key={task.id}
                  task={task}
                  project={projectById.get(task.projectId ?? '')!}
                  draggableId={`planned-${task.id}`}
                />
              ))}
              {plannedTasks.length === 0 && (
                <div className={styles.emptyState}>
                  <CalendarDays className={styles.emptyIcon} />
                  <p className={styles.emptyTitle}>Nothing planned yet</p>
                  <p className={styles.emptySubtitle}>Drag tasks onto the timeline to schedule your day</p>
                </div>
              )}
            </div>

            {hasRecommendations && (
              <div className={styles.section}>
                <p className={styles.sectionLabel}>
                  Recommendations <span style={{ textTransform: 'none' }}>({recommendedTasks!.length})</span>
                </p>
                {recommendedTasks!.map(task => (
                  <PlannedTaskCard
                    key={task.id}
                    task={task}
                    project={projectById.get(task.projectId ?? '')!}
                    draggableId={`rec-${task.id}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}
