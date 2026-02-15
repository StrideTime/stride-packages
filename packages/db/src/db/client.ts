/**
 * Stride Database Client
 *
 * Dual-mode database initialization:
 * - Local-only: PowerSync with local SQLite (no cloud sync)
 * - Cloud sync: PowerSync with Supabase sync enabled
 *
 * Both modes use PowerSync under the hood, which provides a WASM-based
 * SQLite database in the browser. The Drizzle driver wraps it with
 * type-safe query building.
 */

import { PowerSyncDatabase } from '@powersync/web';
import {
  DrizzleAppSchema,
  wrapPowerSyncWithDrizzle,
  type PowerSyncSQLiteDatabase,
} from '@powersync/drizzle-driver';
import type { AbstractPowerSyncDatabase } from '@powersync/common';
import * as schema from '../drizzle/schema';
import { SupabaseConnector } from './connector';

// ============================================================================
// DRIZZLE SCHEMA (for PowerSync + Drizzle driver)
// ============================================================================

/**
 * All Drizzle schema entries (tables + relations) combined.
 * Passed to wrapPowerSyncWithDrizzle to enable relational queries.
 */
const drizzleSchema = {
  // Tables
  usersTable: schema.usersTable,
  rolesTable: schema.rolesTable,
  featuresTable: schema.featuresTable,
  planFeaturesTable: schema.planFeaturesTable,
  planPricesTable: schema.planPricesTable,
  adminAuditLogTable: schema.adminAuditLogTable,
  userSubscriptionsTable: schema.userSubscriptionsTable,
  subscriptionHistoryTable: schema.subscriptionHistoryTable,
  workspacesTable: schema.workspacesTable,
  workspaceMembersTable: schema.workspaceMembersTable,
  projectsTable: schema.projectsTable,
  taskTypesTable: schema.taskTypesTable,
  tasksTable: schema.tasksTable,
  timeEntriesTable: schema.timeEntriesTable,
  scheduledEventsTable: schema.scheduledEventsTable,
  pointsLedgerTable: schema.pointsLedgerTable,
  dailySummariesTable: schema.dailySummariesTable,
  userPreferencesTable: schema.userPreferencesTable,
  teamsTable: schema.teamsTable,
  teamMembersTable: schema.teamMembersTable,
  projectTeamsTable: schema.projectTeamsTable,
  goalsTable: schema.goalsTable,
  breaksTable: schema.breaksTable,
  workSessionsTable: schema.workSessionsTable,
  workspaceUserPreferencesTable: schema.workspaceUserPreferencesTable,
  workspaceStatusesTable: schema.workspaceStatusesTable,
  // Relations
  usersRelations: schema.usersRelations,
  rolesRelations: schema.rolesRelations,
  featuresRelations: schema.featuresRelations,
  planFeaturesRelations: schema.planFeaturesRelations,
  planPricesRelations: schema.planPricesRelations,
  adminAuditLogRelations: schema.adminAuditLogRelations,
  userSubscriptionsRelations: schema.userSubscriptionsRelations,
  subscriptionHistoryRelations: schema.subscriptionHistoryRelations,
  workspacesRelations: schema.workspacesRelations,
  workspaceMembersRelations: schema.workspaceMembersRelations,
  projectsRelations: schema.projectsRelations,
  taskTypesRelations: schema.taskTypesRelations,
  tasksRelations: schema.tasksRelations,
  timeEntriesRelations: schema.timeEntriesRelations,
  scheduledEventsRelations: schema.scheduledEventsRelations,
  pointsLedgerRelations: schema.pointsLedgerRelations,
  dailySummariesRelations: schema.dailySummariesRelations,
  userPreferencesRelations: schema.userPreferencesRelations,
  teamsRelations: schema.teamsRelations,
  teamMembersRelations: schema.teamMembersRelations,
  projectTeamsRelations: schema.projectTeamsRelations,
  goalsRelations: schema.goalsRelations,
  breaksRelations: schema.breaksRelations,
  workSessionsRelations: schema.workSessionsRelations,
  workspaceUserPreferencesRelations: schema.workspaceUserPreferencesRelations,
  workspaceStatusesRelations: schema.workspaceStatusesRelations,
};

/**
 * PowerSync schema auto-generated from Drizzle table definitions.
 * No duplicate schema definitions needed.
 */
const powerSyncSchema = new DrizzleAppSchema(drizzleSchema);

// ============================================================================
// TYPES
// ============================================================================

/** Sync status states */
export type SyncState = 'disabled' | 'disconnected' | 'connecting' | 'connected' | 'error';

/** Sync status information */
export interface SyncStatus {
  state: SyncState;
  lastSyncedAt?: Date;
  error?: Error;
}

/** Base database configuration (always required) */
interface DatabaseConfigBase {
  /** SQLite database filename (default: 'stride.db') */
  dbFilename?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/** Configuration for local-only mode (no cloud sync) */
export interface LocalDatabaseConfig extends DatabaseConfigBase {
  /** Set to false to disable cloud sync */
  enableSync: false;
}

/** Configuration for cloud sync mode */
export interface SyncDatabaseConfig extends DatabaseConfigBase {
  /** Set to true to enable cloud sync */
  enableSync: true;
  /** Supabase project URL */
  supabaseUrl: string;
  /** Supabase anonymous key */
  supabaseAnonKey: string;
  /** PowerSync service endpoint URL */
  powersyncUrl: string;
  /**
   * Optional existing Supabase client to reuse for the PowerSync connector.
   * Prevents multiple GoTrueClient instances from conflicting on the same
   * localStorage session key.
   */
  // TODO: identify if this is a good pattern. I'm not sure what the import means
  supabaseClient?: import('@supabase/supabase-js').SupabaseClient;
}

/** Combined database configuration */
export type DatabaseConfig = LocalDatabaseConfig | SyncDatabaseConfig;

/** The Drizzle database type (wrapping PowerSync) */
export type StrideDatabase = PowerSyncSQLiteDatabase<typeof drizzleSchema>;

// ============================================================================
// DATABASE STATE
// ============================================================================

let db: StrideDatabase | null = null;
let powerSyncDb: PowerSyncDatabase | null = null;
let connector: SupabaseConnector | null = null;
let syncEnabled = false;
let currentSyncStatus: SyncStatus = { state: 'disabled' };
const syncStatusListeners: Set<(status: SyncStatus) => void> = new Set();

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the database.
 *
 * @param config - Database configuration
 * @returns The initialized Drizzle database instance
 *
 * @example Local-only mode
 * ```ts
 * const db = await initDatabase({
 *   enableSync: false,
 *   dbFilename: 'stride.db',
 * });
 * ```
 *
 * @example Cloud sync mode
 * ```ts
 * const db = await initDatabase({
 *   enableSync: true,
 *   supabaseUrl: 'https://project.supabase.co',
 *   supabaseAnonKey: 'anon-key',
 *   powersyncUrl: 'https://project.powersync.journeyapps.com',
 * });
 *
 * // After user signs in, connect to start syncing
 * await connectSync();
 * ```
 */
export async function initDatabase(config: DatabaseConfig): Promise<StrideDatabase> {
  if (db) {
    console.log('[Stride DB] initDatabase: already initialized, returning existing db');
    return db;
  }

  const { dbFilename = 'stride.db', debug = false } = config;

  console.log('[Stride DB] initDatabase: starting...', {
    dbFilename,
    enableSync: config.enableSync,
    debug,
  });

  // TODO: Figure out what multiple tabs means
  // TODO: Figure out how this works with pending migrations in drizzle schema reconciling existing local db
  // Create PowerSync database instance
  powerSyncDb = new PowerSyncDatabase({
    schema: powerSyncSchema,
    database: {
      dbFilename,
    },
    flags: {
      enableMultiTabs: true,
      useWebWorker: true,
    },
  });

  // Wait for PowerSync to initialize
  console.log('[Stride DB] initDatabase: calling powerSyncDb.init()...');
  await powerSyncDb.init();
  console.log('[Stride DB] initDatabase: powerSyncDb.init() complete');

  // Wrap PowerSync with Drizzle for type-safe queries
  db = wrapPowerSyncWithDrizzle(powerSyncDb, {
    schema: drizzleSchema,
    logger: debug,
  });

  // Set up sync if enabled
  if (config.enableSync) {
    syncEnabled = true;
    console.log('[Stride DB] initDatabase: sync ENABLED, creating connector...', {
      powersyncUrl: config.powersyncUrl,
      supabaseUrl: config.supabaseUrl,
      hasSupabaseClient: !!config.supabaseClient,
    });
    connector = new SupabaseConnector({
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
      powersyncUrl: config.powersyncUrl,
      supabaseClient: config.supabaseClient,
    });
    updateSyncStatus({ state: 'disconnected' });
  } else {
    syncEnabled = false;
    console.log('[Stride DB] initDatabase: sync DISABLED (local-only mode)');
    updateSyncStatus({ state: 'disabled' });
  }

  console.log('[Stride DB] initDatabase: complete ✓');
  return db;
}

// ============================================================================
// DATABASE ACCESS
// ============================================================================

/**
 * Get the current database instance.
 *
 * @throws Error if database has not been initialized
 * @returns The Drizzle database instance
 */
export function getDatabase(): StrideDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Check if the database is initialized.
 */
export function isDatabaseInitialized(): boolean {
  return db !== null;
}

/**
 * Get the raw PowerSync database instance.
 * Use with caution - prefer using the Drizzle API.
 */
export function getPowerSyncDatabase(): AbstractPowerSyncDatabase | null {
  return powerSyncDb;
}

// TODO: Use this more. Right now I think we're passing in the Supabase client in a lot of instances where we could just call this function
/**
 * Get the Supabase connector (only available when sync is enabled).
 * Useful for accessing the Supabase client for auth operations.
 */
export function getConnector(): SupabaseConnector | null {
  return connector;
}

// ============================================================================
// SYNC MANAGEMENT
// ============================================================================

/**
 * Connect to the PowerSync sync service.
 * Only works when sync is enabled and a connector is configured.
 *
 * Call this after the user signs in to start syncing.
 *
 * @throws Error if sync is not enabled or database not initialized
 */
export async function connectSync(): Promise<void> {
  console.log('[Stride DB] connectSync: called', {
    hasDb: !!powerSyncDb,
    syncEnabled,
    hasConnector: !!connector,
    currentState: currentSyncStatus.state,
  });

  if (!powerSyncDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  if (!syncEnabled || !connector) {
    throw new Error('Sync is not enabled. Initialize with enableSync: true.');
  }

  // Guard against duplicate connect calls — calling connect() twice
  // causes PowerSync to disconnect/reconnect, killing the upload loop.
  if (currentSyncStatus.state === 'connected' || currentSyncStatus.state === 'connecting') {
    console.log('[Stride DB] connectSync: already', currentSyncStatus.state, '— skipping');
    return;
  }

  // TODO: Identify if this is the correct approach. I don't know what edge cases to watch out for
  try {
    // Clear any stale CRUD entries left over from previous sessions.
    // These can accumulate when a sync loop occurred (e.g. updated_at bounce)
    // and prevent the upload loop from starting cleanly.
    const staleCount = await powerSyncDb.getAll<{ cnt: number }>(
      'SELECT count(*) as cnt FROM ps_crud'
    );
    if (staleCount[0]?.cnt > 0) {
      console.log(
        '[Stride DB] connectSync: clearing',
        staleCount[0].cnt,
        'stale CRUD entries before connecting'
      );
      await powerSyncDb.execute('DELETE FROM ps_crud');
    }

    updateSyncStatus({ state: 'connecting' });
    console.log('[Stride DB] connectSync: calling powerSyncDb.connect()...');
    await powerSyncDb.connect(connector);
    updateSyncStatus({ state: 'connected', lastSyncedAt: new Date() });
    console.log('[Stride DB] connectSync: connected ✓');
  } catch (error) {
    console.error('[Stride DB] connectSync: FAILED', error);
    updateSyncStatus({
      state: 'error',
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
}

/**
 * Disconnect from the PowerSync sync service.
 * Local database remains accessible.
 */
export async function disconnectSync(): Promise<void> {
  console.log('[Stride DB] disconnectSync: called');
  if (!powerSyncDb) return;

  await powerSyncDb.disconnect();
  if (syncEnabled) {
    updateSyncStatus({ state: 'disconnected' });
  }
  console.log('[Stride DB] disconnectSync: done');
}

/**
 * Check if cloud sync is enabled.
 */
export function isSyncEnabled(): boolean {
  return syncEnabled;
}

/**
 * Get the current sync status.
 */
export function getSyncStatus(): SyncStatus {
  return { ...currentSyncStatus };
}

/**
 * Subscribe to sync status changes.
 *
 * @param listener - Callback invoked when sync status changes
 * @returns Unsubscribe function
 *
 * @example
 * ```ts
 * const unsubscribe = onSyncStatusChange((status) => {
 *   console.log('Sync:', status.state);
 * });
 *
 * // Later: stop listening
 * unsubscribe();
 * ```
 */
export function onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
  syncStatusListeners.add(listener);
  return () => {
    syncStatusListeners.delete(listener);
  };
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Close the database connection and clean up resources.
 */
export async function closeDatabase(): Promise<void> {
  if (powerSyncDb) {
    await powerSyncDb.close();
    powerSyncDb = null;
  }
  db = null;
  connector = null;
  syncEnabled = false;
  currentSyncStatus = { state: 'disabled' };
  syncStatusListeners.clear();
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

function updateSyncStatus(status: SyncStatus): void {
  currentSyncStatus = status;
  syncStatusListeners.forEach(listener => {
    try {
      listener(status);
    } catch {
      // Don't let listener errors break sync status updates
    }
  });
}
