# @stridetime/core

## 1.0.5-alpha.0

### Patch Changes

- 68132cc: Updated UI components, added features and pricing plan repos and services
- Updated dependencies [68132cc]
  - @stridetime/db@1.0.5-alpha.0
  - @stridetime/types@1.0.5-alpha.0

## 1.0.4

### Patch Changes

- 0f9e9e4: Hotfix: Automatic patch version bump
- Updated dependencies [0f9e9e4]
  - @stridetime/db@1.0.4
  - @stridetime/types@1.0.4

## 1.0.3

### Patch Changes

- 7a94d1a: Hotfix: Automatic patch version bump
- Updated dependencies [7a94d1a]
  - @stridetime/db@1.0.3
  - @stridetime/types@1.0.3

## 1.0.2

### Patch Changes

- cf46123: Hotfix: Automatic patch version bump
- Updated dependencies [cf46123]
  - @stridetime/db@1.0.2
  - @stridetime/types@1.0.2

## 1.0.1

### Patch Changes

- 3cea355: Hotfix: Automatic patch version bump
- Updated dependencies [3cea355]
  - @stridetime/db@1.0.1
  - @stridetime/types@1.0.1

## 0.1.16

### Patch Changes

- export sync functions
- Updated dependencies
  - @stridetime/core@0.1.16

## 0.1.14

### Patch Changes

- bumped to latest types and db package versions
- Updated dependencies
  - @stridetime/core@0.1.14

## 0.1.12

### Patch Changes

- bump stridetime/types

## 0.1.10

### Patch Changes

- added types for tasks

## 0.1.8

### Patch Changes

- exported database init

## 0.1.6

### Patch Changes

- bumped up stridetime/db version

## 0.1.4

### Patch Changes

- added functionality for password reset

## 0.1.2

### Patch Changes

- init

## 0.1.0

### Initial Release

**Task Management:**

- `createTask()` - Create tasks with full validation
- `updateTask()` - Update task properties
- `updateTaskProgress()` - Update progress with parent rollup
- `TaskValidationError` - Typed validation errors

**Productivity Scoring:**

- `calculateTaskScore()` - Points based on difficulty, efficiency, focus
- `calculateDailyScore()` - Sum daily productivity points
- `calculateEfficiency()` - Efficiency rating calculation
- `calculateTrend()` - Trend vs 30-day average
- `DIFFICULTY_MULTIPLIERS` - Point values for each difficulty

**Validation:**

- `canHaveSubtasks()` - Enforce 2-level max depth
- `validateSubtaskCreation()` - Sub-task validation
- `calculateParentProgress()` - Average sub-task progress
- `canCompleteParent()` - Check if parent can be 100%
- `getIncompleteSubtasks()` - Filter incomplete sub-tasks

**Planning:**

- `assignToDay()` - Assign task to specific day
- `unassignTask()` - Remove from planned day
- `rescheduleTask()` - Move to different day
- `getTasksForDay()` - Query tasks by day
- `getOngoingTasks()` - Get lapsed tasks
- `getBacklogTasks()` - Get unplanned tasks
- `calculatePriority()` - Priority scoring algorithm

**TypeScript:**

- Full type definitions
- Exports types from @stridetime/db
- Strict type checking

**Testing:**

- Vitest configuration
- Pure functions for easy testing
