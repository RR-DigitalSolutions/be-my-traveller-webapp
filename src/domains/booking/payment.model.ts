import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IPayment extends Document {
  booking: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  type: "ADVANCE" | "PARTIAL" | "FINAL" | "REFUND";
  method: "CARD" | "UPI" | "NET_BANKING" | "BANK_TRANSFER" | "CASH" | "CHEQUE";
  provider: "RAZORPAY" | "STRIPE" | "MANUAL";
  providerPaymentId?: string;
  providerOrderId?: string;
  providerSignature?: string;
  status: "INITIATED" | "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";
  paidAt?: Date;
  failureReason?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    type: {
      type: String,
      enum: ["ADVANCE", "PARTIAL", "FINAL", "REFUND"],
      required: true,
    },
    method: {
      type: String,
      enum: ["CARD", "UPI", "NET_BANKING", "BANK_TRANSFER", "CASH", "CHEQUE"],
      required: true,
    },
    provider: {
      type: String,
      enum: ["RAZORPAY", "STRIPE", "MANUAL"],
      required: true,
      default: "MANUAL",
    },
    providerPaymentId: { type: String },
    providerOrderId: { type: String },
    providerSignature: { type: String },
    status: {
      type: String,
      enum: ["INITIATED", "SUCCESS", "FAILED", "PENDING", "REFUNDED"],
      default: "INITIATED",
    },
    paidAt: { type: Date },
    failureReason: { type: String },
    invoiceNumber: { type: String },
    invoiceUrl: { type: String },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, collection: "payments" }
);

PaymentSchema.index({ booking: 1, createdAt: -1 });
PaymentSchema.index({ providerPaymentId: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

export const PaymentModel: Model<IPayment> =
  mongoose.models.Payment ?? mongoose.model<IPayment>("Payment", PaymentSchema);

export default PaymentModel;
