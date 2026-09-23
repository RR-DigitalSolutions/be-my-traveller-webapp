import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { UserModel } from "@/domains/auth/user.model";
import bcrypt from "bcryptjs";

/**
 * POST /api/v1/admin/seed
 * Seeds the first SUPER_ADMIN user if none exists.
 * This endpoint disables itself after the first admin is created.
 * Protect this route in production by setting SEED_SECRET in env.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const seedSecret = process.env.SEED_SECRET;

    if (process.env.NODE_ENV === "production" && seedSecret) {
      const provided = req.headers.get("x-seed-secret");
      if (provided !== seedSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const email = (body.email as string) || process.env.BMT_ADMIN_EMAIL || "admin@bemytraveller.com";
    const password = (body.password as string) || process.env.BMT_ADMIN_PASSWORD || process.env.BMT_MASTER_PASSWORDS?.split(",")[0]?.trim();
    const name = (body.name as string) || "Admin";

    if (!password) {
      return NextResponse.json(
        { error: "Missing admin password. Set BMT_ADMIN_PASSWORD or pass a password in the request body." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Upsert admin user
    const admin = await UserModel.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        $set: {
          name,
          email: email.toLowerCase().trim(),
          passwordHash,
          role: "SUPER_ADMIN",
          isActive: true,
          permissions: [
            "VIEW_DASHBOARD",
            "MANAGE_DESTINATIONS",
            "MANAGE_PACKAGES",
            "MANAGE_HOTELS",
            "MANAGE_SUPPLIERS",
            "MANAGE_LEADS",
            "MANAGE_BOOKINGS",
            "MANAGE_PAYMENTS",
            "MANAGE_CUSTOMERS",
            "MANAGE_CONTENT",
            "MANAGE_MEDIA",
            "MANAGE_SEO",
            "MANAGE_USERS",
            "MANAGE_SETTINGS",
            "VIEW_REPORTS",
            "MANAGE_PRICING",
            "MANAGE_COUPONS",
          ],
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "✅ Admin account & database seeded successfully!",
        credentials: {
          username: "Admin",
          email: admin.email,
          password: password,
          loginUrl: "/admin/login",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[SEED_ADMIN_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error", detail: error?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      endpoint: "POST /api/v1/admin/seed",
      description: "Seeds or updates the SUPER_ADMIN user and platform datasets.",
      requirements: {
        email: "Set BMT_ADMIN_EMAIL or pass an email in the request body.",
        password: "Set BMT_ADMIN_PASSWORD or pass a password in the request body.",
      },
    },
    { status: 200 }
  );
}
