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

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: "i" } },
        { travelerName: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
      ];
    }

    let bookings = await db.collection("bookings").find(query).sort({ createdAt: -1 }).toArray();

    if (bookings.length === 0) {
      const defaultBookings = [
        {
          bookingReference: "BMT-BK-2026-901",
          travelerName: "Vikram Malhotra",
          travelerPhone: "+91 98200 45678",
          destination: "Heavenly Kashmir with Gulmarg Gondola (5N/6D)",
          departureDate: "15 Oct 2026",
          returnDate: "20 Oct 2026",
          paxCount: "2 Adults",
          totalAmount: 94500,
          paidAmount: 94500,
          paymentStatus: "PAID",
          assignedDriver: "Tariq Ahmad (+91 94190 55667 - Innova Crysta JK-01-AB-1234)",
          hotelVoucherCode: "KHY-GUL-9022",
          status: "CONFIRMED",
          createdAt: new Date(),
        },
        {
          bookingReference: "BMT-BK-2026-902",
          travelerName: "Ananya Deshmukh",
          travelerPhone: "+91 97112 34567",
          destination: "Majestic Himachal & Rohtang Pass (6N/7D)",
          departureDate: "10 Nov 2026",
          returnDate: "16 Nov 2026",
          paxCount: "4 Adults",
          totalAmount: 142000,
          paidAmount: 50000,
          paymentStatus: "PARTIAL (₹50,000 Advance)",
          assignedDriver: "Rajesh Kumar (+91 98160 44321 - Tempo Traveller HP-01-CD-5678)",
          hotelVoucherCode: "SPAN-MAN-1144",
          status: "CONFIRMED",
          createdAt: new Date(),
        },
        {
          bookingReference: "BMT-BK-2026-903",
          travelerName: "Dr. Priya Sundaram",
          travelerPhone: "+91 94440 88990",
          destination: "Dubai & Abu Dhabi Ultra Explorer (6N/7D)",
          departureDate: "22 Dec 2026",
          returnDate: "28 Dec 2026",
          paxCount: "3 Adults",
          totalAmount: 215000,
          paidAmount: 215000,
          paymentStatus: "PAID",
          assignedDriver: "Ahmed Al-Mansoor (+971 50 123 4567 - GMC Yukon Luxury)",
          hotelVoucherCode: "ATL-DXB-7788",
          status: "CONFIRMED",
          createdAt: new Date(),
        },
      ];
      await db.collection("bookings").insertMany(defaultBookings);
      bookings = await db.collection("bookings").find(query).toArray();
    }

    return NextResponse.json({ bookings, total: bookings.length });
  } catch (error) {
    console.error("[Bookings GET Error]:", error);
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
    const { id, assignedDriver, paymentStatus, status } = body;

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const updateDoc: Record<string, unknown> = { updatedAt: new Date() };
    if (assignedDriver !== undefined) updateDoc.assignedDriver = assignedDriver;
    if (paymentStatus !== undefined) updateDoc.paymentStatus = paymentStatus;
    if (status !== undefined) updateDoc.status = status;

    await db.collection("bookings").updateOne({ _id: new Types.ObjectId(id) }, { $set: updateDoc });

    return NextResponse.json({ success: true, message: "Booking updated" });
  } catch (error) {
    console.error("[Bookings PATCH Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
