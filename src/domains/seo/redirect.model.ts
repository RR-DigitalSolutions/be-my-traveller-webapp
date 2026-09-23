import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IRedirect extends Document {
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
  isActive: boolean;
  reason?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RedirectSchema = new Schema<IRedirect>(
  {
    fromPath: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    toPath: {
      type: String,
      required: true,
      trim: true,
    },
    statusCode: {
      type: Number,
      enum: [301, 302],
      default: 301,
    },
    isActive: { type: Boolean, default: true },
    reason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "redirects",
  }
);

// Primary lookup pattern — fromPath is queried on every request via middleware
RedirectSchema.index({ isActive: 1 });

export const RedirectModel: Model<IRedirect> =
  mongoose.models.Redirect ??
  mongoose.model<IRedirect>("Redirect", RedirectSchema);

export default RedirectModel;
