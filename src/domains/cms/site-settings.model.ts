import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IBranchOffice {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
}

export interface ISiteSettings extends Document {
  // ── Company & Brand Profile ─────────────────────────────────
  companyLegalName: string;
  tradeName: string;
  tagline: string;
  brandDescription?: string;
  logoUrl?: string;
  faviconUrl?: string;
  watermarkText: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  iataNumber?: string;
  tourismLicenseNo?: string;
  dotPermitNo?: string;

  // ── Locations & Contact Helplines ───────────────────────────
  registeredOffice: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  branchOffices: IBranchOffice[];
  primaryPhone: string;
  emergencyHelpline: string;
  whatsappNumber: string;
  primaryEmail: string;
  supportEmail: string;
  billingEmail: string;
  bookingsEmail: string;

  // ── Social Media Handles ────────────────────────────────────
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    tripadvisor?: string;
  };

  // ── SMTP & Email Communication ──────────────────────────────
  smtp: {
    provider: "CUSTOM" | "GMAIL" | "SENDGRID" | "SES" | "MAILGUN" | "BREVO";
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password?: string;
    senderName: string;
    fromEmail: string;
    replyToEmail: string;
    emailSignature?: string;
    isActive: boolean;
  };

  // ── WhatsApp Business Automation ────────────────────────────
  whatsappConfig: {
    provider: "META_CLOUD_API" | "TWILIO" | "WATI" | "AISENSY" | "WEBHOOK";
    phoneNumberId?: string;
    businessAccountId?: string;
    apiKey?: string;
    webhookSecret?: string;
    isActive: boolean;
    autoReplies: {
      instantLeadWelcome: boolean;
      quotePdfDelivery: boolean;
      bookingVoucherDispatch: boolean;
      driverAssignmentAlert: boolean;
      postTripFeedback: boolean;
    };
    conciergeMessageTemplate?: string;
  };

  // ── Payment Gateways, Taxes & Currencies ────────────────────
  payments: {
    activeGateway: "RAZORPAY" | "CASHFREE" | "STRIPE" | "PAYU" | "BANK_TRANSFER";
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    razorpayWebhookSecret?: string;
    stripePublishableKey?: string;
    stripeSecretKey?: string;
    defaultCurrency: string;
    supportedCurrencies: string[];
    advanceDepositPercent: number;
    defaultGstPercent: number;
    tcsInternationalPercent: number;
    bankTransferDetails: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      ifscCode: string;
      branchName: string;
      upiId?: string;
    };
  };

  // ── Website Controls, SEO & Tracking ────────────────────────
  website: {
    isMaintenanceMode: boolean;
    maintenanceMessage?: string;
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    googleAnalyticsId?: string;
    gtmContainerId?: string;
    metaPixelId?: string;
    googleSiteVerification?: string;
    enableCookieBanner: boolean;
    enableFloatingWhatsApp: boolean;
    enableLiveChat: boolean;
  };

  // ── Security Policies ───────────────────────────────────────
  security: {
    twoFactorEnforced: boolean;
    sessionTimeoutHours: number;
    apiRateLimit: number;
  };

  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    companyLegalName: {
      type: String,
      required: true,
      default: "Be My Traveller Holidays Private Limited",
    },
    tradeName: { type: String, required: true, default: "Be My Traveller" },
    tagline: {
      type: String,
      default: "Curated Experiential Mountain Holidays & Custom Tour Packages",
    },
    brandDescription: {
      type: String,
      default:
        "India's leading experiential luxury and mountain travel specialist, providing curated tour packages, point-to-point chauffeured fleet transfers, and bespoke holiday planning across Himachal Pradesh, Kashmir, Uttarakhand, Ladakh, Dubai, and Andaman.",
    },
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
    watermarkText: { type: String, default: "RRDS" },
    gstin: { type: String, default: "07AAGCB1234F1Z8" },
    pan: { type: String, default: "AAGCB1234F" },
    cin: { type: String, default: "U63040DL2024PTC123456" },
    iataNumber: { type: String, default: "14-3 5678 9" },
    tourismLicenseNo: { type: String, default: "MOT/ND/2024/7891" },
    dotPermitNo: { type: String, default: "HP-DOT-9921-EXP" },

    registeredOffice: {
      addressLine1: {
        type: String,
        default: "Level 4, Connaught Place Business Tower, Barakhamba Road",
      },
      addressLine2: { type: String, default: "Central Delhi" },
      city: { type: String, default: "New Delhi" },
      state: { type: String, default: "Delhi" },
      pincode: { type: String, default: "110001" },
      country: { type: String, default: "India" },
    },
    branchOffices: [
      {
        name: { type: String },
        address: { type: String },
        phone: { type: String },
        email: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    primaryPhone: { type: String, default: "+91 8091638090" },
    emergencyHelpline: { type: String, default: "+91 8091638090" },
    whatsappNumber: { type: String, default: "+91 8091638090" },
    primaryEmail: { type: String, default: "hello@bemytraveller.com" },
    supportEmail: { type: String, default: "support@bemytraveller.com" },
    billingEmail: { type: String, default: "accounts@bemytraveller.com" },
    bookingsEmail: { type: String, default: "bookings@bemytraveller.com" },

    socialLinks: {
      instagram: {
        type: String,
        default: "https://instagram.com/bemytraveller",
      },
      facebook: {
        type: String,
        default: "https://facebook.com/bemytraveller",
      },
      youtube: {
        type: String,
        default: "https://youtube.com/@bemytraveller",
      },
      twitter: { type: String, default: "https://twitter.com/bemytraveller" },
      linkedin: {
        type: String,
        default: "https://linkedin.com/company/bemytraveller",
      },
      tripadvisor: {
        type: String,
        default: "https://tripadvisor.in/bemytraveller",
      },
    },

    smtp: {
      provider: {
        type: String,
        enum: ["CUSTOM", "GMAIL", "SENDGRID", "SES", "MAILGUN", "BREVO"],
        default: "GMAIL",
      },
      host: { type: String, default: "smtp.gmail.com" },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      username: { type: String, default: "notifications@bemytraveller.com" },
      password: { type: String, default: "" },
      senderName: { type: String, default: "Be My Traveller Holidays" },
      fromEmail: { type: String, default: "noreply@bemytraveller.com" },
      replyToEmail: { type: String, default: "support@bemytraveller.com" },
      emailSignature: {
        type: String,
        default:
          "Warm Regards,\nBe My Traveller Holidays Concierge Team\n24/7 Helpline: +91 8091638090 | support@bemytraveller.com",
      },
      isActive: { type: Boolean, default: true },
    },

    whatsappConfig: {
      provider: {
        type: String,
        enum: ["META_CLOUD_API", "TWILIO", "WATI", "AISENSY", "WEBHOOK"],
        default: "META_CLOUD_API",
      },
      phoneNumberId: { type: String, default: "109847291823749" },
      businessAccountId: { type: String, default: "782910482710394" },
      apiKey: { type: String, default: "" },
      webhookSecret: { type: String, default: "bmt_wa_wh_sec_2026" },
      isActive: { type: Boolean, default: true },
      autoReplies: {
        instantLeadWelcome: { type: Boolean, default: true },
        quotePdfDelivery: { type: Boolean, default: true },
        bookingVoucherDispatch: { type: Boolean, default: true },
        driverAssignmentAlert: { type: Boolean, default: true },
        postTripFeedback: { type: Boolean, default: true },
      },
      conciergeMessageTemplate: {
        type: String,
        default:
          "Namaste {{name}}! Welcome to Be My Traveller. Your dedicated destination specialist is curating your personalized {{destination}} itinerary. We will connect shortly with exclusive seasonal rates!",
      },
    },

    payments: {
      activeGateway: {
        type: String,
        enum: ["RAZORPAY", "CASHFREE", "STRIPE", "PAYU", "BANK_TRANSFER"],
        default: "RAZORPAY",
      },
      razorpayKeyId: { type: String, default: "rzp_live_BMT99x88y77z" },
      razorpayKeySecret: { type: String, default: "" },
      razorpayWebhookSecret: { type: String, default: "" },
      stripePublishableKey: { type: String, default: "" },
      stripeSecretKey: { type: String, default: "" },
      defaultCurrency: { type: String, default: "INR" },
      supportedCurrencies: {
        type: [String],
        default: ["INR", "USD", "AED", "EUR", "GBP"],
      },
      advanceDepositPercent: { type: Number, default: 25 },
      defaultGstPercent: { type: Number, default: 5 },
      tcsInternationalPercent: { type: Number, default: 5 },
      bankTransferDetails: {
        bankName: { type: String, default: "HDFC Bank Ltd." },
        accountName: {
          type: String,
          default: "Be My Traveller Holidays Pvt Ltd",
        },
        accountNumber: { type: String, default: "50200088991122" },
        ifscCode: { type: String, default: "HDFC0000240" },
        branchName: {
          type: String,
          default: "Connaught Place Branch, New Delhi",
        },
        upiId: { type: String, default: "bemytraveller@hdfcbank" },
      },
    },

    website: {
      isMaintenanceMode: { type: Boolean, default: false },
      maintenanceMessage: {
        type: String,
        default:
          "We are currently upgrading our travel systems for a better experience. We will be back online shortly!",
      },
      defaultMetaTitle: {
        type: String,
        default:
          "Be My Traveller — Curated Luxury Mountain Holidays & Custom Tour Packages",
      },
      defaultMetaDescription: {
        type: String,
        default:
          "Discover handpicked tour packages across Manali, Kashmir, Ladakh, Shimla, Kerala, and Dubai. Enjoy 3-tier hotel stays, mountain transfers, verified activities, and 24/7 concierge.",
      },
      googleAnalyticsId: { type: String, default: "G-BMT8899XX" },
      gtmContainerId: { type: String, default: "GTM-BMT7722" },
      metaPixelId: { type: String, default: "192837465019283" },
      googleSiteVerification: {
        type: String,
        default: "googled9a8b7c6d5e4f3a2",
      },
      enableCookieBanner: { type: Boolean, default: true },
      enableFloatingWhatsApp: { type: Boolean, default: true },
      enableLiveChat: { type: Boolean, default: true },
    },

    security: {
      twoFactorEnforced: { type: Boolean, default: false },
      sessionTimeoutHours: { type: Number, default: 8 },
      apiRateLimit: { type: Number, default: 120 },
    },

    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "site_settings" }
);

export const SiteSettingsModel: Model<ISiteSettings> =
  mongoose.models.SiteSettings ??
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettingsModel;
