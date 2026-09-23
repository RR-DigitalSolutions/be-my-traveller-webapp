import mongoose, { type Document, type Model, Schema } from "mongoose";
import { SeoMetadataSchema, type ISeoMetadata } from "@/lib/db/sub-schemas";

export interface IBlog extends Document {
  slug: string;
  title: string;
  excerpt: string;
  content: Record<string, unknown>; // Tiptap JSON
  coverImage?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  categories: string[];
  tags: string[];
  relatedDestinations: mongoose.Types.ObjectId[];
  relatedPackages: mongoose.Types.ObjectId[];
  seo: ISeoMetadata;
  readTimeMinutes?: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, maxlength: 400 },
    content: { type: Schema.Types.Mixed, required: true },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categories: [{ type: String }],
    tags: [{ type: String }],
    relatedDestinations: [{ type: Schema.Types.ObjectId, ref: "Destination" }],
    relatedPackages: [{ type: Schema.Types.ObjectId, ref: "Package" }],
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
  { timestamps: true, collection: "blogs" }
);

BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ categories: 1, status: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ relatedDestinations: 1 });

export const BlogModel: Model<IBlog> =
  mongoose.models.Blog ?? mongoose.model<IBlog>("Blog", BlogSchema);

export default BlogModel;
