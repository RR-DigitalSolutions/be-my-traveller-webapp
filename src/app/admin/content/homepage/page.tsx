"use client";

import React, { useState, useEffect } from "react";
import SeoContentEditor from "@/components/admin/SeoContentEditor";

type ContentTab =
  | "PACKAGES"
  | "OFFERS"
  | "DESTINATIONS"
  | "THEMES"
  | "WHY_BOOK"
  | "REVIEWS"
  | "ABOUT_US"
  | "FAQS"
  | "CONTENT_AREA";

// ── Types ──
interface PackageItem {
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
}

interface OfferItem {
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
  /** Optional URL to navigate when user clicks offer CTA (internal path or external URL) */
  link?: string;
  isActive: boolean;
  sortOrder: number;
}

// Lightweight catalog types from the DB
interface DbPackage {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  coverImage?: string;
  basePrice?: number;
  startingPrice?: number;
  nights?: number;
  days?: number;
  status?: string;
}

interface DbDestination {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  coverImage?: string;
  region?: string;
  type?: string;
}

interface DestinationCard {
  name: string;
  slug: string;
  tagline: string;
  packages: string;
  price: string;
  img: string;
  tag: string;
  isActive: boolean;
  sortOrder: number;
}

interface ThemePackageItem {
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
}

interface WhyBookPoint {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

interface ReviewItem {
  id: string;
  name: string;
  location: string;
  destination: string;
  rating: number;
  review: string;
  date: string;
  isActive: boolean;
  sortOrder: number;
}

interface AboutHighlight {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface AboutStat {
  id: string;
  number: string;
  label: string;
}

interface AboutUsState {
  badge: string;
  heading: string;
  subheading: string;
  story: string;
  highlights: AboutHighlight[];
  stats: AboutStat[];
  image: string;
  experienceYears: string;
  isActive: boolean;
}

interface FaqAdminItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

interface FaqsState {
  badge: string;
  heading: string;
  subheading: string;
  items: FaqAdminItem[];
  isActive: boolean;
}

interface SeoContentState {
  title: string;
  subtitle: string;
  htmlContent: string;
  aiSummary: string;
  keywords: string[];
  readMoreThreshold: number;
  isActive: boolean;
}

// ── Defaults ──
const DEFAULT_PACKAGES: PackageItem[] = [
  {
    id: "pkg-1",
    slug: "5-nights-kashmir-paradise-tour",
    title: "5 Nights 6 Days Heavenly Kashmir Paradise with Houseboat & Gulmarg Gondola",
    destination: "Srinagar (2N) · Gulmarg (1N) · Pahalgam (2N)",
    nights: "5N / 6D",
    originalPrice: "₹38,000",
    price: "₹24,500",
    discount: "35% OFF",
    rating: 4.9,
    reviews: 340,
    inclusions: ["4★ Deluxe Stays & Houseboat", "Daily Breakfast & Dinner (MAP)", "Private Sedan Cab for all Sightseeing", "Shikara Ride on Dal Lake Included"],
    img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
    tag: "Top Rated 2026",
    isActive: true,
    sortOrder: 0,
  },
  {
    id: "pkg-2",
    slug: "6-nights-shimla-manali-honeymoon",
    title: "6 Nights 7 Days Majestic Himachal: Shimla, Kullu & Solang Valley Adventure",
    destination: "Shimla (2N) · Manali (3N) · Chandigarh (1N)",
    nights: "6N / 7D",
    originalPrice: "₹29,999",
    price: "₹18,999",
    discount: "37% OFF",
    rating: 4.8,
    reviews: 512,
    inclusions: ["Valley View 4★ Hotels", "Buffet Breakfast & Dinner", "Rohtang & Solang Excursion", "Private Dedicated Cab Ex-Delhi"],
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
    tag: "Best Seller",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "pkg-3",
    slug: "5-nights-kerala-backwaters-munnar",
    title: "5 Nights 6 Days Serene Kerala: Munnar Tea Gardens, Thekkady & Alleppey Houseboat",
    destination: "Cochin · Munnar (2N) · Thekkady (1N) · Alleppey (1N)",
    nights: "5N / 6D",
    originalPrice: "₹32,500",
    price: "₹21,999",
    discount: "32% OFF",
    rating: 4.9,
    reviews: 289,
    inclusions: ["Private A/C Deluxe Houseboat with all meals", "Premium Tea Plantation Resort", "Periyar Wildlife Sanctuary Visit", "Private A/C Cab for entire tour"],
    img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80",
    tag: "Romantic Pick",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "pkg-4",
    slug: "6-nights-royal-rajasthan-heritage",
    title: "6 Nights 7 Days Royal Rajasthan: Jaipur Forts, Jodhpur Blue City & Udaipur Palaces",
    destination: "Jaipur (2N) · Jodhpur (2N) · Udaipur (2N)",
    nights: "6N / 7D",
    originalPrice: "₹34,000",
    price: "₹22,500",
    discount: "34% OFF",
    rating: 4.8,
    reviews: 198,
    inclusions: ["Heritage Haveli & 4★ Hotel Stays", "Daily Royal Breakfast", "Lake Pichola Boat Ride included", "Dedicated Chauffeur Driven Cab"],
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
    tag: "Heritage Classic",
    isActive: true,
    sortOrder: 3,
  },
];

const DEFAULT_OFFERS: OfferItem[] = [
  {
    id: "offer-festive",
    badge: "FESTIVE SPECIAL",
    validity: "Valid Till Dec 2026",
    title: "Flat ₹5,000 OFF on All Domestic Customized Tours",
    description: "Applicable on Kashmir, Himachal, Kerala, Andaman, and Rajasthan itineraries with min. 4 Nights.",
    code: "BMTFEST",
    ctaText: "Claim ₹5,000 OFF →",
    gradient: "from-amber-500 to-amber-600",
    badgeBg: "bg-slate-950",
    badgeText: "text-amber-400",
    textColor: "text-slate-950",
    buttonBg: "bg-slate-950 hover:bg-slate-900",
    buttonText: "text-amber-400",
    codeBg: "bg-slate-950/15",
    codeBorder: "border-slate-950/20",
    codeText: "text-slate-950",
    enquiryName: "Festive Offer (BMTFEST - ₹5,000 OFF)",
    isActive: true,
    sortOrder: 0,
  },
  {
    id: "offer-earlybird",
    badge: "EARLY BIRD",
    validity: "Advance Bookings",
    title: "Flat 15% OFF on Himalayan & International Holidays",
    description: "Book 30 days in advance to unlock 15% discount on Bali, Dubai, Ladakh, and Sikkim packages.",
    code: "EARLYBIRD",
    ctaText: "Claim 15% OFF →",
    gradient: "from-slate-900 via-slate-800 to-slate-900",
    badgeBg: "bg-amber-500",
    badgeText: "text-slate-950",
    textColor: "text-white",
    buttonBg: "bg-amber-500 hover:bg-amber-400",
    buttonText: "text-slate-950",
    codeBg: "bg-slate-800",
    codeBorder: "border-slate-700",
    codeText: "text-amber-400",
    enquiryName: "Early Bird Offer (EARLYBIRD - 15% OFF)",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "offer-honeymoon",
    badge: "HONEYMOON SPECIAL",
    validity: "Couples Only",
    title: "Complimentary Candlelight Dinner + Room Upgrade",
    description: "Free romantic dinner, floral bed decor, and honeymoon cake on all premium resort bookings.",
    code: "HONEYMOON5000",
    ctaText: "Unlock Inclusions →",
    gradient: "from-rose-500 via-rose-600 to-pink-600",
    badgeBg: "bg-white",
    badgeText: "text-rose-600",
    textColor: "text-white",
    buttonBg: "bg-white hover:bg-rose-50",
    buttonText: "text-rose-700",
    codeBg: "bg-white/20",
    codeBorder: "border-white/30",
    codeText: "text-white",
    enquiryName: "Honeymoon Special Inclusions Offer",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "offer-group",
    badge: "GROUP & FAMILY",
    validity: "Min. 6 Travellers",
    title: "Get ₹8,000 OFF + Free Guided Sightseeing Tour",
    description: "Extra group savings on Rajasthan royal heritage circuits, Goa private beach villas, and Kerala backwaters.",
    code: "BMTGROUP",
    ctaText: "Claim Group Deal →",
    gradient: "from-emerald-600 via-teal-600 to-emerald-700",
    badgeBg: "bg-slate-950",
    badgeText: "text-emerald-400",
    textColor: "text-white",
    buttonBg: "bg-slate-950 hover:bg-slate-900",
    buttonText: "text-emerald-400",
    codeBg: "bg-white/15",
    codeBorder: "border-white/25",
    codeText: "text-white",
    enquiryName: "Group & Family Special (BMTGROUP - ₹8,000 OFF)",
    isActive: true,
    sortOrder: 3,
  },
];

const DEFAULT_DOMESTIC_DESTINATIONS: DestinationCard[] = [
  { name: "Himachal Pradesh", slug: "himachal-pradesh", tagline: "Manali, Shimla, Dharamshala, Spiti", packages: "24 Packages", price: "From ₹18,999", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80", tag: "Top Selling", isActive: true, sortOrder: 0 },
  { name: "Kashmir Paradise", slug: "kashmir", tagline: "Srinagar, Gulmarg, Pahalgam, Sonmarg", packages: "18 Packages", price: "From ₹24,500", img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80", tag: "Snow Specials", isActive: true, sortOrder: 1 },
  { name: "Kerala Backwaters", slug: "kerala", tagline: "Munnar, Alleppey Houseboat, Thekkady", packages: "21 Packages", price: "From ₹21,999", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80", tag: "Romantic", isActive: true, sortOrder: 2 },
  { name: "Royal Rajasthan", slug: "rajasthan", tagline: "Jaipur, Udaipur, Jodhpur, Jaisalmer", packages: "16 Packages", price: "From ₹19,500", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80", tag: "Heritage", isActive: true, sortOrder: 3 },
  { name: "Andaman Islands", slug: "andaman", tagline: "Havelock, Neil Island, Port Blair", packages: "14 Packages", price: "From ₹28,999", img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop&q=80", tag: "Beach Holiday", isActive: true, sortOrder: 4 },
  { name: "Goa Coastal Escapes", slug: "goa", tagline: "North Goa Beach Clubs, South Goa Stays", packages: "20 Packages", price: "From ₹12,999", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80", tag: "Trending", isActive: true, sortOrder: 5 },
];

const DEFAULT_INTL_DESTINATIONS: DestinationCard[] = [
  { name: "Dubai & Abu Dhabi", slug: "dubai", tagline: "Burj Khalifa, Desert Safari, Marina Dhow", packages: "15 Packages", price: "From ₹48,999", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80", tag: "Visa Included", isActive: true, sortOrder: 0 },
  { name: "Bali Tropical Villas", slug: "bali", tagline: "Ubud Jungles, Seminyak, Nusa Penida", packages: "19 Packages", price: "From ₹38,500", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80", tag: "Private Pool Stays", isActive: true, sortOrder: 1 },
  { name: "Thailand Holiday", slug: "thailand", tagline: "Phuket, Krabi, Bangkok, Pattaya", packages: "22 Packages", price: "From ₹29,999", img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&auto=format&fit=crop&q=80", tag: "Visa On Arrival", isActive: true, sortOrder: 2 },
  { name: "Vietnam Wonders", slug: "vietnam", tagline: "Hanoi, Ha Long Bay Cruise, Da Nang", packages: "12 Packages", price: "From ₹44,999", img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80", tag: "Trending 2026", isActive: true, sortOrder: 3 },
];

const DEFAULT_THEME_PACKAGES: ThemePackageItem[] = [
  {
    id: "tp-1",
    theme: "honeymoon",
    title: "5 Nights 6 Days Heavenly Kashmir Honeymoon with Gulmarg Gondola",
    destination: "Srinagar (2N) · Gulmarg (1N) · Pahalgam (2N)",
    nights: "5 Nights / 6 Days",
    originalPrice: "₹45,000",
    price: "₹34,999",
    discount: "22% OFF",
    rating: 4.9,
    reviews: 210,
    specialInclusion: "Candlelight Dinner & Shikara Sunset Ride",
    img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
    badge: "Honeymoon Special",
    slug: "5-nights-kashmir-gulmarg-tour",
    isActive: true,
    sortOrder: 0,
  },
  {
    id: "tp-2",
    theme: "adventure",
    title: "6 Nights 7 Days Spiti Valley Rugged Road Trip via Kaza & Chandratal",
    destination: "Shimla (1N) · Kalpa (1N) · Kaza (2N) · Chandratal (1N) · Manali (1N)",
    nights: "6 Nights / 7 Days",
    originalPrice: "₹38,000",
    price: "₹29,500",
    discount: "22% OFF",
    rating: 4.8,
    reviews: 142,
    specialInclusion: "Dedicated 4x4 Vehicle & Expert Driver",
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
    badge: "High Altitude Thrill",
    slug: "6-nights-spiti-valley-circuit-road-trip",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "tp-3",
    theme: "heritage",
    title: "6 Nights 7 Days Royal Rajasthan Forts & Desert Safari Tour",
    destination: "Jaipur (2N) · Jodhpur (1N) · Jaisalmer (2N) · Bikaner (1N)",
    nights: "6 Nights / 7 Days",
    originalPrice: "₹42,000",
    price: "₹32,999",
    discount: "21% OFF",
    rating: 4.9,
    reviews: 185,
    specialInclusion: "Luxury Desert Camp with Folk Dance & Dinner",
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
    badge: "Royal Heritage",
    slug: "6-nights-royal-rajasthan-forts-tour",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "tp-4",
    theme: "beach",
    title: "5 Nights 6 Days Blissful Andaman Beach Getaway with Havelock Ferry",
    destination: "Port Blair (2N) · Havelock (2N) · Neil Island (1N)",
    nights: "5 Nights / 6 Days",
    originalPrice: "₹48,000",
    price: "₹36,999",
    discount: "23% OFF",
    rating: 4.9,
    reviews: 164,
    specialInclusion: "Premium Catamaran Ferry Tickets Included",
    img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop&q=80",
    badge: "Tropical Paradise",
    slug: "5-nights-andaman-havelock-island-getaway",
    isActive: true,
    sortOrder: 3,
  },
];

const DEFAULT_POINTS: WhyBookPoint[] = [
  { id: "wp-1", icon: "⚡", title: "Authoritative Pricing & Zero Hidden Fees", description: "Dynamic real-time calculations for seasonal dates, meal plans, and room upgrades. The exact price you see is what you pay — zero surprise charges at checkout.", color: "amber", isActive: true, sortOrder: 0 },
  { id: "wp-2", icon: "🎯", title: "100% Tailored & Flexible Itineraries", description: "Every holiday is customized to your preferences. Modify hotel categories, adjust trip pacing, add adventure sports, and enjoy private transfers on your schedule.", color: "blue", isActive: true, sortOrder: 1 },
  { id: "wp-3", icon: "🔒", title: "Booking Security & Easy Rescheduling", description: "Travel with complete confidence. Structured advance token payments, official hotel vouchers, and traveler-friendly policies with penalty-free date adjustments.", color: "emerald", isActive: true, sortOrder: 2 },
  { id: "wp-4", icon: "🏔️", title: "Direct Local Fleets & Zero Middlemen", description: "Our dedicated regional desks in Manali, Ahmedabad, and New Delhi connect you directly to sanitized commercial cabs and partner properties with no intermediary markups.", color: "purple", isActive: true, sortOrder: 3 },
];

const DEFAULT_REVIEWS: ReviewItem[] = [
  { id: "r1", name: "Ananya Sharma", location: "Mumbai", destination: "Himachal Pradesh", rating: 5, review: "Our Himachal trip with Be My Traveller was magical. The cab driver in Manali was polite, the river-facing resort was breathtaking, and the Rohtang Pass permits were arranged seamlessly.", date: "Sep 2026", isActive: true, sortOrder: 0 },
  { id: "r2", name: "Rohan & Priya Mehta", location: "Bengaluru", destination: "Kerala", rating: 5, review: "We booked our honeymoon to Kerala through Be My Traveller. The Alleppey luxury houseboat chef prepared amazing authentic meals. Will definitely book Kashmir next winter!", date: "Aug 2026", isActive: true, sortOrder: 1 },
  { id: "r3", name: "Vikramaditya Rao", location: "Hyderabad", destination: "Rajasthan", rating: 5, review: "Exceptional service. When our flight from Delhi was delayed, their support team immediately rescheduled our airport cab without extra charges. Highly recommended!", date: "Oct 2026", isActive: true, sortOrder: 2 },
];

const DEFAULT_ABOUT_US: AboutUsState = {
  badge: "ABOUT BE MY TRAVELLER",
  heading: "Crafting Extraordinary Journeys Across India & The World",
  subheading: "With over 7 years of specialized tour operating experience, we turn your holiday dreams into seamless, memory-filled realities.",
  story: "Headquartered in the majestic valley of Manali with dedicated regional operations across Ahmedabad (Gujarat), New Delhi, and major tourist hubs, Be My Traveller is India's trusted travel partner. We specialize in personalized holiday itineraries, signature tour packages with authentic Indian food, verified 4★ and 5★ accommodations, and chauffeur-driven sanitized cabs. Whether you are seeking snow-draped peaks in Kashmir and Himachal, tranquil backwaters in Kerala, royal palaces in Rajasthan, or tropical retreats in Bali and Dubai, our 24/7 on-trip concierge ensures every moment of your vacation is comfortable, safe, and tailored exactly to your rhythm.",
  highlights: [
    { id: "h1", icon: "🏨", title: "Handpicked & Verified Stays", description: "Every hotel, resort, and houseboat is physically vetted for scenic views, hygiene, and guest hospitality." },
    { id: "h2", icon: "🚗", title: "Private Dedicated Cabs", description: "Clean, commercial-permit vehicles driven by polite chauffeurs who know local terrain and mountain passes." },
    { id: "h3", icon: "🍲", title: "Signature Meals with Care", description: "Carefully planned MAP buffet meals offering comforting, hygienic Indian food across all destinations." },
    { id: "h4", icon: "🛡️", title: "24/7 On-Trip Concierge", description: "Real-time trip coordinator supporting you from airport arrival to permits, check-ins, and return transfers." },
  ],
  stats: [
    { id: "s1", number: "7+ Yrs", label: "Industry Experience" },
    { id: "s2", number: "25,000+", label: "Happy Travellers" },
    { id: "s3", number: "500+", label: "Curated Packages" },
    { id: "s4", number: "4.9 ★", label: "Customer Rating" },
  ],
  image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
  experienceYears: "7+",
  isActive: true,
};

const DEFAULT_FAQS_STATE: FaqsState = {
  badge: "FREQUENTLY ASKED QUESTIONS",
  heading: "Frequently Asked Questions",
  subheading: "Everything you need to know about planning, customizing, and booking your dream vacation with Be My Traveller.",
  items: [
    {
      id: "faq-1",
      question: "Why should I book my holiday package with Be My Traveller?",
      answer: "Be My Traveller combines 7+ years of ground destination expertise with authoritative real-time pricing and dedicated 24/7 on-trip concierge support. Unlike aggregators that sell rigid cookie-cutter tours, we customize every day of your itinerary, handpick verified 4★ and 5★ properties, assign experienced commercial chauffeurs with sanitized private cabs, and guarantee 100% transparent pricing with zero surprise charges.",
      category: "GENERAL",
      isActive: true,
      sortOrder: 0,
    },
    {
      id: "faq-2",
      question: "Can I customize the itinerary, hotel categories, and travel dates?",
      answer: "Yes, absolutely! Every package on Be My Traveller is 100% tailor-made. You can swap hotels (from Standard to 4★ Deluxe or 5★ Luxury), add or reduce nights, include special sightseeing (like Rohtang Pass, Shikara sunset rides, or desert camps), change meal plans (CP/MAP), or build an outstation multi-city tour. Use our interactive Custom Planner or speak directly with our destination specialists.",
      category: "CUSTOMIZATION",
      isActive: true,
      sortOrder: 1,
    },
    {
      id: "faq-3",
      question: "How does payment and booking confirmation work?",
      answer: "Booking with us is safe and transparent. You can secure your reservation by paying a flexible advance token deposit (typically 20% to 30%). The remaining balance is payable in structured milestones prior to departure. You receive an instant digital invoice, booking voucher, and official hotel confirmations directly on WhatsApp and email.",
      category: "BOOKING",
      isActive: true,
      sortOrder: 2,
    },
    {
      id: "faq-4",
      question: "What is typically included in your holiday tour packages?",
      answer: "Our standard holiday packages include vetted hotel/resort/houseboat accommodations, daily breakfast and dinner (MAP buffet plan), a dedicated private A/C or non-A/C cab for all transfers and sightseeing as per itinerary, driver allowances, toll taxes, state permits, and fuel charges. Sightseeing entry tickets, adventure sports, and personal expenses are clearly itemized before booking.",
      category: "BOOKING",
      isActive: true,
      sortOrder: 3,
    },
    {
      id: "faq-5",
      question: "Do you arrange private airport/railway station cabs and outstation rentals?",
      answer: "Yes! We operate our own fleet of commercial-permit vehicles including Sedans (Dzire, Etios), SUVs (Ertiga, Carens), Premium SUVs (Innova Crysta), Luxury vehicles (Fortuner, BMW), and 12/17/26-seater Maharaja Tempo Travellers. All drivers are commercially licensed, verified, and well-trained in mountain terrains.",
      category: "CABS",
      isActive: true,
      sortOrder: 4,
    },
    {
      id: "faq-6",
      question: "What is your cancellation and rescheduling policy?",
      answer: "We understand that travel plans may need adjustments. We offer traveler-friendly policies including date rescheduling without penalty when notified in advance, credit shells, or refund calculations in accordance with hotel partner cancellation timelines. Our on-trip concierge desk works proactively to minimize cancellation deductions.",
      category: "CANCELLATION",
      isActive: true,
      sortOrder: 5,
    },
  ],
  isActive: true,
};

const DEFAULT_SEO_CONTENT: SeoContentState = {
  title: "Be My Traveller – Bespoke Holiday Packages & Curated Travel Experiences Across India & Worldwide",
  subtitle: "Discover India & International Destinations with Customized Itineraries & Transparent Pricing",
  htmlContent: `<p>As an accredited destination specialist and tour operator, <strong><a href="/packages" class="seo-link">Be My Traveller</a></strong> designs bespoke holidays, curated group itineraries, and luxury escapes across India and premier international destinations. From thought-through itineraries and signature tours featuring comforting Indian meals to vetted 4★ and 5★ accommodations and dedicated chauffeur-driven cabs, we bring warmth and personalized care to every vacation. Headquartered in <strong>Manali</strong> with regional operations in <strong>Ahmedabad (Gujarat)</strong> and <strong>New Delhi</strong>, we provide seamless on-ground support, authoritative pricing, and 24/7 on-trip concierge assistance.</p>

<p class="italic text-slate-700 font-medium">Your trusted travel partner in discovering the world, crafted precisely to your rhythm.</p>

<h2>Why Choose Be My Traveller for Your Holidays?</h2>
<p>Crafting the perfect vacation requires meticulous attention to detail, insider destination expertise, and flawless ground execution. At Be My Traveller, our philosophy centers on providing authentic travel experiences without rigid timetables or hidden markups. Through our direct network of verified partner hotels, luxury desert camps, private backwater houseboats, and sanitized private cabs, we ensure total peace of mind for families, couples, and group travelers alike.</p>

<h3>Customized Holiday Packages Across India</h3>
<p>Discover the majesty of the Himalayas through our <a href="/destination/india/himachal-pradesh-tour-packages" class="seo-link">Himachal Pradesh Tour Packages</a> and <a href="/destination/india/kashmir-tour-packages" class="seo-link">Kashmir Tour Packages</a> featuring Dal Lake houseboat stays and Gulmarg Gondola adventures. Experience royal palaces and Thar desert camps with our <a href="/destination/india/rajasthan-tour-packages" class="seo-link">Royal Rajasthan Tour Packages</a>. For tropical tranquility, our <a href="/destination/india/kerala-tour-packages" class="seo-link">Kerala Backwater Holidays</a> and <a href="/destination/india/andaman-tour-packages" class="seo-link">Andaman Island Escapes</a> offer serene beachside relaxation.</p>

<h3>International Escapes & Luxury Stays</h3>
<p>Looking to travel overseas? We curate bespoke international journeys to <a href="/destination/dubai-tour-packages" class="seo-link">Dubai &amp; Abu Dhabi</a>, <a href="/destination/bali-tour-packages" class="seo-link">Bali Tropical Villas</a>, Thailand, and Vietnam. From visa-on-arrival assistance to private airport transfers and guided city tours, our international travel specialists handle every single arrangement.</p>

<h3>Transparent Server-Authoritative Pricing & 24/7 On-Trip Assistance</h3>
<p>Unlike conventional travel portals that surprise you with convenience fees and hidden surcharges at checkout, Be My Traveller guarantees 100% transparent pricing. During your trip, our dedicated 24/7 on-trip concierge desk remains just a WhatsApp message or call away, taking care of road updates, permit clearances, and itinerary adjustments in real-time.</p>`,
  aiSummary: "Be My Traveller is an accredited tour operator and destination specialist headquartered in Manali with key operations in Ahmedabad, Gujarat. They specialize in tailor-made domestic and international holiday packages, private cab rentals, luxury stays, and 24/7 on-trip concierge support with transparent pricing.",
  keywords: [
    "Tour Operator in India",
    "Custom Travel Packages",
    "Ahmedabad Travel Agent",
    "Manali Tour Operator",
    "Kashmir Packages",
    "Himachal Holiday Packages",
    "Kerala Backwaters",
    "Be My Traveller",
  ],
  readMoreThreshold: 350,
  isActive: true,
};

export default function HomepageContentAdmin() {
  const [activeTab, setActiveTab] = useState<ContentTab>("PACKAGES");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Section States
  const [packages, setPackages] = useState<PackageItem[]>(DEFAULT_PACKAGES);
  const [offers, setOffers] = useState<OfferItem[]>(DEFAULT_OFFERS);
  const [domesticSpots, setDomesticSpots] = useState<DestinationCard[]>(DEFAULT_DOMESTIC_DESTINATIONS);
  const [intlSpots, setIntlSpots] = useState<DestinationCard[]>(DEFAULT_INTL_DESTINATIONS);
  const [themePackages, setThemePackages] = useState<ThemePackageItem[]>(DEFAULT_THEME_PACKAGES);
  const [whyBookHeading, setWhyBookHeading] = useState("Why Book with Be My Traveller?");
  const [whyBookSubheading, setWhyBookSubheading] = useState("We combine server-authoritative transparent pricing with direct local ground operations and guaranteed booking protection.");
  const [whyBookTrustBadge, setWhyBookTrustBadge] = useState("TRANSPARENT · CUSTOMIZED · GUARANTEED");
  const [whyBookPoints, setWhyBookPoints] = useState<WhyBookPoint[]>(DEFAULT_POINTS);
  const [whyBookImages, setWhyBookImages] = useState({
    img1: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
    img2: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
    img3: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80",
    img4: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
  });
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS);

  // ── About Us States ──
  const [aboutBadge, setAboutBadge] = useState(DEFAULT_ABOUT_US.badge);
  const [aboutHeading, setAboutHeading] = useState(DEFAULT_ABOUT_US.heading);
  const [aboutSubheading, setAboutSubheading] = useState(DEFAULT_ABOUT_US.subheading);
  const [aboutStory, setAboutStory] = useState(DEFAULT_ABOUT_US.story);
  const [aboutHighlights, setAboutHighlights] = useState<AboutHighlight[]>(DEFAULT_ABOUT_US.highlights);
  const [aboutStats, setAboutStats] = useState<AboutStat[]>(DEFAULT_ABOUT_US.stats);
  const [aboutImage, setAboutImage] = useState(DEFAULT_ABOUT_US.image);
  const [aboutExperienceYears, setAboutExperienceYears] = useState(DEFAULT_ABOUT_US.experienceYears);
  const [aboutIsActive, setAboutIsActive] = useState(DEFAULT_ABOUT_US.isActive);

  // ── FAQs States ──
  const [faqsBadge, setFaqsBadge] = useState(DEFAULT_FAQS_STATE.badge);
  const [faqsHeading, setFaqsHeading] = useState(DEFAULT_FAQS_STATE.heading);
  const [faqsSubheading, setFaqsSubheading] = useState(DEFAULT_FAQS_STATE.subheading);
  const [faqItems, setFaqItems] = useState<FaqAdminItem[]>(DEFAULT_FAQS_STATE.items);
  const [faqsIsActive, setFaqsIsActive] = useState(DEFAULT_FAQS_STATE.isActive);
  const [editFaq, setEditFaq] = useState<FaqAdminItem | null>(null);

  // ── SEO / AEO Content Area States ──
  const [seoTitle, setSeoTitle] = useState(DEFAULT_SEO_CONTENT.title);
  const [seoSubtitle, setSeoSubtitle] = useState(DEFAULT_SEO_CONTENT.subtitle);
  const [seoHtmlContent, setSeoHtmlContent] = useState(DEFAULT_SEO_CONTENT.htmlContent);
  const [seoAiSummary, setSeoAiSummary] = useState(DEFAULT_SEO_CONTENT.aiSummary);
  const [seoKeywords, setSeoKeywords] = useState<string[]>(DEFAULT_SEO_CONTENT.keywords);
  const [seoReadMoreThreshold, setSeoReadMoreThreshold] = useState(DEFAULT_SEO_CONTENT.readMoreThreshold);
  const [seoIsActive, setSeoIsActive] = useState(DEFAULT_SEO_CONTENT.isActive);

  // Edit Modals
  const [editPkg, setEditPkg] = useState<PackageItem | null>(null);
  const [editOffer, setEditOffer] = useState<OfferItem | null>(null);
  const [editSpot, setEditSpot] = useState<{ spot: DestinationCard; type: "domestic" | "international"; index: number } | null>(null);
  const [editThemePkg, setEditThemePkg] = useState<ThemePackageItem | null>(null);
  const [editPoint, setEditPoint] = useState<WhyBookPoint | null>(null);
  const [editReview, setEditReview] = useState<ReviewItem | null>(null);

  // ── DB Picker States ──
  // Packages picker
  const [showPkgPicker, setShowPkgPicker] = useState(false);
  const [dbPackages, setDbPackages] = useState<DbPackage[]>([]);
  const [dbPkgLoading, setDbPkgLoading] = useState(false);
  const [dbPkgSearch, setDbPkgSearch] = useState("");
  const [selectedDbPkgIds, setSelectedDbPkgIds] = useState<Set<string>>(new Set());

  // Domestic destinations picker
  const [showDomPicker, setShowDomPicker] = useState(false);
  const [dbDestinations, setDbDestinations] = useState<DbDestination[]>([]);
  const [dbDestLoading, setDbDestLoading] = useState(false);
  const [dbDestSearch, setDbDestSearch] = useState("");

  // International destinations picker
  const [showIntlPicker, setShowIntlPicker] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch DB packages for picker
  const fetchDbPackages = async () => {
    setDbPkgLoading(true);
    try {
      const res = await fetch("/api/v1/admin/packages?status=ACTIVE");
      const data = await res.json();
      if (data.success && Array.isArray(data.packages)) {
        setDbPackages(data.packages);
      }
    } catch {
      showToast("Failed to load packages from database", "error");
    } finally {
      setDbPkgLoading(false);
    }
  };

  // Fetch DB destinations for picker
  const fetchDbDestinations = async () => {
    setDbDestLoading(true);
    try {
      const res = await fetch("/api/v1/admin/destinations");
      const data = await res.json();
      if (Array.isArray(data.destinations)) {
        setDbDestinations(data.destinations);
      } else if (Array.isArray(data)) {
        setDbDestinations(data);
      }
    } catch {
      showToast("Failed to load destinations from database", "error");
    } finally {
      setDbDestLoading(false);
    }
  };

  // Convert a DB package to a homepage PackageItem card
  const dbPkgToCard = (p: DbPackage): PackageItem => ({
    id: p._id,
    slug: p.slug,
    title: p.name,
    destination: p.tagline || p.name,
    nights: p.nights && p.days ? `${p.nights}N / ${p.days}D` : "5N / 6D",
    originalPrice: p.basePrice ? `₹${p.basePrice.toLocaleString("en-IN")}` : "₹30,000",
    price: p.startingPrice ? `₹${p.startingPrice.toLocaleString("en-IN")}` : "₹22,999",
    discount: p.basePrice && p.startingPrice ? `${Math.round(((p.basePrice - p.startingPrice) / p.basePrice) * 100)}% OFF` : "25% OFF",
    rating: 4.8,
    reviews: 100,
    inclusions: ["Hotel Stay", "Private Cab", "Daily Meals"],
    img: p.coverImage || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    tag: "Featured",
    isActive: true,
    sortOrder: packages.length,
  });

  // Convert a DB destination to a homepage DestinationCard
  const dbDestToCard = (d: DbDestination, type: "domestic" | "international"): DestinationCard => ({
    name: d.name,
    slug: d.slug,
    tagline: d.tagline || d.name,
    packages: "View Packages",
    price: "From ₹15,000",
    img: d.coverImage || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    tag: d.region || (type === "international" ? "International" : "Domestic"),
    isActive: true,
    sortOrder: type === "domestic" ? domesticSpots.length : intlSpots.length,
  });


  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/admin/homepage-content");
        const data = await res.json();
        if (data.success && data.content) {
          const c = data.content;
          if (c.featuredPackages?.length > 0) setPackages(c.featuredPackages);
          if (c.specialOffers?.length > 0) setOffers(c.specialOffers);
          if (c.popularDestinations?.domestic?.length > 0) setDomesticSpots(c.popularDestinations.domestic);
          if (c.popularDestinations?.international?.length > 0) setIntlSpots(c.popularDestinations.international);
          if (c.themePackages?.length > 0) setThemePackages(c.themePackages);
          if (c.whyBook?.heading) setWhyBookHeading(c.whyBook.heading);
          if (c.whyBook?.subheading) setWhyBookSubheading(c.whyBook.subheading);
          if (c.whyBook?.trustBadge) setWhyBookTrustBadge(c.whyBook.trustBadge);
          if (c.whyBook?.points?.length > 0) setWhyBookPoints(c.whyBook.points);
          if (c.whyBook?.images) setWhyBookImages(c.whyBook.images);
          if (c.reviews?.length > 0) setReviews(c.reviews);
          if (c.aboutUs) {
            if (c.aboutUs.badge) setAboutBadge(c.aboutUs.badge);
            if (c.aboutUs.heading) setAboutHeading(c.aboutUs.heading);
            if (c.aboutUs.subheading) setAboutSubheading(c.aboutUs.subheading);
            if (c.aboutUs.story) setAboutStory(c.aboutUs.story);
            if (c.aboutUs.highlights?.length > 0) setAboutHighlights(c.aboutUs.highlights);
            if (c.aboutUs.stats?.length > 0) setAboutStats(c.aboutUs.stats);
            if (c.aboutUs.image) setAboutImage(c.aboutUs.image);
            if (c.aboutUs.experienceYears) setAboutExperienceYears(c.aboutUs.experienceYears);
            if (typeof c.aboutUs.isActive === "boolean") setAboutIsActive(c.aboutUs.isActive);
          }
          if (c.faqs) {
            if (c.faqs.badge) setFaqsBadge(c.faqs.badge);
            if (c.faqs.heading) setFaqsHeading(c.faqs.heading);
            if (c.faqs.subheading) setFaqsSubheading(c.faqs.subheading);
            if (c.faqs.items?.length > 0) setFaqItems(c.faqs.items);
            if (typeof c.faqs.isActive === "boolean") setFaqsIsActive(c.faqs.isActive);
          }
          if (c.seoContent) {
            if (c.seoContent.title) setSeoTitle(c.seoContent.title);
            if (c.seoContent.subtitle) setSeoSubtitle(c.seoContent.subtitle);
            if (c.seoContent.htmlContent) setSeoHtmlContent(c.seoContent.htmlContent);
            if (c.seoContent.aiSummary) setSeoAiSummary(c.seoContent.aiSummary);
            if (c.seoContent.keywords?.length > 0) setSeoKeywords(c.seoContent.keywords);
            if (typeof c.seoContent.readMoreThreshold === "number") setSeoReadMoreThreshold(c.seoContent.readMoreThreshold);
            if (typeof c.seoContent.isActive === "boolean") setSeoIsActive(c.seoContent.isActive);
          }
        }
      } catch (err) {
        console.error("Error fetching homepage content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/homepage-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featuredPackages: packages,
          specialOffers: offers,
          popularDestinations: { domestic: domesticSpots, international: intlSpots },
          themePackages,
          whyBook: {
            heading: whyBookHeading,
            subheading: whyBookSubheading,
            trustBadge: whyBookTrustBadge,
            points: whyBookPoints,
            images: whyBookImages,
          },
          reviews,
          aboutUs: {
            badge: aboutBadge,
            heading: aboutHeading,
            subheading: aboutSubheading,
            story: aboutStory,
            highlights: aboutHighlights,
            stats: aboutStats,
            image: aboutImage,
            experienceYears: aboutExperienceYears,
            isActive: aboutIsActive,
          },
          faqs: {
            badge: faqsBadge,
            heading: faqsHeading,
            subheading: faqsSubheading,
            items: faqItems,
            isActive: faqsIsActive,
          },
          seoContent: {
            title: seoTitle,
            subtitle: seoSubtitle,
            htmlContent: seoHtmlContent,
            aiSummary: seoAiSummary,
            keywords: seoKeywords,
            readMoreThreshold: seoReadMoreThreshold,
            isActive: seoIsActive,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Homepage content saved & published successfully!");
      } else {
        showToast(data.error || "Failed to save homepage content", "error");
      }
    } catch {
      showToast("Network error while saving homepage content", "error");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: ContentTab; label: string; count: number; icon: string }[] = [
    { key: "PACKAGES", label: "Best-Selling Packages", count: packages.length, icon: "🏖️" },
    { key: "OFFERS", label: "Special Offers & Discounts", count: offers.length, icon: "🏷️" },
    { key: "DESTINATIONS", label: "Popular Holiday Spots", count: domesticSpots.length + intlSpots.length, icon: "📍" },
    { key: "THEMES", label: "Speciality Theme Packages", count: themePackages.length, icon: "✨" },
    { key: "WHY_BOOK", label: "Why Book Trust Section", count: whyBookPoints.length, icon: "🛡️" },
    { key: "REVIEWS", label: "Customer Reviews", count: reviews.length, icon: "⭐" },
    { key: "ABOUT_US", label: "About Be My Traveller", count: aboutHighlights.length, icon: "ℹ️" },
    { key: "FAQS", label: "Homepage FAQs", count: faqItems.length, icon: "❓" },
    { key: "CONTENT_AREA", label: "SEO & AI Content Area", count: 1, icon: "📝" },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-xs font-bold transition-all animate-in fade-in slide-in-from-top-3 ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Header Bar with Save & Publish Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">CMS · Content Management</span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Homepage Dynamic Content Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Easily manage all 6 key dynamic sections on the Be My Traveller homepage with immediate live publishing.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Save &amp; Publish Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 bg-white p-2 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === tab.key ? "bg-slate-950/20 text-slate-950" : "bg-slate-200 text-slate-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading homepage dynamic configuration...</p>
        </div>
      ) : (
        <>
          {/* ══════════════════════════════════════════════════════════
              TAB 1: BEST-SELLING HOLIDAY PACKAGES CAROUSEL
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "PACKAGES" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Featured Packages Carousel Cards</h2>
                  <p className="text-xs text-slate-500">Curated packages showcased in the homepage animated carousel.</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* ── Select from DB picker ── */}
                  <button
                    onClick={() => { setShowPkgPicker(true); fetchDbPackages(); }}
                    className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📦</span> Select from Packages
                  </button>
                  <button
                    onClick={() =>
                      setEditPkg({
                        id: `pkg-${Date.now()}`,
                        slug: "new-package",
                        title: "New Featured Holiday Tour",
                        destination: "Destination (Nights)",
                        nights: "5N / 6D",
                        originalPrice: "₹35,000",
                        price: "₹22,999",
                        discount: "30% OFF",
                        rating: 4.9,
                        reviews: 120,
                        inclusions: ["4★ Hotel Stays", "Daily Breakfast & Dinner", "Dedicated Cab"],
                        img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
                        tag: "Featured",
                        isActive: true,
                        sortOrder: packages.length,
                      })
                    }
                    className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>+</span> Add Custom Card
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg, idx) => (
                  <div key={pkg.id || idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between">
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex gap-1">
                        {pkg.tag && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 text-amber-400 backdrop-blur-md">
                            {pkg.tag}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                          {pkg.discount}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pkg.isActive ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                          {pkg.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{pkg.destination}</span>
                          <span className="font-bold text-amber-600">★ {pkg.rating} ({pkg.reviews})</span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mt-1">{pkg.title}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">{pkg.nights}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 line-through block">{pkg.originalPrice}</span>
                          <span className="text-base font-extrabold text-slate-900">{pkg.price}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditPkg({ ...pkg })}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setPackages(packages.filter((_, i) => i !== idx))}
                            className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 2: HANDPICKED OFFERS & INSTANT DISCOUNTS
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "OFFERS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Handpicked Offers &amp; Instant Discounts</h2>
                  <p className="text-xs text-slate-500">Manage promotional coupons and discount banners displayed on the homepage.</p>
                </div>
                <button
                  onClick={() =>
                    setEditOffer({
                      id: `offer-${Date.now()}`,
                      badge: "EXCLUSIVE DEAL",
                      validity: "Limited Time",
                      title: "Flat ₹3,000 OFF on First Booking",
                      description: "Apply coupon code at checkout to claim instant discount on holiday packages.",
                      code: "SPECIAL3000",
                      ctaText: "Claim ₹3,000 OFF →",
                      gradient: "from-amber-500 to-amber-600",
                      badgeBg: "bg-slate-950",
                      badgeText: "text-amber-400",
                      textColor: "text-slate-950",
                      buttonBg: "bg-slate-950 hover:bg-slate-900",
                      buttonText: "text-amber-400",
                      codeBg: "bg-slate-950/15",
                      codeBorder: "border-slate-950/20",
                      codeText: "text-slate-950",
                      enquiryName: "Special Offer (SPECIAL3000)",
                      isActive: true,
                      sortOrder: offers.length,
                    })
                  }
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>+</span> Add Promo Offer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.map((offer, idx) => (
                  <div
                    key={offer.id || idx}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                          {offer.badge || "PROMO"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">{offer.validity}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              offer.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                            }`}
                          >
                            {offer.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-2">{offer.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{offer.description}</p>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Coupon Code:</span>
                        <span className="px-2.5 py-1 rounded bg-slate-100 font-mono font-bold text-xs text-slate-900 border border-slate-200">
                          {offer.code}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">{offer.ctaText}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditOffer({ ...offer })}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setOffers(offers.filter((_, i) => i !== idx))}
                          className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 3: EXPLORE POPULAR HOLIDAY SPOTS
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "DESTINATIONS" && (
            <div className="space-y-6">
              {/* Domestic Spots */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Domestic Gems</h2>
                    <p className="text-xs text-slate-500">Popular domestic destination cards displayed in the tab switcher.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setShowDomPicker(true); fetchDbDestinations(); }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🗺️</span> Select from Destinations
                    </button>
                    <button
                      onClick={() =>
                        setEditSpot({
                          spot: {
                            name: "New Destination",
                            slug: "new-destination",
                            tagline: "Scenic views & heritage spots",
                            packages: "10 Packages",
                            price: "From ₹15,000",
                            img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
                            tag: "Trending",
                            isActive: true,
                            sortOrder: domesticSpots.length,
                          },
                          type: "domestic",
                          index: -1,
                        })
                      }
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      + Add Custom Spot
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {domesticSpots.map((spot, idx) => (
                    <div key={spot.slug || idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                      <div className="relative h-36 bg-slate-100">
                        <img src={spot.img} alt={spot.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 text-amber-400">
                            {spot.tag}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 text-slate-800">
                            {spot.packages}
                          </span>
                        </div>
                      </div>
                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">{spot.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1">{spot.tagline}</p>
                          <p className="text-xs font-extrabold text-amber-600 mt-1">{spot.price}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditSpot({ spot: { ...spot }, type: "domestic", index: idx })}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDomesticSpots(domesticSpots.filter((_, i) => i !== idx))}
                            className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* International Spots */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">International Escapes</h2>
                    <p className="text-xs text-slate-500">Popular international destination cards.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setShowIntlPicker(true); fetchDbDestinations(); }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🌍</span> Select from Destinations
                    </button>
                    <button
                      onClick={() =>
                        setEditSpot({
                          spot: {
                            name: "New International Spot",
                            slug: "new-intl-spot",
                            tagline: "Tropical beaches & luxury stays",
                            packages: "12 Packages",
                            price: "From ₹35,000",
                            img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
                            tag: "Popular",
                            isActive: true,
                            sortOrder: intlSpots.length,
                          },
                          type: "international",
                          index: -1,
                        })
                      }
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      + Add Custom Spot
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {intlSpots.map((spot, idx) => (
                    <div key={spot.slug || idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                      <div className="relative h-36 bg-slate-100">
                        <img src={spot.img} alt={spot.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 text-amber-400">
                            {spot.tag}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 text-slate-800">
                            {spot.packages}
                          </span>
                        </div>
                      </div>
                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">{spot.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1">{spot.tagline}</p>
                          <p className="text-xs font-extrabold text-amber-600 mt-1">{spot.price}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditSpot({ spot: { ...spot }, type: "international", index: idx })}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setIntlSpots(intlSpots.filter((_, i) => i !== idx))}
                            className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 4: SPECIALITY HOLIDAY THEMES
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "THEMES" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Speciality Holiday Themes Packages</h2>
                  <p className="text-xs text-slate-500">
                    Theme-based signature packages (Honeymoon, Adventure, Heritage, Beach, Wildlife, Pilgrimage).
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditThemePkg({
                      id: `tp-${Date.now()}`,
                      theme: "honeymoon",
                      title: "New Curated Signature Tour",
                      destination: "Destination Details",
                      nights: "5 Nights / 6 Days",
                      originalPrice: "₹40,000",
                      price: "₹29,999",
                      discount: "25% OFF",
                      rating: 4.9,
                      reviews: 150,
                      specialInclusion: "Complimentary Dinner & Special Sightseeing",
                      img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
                      badge: "Signature Tour",
                      slug: "new-signature-tour",
                      isActive: true,
                      sortOrder: themePackages.length,
                    })
                  }
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  + Add Theme Package
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themePackages.map((tp, idx) => (
                  <div key={tp.id || idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                    <div className="relative h-40 bg-slate-100">
                      <img src={tp.img} alt={tp.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 uppercase">
                          {tp.theme}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 text-amber-400">
                          {tp.badge}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{tp.nights}</span>
                          <span className="font-bold text-amber-600">★ {tp.rating}</span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mt-1">{tp.title}</h3>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">✨ {tp.specialInclusion}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 line-through block">{tp.originalPrice}</span>
                          <span className="text-base font-extrabold text-slate-900">{tp.price}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditThemePkg({ ...tp })}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setThemePackages(themePackages.filter((_, i) => i !== idx))}
                            className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 5: WHY BOOK WITH BE MY TRAVELLER (2-COLUMN DYNAMIC)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "WHY_BOOK" && (
            <div className="space-y-6">
              {/* Section Header Controls */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h2 className="text-sm font-bold text-slate-900">Section Headings &amp; Trust Badge</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Heading</label>
                    <input
                      type="text"
                      value={whyBookHeading}
                      onChange={(e) => setWhyBookHeading(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Subheading</label>
                    <input
                      type="text"
                      value={whyBookSubheading}
                      onChange={(e) => setWhyBookSubheading(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Trust Badge Text</label>
                    <input
                      type="text"
                      value={whyBookTrustBadge}
                      onChange={(e) => setWhyBookTrustBadge(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Trust Points (Column 1) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">4 Key Trust Points (Left Side)</h3>
                    <p className="text-xs text-slate-500">Highlighted value propositions with custom icons and accent styling.</p>
                  </div>
                  <button
                    onClick={() =>
                      setEditPoint({
                        id: `wp-${Date.now()}`,
                        icon: "🌟",
                        title: "Custom Point",
                        description: "Description of the value proposition.",
                        color: "amber",
                        isActive: true,
                        sortOrder: whyBookPoints.length,
                      })
                    }
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    + Add Point
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {whyBookPoints.map((point, idx) => (
                    <div key={point.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg shrink-0">
                        {point.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900">{point.title}</h4>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditPoint({ ...point })}
                              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setWhyBookPoints(whyBookPoints.filter((_, i) => i !== idx))}
                              className="px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{point.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Image URLs (Column 2 Visual Grid) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">4 Visual Showcase Images (Right Side Grid)</h3>
                  <p className="text-xs text-slate-500">Provide 4 high-resolution photo URLs representing real destinations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(["img1", "img2", "img3", "img4"] as const).map((key, i) => (
                    <div key={key} className="space-y-2">
                      <div className="relative h-28 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={whyBookImages[key]} alt={`Visual ${i + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 text-white">
                          Image #{i + 1}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={whyBookImages[key]}
                        onChange={(e) => setWhyBookImages({ ...whyBookImages, [key]: e.target.value })}
                        placeholder="Image URL"
                        className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 6: VERIFIED CUSTOMER REVIEWS CAROUSEL
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "REVIEWS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Verified Customer Reviews Carousel</h2>
                  <p className="text-xs text-slate-500">Real customer feedback showcased in the interactive testimonials carousel.</p>
                </div>
                <button
                  onClick={() =>
                    setEditReview({
                      id: `r-${Date.now()}`,
                      name: "Happy Traveller",
                      location: "New Delhi",
                      destination: "Himachal Pradesh",
                      rating: 5,
                      review: "Wonderful experience with Be My Traveller! Seamless planning and reliable cab driver.",
                      date: "Oct 2026",
                      isActive: true,
                      sortOrder: reviews.length,
                    })
                  }
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  + Add Review Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reviews.map((rev, idx) => (
                  <div key={rev.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-500 text-xs">{"★".repeat(rev.rating)}</span>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 italic mt-2 line-clamp-4">&ldquo;{rev.review}&rdquo;</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{rev.name}</h4>
                        <p className="text-[10px] text-slate-400">{rev.location} · {rev.destination}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditReview({ ...rev })}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setReviews(reviews.filter((_, i) => i !== idx))}
                          className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 7: ABOUT US (ABOUT BE MY TRAVELLER)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "ABOUT_US" && (
            <div className="space-y-6">
              {/* Status & Overview Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                    Brand Heritage &amp; Company Overview
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-0.5">
                    About Be My Traveller Section
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showcases company background, Manali HQ &amp; Ahmedabad hub, verified stays, and trust statistics.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={aboutIsActive}
                    onChange={(e) => setAboutIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Display on Homepage</span>
                </label>
              </div>

              {/* Header & Story Fields */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Header &amp; Narrative Story
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={aboutBadge}
                      onChange={(e) => setAboutBadge(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Years of Experience Tag</label>
                    <input
                      type="text"
                      value={aboutExperienceYears}
                      onChange={(e) => setAboutExperienceYears(e.target.value)}
                      placeholder="e.g. 7+"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-amber-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Main Heading *</label>
                    <input
                      type="text"
                      value={aboutHeading}
                      onChange={(e) => setAboutHeading(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-black text-slate-900 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Subheading *</label>
                    <input
                      type="text"
                      value={aboutSubheading}
                      onChange={(e) => setAboutSubheading(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Detailed Story / Narrative *</label>
                    <textarea
                      rows={5}
                      value={aboutStory}
                      onChange={(e) => setAboutStory(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed"
                    />
                    <p className="text-[10.5px] text-slate-400 mt-1">
                      Mention company roots, Manali headquarters, Ahmedabad branch, verified stays, and concierge.
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Featured Showcase Photo URL</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={aboutImage}
                        onChange={(e) => setAboutImage(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                      />
                      {aboutImage && (
                        <img
                          src={aboutImage}
                          alt="About Preview"
                          className="w-14 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Feature Highlights */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">4 Key Pillars &amp; Experience Features</h3>
                  <span className="text-[11px] text-slate-400">Displayed in left column feature grid</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aboutHighlights.map((hl, idx) => (
                    <div key={hl.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={hl.icon}
                          onChange={(e) => {
                            const next = [...aboutHighlights];
                            next[idx] = { ...hl, icon: e.target.value };
                            setAboutHighlights(next);
                          }}
                          className="w-10 p-1.5 text-center text-lg rounded-lg bg-white border border-slate-200 font-bold"
                          title="Emoji Icon"
                        />
                        <input
                          type="text"
                          value={hl.title}
                          onChange={(e) => {
                            const next = [...aboutHighlights];
                            next[idx] = { ...hl, title: e.target.value };
                            setAboutHighlights(next);
                          }}
                          className="flex-1 p-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                          placeholder="Feature Title"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={hl.description}
                        onChange={(e) => {
                          const next = [...aboutHighlights];
                          next[idx] = { ...hl, description: e.target.value };
                          setAboutHighlights(next);
                        }}
                        className="w-full p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed"
                        placeholder="Feature Description"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Statistics Counter */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">4 Key Metric / Trust Counters</h3>
                  <span className="text-[11px] text-slate-400">Displayed beneath the image showcase</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {aboutStats.map((st, idx) => (
                    <div key={st.id || idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                      <label className="block text-[10px] uppercase font-bold text-slate-400">Stat #{idx + 1}</label>
                      <input
                        type="text"
                        value={st.number}
                        onChange={(e) => {
                          const next = [...aboutStats];
                          next[idx] = { ...st, number: e.target.value };
                          setAboutStats(next);
                        }}
                        placeholder="e.g. 25,000+"
                        className="w-full p-1.5 rounded-lg bg-white border border-slate-200 font-extrabold text-amber-600 text-sm"
                      />
                      <input
                        type="text"
                        value={st.label}
                        onChange={(e) => {
                          const next = [...aboutStats];
                          next[idx] = { ...st, label: e.target.value };
                          setAboutStats(next);
                        }}
                        placeholder="e.g. Happy Travellers"
                        className="w-full p-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 8: FREQUENTLY ASKED QUESTIONS (FAQS)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "FAQS" && (
            <div className="space-y-6">
              {/* Header & Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                    Interactive Accordion &amp; FAQPage Schema.org
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-0.5">
                    Frequently Asked Questions Section
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rendered above the Content Area. Automatically generates Google FAQ rich snippets for SEO and AI answers.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={faqsIsActive}
                      onChange={(e) => setFaqsIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500"
                    />
                    <span>Display Section</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditFaq({
                        id: `faq-${Date.now()}`,
                        question: "",
                        answer: "",
                        category: "GENERAL",
                        isActive: true,
                        sortOrder: faqItems.length,
                      })
                    }
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>+</span>
                    <span>Add New Question</span>
                  </button>
                </div>
              </div>

              {/* Section Header Controls */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Section Headings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Badge Text</label>
                    <input
                      type="text"
                      value={faqsBadge}
                      onChange={(e) => setFaqsBadge(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Main Heading</label>
                    <input
                      type="text"
                      value={faqsHeading}
                      onChange={(e) => setFaqsHeading(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-50 border border-slate-200 font-black text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Subheading Description</label>
                    <input
                      type="text"
                      value={faqsSubheading}
                      onChange={(e) => setFaqsSubheading(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* FAQs Cards List */}
              <div className="space-y-3">
                {faqItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                          {item.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.isActive ? "Active" : "Hidden"}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{item.question}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line line-clamp-3">
                        {item.answer}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...faqItems];
                            const temp = next[idx - 1];
                            next[idx - 1] = next[idx];
                            next[idx] = temp;
                            setFaqItems(next);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600"
                          title="Move Up"
                        >
                          ↑
                        </button>
                      )}
                      {idx < faqItems.length - 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...faqItems];
                            const temp = next[idx + 1];
                            next[idx + 1] = next[idx];
                            next[idx] = temp;
                            setFaqItems(next);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600"
                          title="Move Down"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditFaq({ ...item })}
                        className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setFaqItems(faqItems.filter((_, i) => i !== idx))}
                        className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600"
                        title="Delete Question"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 9: SEO, AEO, AIO & SEARCH ENGINE RICH CONTENT AREA
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "CONTENT_AREA" && (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                    Search Engine, AEO &amp; AI Rich Content Section
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-0.5">
                    Homepage Editorial &amp; SEO Content Area
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Located above the footer. Includes Headings, slug linking for internal PageRank flow, and AI Rich Overviews.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={seoIsActive}
                    onChange={(e) => setSeoIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Display on Homepage</span>
                </label>
              </div>

              {/* Comprehensive SEO Content Editor with Slug Linking & Headings */}
              <SeoContentEditor
                title={seoTitle}
                onTitleChange={setSeoTitle}
                subtitle={seoSubtitle}
                onSubtitleChange={setSeoSubtitle}
                value={seoHtmlContent}
                onChange={setSeoHtmlContent}
                aiSummary={seoAiSummary}
                onAiSummaryChange={setSeoAiSummary}
                keywords={seoKeywords}
                onKeywordsChange={setSeoKeywords}
              />
            </div>
          )}
        </>
      )}

      {/* ── EDIT MODAL: PACKAGE CARD ── */}
      {editPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Featured Package</h3>
              <button onClick={() => setEditPkg(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Package Title</label>
                <input
                  type="text"
                  value={editPkg.title}
                  onChange={(e) => setEditPkg({ ...editPkg, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination Route</label>
                  <input
                    type="text"
                    value={editPkg.destination}
                    onChange={(e) => setEditPkg({ ...editPkg, destination: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nights / Days</label>
                  <input
                    type="text"
                    value={editPkg.nights}
                    onChange={(e) => setEditPkg({ ...editPkg, nights: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price</label>
                  <input
                    type="text"
                    value={editPkg.price}
                    onChange={(e) => setEditPkg({ ...editPkg, price: e.target.value })}
                    className="w-full p-2 border rounded-lg font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original Price</label>
                  <input
                    type="text"
                    value={editPkg.originalPrice}
                    onChange={(e) => setEditPkg({ ...editPkg, originalPrice: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Tag</label>
                  <input
                    type="text"
                    value={editPkg.discount}
                    onChange={(e) => setEditPkg({ ...editPkg, discount: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={editPkg.img}
                  onChange={(e) => setEditPkg({ ...editPkg, img: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editPkg.tag}
                    onChange={(e) => setEditPkg({ ...editPkg, tag: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Package Slug / Link</label>
                  <input
                    type="text"
                    value={editPkg.slug}
                    onChange={(e) => setEditPkg({ ...editPkg, slug: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Inclusions (One per line)</label>
                <textarea
                  rows={3}
                  value={editPkg.inclusions.join("\n")}
                  onChange={(e) => setEditPkg({ ...editPkg, inclusions: e.target.value.split("\n").filter(Boolean) })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pkgActive"
                  checked={editPkg.isActive}
                  onChange={(e) => setEditPkg({ ...editPkg, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <label htmlFor="pkgActive" className="font-bold text-slate-700">Display this package on homepage</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button onClick={() => setEditPkg(null)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold text-xs text-slate-700">Cancel</button>
              <button
                onClick={() => {
                  const existingIdx = packages.findIndex((p) => p.id === editPkg.id);
                  if (existingIdx >= 0) {
                    const next = [...packages];
                    next[existingIdx] = editPkg;
                    setPackages(next);
                  } else {
                    setPackages([...packages, editPkg]);
                  }
                  setEditPkg(null);
                }}
                className="px-5 py-2 rounded-lg bg-amber-500 font-bold text-xs text-slate-950 hover:bg-amber-400"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL: OFFER CARD ── */}
      {editOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Promo Offer Card</h3>
              <button onClick={() => setEditOffer(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={editOffer.badge}
                    onChange={(e) => setEditOffer({ ...editOffer, badge: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Validity Subtext</label>
                  <input
                    type="text"
                    value={editOffer.validity}
                    onChange={(e) => setEditOffer({ ...editOffer, validity: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Offer Title</label>
                <input
                  type="text"
                  value={editOffer.title}
                  onChange={(e) => setEditOffer({ ...editOffer, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editOffer.description}
                  onChange={(e) => setEditOffer({ ...editOffer, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={editOffer.code}
                    onChange={(e) => setEditOffer({ ...editOffer, code: e.target.value })}
                    className="w-full p-2 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    value={editOffer.ctaText}
                    onChange={(e) => setEditOffer({ ...editOffer, ctaText: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Landing Page Link <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={editOffer.link || ""}
                  onChange={(e) => setEditOffer({ ...editOffer, link: e.target.value || undefined })}
                  placeholder="e.g. /packages/kashmir-special or https://external-link.com"
                  className="w-full p-2 border rounded-lg text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">If set, clicking the CTA button will navigate here instead of opening the enquiry modal.</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="offerActive"
                  checked={editOffer.isActive}
                  onChange={(e) => setEditOffer({ ...editOffer, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <label htmlFor="offerActive" className="font-bold text-slate-700">Display this offer on homepage</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button onClick={() => setEditOffer(null)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold text-xs text-slate-700">Cancel</button>
              <button
                onClick={() => {
                  const existingIdx = offers.findIndex((o) => o.id === editOffer.id);
                  if (existingIdx >= 0) {
                    const next = [...offers];
                    next[existingIdx] = editOffer;
                    setOffers(next);
                  } else {
                    setOffers([...offers, editOffer]);
                  }
                  setEditOffer(null);
                }}
                className="px-5 py-2 rounded-lg bg-amber-500 font-bold text-xs text-slate-950 hover:bg-amber-400"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL: DESTINATION SPOT ── */}
      {editSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Edit {editSpot.type === "domestic" ? "Domestic" : "International"} Destination
              </h3>
              <button onClick={() => setEditSpot(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination Name</label>
                <input
                  type="text"
                  value={editSpot.spot.name}
                  onChange={(e) => setEditSpot({ ...editSpot, spot: { ...editSpot.spot, name: e.target.value } })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slug / URL Key</label>
                <input
                  type="text"
                  value={editSpot.spot.slug}
                  onChange={(e) => setEditSpot({ ...editSpot, spot: { ...editSpot.spot, slug: e.target.value } })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={editSpot.spot.tagline}
                  onChange={(e) => setEditSpot({ ...editSpot, spot: { ...editSpot.spot, tagline: e.target.value } })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Package Count Text</label>
                  <input
                    type="text"
                    value={editSpot.spot.packages}
                    onChange={(e) => setEditSpot({ ...editSpot, spot: { ...editSpot.spot, packages: e.target.value } })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Starting Price Text</label>
                  <input
                    type="text"
                    value={editSpot.spot.price}
                    onChange={(e) => setEditSpot({ ...editSpot, spot: { ...editSpot.spot, price: e.target.value } })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editSpot.spot.img}
                  onChange={(e) => setEditSpot({ ...editSpot, spot: { ...editSpot.spot, img: e.target.value } })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={editSpot.spot.tag}
                  onChange={(e) => setEditSpot({ ...editSpot, spot: { ...editSpot.spot, tag: e.target.value } })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button onClick={() => setEditSpot(null)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold text-xs text-slate-700">Cancel</button>
              <button
                onClick={() => {
                  if (editSpot.type === "domestic") {
                    if (editSpot.index >= 0) {
                      const next = [...domesticSpots];
                      next[editSpot.index] = editSpot.spot;
                      setDomesticSpots(next);
                    } else {
                      setDomesticSpots([...domesticSpots, editSpot.spot]);
                    }
                  } else {
                    if (editSpot.index >= 0) {
                      const next = [...intlSpots];
                      next[editSpot.index] = editSpot.spot;
                      setIntlSpots(next);
                    } else {
                      setIntlSpots([...intlSpots, editSpot.spot]);
                    }
                  }
                  setEditSpot(null);
                }}
                className="px-5 py-2 rounded-lg bg-amber-500 font-bold text-xs text-slate-950 hover:bg-amber-400"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL: THEME PACKAGE CARD ── */}
      {editThemePkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Theme Package Card</h3>
              <button onClick={() => setEditThemePkg(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Theme Category</label>
                  <select
                    value={editThemePkg.theme}
                    onChange={(e) => setEditThemePkg({ ...editThemePkg, theme: e.target.value })}
                    className="w-full p-2 border rounded-lg capitalize"
                  >
                    <option value="honeymoon">Honeymoon</option>
                    <option value="adventure">Adventure</option>
                    <option value="heritage">Heritage</option>
                    <option value="beach">Beach</option>
                    <option value="wildlife">Wildlife</option>
                    <option value="pilgrimage">Pilgrimage</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={editThemePkg.badge}
                    onChange={(e) => setEditThemePkg({ ...editThemePkg, badge: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editThemePkg.title}
                  onChange={(e) => setEditThemePkg({ ...editThemePkg, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price</label>
                  <input
                    type="text"
                    value={editThemePkg.price}
                    onChange={(e) => setEditThemePkg({ ...editThemePkg, price: e.target.value })}
                    className="w-full p-2 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nights / Days</label>
                  <input
                    type="text"
                    value={editThemePkg.nights}
                    onChange={(e) => setEditThemePkg({ ...editThemePkg, nights: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Special Inclusion</label>
                <input
                  type="text"
                  value={editThemePkg.specialInclusion}
                  onChange={(e) => setEditThemePkg({ ...editThemePkg, specialInclusion: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editThemePkg.img}
                  onChange={(e) => setEditThemePkg({ ...editThemePkg, img: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button onClick={() => setEditThemePkg(null)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold text-xs text-slate-700">Cancel</button>
              <button
                onClick={() => {
                  const existingIdx = themePackages.findIndex((tp) => tp.id === editThemePkg.id);
                  if (existingIdx >= 0) {
                    const next = [...themePackages];
                    next[existingIdx] = editThemePkg;
                    setThemePackages(next);
                  } else {
                    setThemePackages([...themePackages, editThemePkg]);
                  }
                  setEditThemePkg(null);
                }}
                className="px-5 py-2 rounded-lg bg-amber-500 font-bold text-xs text-slate-950 hover:bg-amber-400"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL: WHY BOOK POINT ── */}
      {editPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Trust Point</h3>
              <button onClick={() => setEditPoint(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={editPoint.icon}
                    onChange={(e) => setEditPoint({ ...editPoint, icon: e.target.value })}
                    className="w-full p-2 border rounded-lg text-center text-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Accent Color</label>
                  <select
                    value={editPoint.color}
                    onChange={(e) => setEditPoint({ ...editPoint, color: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="amber">Amber</option>
                    <option value="blue">Blue</option>
                    <option value="emerald">Emerald</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editPoint.title}
                  onChange={(e) => setEditPoint({ ...editPoint, title: e.target.value })}
                  className="w-full p-2 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editPoint.description}
                  onChange={(e) => setEditPoint({ ...editPoint, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button onClick={() => setEditPoint(null)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold text-xs text-slate-700">Cancel</button>
              <button
                onClick={() => {
                  const existingIdx = whyBookPoints.findIndex((p) => p.id === editPoint.id);
                  if (existingIdx >= 0) {
                    const next = [...whyBookPoints];
                    next[existingIdx] = editPoint;
                    setWhyBookPoints(next);
                  } else {
                    setWhyBookPoints([...whyBookPoints, editPoint]);
                  }
                  setEditPoint(null);
                }}
                className="px-5 py-2 rounded-lg bg-amber-500 font-bold text-xs text-slate-950 hover:bg-amber-400"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL: REVIEW CARD ── */}
      {editReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Customer Review</h3>
              <button onClick={() => setEditReview(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editReview.name}
                    onChange={(e) => setEditReview({ ...editReview, name: e.target.value })}
                    className="w-full p-2 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rating (1 to 5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editReview.rating}
                    onChange={(e) => setEditReview({ ...editReview, rating: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    value={editReview.location}
                    onChange={(e) => setEditReview({ ...editReview, location: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tour Destination</label>
                  <input
                    type="text"
                    value={editReview.destination}
                    onChange={(e) => setEditReview({ ...editReview, destination: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Review Date</label>
                <input
                  type="text"
                  value={editReview.date}
                  onChange={(e) => setEditReview({ ...editReview, date: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Review Text</label>
                <textarea
                  rows={4}
                  value={editReview.review}
                  onChange={(e) => setEditReview({ ...editReview, review: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button onClick={() => setEditReview(null)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold text-xs text-slate-700">Cancel</button>
              <button
                onClick={() => {
                  const existingIdx = reviews.findIndex((r) => r.id === editReview.id);
                  if (existingIdx >= 0) {
                    const next = [...reviews];
                    next[existingIdx] = editReview;
                    setReviews(next);
                  } else {
                    setReviews([...reviews, editReview]);
                  }
                  setEditReview(null);
                }}
                className="px-5 py-2 rounded-lg bg-amber-500 font-bold text-xs text-slate-950 hover:bg-amber-400"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL: FAQ ITEM ── */}
      {editFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editFaq.id.startsWith("faq-") && !faqItems.some((f) => f.id === editFaq.id)
                  ? "Add New FAQ"
                  : "Edit FAQ Question"}
              </h3>
              <button
                onClick={() => setEditFaq(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={editFaq.category}
                  onChange={(e) => setEditFaq({ ...editFaq, category: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-bold"
                >
                  <option value="GENERAL">GENERAL (About BMT)</option>
                  <option value="CUSTOMIZATION">CUSTOMIZATION (Itinerary &amp; Hotels)</option>
                  <option value="BOOKING">BOOKING (Payments &amp; Confirmations)</option>
                  <option value="CABS">CABS (Transfers &amp; Fleet)</option>
                  <option value="CANCELLATION">CANCELLATION (Refunds &amp; Policies)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question *</label>
                <input
                  type="text"
                  value={editFaq.question}
                  onChange={(e) => setEditFaq({ ...editFaq, question: e.target.value })}
                  placeholder="e.g. Can I customize the itinerary, hotels, and travel dates?"
                  className="w-full p-2.5 border border-slate-200 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Answer *</label>
                <textarea
                  rows={5}
                  value={editFaq.answer}
                  onChange={(e) => setEditFaq({ ...editFaq, answer: e.target.value })}
                  placeholder="Enter a thorough, comprehensive answer for travelers..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="faqActive"
                  checked={editFaq.isActive}
                  onChange={(e) => setEditFaq({ ...editFaq, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <label htmlFor="faqActive" className="font-bold text-slate-700 cursor-pointer">
                  Display this question on homepage accordion
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditFaq(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 font-bold text-xs text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editFaq.question.trim() || !editFaq.answer.trim()) {
                    alert("Please provide both a question and answer.");
                    return;
                  }
                  const existingIdx = faqItems.findIndex((f) => f.id === editFaq.id);
                  if (existingIdx >= 0) {
                    const next = [...faqItems];
                    next[existingIdx] = editFaq;
                    setFaqItems(next);
                  } else {
                    setFaqItems([...faqItems, editFaq]);
                  }
                  setEditFaq(null);
                }}
                className="px-5 py-2 rounded-lg bg-amber-500 font-bold text-xs text-slate-950 hover:bg-amber-400"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DB PICKER MODAL: SELECT PACKAGES ── */}
      {showPkgPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Select from Your Packages</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click any package to add it to the Best-Selling section on the homepage.</p>
              </div>
              <button onClick={() => { setShowPkgPicker(false); setDbPkgSearch(""); setSelectedDbPkgIds(new Set()); }} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <input
              type="text"
              placeholder="Search packages by name or slug..."
              value={dbPkgSearch}
              onChange={(e) => setDbPkgSearch(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
            />

            {dbPkgLoading ? (
              <div className="py-10 flex flex-col items-center gap-2">
                <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500">Loading packages from database...</p>
              </div>
            ) : dbPackages.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-bold text-slate-500">No packages found in database.</p>
                <p className="text-xs text-slate-400 mt-1">Add packages in Admin → Packages first.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dbPackages
                  .filter((p) => !dbPkgSearch || p.name.toLowerCase().includes(dbPkgSearch.toLowerCase()) || p.slug.toLowerCase().includes(dbPkgSearch.toLowerCase()))
                  .map((p) => {
                    const alreadyAdded = packages.some((hp) => hp.slug === p.slug);
                    const isSelected = selectedDbPkgIds.has(p._id);
                    return (
                      <div
                        key={p._id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          alreadyAdded
                            ? "border-emerald-200 bg-emerald-50 opacity-60 cursor-default"
                            : isSelected
                            ? "border-amber-400 bg-amber-50"
                            : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
                        }`}
                        onClick={() => {
                          if (alreadyAdded) return;
                          setSelectedDbPkgIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(p._id)) next.delete(p._id); else next.add(p._id);
                            return next;
                          });
                        }}
                      >
                        {p.coverImage ? (
                          <img src={p.coverImage} alt={p.name} className="w-14 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-14 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg shrink-0">📦</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{p.tagline || p.slug}</p>
                          {p.startingPrice && <p className="text-[10px] font-extrabold text-amber-600 mt-0.5">From ₹{p.startingPrice.toLocaleString("en-IN")}</p>}
                        </div>
                        <div className="shrink-0">
                          {alreadyAdded ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Added</span>
                          ) : isSelected ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">✓ Selected</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Click to select</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-xs text-slate-500">{selectedDbPkgIds.size} package(s) selected</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowPkgPicker(false); setDbPkgSearch(""); setSelectedDbPkgIds(new Set()); }}
                  className="px-4 py-2 rounded-lg bg-slate-100 font-bold text-xs text-slate-700"
                >
                  Cancel
                </button>
                <button
                  disabled={selectedDbPkgIds.size === 0}
                  onClick={() => {
                    const toAdd = dbPackages.filter((p) => selectedDbPkgIds.has(p._id));
                    const newCards = toAdd.map(dbPkgToCard);
                    setPackages([...packages, ...newCards]);
                    setShowPkgPicker(false);
                    setDbPkgSearch("");
                    setSelectedDbPkgIds(new Set());
                    showToast(`✓ Added ${newCards.length} package(s) to homepage section.`);
                  }}
                  className="px-5 py-2 rounded-lg bg-amber-500 font-bold text-xs text-slate-950 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Selected to Homepage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DB PICKER MODAL: SELECT DOMESTIC DESTINATIONS ── */}
      {showDomPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Select Domestic Destination</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click a destination to add it to the Domestic Popular Spots section.</p>
              </div>
              <button onClick={() => { setShowDomPicker(false); setDbDestSearch(""); }} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <input
              type="text"
              placeholder="Search destinations..."
              value={dbDestSearch}
              onChange={(e) => setDbDestSearch(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
            />

            {dbDestLoading ? (
              <div className="py-10 flex flex-col items-center gap-2">
                <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500">Loading destinations...</p>
              </div>
            ) : dbDestinations.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-bold text-slate-500">No destinations found in database.</p>
                <p className="text-xs text-slate-400 mt-1">Add destinations in Admin → Content → Destinations first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dbDestinations
                  .filter((d) => !dbDestSearch || d.name.toLowerCase().includes(dbDestSearch.toLowerCase()))
                  .map((d) => {
                    const alreadyAdded = domesticSpots.some((s) => s.slug === d.slug);
                    return (
                      <div
                        key={d._id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          alreadyAdded ? "border-emerald-200 bg-emerald-50 opacity-60 cursor-default" : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30 cursor-pointer"
                        }`}
                        onClick={() => {
                          if (alreadyAdded) return;
                          setDomesticSpots([...domesticSpots, dbDestToCard(d, "domestic")]);
                          showToast(`✓ "${d.name}" added to Domestic Spots.`);
                        }}
                      >
                        {d.coverImage ? (
                          <img src={d.coverImage} alt={d.name} className="w-12 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg shrink-0">📍</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{d.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{d.tagline || d.region || d.slug}</p>
                        </div>
                        {alreadyAdded && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded shrink-0">Added</span>}
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <button onClick={() => { setShowDomPicker(false); setDbDestSearch(""); }} className="px-4 py-2 rounded-lg bg-slate-100 font-bold text-xs text-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DB PICKER MODAL: SELECT INTERNATIONAL DESTINATIONS ── */}
      {showIntlPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Select International Destination</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click a destination to add it to the International Popular Spots section.</p>
              </div>
              <button onClick={() => { setShowIntlPicker(false); setDbDestSearch(""); }} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <input
              type="text"
              placeholder="Search destinations..."
              value={dbDestSearch}
              onChange={(e) => setDbDestSearch(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
            />

            {dbDestLoading ? (
              <div className="py-10 flex flex-col items-center gap-2">
                <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500">Loading destinations...</p>
              </div>
            ) : dbDestinations.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-bold text-slate-500">No destinations found in database.</p>
                <p className="text-xs text-slate-400 mt-1">Add destinations in Admin → Content → Destinations first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dbDestinations
                  .filter((d) => !dbDestSearch || d.name.toLowerCase().includes(dbDestSearch.toLowerCase()))
                  .map((d) => {
                    const alreadyAdded = intlSpots.some((s) => s.slug === d.slug);
                    return (
                      <div
                        key={d._id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          alreadyAdded ? "border-emerald-200 bg-emerald-50 opacity-60 cursor-default" : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30 cursor-pointer"
                        }`}
                        onClick={() => {
                          if (alreadyAdded) return;
                          setIntlSpots([...intlSpots, dbDestToCard(d, "international")]);
                          showToast(`✓ "${d.name}" added to International Spots.`);
                        }}
                      >
                        {d.coverImage ? (
                          <img src={d.coverImage} alt={d.name} className="w-12 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg shrink-0">🌍</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{d.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{d.tagline || d.region || d.slug}</p>
                        </div>
                        {alreadyAdded && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded shrink-0">Added</span>}
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <button onClick={() => { setShowIntlPicker(false); setDbDestSearch(""); }} className="px-4 py-2 rounded-lg bg-slate-100 font-bold text-xs text-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
