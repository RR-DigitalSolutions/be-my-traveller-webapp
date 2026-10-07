// ============================================================
// Migration 003: Operations & Finance Foundation
// Builds compound indexes for Bookings (operational tracking,
// hotel/transport statuses, finance ledgers) and Supplier Payments.
// Non-destructive: Does NOT alter or delete any document data.
// ============================================================

import connectDB from "@/lib/db/mongoose";
import { BookingModel } from "@/domains/booking/booking.model";
import { SupplierPaymentModel } from "@/domains/finance/supplier-payment.model";
import { PaymentModel } from "@/domains/booking/payment.model";

export const migration003 = {
  id: "003_operations_finance_foundation",
  name: "Operations & Finance Foundation Indexes",
  async up(): Promise<void> {
    await connectDB();

    // Ensure compound indexes for Bookings
    await BookingModel.createIndexes();

    // Ensure compound indexes for Supplier Payments
    await SupplierPaymentModel.createIndexes();

    // Ensure compound indexes for Customer Payments
    await PaymentModel.createIndexes();
  },
  async down(): Promise<void> {
    // No-op: Index removal not required for safe rollback
  },
};
