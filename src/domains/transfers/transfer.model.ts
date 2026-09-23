import mongoose, { type Document, type Model, Schema } from "mongoose";

export type TransferType =
  | "PRIVATE_CAR"
  | "SUV_CAB"
  | "LUXURY_VIP"
  | "TEMPO_TRAVELLER"
  | "VOLVO_BUS"
  | "SHARED_BUS"
  | "FLIGHT"
  | "TRAIN"
  | "FERRY"
  | "SPEEDBOAT"
  | "HELICOPTER";

export type TransferCategory =
  | "AIRPORT_RAILWAY"
  | "INTERCITY"
  | "HILL_STATION"
  | "LOCAL_SIGHTSEEING"
  | "OVERNIGHT_VOLVO"
  | "ISLAND_WATER"
  | "HELICOPTER_SHUTTLE";

export type PricingModel = "PER_VEHICLE" | "PER_PASSENGER" | "PER_DAY";

export interface ITransfer extends Document {
  name: string;
  category: TransferCategory;
  type: TransferType;
  vehicle: string;
  vehicleModel?: string;
  vehicleCategory?: "SEDAN" | "SUV" | "LUXURY" | "TEMPO" | "BUS" | "WATERCRAFT" | "AIRCRAFT";
  fromCity: string;
  toCity: string;
  fromLocation?: string;
  toLocation?: string;
  fromCountry?: string;
  toCountry?: string;
  fromState?: string;
  toState?: string;
  fromDestination?: mongoose.Types.ObjectId;
  toDestination?: mongoose.Types.ObjectId;
  distanceKm?: number;
  duration: string;
  maxSeats: number;
  luggageCapacity?: string;
  pricingModel: PricingModel;
  costPerUnit: number;
  originalPrice?: number;
  discountPercent?: number;
  discountBadge?: string;
  currency: string;
  amenities: string[];
  inclusions: string[];
  exclusions: string[];
  pickupGuidelines?: string;
  coverImage?: string;
  gallery?: string[];
  supplier?: mongoose.Types.ObjectId;
  supplierName?: string;
  isPopular?: boolean;
  isSnowChainEquipped?: boolean;
  tollPermitIncluded?: boolean;
  status: "ACTIVE" | "INACTIVE" | "SEASONAL";
  createdAt: Date;
  updatedAt: Date;
}

const TransferSchema = new Schema<ITransfer>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "AIRPORT_RAILWAY",
        "INTERCITY",
        "HILL_STATION",
        "LOCAL_SIGHTSEEING",
        "OVERNIGHT_VOLVO",
        "ISLAND_WATER",
        "HELICOPTER_SHUTTLE",
      ],
      default: "INTERCITY",
    },
    type: {
      type: String,
      enum: [
        "PRIVATE_CAR",
        "SUV_CAB",
        "LUXURY_VIP",
        "TEMPO_TRAVELLER",
        "VOLVO_BUS",
        "SHARED_BUS",
        "FLIGHT",
        "TRAIN",
        "FERRY",
        "SPEEDBOAT",
        "HELICOPTER",
      ],
      required: true,
      default: "PRIVATE_CAR",
    },
    vehicle: { type: String, required: true },
    vehicleModel: { type: String },
    vehicleCategory: {
      type: String,
      enum: ["SEDAN", "SUV", "LUXURY", "TEMPO", "BUS", "WATERCRAFT", "AIRCRAFT"],
      default: "SEDAN",
    },
    fromCity: { type: String, required: true },
    toCity: { type: String, required: true },
    fromLocation: { type: String },
    toLocation: { type: String },
    fromCountry: { type: String, default: "India" },
    toCountry: { type: String, default: "India" },
    fromState: { type: String },
    toState: { type: String },
    fromDestination: { type: Schema.Types.ObjectId, ref: "Destination" },
    toDestination: { type: Schema.Types.ObjectId, ref: "Destination" },
    distanceKm: { type: Number },
    duration: { type: String, required: true },
    maxSeats: { type: Number, required: true, default: 4 },
    luggageCapacity: { type: String, default: "2 Large + 2 Small Bags" },
    pricingModel: {
      type: String,
      enum: ["PER_VEHICLE", "PER_PASSENGER", "PER_DAY"],
      default: "PER_VEHICLE",
    },
    costPerUnit: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    discountPercent: { type: Number, default: 0 },
    discountBadge: { type: String },
    currency: { type: String, default: "INR" },
    amenities: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    pickupGuidelines: { type: String },
    coverImage: { type: String },
    gallery: [{ type: String }],
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
    supplierName: { type: String },
    isPopular: { type: Boolean, default: false },
    isSnowChainEquipped: { type: Boolean, default: false },
    tollPermitIncluded: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SEASONAL"],
      default: "ACTIVE",
    },
  },
  { timestamps: true, collection: "transfers" }
);

TransferSchema.index({ fromCity: 1, toCity: 1, status: 1 });
TransferSchema.index({ category: 1, type: 1, status: 1 });
TransferSchema.index({ costPerUnit: 1 });

export const TransferModel: Model<ITransfer> =
  mongoose.models.Transfer ??
  mongoose.model<ITransfer>("Transfer", TransferSchema);

export default TransferModel;
