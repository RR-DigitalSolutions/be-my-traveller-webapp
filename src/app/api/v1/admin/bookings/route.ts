import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import { BookingModel } from "@/domains/booking/booking.model";
import { BookingService } from "@/domains/booking/booking.service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const hotelStatus = searchParams.get("hotelStatus") || "ALL";
    const transportStatus = searchParams.get("transportStatus") || "ALL";
    const financeStatus = searchParams.get("financeStatus") || "ALL";

    await connectDB();

    const bookings = await BookingService.listBookings({
      search,
      status,
      hotelStatus,
      transportStatus,
      financeStatus,
    });

    return NextResponse.json({ bookings, total: bookings.length });
  } catch (error: unknown) {
    console.error("[Bookings GET Error]:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { quoteId, notes } = body;

    if (!quoteId) {
      return NextResponse.json({ error: "quoteId is required to create a booking" }, { status: 400 });
    }

    const booking = await BookingService.createBookingFromQuote({
      quoteId,
      userId: session.user.id || "admin",
      userEmail: session.user.email || "admin@bemytraveller.com",
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        booking,
        message: `Booking ${booking.bookingNumber} created successfully`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[Bookings POST Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, internalNotes, operationsNotes, assignedTo, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Booking id is required" }, { status: 400 });
    }

    await connectDB();

    const updateDoc: Record<string, unknown> = { updatedAt: new Date() };
    if (internalNotes !== undefined) updateDoc.internalNotes = internalNotes;
    if (operationsNotes !== undefined) updateDoc.operationsNotes = operationsNotes;
    if (assignedTo !== undefined) updateDoc.assignedTo = assignedTo;
    if (status !== undefined) updateDoc.status = status;

    const booking = await BookingModel.findByIdAndUpdate(id, { $set: updateDoc }, { new: true });

    return NextResponse.json({ success: true, booking, message: "Booking updated" });
  } catch (error: unknown) {
    console.error("[Bookings PATCH Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to update booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
