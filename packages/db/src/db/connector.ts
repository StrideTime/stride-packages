/**
 * Supabase Backend Connector for PowerSync
 *
 * Handles authentication and data upload between PowerSync and Supabase.
 * This connector is only used when cloud sync is enabled.
 */

import type {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@powersync/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface SupabaseConnectorConfig {
  /** Supabase project URL */
  supabaseUrl: string;
  /** Supabase anonymous key */
  supabaseAnonKey: string;
  /** PowerSync service endpoint URL */
  powersyncUrl: string;
  /**
   * Optional existing Supabase client to reuse.
   * Avoids creating multiple GoTrueClient instances that fight over
   * the same localStorage session key, causing undefined auth behavior.
   */
  supabaseClient?: SupabaseClient;
}

// ============================================================================
// CONNECTOR
// ============================================================================

export class SupabaseConnector implements PowerSyncBackendConnector {
  private supabase: SupabaseClient;
  private powersyncUrl: string;

  constructor(config: SupabaseConnectorConfig) {
    this.supabase =
      config.supabaseClient ?? createClient(config.supabaseUrl, config.supabaseAnonKey);
    this.powersyncUrl = config.powersyncUrl;
  }

  /**
   * Get the Supabase client instance.
   * Useful for auth operations (sign in, sign out, etc.)
   */
  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Fetch credentials for PowerSync authentication.
   * Returns null if the user is not signed in.
   */
  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    console.log('[PowerSync fetchCredentials] Called, endpoint:', this.powersyncUrl);
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();

    if (error) {
      console.error('[PowerSync fetchCredentials] Session error:', error);
      throw error;
    }

    if (!session) {
      console.warn('[PowerSync fetchCredentials] No session — returning null');
      return null;
    }

    console.log('[PowerSync fetchCredentials] ✓ Got credentials for:', session.user?.email, {
      endpoint: this.powersyncUrl,
      tokenLength: session.access_token?.length,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'none',
    });

    return {
      endpoint: this.powersyncUrl,
      token: session.access_token,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
    };
  }

  /**
   * Upload local changes to Supabase.
   * Called automatically by PowerSync when there are pending writes.
   */
  /**
   * Tables where the primary key column is NOT 'id'.
   * PowerSync uses op.id as the row identifier, but we need to map it
   * to the correct column for upsert/update/delete operations.
   */
  private static readonly PK_COLUMN_MAP: Record<string, string> = {
    user_preferences: 'user_id',
  };

  /**
   * Get the primary key column name for a table.
   */
  private getPkColumn(table: string): string {
    return SupabaseConnector.PK_COLUMN_MAP[table] || 'id';
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    console.log('[PowerSync uploadData] Called — checking for pending transactions...');
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) {
      console.log('[PowerSync uploadData] No pending transactions.');
      return;
    }

    console.log(
      '[PowerSync uploadData] Found transaction with',
      transaction.crud.length,
      'operations:',
      transaction.crud.map(op => `${op.op} ${op.table} (${op.id})`)
    );

    // Ensure the Supabase client has a fresh session before uploading.
    const {
      data: { session },
      error: sessionError,
    } = await this.supabase.auth.getSession();
    if (sessionError) {
      console.error('[PowerSync uploadData] Failed to get session:', sessionError);
      throw sessionError;
    }
    if (!session) {
      console.warn('[PowerSync uploadData] No active session — skipping upload, will retry');
      return;
    }
    console.log('[PowerSync uploadData] Session OK, user:', session.user?.email);

    try {
      for (const op of transaction.crud) {
        const table = op.table;
        const record = op.opData;
        const pkColumn = this.getPkColumn(table);

        console.log(
          `[PowerSync uploadData] ${op.op} → ${table} (pk=${pkColumn}, id=${op.id})`,
          record
        );

        switch (op.op) {
          case 'PUT': {
            const { error } = await this.supabase
              .from(table)
              .upsert({ ...record, [pkColumn]: op.id }, { onConflict: pkColumn });
            if (error) {
              console.error(`[PowerSync uploadData] Upsert to ${table} failed:`, error);
              throw error;
            }
            console.log(`[PowerSync uploadData] ✓ Upserted to ${table}`);
            break;
          }
          case 'PATCH': {
            const { error } = await this.supabase.from(table).update(record).eq(pkColumn, op.id);
            if (error) {
              console.error(`[PowerSync uploadData] Update to ${table} failed:`, error);
              throw error;
            }
            console.log(`[PowerSync uploadData] ✓ Updated ${table}`);
            break;
          }
          case 'DELETE': {
            const { error } = await this.supabase.from(table).delete().eq(pkColumn, op.id);
            if (error) {
              console.error(`[PowerSync uploadData] Delete from ${table} failed:`, error);
              throw error;
            }
            console.log(`[PowerSync uploadData] ✓ Deleted from ${table}`);
            break;
          }
        }
      }

      await transaction.complete();
      console.log('[PowerSync uploadData] ✓ Transaction complete');
    } catch (error) {
      // Transaction will be retried on next sync cycle
      console.error('[PowerSync uploadData] Upload FAILED, will retry:', error);
      throw error;
    }
  }
}
