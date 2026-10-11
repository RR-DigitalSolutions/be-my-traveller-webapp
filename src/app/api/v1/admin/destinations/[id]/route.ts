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

    const destination = await db.collection("destinations").findOne({ _id: new Types.ObjectId(id) });
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
      if (Types.ObjectId.isValid(body.countryId)) {
        updateDoc.countryId = new Types.ObjectId(body.countryId);
        const parentCountry = await db.collection("destinations").findOne({ _id: new Types.ObjectId(body.countryId) });
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
      if (Types.ObjectId.isValid(body.stateId)) {
        updateDoc.stateId = new Types.ObjectId(body.stateId);
        const parentState = await db.collection("destinations").findOne({ _id: new Types.ObjectId(body.stateId) });
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

    // Keep fastFacts and root attributes 100% in sync so changes reflect immediately across all frontend components
    const existingDoc = Types.ObjectId.isValid(id)
      ? await db.collection("destinations").findOne({ _id: new Types.ObjectId(id) })
      : await db.collection("destinations").findOne({ slug: id });

    const newStartingPrice = body.startingPrice ?? existingDoc?.startingPrice ?? existingDoc?.fastFacts?.startingPrice ?? "₹14,999";
    const newIdealDuration = body.idealDuration ?? existingDoc?.idealDuration ?? existingDoc?.fastFacts?.idealDuration ?? "4 to 6 Days";
    const newBestTime = body.bestTimeToVisit ?? existingDoc?.bestTimeToVisit ?? existingDoc?.fastFacts?.bestTime ?? "October to March";
    const newWeather = body.weather ?? existingDoc?.weather ?? existingDoc?.fastFacts?.weather ?? "Pleasant Climate";
    const newHowToReach = body.howToReach ?? existingDoc?.howToReach ?? existingDoc?.fastFacts?.howToReach ?? "";
    const newVerifiedStays = body.verifiedStays ?? existingDoc?.verifiedStays ?? existingDoc?.fastFacts?.verifiedStays ?? "4★ / 5★ Handpicked Stays";

    updateDoc.startingPrice = newStartingPrice;
    updateDoc.idealDuration = newIdealDuration;
    updateDoc.bestTimeToVisit = newBestTime;
    updateDoc.weather = newWeather;
    updateDoc.howToReach = newHowToReach;
    updateDoc.verifiedStays = newVerifiedStays;

    updateDoc.fastFacts = {
      startingPrice: newStartingPrice,
      idealDuration: newIdealDuration,
      bestTime: newBestTime,
      weather: newWeather,
      howToReach: newHowToReach,
      verifiedStays: newVerifiedStays,
    };

    if (Types.ObjectId.isValid(id)) {
      await db.collection("destinations").updateOne(
        { _id: new Types.ObjectId(id) },
        { $set: updateDoc }
      );
    } else {
      await db.collection("destinations").updateOne(
        { slug: id },
        { $set: updateDoc }
      );
    }

    const updatedDestination = Types.ObjectId.isValid(id)
      ? await db.collection("destinations").findOne({ _id: new Types.ObjectId(id) })
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

    await db.collection("destinations").deleteOne({ _id: new Types.ObjectId(id) });
    return NextResponse.json({ success: true, message: "Destination deleted" });
  } catch (error) {
    console.error("[Destination DELETE error]:", error);
    return NextResponse.json({ error: "Failed to delete destination" }, { status: 500 });
  }
}
