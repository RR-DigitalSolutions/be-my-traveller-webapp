import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ICustomer extends Document {
  email: string;
  phone: string;
  name: string;
  dateOfBirth?: Date;
  gender?: "MALE" | "FEMALE" | "OTHER";
  nationality?: string;
  passportNumber?: string; // encrypted
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  preferences?: {
    hotelCategory?: string;
    mealPreference?: string;
    dietaryRestrictions?: string[];
    specialRequirements?: string;
  };
  totalBookings: number;
  totalSpend: number;
  currency: string;
  tags: string[];
  assignedAgent?: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    nationality: { type: String },
    passportNumber: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    preferences: {
      hotelCategory: String,
      mealPreference: String,
      dietaryRestrictions: [String],
      specialRequirements: String,
    },
    totalBookings: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    tags: [{ type: String }],
    assignedAgent: { type: Schema.Types.ObjectId, ref: "User" },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "customers" }
);

CustomerSchema.index({ email: 1 }, { unique: true });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ assignedAgent: 1 });
CustomerSchema.index({ tags: 1 });

export const CustomerModel: Model<ICustomer> =
  mongoose.models.Customer ??
  mongoose.model<ICustomer>("Customer", CustomerSchema);

export default CustomerModel;
