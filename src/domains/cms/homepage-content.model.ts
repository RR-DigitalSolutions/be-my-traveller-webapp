import mongoose, { Document, Model, Schema } from "mongoose";

export interface IHomepageContent extends Document {
  featuredPackages: Array<{
    id: string;
    slug: string;
    title: string;
    destination: string;
    nights: string;
    originalPrice: string;
    price: string;
    discount: string;
    rating: number;
    reviews: number;
    inclusions: string[];
    img: string;
    tag: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  specialOffers: Array<{
    id: string;
    badge: string;
    validity: string;
    title: string;
    description: string;
    code: string;
    ctaText: string;
    gradient: string;
    badgeBg: string;
    badgeText: string;
    textColor: string;
    buttonBg: string;
    buttonText: string;
    codeBg: string;
    codeBorder: string;
    codeText: string;
    enquiryName: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  popularDestinations: {
    domestic: Array<{
      name: string;
      slug: string;
      tagline: string;
      packages: string;
      price: string;
      img: string;
      tag: string;
      isActive: boolean;
      sortOrder: number;
    }>;
    international: Array<{
      name: string;
      slug: string;
      tagline: string;
      packages: string;
      price: string;
      img: string;
      tag: string;
      isActive: boolean;
      sortOrder: number;
    }>;
  };
  themePackages: Array<{
    id: string;
    theme: string;
    title: string;
    destination: string;
    nights: string;
    originalPrice: string;
    price: string;
    discount: string;
    rating: number;
    reviews: number;
    specialInclusion: string;
    img: string;
    badge: string;
    slug: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  whyBook: {
    heading: string;
    subheading: string;
    trustBadge: string;
    points: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
      color: string;
      isActive: boolean;
      sortOrder: number;
    }>;
    images: {
      img1: string;
      img2: string;
      img3: string;
      img4: string;
    };
  };
  reviews: Array<{
    id: string;
    name: string;
    location: string;
    destination: string;
    rating: number;
    review: string;
    date: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  updatedBy?: string;
}

const HomepageContentSchema = new Schema<IHomepageContent>(
  {
    featuredPackages: [{
      id: { type: String, required: true },
      slug: { type: String, required: true },
      title: { type: String, required: true },
      destination: { type: String, default: "" },
      nights: { type: String, default: "" },
      originalPrice: { type: String, default: "" },
      price: { type: String, required: true },
      discount: { type: String, default: "" },
      rating: { type: Number, default: 4.8 },
      reviews: { type: Number, default: 0 },
      inclusions: [{ type: String }],
      img: { type: String, default: "" },
      tag: { type: String, default: "" },
      isActive: { type: Boolean, default: true },
      sortOrder: { type: Number, default: 0 },
    }],
    specialOffers: [{
      id: { type: String, required: true },
      badge: { type: String, default: "" },
      validity: { type: String, default: "" },
      title: { type: String, required: true },
      description: { type: String, default: "" },
      code: { type: String, default: "" },
      ctaText: { type: String, default: "Claim Offer →" },
      gradient: { type: String, default: "from-amber-500 to-amber-600" },
      badgeBg: { type: String, default: "bg-slate-950" },
      badgeText: { type: String, default: "text-amber-400" },
      textColor: { type: String, default: "text-slate-950" },
      buttonBg: { type: String, default: "bg-slate-950 hover:bg-slate-900" },
      buttonText: { type: String, default: "text-amber-400" },
      codeBg: { type: String, default: "bg-slate-950/15" },
      codeBorder: { type: String, default: "border-slate-950/20" },
      codeText: { type: String, default: "text-slate-950" },
      enquiryName: { type: String, default: "" },
      isActive: { type: Boolean, default: true },
      sortOrder: { type: Number, default: 0 },
    }],
    popularDestinations: {
      domestic: [{
        name: { type: String, required: true },
        slug: { type: String, required: true },
        tagline: { type: String, default: "" },
        packages: { type: String, default: "" },
        price: { type: String, default: "" },
        img: { type: String, default: "" },
        tag: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      }],
      international: [{
        name: { type: String, required: true },
        slug: { type: String, required: true },
        tagline: { type: String, default: "" },
        packages: { type: String, default: "" },
        price: { type: String, default: "" },
        img: { type: String, default: "" },
        tag: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      }],
    },
    themePackages: [{
      id: { type: String, required: true },
      theme: { type: String, required: true },
      title: { type: String, required: true },
      destination: { type: String, default: "" },
      nights: { type: String, default: "" },
      originalPrice: { type: String, default: "" },
      price: { type: String, required: true },
      discount: { type: String, default: "" },
      rating: { type: Number, default: 4.8 },
      reviews: { type: Number, default: 0 },
      specialInclusion: { type: String, default: "" },
      img: { type: String, default: "" },
      badge: { type: String, default: "" },
      slug: { type: String, default: "" },
      isActive: { type: Boolean, default: true },
      sortOrder: { type: Number, default: 0 },
    }],
    whyBook: {
      heading: { type: String, default: "Why Book with Be My Traveller?" },
      subheading: { type: String, default: "We combine high-tech server-authoritative pricing with personalized high-touch destination expertise." },
      trustBadge: { type: String, default: "Trusted by 25,000+ Travellers" },
      points: [{
        id: { type: String },
        icon: { type: String, default: "⚡" },
        title: { type: String, required: true },
        description: { type: String, required: true },
        color: { type: String, default: "amber" },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      }],
      images: {
        img1: { type: String, default: "" },
        img2: { type: String, default: "" },
        img3: { type: String, default: "" },
        img4: { type: String, default: "" },
      },
    },
    reviews: [{
      id: { type: String },
      name: { type: String, required: true },
      location: { type: String, default: "" },
      destination: { type: String, default: "" },
      rating: { type: Number, default: 5 },
      review: { type: String, required: true },
      date: { type: String, default: "" },
      isActive: { type: Boolean, default: true },
      sortOrder: { type: Number, default: 0 },
    }],
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const HomepageContentModel: Model<IHomepageContent> =
  mongoose.models.HomepageContent ||
  mongoose.model<IHomepageContent>("HomepageContent", HomepageContentSchema);
