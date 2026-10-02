// ============================================================
// Public Site Settings Type Definitions & Server Helpers
// ============================================================

export interface BranchOffice {
  name: string;
  address: string;
  phone: string;
  email: string;
  isPrimary?: boolean;
}

export interface RegisteredOffice {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  tripadvisor?: string;
}

export interface PublicSiteSettings {
  companyLegalName: string;
  tradeName: string;
  tagline: string;
  brandDescription: string;
  logoUrl?: string;
  faviconUrl?: string;
  watermarkText: string;

  // Legal & Tourism Licenses
  gstin: string;
  pan: string;
  cin: string;
  iataNumber: string;
  tourismLicenseNo: string;
  dotPermitNo: string;

  // Offices
  registeredOffice: RegisteredOffice;
  branchOffices: BranchOffice[];

  // Helplines & Inboxes
  primaryPhone: string;
  emergencyHelpline: string;
  whatsappNumber: string;
  primaryEmail: string;
  supportEmail: string;
  billingEmail: string;
  bookingsEmail: string;

  // Social Links
  socialLinks: SocialLinks;

  // Public Website Config
  website: {
    enableFloatingWhatsApp: boolean;
    enableLiveChat: boolean;
    defaultMetaTitle?: string;
    defaultMetaDescription?: string;
  };
}

export const DEFAULT_PUBLIC_SETTINGS: PublicSiteSettings = {
  companyLegalName: "Be My Traveller Holidays Private Limited",
  tradeName: "Be My Traveller",
  tagline: "Curated Experiential Mountain Holidays & Custom Tour Packages",
  brandDescription:
    "India's leading experiential luxury and mountain travel specialist, providing curated tour packages, point-to-point chauffeured fleet transfers, and bespoke holiday planning across Himachal Pradesh, Kashmir, Uttarakhand, Ladakh, Dubai, and Andaman.",
  watermarkText: "RRDS",

  gstin: "07AAGCB1234F1Z8",
  pan: "AAGCB1234F",
  cin: "U63040DL2024PTC123456",
  iataNumber: "14-3 5678 9",
  tourismLicenseNo: "MOT/ND/2024/7891",
  dotPermitNo: "HP-DOT-9921-EXP",

  registeredOffice: {
    addressLine1: "Be My Traveller, Model Town Road, Near Mall Road Manali",
    addressLine2: "",
    city: "Manali",
    state: "Himachal Pradesh",
    pincode: "175131",
    country: "India",
  },

  branchOffices: [
    {
      name: "Manali Ground Operations Desk",
      address: "The Mall Road, Near Circuit House, Old Manali, Himachal Pradesh 175131",
      phone: "+91 98160 11223",
      email: "manali.desk@bemytraveller.com",
      isPrimary: true,
    },
    {
      name: "Srinagar Kashmir Concierge Hub",
      address: "Boulevard Road, Opposite Ghat No. 7 Dal Lake, Srinagar, J&K 190001",
      phone: "+91 94190 44556",
      email: "kashmir.desk@bemytraveller.com",
      isPrimary: false,
    },
    {
      name: "Dubai UAE International Office",
      address: "Office 804, Business Bay Tower, Marasi Drive, Downtown Dubai, UAE",
      phone: "+971 4 398 7766",
      email: "dubai@bemytraveller.com",
      isPrimary: false,
    },
  ],

  primaryPhone: "+91 8091638090",
  emergencyHelpline: "+91 8091638090",
  whatsappNumber: "+91 8091638090",
  primaryEmail: "hello@bemytraveller.com",
  supportEmail: "support@bemytraveller.com",
  billingEmail: "accounts@bemytraveller.com",
  bookingsEmail: "bookings@bemytraveller.com",

  socialLinks: {
    instagram: "https://instagram.com/bemytraveller",
    facebook: "https://facebook.com/bemytraveller",
    youtube: "https://youtube.com/@bemytraveller",
    twitter: "https://twitter.com/bemytraveller",
    linkedin: "https://linkedin.com/company/bemytraveller",
    tripadvisor: "https://tripadvisor.in/bemytraveller",
  },

  website: {
    enableFloatingWhatsApp: true,
    enableLiveChat: true,
    defaultMetaTitle:
      "Be My Traveller — Curated Luxury Mountain Holidays & Custom Tour Packages",
    defaultMetaDescription:
      "Discover handpicked tour packages across Manali, Kashmir, Ladakh, Shimla, Kerala, and Dubai. Enjoy 3-tier hotel stays, mountain transfers, verified activities, and 24/7 concierge.",
  },
};

