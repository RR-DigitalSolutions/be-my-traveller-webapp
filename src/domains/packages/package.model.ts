// ============================================================
// Package Model
// Core travel product. References hotels, activities, transfers.
// Contains the full itinerary as embedded sub-documents.
// ============================================================

import mongoose, { type Document, type Model, Schema } from "mongoose";
import {
  SeoMetadataSchema,
  FaqItemSchema,
  type ISeoMetadata,
  type IFaqItem,
} from "@/lib/db/sub-schemas";
import type { PublishStatus } from "@/domains/destinations/destination.model";

export type PackageTheme =
  | "ADVENTURE"
  | "HONEYMOON"
  | "FAMILY"
  | "GROUP"
  | "SOLO"
  | "WILDLIFE"
  | "PILGRIMAGE"
  | "BEACH"
  | "CULTURAL"
  | "LUXURY"
  | "HILL_STATION"
  | "BACKPACKING";

export type TravelType = "FIXED" | "CUSTOMIZABLE" | "CUSTOM_ONLY";

export type PackageAudience =
  | "FAMILIES"
  | "COUPLES"
  | "SOLO"
  | "GROUPS"
  | "SENIORS"
  | "BUDGET"
  | "LUXURY";

// ── Itinerary Day (embedded) ─────────────────────────────────

export interface IItineraryDay {
  _id: mongoose.Types.ObjectId;
  day: number;
  title: string;
  description?: Record<string, unknown>; // Tiptap JSON
  location?: mongoose.Types.ObjectId;
  hotel?: mongoose.Types.ObjectId;
  hotelRoomType?: string;
  mealPlan?: mongoose.Types.ObjectId;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  activities: mongoose.Types.ObjectId[];
  transfers: {
    transfer: mongoose.Types.ObjectId;
    notes?: string;
  }[];
  distance?: number;
  images: mongoose.Types.ObjectId[];
  notes?: string;
}

const ItineraryDaySchema = new Schema<IItineraryDay>(
  {
    day: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: Schema.Types.Mixed },
    location: { type: Schema.Types.ObjectId, ref: "Destination" },
    hotel: { type: Schema.Types.ObjectId, ref: "Hotel" },
    hotelRoomType: { type: String },
    mealPlan: { type: Schema.Types.ObjectId, ref: "MealPlan" },
    meals: {
      breakfast: { type: Boolean, default: false },
      lunch: { type: Boolean, default: false },
      dinner: { type: Boolean, default: false },
    },
    activities: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
    transfers: [
      {
        transfer: { type: Schema.Types.ObjectId, ref: "Transfer", required: true },
        notes: { type: String },
      },
    ],
    distance: { type: Number },
    images: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    notes: { type: String },
  },
  { _id: true }
);

// ── Seasonal Hike Period (embedded) ─────────────────────────

export interface ISeasonalHikePeriod {
  id?: string;
  title: string;
  startDate: string;
  endDate: string;
  hikeType: "PERCENTAGE" | "FIXED_AMOUNT";
  hikeValue: number;
  validityNote?: string;
}

const SeasonalHikePeriodSchema = new Schema<ISeasonalHikePeriod>(
  {
    id: { type: String },
    title: { type: String, required: true, trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    hikeType: { type: String, enum: ["PERCENTAGE", "FIXED_AMOUNT"], required: true },
    hikeValue: { type: Number, required: true },
    validityNote: { type: String },
  },
  { _id: true }
);

// ── Package ──────────────────────────────────────────────────

export interface IPackage extends Document {
  slug: string;
  version: number;

  name: string;
  tagline?: string;
  shortDescription: string;
  longDescription?: Record<string, unknown>;

  primaryDestination: mongoose.Types.ObjectId;
  destinations: mongoose.Types.ObjectId[];
  theme: PackageTheme[];
  travelType: TravelType;
  audience: PackageAudience[];
  difficulty?: "EASY" | "MODERATE" | "CHALLENGING";

  nights: number;
  days: number;
  startCity?: mongoose.Types.ObjectId;
  endCity?: mongoose.Types.ObjectId;

  // Embedded itinerary
  itinerary: IItineraryDay[];

  // Pricing reference
  startingPrice: number;
  startingPriceCurrency: string;
  pricingRuleId?: mongoose.Types.ObjectId;

  inclusions: string[];
  exclusions: string[];

  cancellationPolicy?: Record<string, unknown>;
  termsAndConditions?: Record<string, unknown>;

  coverImage?: mongoose.Types.ObjectId;
  gallery: mongoose.Types.ObjectId[];
  bannerImage?: mongoose.Types.ObjectId;

  highlights: string[];

  hotelTiers?: {
    standard: { title: string; pricePerAdult: number; desc: string };
    deluxe: { title: string; pricePerAdult: number; desc: string };
    luxury: { title: string; pricePerAdult: number; desc: string };
  };

  seasonalHike?: {
    enabled: boolean;
    seasonType: string;
    hikeType: "PERCENTAGE" | "FIXED_AMOUNT";
    hikeValue: number;
    seasonLabel: string;
    validityNote?: string;
  };
  seasonalHikes?: ISeasonalHikePeriod[];

  discountPercent?: number;
  discountBadge?: string;
  originalPrice?: number;

  seo: ISeoMetadata;
  faqs: IFaqItem[];

  status: PublishStatus;
  publishedAt?: Date;
  isIndexable: boolean;
  scheduledPublishAt?: Date;

  averageRating?: number;
  reviewCount: number;

  relatedPackages: mongoose.Types.ObjectId[];

  minGroupSize?: number;
  maxGroupSize?: number;
  availableFrom?: Date;
  availableTo?: Date;

  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  publishedBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"],
    },
    version: { type: Number, default: 1 },

    name: { type: String, required: true, trim: true, maxlength: 200 },
    tagline: { type: String, maxlength: 300 },
    shortDescription: { type: String, required: true, maxlength: 600 },
    longDescription: { type: Schema.Types.Mixed },

    primaryDestination: {
      type: Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    destinations: [{ type: Schema.Types.ObjectId, ref: "Destination" }],
    theme: [
      {
        type: String,
        enum: [
          "ADVENTURE",
          "HONEYMOON",
          "FAMILY",
          "GROUP",
          "SOLO",
          "WILDLIFE",
          "PILGRIMAGE",
          "BEACH",
          "CULTURAL",
          "LUXURY",
          "HILL_STATION",
          "BACKPACKING",
        ] satisfies PackageTheme[],
      },
    ],
    travelType: {
      type: String,
      enum: ["FIXED", "CUSTOMIZABLE", "CUSTOM_ONLY"] satisfies TravelType[],
      required: true,
      default: "FIXED",
    },
    audience: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["EASY", "MODERATE", "CHALLENGING"],
    },

    nights: { type: Number, required: true, min: 0 },
    days: { type: Number, required: true, min: 1 },
    startCity: { type: Schema.Types.ObjectId, ref: "Destination" },
    endCity: { type: Schema.Types.ObjectId, ref: "Destination" },

    itinerary: { type: [ItineraryDaySchema], default: [] },

    startingPrice: { type: Number, required: true, min: 0 },
    startingPriceCurrency: { type: String, default: "INR" },
    pricingRuleId: { type: Schema.Types.ObjectId, ref: "PricingRule" },

    inclusions: [{ type: String }],
    exclusions: [{ type: String }],

    cancellationPolicy: { type: Schema.Types.Mixed },
    termsAndConditions: { type: Schema.Types.Mixed },

    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    bannerImage: { type: Schema.Types.ObjectId, ref: "Media" },

    highlights: [{ type: String }],

    hotelTiers: { type: Schema.Types.Mixed },
    seasonalHike: { type: Schema.Types.Mixed },
    seasonalHikes: { type: [SeasonalHikePeriodSchema], default: [] },
    discountPercent: { type: Number, default: 0 },
    discountBadge: { type: String },
    originalPrice: { type: Number },

    seo: { type: SeoMetadataSchema, default: () => ({}) },
    faqs: { type: [FaqItemSchema], default: [] },

    status: {
      type: String,
      enum: ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
    },
    publishedAt: { type: Date },
    isIndexable: { type: Boolean, default: true },
    scheduledPublishAt: { type: Date },

    averageRating: { type: Number, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    relatedPackages: [{ type: Schema.Types.ObjectId, ref: "Package" }],

    minGroupSize: { type: Number },
    maxGroupSize: { type: Number },
    availableFrom: { type: Date },
    availableTo: { type: Date },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    collection: "packages",
  }
);

// ── Indexes ──────────────────────────────────────────────────
PackageSchema.index({ primaryDestination: 1, status: 1 });
PackageSchema.index({ destinations: 1, status: 1 });
PackageSchema.index({ theme: 1, status: 1 });
PackageSchema.index({ travelType: 1, status: 1 });
PackageSchema.index({ status: 1, publishedAt: -1 });
PackageSchema.index({ status: 1, startingPrice: 1 });
PackageSchema.index({ status: 1, nights: 1 });
PackageSchema.index(
  { name: "text", tagline: "text", shortDescription: "text" },
  { name: "package_text_search" }
);

// ── Pre-save: auto-increment version on every save ───────────
PackageSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.version = (this.version ?? 1) + 1;
  }
  next();
});

export const PackageModel: Model<IPackage> =
  mongoose.models.Package ??
  mongoose.model<IPackage>("Package", PackageSchema);

export default PackageModel;
