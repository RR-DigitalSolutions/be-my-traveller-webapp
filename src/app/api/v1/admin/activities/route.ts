import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const destinationSlug = searchParams.get("destinationSlug") || "";
    const destinationId = searchParams.get("destinationId") || "";

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
        { destinationName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (destinationId && Types.ObjectId.isValid(destinationId)) {
      query.$or = [
        { destinationId: new Types.ObjectId(destinationId) },
        { destinations: new Types.ObjectId(destinationId) },
      ];
    } else if (destinationSlug) {
      query.$or = [
        { destinationSlug: destinationSlug },
        { destination: { $regex: new RegExp(`^${destinationSlug.replace(/-/g, " ")}$`, "i") } },
      ];
    }

    const activities = await db
      .collection("activities")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, activities, total: activities.length });
  } catch (error) {
    console.error("[Activities GET Error]:", error);
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
    const {
      name,
      destination,
      destinationId,
      destinationSlug,
      destinationName,
      category,
      duration,
      adultPrice,
      childPrice,
      img,
      desc,
      shortDescription,
      highlights,
      inclusions,
      status,
    } = body;

    if (!name || (!destination && !destinationSlug && !destinationId)) {
      return NextResponse.json(
        { error: "Activity name and destination are required" },
        { status: 400 }
      );
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    // Resolve destination details
    let finalDestId: Types.ObjectId | undefined =
      destinationId && Types.ObjectId.isValid(destinationId)
        ? new Types.ObjectId(destinationId)
        : undefined;
    let finalDestSlug = destinationSlug || "";
    let finalDestName = destinationName || destination || "";

    if (finalDestId) {
      const dest = await db.collection("destinations").findOne({ _id: finalDestId });
      if (dest) {
        finalDestSlug = dest.slug;
        finalDestName = dest.name;
      }
    } else if (finalDestSlug) {
      const dest = await db.collection("destinations").findOne({ slug: finalDestSlug });
      if (dest) {
        finalDestId = dest._id;
        finalDestName = dest.name;
      }
    } else if (destination) {
      const dest = await db
        .collection("destinations")
        .findOne({ name: { $regex: new RegExp(`^${destination}$`, "i") } });
      if (dest) {
        finalDestId = dest._id;
        finalDestSlug = dest.slug;
        finalDestName = dest.name;
      }
    }

    const doc = {
      name,
      destination: finalDestName || destination,
      destinationId: finalDestId,
      destinationSlug: finalDestSlug,
      destinationName: finalDestName,
      destinations: finalDestId ? [finalDestId] : [],
      category: category || "Adventure & Sightseeing",
      duration: duration || "3 Hours",
      adultPrice: Number(adultPrice) || 1500,
      childPrice: Number(childPrice) || 1000,
      img: img || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
      desc: desc || shortDescription || "",
      shortDescription: shortDescription || desc || "",
      highlights: Array.isArray(highlights)
        ? highlights
        : highlights
        ? String(highlights).split(",").map((s) => s.trim())
        : [],
      inclusions: Array.isArray(inclusions)
        ? inclusions
        : inclusions
        ? String(inclusions).split(",").map((s) => s.trim())
        : [],
      status: status || "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await db.collection("activities").insertOne(doc);
    return NextResponse.json(
      { success: true, activity: { ...doc, _id: res.insertedId } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Activities POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, _id, ...fields } = body;
    const targetId = id || _id;

    if (!targetId || !Types.ObjectId.isValid(targetId)) {
      return NextResponse.json({ error: "Valid activity ID required" }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const updateDoc: Record<string, unknown> = {
      ...fields,
      updatedAt: new Date(),
    };

    if (fields.adultPrice !== undefined) updateDoc.adultPrice = Number(fields.adultPrice);
    if (fields.childPrice !== undefined) updateDoc.childPrice = Number(fields.childPrice);
    if (fields.destinationId && Types.ObjectId.isValid(fields.destinationId)) {
      updateDoc.destinationId = new Types.ObjectId(fields.destinationId);
      updateDoc.destinations = [updateDoc.destinationId];
    }

    await db.collection("activities").updateOne(
      { _id: new Types.ObjectId(targetId) },
      { $set: updateDoc }
    );

    const updated = await db.collection("activities").findOne({ _id: new Types.ObjectId(targetId) });
    return NextResponse.json({ success: true, activity: updated });
  } catch (error) {
    console.error("[Activities PATCH Error]:", error);
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

    await db.collection("activities").deleteOne({ _id: new Types.ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Activities DELETE Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
