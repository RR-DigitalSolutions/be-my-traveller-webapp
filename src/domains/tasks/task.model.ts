// ============================================================
// Task Model
// Operational and cross-departmental tasks across Sales,
// Hotel Operations, Transport Dispatch, Finance, and Support.
// ============================================================

import mongoose, { type Document, type Model, Schema } from "mongoose";
import type { DepartmentKey } from "@/lib/auth/permissions";
import type { TaskStatus } from "@/domains/workflow/state-machine";

export type TaskType =
  | "HOTEL_CONFIRMATION"
  | "TRANSPORT_ALLOCATION"
  | "ACTIVITY_BOOKING"
  | "CUSTOMER_FOLLOW_UP"
  | "PAYMENT_COLLECTION"
  | "SUPPLIER_PAYMENT"
  | "CUSTOM";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskEntityType = "Lead" | "Quote" | "Booking" | "Customer" | "Supplier" | "General";

export interface ITaskNote {
  _id?: mongoose.Types.ObjectId;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  entityType: TaskEntityType;
  entityId?: mongoose.Types.ObjectId;
  entityRef?: string; // e.g. "BMT-BK-2026-901"
  assignedTo?: mongoose.Types.ObjectId;
  assignedBy?: mongoose.Types.ObjectId;
  department?: DepartmentKey;
  dueDate?: Date;
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
  notes: ITaskNote[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const TaskNoteSchema = new Schema<ITaskNote>(
  {
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    type: {
      type: String,
      enum: [
        "HOTEL_CONFIRMATION",
        "TRANSPORT_ALLOCATION",
        "ACTIVITY_BOOKING",
        "CUSTOMER_FOLLOW_UP",
        "PAYMENT_COLLECTION",
        "SUPPLIER_PAYMENT",
        "CUSTOM",
      ] satisfies TaskType[],
      required: true,
      default: "CUSTOM",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] satisfies TaskPriority[],
      required: true,
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED", "CANCELLED"] satisfies TaskStatus[],
      required: true,
      default: "PENDING",
    },
    entityType: {
      type: String,
      enum: ["Lead", "Quote", "Booking", "Customer", "Supplier", "General"] satisfies TaskEntityType[],
      required: true,
      default: "General",
    },
    entityId: { type: Schema.Types.ObjectId },
    entityRef: { type: String, trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
    department: { type: String },
    dueDate: { type: Date },
    completedAt: { type: Date },
    completedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: [TaskNoteSchema], default: [] },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: "tasks",
  }
);

// ── Indexes ──────────────────────────────────────────────────
TaskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });
TaskSchema.index({ department: 1, status: 1 });
TaskSchema.index({ entityType: 1, entityId: 1 });
TaskSchema.index({ status: 1, dueDate: 1 });
TaskSchema.index({ type: 1, status: 1 });

export const TaskModel: Model<ITask> =
  mongoose.models.Task ?? mongoose.model<ITask>("Task", TaskSchema);

export default TaskModel;
