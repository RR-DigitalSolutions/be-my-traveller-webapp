"use client";

import React, { useState, useEffect } from "react";

type ContentTab = "PACKAGES" | "OFFERS" | "DESTINATIONS" | "THEMES" | "WHY_BOOK" | "REVIEWS";

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
  isActive: boolean;
  sortOrder: number;
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
  { id: "wp-1", icon: "⚡", title: "Authoritative Pricing", description: "Real-time calculations for season surcharges, room upgrades, and taxes. No hidden surcharges at checkout.", color: "amber", isActive: true, sortOrder: 0 },
  { id: "wp-2", icon: "🏨", title: "Verified 4★ & 5★ Stays", description: "Every hotel, resort, and houseboat is physically vetted for hygiene, scenic views, and hospitality standards.", color: "blue", isActive: true, sortOrder: 1 },
  { id: "wp-3", icon: "🛡️", title: "24/7 On-Trip Concierge", description: "Dedicated trip managers support you through arrival, hotel check-in, permits, and sightseeing at every step.", color: "emerald", isActive: true, sortOrder: 2 },
  { id: "wp-4", icon: "🎯", title: "100% Customized Trips", description: "Swap hotels, add private transfers, change meal plans, and include adventure sports according to your schedule.", color: "purple", isActive: true, sortOrder: 3 },
];

const DEFAULT_REVIEWS: ReviewItem[] = [
  { id: "r1", name: "Ananya Sharma", location: "Mumbai", destination: "Himachal Pradesh", rating: 5, review: "Our Himachal trip with Be My Traveller was magical. The cab driver in Manali was polite, the river-facing resort was breathtaking, and the Rohtang Pass permits were arranged seamlessly.", date: "Sep 2026", isActive: true, sortOrder: 0 },
  { id: "r2", name: "Rohan & Priya Mehta", location: "Bengaluru", destination: "Kerala", rating: 5, review: "We booked our honeymoon to Kerala through Be My Traveller. The Alleppey luxury houseboat chef prepared amazing authentic meals. Will definitely book Kashmir next winter!", date: "Aug 2026", isActive: true, sortOrder: 1 },
  { id: "r3", name: "Vikramaditya Rao", location: "Hyderabad", destination: "Rajasthan", rating: 5, review: "Exceptional service. When our flight from Delhi was delayed, their support team immediately rescheduled our airport cab without extra charges. Highly recommended!", date: "Oct 2026", isActive: true, sortOrder: 2 },
];

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
  const [whyBookSubheading, setWhyBookSubheading] = useState("We combine high-tech server-authoritative pricing with personalized high-touch destination expertise.");
  const [whyBookTrustBadge, setWhyBookTrustBadge] = useState("Trusted by 25,000+ Travellers");
  const [whyBookPoints, setWhyBookPoints] = useState<WhyBookPoint[]>(DEFAULT_POINTS);
  const [whyBookImages, setWhyBookImages] = useState({
    img1: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
    img2: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
    img3: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80",
    img4: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
  });
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS);

  // Edit Modals
  const [editPkg, setEditPkg] = useState<PackageItem | null>(null);
  const [editOffer, setEditOffer] = useState<OfferItem | null>(null);
  const [editSpot, setEditSpot] = useState<{ spot: DestinationCard; type: "domestic" | "international"; index: number } | null>(null);
  const [editThemePkg, setEditThemePkg] = useState<ThemePackageItem | null>(null);
  const [editPoint, setEditPoint] = useState<WhyBookPoint | null>(null);
  const [editReview, setEditReview] = useState<ReviewItem | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Featured Packages Carousel Cards</h2>
                  <p className="text-xs text-slate-500">Curated packages showcased in the homepage animated carousel.</p>
                </div>
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
                  <span>+</span> Add Package Card
                </button>
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Domestic Gems</h2>
                    <p className="text-xs text-slate-500">Popular domestic destination cards displayed in the tab switcher.</p>
                  </div>
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
                    + Add Domestic Spot
                  </button>
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">International Escapes</h2>
                    <p className="text-xs text-slate-500">Popular international destination cards.</p>
                  </div>
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
                    + Add International Spot
                  </button>
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
    </div>
  );
}
