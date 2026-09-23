"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import MediaPickerModal, { MediaItem } from "@/components/common/MediaPickerModal";

interface ItineraryDay {
  day: number;
  title: string;
  desc: string;
  meals: string;
  hotel: string;
}

interface HotelTier {
  title: string;
  pricePerAdult: number;
  desc: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface SeasonalHikePeriod {
  id?: string;
  title: string;
  startDate: string;
  endDate: string;
  hikeType: "PERCENTAGE" | "FIXED_AMOUNT";
  hikeValue: number;
  validityNote?: string;
}

interface SeasonalHike {
  enabled: boolean;
  seasonType: "NONE" | "SUMMER_PEAK" | "WINTER_PEAK" | "FESTIVE_WEEKEND" | "CUSTOM";
  hikeType: "PERCENTAGE" | "FIXED_AMOUNT";
  hikeValue: number;
  seasonLabel: string;
  validityNote: string;
}

interface IPackageItem {
  _id: string;
  slug: string;
  name: string;
  tagline?: string;
  route?: string;
  destination?: string;
  countries?: string[];
  states?: string[];
  cities?: string[];
  stateSlug?: string;
  citySlug?: string;
  nights: number;
  days: number;
  startingPrice: number;
  originalPrice?: number;
  discountPercent?: number;
  discountBadge?: string;
  seasonalHike?: SeasonalHike;
  seasonalHikes?: SeasonalHikePeriod[];
  tag?: string;
  theme?: string[];
  category?: string;
  audience?: string[];
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED" | "IN_REVIEW";
  coverImage?: string;
  coverImageStr?: string;
  gallery?: string[];
  overview?: string;
  shortDescription?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: ItineraryDay[];
  hotelTiers?: {
    standard: HotelTier;
    deluxe: HotelTier;
    luxury: HotelTier;
  };
  faqs?: FaqItem[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  reviewCount?: number;
  averageRating?: number;
  updatedAt: string;
}

const PACKAGE_TABS = [
  { id: "basic", label: "Hierarchy & Location", icon: "📍" },
  { id: "pricing", label: "Tiers, Discount & Seasonal Hike", icon: "💰" },
  { id: "itinerary", label: "Day-by-Day Itinerary", icon: "🗓️" },
  { id: "highlights", label: "Highlights & Inclusions", icon: "✨" },
  { id: "faqs", label: "FAQs & Schema", icon: "❓" },
  { id: "seo", label: "SEO & AI Studio", icon: "🔍" },
  { id: "media", label: "Media & Gallery", icon: "📸" },
];

const THEME_OPTIONS = [
  "ADVENTURE",
  "HONEYMOON",
  "FAMILY",
  "GROUP",
  "SOLO",
  "CULTURAL",
  "LUXURY",
  "HILL_STATION",
  "WILDLIFE",
  "PILGRIMAGE",
  "BEACH",
  "WEEKEND_ESCAPE",
];

const STATUS_BADGES: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  DRAFT: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  IN_REVIEW: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ARCHIVED: "bg-red-500/15 text-red-400 border-red-500/30",
};

// Default Curated Fallback Destinations
const DEFAULT_COUNTRIES = [
  { slug: "india", name: "India" },
  { slug: "uae", name: "United Arab Emirates (Dubai)" },
  { slug: "thailand", name: "Thailand" },
  { slug: "indonesia", name: "Indonesia (Bali)" },
  { slug: "maldives", name: "Maldives" },
  { slug: "singapore", name: "Singapore" },
  { slug: "vietnam", name: "Vietnam" },
];

const DEFAULT_STATES = [
  { slug: "himachal", name: "Himachal Pradesh", countrySlug: "india" },
  { slug: "kashmir", name: "Jammu & Kashmir", countrySlug: "india" },
  { slug: "kerala", name: "Kerala", countrySlug: "india" },
  { slug: "rajasthan", name: "Rajasthan", countrySlug: "india" },
  { slug: "uttarakhand", name: "Uttarakhand", countrySlug: "india" },
  { slug: "goa", name: "Goa", countrySlug: "india" },
  { slug: "sikkim", name: "Sikkim & Darjeeling", countrySlug: "india" },
  { slug: "ladakh", name: "Ladakh", countrySlug: "india" },
  { slug: "andaman", name: "Andaman & Nicobar", countrySlug: "india" },
  { slug: "dubai", name: "Dubai & Abu Dhabi", countrySlug: "uae" },
  { slug: "bangkok-phuket", name: "Phuket & Krabi", countrySlug: "thailand" },
  { slug: "bali", name: "Bali Island", countrySlug: "indonesia" },
];

const DEFAULT_CITIES = [
  { slug: "manali", name: "Manali", stateSlug: "himachal", countrySlug: "india" },
  { slug: "shimla", name: "Shimla", stateSlug: "himachal", countrySlug: "india" },
  { slug: "dharamshala", name: "Dharamshala & McLeodganj", stateSlug: "himachal", countrySlug: "india" },
  { slug: "kufri", name: "Kufri", stateSlug: "himachal", countrySlug: "india" },
  { slug: "solang-valley", name: "Solang Valley", stateSlug: "himachal", countrySlug: "india" },
  { slug: "rohtang-pass", name: "Rohtang Pass", stateSlug: "himachal", countrySlug: "india" },
  { slug: "spiti", name: "Spiti Valley", stateSlug: "himachal", countrySlug: "india" },
  { slug: "dalhousie", name: "Dalhousie", stateSlug: "himachal", countrySlug: "india" },
  { slug: "kasauli", name: "Kasauli", stateSlug: "himachal", countrySlug: "india" },
  { slug: "srinagar", name: "Srinagar", stateSlug: "kashmir", countrySlug: "india" },
  { slug: "gulmarg", name: "Gulmarg", stateSlug: "kashmir", countrySlug: "india" },
  { slug: "pahalgam", name: "Pahalgam", stateSlug: "kashmir", countrySlug: "india" },
  { slug: "sonamarg", name: "Sonamarg", stateSlug: "kashmir", countrySlug: "india" },
  { slug: "munnar", name: "Munnar", stateSlug: "kerala", countrySlug: "india" },
  { slug: "alleppey", name: "Alleppey", stateSlug: "kerala", countrySlug: "india" },
  { slug: "thekkady", name: "Thekkady", stateSlug: "kerala", countrySlug: "india" },
  { slug: "jaipur", name: "Jaipur", stateSlug: "rajasthan", countrySlug: "india" },
  { slug: "udaipur", name: "Udaipur", stateSlug: "rajasthan", countrySlug: "india" },
  { slug: "jodhpur", name: "Jodhpur", stateSlug: "rajasthan", countrySlug: "india" },
  { slug: "jaisalmer", name: "Jaisalmer", stateSlug: "rajasthan", countrySlug: "india" },
  { slug: "rishikesh", name: "Rishikesh", stateSlug: "uttarakhand", countrySlug: "india" },
  { slug: "mussoorie", name: "Mussoorie", stateSlug: "uttarakhand", countrySlug: "india" },
  { slug: "nainital", name: "Nainital", stateSlug: "uttarakhand", countrySlug: "india" },
  { slug: "north-goa", name: "North Goa", stateSlug: "goa", countrySlug: "india" },
  { slug: "south-goa", name: "South Goa", stateSlug: "goa", countrySlug: "india" },
];

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<IPackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [themeFilter, setThemeFilter] = useState("ALL");

  // Hierarchy Destinations State
  const [availableCountries, setAvailableCountries] = useState(DEFAULT_COUNTRIES);
  const [availableStates, setAvailableStates] = useState(DEFAULT_STATES);
  const [availableCities, setAvailableCities] = useState(DEFAULT_CITIES);

  // Custom addition states
  const [customCountryInput, setCustomCountryInput] = useState("");
  const [customStateInput, setCustomStateInput] = useState("");
  const [customCityInput, setCustomCityInput] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [editingPkg, setEditingPkg] = useState<IPackageItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Success Notification state
  const [saveSuccess, setSaveSuccess] = useState<{
    isOpen: boolean;
    name: string;
    slug: string;
    action: "created" | "updated";
  } | null>(null);

  // Media Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"cover" | "gallery" | "itineraryDay">("cover");
  const [activeItineraryIndex, setActiveItineraryIndex] = useState<number>(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Package Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    route: "",
    destination: "",
    countries: ["india"] as string[],
    states: ["himachal"] as string[],
    cities: ["manali", "shimla"] as string[],
    stateSlug: "himachal",
    citySlug: "manali",
    nights: 6,
    days: 7,
    startingPrice: 18999,
    originalPrice: 23999,
    discountPercent: 20,
    discountBadge: "Save 20% Today",
    seasonalHike: {
      enabled: false,
      seasonType: "SUMMER_PEAK" as "NONE" | "SUMMER_PEAK" | "WINTER_PEAK" | "FESTIVE_WEEKEND" | "CUSTOM",
      hikeType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
      hikeValue: 15,
      seasonLabel: "Peak Summer Rush (May - June)",
      validityNote: "Applicable for travel dates during high-demand sessions",
    },
    seasonalHikes: [
      {
        id: "period_1",
        title: "Peak Summer Rush (May - June)",
        startDate: "2026-05-15",
        endDate: "2026-06-30",
        hikeType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
        hikeValue: 15,
        validityNote: "High-demand season surcharge included in live quote",
      },
    ] as SeasonalHikePeriod[],
    tag: "Best Seller",
    theme: ["HILL_STATION", "ADVENTURE"],
    category: "DOMESTIC",
    audience: ["COUPLES", "FAMILIES"],
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT" | "IN_REVIEW" | "ARCHIVED",
    coverImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&auto=format&fit=crop&q=80",
    ],
    overview: "Embark on an unforgettable journey through the majestic Himalayas with private sanitized cabs, verified 4-star mountain view stays, and 24/7 on-trip concierge assistance.",
    highlights: [
      "Rohtang Pass Snow Drive & Solang Valley Adventure",
      "Shimla Mall Road, The Ridge & Kufri Excursion",
      "Hidimba Devi Temple & Old Manali Cafe Trail",
      "Scenic Beas Valley & Pandoh Dam Drive",
    ],
    inclusions: [
      "Accommodation in handpicked verified hotels",
      "Daily buffet breakfast and freshly prepared multi-cuisine dinner",
      "Private AC Sedan/SUV for entire arrival to departure transfers",
      "Full-day excursion to Solang Valley and Rohtang Pass snow point",
      "Toll taxes, parking, driver allowance & state road permits",
      "24/7 dedicated on-trip concierge assistance",
    ],
    exclusions: [
      "Airfare or train tickets (available as flight add-on)",
      "Personal expenses (laundry, phone calls, room heaters)",
      "Adventure activity fees (ATV, paragliding, skiing)",
      "5% GST applicable on total package amount",
    ],
    hotelTiers: {
      standard: {
        title: "Deluxe 3★",
        pricePerAdult: 18999,
        desc: "Cozy verified boutique stays with daily breakfast & dinner",
      },
      deluxe: {
        title: "Super Deluxe 4★",
        pricePerAdult: 24999,
        desc: "Valley/river view premium rooms with private balcony & buffet meals",
      },
      luxury: {
        title: "Luxury 5★ Resort",
        pricePerAdult: 38999,
        desc: "Mountain spa resorts & Swiss luxury chalets with heated pool access",
      },
    },
    itinerary: [
      {
        day: 1,
        title: "Arrival · Scenic Drive to Shimla (Queen of Hills)",
        desc: "Meet and greet at Delhi/Chandigarh. Board your private SUV and commence your scenic drive up the Himalayan foothills. Check in to your Shimla hotel and enjoy evening views on Mall Road.",
        meals: "Dinner Included",
        hotel: "Pine View Boutique Stay (3★) / Riverfront Resort (4★) / Oberoi Cecil (5★)",
      },
      {
        day: 2,
        title: "Shimla Sightseeing & Kufri Snow Viewpoint",
        desc: "Excursion to Kufri (8,600 ft). Enjoy pony rides, Himalayan Nature Park, and panoramic snow peaks. Visit Viceregal Lodge, Jakhoo Temple, and Christ Church.",
        meals: "Breakfast & Dinner",
        hotel: "Pine View Boutique Stay (3★) / Riverfront Resort (4★) / Oberoi Cecil (5★)",
      },
      {
        day: 3,
        title: "Shimla → Manali via Kullu Valley & Pandoh Dam",
        desc: "Scenic drive from Shimla to Manali along the Beas River. Stop at Pandoh Dam, Hanogi Mata Temple, and Kullu Shawl factory. Check in to mountain resort.",
        meals: "Breakfast & Dinner",
        hotel: "Snow Peak Retreat (3★) / Riverfront Resort (4★) / Span Resort & Spa (5★)",
      },
      {
        day: 4,
        title: "Manali Local Sightseeing & Old Manali Heritage",
        desc: "Visit the 450-year-old Hadimba Devi wooden temple in cedar forest, Vashisht Hot Sulphur Springs, and Old Manali riverside cafes.",
        meals: "Breakfast & Dinner",
        hotel: "Snow Peak Retreat (3★) / Riverfront Resort (4★) / Span Resort & Spa (5★)",
      },
      {
        day: 5,
        title: "Solang Valley & Rohtang Pass Snow Excursion",
        desc: "Early morning snow expedition to Rohtang Pass (13,050 ft) and Solang Valley. Paragliding, zorbing, ATV rides, and Himalayan panoramas.",
        meals: "Breakfast & Dinner",
        hotel: "Snow Peak Retreat (3★) / Riverfront Resort (4★) / Span Resort & Spa (5★)",
      },
      {
        day: 6,
        title: "Manali → Chandigarh Scenic Drive",
        desc: "Drive to Chandigarh via Kullu and Manikaran Sahib hot springs. Visit Rock Garden and Sukhna Lake. Check in to hotel.",
        meals: "Breakfast & Dinner",
        hotel: "Hotel Mountview (4★) / JW Marriott (5★)",
      },
      {
        day: 7,
        title: "Departure with Unforgettable Memories",
        desc: "After breakfast, transfer to Chandigarh Airport / Railway Station for your onward journey with warm memories.",
        meals: "Breakfast Included",
        hotel: "Tour Concludes",
      },
    ] as ItineraryDay[],
    faqs: [
      {
        q: "How does changing hotel category affect the package?",
        a: "Selecting Deluxe (3★), Super Deluxe (4★), or Luxury (5★) dynamically upgrades your verified hotel stays and recalculates the live price per adult across the itinerary.",
      },
      {
        q: "Can we customize this itinerary or add extra nights?",
        a: "Yes! All Be My Traveller packages are 100% tailor-made. You can add extra days in Solang, upgrade vehicles, or add flights.",
      },
      {
        q: "What type of private cab is provided?",
        a: "We provide dedicated private sanitized AC Sedans (Dzire/Etios) or SUVs (Innova/Crysta) for the entire arrival-to-departure tour.",
      },
    ],
    seo: {
      metaTitle: "6 Nights 7 Days Himachal & Manali Tour Package | Be My Traveller",
      metaDescription: "Book handcrafted 6N/7D Himachal Manali tour packages with verified 4★/5★ hotels, private cab transfers, daily meals, and Rohtang Pass excursions.",
      keywords: "himachal tour packages, manali tour package 6 nights, rohtang pass holiday, shimla manali private tour",
    },
  });

  // Temporary item state for inputs
  const [newHighlight, setNewHighlight] = useState("");
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newFaq, setNewFaq] = useState({ q: "", a: "" });

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/v1/admin/packages?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.packages) {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error("Failed to load packages:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Load Dynamic Destination Hierarchy on Mount
  useEffect(() => {
    async function loadHierarchy() {
      try {
        const res = await fetch("/api/v1/destinations/hierarchy");
        const data = await res.json();
        if (data.success) {
          if (data.countries && data.countries.length > 0) {
            setAvailableCountries((prev) => {
              const merged = [...data.countries.map((c: any) => ({ slug: c.slug, name: c.name })), ...prev];
              return Array.from(new Map(merged.map((m) => [m.slug, m])).values());
            });
          }
          if (data.states && data.states.length > 0) {
            setAvailableStates((prev) => {
              const merged = [
                ...data.states.map((s: any) => ({
                  slug: s.slug,
                  name: s.name,
                  countrySlug: s.countrySlug || "india",
                  countryName: s.countryName || "India",
                })),
                ...prev,
              ];
              return Array.from(new Map(merged.map((m) => [m.slug, m])).values());
            });
          }
          if (data.cities && data.cities.length > 0) {
            setAvailableCities((prev) => {
              const merged = [
                ...data.cities.map((c: any) => ({
                  slug: c.slug,
                  name: c.name,
                  stateSlug: c.stateSlug || "himachal",
                  stateName: c.stateName || "Himachal Pradesh",
                  countrySlug: c.countrySlug || "india",
                })),
                ...prev,
              ];
              return Array.from(new Map(merged.map((m) => [m.slug, m])).values());
            });
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic destinations hierarchy, using curated defaults:", err);
      }
    }
    loadHierarchy();
  }, []);

  // Location Hierarchy Modification Handlers
  const addCountry = (slug: string) => {
    if (!slug) return;
    const clean = slug.toLowerCase().trim();
    setFormData((prev) => ({
      ...prev,
      countries: prev.countries.includes(clean) ? prev.countries : [...prev.countries, clean],
    }));
  };

  const removeCountry = (slug: string) => {
    setFormData((prev) => ({
      ...prev,
      countries: prev.countries.filter((c) => c !== slug),
    }));
  };

  const addState = (slug: string) => {
    if (!slug) return;
    const clean = slug.toLowerCase().trim();
    setFormData((prev) => ({
      ...prev,
      states: prev.states.includes(clean) ? prev.states : [...prev.states, clean],
      stateSlug: prev.states[0] || clean,
    }));
  };

  const removeState = (slug: string) => {
    setFormData((prev) => {
      const newStates = prev.states.filter((s) => s !== slug);
      return {
        ...prev,
        states: newStates,
        stateSlug: newStates[0] || "",
      };
    });
  };

  const addCity = (slug: string) => {
    if (!slug) return;
    const clean = slug.toLowerCase().trim();
    setFormData((prev) => ({
      ...prev,
      cities: prev.cities.includes(clean) ? prev.cities : [...prev.cities, clean],
      citySlug: prev.cities[0] || clean,
    }));
  };

  const removeCity = (slug: string) => {
    setFormData((prev) => {
      const newCities = prev.cities.filter((c) => c !== slug);
      return {
        ...prev,
        cities: newCities,
        citySlug: newCities[0] || "",
      };
    });
  };

  const autoGenerateRoute = () => {
    if (formData.cities.length === 0) return;
    const cityNames = formData.cities.map((slug) => {
      const found = availableCities.find((c) => c.slug === slug);
      return found ? found.name : slug.charAt(0).toUpperCase() + slug.slice(1);
    });

    if (cityNames.length === 1) {
      setFormData((prev) => ({ ...prev, route: `${cityNames[0]} (${prev.nights}N/${prev.days}D Tour)` }));
    } else if (cityNames.length === 2) {
      const n1 = Math.floor(formData.nights / 2);
      const n2 = formData.nights - n1;
      setFormData((prev) => ({ ...prev, route: `${cityNames[0]} (${n1}N) · ${cityNames[1]} (${n2}N)` }));
    } else {
      const count = cityNames.length;
      const baseN = Math.max(1, Math.floor(formData.nights / count));
      const parts = cityNames.map((name, i) => {
        const n = i === count - 1 ? formData.nights - baseN * (count - 1) : baseN;
        return `${name} (${n > 0 ? n : 1}N)`;
      });
      setFormData((prev) => ({ ...prev, route: parts.join(" · ") }));
    }
  };

  // Open Edit Modal
  const openEdit = (pkg: IPackageItem) => {
    setEditingPkg(pkg);
    setFormError(null);
    setActiveTab("basic");

    const initHotelTiers = pkg.hotelTiers || {
      standard: { title: "Deluxe 3★", pricePerAdult: pkg.startingPrice || 18999, desc: "Cozy boutique verified stays with daily breakfast & dinner" },
      deluxe: { title: "Super Deluxe 4★", pricePerAdult: Math.round((pkg.startingPrice || 18999) * 1.25) || 23999, desc: "Valley/river view premium rooms with private balcony & buffet meals" },
      luxury: { title: "Luxury 5★ Resort", pricePerAdult: Math.round((pkg.startingPrice || 18999) * 1.65) || 31999, desc: "Mountain spa resorts & Swiss luxury chalets with heated pool access" },
    };

    const startP = initHotelTiers.standard.pricePerAdult || pkg.startingPrice || 18999;
    const discP = pkg.discountPercent !== undefined ? pkg.discountPercent : 20;
    const origP = pkg.originalPrice || (discP > 0 ? Math.round(startP / (1 - discP / 100)) : Math.round(startP * 1.25));

    const initCountries = Array.isArray(pkg.countries) && pkg.countries.length > 0
      ? pkg.countries
      : ["india"];
    const initStates = Array.isArray(pkg.states) && pkg.states.length > 0
      ? pkg.states
      : (pkg.stateSlug ? [pkg.stateSlug] : ["himachal"]);
    const initCities = Array.isArray(pkg.cities) && pkg.cities.length > 0
      ? pkg.cities
      : (pkg.citySlug ? [pkg.citySlug] : ["manali", "shimla"]);

    const initSeasonalHike: SeasonalHike = pkg.seasonalHike ? {
      enabled: !!pkg.seasonalHike.enabled,
      seasonType: pkg.seasonalHike.seasonType || "SUMMER_PEAK",
      hikeType: pkg.seasonalHike.hikeType || "PERCENTAGE",
      hikeValue: Number(pkg.seasonalHike.hikeValue) || 15,
      seasonLabel: pkg.seasonalHike.seasonLabel || "Peak Summer Rush (May - June)",
      validityNote: pkg.seasonalHike.validityNote || "Applicable for travel dates during high-demand sessions",
    } : {
      enabled: false,
      seasonType: "SUMMER_PEAK",
      hikeType: "PERCENTAGE",
      hikeValue: 15,
      seasonLabel: "Peak Summer Rush (May - June)",
      validityNote: "Applicable for travel dates during high-demand sessions",
    };

    const initSeasonalHikes: SeasonalHikePeriod[] = Array.isArray(pkg.seasonalHikes) && pkg.seasonalHikes.length > 0
      ? pkg.seasonalHikes
      : (pkg.seasonalHike?.enabled
          ? [{
              id: "period_1",
              title: pkg.seasonalHike.seasonLabel || "Peak Summer Rush (May - June)",
              startDate: "2026-05-15",
              endDate: "2026-06-30",
              hikeType: pkg.seasonalHike.hikeType || "PERCENTAGE",
              hikeValue: pkg.seasonalHike.hikeValue || 15,
              validityNote: pkg.seasonalHike.validityNote || "Applicable for travel dates during high-demand sessions",
            }]
          : []);

    setFormData({
      name: pkg.name || "",
      slug: pkg.slug || "",
      tagline: pkg.tagline || "",
      route: pkg.route || pkg.destination || "",
      destination: pkg.destination || "",
      countries: initCountries,
      states: initStates,
      cities: initCities,
      stateSlug: initStates[0] || "himachal",
      citySlug: initCities[0] || "manali",
      nights: pkg.nights || 6,
      days: pkg.days || 7,
      startingPrice: startP,
      originalPrice: origP,
      discountPercent: discP,
      discountBadge: pkg.discountBadge || `Save ${discP}% Today`,
      seasonalHike: initSeasonalHike,
      seasonalHikes: initSeasonalHikes,
      tag: pkg.tag || "Best Seller",
      theme: pkg.theme && pkg.theme.length > 0 ? pkg.theme : ["HILL_STATION"],
      category: pkg.category || "DOMESTIC",
      audience: pkg.audience || ["COUPLES", "FAMILIES"],
      status: pkg.status || "PUBLISHED",
      coverImage: pkg.coverImageStr || pkg.coverImage || "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80",
      gallery: Array.isArray(pkg.gallery) && pkg.gallery.length > 0 ? (pkg.gallery as any[]).map(g => typeof g === 'string' ? g : g.url) : [
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&auto=format&fit=crop&q=80",
      ],
      overview: pkg.overview || pkg.shortDescription || "",
      highlights: Array.isArray(pkg.highlights) ? pkg.highlights : [],
      inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
      exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions : [],
      hotelTiers: initHotelTiers,
      itinerary: Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0 ? pkg.itinerary.map((d: any, i: number) => ({
        day: d.day || i + 1,
        title: d.title || `Day ${i + 1}`,
        desc: typeof d.description === 'string' ? d.description : (d.desc || ""),
        meals: typeof d.meals === 'string' ? d.meals : "Breakfast & Dinner",
        hotel: typeof d.hotel === 'string' ? d.hotel : "Verified 4★ Mountain Resort",
      })) : [],
      faqs: Array.isArray(pkg.faqs) ? pkg.faqs : [],
      seo: {
        metaTitle: pkg.seo?.metaTitle || `${pkg.name} | Be My Traveller`,
        metaDescription: pkg.seo?.metaDescription || pkg.shortDescription || "",
        keywords: pkg.seo?.keywords || "",
      },
    });
    setModalOpen(true);
  };

  // Open Add Modal
  const openAdd = () => {
    setEditingPkg(null);
    setFormError(null);
    setActiveTab("basic");
    setFormData({
      name: "",
      slug: "",
      tagline: "",
      route: "",
      destination: "",
      countries: ["india"],
      states: ["himachal"],
      cities: ["manali", "shimla"],
      stateSlug: "himachal",
      citySlug: "manali",
      nights: 6,
      days: 7,
      startingPrice: 18999,
      originalPrice: 23999,
      discountPercent: 20,
      discountBadge: "Save 20% Today",
      seasonalHike: {
        enabled: false,
        seasonType: "SUMMER_PEAK",
        hikeType: "PERCENTAGE",
        hikeValue: 15,
        seasonLabel: "Peak Summer Rush (May - June)",
        validityNote: "Applicable for travel dates during high-demand sessions",
      },
      seasonalHikes: [
        {
          id: "period_1",
          title: "Peak Summer Rush",
          startDate: "2026-05-15",
          endDate: "2026-06-30",
          hikeType: "PERCENTAGE",
          hikeValue: 15,
          validityNote: "High-demand summer bookings surge",
        },
      ],
      tag: "Best Seller",
      theme: ["HILL_STATION", "ADVENTURE"],
      category: "DOMESTIC",
      audience: ["COUPLES", "FAMILIES"],
      status: "PUBLISHED",
      coverImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&auto=format&fit=crop&q=80",
      ],
      overview: "Embark on an unforgettable journey through the majestic Himalayas with private sanitized cabs, verified 4-star mountain view stays, and 24/7 on-trip concierge assistance.",
      highlights: [
        "Rohtang Pass Snow Drive & Solang Valley Adventure",
        "Shimla Mall Road, The Ridge & Kufri Excursion",
        "Hidimba Devi Temple & Old Manali Cafe Trail",
        "Scenic Beas Valley & Pandoh Dam Drive",
      ],
      inclusions: [
        "Accommodation in handpicked verified hotels",
        "Daily buffet breakfast and freshly prepared multi-cuisine dinner",
        "Private AC Sedan/SUV for entire arrival to departure transfers",
        "Full-day excursion to Solang Valley and Rohtang Pass snow point",
        "Toll taxes, parking, driver allowance & state road permits",
        "24/7 dedicated on-trip concierge assistance",
      ],
      exclusions: [
        "Airfare or train tickets (available as flight add-on)",
        "Personal expenses (laundry, phone calls, room heaters)",
        "Adventure activity fees (ATV, paragliding, skiing)",
        "5% GST applicable on total package amount",
      ],
      hotelTiers: {
        standard: {
          title: "Deluxe 3★",
          pricePerAdult: 18999,
          desc: "Cozy verified boutique stays with daily breakfast & dinner",
        },
        deluxe: {
          title: "Super Deluxe 4★",
          pricePerAdult: 24999,
          desc: "Valley/river view premium rooms with private balcony & buffet meals",
        },
        luxury: {
          title: "Luxury 5★ Resort",
          pricePerAdult: 38999,
          desc: "Mountain spa resorts & Swiss luxury chalets with heated pool access",
        },
      },
      itinerary: [
        {
          day: 1,
          title: "Arrival · Scenic Drive to Shimla (Queen of Hills)",
          desc: "Meet and greet at Delhi/Chandigarh. Board your private SUV and commence your scenic drive up the Himalayan foothills.",
          meals: "Dinner Included",
          hotel: "Pine View Boutique Stay (3★) / Riverfront Resort (4★) / Oberoi Cecil (5★)",
        },
        {
          day: 2,
          title: "Shimla Sightseeing & Kufri Snow Viewpoint",
          desc: "Excursion to Kufri (8,600 ft). Enjoy pony rides, Himalayan Nature Park, and panoramic snow peaks.",
          meals: "Breakfast & Dinner",
          hotel: "Pine View Boutique Stay (3★) / Riverfront Resort (4★) / Oberoi Cecil (5★)",
        },
        {
          day: 3,
          title: "Shimla → Manali via Kullu Valley & Pandoh Dam",
          desc: "Scenic drive from Shimla to Manali along the Beas River. Stop at Pandoh Dam and Kullu Shawl factory.",
          meals: "Breakfast & Dinner",
          hotel: "Snow Peak Retreat (3★) / Riverfront Resort (4★) / Span Resort & Spa (5★)",
        },
      ],
      faqs: [
        {
          q: "How does changing hotel category affect the package?",
          a: "Selecting Deluxe (3★), Super Deluxe (4★), or Luxury (5★) dynamically upgrades your verified hotel stays and recalculates the live price per adult across the itinerary.",
        },
      ],
      seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: "",
      },
    });
    setModalOpen(true);
  };

  // Delete Package
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/packages/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPackages();
      } else {
        alert("Failed to delete package");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting package");
    }
  };

  // Save Package Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const endpoint = editingPkg
        ? `/api/v1/admin/packages/${editingPkg._id}`
        : "/api/v1/admin/packages";
      const method = editingPkg ? "PATCH" : "POST";

      const standardPrice = Number(formData.hotelTiers.standard.pricePerAdult) || 18999;
      const discPercent = Number(formData.discountPercent) || 0;
      const computedOriginal = discPercent > 0
        ? Math.round(standardPrice / (1 - discPercent / 100))
        : Math.round(standardPrice * 1.25);

      const payload = {
        ...formData,
        startingPrice: standardPrice,
        originalPrice: computedOriginal,
        destination: formData.route || formData.destination,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedName = formData.name;
        const savedSlug = formData.slug;
        const actionType = editingPkg ? "updated" : "created";

        setModalOpen(false);
        setEditingPkg(null);
        setSaveSuccess({
          isOpen: true,
          name: savedName,
          slug: savedSlug,
          action: actionType,
        });
        fetchPackages();
      } else {
        const errData = await res.json();
        setFormError(errData.error || errData.detail || "Failed to save package. Please verify all fields.");
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  // Cloudinary Direct Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", `bemytraveller/packages/${formData.slug || "general"}`);
      uploadFormData.append("category", formData.category === "DOMESTIC" ? "domestic" : "international");

      const res = await fetch("/api/v1/admin/media/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();
      if (res.ok && (data.url || data.media?.url)) {
        const uploadedUrl = data.url || data.media?.url;
        if (mediaTarget === "cover") {
          setFormData((prev) => ({ ...prev, coverImage: uploadedUrl }));
        } else if (mediaTarget === "gallery") {
          setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, uploadedUrl] }));
        }
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image to Cloudinary");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6" data-watermark="RRDS">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
              Travel Product Engine · CMS + CRM
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Tour Packages Management</h1>
          <p className="text-slate-400 text-xs max-w-2xl">
            Manage handcrafted tour packages, 3-tier hotel pricing (Deluxe, Super Deluxe, Luxury), day-by-day itineraries, and dynamic frontend quotes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPackages}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Refresh database records"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <span>+</span>
            <span>Add Tour Package</span>
          </button>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search live packages by title, route, slug, or destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Themes</option>
              {THEME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Packages Table ── */}
      {loading && packages.length === 0 ? (
        <div className="text-center py-20 text-slate-400 space-y-2">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading tour packages from database...</p>
        </div>
      ) : packages.length > 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-black uppercase text-slate-400 border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Package &amp; Route</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Starting Price</th>
                  <th className="py-3.5 px-4">Hotel Tiers</th>
                  <th className="py-3.5 px-4">Theme</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {packages
                  .filter((p) => themeFilter === "ALL" || p.theme?.includes(themeFilter))
                  .map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-700 shadow-sm">
                            <img
                              src={pkg.coverImageStr || pkg.coverImage || "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=200&auto=format&fit=crop&q=80"}
                              alt={pkg.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm line-clamp-1">{pkg.name}</span>
                              {pkg.tag && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                                  {pkg.tag}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 line-clamp-1 block">
                              📍 {pkg.route || pkg.tagline || pkg.destination || "Custom Itinerary"}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">/packages/{pkg.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {pkg.nights}N / {pkg.days}D
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-black text-emerald-400 text-sm">
                          ₹{Number(pkg.startingPrice || 14999).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-slate-500 block">/ person</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          <span className="text-slate-300 block font-semibold">
                            3★: ₹{Number(pkg.hotelTiers?.standard?.pricePerAdult || pkg.startingPrice || 18999).toLocaleString("en-IN")}
                          </span>
                          <span className="text-amber-400/90 block font-semibold">
                            4★: ₹{Number(pkg.hotelTiers?.deluxe?.pricePerAdult || Math.round((pkg.startingPrice || 18999) * 1.3)).toLocaleString("en-IN")}
                          </span>
                          <span className="text-purple-400/90 block font-semibold">
                            5★: ₹{Number(pkg.hotelTiers?.luxury?.pricePerAdult || Math.round((pkg.startingPrice || 18999) * 1.9)).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/20">
                          {pkg.theme?.[0] || "HILL_STATION"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${STATUS_BADGES[pkg.status] || STATUS_BADGES.DRAFT}`}>
                          {pkg.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/packages/${pkg.slug}`}
                            target="_blank"
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                            title="View Live Package Page"
                          >
                            👁️ View
                          </Link>
                          <button
                            onClick={() => openEdit(pkg)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(pkg._id, pkg.name)}
                            className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/30 rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <div className="text-4xl">🎒</div>
          <h3 className="text-lg font-bold text-white">No tour packages found</h3>
          <p className="text-xs text-slate-400">Create new itineraries with 3-tier hotel stays and pricing.</p>
        </div>
      )}

      {/* ── Enlarged 7-Tab Package CMS Editor Modal (Max-W-5xl) ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] my-4">
            {/* Modal Top Header */}
            <div className="p-5 sm:px-7 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎒</span>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                    {editingPkg ? `Edit Package: ${editingPkg.name}` : "Create New Tour Package"}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {formData.name || "Package Details & Hotel Tier Engine"}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer text-base"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs Bar */}
            <div className="flex items-center gap-1.5 px-6 pt-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto scrollbar-none">
              {PACKAGE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === tab.id
                      ? "border-amber-500 text-amber-400 bg-slate-900 shadow-xs"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
              {/* TAB 1: Basic Info & Hierarchy */}
              {activeTab === "basic" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Package Title <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            name: val,
                            slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                          }));
                        }}
                        placeholder="e.g. 6 Nights 7 Days Majestic Himachal & Rohtang Pass Tour"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        URL Slug <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })}
                        placeholder="e.g. 6-nights-himachal-manali-tour"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-hidden focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Canonical: /packages/{formData.slug || "slug"}
                      </span>
                    </div>
                  </div>

                  {/* ── 🗺️ 3-TIER HIERARCHICAL LOCATION SELECTOR (Countries -> States -> Cities) ── */}
                  <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 block">
                          Location Hierarchy &amp; Geographic Targeting
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          Select Multiple Countries, States, and Cities for this Package
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={autoGenerateRoute}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>✨</span>
                        <span>Auto-Generate Route from Cities</span>
                      </button>
                    </div>

                    {/* 3 Step Cascade Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Step 1: Countries (Multiple) */}
                      <div className="space-y-2.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <span>🌍</span> 1. Select Country (Multiple)
                          </span>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            {formData.countries.length} Selected
                          </span>
                        </div>

                        <select
                          onChange={(e) => {
                            addCountry(e.target.value);
                            e.target.value = "";
                          }}
                          defaultValue=""
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                        >
                          <option value="" disabled>+ Choose Country from List</option>
                          {availableCountries.map((c) => (
                            <option key={c.slug} value={c.slug}>
                              {c.name} ({c.slug})
                            </option>
                          ))}
                        </select>

                        {/* Quick Custom Country Input */}
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Or add custom country..."
                            value={customCountryInput}
                            onChange={(e) => setCustomCountryInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (customCountryInput.trim()) {
                                  addCountry(customCountryInput.trim().toLowerCase().replace(/\s+/g, "-"));
                                  setCustomCountryInput("");
                                }
                              }
                            }}
                            className="flex-1 px-2.5 py-1.5 text-[11px] bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customCountryInput.trim()) {
                                addCountry(customCountryInput.trim().toLowerCase().replace(/\s+/g, "-"));
                                setCustomCountryInput("");
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Selected Countries Badges */}
                        <div className="flex flex-wrap gap-1.5 min-h-[36px] pt-1">
                          {formData.countries.map((c) => {
                            const cName = availableCountries.find((item) => item.slug === c)?.name || c;
                            return (
                              <span
                                key={c}
                                className="px-2 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5"
                              >
                                <span>🌍 {cName}</span>
                                <button
                                  type="button"
                                  onClick={() => removeCountry(c)}
                                  className="hover:text-red-400 cursor-pointer text-xs"
                                >
                                  ✕
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 2: States / Regions (Multiple) */}
                      <div className="space-y-2.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <span>🏛️</span> 2. Select State(s) (Multiple)
                          </span>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            {formData.states.length} Selected
                          </span>
                        </div>

                        <select
                          onChange={(e) => {
                            addState(e.target.value);
                            e.target.value = "";
                          }}
                          defaultValue=""
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                        >
                          <option value="" disabled>+ Choose State from List</option>
                          {availableStates
                            .filter((st) => formData.countries.length === 0 || formData.countries.includes(st.countrySlug || "india"))
                            .map((st) => (
                              <option key={st.slug} value={st.slug}>
                                {st.name} ({st.slug})
                              </option>
                            ))}
                        </select>

                        {/* Quick Custom State Input */}
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Or add custom state..."
                            value={customStateInput}
                            onChange={(e) => setCustomStateInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (customStateInput.trim()) {
                                  addState(customStateInput.trim().toLowerCase().replace(/\s+/g, "-"));
                                  setCustomStateInput("");
                                }
                              }
                            }}
                            className="flex-1 px-2.5 py-1.5 text-[11px] bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customStateInput.trim()) {
                                addState(customStateInput.trim().toLowerCase().replace(/\s+/g, "-"));
                                setCustomStateInput("");
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Selected States Badges */}
                        <div className="flex flex-wrap gap-1.5 min-h-[36px] pt-1">
                          {formData.states.map((s) => {
                            const sName = availableStates.find((item) => item.slug === s)?.name || s;
                            return (
                              <span
                                key={s}
                                className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5"
                              >
                                <span>🏛️ {sName}</span>
                                <button
                                  type="button"
                                  onClick={() => removeState(s)}
                                  className="hover:text-red-400 cursor-pointer text-xs"
                                >
                                  ✕
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 3: Cities / Places Covered (Multiple) */}
                      <div className="space-y-2.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <span>📍</span> 3. Select Cities / Places (Multiple)
                          </span>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            {formData.cities.length} Selected
                          </span>
                        </div>

                        <select
                          onChange={(e) => {
                            addCity(e.target.value);
                            e.target.value = "";
                          }}
                          defaultValue=""
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                        >
                          <option value="" disabled>+ Choose City / Place</option>
                          {availableCities
                            .filter((ct) => formData.states.length === 0 || formData.states.includes(ct.stateSlug || "himachal"))
                            .map((ct) => (
                              <option key={ct.slug} value={ct.slug}>
                                {ct.name} ({ct.slug})
                              </option>
                            ))}
                        </select>

                        {/* Quick Custom City Input */}
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Or add custom place..."
                            value={customCityInput}
                            onChange={(e) => setCustomCityInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (customCityInput.trim()) {
                                  addCity(customCityInput.trim().toLowerCase().replace(/\s+/g, "-"));
                                  setCustomCityInput("");
                                }
                              }
                            }}
                            className="flex-1 px-2.5 py-1.5 text-[11px] bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customCityInput.trim()) {
                                addCity(customCityInput.trim().toLowerCase().replace(/\s+/g, "-"));
                                setCustomCityInput("");
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Selected Cities Badges */}
                        <div className="flex flex-wrap gap-1.5 min-h-[36px] pt-1">
                          {formData.cities.map((city) => {
                            const cityName = availableCities.find((item) => item.slug === city)?.name || city;
                            return (
                              <span
                                key={city}
                                className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5"
                              >
                                <span>📍 {cityName}</span>
                                <button
                                  type="button"
                                  onClick={() => removeCity(city)}
                                  className="hover:text-red-400 cursor-pointer text-xs"
                                >
                                  ✕
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Breakdown & Tag */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Route Breakdown Narrative</label>
                      <input
                        type="text"
                        value={formData.route}
                        onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                        placeholder="e.g. Shimla (2N) · Manali (3N) · Chandigarh (1N)"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Tag / Badge</label>
                      <input
                        type="text"
                        value={formData.tag}
                        onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                        placeholder="e.g. Best Seller, Trending, 20% OFF"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        <option value="DOMESTIC">Domestic Holiday (India)</option>
                        <option value="INTERNATIONAL">International Holiday</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Primary Theme</label>
                      <select
                        value={formData.theme[0] || "HILL_STATION"}
                        onChange={(e) => setFormData({ ...formData, theme: [e.target.value] })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        {THEME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Publish Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        <option value="PUBLISHED">Published (Visible on site)</option>
                        <option value="DRAFT">Draft (Hidden)</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 3-Tier Hotel Pricing, Promotional Discount & Seasonal Hike Engine */}
              {activeTab === "pricing" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Package Duration */}
                  <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🕒</span>
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Package Duration</span>
                        <span className="text-[11px] text-slate-400">Total itinerary nights and days</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-300">Nights:</label>
                        <input
                          type="number"
                          min={1}
                          value={formData.nights}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            setFormData((prev) => ({ ...prev, nights: n, days: n + 1 }));
                          }}
                          className="w-20 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-black text-center focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-300">Days:</label>
                        <input
                          type="number"
                          min={1}
                          value={formData.days}
                          onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                          className="w-20 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-black text-center focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION 1: 🏨 3-TIER HOTEL CUSTOMIZATION & PRICING MATRIX ── */}
                  <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 block">
                          Core Package Purchasing Options
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          3-Tier Hotel Customization &amp; Pricing Categories
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Clients select between Deluxe 3★, Super Deluxe 4★ &amp; Luxury 5★ live on the site.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Tier 1: Deluxe 3★ (Standard) */}
                      {(() => {
                        const t1Price = Number(formData.hotelTiers.standard.pricePerAdult) || 18999;
                        const disc = Number(formData.discountPercent) || 0;
                        const t1Orig = disc > 0 ? Math.round(t1Price / (1 - disc / 100)) : Math.round(t1Price * 1.25);
                        const t1Sav = t1Orig - t1Price;
                        const hike = formData.seasonalHike?.enabled
                          ? (formData.seasonalHike.hikeType === "PERCENTAGE"
                              ? Math.round(t1Price * (formData.seasonalHike.hikeValue / 100))
                              : formData.seasonalHike.hikeValue)
                          : 0;

                        return (
                          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                  <span>🏨</span> Tier 1: Deluxe 3★
                                </span>
                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                                  Standard
                                </span>
                              </div>
                              <input
                                type="text"
                                value={formData.hotelTiers.standard.title}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    hotelTiers: {
                                      ...prev.hotelTiers,
                                      standard: { ...prev.hotelTiers.standard, title: e.target.value },
                                    },
                                  }))
                                }
                                placeholder="Tier Title (e.g. Deluxe 3★)"
                                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-hidden focus:border-amber-500"
                              />
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-300">Price Per Adult (₹) *</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={formData.hotelTiers.standard.pricePerAdult}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      hotelTiers: {
                                        ...prev.hotelTiers,
                                        standard: { ...prev.hotelTiers.standard, pricePerAdult: Number(e.target.value) },
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-black text-sm focus:outline-hidden focus:border-amber-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-slate-400">Hotel Stays Description</label>
                                <textarea
                                  rows={2}
                                  value={formData.hotelTiers.standard.desc}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      hotelTiers: {
                                        ...prev.hotelTiers,
                                        standard: { ...prev.hotelTiers.standard, desc: e.target.value },
                                      },
                                    }))
                                  }
                                  placeholder="Cozy boutique verified stays with daily breakfast & dinner"
                                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-hidden focus:border-amber-500"
                                />
                              </div>
                            </div>

                            {/* Live Calculation Footer */}
                            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                              {disc > 0 && (
                                <div className="flex items-center justify-between text-slate-400">
                                  <span>Original: <span className="line-through">₹{t1Orig.toLocaleString("en-IN")}</span></span>
                                  <span className="text-emerald-400 font-bold">Save ₹{t1Sav.toLocaleString("en-IN")} ({disc}% OFF)</span>
                                </div>
                              )}
                              {formData.seasonalHike?.enabled && hike > 0 && (
                                <div className="flex items-center justify-between text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                                  <span>Peak Season Fare:</span>
                                  <span>₹{(t1Price + hike).toLocaleString("en-IN")} (+{formData.seasonalHike.hikeValue}{formData.seasonalHike.hikeType === "PERCENTAGE" ? "%" : "₹"})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Tier 2: Super Deluxe 4★ (Recommended) */}
                      {(() => {
                        const t2Price = Number(formData.hotelTiers.deluxe.pricePerAdult) || 23999;
                        const disc = Number(formData.discountPercent) || 0;
                        const t2Orig = disc > 0 ? Math.round(t2Price / (1 - disc / 100)) : Math.round(t2Price * 1.25);
                        const t2Sav = t2Orig - t2Price;
                        const hike = formData.seasonalHike?.enabled
                          ? (formData.seasonalHike.hikeType === "PERCENTAGE"
                              ? Math.round(t2Price * (formData.seasonalHike.hikeValue / 100))
                              : formData.seasonalHike.hikeValue)
                          : 0;

                        return (
                          <div className="p-4 bg-slate-900/80 rounded-2xl border border-amber-500/50 space-y-3 flex flex-col justify-between shadow-lg shadow-amber-500/5">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                  <span>🌟</span> Tier 2: Super Deluxe 4★
                                </span>
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-black">
                                  Recommended
                                </span>
                              </div>
                              <input
                                type="text"
                                value={formData.hotelTiers.deluxe.title}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    hotelTiers: {
                                      ...prev.hotelTiers,
                                      deluxe: { ...prev.hotelTiers.deluxe, title: e.target.value },
                                    },
                                  }))
                                }
                                placeholder="Tier Title (e.g. Super Deluxe 4★)"
                                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-hidden focus:border-amber-500"
                              />
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-amber-300">Price Per Adult (₹) *</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={formData.hotelTiers.deluxe.pricePerAdult}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      hotelTiers: {
                                        ...prev.hotelTiers,
                                        deluxe: { ...prev.hotelTiers.deluxe, pricePerAdult: Number(e.target.value) },
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-black text-sm focus:outline-hidden focus:border-amber-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-slate-400">Hotel Stays Description</label>
                                <textarea
                                  rows={2}
                                  value={formData.hotelTiers.deluxe.desc}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      hotelTiers: {
                                        ...prev.hotelTiers,
                                        deluxe: { ...prev.hotelTiers.deluxe, desc: e.target.value },
                                      },
                                    }))
                                  }
                                  placeholder="Valley/river view premium rooms with private balcony & buffet meals"
                                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-hidden focus:border-amber-500"
                                />
                              </div>
                            </div>

                            {/* Live Calculation Footer */}
                            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                              {disc > 0 && (
                                <div className="flex items-center justify-between text-slate-400">
                                  <span>Original: <span className="line-through">₹{t2Orig.toLocaleString("en-IN")}</span></span>
                                  <span className="text-emerald-400 font-bold">Save ₹{t2Sav.toLocaleString("en-IN")} ({disc}% OFF)</span>
                                </div>
                              )}
                              {formData.seasonalHike?.enabled && hike > 0 && (
                                <div className="flex items-center justify-between text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                                  <span>Peak Season Fare:</span>
                                  <span>₹{(t2Price + hike).toLocaleString("en-IN")} (+{formData.seasonalHike.hikeValue}{formData.seasonalHike.hikeType === "PERCENTAGE" ? "%" : "₹"})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Tier 3: Luxury 5★ Resort (Premium VIP) */}
                      {(() => {
                        const t3Price = Number(formData.hotelTiers.luxury.pricePerAdult) || 31999;
                        const disc = Number(formData.discountPercent) || 0;
                        const t3Orig = disc > 0 ? Math.round(t3Price / (1 - disc / 100)) : Math.round(t3Price * 1.25);
                        const t3Sav = t3Orig - t3Price;
                        const hike = formData.seasonalHike?.enabled
                          ? (formData.seasonalHike.hikeType === "PERCENTAGE"
                              ? Math.round(t3Price * (formData.seasonalHike.hikeValue / 100))
                              : formData.seasonalHike.hikeValue)
                          : 0;

                        return (
                          <div className="p-4 bg-slate-900/80 rounded-2xl border border-purple-500/40 space-y-3 flex flex-col justify-between shadow-lg shadow-purple-500/5">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                                  <span>👑</span> Tier 3: Luxury 5★ Resort
                                </span>
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-black">
                                  Premium VIP
                                </span>
                              </div>
                              <input
                                type="text"
                                value={formData.hotelTiers.luxury.title}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    hotelTiers: {
                                      ...prev.hotelTiers,
                                      luxury: { ...prev.hotelTiers.luxury, title: e.target.value },
                                    },
                                  }))
                                }
                                placeholder="Tier Title (e.g. Luxury 5★ Resort)"
                                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-hidden focus:border-amber-500"
                              />
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-purple-300">Price Per Adult (₹) *</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={formData.hotelTiers.luxury.pricePerAdult}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      hotelTiers: {
                                        ...prev.hotelTiers,
                                        luxury: { ...prev.hotelTiers.luxury, pricePerAdult: Number(e.target.value) },
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-purple-400 font-black text-sm focus:outline-hidden focus:border-amber-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-slate-400">Hotel Stays Description</label>
                                <textarea
                                  rows={2}
                                  value={formData.hotelTiers.luxury.desc}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      hotelTiers: {
                                        ...prev.hotelTiers,
                                        luxury: { ...prev.hotelTiers.luxury, desc: e.target.value },
                                      },
                                    }))
                                  }
                                  placeholder="Mountain spa resorts & Swiss luxury chalets with heated pool access"
                                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-hidden focus:border-amber-500"
                                />
                              </div>
                            </div>

                            {/* Live Calculation Footer */}
                            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                              {disc > 0 && (
                                <div className="flex items-center justify-between text-slate-400">
                                  <span>Original: <span className="line-through">₹{t3Orig.toLocaleString("en-IN")}</span></span>
                                  <span className="text-emerald-400 font-bold">Save ₹{t3Sav.toLocaleString("en-IN")} ({disc}% OFF)</span>
                                </div>
                              )}
                              {formData.seasonalHike?.enabled && hike > 0 && (
                                <div className="flex items-center justify-between text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                                  <span>Peak Season Fare:</span>
                                  <span>₹{(t3Price + hike).toLocaleString("en-IN")} (+{formData.seasonalHike.hikeValue}{formData.seasonalHike.hikeType === "PERCENTAGE" ? "%" : "₹"})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* ── SECTION 2: 🏷️ DYNAMIC PROMOTIONAL DISCOUNT ENGINE (CLEAN & SIMPLE) ── */}
                  <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-amber-500/30 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔥</span>
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 block">
                            Promotional Deal &amp; Discount Engine
                          </span>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            Set Package Discount Percentage &amp; Promotional Offer Badge
                          </h4>
                        </div>
                      </div>
                      {formData.discountPercent > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black">
                          🔥 {formData.discountPercent}% OFF Applied to All Tiers
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                          <span>Package Discount Percentage (%)</span>
                          <span className="text-[10px] text-slate-400">Auto-applies strikethrough savings to 3 tiers</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={90}
                            value={formData.discountPercent}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                discountPercent: Number(e.target.value),
                              }))
                            }
                            className="w-28 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-black focus:outline-hidden focus:border-amber-500"
                          />
                          <span className="text-xs text-slate-400 font-medium">% Discount (0 for no discount)</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">
                          Promotional Offer Badge / Banner Text
                        </label>
                        <input
                          type="text"
                          value={formData.discountBadge}
                          onChange={(e) => setFormData({ ...formData, discountBadge: e.target.value })}
                          placeholder="e.g. Save 20% Today · Best Price Guarantee"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Live Deal Banner Visual Preview */}
                    <div className="p-3 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-red-600/20 rounded-xl border border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white uppercase text-[10px] font-black">
                          LIVE BANNER PREVIEW
                        </span>
                        <span className="text-white font-bold">
                          ⚡ Flash Deal: Save up to <span className="text-amber-300 font-black">{formData.discountPercent}% OFF</span> on Deluxe, Super Deluxe &amp; Luxury Stays!
                          {formData.discountBadge ? ` · ${formData.discountBadge}` : ""}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-400">
                        ✓ Visible prominently on Package Page &amp; Cards
                      </span>
                    </div>
                  </div>

                  {/* ── SECTION 3: 🏔️ MULTIPLE SEASONAL PEAK / SESSION TIMES DATE RANGES SURCHARGE ENGINE ── */}
                  <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-indigo-500/30 space-y-4 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏔️</span>
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 block">
                            Session Times &amp; Date Range Surcharges
                          </span>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            Peak Date Ranges &amp; Dynamic Session Pricing
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Configure multiple peak season date ranges. When clients choose travel dates inside any range, surge fares apply; normal prices apply during all off-dates.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newPeriod: SeasonalHikePeriod = {
                            id: `period_${Date.now()}`,
                            title: `Peak Session ${formData.seasonalHikes.length + 1}`,
                            startDate: "2026-05-15",
                            endDate: "2026-06-30",
                            hikeType: "PERCENTAGE",
                            hikeValue: 15,
                            validityNote: "High-demand season surcharge included in live quote",
                          };
                          setFormData((prev) => ({
                            ...prev,
                            seasonalHikes: [...prev.seasonalHikes, newPeriod],
                          }));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                      >
                        <span>+</span>
                        <span>Add Peak Date Range</span>
                      </button>
                    </div>

                    {formData.seasonalHikes.length === 0 ? (
                      <div className="p-6 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                        <span className="text-2xl block">🗓️</span>
                        <p className="text-xs font-bold text-slate-300">No Peak Season Date Ranges Configured</p>
                        <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                          Standard regular prices will apply for all travel dates throughout the year. You can add one or more peak date ranges (e.g. Summer Rush, Snow Season, Diwali) whenever needed.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const newPeriod: SeasonalHikePeriod = {
                              id: `period_${Date.now()}`,
                              title: "Peak Summer Rush (May - June)",
                              startDate: "2026-05-15",
                              endDate: "2026-06-30",
                              hikeType: "PERCENTAGE",
                              hikeValue: 15,
                              validityNote: "High-demand season surcharge included in live quote",
                            };
                            setFormData((prev) => ({
                              ...prev,
                              seasonalHikes: [newPeriod],
                            }));
                          }}
                          className="mt-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>+ Add First Peak Date Range</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.seasonalHikes.map((period, idx) => {
                          const t1Base = Number(formData.hotelTiers.standard.pricePerAdult) || 18999;
                          const t2Base = Number(formData.hotelTiers.deluxe.pricePerAdult) || 23999;
                          const t3Base = Number(formData.hotelTiers.luxury.pricePerAdult) || 31999;

                          const t1Hike = period.hikeType === "PERCENTAGE"
                            ? Math.round(t1Base * (period.hikeValue / 100))
                            : period.hikeValue;
                          const t2Hike = period.hikeType === "PERCENTAGE"
                            ? Math.round(t2Base * (period.hikeValue / 100))
                            : period.hikeValue;
                          const t3Hike = period.hikeType === "PERCENTAGE"
                            ? Math.round(t3Base * (period.hikeValue / 100))
                            : period.hikeValue;

                          return (
                            <div
                              key={period.id || idx}
                              className="p-4 bg-slate-900/90 rounded-2xl border border-indigo-500/40 space-y-3.5 shadow-md"
                            >
                              {/* Period Header */}
                              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-black text-xs flex items-center justify-center border border-indigo-500/30">
                                    #{idx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={period.title}
                                    onChange={(e) => {
                                      const updated = [...formData.seasonalHikes];
                                      updated[idx].title = e.target.value;
                                      setFormData({ ...formData, seasonalHikes: updated });
                                    }}
                                    placeholder="e.g. Summer Peak Rush / Christmas & New Year Snow"
                                    className="flex-1 max-w-sm px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-hidden focus:border-indigo-500"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = formData.seasonalHikes.filter((_, i) => i !== idx);
                                    setFormData({ ...formData, seasonalHikes: updated });
                                  }}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                                  title="Remove this peak date range"
                                >
                                  <span>🗑️</span>
                                  <span>Remove</span>
                                </button>
                              </div>

                              {/* Date Range & Surcharge Settings */}
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                                    <span>📅 Start Date (From)</span>
                                  </label>
                                  <input
                                    type="date"
                                    value={period.startDate}
                                    onChange={(e) => {
                                      const updated = [...formData.seasonalHikes];
                                      updated[idx].startDate = e.target.value;
                                      setFormData({ ...formData, seasonalHikes: updated });
                                    }}
                                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                                    <span>📅 End Date (To)</span>
                                  </label>
                                  <input
                                    type="date"
                                    value={period.endDate}
                                    onChange={(e) => {
                                      const updated = [...formData.seasonalHikes];
                                      updated[idx].endDate = e.target.value;
                                      setFormData({ ...formData, seasonalHikes: updated });
                                    }}
                                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-300">Surcharge Mode</label>
                                  <select
                                    value={period.hikeType}
                                    onChange={(e) => {
                                      const updated = [...formData.seasonalHikes];
                                      updated[idx].hikeType = e.target.value as any;
                                      setFormData({ ...formData, seasonalHikes: updated });
                                    }}
                                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                                  >
                                    <option value="PERCENTAGE">Percentage Hike (% Surcharge)</option>
                                    <option value="FIXED_AMOUNT">Fixed Surcharge (+₹ Per Adult)</option>
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-300">
                                    Hike Value {period.hikeType === "PERCENTAGE" ? "(%)" : "(₹)"}
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      value={period.hikeValue}
                                      onChange={(e) => {
                                        const updated = [...formData.seasonalHikes];
                                        updated[idx].hikeValue = Number(e.target.value);
                                        setFormData({ ...formData, seasonalHikes: updated });
                                      }}
                                      className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-indigo-400 font-black focus:outline-hidden focus:border-indigo-500"
                                    />
                                    <span className="text-[11px] text-slate-400 font-bold shrink-0">
                                      {period.hikeType === "PERCENTAGE" ? "%" : "₹"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Validity Note */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-slate-400">Client Notice Note (Optional)</label>
                                <input
                                  type="text"
                                  value={period.validityNote || ""}
                                  onChange={(e) => {
                                    const updated = [...formData.seasonalHikes];
                                    updated[idx].validityNote = e.target.value;
                                    setFormData({ ...formData, seasonalHikes: updated });
                                  }}
                                  placeholder="e.g. High-demand session rate applied for bookings between 15 May to 30 June"
                                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-hidden focus:border-indigo-500"
                                />
                              </div>

                              {/* Live 3-Tier Peak Fare Preview for this date range */}
                              <div className="p-3 bg-slate-950/90 rounded-xl border border-indigo-500/20 space-y-1.5">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                                  ⚡ Rates During This Date Range ({period.startDate || "Start"} ➔ {period.endDate || "End"}):
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-400 font-medium">Deluxe 3★:</span>
                                    <span className="text-amber-400 font-bold">
                                      <span className="text-slate-400 line-through mr-1 text-[11px]">₹{t1Base.toLocaleString("en-IN")}</span>
                                      ₹{(t1Base + t1Hike).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                                    <span className="text-amber-300 font-medium">Super Deluxe 4★:</span>
                                    <span className="text-amber-400 font-bold">
                                      <span className="text-slate-400 line-through mr-1 text-[11px]">₹{t2Base.toLocaleString("en-IN")}</span>
                                      ₹{(t2Base + t2Hike).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                                    <span className="text-purple-300 font-medium">Luxury 5★:</span>
                                    <span className="text-purple-400 font-bold">
                                      <span className="text-slate-400 line-through mr-1 text-[11px]">₹{t3Base.toLocaleString("en-IN")}</span>
                                      ₹{(t3Base + t3Hike).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Day-by-Day Itinerary Builder */}
              {activeTab === "itinerary" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Day-Wise Tour Itinerary</h3>
                      <p className="text-xs text-slate-400">Detailed daily plans with meals &amp; hotel accommodation details.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          itinerary: [
                            ...prev.itinerary,
                            {
                              day: prev.itinerary.length + 1,
                              title: `Day ${prev.itinerary.length + 1}`,
                              desc: "",
                              meals: "Breakfast & Dinner",
                              hotel: "Verified 4★ Resort",
                            },
                          ],
                        }))
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      + Add Day
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.itinerary.map((dayItem, idx) => (
                      <div key={idx} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                            Day {dayItem.day}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                itinerary: prev.itinerary.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 })),
                              }))
                            }
                            className="text-red-400 hover:text-red-300 text-xs font-bold cursor-pointer"
                          >
                            ✕ Remove Day
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={dayItem.title}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                itinerary: prev.itinerary.map((d, i) => (i === idx ? { ...d, title: e.target.value } : d)),
                              }))
                            }
                            placeholder="Day Title (e.g. Arrival in Shimla · Mall Road Walk)"
                            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={dayItem.meals}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  itinerary: prev.itinerary.map((d, i) => (i === idx ? { ...d, meals: e.target.value } : d)),
                                }))
                              }
                              placeholder="Meals (e.g. Breakfast & Dinner)"
                              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                            />
                            <input
                              type="text"
                              value={dayItem.hotel}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  itinerary: prev.itinerary.map((d, i) => (i === idx ? { ...d, hotel: e.target.value } : d)),
                                }))
                              }
                              placeholder="Hotel / Stay Details"
                              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                            />
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={dayItem.desc}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              itinerary: prev.itinerary.map((d, i) => (i === idx ? { ...d, desc: e.target.value } : d)),
                            }))
                          }
                          placeholder="Day description and sightseeing details..."
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Highlights, Inclusions & Exclusions */}
              {activeTab === "highlights" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Package Overview</label>
                    <textarea
                      rows={3}
                      value={formData.overview}
                      onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                      placeholder="Comprehensive overview of this tour package..."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 leading-relaxed"
                    />
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-400">Key Highlights</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        placeholder="Add key highlight (e.g. Rohtang Pass Snow Excursion)"
                        className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newHighlight.trim()) return;
                          setFormData((prev) => ({ ...prev, highlights: [...prev.highlights, newHighlight.trim()] }));
                          setNewHighlight("");
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                      >
                        + Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.highlights.map((h, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs text-slate-300 flex items-center gap-2">
                          <span>★ {h}</span>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, highlights: prev.highlights.filter((_, idx) => idx !== i) }))}
                            className="text-red-400 font-bold"
                          >✕</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Inclusions & Exclusions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl space-y-3">
                      <span className="text-xs font-bold text-emerald-400 block">✓ What&apos;s Included</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newInclusion}
                          onChange={(e) => setNewInclusion(e.target.value)}
                          placeholder="Add inclusion..."
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newInclusion.trim()) return;
                            setFormData((prev) => ({ ...prev, inclusions: [...prev.inclusions, newInclusion.trim()] }));
                            setNewInclusion("");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                        >+</button>
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {formData.inclusions.map((inc, i) => (
                          <div key={i} className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg">
                            <span>✓ {inc}</span>
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, inclusions: prev.inclusions.filter((_, idx) => idx !== i) }))}
                              className="text-red-400 font-bold"
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl space-y-3">
                      <span className="text-xs font-bold text-red-400 block">✕ What&apos;s Excluded</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newExclusion}
                          onChange={(e) => setNewExclusion(e.target.value)}
                          placeholder="Add exclusion..."
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newExclusion.trim()) return;
                            setFormData((prev) => ({ ...prev, exclusions: [...prev.exclusions, newExclusion.trim()] }));
                            setNewExclusion("");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-500 text-white font-bold text-xs"
                        >+</button>
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {formData.exclusions.map((exc, i) => (
                          <div key={i} className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg">
                            <span>✕ {exc}</span>
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, exclusions: prev.exclusions.filter((_, idx) => idx !== i) }))}
                              className="text-red-400 font-bold"
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FAQs & Schema */}
              {activeTab === "faqs" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Package FAQs (Google Schema Ready)</h3>
                      <p className="text-xs text-slate-400">Answers appear in accordion on package page and in FAQPage structured data.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">+ Add FAQ</span>
                    <input
                      type="text"
                      value={newFaq.q}
                      onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
                      placeholder="Question..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                    />
                    <textarea
                      rows={2}
                      value={newFaq.a}
                      onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
                      placeholder="Answer..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newFaq.q.trim() || !newFaq.a.trim()) return;
                        setFormData((prev) => ({ ...prev, faqs: [...prev.faqs, newFaq] }));
                        setNewFaq({ q: "", a: "" });
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      + Add FAQ
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.faqs.map((faq, i) => (
                      <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-amber-400">Q. {faq.q}</h4>
                          <p className="text-xs text-slate-300">{faq.a}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, faqs: prev.faqs.filter((_, idx) => idx !== i) }))}
                          className="text-red-400 font-bold text-xs"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: SEO & AI Studio */}
              {activeTab === "seo" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Google Search Preview</span>
                    <div className="p-4 bg-white rounded-xl shadow text-left space-y-1 text-slate-900">
                      <div className="text-[11px] text-slate-600 font-sans truncate">
                        https://www.bemytraveller.com › packages › {formData.slug || "package-slug"}
                      </div>
                      <h4 className="text-blue-700 font-semibold text-base hover:underline line-clamp-1">
                        {formData.seo?.metaTitle || `${formData.name || "Tour Package"} | Be My Traveller`}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {formData.seo?.metaDescription || formData.overview || "Book custom tour packages with verified stays and private cabs."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <label className="font-bold text-slate-300">Custom SEO Meta Title</label>
                        <span className="text-[10px] text-slate-500 font-mono">{(formData.seo?.metaTitle || "").length} / 60 chars</span>
                      </div>
                      <input
                        type="text"
                        value={formData.seo?.metaTitle || ""}
                        onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })}
                        placeholder="e.g. 6 Nights 7 Days Himachal & Manali Tour Package | Be My Traveller"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <label className="font-bold text-slate-300">Meta Description</label>
                        <span className="text-[10px] text-slate-500 font-mono">{(formData.seo?.metaDescription || "").length} / 160 chars</span>
                      </div>
                      <textarea
                        rows={3}
                        value={formData.seo?.metaDescription || ""}
                        onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })}
                        placeholder="Compelling search summary with hotel tiers, starting rates, and inclusions..."
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Focus Keywords</label>
                      <input
                        type="text"
                        value={formData.seo?.keywords || ""}
                        onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, keywords: e.target.value } })}
                        placeholder="e.g. himachal tour packages, manali holiday package, rohtang pass trip"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: Media & Gallery */}
              {activeTab === "media" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Cover Image */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Hero / Cover Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        placeholder="Cover image URL..."
                        className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMediaTarget("cover");
                          fileInputRef.current?.click();
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                      >
                        {uploadingImage ? "Uploading..." : "☁️ Upload"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaTarget("cover");
                          setMediaPickerOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                      >
                        🖼️ Gallery
                      </button>
                    </div>
                    {formData.coverImage && (
                      <div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-800 mt-2">
                        <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Photo Gallery Strip */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-200 block">Multi-Image Photo Gallery</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        placeholder="Add gallery image URL..."
                        className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newGalleryUrl.trim()) return;
                          setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, newGalleryUrl.trim()] }));
                          setNewGalleryUrl("");
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                      >
                        + Add Image
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaTarget("gallery");
                          setMediaPickerOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                      >
                        🖼️ Pick
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-1">
                      {formData.gallery.map((img, i) => (
                        <div key={i} className="relative group h-24 rounded-xl overflow-hidden border border-slate-800">
                          <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, gallery: prev.gallery.filter((_, idx) => idx !== i) }))}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Error Banner */}
              {formError && (
                <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* Modal Bottom Actions */}
              <div className="pt-5 border-t border-slate-800 flex items-center justify-between bg-slate-900">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    formData.status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                  }`}>
                    {formData.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
                  >
                    {submitting ? "Saving Package..." : editingPkg ? "Update Tour Package" : "Create Tour Package"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Save Successfully Modal ── */}
      {saveSuccess && saveSuccess.isOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-emerald-500/10 text-center space-y-5 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              ✓
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Package {saveSuccess.action === "created" ? "Created" : "Updated"} Successfully
              </span>
              <h3 className="text-xl font-black text-white pt-1">
                {saveSuccess.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                All changes, hotel categories, day-wise itineraries, and live price calculators are now updated and live on the website.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href={`/packages/${saveSuccess.slug}`}
                target="_blank"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
              >
                <span>View Live Package</span>
                <span>↗</span>
              </Link>
              <button
                type="button"
                onClick={() => setSaveSuccess(null)}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Done &amp; Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <MediaPickerModal
          isOpen={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(item: MediaItem) => {
            if (mediaTarget === "cover") {
              setFormData((prev) => ({ ...prev, coverImage: item.url }));
            } else if (mediaTarget === "gallery") {
              setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, item.url] }));
            }
            setMediaPickerOpen(false);
          }}
          defaultFolderType="packages"
          defaultSlug={formData.slug}
        />
      )}

      {/* Discrete RRDS Signature Watermark */}
      <footer className="pt-8 pb-4 text-center text-slate-600 text-[10px] flex items-center justify-center gap-2 select-none" data-rrds-engine="v2.5" data-watermark="RRDS">
        <span>Be My Traveller Tour Package Engine</span>
        <span>•</span>
        <span className="text-slate-500 font-mono">RRDS Core Engine</span>
        <span>•</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}
