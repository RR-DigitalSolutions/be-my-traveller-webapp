import mongoose, { type Document, type Model, Schema } from "mongoose";

export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED";

export interface IQuoteItem {
  _id: mongoose.Types.ObjectId;
  type: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  isIncluded: boolean;
  referenceId?: mongoose.Types.ObjectId;
}

export interface IQuote extends Document {
  quoteNumber: string;
  version: number;
  lead: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;

  packageId?: mongoose.Types.ObjectId;
  packageName: string;
  packageSlug?: string;
  destinations: string[];

  travelDates: {
    from: Date;
    to: Date;
  };
  nights: number;
  days: number;

  travellers: {
    adults: number;
    children: number;
    infants: number;
  };

  items: IQuoteItem[];

  subtotal: number;
  discount: number;
  couponCode?: string;
  couponDiscount?: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;

  hotelConfig: {
    hotelId?: mongoose.Types.ObjectId;
    hotelName: string;
    category: string;
    roomType: string;
    mealPlan: string;
  }[];

  validUntil: Date;
  status: QuoteStatus;
  sentAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;

  termsSnapshot?: string;
  cancellationPolicySnapshot?: string;
  internalNotes?: string;
  customerNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const QuoteItemSchema = new Schema<IQuoteItem>(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    isIncluded: { type: Boolean, default: false },
    referenceId: { type: Schema.Types.ObjectId },
  },
  { _id: true }
);

const QuoteSchema = new Schema<IQuote>(
  {
    quoteNumber: { type: String, required: true, unique: true, uppercase: true },
    version: { type: Number, default: 1 },
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    packageId: { type: Schema.Types.ObjectId, ref: "Package" },
    packageName: { type: String, required: true },
    packageSlug: { type: String },
    destinations: [{ type: String }],

    travelDates: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    nights: { type: Number, required: true },
    days: { type: Number, required: true },

    travellers: {
      adults: { type: Number, required: true },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },

    items: { type: [QuoteItemSchema], default: [] },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    hotelConfig: [
      {
        hotelId: { type: Schema.Types.ObjectId, ref: "Hotel" },
        hotelName: { type: String, required: true },
        category: { type: String, required: true },
        roomType: { type: String, required: true },
        mealPlan: { type: String, required: true },
      },
    ],

    validUntil: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SENT",
        "VIEWED",
        "ACCEPTED",
        "REJECTED",
        "EXPIRED",
        "CONVERTED",
      ] satisfies QuoteStatus[],
      default: "DRAFT",
    },
    sentAt: { type: Date },
    viewedAt: { type: Date },
    acceptedAt: { type: Date },

    termsSnapshot: { type: String },
    cancellationPolicySnapshot: { type: String },
    internalNotes: { type: String },
    customerNotes: { type: String },
  },
  { timestamps: true, collection: "quotes" }
);

QuoteSchema.index({ quoteNumber: 1 }, { unique: true });
QuoteSchema.index({ lead: 1, createdAt: -1 });
QuoteSchema.index({ status: 1, createdAt: -1 });
QuoteSchema.index({ createdBy: 1, status: 1 });
QuoteSchema.index({ validUntil: 1, status: 1 });

export const QuoteModel: Model<IQuote> =
  mongoose.models.Quote ?? mongoose.model<IQuote>("Quote", QuoteSchema);

export default QuoteModel;
