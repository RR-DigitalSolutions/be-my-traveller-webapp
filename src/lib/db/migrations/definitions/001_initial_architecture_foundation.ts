// ============================================================
// Migration 001: Initial Architecture Foundation
// Idempotently verifies and builds system indexes for
// Tasks, Notifications, Audit Logs, and User RBAC.
// Non-destructive: Does NOT alter or delete any document data.
// ============================================================

import connectDB from "@/lib/db/mongoose";
import { TaskModel } from "@/domains/tasks/task.model";
import { NotificationModel } from "@/domains/notifications/notification.model";
import { AuditLogModel } from "@/domains/auth/audit-log.model";

export const migration001 = {
  id: "001_initial_architecture_foundation",
  name: "Initial Architecture Foundation Indexes",
  async up(): Promise<void> {
    await connectDB();

    // Ensure indexes for Tasks collection
    await TaskModel.syncIndexes();

    // Ensure indexes for Notifications collection
    await NotificationModel.syncIndexes();

    // Ensure indexes for Audit Logs collection
    await AuditLogModel.syncIndexes();
  },
  async down(): Promise<void> {
    // No-op: Index removal not required for safe rollback
  },
};
