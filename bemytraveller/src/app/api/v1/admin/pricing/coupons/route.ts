import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import { ObjectId } from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    let coupons = await db.collection("coupons").find({}).sort({ createdAt: -1 }).toArray();

    if (coupons.length === 0) {
      const defaultCoupons = [
        {
          code: "HOLIDAY2026",
          discountType: "PERCENTAGE",
          discountValue: 10,
          minBookingValue: 40000,
          maxDiscount: 7500,
          validTill: "2026-12-31",
          usageLimit: 500,
          usedCount: 38,
          status: "ACTIVE",
          createdAt: new Date(),
        },
        {
          code: "HONEYMOON5000",
          discountType: "FIXED",
          discountValue: 5000,
          minBookingValue: 60000,
          maxDiscount: 5000,
          validTill: "2026-12-31",
          usageLimit: 200,
          usedCount: 19,
          status: "ACTIVE",
          createdAt: new Date(),
        },
        {
          code: "EARLYBIRD",
          discountType: "PERCENTAGE",
          discountValue: 15,
          minBookingValue: 50000,
          maxDiscount: 10000,
          validTill: "2026-10-31",
          usageLimit: 100,
          usedCount: 14,
          status: "ACTIVE",
          createdAt: new Date(),
        },
      ];
      await db.collection("coupons").insertMany(defaultCoupons);
      coupons = await db.collection("coupons").find({}).toArray();
    }

    return NextResponse.json({ coupons, total: coupons.length });
  } catch (error) {
    console.error("[Coupons GET Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, discountType, discountValue, minBookingValue, maxDiscount, validTill, usageLimit, status } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: "Code and discount value required" }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const doc = {
      code: String(code).toUpperCase().trim(),
      discountType: discountType || "PERCENTAGE",
      discountValue: Number(discountValue) || 10,
      minBookingValue: Number(minBookingValue) || 25000,
      maxDiscount: Number(maxDiscount) || 5000,
      validTill: validTill || "2026-12-31",
      usageLimit: Number(usageLimit) || 100,
      usedCount: 0,
      status: status || "ACTIVE",
      createdAt: new Date(),
    };

    const res = await db.collection("coupons").insertOne(doc);
    return NextResponse.json({ success: true, coupon: { ...doc, _id: res.insertedId } }, { status: 201 });
  } catch (error) {
    console.error("[Coupons POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    await db.collection("coupons").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Coupons DELETE Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
