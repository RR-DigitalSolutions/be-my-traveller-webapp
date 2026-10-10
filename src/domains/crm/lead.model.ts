// ============================================================
// Lead Model
// Every enquiry/form submission enters the system as a Lead.
// The CRM pipeline starts here.
// ============================================================

import mongoose, { type Document, type Model, Schema } from "mongoose";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "CONNECTED"
  | "FOLLOW_UP"
  | "QUALIFIED"
  | "QUOTE_SENT"
  | "NEGOTIATION"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
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
  | "PACKAGE_ENQUIRY"
  | "CAB_RENTAL"
  | "TRANSPORTATION"
  | "HOMEPAGE_WIDGET"
  | "HOTEL_ENQUIRY";

export type LeadType =
  | "HOLIDAY_PACKAGE"
  | "CUSTOM_ITINERARY"
  | "TRANSPORTATION"
  | "HOTEL_STAY"
  | "GENERAL";

export interface ITripDetails {
  tripType?: "ONE_WAY" | "ROUND_TRIP" | "MULTICITY";
  pickupCity?: string;
  dropCity?: string;
  multicityStops?: string[];
  vehicleType?: string;
  pickupDate?: string;
  returnDate?: string;
  pickupTime?: string;
  passengers?: number;
}

export interface ILeadNote {
  _id: mongoose.Types.ObjectId;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ILeadFollowUp {
  _id: mongoose.Types.ObjectId;
  dueAt: Date;
  type: "CALL" | "EMAIL" | "WHATSAPP" | "MEETING";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  note?: string;
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
  outcome?: string;
}

export interface ILeadCommunication {
  _id: mongoose.Types.ObjectId;
  type: "CALL" | "WHATSAPP" | "EMAIL" | "MEETING" | "NOTE" | "STATUS_CHANGE" | "SYSTEM";
  summary: string;
  details?: string;
  outcome?: string;
  durationMinutes?: number;
  performedBy?: mongoose.Types.ObjectId;
  performedByName?: string;
  timestamp: Date;
}

export interface ILeadOwnershipRecord {
  assignedTo?: mongoose.Types.ObjectId;
  assignedBy?: mongoose.Types.ObjectId;
  assignedAt: Date;
  reason?: string;
}

export interface ILead extends Document {
  name: string;
  email: string;
  phone: string;

  destinations: (mongoose.Types.ObjectId | string)[];
  packageId?: mongoose.Types.ObjectId;
  travelDates?: { from?: Date; to?: Date; flexible: boolean };
  duration?: string;
  travellers: { adults: number; children: number; infants: number };
  budget?: { min?: number; max?: number; currency: string };
  hotelCategory?: string;
  themes?: string[];
  specialRequirements?: string;
  leadType?: LeadType;
  tripDetails?: ITripDetails;

  status: LeadStatus;
  lostReason?: string;

  assignedTo?: mongoose.Types.ObjectId;
  assignedBy?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  ownershipHistory: ILeadOwnershipRecord[];

  // SLA Tracking
  slaDueAt?: Date;
  firstContactedAt?: Date;
  slaStatus: "WITHIN_SLA" | "MET" | "BREACHED";

  // Deduplication
  isDuplicate?: boolean;
  primaryLeadId?: mongoose.Types.ObjectId;
  duplicateCount?: number;

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
  communications: ILeadCommunication[];

  customerId?: mongoose.Types.ObjectId;
  quoteIds: mongoose.Types.ObjectId[];
  bookingId?: mongoose.Types.ObjectId;

  convertedAt?: Date;
  convertedBy?: mongoose.Types.ObjectId;

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
    type: { type: String, enum: ["CALL", "EMAIL", "WHATSAPP", "MEETING"], required: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
    note: { type: String },
    completedAt: { type: Date },
    completedBy: { type: Schema.Types.ObjectId, ref: "User" },
    outcome: { type: String },
  },
  { _id: true }
);

const LeadCommunicationSchema = new Schema<ILeadCommunication>(
  {
    type: {
      type: String,
      enum: ["CALL", "WHATSAPP", "EMAIL", "MEETING", "NOTE", "STATUS_CHANGE", "SYSTEM"],
      required: true,
    },
    summary: { type: String, required: true },
    details: { type: String },
    outcome: { type: String },
    durationMinutes: { type: Number },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
    performedByName: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LeadOwnershipSchema = new Schema<ILeadOwnershipRecord>(
  {
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
    assignedAt: { type: Date, default: Date.now },
    reason: { type: String },
  },
  { _id: false }
);

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },

    destinations: [{ type: Schema.Types.Mixed, ref: "Destination" }],
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
    leadType: {
      type: String,
      enum: ["HOLIDAY_PACKAGE", "CUSTOM_ITINERARY", "TRANSPORTATION", "HOTEL_STAY", "GENERAL"],
      default: "HOLIDAY_PACKAGE",
    },
    tripDetails: {
      tripType: { type: String, enum: ["ONE_WAY", "ROUND_TRIP", "MULTICITY"] },
      pickupCity: { type: String },
      dropCity: { type: String },
      multicityStops: [{ type: String }],
      vehicleType: { type: String },
      pickupDate: { type: String },
      returnDate: { type: String },
      pickupTime: { type: String },
      passengers: { type: Number },
    },

    status: {
      type: String,
      enum: [
        "NEW",
        "CONTACTED",
        "CONNECTED",
        "FOLLOW_UP",
        "QUALIFIED",
        "QUOTE_SENT",
        "NEGOTIATION",
        "PAYMENT_PENDING",
        "CONFIRMED",
        "BOOKED",
        "TRAVEL_COMPLETED",
        "LOST",
      ] satisfies LeadStatus[],
      default: "NEW",
    },
    lostReason: { type: String },

    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
    assignedAt: { type: Date },
    ownershipHistory: { type: [LeadOwnershipSchema], default: [] },

    slaDueAt: { type: Date },
    firstContactedAt: { type: Date },
    slaStatus: {
      type: String,
      enum: ["WITHIN_SLA", "MET", "BREACHED"],
      default: "WITHIN_SLA",
    },

    isDuplicate: { type: Boolean, default: false },
    primaryLeadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    duplicateCount: { type: Number, default: 0 },

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
        "CAB_RENTAL",
        "TRANSPORTATION",
        "HOMEPAGE_WIDGET",
        "HOTEL_ENQUIRY",
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
    communications: { type: [LeadCommunicationSchema], default: [] },

    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    quoteIds: [{ type: Schema.Types.ObjectId, ref: "Quote" }],
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },

    convertedAt: { type: Date },
    convertedBy: { type: Schema.Types.ObjectId, ref: "User" },

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
LeadSchema.index({ "followUps.completedAt": 1 });
LeadSchema.index({ slaStatus: 1, slaDueAt: 1 });
LeadSchema.index({ isDuplicate: 1 });

export const LeadModel: Model<ILead> =
  mongoose.models.Lead ?? mongoose.model<ILead>("Lead", LeadSchema);

export default LeadModel;
