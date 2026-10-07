// ============================================================
// AuditService
// Centralized enterprise audit logging for Be My Traveller.
// Append-only, resilient to logging errors, covers state transitions,
// operational tasks, security events, and entity lifecycle mutations.
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
  transitionDetails?: {
    fromState?: string;
    toState?: string;
    trigger?: string;
  };
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

export interface StateTransitionAuditInput {
  userId: string;
  userEmail: string;
  entityType: "Lead" | "Quote" | "Booking" | "Task" | "Invoice" | string;
  entityId: string;
  entitySlug?: string;
  fromState: string;
  toState: string;
  trigger: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export interface TaskAuditInput {
  userId: string;
  userEmail: string;
  action: "TASK_CREATE" | "TASK_ASSIGN" | "TASK_UPDATE" | "TASK_COMPLETE" | "TASK_CANCEL";
  taskId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export interface SecurityAuditInput {
  userId: string;
  userEmail: string;
  action: "LOGIN" | "LOGOUT" | "PERMISSION_CHANGE" | "SECURITY_ALERT";
  entityId?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export class AuditService {
  /**
   * Log a critical operation. Resilient fire-and-forget:
   * errors are caught and logged to console so audit failures never break primary business transactions.
   */
  static async log(event: AuditEventInput): Promise<void> {
    try {
      await connectDB();
      await AuditLogModel.create({
        ...event,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("[AuditService] Failed to write audit log:", err);
    }
  }

  /**
   * Log a state machine or workflow transition (e.g. Quote: SENT -> ACCEPTED, Lead: NEW -> CONTACTED).
   */
  static async logTransition(input: StateTransitionAuditInput): Promise<void> {
    await this.log({
      userId: input.userId,
      userEmail: input.userEmail,
      action: "STATE_TRANSITION",
      entityType: input.entityType,
      entityId: input.entityId,
      entitySlug: input.entitySlug,
      transitionDetails: {
        fromState: input.fromState,
        toState: input.toState,
        trigger: input.trigger,
      },
      metadata: input.metadata,
      ip: input.ip,
      userAgent: input.userAgent,
    });
  }

  /**
   * Log task lifecycle events.
   */
  static async logTask(input: TaskAuditInput): Promise<void> {
    await this.log({
      userId: input.userId,
      userEmail: input.userEmail,
      action: input.action,
      entityType: "Task",
      entityId: input.taskId,
      oldValue: input.oldValue,
      newValue: input.newValue,
      metadata: input.metadata,
      ip: input.ip,
      userAgent: input.userAgent,
    });
  }

  /**
   * Log security and authentication incidents.
   */
  static async logSecurity(input: SecurityAuditInput): Promise<void> {
    await this.log({
      userId: input.userId,
      userEmail: input.userEmail,
      action: input.action,
      entityType: "Security",
      entityId: input.entityId || input.userId,
      metadata: input.details,
      ip: input.ip,
      userAgent: input.userAgent,
    });
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

  /**
   * Query recent audit logs with pagination and filters.
   */
  static async getRecentLogs(options?: {
    action?: AuditAction;
    entityType?: string;
    page?: number;
    limit?: number;
  }) {
    await connectDB();
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(100, Math.max(1, options?.limit || 50));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (options?.action) filter.action = options.action;
    if (options?.entityType) filter.entityType = options.entityType;

    const [logs, total] = await Promise.all([
      AuditLogModel.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLogModel.countDocuments(filter),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
