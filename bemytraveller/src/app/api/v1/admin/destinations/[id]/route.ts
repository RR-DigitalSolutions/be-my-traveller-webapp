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

    const destination = await db.collection("destinations").findOne({ _id: new ObjectId(id) });
    if (!destination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, destination });
  } catch (error) {
    console.error("[Destination GET error]:", error);
    return NextResponse.json({ error: "Failed to fetch destination" }, { status: 500 });
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
      updateDoc.displayOrder = Number(body.displayOrder) || 0;
    }

    if (body.countryId) {
      if (ObjectId.isValid(body.countryId)) {
        updateDoc.countryId = new ObjectId(body.countryId);
        const parentCountry = await db.collection("destinations").findOne({ _id: new ObjectId(body.countryId) });
        if (parentCountry) {
          updateDoc.countrySlug = parentCountry.slug;
          updateDoc.countryName = parentCountry.name;
        }
      } else {
        const parentCountry = await db.collection("destinations").findOne({ slug: String(body.countryId).toLowerCase() });
        if (parentCountry) {
          updateDoc.countryId = parentCountry._id;
          updateDoc.countrySlug = parentCountry.slug;
          updateDoc.countryName = parentCountry.name;
        } else {
          updateDoc.countrySlug = String(body.countryId).toLowerCase();
          updateDoc.countryName = body.countryName || "India";
        }
      }
    }

    if (body.stateId) {
      if (ObjectId.isValid(body.stateId)) {
        updateDoc.stateId = new ObjectId(body.stateId);
        const parentState = await db.collection("destinations").findOne({ _id: new ObjectId(body.stateId) });
        if (parentState) {
          updateDoc.stateSlug = parentState.slug;
          updateDoc.stateName = parentState.name;
          if (parentState.countryId) {
            updateDoc.countryId = parentState.countryId;
            updateDoc.countrySlug = parentState.countrySlug;
            updateDoc.countryName = parentState.countryName;
          }
        }
      } else if (body.stateId) {
        const parentState = await db.collection("destinations").findOne({ slug: String(body.stateId).toLowerCase() });
        if (parentState) {
          updateDoc.stateId = parentState._id;
          updateDoc.stateSlug = parentState.slug;
          updateDoc.stateName = parentState.name;
        }
      }
    }

    if (body.highlights !== undefined) {
      updateDoc.highlights = Array.isArray(body.highlights)
        ? body.highlights
        : (body.highlights ? String(body.highlights).split(",").map((s: string) => s.trim()) : []);
    }

    if (body.coverImage) {
      updateDoc.coverImageStr = body.coverImage;
    }

    if (ObjectId.isValid(id)) {
      await db.collection("destinations").updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc }
      );
    } else {
      await db.collection("destinations").updateOne(
        { slug: id },
        { $set: updateDoc }
      );
    }

    const updatedDestination = ObjectId.isValid(id)
      ? await db.collection("destinations").findOne({ _id: new ObjectId(id) })
      : await db.collection("destinations").findOne({ slug: id });

    return NextResponse.json({ success: true, destination: updatedDestination, message: "Destination updated successfully" });
  } catch (error) {
    console.error("[Destination PATCH error]:", error);
    return NextResponse.json({ error: "Failed to update destination" }, { status: 500 });
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

    await db.collection("destinations").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, message: "Destination deleted" });
  } catch (error) {
    console.error("[Destination DELETE error]:", error);
    return NextResponse.json({ error: "Failed to delete destination" }, { status: 500 });
  }
}
