import mongoose, { type Document, type Model, Schema } from "mongoose";

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "PARTIALLY_PAID"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export interface IPassengerDetail {
  name: string;
  dateOfBirth?: Date;
  passportNumber?: string;
  nationality?: string;
  type: "ADULT" | "CHILD" | "INFANT";
}

export interface IBooking extends Document {
  bookingNumber: string;
  quote: mongoose.Types.ObjectId;
  lead?: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;

  packageId?: mongoose.Types.ObjectId;
  packageName: string;
  travelDates: { from: Date; to: Date };
  nights: number;

  travellers: {
    adults: number;
    children: number;
    infants: number;
  };

  passengerDetails: IPassengerDetail[];
  items: Record<string, unknown>[];

  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  currency: string;
  payments: mongoose.Types.ObjectId[];

  status: BookingStatus;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  refundAmount?: number;
  refundStatus?: string;

  internalNotes?: string;
  operationsNotes?: string;
  assignedTo?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const PassengerDetailSchema = new Schema<IPassengerDetail>(
  {
    name: { type: String, required: true },
    dateOfBirth: { type: Date },
    passportNumber: { type: String },
    nationality: { type: String },
    type: { type: String, enum: ["ADULT", "CHILD", "INFANT"], required: true },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, uppercase: true },
    quote: { type: Schema.Types.ObjectId, ref: "Quote", required: true },
    lead: { type: Schema.Types.ObjectId, ref: "Lead" },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    packageId: { type: Schema.Types.ObjectId, ref: "Package" },
    packageName: { type: String, required: true },
    travelDates: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    nights: { type: Number, required: true },

    travellers: {
      adults: { type: Number, required: true },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },

    passengerDetails: { type: [PassengerDetailSchema], default: [] },
    items: [{ type: Schema.Types.Mixed }],

    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    payments: [{ type: Schema.Types.ObjectId, ref: "Payment" }],

    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "PARTIALLY_PAID",
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "REFUNDED",
      ] satisfies BookingStatus[],
      default: "PENDING_PAYMENT",
    },
    confirmedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    refundAmount: { type: Number },
    refundStatus: { type: String },

    internalNotes: { type: String },
    operationsNotes: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "bookings" }
);

BookingSchema.index({ customer: 1, createdAt: -1 });
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ "travelDates.from": 1, status: 1 });

export const BookingModel: Model<IBooking> =
  mongoose.models.Booking ?? mongoose.model<IBooking>("Booking", BookingSchema);

export default BookingModel;
