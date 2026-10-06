import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongoose";
import { UserModel } from "@/domains/auth/user.model";
import { auth } from "@/lib/auth/auth";
import { Role } from "@/lib/auth/permissions";
import {
  getRootAdminEmail,
  isRootAdminEmail,
  canAccessStaffManagement,
  canAssignSuperAdmin,
  validatePasswordStrength,
} from "@/lib/security/auth-protection";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canAccessStaffManagement(session.user)) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient privileges" },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();
    const callerEmail = session.user.email?.trim().toLowerCase() || "";
    const isRootCaller = isRootAdminEmail(callerEmail);

    const user = await UserModel.findById(id).lean();
    if (!user) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Stealth Rule: If target user is root admin, only the root admin can view their own record.
    // For any other caller, return 404 so existence is never confirmed.
    if (isRootAdminEmail(user.email) && !isRootCaller) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || "SUPPORT_CONTENT",
        designation: user.designation || "",
        phone: user.phone || "",
        status: user.status || (user.isActive ? "ACTIVE" : "INACTIVE"),
        permissions: user.permissions || [],
        isActive: user.isActive !== false,
        avatar: user.avatar || "",
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isRootAccount: isRootAdminEmail(user.email),
      },
    });
  } catch (error: any) {
    console.error("[ADMIN_USER_DETAIL_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch user details", detail: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canAccessStaffManagement(session.user)) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient privileges" },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();
    const rootAdminEmail = getRootAdminEmail();
    const callerEmail = session.user.email?.trim().toLowerCase() || "";
    const isRootCaller = isRootAdminEmail(callerEmail);

    const user = await UserModel.findById(id);
    if (!user) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const isTargetRoot = isRootAdminEmail(user.email);

    // Stealth Protection: Non-root users cannot touch the root administrator
    if (isTargetRoot && !isRootCaller) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      email,
      department,
      role,
      designation,
      phone,
      permissions,
      status,
      password,
      avatar,
    } = body;

    // Self-management for Root Admin
    if (isTargetRoot && isRootCaller) {
      if (name && name.trim()) user.name = name.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (designation !== undefined) user.designation = designation.trim();
      if (avatar !== undefined) user.avatar = avatar.trim();

      if (password && password.trim()) {
        const passValidation = validatePasswordStrength(password.trim());
        if (!passValidation.valid) {
          return NextResponse.json({ error: passValidation.message }, { status: 400 });
        }
        user.passwordHash = await bcrypt.hash(password.trim(), 12);
      }

      // Inviolable Root Admin attributes
      user.role = Role.SUPER_ADMIN;
      user.department = "ADMIN";
      user.status = "ACTIVE";
      user.isActive = true;
      if (!user.permissions.includes("*")) {
        user.permissions = ["*", ...user.permissions];
      }

      await user.save();

      return NextResponse.json({
        success: true,
        message: "Root Super Administrator account updated successfully",
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          designation: user.designation,
          phone: user.phone,
          status: user.status,
          permissions: user.permissions,
          isActive: user.isActive,
          avatar: user.avatar,
          updatedAt: user.updatedAt,
          isRootAccount: true,
        },
      });
    }

    // Standard Staff Member Management
    if (name && name.trim()) user.name = name.trim();

    if (email && email.trim() && email.includes("@")) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === rootAdminEmail) {
        return NextResponse.json(
          { error: "Cannot assign protected root administrator email address" },
          { status: 403 }
        );
      }
      if (cleanEmail !== user.email) {
        const existing = await UserModel.findOne({ email: cleanEmail });
        if (existing) {
          return NextResponse.json(
            { error: `Email '${cleanEmail}' is already assigned to another user` },
            { status: 409 }
          );
        }
        user.email = cleanEmail;
      }
    }

    // Privilege Escalation Guard
    const requestedSuperAdmin = role === Role.SUPER_ADMIN || department === "ADMIN" || (Array.isArray(permissions) && permissions.includes("*"));
    if (requestedSuperAdmin && !canAssignSuperAdmin(session.user)) {
      return NextResponse.json(
        { error: "Forbidden: Only Super Administrators can grant Administrator or Master access." },
        { status: 403 }
      );
    }

    if (department) {
      user.department = department;
    }

    if (role) {
      user.role = role;
    }

    if (designation !== undefined) user.designation = designation.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    if (status) {
      user.status = status;
      user.isActive = status === "ACTIVE";
    }

    if (Array.isArray(permissions)) {
      let finalPerms = [...permissions];
      if (user.department === "ADMIN" || user.role === Role.SUPER_ADMIN || finalPerms.length >= 12) {
        if (!finalPerms.includes("*")) finalPerms.push("*");
      }
      user.permissions = finalPerms;
    }

    // Password Update / Reset
    if (password && password.trim()) {
      const passValidation = validatePasswordStrength(password.trim());
      if (!passValidation.valid) {
        return NextResponse.json({ error: passValidation.message }, { status: 400 });
      }
      user.passwordHash = await bcrypt.hash(password.trim(), 12);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Staff member updated successfully",
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phone: user.phone,
        status: user.status,
        permissions: user.permissions,
        isActive: user.isActive,
        avatar: user.avatar,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("[ADMIN_USER_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update staff member", detail: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canAccessStaffManagement(session.user)) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient privileges" },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findById(id);

    if (!user) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Primary safety guard: Never allow deletion of the Master Root Admin
    if (isRootAdminEmail(user.email)) {
      return NextResponse.json(
        { error: "Master Root Administrator account is protected and cannot be deleted" },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (user._id.toString() === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own active administrator account" },
        { status: 403 }
      );
    }

    // Deleting other Admins requires Super Admin privileges
    if (user.role === Role.SUPER_ADMIN || user.department === "ADMIN") {
      if (!canAssignSuperAdmin(session.user)) {
        return NextResponse.json(
          { error: "Forbidden: Only Super Administrators can delete executive accounts" },
          { status: 403 }
        );
      }
    }

    await UserModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Staff member account deleted successfully",
    });
  } catch (error: any) {
    console.error("[ADMIN_USER_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to delete user account", detail: error?.message },
      { status: 500 }
    );
  }
}
