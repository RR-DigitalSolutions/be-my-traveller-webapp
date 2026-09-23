import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";

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
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
        { quoteNumber: { $regex: search, $options: "i" } },
      ];
    }

    let quotes = await db.collection("quotes").find(query).sort({ createdAt: -1 }).toArray();

    if (quotes.length === 0) {
      const defaultQuotes = [
        {
          quoteNumber: "BMT-QT-2026-104",
          customerName: "Vikram Malhotra",
          customerPhone: "+91 98200 45678",
          customerEmail: "vikram.m@gmail.com",
          destination: "Kashmir Luxury Tour",
          travelDates: "15 Oct 2026 – 21 Oct 2026 (6N/7D)",
          paxCount: "2 Adults",
          hotelTier: "5★ Luxury (The Khyber & Houseboat)",
          cabType: "Private Innova Crysta",
          totalAmount: 94500,
          status: "SENT",
          createdAt: new Date(),
        },
        {
          quoteNumber: "BMT-QT-2026-103",
          customerName: "Ananya Deshmukh",
          customerPhone: "+91 97112 34567",
          customerEmail: "ananya.d@outlook.com",
          destination: "Himachal Explorer & Spiti",
          travelDates: "10 Nov 2026 – 17 Nov 2026 (7N/8D)",
          paxCount: "4 Adults",
          hotelTier: "4★ Deluxe & Riverside Camps",
          cabType: "Private 4x4 Scorpio / Urbania",
          totalAmount: 142000,
          status: "CONFIRMED",
          createdAt: new Date(),
        },
        {
          quoteNumber: "BMT-QT-2026-102",
          customerName: "Rahul & Sneha Kapoor",
          customerPhone: "+91 98450 12345",
          customerEmail: "rahul.kapoor@techcorp.in",
          destination: "Bali Honeymoon Villa Special",
          travelDates: "05 Dec 2026 – 12 Dec 2026 (7N/8D)",
          paxCount: "2 Adults (Honeymoon)",
          hotelTier: "Private Pool Villa (Ubud & Seminyak)",
          cabType: "Private AC Vehicle with Guide",
          totalAmount: 188000,
          status: "DRAFT",
          createdAt: new Date(),
        },
      ];
      await db.collection("quotes").insertMany(defaultQuotes);
      quotes = await db.collection("quotes").find(query).toArray();
    }

    return NextResponse.json({ quotes, total: quotes.length });
  } catch (error) {
    console.error("[Quotes GET Error]:", error);
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
    const { customerName, customerPhone, customerEmail, destination, travelDates, paxCount, hotelTier, cabType, totalAmount } = body;

    if (!customerName || !customerPhone || !destination) {
      return NextResponse.json({ error: "Customer details and destination required" }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const quoteNumber = `BMT-QT-2026-${Math.floor(100 + Math.random() * 900)}`;

    const doc = {
      quoteNumber,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      destination,
      travelDates: travelDates || "Flexible",
      paxCount: paxCount || "2 Adults",
      hotelTier: hotelTier || "4★ Deluxe",
      cabType: cabType || "Private AC Sedan/SUV",
      totalAmount: Number(totalAmount) || 50000,
      status: "SENT",
      createdAt: new Date(),
    };

    const res = await db.collection("quotes").insertOne(doc);
    return NextResponse.json({ success: true, quote: { ...doc, _id: res.insertedId } }, { status: 201 });
  } catch (error) {
    console.error("[Quotes POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
