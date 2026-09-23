import mongoose, { type Document, type Model, Schema } from "mongoose";
import {
  SeoMetadataSchema,
  CoordinatesSchema,
  type ISeoMetadata,
  type ICoordinates,
} from "@/lib/db/sub-schemas";

export type AttractionType =
  | "VIEWPOINT"
  | "TEMPLE"
  | "LAKE"
  | "TREK"
  | "BEACH"
  | "MARKET"
  | "MUSEUM"
  | "ADVENTURE"
  | "HISTORICAL"
  | "NATURAL"
  | "MONUMENT"
  | "PARK";

export interface IAttraction extends Document {
  slug: string;
  name: string;
  destination: mongoose.Types.ObjectId;
  type: AttractionType;
  shortDescription: string;
  longDescription?: Record<string, unknown>; // Tiptap JSON
  coverImage?: mongoose.Types.ObjectId;
  gallery: mongoose.Types.ObjectId[];
  coordinates?: ICoordinates;
  entryFee?: {
    adult: number;
    child: number;
    currency: string;
  };
  timings?: string;
  duration?: string;
  tips?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  seo: ISeoMetadata;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttractionSchema = new Schema<IAttraction>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    destination: {
      type: Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "VIEWPOINT",
        "TEMPLE",
        "LAKE",
        "TREK",
        "BEACH",
        "MARKET",
        "MUSEUM",
        "ADVENTURE",
        "HISTORICAL",
        "NATURAL",
        "MONUMENT",
        "PARK",
      ] satisfies AttractionType[],
      required: true,
    },
    shortDescription: { type: String, required: true, maxlength: 500 },
    longDescription: { type: Schema.Types.Mixed },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    coordinates: { type: CoordinatesSchema },
    entryFee: {
      adult: { type: Number, default: 0 },
      child: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
    },
    timings: { type: String },
    duration: { type: String },
    tips: { type: String },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
    },
    seo: { type: SeoMetadataSchema, default: () => ({}) },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, collection: "attractions" }
);

AttractionSchema.index({ destination: 1, status: 1 });
AttractionSchema.index({ type: 1, status: 1 });

export const AttractionModel: Model<IAttraction> =
  mongoose.models.Attraction ??
  mongoose.model<IAttraction>("Attraction", AttractionSchema);

export default AttractionModel;
