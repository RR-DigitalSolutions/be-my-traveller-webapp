import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongoose";
import { UserModel } from "@/domains/auth/user.model";
import { auth } from "@/lib/auth/auth";
import { Role } from "@/lib/auth/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findById(id).lean();

    if (!user) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || (user.role === "SUPER_ADMIN" ? "ADMIN" : "SUPPORT_CONTENT"),
        designation: user.designation || "",
        phone: user.phone || "",
        status: user.status || (user.isActive ? "ACTIVE" : "INACTIVE"),
        permissions: user.permissions || [],
        isActive: user.isActive !== false,
        avatar: user.avatar || "",
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findById(id);

    if (!user) {
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

    const isPrimarySuperAdmin =
      user.email === "admin@bemytraveller.com" || user.role === Role.SUPER_ADMIN;

    if (name && name.trim()) user.name = name.trim();

    if (email && email.trim() && email.includes("@")) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== user.email) {
        const existing = await UserModel.findOne({ email: cleanEmail });
        if (existing) {
          return NextResponse.json(
            { error: `Email '${cleanEmail}' is already assigned to another user` },
            { status: 409 }
          );
        }
        if (!isPrimarySuperAdmin) {
          user.email = cleanEmail;
        }
      }
    }

    if (department) {
      user.department = department;
    }

    if (role && (!isPrimarySuperAdmin || role === Role.SUPER_ADMIN)) {
      user.role = role;
    }

    if (designation !== undefined) user.designation = designation.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    if (status && !isPrimarySuperAdmin) {
      user.status = status;
      user.isActive = status === "ACTIVE";
    }

    if (Array.isArray(permissions)) {
      if (isPrimarySuperAdmin || user.department === "ADMIN") {
        user.permissions = permissions.includes("*") ? permissions : ["*", ...permissions];
      } else {
        user.permissions = permissions;
      }
    }

    // Password Reset
    if (password && password.trim().length >= 6) {
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

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findById(id);

    if (!user) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Safety guard against deleting primary admin or active session user
    if (user.email === "admin@bemytraveller.com" || user.role === Role.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Master Super Admin account cannot be deleted" },
        { status: 403 }
      );
    }

    if (user._id.toString() === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own active administrator account" },
        { status: 403 }
      );
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
