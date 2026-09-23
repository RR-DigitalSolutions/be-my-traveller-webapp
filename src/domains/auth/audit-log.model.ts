// ============================================================
// Audit Log Model
// Append-only. Never delete audit records.
// Tracks all critical operations across the platform.
// ============================================================

import mongoose, { type Document, type Model, Schema } from "mongoose";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "ARCHIVE"
  | "APPROVE"
  | "LOGIN"
  | "LOGOUT"
  | "PERMISSION_CHANGE"
  | "PRICE_CHANGE"
  | "STATUS_CHANGE"
  | "PAYMENT_RECORD"
  | "BOOKING_CANCEL"
  | "QUOTE_SEND";

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string; // denormalized for readability if user is later deleted
  action: AuditAction;
  entityType: string; // e.g. "Package" | "PricingRule" | "Booking"
  entityId: string;
  entitySlug?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "PUBLISH",
        "ARCHIVE",
        "APPROVE",
        "LOGIN",
        "LOGOUT",
        "PERMISSION_CHANGE",
        "PRICE_CHANGE",
        "STATUS_CHANGE",
        "PAYMENT_RECORD",
        "BOOKING_CANCEL",
        "QUOTE_SEND",
      ] satisfies AuditAction[],
    },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    entitySlug: { type: String },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    requestId: { type: String },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  {
    collection: "audit_logs",
    // Disable automatic timestamps — we use our own timestamp field
    timestamps: false,
  }
);

// ── Indexes ──────────────────────────────────────────────────
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

// ── No TTL — audit logs are permanent ────────────────────────

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog ??
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLogModel;
