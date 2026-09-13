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
    const stars = searchParams.get("stars") || "ALL";

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }
    if (stars !== "ALL") {
      query.starRating = Number(stars);
    }

    let hotels = await db.collection("hotels").find(query).sort({ starRating: -1, name: 1 }).toArray();

    // Default seeded hotels if collection empty
    if (hotels.length === 0) {
      const defaultHotels = [
        {
          name: "The Khyber Himalayan Resort & Spa",
          city: "Gulmarg, Kashmir",
          starRating: 5,
          tier: "LUXURY",
          basePricePerNight: 28500,
          amenities: ["Heated Indoor Pool", "Ski-In Ski-Out", "Spa", "Himalayan View Suites"],
          coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
          status: "ACTIVE",
          createdAt: new Date(),
        },
        {
          name: "Span Resort & Spa",
          city: "Manali, Himachal",
          starRating: 5,
          tier: "LUXURY",
          basePricePerNight: 16500,
          amenities: ["Beas Riverfront", "Private Lawn", "Infinity Pool", "Bonfire Dinners"],
          coverImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
          status: "ACTIVE",
          createdAt: new Date(),
        },
        {
          name: "Kumarakom Lake Resort",
          city: "Kumarakom, Kerala",
          starRating: 5,
          tier: "LUXURY",
          basePricePerNight: 22000,
          amenities: ["Meandering Pool Villas", "Ayurvedic Spa", "Sunset Cruise", "Heritage Suites"],
          coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
          status: "ACTIVE",
          createdAt: new Date(),
        },
        {
          name: "Taj Lake Palace",
          city: "Udaipur, Rajasthan",
          starRating: 5,
          tier: "HERITAGE",
          basePricePerNight: 45000,
          amenities: ["Lake Pichola Island", "Royal Butler Service", "Jiva Spa Boat", "Fine Dining"],
          coverImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
          status: "ACTIVE",
          createdAt: new Date(),
        },
        {
          name: "Atlantis, The Palm",
          city: "Palm Jumeirah, Dubai",
          starRating: 5,
          tier: "LUXURY",
          basePricePerNight: 36000,
          amenities: ["Aquaventure Waterpark", "Lost Chambers Aquarium", "Underwater Suites", "Nobu Restaurant"],
          coverImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
          status: "ACTIVE",
          createdAt: new Date(),
        },
        {
          name: "Ayana Resort and Spa",
          city: "Jimbaran, Bali",
          starRating: 5,
          tier: "LUXURY",
          basePricePerNight: 24000,
          amenities: ["Rock Bar Oceanfront", "12 Swimming Pools", "Private Beach", "Thalassotherapy Spa"],
          coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
          status: "ACTIVE",
          createdAt: new Date(),
        },
        {
          name: "Grand Mercure Resort",
          city: "Candolim, Goa",
          starRating: 4,
          tier: "DELUXE",
          basePricePerNight: 7500,
          amenities: ["Beachside Cabanas", "Large Pool", "Multi-Cuisine Dining", "Spa"],
          coverImage: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
          status: "ACTIVE",
          createdAt: new Date(),
        },
      ];
      await db.collection("hotels").insertMany(defaultHotels);
      hotels = await db.collection("hotels").find(query).toArray();
    }

    return NextResponse.json({ hotels, total: hotels.length });
  } catch (error) {
    console.error("[Hotels GET Error]:", error);
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
    const { name, city, starRating, tier, basePricePerNight, amenities, coverImage, status } = body;

    if (!name || !city) {
      return NextResponse.json({ error: "Name and city are required" }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const doc = {
      name,
      city,
      starRating: Number(starRating) || 4,
      tier: tier || "DELUXE",
      basePricePerNight: Number(basePricePerNight) || 5000,
      amenities: Array.isArray(amenities) ? amenities : (amenities ? String(amenities).split(",").map((s) => s.trim()) : []),
      coverImage: coverImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      status: status || "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await db.collection("hotels").insertOne(doc);

    return NextResponse.json({ success: true, hotel: { ...doc, _id: res.insertedId } }, { status: 201 });
  } catch (error) {
    console.error("[Hotels POST Error]:", error);
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

    await db.collection("hotels").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Hotels DELETE Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
