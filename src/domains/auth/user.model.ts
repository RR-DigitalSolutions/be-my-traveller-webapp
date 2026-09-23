// ============================================================
// User Model
// Platform administrators, company management, sales executives, content staff.
// NOT customer-facing accounts (see customers model).
// ============================================================

import mongoose, { type Document, type Model, Schema } from "mongoose";
import {
  Role,
  type RoleKey,
  type PermissionKey,
  Department,
  type DepartmentKey,
} from "@/lib/auth/permissions";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: RoleKey;
  department: DepartmentKey;
  designation?: string;
  phone?: string;
  status: UserStatus;
  permissions: PermissionKey[]; // granular overrides & section grants
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  avatar?: string; // R2 URL
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
      default: Role.EDITOR,
    },
    department: {
      type: String,
      enum: Object.values(Department),
      default: Department.SUPPORT_CONTENT,
    },
    designation: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 25,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isTwoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
    avatar: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// ── Indexes ──────────────────────────────────────────────────
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ isActive: 1 });

// ── Statics ──────────────────────────────────────────────────
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase().trim() }).select(
    "+passwordHash"
  );
};

// ── Prevent model re-compilation in Next.js hot reload ───────
export const UserModel: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default UserModel;
