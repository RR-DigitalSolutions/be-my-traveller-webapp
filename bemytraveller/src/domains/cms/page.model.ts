import mongoose, { type Document, type Model, Schema } from "mongoose";
import { SeoMetadataSchema, type ISeoMetadata } from "@/lib/db/sub-schemas";

export interface IPage extends Document {
  slug: string;
  title: string;
  content: Record<string, unknown>; // Tiptap JSON
  template: "DEFAULT" | "LANDING" | "CONTACT" | "LEGAL";
  seo: ISeoMetadata;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    content: { type: Schema.Types.Mixed, required: true },
    template: {
      type: String,
      enum: ["DEFAULT", "LANDING", "CONTACT", "LEGAL"],
      default: "DEFAULT",
    },
    seo: { type: SeoMetadataSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
    },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, collection: "pages" }
);

PageSchema.index({ slug: 1 }, { unique: true });
PageSchema.index({ status: 1 });

export const PageModel: Model<IPage> =
  mongoose.models.Page ?? mongoose.model<IPage>("Page", PageSchema);

export default PageModel;
