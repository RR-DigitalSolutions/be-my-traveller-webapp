import mongoose, { type Document, type Model, Schema } from "mongoose";
import { SeoMetadataSchema, type ISeoMetadata } from "@/lib/db/sub-schemas";

export interface IGlobalFAQ extends Document {
  question: string;
  answer: string;
  category: "BOOKING" | "PAYMENT" | "GENERAL" | "VISA" | "CANCELLATION" | "CUSTOMIZATION";
  sortOrder: number;
  relatedDestinations: mongoose.Types.ObjectId[];
  relatedPackages: mongoose.Types.ObjectId[];
  isGlobal: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  seo: ISeoMetadata;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IGlobalFAQ>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "BOOKING",
        "PAYMENT",
        "GENERAL",
        "VISA",
        "CANCELLATION",
        "CUSTOMIZATION",
      ],
      default: "GENERAL",
    },
    sortOrder: { type: Number, default: 0 },
    relatedDestinations: [{ type: Schema.Types.ObjectId, ref: "Destination" }],
    relatedPackages: [{ type: Schema.Types.ObjectId, ref: "Package" }],
    isGlobal: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "PUBLISHED",
    },
    seo: { type: SeoMetadataSchema, default: () => ({}) },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, collection: "faqs" }
);

FAQSchema.index({ category: 1, sortOrder: 1 });
FAQSchema.index({ isGlobal: 1, status: 1 });

export const FAQModel: Model<IGlobalFAQ> =
  mongoose.models.FAQ ?? mongoose.model<IGlobalFAQ>("FAQ", FAQSchema);

export default FAQModel;
