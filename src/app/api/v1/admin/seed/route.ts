import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { UserModel } from "@/domains/auth/user.model";
import bcrypt from "bcryptjs";
import { getRootAdminEmail } from "@/lib/security/auth-protection";

/**
 * POST /api/v1/admin/seed
 * Hardened Seed Endpoint:
 * - Automatically disables and locks itself once any Super Administrator account exists.
 * - Never returns cleartext credentials in API responses.
 * - Protects against bot/hacker credential discovery.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const rootAdminEmail = getRootAdminEmail();

    // Security Lock: If an admin already exists in the database, lock route completely
    const existingAdmin = await UserModel.findOne({
      $or: [{ role: "SUPER_ADMIN" }, { email: rootAdminEmail }],
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Seed endpoint is permanently disabled. Super Administrator is already initialized." },
        { status: 403 }
      );
    }

    const seedSecret = process.env.SEED_SECRET;
    if (seedSecret) {
      const provided = req.headers.get("x-seed-secret");
      if (provided !== seedSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const email = (body.email as string) || rootAdminEmail;
    const password =
      (body.password as string) ||
      process.env.BMT_ADMIN_PASSWORD ||
      process.env.BMT_MASTER_PASSWORDS?.split(",")[0]?.trim() ||
      "BMT@Admin_2026";
    const name = (body.name as string) || "Admin";

    if (!password) {
      return NextResponse.json(
        { error: "Missing admin initialization password" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await UserModel.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "SUPER_ADMIN",
      department: "ADMIN",
      designation: "Executive Administrator",
      isActive: true,
      status: "ACTIVE",
      permissions: ["*"],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Super Administrator initialized securely.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[SEED_ADMIN_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      status: "Service Active",
      message: "Direct inspection disabled for security.",
    },
    { status: 200 }
  );
}
