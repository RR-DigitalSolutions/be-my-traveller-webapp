// ============================================================
// Finance — Supplier Payment Model
// Enterprise ledger for tracking payables to hotels, transport
// vendors, and activity providers with approval workflows.
// ============================================================

import mongoose, { type Document, type Model, Schema } from "mongoose";

export type SupplierPaymentStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PAID"
  | "REJECTED";

export interface ISupplierPayment extends Document {
  bookingId: mongoose.Types.ObjectId;
  bookingNumber: string;
  supplierId?: mongoose.Types.ObjectId;
  supplierName: string;
  serviceType: "HOTEL" | "TRANSPORT" | "ACTIVITY" | "OTHER";
  serviceRef?: string;
  amount: number;
  currency: string;
  paymentMethod: "BANK_TRANSFER" | "UPI" | "CHEQUE" | "CASH";
  referenceNumber?: string;
  status: SupplierPaymentStatus;
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  paidAt?: Date;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierPaymentSchema = new Schema<ISupplierPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    bookingNumber: { type: String, required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },
    supplierName: { type: String, required: true },
    serviceType: {
      type: String,
      enum: ["HOTEL", "TRANSPORT", "ACTIVITY", "OTHER"],
      required: true,
    },
    serviceRef: { type: String },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    paymentMethod: {
      type: String,
      enum: ["BANK_TRANSFER", "UPI", "CHEQUE", "CASH"],
      default: "BANK_TRANSFER",
    },
    referenceNumber: { type: String },
    status: {
      type: String,
      enum: ["PENDING_APPROVAL", "APPROVED", "PAID", "REJECTED"],
      default: "PENDING_APPROVAL",
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    paidAt: { type: Date },
    dueDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true, collection: "supplier_payments" }
);

SupplierPaymentSchema.index({ bookingId: 1 });
SupplierPaymentSchema.index({ status: 1 });
SupplierPaymentSchema.index({ supplierId: 1 });
SupplierPaymentSchema.index({ createdAt: -1 });

export const SupplierPaymentModel: Model<ISupplierPayment> =
  mongoose.models.SupplierPayment ??
  mongoose.model<ISupplierPayment>("SupplierPayment", SupplierPaymentSchema);

export default SupplierPaymentModel;
