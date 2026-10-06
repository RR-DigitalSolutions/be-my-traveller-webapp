import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/mongoose";
import { UserModel } from "@/domains/auth/user.model";
import { auth } from "@/lib/auth/auth";
import {
  Department,
  type DepartmentKey,
  DEPARTMENTS,
  Role,
  type RoleKey,
} from "@/lib/auth/permissions";
import {
  getRootAdminEmail,
  isRootAdminEmail,
  canAccessStaffManagement,
  canAssignSuperAdmin,
  escapeRegex,
  validatePasswordStrength,
} from "@/lib/security/auth-protection";

function resolveDepartmentFromRole(role?: string, explicitDept?: string): DepartmentKey {
  if (explicitDept && Object.values(Department).includes(explicitDept as any)) {
    return explicitDept as DepartmentKey;
  }
  switch (role) {
    case Role.SUPER_ADMIN:
    case Role.ADMIN:
      return Department.ADMIN;
    case Role.SALES_MANAGER:
    case Role.SALES_AGENT:
      return Department.SALES;
    case Role.PRODUCT_MANAGER:
    case Role.FINANCE:
    case Role.OPERATIONS:
      return Department.MANAGEMENT;
    case Role.CONTENT_MANAGER:
    case Role.SEO_MANAGER:
    case Role.EDITOR:
    default:
      return Department.SUPPORT_CONTENT;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC Security Check
    if (!canAccessStaffManagement(session.user)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to view Staff & RBAC management" },
        { status: 403 }
      );
    }

    await connectDB();

    const rootAdminEmail = getRootAdminEmail();
    const callerEmail = session.user.email?.trim().toLowerCase() || "";
    const isRootCaller = isRootAdminEmail(callerEmail);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const role = searchParams.get("role") || "ALL";

    // Build filter query with strict root-admin stealth protection
    const andConditions: any[] = [];

    // Stealth Rule: If caller is NOT the root admin, root admin is completely invisible
    if (!isRootCaller) {
      andConditions.push({ email: { $ne: rootAdminEmail } });
    }

    if (search.trim()) {
      const escapedSearch = escapeRegex(search.trim());
      andConditions.push({
        $or: [
          { name: { $regex: escapedSearch, $options: "i" } },
          { email: { $regex: escapedSearch, $options: "i" } },
          { designation: { $regex: escapedSearch, $options: "i" } },
          { phone: { $regex: escapedSearch, $options: "i" } },
        ],
      });
    }

    if (department !== "ALL") {
      andConditions.push({ department });
    }

    if (status !== "ALL") {
      if (status === "ACTIVE") {
        andConditions.push({
          $or: [{ status: "ACTIVE" }, { isActive: true, status: { $exists: false } }],
        });
      } else {
        andConditions.push({ status });
      }
    }

    if (role !== "ALL") {
      andConditions.push({ role });
    }

    const finalQuery = andConditions.length > 0 ? { $and: andConditions } : {};

    const users = await UserModel.find(finalQuery)
      .sort({ createdAt: -1 })
      .lean();

    // Summary metrics across users — stealth filtering applied so counts never leak hidden root admin
    const statsQuery = isRootCaller ? {} : { email: { $ne: rootAdminEmail } };
    const allUsers = await UserModel.find(statsQuery).lean();

    const stats = {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter((u) => u.isActive !== false && u.status !== "INACTIVE" && u.status !== "SUSPENDED").length,
      suspendedUsers: allUsers.filter((u) => u.status === "SUSPENDED").length,
      adminCount: allUsers.filter((u) => resolveDepartmentFromRole(u.role, u.department) === "ADMIN").length,
      managementCount: allUsers.filter((u) => resolveDepartmentFromRole(u.role, u.department) === "MANAGEMENT").length,
      salesCount: allUsers.filter((u) => resolveDepartmentFromRole(u.role, u.department) === "SALES").length,
      supportContentCount: allUsers.filter((u) => resolveDepartmentFromRole(u.role, u.department) === "SUPPORT_CONTENT").length,
      customCount: allUsers.filter((u) => resolveDepartmentFromRole(u.role, u.department) === "CUSTOM").length,
    };

    const sanitizedUsers = users.map((u) => {
      const resolvedDept = resolveDepartmentFromRole(u.role, u.department);
      return {
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        department: resolvedDept,
        designation: u.designation || (u.role === "SUPER_ADMIN" ? "Executive Administrator" : "Staff Member"),
        phone: u.phone || "",
        status: u.status || (u.isActive ? "ACTIVE" : "INACTIVE"),
        permissions: u.permissions || [],
        isActive: u.isActive !== false,
        lastLoginAt: u.lastLoginAt,
        avatar: u.avatar || "",
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        isRootAccount: isRootAdminEmail(u.email),
      };
    });

    return NextResponse.json({
      success: true,
      users: sanitizedUsers,
      stats,
      currentCaller: {
        email: callerEmail,
        isRootAdmin: isRootCaller,
      },
    });
  } catch (error: any) {
    console.error("[ADMIN_USERS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to retrieve staff users", detail: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC Security Check
    if (!canAccessStaffManagement(session.user)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to register staff accounts" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await req.json();
    const {
      name,
      email,
      password,
      department,
      role,
      designation,
      phone,
      permissions,
      status,
      avatar,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Full Name is required" }, { status: 400 });
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json({ error: "A valid Email address is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rootAdminEmail = getRootAdminEmail();

    // Security check: Never allow assigning protected root admin email
    if (cleanEmail === rootAdminEmail) {
      return NextResponse.json(
        { error: "Protected root administrator email address cannot be assigned." },
        { status: 403 }
      );
    }

    const passwordValidation = validatePasswordStrength(password || "");
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    const existingUser = await UserModel.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: `User account with email '${cleanEmail}' already exists` },
        { status: 409 }
      );
    }

    const assignedDepartment = (department || "SALES") as DepartmentKey;
    const defaultRole = DEPARTMENTS[assignedDepartment]?.defaultRole || Role.EDITOR;
    const assignedRole = (role || defaultRole) as RoleKey;

    let finalPermissions: string[] = Array.isArray(permissions) ? permissions : [];

    // Privilege Escalation Guard:
    // Only existing Super Admins can create another Super Admin or assign master wildcard permissions
    const wantsSuperAdmin = assignedDepartment === "ADMIN" || assignedRole === Role.SUPER_ADMIN || finalPermissions.includes("*");
    if (wantsSuperAdmin && !canAssignSuperAdmin(session.user)) {
      return NextResponse.json(
        { error: "Forbidden: Only Super Administrators can grant Administrator or Master access." },
        { status: 403 }
      );
    }

    // If department is ADMIN or role is SUPER_ADMIN, assign master *
    if (assignedDepartment === "ADMIN" || assignedRole === "SUPER_ADMIN") {
      if (!finalPermissions.includes("*")) {
        finalPermissions = ["*", ...finalPermissions];
      }
    }

    const passwordHash = await bcrypt.hash(password.trim(), 12);
    const userStatus = status || "ACTIVE";
    const isActive = userStatus === "ACTIVE";

    const newUser = await UserModel.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
      department: assignedDepartment,
      designation: designation?.trim() || "",
      phone: phone?.trim() || "",
      status: userStatus,
      isActive,
      permissions: finalPermissions,
      avatar: avatar?.trim() || "",
      createdBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Staff member account created successfully",
      user: {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        designation: newUser.designation,
        phone: newUser.phone,
        status: newUser.status,
        permissions: newUser.permissions,
        isActive: newUser.isActive,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error("[ADMIN_USERS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create staff account", detail: error?.message },
      { status: 500 }
    );
  }
}
