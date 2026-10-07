import mongoose, { type Document, type Model, Schema } from "mongoose";

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "PARTIALLY_PAID"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type HotelOpStatus = "PENDING" | "CONFIRMED" | "VOUCHER_ISSUED";
export type TransportOpStatus = "PENDING" | "ASSIGNED" | "DISPATCHED" | "COMPLETED";
export type VoucherOpStatus = "PENDING" | "GENERATED" | "SENT";
export type FinanceOpStatus = "UNPAID" | "PARTIAL" | "PAID" | "RECONCILED";

export interface IPassengerDetail {
  name: string;
  dateOfBirth?: Date;
  passportNumber?: string;
  nationality?: string;
  type: "ADULT" | "CHILD" | "INFANT";
}

export interface IHotelBookingItem {
  _id?: mongoose.Types.ObjectId;
  hotelId?: mongoose.Types.ObjectId;
  hotelName: string;
  destination?: string;
  roomType: string;
  mealPlan: string;
  checkIn: Date;
  checkOut: Date;
  roomsCount: number;
  supplierId?: mongoose.Types.ObjectId;
  supplierName?: string;
  confirmationNumber?: string;
  voucherCode?: string;
  cost: number;
  status: "REQUESTED" | "CONFIRMED" | "VOUCHERED" | "CANCELLED";
  notes?: string;
}

export interface ITransportBookingItem {
  _id?: mongoose.Types.ObjectId;
  transferId?: mongoose.Types.ObjectId;
  serviceName: string;
  vehicleType: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  pickupLocation: string;
  dropLocation: string;
  pickupTime: Date;
  supplierId?: mongoose.Types.ObjectId;
  supplierName?: string;
  cost: number;
  status: "UNASSIGNED" | "ASSIGNED" | "DISPATCHED" | "COMPLETED";
  notes?: string;
}

export interface IVoucherItem {
  _id?: mongoose.Types.ObjectId;
  voucherNumber: string;
  type: "HOTEL" | "TRANSPORT" | "COMBINED_TRIP";
  issuedAt: Date;
  issuedBy?: mongoose.Types.ObjectId;
  status: "ISSUED" | "SENT" | "CANCELLED";
  contentSummary?: string;
}

export interface IFinanceSummary {
  totalRevenue: number;
  totalSupplierCost: number;
  grossProfit: number;
  profitMarginPercent: number;
  supplierPaymentStatus: "UNPAID" | "PARTIALLY_PAID" | "FULLY_PAID";
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
}

export interface IBooking extends Document {
  bookingNumber: string;
  quote?: mongoose.Types.ObjectId;
  lead?: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;

  packageId?: mongoose.Types.ObjectId;
  packageName: string;
  destination?: string;
  travelDates: { from: Date; to: Date };
  nights: number;

  travellers: {
    adults: number;
    children: number;
    infants: number;
  };

  passengerDetails: IPassengerDetail[];
  items: Record<string, unknown>[];

  // Financials - Customer side
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  currency: string;
  payments: mongoose.Types.ObjectId[];

  // Operations Tracking
  hotelStatus: HotelOpStatus;
  transportStatus: TransportOpStatus;
  voucherStatus: VoucherOpStatus;
  financeStatus: FinanceOpStatus;

  hotelBookings: IHotelBookingItem[];
  transportBookings: ITransportBookingItem[];
  vouchers: IVoucherItem[];
  financeSummary: IFinanceSummary;

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

const HotelBookingItemSchema = new Schema<IHotelBookingItem>(
  {
    hotelId: { type: Schema.Types.ObjectId, ref: "Hotel" },
    hotelName: { type: String, required: true },
    destination: { type: String },
    roomType: { type: String, required: true, default: "Standard Deluxe" },
    mealPlan: { type: String, required: true, default: "Breakfast Included" },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    roomsCount: { type: Number, required: true, default: 1 },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },
    supplierName: { type: String },
    confirmationNumber: { type: String },
    voucherCode: { type: String },
    cost: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["REQUESTED", "CONFIRMED", "VOUCHERED", "CANCELLED"],
      default: "REQUESTED",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const TransportBookingItemSchema = new Schema<ITransportBookingItem>(
  {
    transferId: { type: Schema.Types.ObjectId, ref: "Transfer" },
    serviceName: { type: String, required: true },
    vehicleType: { type: String, required: true, default: "Sedan" },
    vehicleNumber: { type: String },
    driverName: { type: String },
    driverPhone: { type: String },
    pickupLocation: { type: String, required: true },
    dropLocation: { type: String, required: true },
    pickupTime: { type: Date, required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },
    supplierName: { type: String },
    cost: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["UNASSIGNED", "ASSIGNED", "DISPATCHED", "COMPLETED"],
      default: "UNASSIGNED",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const VoucherItemSchema = new Schema<IVoucherItem>(
  {
    voucherNumber: { type: String, required: true },
    type: {
      type: String,
      enum: ["HOTEL", "TRANSPORT", "COMBINED_TRIP"],
      required: true,
      default: "COMBINED_TRIP",
    },
    issuedAt: { type: Date, default: Date.now },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["ISSUED", "SENT", "CANCELLED"],
      default: "ISSUED",
    },
    contentSummary: { type: String },
  },
  { timestamps: true }
);

const FinanceSummarySchema = new Schema<IFinanceSummary>(
  {
    totalRevenue: { type: Number, required: true, default: 0 },
    totalSupplierCost: { type: Number, required: true, default: 0 },
    grossProfit: { type: Number, required: true, default: 0 },
    profitMarginPercent: { type: Number, required: true, default: 0 },
    supplierPaymentStatus: {
      type: String,
      enum: ["UNPAID", "PARTIALLY_PAID", "FULLY_PAID"],
      default: "UNPAID",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, uppercase: true },
    quote: { type: Schema.Types.ObjectId, ref: "Quote" },
    lead: { type: Schema.Types.ObjectId, ref: "Lead" },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    packageId: { type: Schema.Types.ObjectId, ref: "Package" },
    packageName: { type: String, required: true },
    destination: { type: String },
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

    hotelStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "VOUCHER_ISSUED"],
      default: "PENDING",
    },
    transportStatus: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "DISPATCHED", "COMPLETED"],
      default: "PENDING",
    },
    voucherStatus: {
      type: String,
      enum: ["PENDING", "GENERATED", "SENT"],
      default: "PENDING",
    },
    financeStatus: {
      type: String,
      enum: ["UNPAID", "PARTIAL", "PAID", "RECONCILED"],
      default: "UNPAID",
    },

    hotelBookings: { type: [HotelBookingItemSchema], default: [] },
    transportBookings: { type: [TransportBookingItemSchema], default: [] },
    vouchers: { type: [VoucherItemSchema], default: [] },
    financeSummary: {
      type: FinanceSummarySchema,
      default: () => ({
        totalRevenue: 0,
        totalSupplierCost: 0,
        grossProfit: 0,
        profitMarginPercent: 0,
        supplierPaymentStatus: "UNPAID",
      }),
    },

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
BookingSchema.index({ hotelStatus: 1 });
BookingSchema.index({ transportStatus: 1 });
BookingSchema.index({ voucherStatus: 1 });
BookingSchema.index({ "financeSummary.supplierPaymentStatus": 1 });

export const BookingModel: Model<IBooking> =
  mongoose.models.Booking ?? mongoose.model<IBooking>("Booking", BookingSchema);

export default BookingModel;
