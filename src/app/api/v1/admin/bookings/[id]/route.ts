import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { BookingService } from "@/domains/booking/booking.service";
import { BookingModel } from "@/domains/booking/booking.model";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const booking = await BookingService.getBookingDetails(id);

    return NextResponse.json({ success: true, booking });
  } catch (error: unknown) {
    console.error("[Booking GET [id] Error]:", error);
    const message = error instanceof Error ? error.message : "Booking not found";
    return NextResponse.json({ error: message }, { status: 404 });
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
    const { internalNotes, operationsNotes, assignedTo, status } = body;

    const updateDoc: Record<string, unknown> = { updatedAt: new Date() };
    if (internalNotes !== undefined) updateDoc.internalNotes = internalNotes;
    if (operationsNotes !== undefined) updateDoc.operationsNotes = operationsNotes;
    if (assignedTo !== undefined) updateDoc.assignedTo = assignedTo;
    if (status !== undefined) updateDoc.status = status;

    const booking = await BookingModel.findByIdAndUpdate(id, { $set: updateDoc }, { new: true });

    return NextResponse.json({ success: true, booking, message: "Booking updated" });
  } catch (error: unknown) {
    console.error("[Booking PATCH [id] Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to update";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
