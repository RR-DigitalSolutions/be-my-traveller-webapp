// ============================================================
// Destination Model
// Every geographic entity — country, state, city, area.
// Self-referential hierarchy via parent + ancestors[].
// ============================================================

import mongoose, { type Document, type Model, Schema } from "mongoose";
import {
  SeoMetadataSchema,
  FaqItemSchema,
  CoordinatesSchema,
  type ISeoMetadata,
  type IFaqItem,
  type ICoordinates,
} from "@/lib/db/sub-schemas";

export type DestinationType = "COUNTRY" | "STATE" | "CITY" | "AREA" | "ISLAND";
export type PublishStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED";

export interface IDestination extends Document {
  slug: string;
  name: string;
  type: DestinationType;
  parent?: mongoose.Types.ObjectId;
  ancestors: mongoose.Types.ObjectId[];
  countryCode?: string;
  coordinates?: ICoordinates;
  timezone?: string;

  // Geographic Hierarchy
  countryId?: mongoose.Types.ObjectId;
  countrySlug?: string;
  countryName?: string;
  stateId?: mongoose.Types.ObjectId;
  stateSlug?: string;
  stateName?: string;
  region?: string; // e.g. "North India", "South India", "Asia & Middle East", "Europe", etc.
  displayOrder: number;
  startingPrice?: string;

  // Content
  tagline?: string;
  shortDescription: string;
  longDescription?: Record<string, unknown>; // Tiptap JSON
  highlights: string[];
  bestTimeToVisit?: {
    summary: string;
    months: string[];
  };
  weather?: { summer?: string; winter?: string; monsoon?: string };
  howToReach?: Record<string, unknown>;
  travelTips?: Record<string, unknown>;
  food?: Record<string, unknown>;
  culture?: Record<string, unknown>;
  safety?: Record<string, unknown>;
  quickFacts?: Record<string, unknown>;

  // Media
  coverImage?: mongoose.Types.ObjectId;
  coverImageStr?: string;
  gallery: mongoose.Types.ObjectId[];

  // Relationships
  attractions: mongoose.Types.ObjectId[];
  featuredActivities: mongoose.Types.ObjectId[];

  // SEO
  seo: ISeoMetadata;
  faqs: IFaqItem[];

  // Publishing
  status: PublishStatus;
  publishedAt?: Date;
  isIndexable: boolean;

  // Display
  sortOrder: number;
  isFeatured: boolean;

  // Audit
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DestinationSchema = new Schema<IDestination>(
  {
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"],
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    type: {
      type: String,
      required: true,
      enum: ["COUNTRY", "STATE", "CITY", "AREA", "ISLAND"] satisfies DestinationType[],
    },
    parent: { type: Schema.Types.ObjectId, ref: "Destination" },
    ancestors: [{ type: Schema.Types.ObjectId, ref: "Destination" }],
    countryCode: { type: String, maxlength: 2, uppercase: true },
    coordinates: { type: CoordinatesSchema },
    timezone: { type: String },

    // Hierarchy References
    countryId: { type: Schema.Types.ObjectId, ref: "Destination" },
    countrySlug: { type: String, lowercase: true, trim: true },
    countryName: { type: String, trim: true },
    stateId: { type: Schema.Types.ObjectId, ref: "Destination" },
    stateSlug: { type: String, lowercase: true, trim: true },
    stateName: { type: String, trim: true },
    region: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
    startingPrice: { type: String, default: "₹14,999" },

    tagline: { type: String, maxlength: 200 },
    shortDescription: { type: String, required: true, maxlength: 500 },
    longDescription: { type: Schema.Types.Mixed },
    highlights: [{ type: String }],
    bestTimeToVisit: {
      summary: { type: String },
      months: [{ type: String }],
    },
    weather: {
      summer: { type: String },
      winter: { type: String },
      monsoon: { type: String },
    },
    howToReach: { type: Schema.Types.Mixed },
    travelTips: { type: Schema.Types.Mixed },
    food: { type: Schema.Types.Mixed },
    culture: { type: Schema.Types.Mixed },
    safety: { type: Schema.Types.Mixed },
    quickFacts: { type: Schema.Types.Mixed },

    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    coverImageStr: { type: String },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Media" }],

    attractions: [{ type: Schema.Types.ObjectId, ref: "Attraction" }],
    featuredActivities: [{ type: Schema.Types.ObjectId, ref: "Activity" }],

    seo: { type: SeoMetadataSchema, default: () => ({}) },
    faqs: { type: [FaqItemSchema], default: [] },

    status: {
      type: String,
      enum: ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"] satisfies PublishStatus[],
      default: "DRAFT",
    },
    publishedAt: { type: Date },
    isIndexable: { type: Boolean, default: true },

    sortOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    collection: "destinations",
  }
);

// ── Indexes ──────────────────────────────────────────────────
DestinationSchema.index({ parent: 1 });
DestinationSchema.index({ type: 1, status: 1 });
DestinationSchema.index({ ancestors: 1 });
DestinationSchema.index({ status: 1, isFeatured: -1, sortOrder: 1 });
DestinationSchema.index(
  { name: "text", tagline: "text", shortDescription: "text" },
  { name: "destination_text_search" }
);

export const DestinationModel: Model<IDestination> =
  mongoose.models.Destination ??
  mongoose.model<IDestination>("Destination", DestinationSchema);

export default DestinationModel;
