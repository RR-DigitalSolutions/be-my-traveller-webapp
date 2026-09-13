import mongoose, { type Document, type Model, Schema } from "mongoose";
import { SeoMetadataSchema, type ISeoMetadata } from "@/lib/db/sub-schemas";

export interface ITravelGuide extends Document {
  slug: string;
  title: string;
  destination: mongoose.Types.ObjectId;
  excerpt: string;
  content: Record<string, unknown>; // Tiptap JSON
  coverImage?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  seo: ISeoMetadata;
  readTimeMinutes?: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TravelGuideSchema = new Schema<ITravelGuide>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    destination: {
      type: Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    excerpt: { type: String, required: true, maxlength: 400 },
    content: { type: Schema.Types.Mixed, required: true },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seo: { type: SeoMetadataSchema, default: () => ({}) },
    readTimeMinutes: { type: Number },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
    },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, collection: "travel_guides" }
);

TravelGuideSchema.index({ slug: 1 }, { unique: true });
TravelGuideSchema.index({ destination: 1, status: 1 });
TravelGuideSchema.index({ status: 1, publishedAt: -1 });

export const TravelGuideModel: Model<ITravelGuide> =
  mongoose.models.TravelGuide ??
  mongoose.model<ITravelGuide>("TravelGuide", TravelGuideSchema);

export default TravelGuideModel;
