import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import { ObjectId } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const destinationId = searchParams.get("destinationId") || "";
    const destinationSlug = searchParams.get("destinationSlug") || "";
    const category = searchParams.get("category") || "";

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { desc: { $regex: search, $options: "i" } },
        { destinationName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (destinationId) {
      query.destinationId = new ObjectId(destinationId);
    }
    if (destinationSlug) {
      query.destinationSlug = destinationSlug;
    }
    if (category && category !== "ALL") {
      query.category = category;
    }

    const attractions = await db
      .collection("attractions")
      .find(query)
      .sort({ displayOrder: 1, sortOrder: 1, name: 1 })
      .toArray();

    return NextResponse.json({ success: true, attractions, total: attractions.length });
  } catch (error) {
    console.error("[Admin Attractions GET Error]:", error);
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
      destinationId,
      destinationSlug,
      destinationName,
      stateSlug,
      stateName,
      desc,
      img,
      category,
      entryFee,
      timing,
      idealDuration,
      rating,
      displayOrder,
      isFeatured,
      status,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Attraction name is required" }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    // Resolve destination details if ID is provided
    let finalDestId = destinationId ? new ObjectId(destinationId) : undefined;
    let finalDestSlug = destinationSlug || "";
    let finalDestName = destinationName || "";
    let finalStateSlug = stateSlug || "";
    let finalStateName = stateName || "";

    if (destinationId) {
      const dest = await db.collection("destinations").findOne({ _id: new ObjectId(destinationId) });
      if (dest) {
        finalDestSlug = dest.slug;
        finalDestName = dest.name;
        finalStateSlug = dest.stateSlug || "";
        finalStateName = dest.stateName || "";
      }
    }

    const doc = {
      name,
      destinationId: finalDestId,
      destinationSlug: finalDestSlug,
      destinationName: finalDestName,
      stateSlug: finalStateSlug,
      stateName: finalStateName,
      desc: desc || "",
      img: img || "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80",
      category: category || "Sightseeing",
      entryFee: entryFee || "Free",
      timing: timing || "Open Daily 9:00 AM - 6:00 PM",
      idealDuration: idealDuration || "1 to 2 Hours",
      rating: Number(rating) || 4.9,
      displayOrder: Number(displayOrder) || 1,
      isFeatured: Boolean(isFeatured),
      status: status || "PUBLISHED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("attractions").insertOne(doc);

    // Also sync with parent destination document if applicable
    if (finalDestSlug) {
      await db.collection("destinations").updateOne(
        { slug: finalDestSlug },
        {
          $addToSet: {
            attractions: {
              name: doc.name,
              desc: doc.desc,
              img: doc.img,
              category: doc.category,
              entryFee: doc.entryFee,
            },
          },
        }
      );
    }

    return NextResponse.json({ success: true, attraction: { ...doc, _id: result.insertedId } }, { status: 201 });
  } catch (error) {
    console.error("[Admin Attractions POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
