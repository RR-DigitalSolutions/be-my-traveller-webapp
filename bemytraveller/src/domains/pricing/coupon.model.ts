import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: "FLAT" | "PERCENTAGE";
  discountValue: number;
  maxDiscountAmount?: number;
  maxUsage?: number;
  maxUsagePerCustomer?: number;
  usageCount: number;
  applicablePackages: mongoose.Types.ObjectId[];
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ["FLAT", "PERCENTAGE"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number },
    maxUsage: { type: Number },
    maxUsagePerCustomer: { type: Number },
    usageCount: { type: Number, default: 0 },
    applicablePackages: [{ type: Schema.Types.ObjectId, ref: "Package" }],
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: false, collection: "coupons" }
);

CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });

export const CouponModel: Model<ICoupon> =
  mongoose.models.Coupon ?? mongoose.model<ICoupon>("Coupon", CouponSchema);

export default CouponModel;
