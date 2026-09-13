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

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
      ];
    }

    let activities = await db.collection("activities").find(query).sort({ createdAt: -1 }).toArray();

    if (activities.length === 0) {
      const defaultActivities = [
        {
          name: "Gulmarg Gondola Phase 1 & 2 Pass",
          destination: "Kashmir",
          category: "Adventure & Cable Car",
          duration: "4 Hours",
          adultPrice: 1850,
          childPrice: 1100,
          status: "ACTIVE",
          createdAt: new Date(),
        },
        {
          name: "Solang Valley Paragliding & ATV Ride",
          destination: "Himachal Pradesh",
          category: "Extreme Adventure",
          duration: "2 Hours",
          adultPrice: 3200,
          childPrice: 2000,
          status: "ACTIVE",
          createdAt: new Date(),
        },
        {
          name: "Alleppey Sunset Shikara Boat Cruise",
          destination: "Kerala",
          category: "Scenic & Relaxation",
          duration: "3 Hours",
          adultPrice: 1500,
          childPrice: 800,
          status: "ACTIVE",
          createdAt: new Date(),
        },
        {
          name: "Burj Khalifa 124th Floor + Dubai Aquarium",
          destination: "Dubai",
          category: "Sightseeing & Pass",
          duration: "5 Hours",
          adultPrice: 5400,
          childPrice: 4200,
          status: "ACTIVE",
          createdAt: new Date(),
        },
        {
          name: "Scuba Diving at Havelock Island (Nemo Reef)",
          destination: "Andaman",
          category: "Water Sports",
          duration: "3 Hours",
          adultPrice: 4500,
          childPrice: 3500,
          status: "ACTIVE",
          createdAt: new Date(),
        },
      ];
      await db.collection("activities").insertMany(defaultActivities);
      activities = await db.collection("activities").find(query).toArray();
    }

    return NextResponse.json({ activities, total: activities.length });
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
    const { name, destination, category, duration, adultPrice, childPrice, status } = body;

    if (!name || !destination) {
      return NextResponse.json({ error: "Name and destination required" }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const doc = {
      name,
      destination,
      category: category || "Sightseeing",
      duration: duration || "3 Hours",
      adultPrice: Number(adultPrice) || 1500,
      childPrice: Number(childPrice) || 1000,
      status: status || "ACTIVE",
      createdAt: new Date(),
    };

    const res = await db.collection("activities").insertOne(doc);
    return NextResponse.json({ success: true, activity: { ...doc, _id: res.insertedId } }, { status: 201 });
  } catch (error) {
    console.error("[Activities POST Error]:", error);
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

    await db.collection("activities").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Activities DELETE Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
