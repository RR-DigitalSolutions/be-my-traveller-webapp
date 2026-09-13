import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import { ObjectId } from "mongodb";

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

    let transfer = null;
    if (ObjectId.isValid(id)) {
      transfer = await db.collection("transfers").findOne({ _id: new ObjectId(id) });
    }

    if (!transfer) {
      return NextResponse.json({ error: "Transfer product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, transfer });
  } catch (error: any) {
    console.error("[ADMIN_TRANSFER_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfer", detail: error?.message },
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
    const body = await req.json();

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid transfer ID" }, { status: 400 });
    }

    const updateDoc: Record<string, any> = {
      ...body,
      updatedAt: new Date(),
    };
    delete updateDoc._id;

    if (body.costPerUnit !== undefined) {
      updateDoc.costPerUnit = Number(body.costPerUnit) || 0;
    }
    if (body.originalPrice !== undefined) {
      updateDoc.originalPrice = Number(body.originalPrice) || 0;
    }
    if (body.discountPercent !== undefined) {
      updateDoc.discountPercent = Number(body.discountPercent) || 0;
    } else if (body.costPerUnit !== undefined && body.originalPrice !== undefined) {
      const orig = Number(body.originalPrice) || 0;
      const cost = Number(body.costPerUnit) || 0;
      if (orig > cost && orig > 0) {
        updateDoc.discountPercent = Math.round(((orig - cost) / orig) * 100);
      }
    }
    if (body.distanceKm !== undefined) {
      updateDoc.distanceKm = Number(body.distanceKm) || 0;
    }
    if (body.maxSeats !== undefined) {
      updateDoc.maxSeats = Number(body.maxSeats) || 4;
    }
    if (body.amenities !== undefined && !Array.isArray(body.amenities)) {
      updateDoc.amenities = String(body.amenities).split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (body.inclusions !== undefined && !Array.isArray(body.inclusions)) {
      updateDoc.inclusions = String(body.inclusions).split("\n").map((s) => s.trim()).filter(Boolean);
    }
    if (body.exclusions !== undefined && !Array.isArray(body.exclusions)) {
      updateDoc.exclusions = String(body.exclusions).split("\n").map((s) => s.trim()).filter(Boolean);
    }

    const result = await db.collection("transfers").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Transfer product not found" }, { status: 404 });
    }

    const updated = await db.collection("transfers").findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, transfer: updated });
  } catch (error: any) {
    console.error("[ADMIN_TRANSFER_PATCH_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to update transfer product", detail: error?.message },
      { status: 500 }
    );
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

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid transfer ID" }, { status: 400 });
    }

    const result = await db.collection("transfers").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Transfer product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Transfer product deleted successfully" });
  } catch (error: any) {
    console.error("[ADMIN_TRANSFER_DELETE_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to delete transfer product", detail: error?.message },
      { status: 500 }
    );
  }
}
