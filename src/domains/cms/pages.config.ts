import connectDB from "@/lib/db/mongoose";
import { PageModel, type IPage } from "./page.model";

export interface PageStatItem {
  value: string;
  label: string;
  icon?: string;
}

export interface PageSectionItem {
  title: string;
  subtitle?: string;
  content: string;
  icon?: string;
  badge?: string;
}

export interface PageFaqItem {
  question: string;
  answer: string;
}

export interface PageHighlightItem {
  title: string;
  desc: string;
  icon: string;
}

export interface PageTableItem {
  label: string;
  value: string;
  badge?: string;
}

export interface ManagedPageData {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  template: "DEFAULT" | "LANDING" | "CONTACT" | "LEGAL";
  heroImage?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  stats?: PageStatItem[];
  sections?: PageSectionItem[];
  faqs?: PageFaqItem[];
  highlights?: PageHighlightItem[];
  tableData?: PageTableItem[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  status?: "PUBLISHED" | "DRAFT";
  updatedAt?: string;
}

// ── Competitor-Benchmarked Default Content for All Core Pages ──
export const DEFAULT_PAGES: Record<string, ManagedPageData> = {
  about: {
    slug: "about",
    title: "Crafting Unforgettable Journeys, One Custom Story at a Time",
    subtitle:
      "Be My Traveller is India's leading experiential travel company. We reject cookie-cutter group tours in favor of 100% tailor-made private holidays, handpicked boutique stays, and authentic local discovery.",
    badge: "🌍 India's Custom Travel Architects",
    template: "LANDING",
    heroImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80",
    heroCtaText: "Explore Custom Packages",
    heroCtaLink: "/packages",
    stats: [
      { value: "25,000+", label: "Delighted Guests", icon: "✨" },
      { value: "500+", label: "Curated Private Tours", icon: "🗺️" },
      { value: "85+", label: "Verified Destinations", icon: "🏔️" },
      { value: "4.9/5", label: "Traveller Rating", icon: "★" },
    ],
    highlights: [
      {
        icon: "🎯",
        title: "100% Tailor-Made & Private",
        desc: "No fixed departures. No strangers in your cab. Every moment, meal, and mountain pass is tailored to your pacing and preferences.",
      },
      {
        icon: "🏨",
        title: "Handpicked & Verified Stays",
        desc: "We physically audit hotels, boutique cottages, and luxury camps. We reject properties with inconsistent hygiene or impersonal service.",
      },
      {
        icon: "🚗",
        title: "Dedicated Mountain Chauffeurs",
        desc: "Sanitized private vehicles driven by verified, courteous mountain specialists who know every scenic lookout and safe route.",
      },
      {
        icon: "🛡️",
        title: "24/7 On-Trip Concierge",
        desc: "Your dedicated trip manager stays in constant touch from arrival until your return flight, handling changes and special requests.",
      },
      {
        icon: "🏷️",
        title: "Zero Hidden Surcharges",
        desc: "Transparent server-validated pricing. GST, fuel, toll taxes, state permits, and driver night allowances are included upfront.",
      },
      {
        icon: "⭐",
        title: "Government Recognized Operator",
        desc: "Fully registered and licensed tour operator adhering strictly to international safety protocols and local eco-tourism norms.",
      },
    ],
    sections: [
      {
        title: "Why We Started Be My Traveller",
        subtitle: "The Era of Rigid Group Packages is Over",
        content: `For decades, travellers in India were forced to choose between two extremes: overpriced luxury agencies or rigid budget group tours where 40 tourists are rushed through scenic destinations on tight bus schedules with mandatory shopping stops.

We built Be My Traveller with a different philosophy: Travel should be deeply personal, unhurried, and transparent. We combine cutting-edge travel technology with genuine ground mastery across Himachal, Kashmir, Ladakh, Uttarakhand, Kerala, and international destinations.

When you travel with us, your private cab waits while you sip hot chai overlooking snow peaks. Your stay has been pre-screened for warm heating, stunning views, and immaculate cleanliness. And should weather or flights change, our round-the-clock operations team adjusts your itinerary seamlessly.`,
        icon: "🏔️",
        badge: "Our Philosophy",
      },
      {
        title: "How We Compare with Standard Travel Portals",
        subtitle: "The Difference Between Selling a Ticket and Crafting an Experience",
        content: `Unlike giant online ticket aggregators who leave you with a generic hotel voucher and an unverified third-party taxi driver, Be My Traveller operates an integrated ground concierge model. 

Our destination specialists have personally explored the high passes of Spiti, the hidden apple orchards of Manali, and the serene backwaters of Alleppey. We match your travel style — whether it's a romantic honeymoon, a family vacation with senior citizens, or an adventurous 4x4 expedition.`,
        icon: "⚡",
        badge: "The BMT Advantage",
      },
    ],
    faqs: [
      {
        question: "Can I customize every day of my tour itinerary?",
        answer:
          "Yes, 100%! All our packages are private and customizable. You can adjust sightseeing spots, upgrade hotel categories, add extra nights, or include special experiences like candlelight dinners and private bonfires.",
      },
      {
        question: "What support do I receive while I am travelling?",
        answer:
          "You receive a dedicated 24/7 on-trip concierge manager reachable via direct WhatsApp and phone call. They monitor your daily logistics, check you into hotels smoothly, and handle any changes on the ground.",
      },
      {
        question: "Are your tour prices all-inclusive?",
        answer:
          "Yes. Our quotations clearly outline all inclusions: accommodations, daily breakfast and dinners, private dedicated vehicle, driver charges, toll taxes, fuel, parking, and state permits. No surprise surcharges.",
      },
    ],
    seo: {
      metaTitle: "About Us | Be My Traveller — India's Premier Custom Holiday Platform",
      metaDescription:
        "Learn about Be My Traveller — India's custom experiential tour operator. Discover our story, physically verified boutique stays, private cabs, and 24/7 on-trip concierge.",
      keywords: ["about be my traveller", "custom tour operator india", "luxury holidays india", "private tours"],
    },
    status: "PUBLISHED",
  },

  "cancellation-policy": {
    slug: "cancellation-policy",
    title: "Transparent Cancellation, Amendment & Refund Policy",
    subtitle:
      "We believe in fair, clear, and traveler-friendly booking protection. Review our transparent refund slabs, rescheduling guarantees, and force majeure waivers.",
    badge: "🛡️ Clear & Fair Booking Protection",
    template: "LEGAL",
    heroImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&auto=format&fit=crop&q=80",
    heroCtaText: "Contact Cancellation Desk",
    heroCtaLink: "/contact",
    stats: [
      { value: "45+ Days", label: "Full Refund Notice Window", icon: "⏱️" },
      { value: "5-7 Days", label: "Direct Bank/UPI Refund Speed", icon: "💳" },
      { value: "0 Penalty", label: "Flexible Rescheduling Guarantee", icon: "🔄" },
      { value: "24/7", label: "Dedicated Assistance Desk", icon: "📞" },
    ],
    tableData: [
      { label: "45+ Days before travel", value: "Full Refund (100%)", badge: "Nil Deduction*" },
      { label: "30 to 44 Days before travel", value: "75% Refund of Package Total", badge: "25% Fee" },
      { label: "15 to 29 Days before travel", value: "50% Refund of Package Total", badge: "50% Fee" },
      { label: "7 to 14 Days before travel", value: "25% Refund of Package Total", badge: "75% Fee" },
      { label: "Less than 7 Days / No Show", value: "Non-Refundable (0% Refund)", badge: "100% Fee" },
    ],
    sections: [
      {
        title: "How to Request a Cancellation or Amendment",
        subtitle: "Fast, Documented, and Hassle-Free",
        content: `All cancellation requests must be sent in writing from your registered booking email to **cancel@bemytraveller.com** or submitted directly to your dedicated trip manager via official WhatsApp. 

Cancellation notice is calculated based on the timestamp when our operations desk acknowledges receipt of the request. Our finance team processes refunds directly to your original payment method (Bank Account, UPI, or Credit Card) within 5 to 7 working days.`,
        icon: "📝",
        badge: "Process",
      },
      {
        title: "Flexible Reschedule & Date Change Guarantee",
        subtitle: "Life Happens — We Keep Your Holiday Flexible",
        content: `Need to postpone your trip due to work, personal emergencies, or flight changes? If you notify us at least 15 days prior to your departure, Be My Traveller allows you to convert your booking amount into a **Travel Credit Voucher** valid for 12 months with zero administrative rescheduling penalty. New dates are subject to hotel seasonal rate differences.`,
        icon: "🔄",
        badge: "Flexibility",
      },
      {
        title: "Force Majeure & Extreme Weather Protection",
        subtitle: "Landslides, Natural Events & Government Advisories",
        content: `In the rare event of unforeseen natural occurrences (landslides, heavy snowfall blocking high passes, government travel advisories, or road closures), Be My Traveller prioritizes your safety. We arrange alternative safe route detours, substitute verified destinations, or provide credit vouchers for unused services on a priority basis.`,
        icon: "🏔️",
        badge: "Safety Waiver",
      },
    ],
    faqs: [
      {
        question: "How long does it take to receive my refund?",
        answer:
          "Approved refunds are credited to your original payment source (Bank/UPI/Card) within 5 to 7 business days. You will receive an official bank ARN reference number via SMS and email.",
      },
      {
        question: "Can I transfer my booking to a family member or friend?",
        answer:
          "Yes! Booking name changes can be accommodated up to 7 days before departure for hotel and vehicle vouchers at zero additional charge.",
      },
      {
        question: "What if my flight gets delayed or canceled by the airline?",
        answer:
          "Inform your 24/7 trip manager immediately. We will reschedule your private cab pickup and inform hotels so you don't face no-show penalties.",
      },
    ],
    seo: {
      metaTitle: "Cancellation & Refund Policy | Be My Traveller",
      metaDescription:
        "Understand Be My Traveller's transparent cancellation, amendment, and refund policy. Learn about refund slabs, date rescheduling, and force majeure protections.",
      keywords: ["cancellation policy", "refund policy be my traveller", "tour refund timeline"],
    },
    status: "PUBLISHED",
  },

  terms: {
    slug: "terms",
    title: "Terms of Service & Booking Agreement",
    subtitle:
      "Please review the terms and conditions that govern your travel reservations, payments, and platform usage with Be My Traveller.",
    badge: "📜 Verified Booking Terms",
    template: "LEGAL",
    heroImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&auto=format&fit=crop&q=80",
    heroCtaText: "Speak with Legal & Support Desk",
    heroCtaLink: "/contact",
    stats: [
      { value: "100%", label: "Server-Validated Pricing", icon: "✓" },
      { value: "GST & Permits", label: "Included Transparently", icon: "📋" },
      { value: "Bank Grade", label: "Payment Gateway Security", icon: "🔒" },
      { value: "Indian Law", label: "Governing Legal Framework", icon: "⚖️" },
    ],
    sections: [
      {
        title: "1. Scope of Service & Contract Formation",
        content:
          "Be My Traveller provides custom travel curation, tour package arrangements, hotel reservations, and private ground transportation. A booking is legally confirmed once the agreed advance deposit is received and an official Booking Confirmation Voucher is issued by our system.",
        icon: "🤝",
      },
      {
        title: "2. Quotations, Pricing & Payment Schedules",
        content:
          "All package prices generated on the platform are server-authoritative and inclusive of applicable GST, vehicle fuel, toll taxes, and driver allowances. Standard payment schedules require 30% advance on confirmation, 40% 15 days before travel, and the remaining 30% upon arrival/check-in.",
        icon: "💳",
      },
      {
        title: "3. Identification & Hotel Check-in Protocols",
        content:
          "All adult travellers must carry valid government-issued photo ID (Aadhaar Card, Passport, Voter ID, or Driving License). PAN cards are not accepted by Indian hotel guidelines. Foreign nationals must provide a valid passport with Indian visa.",
        icon: "🪪",
      },
      {
        title: "4. Vehicle & Driver Regulations in Mountain Terrains",
        content:
          "Private vehicles provided for tour packages operate from 8:00 AM to 8:00 PM for scheduled sightseeing. In mountainous terrains (Himachal, Kashmir, Ladakh, Uttarakhand), night driving is restricted for passenger safety as per local district regulations. AC will be turned off while climbing steep gradients.",
        icon: "🚗",
      },
      {
        title: "5. Force Majeure, Acts of God & Route Alterations",
        content:
          "Be My Traveller is not liable for itinerary disruptions caused by landslides, snow blocks, natural disasters, political strikes, or airline delays. While we make every effort to provide alternative sightseeing, extra costs arising from emergency detours are shared as per actuals.",
        icon: "⚡",
      },
      {
        title: "6. Limitation of Liability & Governing Jurisdiction",
        content:
          "Be My Traveller acts as a principal curator and coordinator between guests and verified service partners. Any disputes arising under these terms are governed by the laws of India and subject to the exclusive jurisdiction of courts in India.",
        icon: "⚖️",
      },
    ],
    seo: {
      metaTitle: "Terms & Conditions | Be My Traveller",
      metaDescription:
        "Read Be My Traveller's official Terms and Conditions covering booking contracts, payment schedules, vehicle guidelines, and travel liabilities.",
      keywords: ["terms and conditions", "travel terms be my traveller", "booking agreement"],
    },
    status: "PUBLISHED",
  },

  privacy: {
    slug: "privacy",
    title: "Privacy Commitment & Data Protection Policy",
    subtitle:
      "We respect your confidentiality. Learn how Be My Traveller safeguards, encrypts, and handles your personal information in compliance with Indian DPDP and global privacy standards.",
    badge: "🔒 High-Grade Data Privacy & Trust",
    template: "LEGAL",
    heroImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80",
    heroCtaText: "Contact Privacy Officer",
    heroCtaLink: "/contact",
    stats: [
      { value: "256-Bit", label: "SSL/TLS Session Encryption", icon: "🛡️" },
      { value: "PCI-DSS", label: "Level 1 Payment Compliance", icon: "💳" },
      { value: "0 Spam", label: "Strict No-Sale Data Policy", icon: "🚫" },
      { value: "DPDP 2023", label: "Indian Data Privacy Compliant", icon: "✓" },
    ],
    sections: [
      {
        title: "1. Information We Collect with Your Consent",
        content:
          "We collect only the personal information required to plan and execute your travel: full name, phone number, email address, number of guests, travel dates, and destination preferences. For special regions requiring Inner Line Permits (such as Ladakh or Sikkim), we securely collect government ID copies solely for permit issuance.",
        icon: "📋",
      },
      {
        title: "2. How Your Data is Used",
        content:
          "Your information is utilized exclusively for generating accurate quotes, issuing hotel and vehicle vouchers, coordinating airport pickups, and sending on-trip concierge updates. We do not sell, rent, or lease your personal data to any third-party marketing companies.",
        icon: "🎯",
      },
      {
        title: "3. Bank-Grade Payment Security",
        content:
          "All online transactions are processed through certified PCI-DSS Level 1 payment gateways (Razorpay). Be My Traveller never stores your credit card numbers, CVV codes, or net banking passwords on our servers.",
        icon: "💳",
      },
      {
        title: "4. Data Retention & Your Rights",
        content:
          "You have the right to request access to your stored personal information, request corrections, or ask for permanent account deletion upon completion of your holiday. Contact privacy@bemytraveller.com for any data privacy requests.",
        icon: "🔏",
      },
    ],
    seo: {
      metaTitle: "Privacy Policy | Be My Traveller",
      metaDescription:
        "Understand how Be My Traveller protects your personal data with 256-bit encryption, strict no-spam policies, and PCI-DSS payment compliance.",
      keywords: ["privacy policy", "data protection be my traveller", "secure travel booking"],
    },
    status: "PUBLISHED",
  },

  contact: {
    slug: "contact",
    title: "24/7 Verified Travel Specialist Concierge & Support",
    subtitle:
      "Have a question about a customized itinerary, corporate retreat, or existing booking? Reach our destination specialists and ground operations hubs directly.",
    badge: "📞 Instant Response Travel Concierge",
    template: "CONTACT",
    heroImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1600&auto=format&fit=crop&q=80",
    heroCtaText: "Start WhatsApp Chat",
    heroCtaLink: "https://wa.me/918091638090",
    stats: [
      { value: "< 5 Mins", label: "Avg WhatsApp Response Time", icon: "⚡" },
      { value: "24/7", label: "Mountain Emergency Fleet Desk", icon: "🏔️" },
      { value: "3 Hubs", label: "Ground Support Operations", icon: "🏢" },
      { value: "100%", label: "Direct Specialist Assistance", icon: "👤" },
    ],
    sections: [
      {
        title: "Corporate Headquarters & Regional Operations",
        subtitle: "Registered Office & Mountain Base Stations",
        content: `**Registered Corporate Office:**
Be My Traveller / RR Digital Solutions
VPO Bhalyana, Tehsil Theog, Shimla, Himachal Pradesh 171201

**Ground Operational Fleet Hubs:**
- **Shimla Hub:** Circular Road, Victory Tunnel, Shimla, HP
- **Manali Base:** Model Town, Mall Road, Manali, HP
- **Kashmir Operations:** Boulevard Road, Dal Lake, Srinagar, J&K`,
        icon: "📍",
      },
    ],
    faqs: [
      {
        question: "How fast can I get a customized quote for my family?",
        answer:
          "Our specialists typically provide a full customized day-by-day itinerary and transparent pricing breakdown within 1 to 2 hours during business hours.",
      },
      {
        question: "Can I speak directly to the specialist who will manage my trip?",
        answer:
          "Yes! You will be connected directly with a dedicated destination manager who has personal ground experience in your chosen region.",
      },
    ],
    seo: {
      metaTitle: "Contact Us | Be My Traveller — 24/7 Custom Travel Concierge",
      metaDescription:
        "Connect with Be My Traveller destination specialists. Reach our 24/7 phone helplines, WhatsApp concierge, and ground operations offices.",
      keywords: ["contact be my traveller", "travel agency phone number", "himachal travel contact"],
    },
    status: "PUBLISHED",
  },
};

/**
 * Retrieves page content by slug:
 * Checks MongoDB first, merges with competitor-grade defaults, and provides resilient fallback.
 */
export async function getPageBySlug(slug: string): Promise<ManagedPageData> {
  const normalizedSlug = slug.trim().toLowerCase();
  const defaultData = DEFAULT_PAGES[normalizedSlug] || DEFAULT_PAGES.about;

  try {
    await connectDB();
    const doc = await PageModel.findOne({ slug: normalizedSlug }).lean();

    if (!doc) {
      return defaultData;
    }

    const docContent = (doc.content as any) || {};

    return {
      slug: doc.slug,
      title: doc.title || defaultData.title,
      subtitle: (docContent.subtitle as string) || defaultData.subtitle,
      badge: (docContent.badge as string) || defaultData.badge,
      template: (doc.template as any) || defaultData.template,
      heroImage: (docContent.heroImage as string) || defaultData.heroImage,
      heroCtaText: (docContent.heroCtaText as string) || defaultData.heroCtaText,
      heroCtaLink: (docContent.heroCtaLink as string) || defaultData.heroCtaLink,
      stats: Array.isArray(docContent.stats) && docContent.stats.length > 0 ? docContent.stats : defaultData.stats,
      sections:
        Array.isArray(docContent.sections) && docContent.sections.length > 0
          ? docContent.sections
          : defaultData.sections,
      faqs: Array.isArray(docContent.faqs) && docContent.faqs.length > 0 ? docContent.faqs : defaultData.faqs,
      highlights:
        Array.isArray(docContent.highlights) && docContent.highlights.length > 0
          ? docContent.highlights
          : defaultData.highlights,
      tableData:
        Array.isArray(docContent.tableData) && docContent.tableData.length > 0
          ? docContent.tableData
          : defaultData.tableData,
      seo: {
        metaTitle: doc.seo?.metaTitle || defaultData.seo?.metaTitle,
        metaDescription: doc.seo?.metaDescription || defaultData.seo?.metaDescription,
        keywords: doc.seo?.keywords || defaultData.seo?.keywords,
      },
      status: (doc.status as any) || "PUBLISHED",
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
    };
  } catch (error) {
    console.error(`[getPageBySlug Error for ${slug}]:`, error);
    return defaultData;
  }
}
