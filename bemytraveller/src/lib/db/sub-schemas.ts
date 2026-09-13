// ============================================================
// SHARED MONGOOSE SUB-SCHEMAS
// Used as embedded sub-documents across multiple collections.
// ============================================================

import { Schema, type Document } from "mongoose";

// ── SEO Metadata (embedded in every indexable entity) ───────

export interface ISeoMetadata {
  title?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: Schema.Types.ObjectId;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  searchIntent?: "INFORMATIONAL" | "NAVIGATIONAL" | "TRANSACTIONAL";
  schemaTypes?: string[];
}

export const SeoMetadataSchema = new Schema<ISeoMetadata>(
  {
    title: { type: String, maxlength: 70 },
    metaDescription: { type: String, maxlength: 160 },
    canonicalUrl: { type: String },
    robots: { type: String, default: "index, follow" },
    ogTitle: { type: String, maxlength: 70 },
    ogDescription: { type: String, maxlength: 200 },
    ogImage: { type: Schema.Types.ObjectId, ref: "Media" },
    primaryKeyword: { type: String },
    secondaryKeywords: [{ type: String }],
    searchIntent: {
      type: String,
      enum: ["INFORMATIONAL", "NAVIGATIONAL", "TRANSACTIONAL"],
    },
    schemaTypes: [{ type: String }],
  },
  { _id: false }
);

// ── FAQ Item (embedded in destinations, packages, etc.) ──────

export interface IFaqItem {
  question: string;
  answer: string;
  lastUpdated?: Date;
}

export const FaqItemSchema = new Schema<IFaqItem>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ── Geo Coordinates ──────────────────────────────────────────

export interface ICoordinates {
  lat: number;
  lng: number;
}

export const CoordinatesSchema = new Schema<ICoordinates>(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false }
);
