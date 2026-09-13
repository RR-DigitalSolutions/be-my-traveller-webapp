import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import { Types } from "mongoose";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    let pkg = null;
    if (Types.ObjectId.isValid(id)) {
      pkg = await db.collection("packages").findOne({ _id: new Types.ObjectId(id) });
    }
    if (!pkg) {
      pkg = await db.collection("packages").findOne({ slug: id });
    }

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, package: pkg });
  } catch (error: any) {
    console.error("[Package GET error]:", error);
    return NextResponse.json({ error: "Failed to fetch package", detail: error?.message }, { status: 500 });
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
    const body = await req.json();

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const updateDoc: Record<string, any> = {
      ...body,
      updatedAt: new Date(),
    };
    delete updateDoc._id;

    if (body.hotelTiers?.standard?.pricePerAdult !== undefined) {
      updateDoc.startingPrice = Number(body.hotelTiers.standard.pricePerAdult) || 18999;
    } else if (body.startingPrice !== undefined) {
      updateDoc.startingPrice = Number(body.startingPrice) || 0;
    }

    if (body.discountPercent !== undefined) {
      updateDoc.discountPercent = Number(body.discountPercent) || 0;
      if (updateDoc.startingPrice && updateDoc.discountPercent > 0) {
        updateDoc.originalPrice = Math.round(updateDoc.startingPrice / (1 - updateDoc.discountPercent / 100));
      }
    } else if (body.originalPrice !== undefined) {
      updateDoc.originalPrice = Number(body.originalPrice) || 0;
    }

    if (body.seasonalHike !== undefined) {
      updateDoc.seasonalHike = body.seasonalHike;
    }
    if (body.seasonalHikes !== undefined && Array.isArray(body.seasonalHikes)) {
      updateDoc.seasonalHikes = body.seasonalHikes;
    }
    if (body.discountBadge !== undefined) {
      updateDoc.discountBadge = body.discountBadge;
    }
    if (body.countries !== undefined && Array.isArray(body.countries)) {
      updateDoc.countries = body.countries;
    }
    if (body.states !== undefined && Array.isArray(body.states)) {
      updateDoc.states = body.states;
    }
    if (body.cities !== undefined && Array.isArray(body.cities)) {
      updateDoc.cities = body.cities;
    }
    if (body.nights !== undefined) {
      updateDoc.nights = Number(body.nights) || 0;
    }
    if (body.days !== undefined) {
      updateDoc.days = Number(body.days) || (Number(body.nights) || 0) + 1;
    }

    if (body.highlights && !Array.isArray(body.highlights)) {
      updateDoc.highlights = String(body.highlights).split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    if (body.coverImage) {
      updateDoc.coverImageStr = body.coverImage;
    }

    const filter = Types.ObjectId.isValid(id) ? { _id: new Types.ObjectId(id) } : { slug: id };

    await db.collection("packages").updateOne(filter, { $set: updateDoc });

    const updatedPackage = await db.collection("packages").findOne(filter);

    return NextResponse.json({
      success: true,
      package: updatedPackage,
      message: "Package updated successfully",
    });
  } catch (error: any) {
    console.error("[Package PATCH error]:", error);
    return NextResponse.json({ error: "Failed to update package", detail: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const filter = Types.ObjectId.isValid(id) ? { _id: new Types.ObjectId(id) } : { slug: id };
    await db.collection("packages").deleteOne(filter);

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (error: any) {
    console.error("[Package DELETE error]:", error);
    return NextResponse.json({ error: "Failed to delete package", detail: error?.message }, { status: 500 });
  }
}
