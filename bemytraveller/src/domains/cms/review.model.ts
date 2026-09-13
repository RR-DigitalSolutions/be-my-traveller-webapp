import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IReview extends Document {
  customer?: mongoose.Types.ObjectId;
  customerName: string;
  customerLocation?: string;
  booking?: mongoose.Types.ObjectId;
  package?: mongoose.Types.ObjectId;
  destination?: mongoose.Types.ObjectId;
  rating: number; // 1-5
  title?: string;
  content: string;
  images: mongoose.Types.ObjectId[];
  isVerified: boolean;
  isPublished: boolean;
  publishedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  travelDate?: Date;
  adminResponse?: {
    content: string;
    respondedBy: mongoose.Types.ObjectId;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, required: true, trim: true },
    customerLocation: { type: String },
    booking: { type: Schema.Types.ObjectId, ref: "Booking" },
    package: { type: Schema.Types.ObjectId, ref: "Package" },
    destination: { type: Schema.Types.ObjectId, ref: "Destination" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    content: { type: String, required: true },
    images: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    isVerified: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    travelDate: { type: Date },
    adminResponse: {
      content: String,
      respondedBy: { type: Schema.Types.ObjectId, ref: "User" },
      respondedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true, collection: "reviews" }
);

ReviewSchema.index({ package: 1, isPublished: 1, createdAt: -1 });
ReviewSchema.index({ destination: 1, isPublished: 1 });
ReviewSchema.index({ isPublished: 1, rating: -1 });

export const ReviewModel: Model<IReview> =
  mongoose.models.Review ?? mongoose.model<IReview>("Review", ReviewSchema);

export default ReviewModel;
