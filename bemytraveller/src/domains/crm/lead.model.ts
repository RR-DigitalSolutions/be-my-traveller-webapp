// ============================================================
// Lead Model
// Every enquiry/form submission enters the system as a Lead.
// The CRM pipeline starts here.
// ============================================================

import mongoose, { type Document, type Model, Schema } from "mongoose";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "QUOTE_SENT"
  | "NEGOTIATION"
  | "PAYMENT_PENDING"
  | "BOOKED"
  | "TRAVEL_COMPLETED"
  | "LOST";

export type LeadSource =
  | "ORGANIC"
  | "PAID"
  | "SOCIAL"
  | "REFERRAL"
  | "DIRECT"
  | "WHATSAPP"
  | "PHONE"
  | "CUSTOM_TRIP_FORM"
  | "PACKAGE_ENQUIRY";

export interface ILeadNote {
  _id: mongoose.Types.ObjectId;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ILeadFollowUp {
  _id: mongoose.Types.ObjectId;
  dueAt: Date;
  type: "CALL" | "EMAIL" | "WHATSAPP";
  note?: string;
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
}

export interface ILead extends Document {
  name: string;
  email: string;
  phone: string;

  destinations: mongoose.Types.ObjectId[];
  packageId?: mongoose.Types.ObjectId;
  travelDates?: { from?: Date; to?: Date; flexible: boolean };
  duration?: string;
  travellers: { adults: number; children: number; infants: number };
  budget?: { min?: number; max?: number; currency: string };
  hotelCategory?: string;
  themes?: string[];
  specialRequirements?: string;

  status: LeadStatus;
  lostReason?: string;

  assignedTo?: mongoose.Types.ObjectId;
  assignedAt?: Date;

  source: LeadSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPage?: string;
  referrer?: string;
  device?: "MOBILE" | "TABLET" | "DESKTOP";

  notes: ILeadNote[];
  followUps: ILeadFollowUp[];

  customerId?: mongoose.Types.ObjectId;
  quoteIds: mongoose.Types.ObjectId[];
  bookingId?: mongoose.Types.ObjectId;

  leadScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeadNoteSchema = new Schema<ILeadNote>(
  {
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LeadFollowUpSchema = new Schema<ILeadFollowUp>(
  {
    dueAt: { type: Date, required: true },
    type: { type: String, enum: ["CALL", "EMAIL", "WHATSAPP"], required: true },
    note: { type: String },
    completedAt: { type: Date },
    completedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: true }
);

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },

    destinations: [{ type: Schema.Types.ObjectId, ref: "Destination" }],
    packageId: { type: Schema.Types.ObjectId, ref: "Package" },
    travelDates: {
      from: { type: Date },
      to: { type: Date },
      flexible: { type: Boolean, default: false },
    },
    duration: { type: String },
    travellers: {
      adults: { type: Number, required: true, default: 2, min: 1 },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },
    budget: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "INR" },
    },
    hotelCategory: { type: String },
    themes: [{ type: String }],
    specialRequirements: { type: String },

    status: {
      type: String,
      enum: [
        "NEW",
        "CONTACTED",
        "QUALIFIED",
        "QUOTE_SENT",
        "NEGOTIATION",
        "PAYMENT_PENDING",
        "BOOKED",
        "TRAVEL_COMPLETED",
        "LOST",
      ] satisfies LeadStatus[],
      default: "NEW",
    },
    lostReason: { type: String },

    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    assignedAt: { type: Date },

    source: {
      type: String,
      enum: [
        "ORGANIC",
        "PAID",
        "SOCIAL",
        "REFERRAL",
        "DIRECT",
        "WHATSAPP",
        "PHONE",
        "CUSTOM_TRIP_FORM",
        "PACKAGE_ENQUIRY",
      ] satisfies LeadSource[],
      required: true,
      default: "DIRECT",
    },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    utmContent: { type: String },
    utmTerm: { type: String },
    landingPage: { type: String },
    referrer: { type: String },
    device: { type: String, enum: ["MOBILE", "TABLET", "DESKTOP"] },

    notes: { type: [LeadNoteSchema], default: [] },
    followUps: { type: [LeadFollowUpSchema], default: [] },

    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    quoteIds: [{ type: Schema.Types.ObjectId, ref: "Quote" }],
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },

    leadScore: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true, collection: "leads" }
);

LeadSchema.index({ email: 1 });
LeadSchema.index({ phone: 1 });
LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ assignedTo: 1, status: 1 });
LeadSchema.index({ packageId: 1 });
LeadSchema.index({ source: 1, createdAt: -1 });
LeadSchema.index({ utmCampaign: 1 });
LeadSchema.index({ "followUps.dueAt": 1 });

export const LeadModel: Model<ILead> =
  mongoose.models.Lead ?? mongoose.model<ILead>("Lead", LeadSchema);

export default LeadModel;
