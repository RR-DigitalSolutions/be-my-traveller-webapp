// ============================================================
// MigrationRunner
// Orchestrates safe, sequential, idempotent database migrations.
// Audits execution, measures elapsed time, and prevents duplicate runs.
// ============================================================

import connectDB from "@/lib/db/mongoose";
import { MigrationRecordModel } from "./migration.model";
import { AuditService } from "@/domains/auth/audit.service";
import { migration001 } from "./definitions/001_initial_architecture_foundation";
import { migration002 } from "./definitions/002_sales_crm_foundation";
import { migration003 } from "./definitions/003_operations_finance_foundation";

export interface Migration {
  id: string;
  name: string;
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

export class MigrationRunner {
  private static registeredMigrations: Migration[] = [migration001, migration002, migration003];

  /**
   * Register a new migration into the runner pipeline.
   */
  static register(migration: Migration): void {
    if (!this.registeredMigrations.some((m) => m.id === migration.id)) {
      this.registeredMigrations.push(migration);
    }
  }

  /**
   * Get list of all migration IDs already applied to the database.
   */
  static async getAppliedMigrationIds(): Promise<string[]> {
    await connectDB();
    const records = await MigrationRecordModel.find({ status: "SUCCESS" })
      .select("migrationId")
      .lean();
    return records.map((r) => r.migrationId);
  }

  /**
   * Retrieve all registered migrations that have not yet been applied.
   */
  static async getPendingMigrations(): Promise<Migration[]> {
    const applied = await this.getAppliedMigrationIds();
    return this.registeredMigrations.filter((m) => !applied.includes(m.id));
  }

  /**
   * Execute all pending migrations in strict registration order.
   */
  static async runPending(context?: { userId?: string; userEmail?: string }): Promise<{
    executed: string[];
    skipped: string[];
    failed?: string;
  }> {
    await connectDB();

    const pending = await this.getPendingMigrations();
    const applied = await this.getAppliedMigrationIds();
    const executed: string[] = [];

    if (pending.length === 0) {
      return { executed: [], skipped: applied };
    }

    // Determine next batch number
    const lastRecord = await MigrationRecordModel.findOne()
      .sort({ batch: -1 })
      .select("batch")
      .lean();
    const nextBatch = (lastRecord?.batch || 0) + 1;

    for (const migration of pending) {
      const startTime = Date.now();
      try {
        console.log(`[MigrationRunner] Executing: ${migration.id} - ${migration.name}`);
        await migration.up();
        const executionTimeMs = Date.now() - startTime;

        await MigrationRecordModel.findOneAndUpdate(
          { migrationId: migration.id },
          {
            $set: {
              migrationId: migration.id,
              name: migration.name,
              batch: nextBatch,
              appliedAt: new Date(),
              executionTimeMs,
              status: "SUCCESS",
              error: null,
            },
          },
          { upsert: true, new: true }
        );

        await AuditService.log({
          userId: context?.userId || "000000000000000000000000",
          userEmail: context?.userEmail || "system@bemytraveller.com",
          action: "MIGRATION_RUN",
          entityType: "Migration",
          entityId: migration.id,
          newValue: {
            name: migration.name,
            batch: nextBatch,
            executionTimeMs,
            status: "SUCCESS",
          },
        });

        executed.push(migration.id);
      } catch (err: unknown) {
        const executionTimeMs = Date.now() - startTime;
        console.error(`[MigrationRunner] Failed: ${migration.id}`, err);

        await MigrationRecordModel.findOneAndUpdate(
          { migrationId: migration.id },
          {
            $set: {
              migrationId: migration.id,
              name: migration.name,
              batch: nextBatch,
              appliedAt: new Date(),
              executionTimeMs,
              status: "FAILED",
              error: err instanceof Error ? err.message : String(err),
            },
          },
          { upsert: true, new: true }
        );

        return {
          executed,
          skipped: applied,
          failed: migration.id,
        };
      }
    }

    return { executed, skipped: applied };
  }

  /**
   * Summary status of database migrations.
   */
  static async getStatus() {
    await connectDB();
    const appliedRecords = await MigrationRecordModel.find()
      .sort({ appliedAt: -1 })
      .lean();
    const appliedIds = appliedRecords
      .filter((r) => r.status === "SUCCESS")
      .map((r) => r.migrationId);
    const pending = this.registeredMigrations.filter((m) => !appliedIds.includes(m.id));

    return {
      totalRegistered: this.registeredMigrations.length,
      appliedCount: appliedIds.length,
      pendingCount: pending.length,
      appliedRecords,
      pendingMigrations: pending.map((p) => ({ id: p.id, name: p.name })),
    };
  }
}
