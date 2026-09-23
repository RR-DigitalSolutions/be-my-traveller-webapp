// ============================================================
// AuditService
// Call this from any Server Action or API route handler that
// performs a critical operation.
// ============================================================

import { AuditLogModel, type AuditAction } from "@/domains/auth/audit-log.model";
import connectDB from "@/lib/db/mongoose";

export interface AuditEventInput {
  userId: string;
  userEmail: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entitySlug?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

export class AuditService {
  /**
   * Log a critical operation. Fire-and-forget — errors are caught
   * and logged to console but never thrown to the caller.
   * Audit failures should never block the main operation.
   */
  static async log(event: AuditEventInput): Promise<void> {
    try {
      await connectDB();
      await AuditLogModel.create({
        ...event,
        timestamp: new Date(),
      });
    } catch (err) {
      // Never let audit logging failure break the main request
      console.error("[AuditService] Failed to write audit log:", err);
    }
  }

  /**
   * Query audit logs for an entity.
   */
  static async getForEntity(
    entityType: string,
    entityId: string,
    limit = 50
  ) {
    await connectDB();
    return AuditLogModel.find({ entityType, entityId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Query audit logs for a user.
   */
  static async getForUser(userId: string, limit = 100) {
    await connectDB();
    return AuditLogModel.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }
}
