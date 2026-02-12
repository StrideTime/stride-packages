/**
 * @stridetime/core
 * Business logic for Stride - task management, scoring, and productivity calculations
 */

// Services (new repository-based pattern) - PRIMARY API
export * from './services';

// Auth
export { AuthService } from './auth/AuthService';
export { createAuthService } from './auth/createAuthService';

// Sanitization utilities
export * from './utils';

// Database functions (re-exported from @stridetime/db)
export {
  initDatabase,
  getDatabase,
  closeDatabase,
  isDatabaseInitialized,
  connectSync,
  disconnectSync,
  isSyncEnabled,
  getSyncStatus,
  onSyncStatusChange,
  type StrideDatabase,
  type DatabaseConfig,
  type LocalDatabaseConfig,
  type SyncDatabaseConfig,
  type SyncStatus,
  type SyncState,
} from '@stridetime/db';

// Re-export enums from @stridetime/types
