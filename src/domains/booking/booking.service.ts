// ============================================================
// Booking Domain Service
// Central orchestration service for the Travel ERP / Operations.
// Manages booking lifecycle, customer payments, operational tasks,
// profitability calculation, and links Leads & Quotes.
// ============================================================

import mongoose from "mongoose";
import connectDB from "@/lib/db/mongoose";
import {
  BookingModel,
  type IBooking,
  type BookingStatus,
  type IHotelBookingItem,
  type ITransportBookingItem,
} from "./booking.model";
import { QuoteModel } from "./quote.model";
import { PaymentModel, type IPayment } from "./payment.model";
import { LeadModel } from "@/domains/crm/lead.model";
import { CustomerModel, type ICustomer } from "@/domains/crm/customer.model";
import { BookingStateMachine, QuoteStateMachine } from "@/domains/workflow/state-machine";
import { AuditService } from "@/domains/auth/audit.service";
import { TaskService } from "@/domains/tasks/task.service";
import { NotificationService } from "@/domains/notifications/notification.service";
import { Department } from "@/lib/auth/permissions";

export interface CreateBookingFromQuoteInput {
  quoteId: string;
  userId: string;
  userEmail: string;
  notes?: string;
}

export interface RecordCustomerPaymentInput {
  bookingId: string;
  amount: number;
  paymentType: "ADVANCE" | "PARTIAL" | "FINAL";
  paymentMethod: "CARD" | "UPI" | "NET_BANKING" | "BANK_TRANSFER" | "CASH" | "CHEQUE";
  providerPaymentId?: string;
  notes?: string;
  userId: string;
  userEmail: string;
}

export class BookingService {
  /**
   * Generates a formal human-readable booking number
   */
  static generateBookingNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BMT-BK-${year}-${random}`;
  }

  /**
   * 1. CREATE BOOKING FROM ACCEPTED QUOTE
   * Transitions Quote to CONVERTED, links Customer & Lead,
   * generates Hotel & Transport operational items, and notifies Ops.
   */
  static async createBookingFromQuote(input: CreateBookingFromQuoteInput): Promise<IBooking> {
    await connectDB();

    const quote = await QuoteModel.findById(input.quoteId);
    if (!quote) throw new Error("Quotation not found");

    // Ensure quote is in valid state or accept it
    if (quote.status !== "ACCEPTED" && quote.status !== "SENT" && quote.status !== "VIEWED") {
      throw new Error(`Cannot convert quote in status "${quote.status}"`);
    }

    // Step A: Find or resolve Customer (zero duplication)
    let customerId = quote.customer;
    let customerDoc: ICustomer | null = null;

    if (customerId) {
      customerDoc = await CustomerModel.findById(customerId);
    }

    if (!customerDoc && quote.lead) {
      const lead = await LeadModel.findById(quote.lead);
      if (lead) {
        // Resolve customer by email or phone
        customerDoc = await CustomerModel.findOne({
          $or: [{ email: lead.email.toLowerCase().trim() }, { phone: lead.phone.trim() }],
        });

        if (!customerDoc) {
          customerDoc = await CustomerModel.create({
            email: lead.email.toLowerCase().trim(),
            phone: lead.phone.trim(),
            name: lead.name.trim(),
            tags: ["NEW_BOOKING"],
          });
        }
        customerId = customerDoc._id as mongoose.Types.ObjectId;
      }
    }

    if (!customerDoc) {
      throw new Error("Unable to resolve customer profile for booking creation");
    }

    // Step B: Build Operational Sub-items
    const hotelBookings: IHotelBookingItem[] = [];
    if (quote.hotelConfig && quote.hotelConfig.length > 0) {
      quote.hotelConfig.forEach((cfg) => {
        hotelBookings.push({
          hotelId: cfg.hotelId,
          hotelName: cfg.hotelName,
          destination: (quote.destinations && quote.destinations[0]) || "Destination",
          roomType: cfg.roomType || "Standard Deluxe Room",
          mealPlan: cfg.mealPlan || "Breakfast & Dinner",
          checkIn: quote.travelDates.from,
          checkOut: quote.travelDates.to,
          roomsCount: 1,
          cost: Math.round(quote.totalAmount * 0.4), // Baseline estimated vendor cost (40%)
          status: "REQUESTED",
        });
      });
    } else {
      // Default placeholder hotel reservation based on destination
      hotelBookings.push({
        hotelName: `${(quote.destinations && quote.destinations[0]) || "Scenic"} Heritage Resort`,
        destination: (quote.destinations && quote.destinations[0]) || "Scenic Valley",
        roomType: "Deluxe Premium Room",
        mealPlan: "Daily Breakfast & Dinner",
        checkIn: quote.travelDates.from,
        checkOut: quote.travelDates.to,
        roomsCount: 1,
        cost: Math.round(quote.totalAmount * 0.4),
        status: "REQUESTED",
      });
    }

    const transportBookings: ITransportBookingItem[] = [
      {
        serviceName: `Private Dedicated Tour Transfers (${quote.destinations.join(" - ")})`,
        vehicleType: "Innova Crysta / Luxury Cab",
        pickupLocation: `${quote.destinations[0] || "Airport"} Arrival Terminal`,
        dropLocation: `${quote.destinations[quote.destinations.length - 1] || "Airport"} Departure Terminal`,
        pickupTime: quote.travelDates.from,
        cost: Math.round(quote.totalAmount * 0.25), // Baseline estimated vendor cost (25%)
        status: "UNASSIGNED",
      },
    ];

    const totalSupplierCost =
      hotelBookings.reduce((sum, h) => sum + h.cost, 0) +
      transportBookings.reduce((sum, t) => sum + t.cost, 0);

    const grossProfit = quote.totalAmount - totalSupplierCost;
    const profitMarginPercent =
      quote.totalAmount > 0 ? Math.round((grossProfit / quote.totalAmount) * 100) : 0;

    // Step C: Generate unique Booking Number
    const bookingNumber = this.generateBookingNumber();

    // Step D: Create Booking Document
    const booking = await BookingModel.create({
      bookingNumber,
      quote: quote._id,
      lead: quote.lead,
      customer: customerDoc._id,
      createdBy: new mongoose.Types.ObjectId(input.userId),
      packageId: quote.packageId,
      packageName: quote.packageName,
      destination: (quote.destinations && quote.destinations.join(", ")) || "Custom Trip",
      travelDates: quote.travelDates,
      nights: quote.nights,
      travellers: quote.travellers,
      passengerDetails: [
        {
          name: customerDoc.name,
          type: "ADULT",
        },
      ],
      items: quote.items,
      totalAmount: quote.totalAmount,
      paidAmount: 0,
      pendingAmount: quote.totalAmount,
      currency: quote.currency || "INR",
      hotelStatus: "PENDING",
      transportStatus: "PENDING",
      voucherStatus: "PENDING",
      financeStatus: "UNPAID",
      hotelBookings,
      transportBookings,
      financeSummary: {
        totalRevenue: quote.totalAmount,
        totalSupplierCost,
        grossProfit,
        profitMarginPercent,
        supplierPaymentStatus: "UNPAID",
      },
      status: "PENDING_PAYMENT",
      internalNotes: input.notes,
      assignedTo: new mongoose.Types.ObjectId(input.userId),
    });

    // Step E: Update Quote status to CONVERTED
    await QuoteStateMachine.executeTransition({
      entityId: quote._id.toString(),
      currentState: quote.status,
      targetState: "CONVERTED",
      trigger: "BOOKING_CREATED",
      context: {
        userId: input.userId,
        userEmail: input.userEmail,
        reason: `Converted to booking ${bookingNumber}`,
      },
    });
    quote.status = "CONVERTED";
    await quote.save();

    // Step F: Synchronize Lead status to CONFIRMED / BOOKED
    if (quote.lead) {
      await LeadModel.findByIdAndUpdate(quote.lead, {
        $set: { status: "CONFIRMED" },
        $push: {
          communications: {
            type: "NOTE",
            direction: "INBOUND",
            subject: "Trip Booking Confirmed",
            notes: `Converted quote ${quote.quoteNumber} into active booking ${bookingNumber}. Total: ₹${quote.totalAmount}`,
            loggedBy: input.userEmail,
            timestamp: new Date(),
          },
        },
      });
    }

    // Step G: Create Operational Tasks for Hotel & Transport
    try {
      await TaskService.createTask({
        title: `Confirm Hotel Booking — ${bookingNumber}`,
        description: `Secure hotel reservation & confirmation number for ${customerDoc.name}'s trip to ${booking.destination}.`,
        department: Department.OPERATIONS,
        priority: "HIGH",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        type: "HOTEL_CONFIRMATION",
        entityType: "Booking",
        entityId: booking._id.toString(),
        entityRef: bookingNumber,
        assignedBy: input.userId,
      });

      await TaskService.createTask({
        title: `Assign Vehicle & Driver — ${bookingNumber}`,
        description: `Assign sanitized vehicle, driver contact, and coordinate arrival pickup for ${bookingNumber}.`,
        department: Department.OPERATIONS,
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        type: "TRANSPORT_ALLOCATION",
        entityType: "Booking",
        entityId: booking._id.toString(),
        entityRef: bookingNumber,
        assignedBy: input.userId,
      });
    } catch (taskErr) {
      console.warn("[Booking Create] Task creation warning:", taskErr);
    }

    // Step H: Dispatch Operations Alert
    await NotificationService.notifyDepartment(
      Department.OPERATIONS,
      `New Booking Confirmed: ${bookingNumber}`,
      `Trip for ${customerDoc.name} (${booking.destination}) is confirmed. Begin hotel & transport coordination.`,
      {
        type: "BOOKING_CONFIRMED",
        link: `/admin/bookings`,
      }
    );

    // Step I: Audit Transition
    await AuditService.logTransition({
      userId: input.userId,
      userEmail: input.userEmail,
      entityType: "Booking",
      entityId: booking._id.toString(),
      fromState: "DRAFT_QUOTE",
      toState: "PENDING_PAYMENT",
      trigger: "CONVERT_QUOTE_TO_BOOKING",
      metadata: {
        bookingNumber,
        quoteId: quote._id.toString(),
        quoteNumber: quote.quoteNumber,
        totalAmount: quote.totalAmount,
      },
    });

    return booking;
  }

  /**
   * 2. RECORD CUSTOMER PAYMENT & ADVANCE BOOKING STATUS
   */
  static async recordCustomerPayment(input: RecordCustomerPaymentInput): Promise<{
    payment: IPayment;
    booking: IBooking;
  }> {
    await connectDB();

    const booking = await BookingModel.findById(input.bookingId);
    if (!booking) throw new Error("Booking not found");

    if (input.amount <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    // Create payment entry
    const payment = await PaymentModel.create({
      booking: booking._id,
      customer: booking.customer,
      amount: input.amount,
      currency: booking.currency || "INR",
      type: input.paymentType,
      method: input.paymentMethod,
      provider: "MANUAL",
      providerPaymentId: input.providerPaymentId || `RCPT-${Date.now()}`,
      status: "SUCCESS",
      paidAt: new Date(),
      notes: input.notes,
      createdBy: new mongoose.Types.ObjectId(input.userId),
    });

    // Update booking financials
    const newPaidAmount = booking.paidAmount + input.amount;
    const newPendingAmount = Math.max(0, booking.totalAmount - newPaidAmount);

    booking.paidAmount = newPaidAmount;
    booking.pendingAmount = newPendingAmount;
    booking.payments.push(payment._id as mongoose.Types.ObjectId);

    // Determine target booking status
    let targetStatus: BookingStatus = booking.status;
    if (newPendingAmount <= 0) {
      targetStatus = "CONFIRMED";
    } else if (newPaidAmount > 0) {
      targetStatus = "PARTIALLY_PAID";
    }

    if (booking.status !== targetStatus) {
      await BookingStateMachine.executeTransition({
        entityId: booking._id.toString(),
        currentState: booking.status,
        targetState: targetStatus,
        trigger: "CUSTOMER_PAYMENT_RECORDED",
        context: {
          userId: input.userId,
          userEmail: input.userEmail,
          reason: `Recorded payment of ₹${input.amount}`,
        },
      });
      booking.status = targetStatus;
      if (targetStatus === "CONFIRMED") {
        booking.confirmedAt = new Date();
      }
    }

    booking.financeStatus = newPendingAmount <= 0 ? "PAID" : "PARTIAL";
    await booking.save();

    // Log Audit Event
    await AuditService.logTransition({
      userId: input.userId,
      userEmail: input.userEmail,
      entityType: "Payment",
      entityId: payment._id.toString(),
      fromState: "INITIATED",
      toState: "SUCCESS",
      trigger: "CUSTOMER_PAYMENT_RECORDED",
      metadata: {
        bookingId: booking._id.toString(),
        bookingNumber: booking.bookingNumber,
        amount: input.amount,
        newPendingAmount,
      },
    });

    return { payment, booking };
  }

  /**
   * 3. GET FULL BOOKING WORKSPACE DETAILS
   */
  static async getBookingDetails(bookingId: string) {
    await connectDB();

    const booking = await BookingModel.findById(bookingId)
      .populate("customer")
      .populate("quote")
      .populate("lead")
      .populate("payments")
      .populate("assignedTo", "name email role")
      .lean();

    if (!booking) throw new Error("Booking not found");
    return booking;
  }

  /**
   * 4. LIST BOOKINGS WITH OPERATIONAL FILTERS
   */
  static async listBookings(params: {
    search?: string;
    status?: string;
    hotelStatus?: string;
    transportStatus?: string;
    financeStatus?: string;
  }) {
    await connectDB();

    const query: Record<string, unknown> = {};

    if (params.status && params.status !== "ALL") {
      query.status = params.status;
    }
    if (params.hotelStatus && params.hotelStatus !== "ALL") {
      query.hotelStatus = params.hotelStatus;
    }
    if (params.transportStatus && params.transportStatus !== "ALL") {
      query.transportStatus = params.transportStatus;
    }
    if (params.financeStatus && params.financeStatus !== "ALL") {
      query.financeStatus = params.financeStatus;
    }

    if (params.search && params.search.trim()) {
      const s = params.search.trim();
      query.$or = [
        { bookingNumber: { $regex: s, $options: "i" } },
        { packageName: { $regex: s, $options: "i" } },
        { destination: { $regex: s, $options: "i" } },
      ];
    }

    const bookings = await BookingModel.find(query)
      .populate("customer", "name phone email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return bookings;
  }

  /**
   * 5. RECALCULATE BOOKING PROFITABILITY
   */
  static async recalculateProfitability(bookingId: string): Promise<IBooking> {
    await connectDB();

    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    const totalHotelCost = (booking.hotelBookings || []).reduce((sum, h) => sum + (h.cost || 0), 0);
    const totalTransportCost = (booking.transportBookings || []).reduce((sum, t) => sum + (t.cost || 0), 0);
    const totalSupplierCost = totalHotelCost + totalTransportCost;

    const grossProfit = booking.totalAmount - totalSupplierCost;
    const profitMarginPercent =
      booking.totalAmount > 0 ? Math.round((grossProfit / booking.totalAmount) * 100) : 0;

    booking.financeSummary.totalRevenue = booking.totalAmount;
    booking.financeSummary.totalSupplierCost = totalSupplierCost;
    booking.financeSummary.grossProfit = grossProfit;
    booking.financeSummary.profitMarginPercent = profitMarginPercent;

    await booking.save();
    return booking;
  }
}
