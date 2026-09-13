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

    const attraction = await db.collection("attractions").findOne({ _id: new ObjectId(id) });
    if (!attraction) {
      return NextResponse.json({ error: "Attraction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, attraction });
  } catch (error) {
    console.error("[Attraction GET error]:", error);
    return NextResponse.json({ error: "Failed to fetch attraction" }, { status: 500 });
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

    const updateDoc: Record<string, unknown> = {
      ...body,
      updatedAt: new Date(),
    };
    delete updateDoc._id;

    if (body.displayOrder !== undefined) {
      updateDoc.displayOrder = Number(body.displayOrder) || 1;
    }

    if (body.destinationId) {
      updateDoc.destinationId = new ObjectId(body.destinationId);
      const dest = await db.collection("destinations").findOne({ _id: new ObjectId(body.destinationId) });
      if (dest) {
        updateDoc.destinationSlug = dest.slug;
        updateDoc.destinationName = dest.name;
        updateDoc.stateSlug = dest.stateSlug || "";
        updateDoc.stateName = dest.stateName || "";
      }
    }

    await db.collection("attractions").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    const updatedAttraction = await db.collection("attractions").findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, attraction: updatedAttraction, message: "Attraction updated successfully" });
  } catch (error) {
    console.error("[Attraction PATCH error]:", error);
    return NextResponse.json({ error: "Failed to update attraction" }, { status: 500 });
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

    await db.collection("attractions").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, message: "Attraction deleted" });
  } catch (error) {
    console.error("[Attraction DELETE error]:", error);
    return NextResponse.json({ error: "Failed to delete attraction" }, { status: 500 });
  }
}
