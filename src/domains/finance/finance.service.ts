// ============================================================
// Finance Operations Service
// Enterprise financial controls, supplier disbursements, approvals,
// receivable/payable reconciliation, and booking profitability analysis.
// ============================================================

import mongoose from "mongoose";
import connectDB from "@/lib/db/mongoose";
import { BookingModel, type IBooking } from "@/domains/booking/booking.model";
import {
  SupplierPaymentModel,
  type ISupplierPayment,
  type SupplierPaymentStatus,
} from "./supplier-payment.model";
import { SupplierPaymentStateMachine } from "@/domains/workflow/state-machine";
import { AuditService } from "@/domains/auth/audit.service";
import { TaskService } from "@/domains/tasks/task.service";
import { NotificationService } from "@/domains/notifications/notification.service";
import { Department } from "@/lib/auth/permissions";

export interface RequestSupplierPaymentInput {
  bookingId: string;
  supplierId?: string;
  supplierName: string;
  serviceType: "HOTEL" | "TRANSPORT" | "ACTIVITY" | "OTHER";
  serviceRef?: string;
  amount: number;
  paymentMethod?: "BANK_TRANSFER" | "UPI" | "CHEQUE" | "CASH";
  dueDate?: Date;
  notes?: string;
  userId: string;
  userEmail: string;
}

export interface ApproveSupplierPaymentInput {
  paymentId: string;
  userId: string;
  userEmail: string;
  notes?: string;
}

export interface DisburseSupplierPaymentInput {
  paymentId: string;
  referenceNumber: string;
  paidAt?: Date;
  userId: string;
  userEmail: string;
  notes?: string;
}

export class FinanceOperationsService {
  /**
   * 1. REQUEST SUPPLIER PAYMENT VOUCHER (Creates Payable record)
   */
  static async requestSupplierPayment(input: RequestSupplierPaymentInput): Promise<ISupplierPayment> {
    await connectDB();

    const booking = await BookingModel.findById(input.bookingId);
    if (!booking) throw new Error("Booking not found");

    if (input.amount <= 0) {
      throw new Error("Payable amount must be greater than zero");
    }

    const payable = await SupplierPaymentModel.create({
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      supplierId: input.supplierId ? new mongoose.Types.ObjectId(input.supplierId) : undefined,
      supplierName: input.supplierName,
      serviceType: input.serviceType,
      serviceRef: input.serviceRef,
      amount: input.amount,
      currency: booking.currency || "INR",
      paymentMethod: input.paymentMethod || "BANK_TRANSFER",
      status: "PENDING_APPROVAL",
      dueDate: input.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days default
      notes: input.notes,
      requestedBy: new mongoose.Types.ObjectId(input.userId),
    });

    // Create Finance Task for manager approval
    try {
      await TaskService.createTask({
        title: `Approve Supplier Payment — ₹${input.amount} for ${booking.bookingNumber}`,
        description: `Review and approve vendor payable for ${input.supplierName} (${input.serviceType}) on booking ${booking.bookingNumber}.`,
        department: Department.FINANCE,
        priority: "HIGH",
        dueDate: payable.dueDate,
        type: "SUPPLIER_PAYMENT",
        entityType: "Booking",
        entityId: booking._id.toString(),
        entityRef: booking.bookingNumber,
        assignedBy: input.userId,
      });
    } catch (taskErr) {
      console.warn("[Finance] Task creation warning:", taskErr);
    }

    // Notify Finance Department
    await NotificationService.notifyDepartment(
      Department.FINANCE,
      `Supplier Payable Requested: ₹${input.amount}`,
      `Payable requested for ${input.supplierName} on ${booking.bookingNumber}. Requires manager authorization.`,
      {
        type: "URGENT",
        link: `/admin/finance`,
      }
    );

    // Audit Log
    await AuditService.logTransition({
      userId: input.userId,
      userEmail: input.userEmail,
      entityType: "SupplierPayment",
      entityId: payable._id.toString(),
      fromState: "DRAFT",
      toState: "PENDING_APPROVAL",
      trigger: "SUPPLIER_PAYMENT_REQUESTED",
      metadata: {
        bookingNumber: booking.bookingNumber,
        supplierName: input.supplierName,
        amount: input.amount,
      },
    });

    return payable;
  }

  /**
   * 2. APPROVE SUPPLIER PAYMENT (Financial Control Gate)
   */
  static async approveSupplierPayment(input: ApproveSupplierPaymentInput): Promise<ISupplierPayment> {
    await connectDB();

    const payable = await SupplierPaymentModel.findById(input.paymentId);
    if (!payable) throw new Error("Payable voucher not found");

    await SupplierPaymentStateMachine.executeTransition({
      entityId: payable._id.toString(),
      currentState: payable.status,
      targetState: "APPROVED",
      trigger: "MANAGER_APPROVAL_GRANTED",
      context: {
        userId: input.userId,
        userEmail: input.userEmail,
        reason: input.notes || "Financial approval granted by Finance Manager",
      },
    });

    payable.status = "APPROVED";
    payable.approvedBy = new mongoose.Types.ObjectId(input.userId);
    payable.approvedAt = new Date();
    if (input.notes) payable.notes = (payable.notes ? `${payable.notes}\n` : "") + `Approval note: ${input.notes}`;
    await payable.save();

    return payable;
  }

  /**
   * 3. DISBURSE SUPPLIER PAYMENT (Mark as Paid with Reference)
   */
  static async disburseSupplierPayment(input: DisburseSupplierPaymentInput): Promise<ISupplierPayment> {
    await connectDB();

    const payable = await SupplierPaymentModel.findById(input.paymentId);
    if (!payable) throw new Error("Payable voucher not found");

    await SupplierPaymentStateMachine.executeTransition({
      entityId: payable._id.toString(),
      currentState: payable.status,
      targetState: "PAID",
      trigger: "DISBURSEMENT_EXECUTED",
      context: {
        userId: input.userId,
        userEmail: input.userEmail,
        reason: `Disbursed via Ref: ${input.referenceNumber}`,
      },
    });

    payable.status = "PAID";
    payable.paidAt = input.paidAt || new Date();
    payable.referenceNumber = input.referenceNumber;
    if (input.notes) payable.notes = (payable.notes ? `${payable.notes}\n` : "") + `Disbursement: ${input.notes}`;
    await payable.save();

    // Update booking supplier payment status
    const allPayables = await SupplierPaymentModel.find({ bookingId: payable.bookingId });
    const allPaid = allPayables.length > 0 && allPayables.every((p) => p.status === "PAID");
    const anyPaid = allPayables.some((p) => p.status === "PAID");

    const booking = await BookingModel.findById(payable.bookingId);
    if (booking) {
      booking.financeSummary.supplierPaymentStatus = allPaid
        ? "FULLY_PAID"
        : anyPaid
        ? "PARTIALLY_PAID"
        : "UNPAID";
      await booking.save();
    }

    return payable;
  }

  /**
   * 4. GET SYSTEM-WIDE FINANCIAL OVERVIEW & CONTROLS METRICS
   */
  static async getFinancialOverview() {
    await connectDB();

    const allBookings = await BookingModel.find().lean();
    const allPayables = await SupplierPaymentModel.find().sort({ createdAt: -1 }).lean();

    let totalRevenue = 0;
    let totalCustomerReceived = 0;
    let totalCustomerReceivable = 0;
    let totalSupplierCostEstimated = 0;

    allBookings.forEach((b) => {
      totalRevenue += b.totalAmount || 0;
      totalCustomerReceived += b.paidAmount || 0;
      totalCustomerReceivable += b.pendingAmount || 0;
      totalSupplierCostEstimated += b.financeSummary?.totalSupplierCost || 0;
    });

    let totalSupplierPaid = 0;
    let totalSupplierPending = 0;

    allPayables.forEach((p) => {
      if (p.status === "PAID") {
        totalSupplierPaid += p.amount || 0;
      } else if (p.status === "APPROVED" || p.status === "PENDING_APPROVAL") {
        totalSupplierPending += p.amount || 0;
      }
    });

    const totalGrossProfit = totalRevenue - totalSupplierCostEstimated;
    const overallMarginPercent =
      totalRevenue > 0 ? Math.round((totalGrossProfit / totalRevenue) * 100) : 0;

    const pendingApprovals = allPayables.filter((p) => p.status === "PENDING_APPROVAL");
    const approvedAwaitingDisbursement = allPayables.filter((p) => p.status === "APPROVED");

    return {
      metrics: {
        totalRevenue,
        totalCustomerReceived,
        totalCustomerReceivable,
        totalSupplierCostEstimated,
        totalSupplierPaid,
        totalSupplierPending,
        totalGrossProfit,
        overallMarginPercent,
        pendingApprovalsCount: pendingApprovals.length,
        readyToDisburseCount: approvedAwaitingDisbursement.length,
      },
      pendingApprovals,
      approvedAwaitingDisbursement,
      recentPayables: allPayables.slice(0, 20),
    };
  }
}
