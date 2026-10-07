// ============================================================
// Transport Operations Service
// Handles chauffeur assignment, vehicle registration allocation,
// dispatch tracking, driver contact details, and transport vouchers.
// ============================================================

import mongoose from "mongoose";
import connectDB from "@/lib/db/mongoose";
import { BookingModel, type IBooking } from "@/domains/booking/booking.model";
import { BookingService } from "@/domains/booking/booking.service";
import { VoucherService } from "@/domains/booking/voucher.service";
import { AuditService } from "@/domains/auth/audit.service";
import { NotificationService } from "@/domains/notifications/notification.service";
import { Department } from "@/lib/auth/permissions";

export interface AssignTransportInput {
  bookingId: string;
  transportIndex?: number;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  vehicleNumber: string;
  pickupLocation?: string;
  dropLocation?: string;
  pickupTime?: Date;
  supplierCost: number;
  supplierName?: string;
  notes?: string;
  userId: string;
  userEmail: string;
}

export class TransportOperationsService {
  /**
   * 1. ASSIGN VEHICLE & CHAUFFEUR TO BOOKING
   */
  static async assignDriverAndVehicle(input: AssignTransportInput): Promise<IBooking> {
    await connectDB();

    const booking = await BookingModel.findById(input.bookingId);
    if (!booking) throw new Error("Booking not found");

    const index = input.transportIndex ?? 0;
    if (!booking.transportBookings || booking.transportBookings.length === 0) {
      booking.transportBookings = [
        {
          serviceName: `Dedicated ${input.vehicleType} Transfer`,
          vehicleType: input.vehicleType,
          vehicleNumber: input.vehicleNumber,
          driverName: input.driverName,
          driverPhone: input.driverPhone,
          pickupLocation: input.pickupLocation || `${booking.destination || "Arrival"} Terminal`,
          dropLocation: input.dropLocation || `${booking.destination || "Departure"} Terminal`,
          pickupTime: input.pickupTime || booking.travelDates.from,
          cost: input.supplierCost,
          supplierName: input.supplierName,
          status: "ASSIGNED",
          notes: input.notes,
        },
      ];
    } else {
      const item = booking.transportBookings[index];
      if (item) {
        item.driverName = input.driverName;
        item.driverPhone = input.driverPhone;
        item.vehicleType = input.vehicleType;
        item.vehicleNumber = input.vehicleNumber;
        item.cost = input.supplierCost;
        item.status = "ASSIGNED";
        if (input.pickupLocation) item.pickupLocation = input.pickupLocation;
        if (input.dropLocation) item.dropLocation = input.dropLocation;
        if (input.pickupTime) item.pickupTime = input.pickupTime;
        if (input.supplierName) item.supplierName = input.supplierName;
        if (input.notes) item.notes = input.notes;
      }
    }

    booking.transportStatus = "ASSIGNED";
    await booking.save();

    // Recalculate profitability with actual vehicle cost
    await BookingService.recalculateProfitability(booking._id.toString());

    // Operations notification
    await NotificationService.notifyDepartment(
      Department.OPERATIONS,
      `Chauffeur Assigned: ${booking.bookingNumber}`,
      `Driver ${input.driverName} (${input.vehicleNumber}) assigned to ${booking.bookingNumber}.`,
      {
        type: "INFO",
        link: `/admin/bookings`,
      }
    );

    // Audit transition
    await AuditService.logTransition({
      userId: input.userId,
      userEmail: input.userEmail,
      entityType: "TransportOperation",
      entityId: booking._id.toString(),
      fromState: "UNASSIGNED",
      toState: "ASSIGNED",
      trigger: "DRIVER_VEHICLE_ASSIGNED",
      metadata: {
        bookingNumber: booking.bookingNumber,
        driverName: input.driverName,
        vehicleNumber: input.vehicleNumber,
        cost: input.supplierCost,
      },
    });

    return booking;
  }

  /**
   * 2. DISPATCH TRANSPORT
   */
  static async dispatchTransport(params: {
    bookingId: string;
    transportIndex?: number;
    userId: string;
    userEmail: string;
  }): Promise<IBooking> {
    await connectDB();

    const booking = await BookingModel.findById(params.bookingId);
    if (!booking) throw new Error("Booking not found");

    const index = params.transportIndex ?? 0;
    const item = booking.transportBookings[index];
    if (!item) throw new Error("Transport booking item not found");

    item.status = "DISPATCHED";
    booking.transportStatus = "DISPATCHED";

    await booking.save();

    await AuditService.logTransition({
      userId: params.userId,
      userEmail: params.userEmail,
      entityType: "TransportOperation",
      entityId: booking._id.toString(),
      fromState: "ASSIGNED",
      toState: "DISPATCHED",
      trigger: "TRANSPORT_DISPATCHED",
      metadata: {
        bookingNumber: booking.bookingNumber,
        driverName: item.driverName,
        vehicleNumber: item.vehicleNumber,
      },
    });

    return booking;
  }

  /**
   * 3. COMPLETE TRANSPORT
   */
  static async completeTransport(params: {
    bookingId: string;
    transportIndex?: number;
    userId: string;
    userEmail: string;
  }): Promise<IBooking> {
    await connectDB();

    const booking = await BookingModel.findById(params.bookingId);
    if (!booking) throw new Error("Booking not found");

    const index = params.transportIndex ?? 0;
    const item = booking.transportBookings[index];
    if (!item) throw new Error("Transport booking item not found");

    item.status = "COMPLETED";
    booking.transportStatus = "COMPLETED";

    await booking.save();

    await AuditService.logTransition({
      userId: params.userId,
      userEmail: params.userEmail,
      entityType: "TransportOperation",
      entityId: booking._id.toString(),
      fromState: "DISPATCHED",
      toState: "COMPLETED",
      trigger: "TRANSPORT_COMPLETED",
      metadata: {
        bookingNumber: booking.bookingNumber,
        driverName: item.driverName,
        vehicleNumber: item.vehicleNumber,
      },
    });

    return booking;
  }

  /**
   * 4. ISSUE TRANSPORT VOUCHER
   */
  static async issueTransportVoucher(params: {
    bookingId: string;
    transportIndex?: number;
    userId: string;
    userEmail: string;
  }): Promise<IBooking> {
    await connectDB();

    const booking = await BookingModel.findById(params.bookingId);
    if (!booking) throw new Error("Booking not found");

    const index = params.transportIndex ?? 0;
    const item = booking.transportBookings[index];
    if (!item) throw new Error("Transport booking item not found");

    const voucherCode = VoucherService.generateVoucherNumber("BMT-TV");
    booking.vouchers.push({
      voucherNumber: voucherCode,
      type: "TRANSPORT",
      issuedAt: new Date(),
      issuedBy: new mongoose.Types.ObjectId(params.userId),
      status: "ISSUED",
      contentSummary: `Private transport voucher: ${item.vehicleType} (${item.vehicleNumber || "Dedicated"}) - Chauffeur: ${item.driverName || "Assigned"}`,
    });

    await booking.save();

    await AuditService.logTransition({
      userId: params.userId,
      userEmail: params.userEmail,
      entityType: "TransportOperation",
      entityId: booking._id.toString(),
      fromState: "ASSIGNED",
      toState: "VOUCHERED",
      trigger: "TRANSPORT_VOUCHER_ISSUED",
      metadata: {
        bookingNumber: booking.bookingNumber,
        voucherCode,
        driverName: item.driverName,
      },
    });

    return booking;
  }

  /**
   * 5. LIST TRANSPORT OPERATIONS QUEUE
   */
  static async listTransportOperationsQueue(filter?: { status?: string }) {
    await connectDB();

    const query: Record<string, unknown> = {};
    if (filter?.status && filter.status !== "ALL") {
      query.transportStatus = filter.status;
    }

    const bookings = await BookingModel.find(query)
      .populate("customer", "name phone email")
      .select("bookingNumber customer travelDates transportStatus transportBookings totalAmount status")
      .sort({ "travelDates.from": 1 })
      .lean();

    return bookings;
  }
}
