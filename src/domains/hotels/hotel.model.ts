// ============================================================
// Hotel Model
// Reusable accommodation entity. Referenced by packages.
// Room types are embedded (always accessed via their hotel).
// ============================================================

import mongoose, { type Document, type Model, Schema } from "mongoose";
import { SeoMetadataSchema, type ISeoMetadata } from "@/lib/db/sub-schemas";

export type HotelCategory =
  | "BUDGET"
  | "STANDARD"
  | "DELUXE"
  | "LUXURY"
  | "BOUTIQUE"
  | "RESORT"
  | "HOMESTAY"
  | "VILLA";

export type RoomType =
  | "STANDARD"
  | "DELUXE"
  | "SUITE"
  | "DORMITORY"
  | "VILLA"
  | "COTTAGE";

export interface IHotelRoom {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: RoomType;
  maxOccupancy: number;
  bedConfiguration?: string;
  size?: number;
  amenities: string[];
  images: mongoose.Types.ObjectId[];
  isActive: boolean;
}

export interface IHotel extends Document {
  slug: string;
  name: string;
  destination: mongoose.Types.ObjectId;
  category: HotelCategory;
  starRating?: number;
  shortDescription: string;
  longDescription?: Record<string, unknown>;
  address?: string;
  coordinates?: { lat: number; lng: number };
  amenities: string[];
  rooms: IHotelRoom[];
  coverImage?: mongoose.Types.ObjectId;
  gallery: mongoose.Types.ObjectId[];
  supplier?: mongoose.Types.ObjectId;
  checkInTime?: string;
  checkOutTime?: string;
  policies?: Record<string, unknown>;
  seo: ISeoMetadata;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HotelRoomSchema = new Schema<IHotelRoom>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["STANDARD", "DELUXE", "SUITE", "DORMITORY", "VILLA", "COTTAGE"] satisfies RoomType[],
      required: true,
    },
    maxOccupancy: { type: Number, required: true, min: 1 },
    bedConfiguration: { type: String },
    size: { type: Number },
    amenities: [{ type: String }],
    images: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const HotelSchema = new Schema<IHotel>(
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
    category: {
      type: String,
      enum: ["BUDGET", "STANDARD", "DELUXE", "LUXURY", "BOUTIQUE", "RESORT", "HOMESTAY", "VILLA"] satisfies HotelCategory[],
      required: true,
    },
    starRating: { type: Number, min: 1, max: 5 },
    shortDescription: { type: String, required: true, maxlength: 500 },
    longDescription: { type: Schema.Types.Mixed },
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    amenities: [{ type: String }],
    rooms: { type: [HotelRoomSchema], default: [] },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
    checkInTime: { type: String },
    checkOutTime: { type: String },
    policies: { type: Schema.Types.Mixed },
    seo: { type: SeoMetadataSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    collection: "hotels",
  }
);

HotelSchema.index({ destination: 1, status: 1 });
HotelSchema.index({ category: 1, status: 1 });

export const HotelModel: Model<IHotel> =
  mongoose.models.Hotel ?? mongoose.model<IHotel>("Hotel", HotelSchema);

export default HotelModel;
