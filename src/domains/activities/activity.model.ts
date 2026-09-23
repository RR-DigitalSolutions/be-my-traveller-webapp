import mongoose, { type Document, type Model, Schema } from "mongoose";
import { SeoMetadataSchema, CoordinatesSchema, type ISeoMetadata } from "@/lib/db/sub-schemas";

export interface IActivity extends Document {
  slug: string;
  name: string;
  destinations: mongoose.Types.ObjectId[];
  category: "ADVENTURE" | "CULTURAL" | "NATURE" | "WELLNESS" | "CULINARY" | "SIGHTSEEING" | "WATER_SPORTS";
  shortDescription: string;
  longDescription?: Record<string, unknown>;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  duration: string;
  difficulty?: "EASY" | "MODERATE" | "CHALLENGING" | "EXPERT";
  minAge?: number;
  maxGroupSize?: number;
  coordinates?: { lat: number; lng: number };
  coverImage?: mongoose.Types.ObjectId;
  gallery: mongoose.Types.ObjectId[];
  basePriceAdult: number;
  basePriceChild?: number;
  currency: string;
  supplier?: mongoose.Types.ObjectId;
  isAddon: boolean;
  seo: ISeoMetadata;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    destinations: [{ type: Schema.Types.ObjectId, ref: "Destination" }],
    category: {
      type: String,
      enum: ["ADVENTURE", "CULTURAL", "NATURE", "WELLNESS", "CULINARY", "SIGHTSEEING", "WATER_SPORTS"],
      required: true,
    },
    shortDescription: { type: String, required: true, maxlength: 500 },
    longDescription: { type: Schema.Types.Mixed },
    highlights: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    duration: { type: String, required: true },
    difficulty: { type: String, enum: ["EASY", "MODERATE", "CHALLENGING", "EXPERT"] },
    minAge: { type: Number },
    maxGroupSize: { type: Number },
    coordinates: { lat: Number, lng: Number },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    basePriceAdult: { type: Number, required: true, min: 0 },
    basePriceChild: { type: Number, min: 0 },
    currency: { type: String, default: "INR" },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
    isAddon: { type: Boolean, default: false },
    seo: { type: SeoMetadataSchema, default: () => ({}) },
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], default: "DRAFT" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, collection: "activities" }
);

ActivitySchema.index({ destinations: 1, status: 1 });
ActivitySchema.index({ category: 1, status: 1 });
ActivitySchema.index({ isAddon: 1, status: 1 });

export const ActivityModel: Model<IActivity> =
  mongoose.models.Activity ?? mongoose.model<IActivity>("Activity", ActivitySchema);

export default ActivityModel;
