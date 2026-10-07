// ============================================================
// Migration Model
// Tracks database schema migrations and indexing operations.
// Stored in the `_migrations` internal system collection.
// ============================================================

import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IMigrationRecord extends Document {
  migrationId: string;
  name: string;
  batch: number;
  appliedAt: Date;
  executionTimeMs: number;
  status: "SUCCESS" | "FAILED";
  error?: string;
}

const MigrationRecordSchema = new Schema<IMigrationRecord>(
  {
    migrationId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    batch: { type: Number, required: true, default: 1 },
    appliedAt: { type: Date, required: true, default: Date.now },
    executionTimeMs: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
      default: "SUCCESS",
    },
    error: { type: String },
  },
  {
    timestamps: false,
    collection: "_migrations",
  }
);

MigrationRecordSchema.index({ batch: 1 });
MigrationRecordSchema.index({ appliedAt: -1 });

export const MigrationRecordModel: Model<IMigrationRecord> =
  mongoose.models.MigrationRecord ??
  mongoose.model<IMigrationRecord>("MigrationRecord", MigrationRecordSchema);

export default MigrationRecordModel;
