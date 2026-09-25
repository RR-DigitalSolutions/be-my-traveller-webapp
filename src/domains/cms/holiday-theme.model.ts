import mongoose, { type Document, Schema } from "mongoose";

export interface IHolidayTheme extends Document {
  slug: string;
  name: string;
  label: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const HolidayThemeSchema = new Schema<IHolidayTheme>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const DEFAULT_HOLIDAY_THEMES = [
  {
    slug: "honeymoon",
    name: "HONEYMOON",
    label: "Honeymoon & Romance",
    description: "Romantic escapes and couple-friendly breaks",
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: "adventure",
    name: "ADVENTURE",
    label: "Adventure & Trekking",
    description: "Snow, trails, mountains and high-energy experiences",
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: "family",
    name: "FAMILY",
    label: "Family Holidays",
    description: "Comfortable family vacations with easy planning",
    isActive: true,
    sortOrder: 3,
  },
  {
    slug: "heritage",
    name: "HERITAGE",
    label: "Heritage & Culture",
    description: "Palaces, forts, monasteries and cultural discovery",
    isActive: true,
    sortOrder: 4,
  },
  {
    slug: "luxury",
    name: "LUXURY",
    label: "Luxury Escapes",
    description: "Premium stays, private transfers and curated indulgence",
    isActive: true,
    sortOrder: 5,
  },
  {
    slug: "beach",
    name: "BEACH",
    label: "Beach & Island Getaways",
    description: "Island stays, beach clubs and coastal relaxation",
    isActive: true,
    sortOrder: 6,
  },
  {
    slug: "wildlife",
    name: "WILDLIFE",
    label: "Wildlife & Safari",
    description: "Jungle safaris, birding and nature-led escapes",
    isActive: true,
    sortOrder: 7,
  },
  {
    slug: "pilgrimage",
    name: "PILGRIMAGE",
    label: "Pilgrimage & Spiritual",
    description: "Temple circuits, sacred journeys and guided spiritual travel",
    isActive: true,
    sortOrder: 8,
  },
  {
    slug: "hill-station",
    name: "HILL_STATION",
    label: "Hill Stations",
    description: "Cool-weather stays and mountain scenic retreats",
    isActive: true,
    sortOrder: 9,
  },
  {
    slug: "weekend-escape",
    name: "WEEKEND_ESCAPE",
    label: "Weekend Escapes",
    description: "Short, convenient and refreshing quick getaway plans",
    isActive: true,
    sortOrder: 10,
  },
] as const;

export const HolidayThemeModel =
  mongoose.models.HolidayTheme ||
  mongoose.model<IHolidayTheme>("HolidayTheme", HolidayThemeSchema);
