// ============================================================
// Hotel Operations Service
// Handles hotel reservation confirmation, direct hotel confirmation codes,
// room allocation tracking, supplier voucher issuance, and operational queues.
// ============================================================

import mongoose from "mongoose";
import connectDB from "@/lib/db/mongoose";
import { BookingModel, type IBooking } from "@/domains/booking/booking.model";
import { BookingService } from "@/domains/booking/booking.service";
import { VoucherService } from "@/domains/booking/voucher.service";
import { AuditService } from "@/domains/auth/audit.service";
import { NotificationService } from "@/domains/notifications/notification.service";
import { Department } from "@/lib/auth/permissions";

export interface ConfirmHotelInput {
  bookingId: string;
  hotelBookingIndex?: number;
  confirmationNumber: string;
  supplierCost: number;
  hotelName?: string;
  roomType?: string;
  mealPlan?: string;
  supplierName?: string;
  notes?: string;
  userId: string;
  userEmail: string;
}

export class HotelOperationsService {
  /**
   * 1. CONFIRM HOTEL RESERVATION WITH VENDOR/HOTEL DIRECT CODE
   */
  static async confirmHotelReservation(input: ConfirmHotelInput): Promise<IBooking> {
    await connectDB();

    const booking = await BookingModel.findById(input.bookingId);
    if (!booking) throw new Error("Booking not found");

    const index = input.hotelBookingIndex ?? 0;
    if (!booking.hotelBookings || booking.hotelBookings.length === 0) {
      // Create hotel item if none existed
      booking.hotelBookings = [
        {
          hotelName: input.hotelName || "Confirmed Deluxe Hotel",
          roomType: input.roomType || "Deluxe Room",
          mealPlan: input.mealPlan || "Breakfast & Dinner",
          checkIn: booking.travelDates.from,
          checkOut: booking.travelDates.to,
          roomsCount: 1,
          cost: input.supplierCost,
          confirmationNumber: input.confirmationNumber,
          voucherCode: VoucherService.generateVoucherNumber("BMT-HV"),
          status: "CONFIRMED",
          supplierName: input.supplierName,
          notes: input.notes,
        },
      ];
    } else {
      const item = booking.hotelBookings[index];
      if (item) {
        item.confirmationNumber = input.confirmationNumber;
        item.cost = input.supplierCost;
        item.status = "CONFIRMED";
        item.voucherCode = item.voucherCode || VoucherService.generateVoucherNumber("BMT-HV");
        if (input.hotelName) item.hotelName = input.hotelName;
        if (input.roomType) item.roomType = input.roomType;
        if (input.mealPlan) item.mealPlan = input.mealPlan;
        if (input.supplierName) item.supplierName = input.supplierName;
        if (input.notes) item.notes = input.notes;
      }
    }

    // Determine overall booking hotelStatus
    const allConfirmed = booking.hotelBookings.every((h) => h.status === "CONFIRMED" || h.status === "VOUCHERED");
    if (allConfirmed) {
      booking.hotelStatus = "CONFIRMED";
    }

    await booking.save();

    // Recalculate profitability with actual supplier cost
    await BookingService.recalculateProfitability(booking._id.toString());

    // Notify Operations
    await NotificationService.notifyDepartment(
      Department.OPERATIONS,
      `Hotel Confirmed: ${booking.bookingNumber}`,
      `Reservation confirmed with code ${input.confirmationNumber} for ${booking.bookingNumber}.`,
      {
        type: "INFO",
        link: `/admin/bookings`,
      }
    );

    // Audit transition
    await AuditService.logTransition({
      userId: input.userId,
      userEmail: input.userEmail,
      entityType: "HotelOperation",
      entityId: booking._id.toString(),
      fromState: "REQUESTED",
      toState: "CONFIRMED",
      trigger: "HOTEL_CONFIRMATION_RECORDED",
      metadata: {
        bookingNumber: booking.bookingNumber,
        confirmationNumber: input.confirmationNumber,
        supplierCost: input.supplierCost,
      },
    });

    return booking;
  }

  /**
   * 2. ISSUE HOTEL VOUCHER
   */
  static async issueHotelVoucher(params: {
    bookingId: string;
    hotelIndex?: number;
    userId: string;
    userEmail: string;
  }): Promise<IBooking> {
    await connectDB();

    const booking = await BookingModel.findById(params.bookingId);
    if (!booking) throw new Error("Booking not found");

    const index = params.hotelIndex ?? 0;
    const hotel = booking.hotelBookings[index];
    if (!hotel) throw new Error("Hotel booking item not found");

    const voucherCode = hotel.voucherCode || VoucherService.generateVoucherNumber("BMT-HV");
    hotel.voucherCode = voucherCode;
    hotel.status = "VOUCHERED";

    booking.hotelStatus = "VOUCHER_ISSUED";
    booking.vouchers.push({
      voucherNumber: voucherCode,
      type: "HOTEL",
      issuedAt: new Date(),
      issuedBy: new mongoose.Types.ObjectId(params.userId),
      status: "ISSUED",
      contentSummary: `Hotel stay voucher for ${hotel.hotelName} (${hotel.roomType}) - Conf: ${hotel.confirmationNumber || "Direct"}`,
    });

    await booking.save();

    await AuditService.logTransition({
      userId: params.userId,
      userEmail: params.userEmail,
      entityType: "HotelOperation",
      entityId: booking._id.toString(),
      fromState: "CONFIRMED",
      toState: "VOUCHERED",
      trigger: "HOTEL_VOUCHER_ISSUED",
      metadata: {
        bookingNumber: booking.bookingNumber,
        voucherCode,
        hotelName: hotel.hotelName,
      },
    });

    return booking;
  }

  /**
   * 3. LIST ALL HOTEL OPERATIONS ACROSS SYSTEM
   */
  static async listHotelOperationsQueue(filter?: { status?: string }) {
    await connectDB();

    const query: Record<string, unknown> = {};
    if (filter?.status && filter.status !== "ALL") {
      query.hotelStatus = filter.status;
    }

    const bookings = await BookingModel.find(query)
      .populate("customer", "name phone email")
      .select("bookingNumber customer travelDates hotelStatus hotelBookings totalAmount status")
      .sort({ "travelDates.from": 1 })
      .lean();

    return bookings;
  }
}
