import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  type: ("HOTEL" | "ACTIVITY" | "TRANSPORT" | "GUIDE" | "DMC")[];
  contactName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  gstin?: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  rating?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, trim: true },
    type: [
      {
        type: String,
        enum: ["HOTEL", "ACTIVITY", "TRANSPORT", "GUIDE", "DMC"],
        required: true,
      },
    ],
    contactName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String },
    city: { type: String },
    country: { type: String, default: "India" },
    gstin: { type: String },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    rating: { type: Number, min: 1, max: 5 },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "suppliers" }
);

SupplierSchema.index({ name: 1 });
SupplierSchema.index({ type: 1, isActive: 1 });

export const SupplierModel: Model<ISupplier> =
  mongoose.models.Supplier ??
  mongoose.model<ISupplier>("Supplier", SupplierSchema);

export default SupplierModel;
