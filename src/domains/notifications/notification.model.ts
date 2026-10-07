// ============================================================
// Notification Model
// In-app alerts, operational push events, and cross-staff notices.
// ============================================================

import mongoose, { type Document, type Model, Schema } from "mongoose";
import type { DepartmentKey } from "@/lib/auth/permissions";

export type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "URGENT"
  | "LEAD_ALERT"
  | "QUOTE_ACCEPTED"
  | "BOOKING_CONFIRMED"
  | "TASK_ASSIGNED"
  | "PAYMENT_RECEIVED";

export interface INotification extends Document {
  recipient?: mongoose.Types.ObjectId;
  targetDepartment?: DepartmentKey;
  targetRole?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User" },
    targetDepartment: { type: String },
    targetRole: { type: String },
    type: {
      type: String,
      enum: [
        "INFO",
        "SUCCESS",
        "WARNING",
        "URGENT",
        "LEAD_ALERT",
        "QUOTE_ACCEPTED",
        "BOOKING_CONFIRMED",
        "TASK_ASSIGNED",
        "PAYMENT_RECEIVED",
      ] satisfies NotificationType[],
      required: true,
      default: "INFO",
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    link: { type: String, trim: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: "notifications",
  }
);

// ── Indexes ──────────────────────────────────────────────────
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ targetDepartment: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

export const NotificationModel: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", NotificationSchema);

export default NotificationModel;
