# @stridetime/test-utils

Shared testing utilities for Stride packages.

## Installation

```bash
yarn add --dev @stridetime/test-utils
```

## Usage

### Mock Generators

```typescript
import { createMockTask, createMockUser, createMockTimeEntry } from '@stridetime/test-utils';

// Create a single mock
const task = createMockTask({ title: 'My Task', difficulty: 'HARD' });

// Create multiple mocks
const tasks = createMockTasks(5, { userId: 'user-123' });

// Create completed task
const completed = createCompletedTask({ actualMinutes: 45 });
```

### Repository Mocks

```typescript
import { createMockTaskRepo, createMockDatabase } from '@stridetime/test-utils';
import { vi } from 'vitest';

const mockTaskRepo = createMockTaskRepo();
const mockDb = createMockDatabase();

// Setup mock responses
mockTaskRepo.findById.mockResolvedValue(createMockTask());

// Use in tests
const task = await mockTaskRepo.findById(mockDb, 'task-123');
```

## Available Mocks

### Entity Mocks
- `createMockTask()` / `createMockTasks()` / `createCompletedTask()`
- `createMockProject()` / `createMockProjects()`
- `createMockUser()` / `createMockUsers()`
- `createMockWorkspace()` / `createMockWorkspaces()`
- `createMockTimeEntry()` / `createMockTimeEntries()` / `createCompletedTimeEntry()`
- `createMockDailySummary()` / `createMockDailySummaries()`
- `createMockTaskType()` / `createMockTaskTypes()`

### Helper Mocks
- `createMockDatabase()` - Mock StrideDatabase instance
- `createMockTaskRepo()` - Mock TaskRepository
- `createMockProjectRepo()` - Mock ProjectRepository
- `createMockWorkspaceRepo()` - Mock WorkspaceRepository
- `createMockTimeEntryRepo()` - Mock TimeEntryRepository
- `createMockDailySummaryRepo()` - Mock DailySummaryRepository
- `createMockUserRepo()` - Mock UserRepository
- `createMockTaskTypeRepo()` - Mock TaskTypeRepository

## License

AGPL-3.0
