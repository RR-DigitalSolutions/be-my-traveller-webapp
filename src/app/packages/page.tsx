"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";
import { normalizeThemeValue } from "@/lib/site-themes";

interface ThemeOption {
  name: string;
  label: string;
}

interface IPackageItem {
  slug: string;
  title: string;
  destination: string;
  region: string;
  nights: number;
  days: number;
  theme: string;
  originalPrice: string;
  price: string;
  discount: string;
  rating: number;
  reviews: number;
  inclusions: string[];
  img: string;
  tags?: string[];
}

const ALL_PACKAGES: IPackageItem[] = [
  {
    slug: "6-nights-himachal-manali-tour",
    title: "6 Nights 7 Days Majestic Himachal & Rohtang Pass Tour",
    destination: "Himachal Pradesh (Shimla 2N · Manali 3N · Chandigarh 1N)",
    region: "Himachal",
    nights: 6,
    days: 7,
    theme: "ADVENTURE",
    originalPrice: "₹38,000",
    price: "₹29,999",
    discount: "21% OFF",
    rating: 4.9,
    reviews: 184,
    inclusions: ["4★ Hotel Stay", "Private AC Sedan", "Daily Breakfast & Dinner", "Solang ATV & Snow Sightseeing"],
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
    tags: ["Himachal Pradesh", "Manali", "Shimla", "Rohtang", "Snow", "Manali Snow Tour"],
  },
  {
    slug: "4-nights-manali-snow-adventure",
    title: "4 Nights 5 Days Manali Snow Special & Solang Valley Adventure",
    destination: "Manali (Old Manali 2N · Solang Valley 2N · Atal Tunnel)",
    region: "Himachal",
    nights: 4,
    days: 5,
    theme: "ADVENTURE",
    originalPrice: "₹26,000",
    price: "₹19,500",
    discount: "25% OFF",
    rating: 4.8,
    reviews: 142,
    inclusions: ["Mountain View Resort", "Private Cab", "Solang Snow Activities", "Jogini Waterfall Trek"],
    img: "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=800&auto=format&fit=crop&q=80",
    tags: ["Manali", "Himachal Pradesh", "Solang", "Manali Snow Tour", "Snow"],
  },
  {
    slug: "5-nights-kashmir-gulmarg-tour",
    title: "5 Nights 6 Days Heavenly Kashmir with Gulmarg Gondola",
    destination: "Kashmir (Srinagar 2N · Gulmarg 1N · Pahalgam 2N)",
    region: "Kashmir",
    nights: 5,
    days: 6,
    theme: "HONEYMOON",
    originalPrice: "₹42,000",
    price: "₹33,500",
    discount: "20% OFF",
    rating: 4.9,
    reviews: 210,
    inclusions: ["Dal Lake Houseboat", "Gulmarg Gondola Ride", "Pahalgam Valley Tour", "Shikara Ride"],
    img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
    tags: ["Kashmir", "Srinagar", "Gulmarg", "Pahalgam", "Kashmir Houseboat", "Houseboat"],
  },
  {
    slug: "4-nights-kashmir-houseboat-special",
    title: "4 Nights 5 Days Kashmir Houseboat Romance & Mughal Gardens",
    destination: "Kashmir (Srinagar Houseboat 2N · Nigeen Lake 1N · Doodhpathri 1N)",
    region: "Kashmir",
    nights: 4,
    days: 5,
    theme: "HONEYMOON",
    originalPrice: "₹32,000",
    price: "₹24,999",
    discount: "22% OFF",
    rating: 4.9,
    reviews: 168,
    inclusions: ["Luxury Cedar Houseboat", "Private Shikara Rides", "Mughal Gardens Tour", "Traditional Wazwan Dinner"],
    img: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80",
    tags: ["Kashmir", "Srinagar", "Kashmir Houseboat", "Houseboat", "Dal Lake"],
  },
  {
    slug: "5-nights-kerala-backwaters-luxury",
    title: "5 Nights 6 Days Kerala Romance & Backwaters Luxury",
    destination: "Kerala (Munnar 2N · Thekkady 1N · Alleppey 1N · Cochin 1N)",
    region: "Kerala",
    nights: 5,
    days: 6,
    theme: "HONEYMOON",
    originalPrice: "₹36,000",
    price: "₹27,999",
    discount: "22% OFF",
    rating: 4.8,
    reviews: 156,
    inclusions: ["Private Houseboat Chef", "Tea Estate Resort", "Kathakali Show", "Periyar Boat Safari"],
    img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80",
    tags: ["Kerala", "Kerala Backwaters", "Munnar", "Alleppey", "Houseboat"],
  },
  {
    slug: "4-nights-kerala-munnar-alleppey",
    title: "4 Nights 5 Days Classic Munnar Hills & Alleppey Cruise",
    destination: "Kerala (Munnar Tea Hills 3N · Alleppey Backwaters 1N)",
    region: "Kerala",
    nights: 4,
    days: 5,
    theme: "FAMILY",
    originalPrice: "₹28,000",
    price: "₹21,500",
    discount: "23% OFF",
    rating: 4.8,
    reviews: 119,
    inclusions: ["Eco Tea Plantation Stay", "Exclusive Backwater Boat", "Spice Garden Tour", "Breakfast & Dinner"],
    img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&auto=format&fit=crop&q=80",
    tags: ["Kerala", "Kerala Backwaters", "Munnar", "Alleppey"],
  },
  {
    slug: "5-nights-royal-rajasthan-heritage",
    title: "5 Nights 6 Days Royal Forts & Palaces of Rajasthan",
    destination: "Rajasthan (Jaipur 2N · Jodhpur 1N · Udaipur 2N)",
    region: "Rajasthan",
    nights: 5,
    days: 6,
    theme: "HERITAGE",
    originalPrice: "₹35,000",
    price: "₹26,500",
    discount: "24% OFF",
    rating: 4.8,
    reviews: 132,
    inclusions: ["Heritage Haveli Stay", "Lake Pichola Sunset Boat", "Desert Camel Safari", "Chokhi Dhani Dinner"],
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
    tags: ["Rajasthan", "Royal Rajasthan", "Jaipur", "Udaipur", "Jodhpur", "Heritage"],
  },
  {
    slug: "6-nights-rajasthan-jaisalmer-desert",
    title: "6 Nights 7 Days Golden Sands & Royal Desert Haveli Tour",
    destination: "Rajasthan (Jaipur 2N · Jodhpur 1N · Jaisalmer Sand Dunes 2N · Bikaner 1N)",
    region: "Rajasthan",
    nights: 6,
    days: 7,
    theme: "HERITAGE",
    originalPrice: "₹42,000",
    price: "₹32,999",
    discount: "21% OFF",
    rating: 4.9,
    reviews: 98,
    inclusions: ["Luxury Swiss Tent with Campfire", "Jeep Dune Bashing", "Folk Dance & Dinner", "Amer Fort Elephant/Jeep Ride"],
    img: "https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=800&auto=format&fit=crop&q=80",
    tags: ["Rajasthan", "Royal Rajasthan", "Jaisalmer", "Desert", "Jaipur"],
  },
  {
    slug: "4-nights-goa-beach-watersports",
    title: "4 Nights 5 Days Vibrant Goa Beach Fiesta & Scuba Adventure",
    destination: "Goa (North Goa Beach Hotel 2N · South Goa Resort 2N)",
    region: "Goa",
    nights: 4,
    days: 5,
    theme: "ADVENTURE",
    originalPrice: "₹22,000",
    price: "₹16,999",
    discount: "23% OFF",
    rating: 4.7,
    reviews: 215,
    inclusions: ["Beachfront Resort", "Grande Island Scuba Diving", "5 Watersports Combo", "Mandovi Sunset Cruise"],
    img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
    tags: ["Goa", "Goa Beach", "Beach", "Scuba", "North Goa"],
  },
  {
    slug: "5-nights-andaman-islands-havelock",
    title: "5 Nights 6 Days Andaman Paradise & Radhanagar Beach Escape",
    destination: "Andaman (Port Blair 2N · Havelock Island 2N · Neil Island 1N)",
    region: "Andaman",
    nights: 5,
    days: 6,
    theme: "HONEYMOON",
    originalPrice: "₹45,000",
    price: "₹34,500",
    discount: "23% OFF",
    rating: 4.9,
    reviews: 140,
    inclusions: ["Makruzz AC Catamaran Cruise", "Snorkeling at Elephant Beach", "Radhanagar Sunset", "Cellular Jail Light & Sound"],
    img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop&q=80",
    tags: ["Andaman", "Andaman Islands", "Havelock", "Neil Island", "Beach"],
  },
  {
    slug: "5-nights-uttarakhand-nainital-mussoorie",
    title: "5 Nights 6 Days Queen of Hills & Corbett Jungle Safari",
    destination: "Uttarakhand (Nainital 2N · Corbett Tiger Reserve 1N · Mussoorie 2N)",
    region: "Uttarakhand",
    nights: 5,
    days: 6,
    theme: "FAMILY",
    originalPrice: "₹34,000",
    price: "₹25,999",
    discount: "23% OFF",
    rating: 4.8,
    reviews: 112,
    inclusions: ["4★ Hill Resorts", "4x4 Open Jeep Corbett Safari", "Naini Lake Boating", "Kempty Falls Sightseeing"],
    img: "https://images.unsplash.com/photo-1626714485542-a27902d26d0b?w=800&auto=format&fit=crop&q=80",
    tags: ["Uttarakhand", "Nainital", "Mussoorie", "Corbett", "Jim Corbett"],
  },
  {
    slug: "7-nights-ladakh-nubra-pangong",
    title: "7 Nights 8 Days Majestic Ladakh & High Passes Expedition",
    destination: "Ladakh (Leh 3N · Nubra Valley 2N · Pangong Lake 1N · Sham Valley 1N)",
    region: "Ladakh",
    nights: 7,
    days: 8,
    theme: "ADVENTURE",
    originalPrice: "₹52,000",
    price: "₹39,999",
    discount: "23% OFF",
    rating: 4.9,
    reviews: 175,
    inclusions: ["Khardung La Pass Drive", "Pangong Lake Luxury Camp", "Double Hump Camel Safari", "Inner Line Permits Included"],
    img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&auto=format&fit=crop&q=80",
    tags: ["Ladakh", "Leh", "Pangong", "Nubra", "Adventure"],
  },
  {
    slug: "4-nights-bali-tropical-villa",
    title: "4 Nights 5 Days Bali Tropical Pool Villas & Nusa Penida",
    destination: "Bali (Ubud 2N · Seminyak Private Pool Villa 2N)",
    region: "International",
    nights: 4,
    days: 5,
    theme: "HONEYMOON",
    originalPrice: "₹49,000",
    price: "₹38,500",
    discount: "21% OFF",
    rating: 4.9,
    reviews: 165,
    inclusions: ["Private Pool Villa", "Nusa Penida Speedboat", "Ubud Swings Tour", "Sunset Beach Club"],
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80",
    tags: ["Bali", "Indonesia", "International", "Honeymoon", "Pool Villa"],
  },
  {
    slug: "4-nights-dubai-shopping-desert-safari",
    title: "4 Nights 5 Days Dubai Extravaganza with Desert Safari",
    destination: "Dubai (Burj Khalifa · Marina Cruise · Desert Camp)",
    region: "International",
    nights: 4,
    days: 5,
    theme: "LUXURY",
    originalPrice: "₹58,000",
    price: "₹46,999",
    discount: "19% OFF",
    rating: 4.9,
    reviews: 240,
    inclusions: ["Burj Khalifa 124th Floor", "Desert Safari with BBQ", "Marina Dhow Cruise", "UAE Tourist Visa"],
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
    tags: ["Dubai", "UAE", "International", "Luxury", "Burj Khalifa"],
  },
];

const mergeThemeOptions = (base: ThemeOption[], incoming: ThemeOption[]) => {
  const seen = new Set<string>();
  return [...base, ...incoming].filter((theme) => {
    const key = String(theme.name || "").trim().toUpperCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

function PackagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialDestination = searchParams.get("destination") || "";
  const initialFrom = searchParams.get("from") || "";
  const initialMonth = searchParams.get("month") || "";
  const initialDuration = searchParams.get("duration") || "ALL";
  const initialTheme = searchParams.get("theme") || "ALL";

  const [searchDestination, setSearchDestination] = useState(initialDestination);
  const [selectedDuration, setSelectedDuration] = useState(initialDuration);
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [themeOptions, setThemeOptions] = useState<ThemeOption[]>([
    { name: "ALL", label: "All Themes" },
    { name: "HONEYMOON", label: "Honeymoon & Romance" },
    { name: "ADVENTURE", label: "Adventure & Trekking" },
    { name: "HERITAGE", label: "Heritage & Culture" },
    { name: "LUXURY", label: "Luxury Escapes" },
    { name: "FAMILY", label: "Family Vacations" },
  ]);

  // Lead Enquiry Modal State
  const [selectedPackageForEnquiry, setSelectedPackageForEnquiry] = useState<IPackageItem | null>(null);
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  useEffect(() => {
    setSearchDestination(initialDestination);
  }, [initialDestination]);

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch("/api/v1/themes");
        if (!response.ok) return;
        const data = await response.json();
        const apiThemes = Array.isArray(data.themes) ? data.themes : [];
        const nextThemes = apiThemes.map((theme: any) => ({
          name: String(theme.name || theme.slug || "").trim().toUpperCase(),
          label: String(theme.label || theme.name || theme.slug || "").trim(),
        }));
        setThemeOptions(mergeThemeOptions([{ name: "ALL", label: "All Themes" }], nextThemes));
      } catch (error) {
        console.warn("Unable to load admin themes for packages page.", error);
      }
    };
    loadThemes();
  }, []);

  const handleClearFilters = () => {
    setSearchDestination("");
    setSelectedDuration("ALL");
    setSelectedTheme("ALL");
    router.push("/packages");
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryName.trim() || !enquiryPhone.trim()) {
      alert("Please provide your name and phone number.");
      return;
    }
    try {
      setEnquirySubmitting(true);
      await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enquiryName,
          phone: enquiryPhone,
          email: enquiryEmail || undefined,
          leadType: "HOLIDAY_PACKAGE",
          source: "PACKAGE_ENQUIRY",
          specialRequirements: `Inquiry for package: "${selectedPackageForEnquiry?.title || searchDestination}" (${selectedPackageForEnquiry?.nights || 5} Nights, Month: ${initialMonth || "Flexible"})`,
        }),
      });
      setEnquirySuccess(true);
      setTimeout(() => {
        setSelectedPackageForEnquiry(null);
        setEnquirySuccess(false);
        setEnquiryName("");
        setEnquiryPhone("");
        setEnquiryEmail("");
      }, 2500);
    } catch {
      alert("Thank you! Our travel specialist will call you shortly.");
      setSelectedPackageForEnquiry(null);
    } finally {
      setEnquirySubmitting(false);
    }
  };

  // Filter packages based on active filters
  const filteredPackages = useMemo(() => {
    return ALL_PACKAGES.filter((p) => {
      // 1. Destination / Keyword Search
      if (searchDestination.trim()) {
        const query = searchDestination.toLowerCase().trim();
        const matchesQuery =
          p.title.toLowerCase().includes(query) ||
          p.destination.toLowerCase().includes(query) ||
          p.region.toLowerCase().includes(query) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(query))) ||
          p.inclusions.some((inc) => inc.toLowerCase().includes(query));

        if (!matchesQuery) return false;
      }

      // 2. Theme Filter
      if (selectedTheme !== "ALL") {
        const packageThemes = Array.isArray(p.theme) ? p.theme : [p.theme].filter(Boolean);
        const selectedValue = normalizeThemeValue(selectedTheme);
        const matchesTheme = packageThemes.some((t) => normalizeThemeValue(t) === selectedValue);
        if (!matchesTheme) return false;
      }

      // 3. Duration Filter
      if (selectedDuration === "SHORT" && p.nights > 4) return false;
      if (selectedDuration === "MEDIUM" && (p.nights < 5 || p.nights > 7)) return false;
      if (selectedDuration === "LONG" && p.nights < 8) return false;
      if (selectedDuration === "2 - 3 Nights" && p.nights > 3) return false;
      if (selectedDuration === "4 - 5 Nights" && (p.nights < 4 || p.nights > 5)) return false;
      if (selectedDuration === "5 - 7 Nights" && (p.nights < 5 || p.nights > 7)) return false;
      if (selectedDuration === "7 - 10 Nights" && (p.nights < 7 || p.nights > 10)) return false;

      return true;
    });
  }, [searchDestination, selectedTheme, selectedDuration]);

  const hasActiveFilters = Boolean(
    searchDestination || initialFrom || initialMonth || (selectedDuration !== "ALL" && selectedDuration !== initialDuration) || selectedTheme !== "ALL"
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── BMT Top Navigation ── */}
      <BmtNavMenu />

      {/* ── Search Hero / Title Banner ── */}
      <section className="bg-gradient-to-b from-slate-900 via-[#0b1b36] to-slate-900 text-white -mt-[96px] pt-[124px] pb-10 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
            <Link href="/" className="hover:underline">Home</Link>
            <span>›</span>
            <span>Holiday Packages</span>
            {searchDestination && (
              <>
                <span>›</span>
                <span className="text-white font-black">{searchDestination}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {searchDestination ? `${searchDestination} Tour Packages` : "Handpicked Holiday Packages"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Confirmed itineraries with verified 4★ & 5★ stays, private cabs, daily breakfast, and guaranteed departure pacing.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                ★ 100% Customizable
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                ✓ 24/7 On-Trip Concierge
              </span>
            </div>
          </div>

          {/* ── Active Search Filters Pill Bar ── */}
          {hasActiveFilters && (
            <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold">Active Search:</span>
              {searchDestination && (
                <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-sm">
                  <span>📍 {searchDestination}</span>
                  <button onClick={() => setSearchDestination("")} className="hover:opacity-75 font-black text-xs cursor-pointer">✕</button>
                </span>
              )}
              {initialFrom && (
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-semibold">
                  🛫 From: {initialFrom}
                </span>
              )}
              {initialMonth && (
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-semibold">
                  📅 Month: {initialMonth}
                </span>
              )}
              {selectedDuration !== "ALL" && (
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-semibold">
                  ⏱️ {selectedDuration}
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-amber-400 hover:text-amber-300 underline font-bold ml-2 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Sticky Live Search & Theme Filter Bar ── */}
      <div className="border-b border-slate-200 bg-white py-3.5 px-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              placeholder="Search destination, city, or package..."
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-white"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            {searchDestination && (
              <button
                onClick={() => setSearchDestination("")}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Theme Filters Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {themeOptions.map((theme) => (
              <button
                key={theme.name}
                onClick={() => setSelectedTheme(theme.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedTheme === theme.name
                    ? "bg-[#0b1b36] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>

          {/* Duration Selector */}
          <div className="flex items-center gap-2 text-xs font-bold shrink-0">
            <span className="text-slate-500 hidden sm:inline">Duration:</span>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">Any Duration</option>
              <option value="SHORT">Up to 4 Nights</option>
              <option value="MEDIUM">5 to 7 Nights</option>
              <option value="LONG">8+ Nights</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Package List & Results ── */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Showing {filteredPackages.length} Confirmed Packages {searchDestination ? `for "${searchDestination}"` : ""}
          </p>
          {initialFrom && (
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              All packages include private cabs starting from {initialFrom}
            </span>
          )}
        </div>

        {/* ── Packages Grid ── */}
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.slug}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                {/* Photo & Badges */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <img
                    src={pkg.img}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-slate-950 shadow-md">
                      {pkg.theme}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white shadow-md">
                      {pkg.discount}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/85 backdrop-blur-md rounded-xl px-3 py-1.5 text-white text-xs">
                    <span className="font-bold">🕒 {pkg.nights} Nights / {pkg.days} Days</span>
                    <span className="text-amber-400 font-black">★ {pkg.rating} ({pkg.reviews})</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h2 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                      {pkg.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{pkg.destination}</p>

                    <div className="mt-4 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {pkg.inclusions.map((inc) => (
                        <div key={inc} className="flex items-center gap-2 text-xs text-slate-700">
                          <span className="text-emerald-500 font-bold">✓</span> {inc}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 line-through block">{pkg.originalPrice}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-900">{pkg.price}</span>
                        <span className="text-[11px] text-slate-500">/ person</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/packages/${pkg.slug}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                      >
                        Itinerary
                      </Link>
                      <button
                        onClick={() => setSelectedPackageForEnquiry(pkg)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        Enquire
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Search Fallback with Custom Itinerary CTA */
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <span className="text-4xl block">🧭</span>
            <h3 className="text-xl font-black text-slate-900">
              No standard package found for &quot;{searchDestination}&quot;
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              We specialize in custom itineraries! Our travel designers can build a 100% personalized tour for <strong>{searchDestination}</strong> with verified hotels and private cabs in less than 30 minutes.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                View All Packages
              </button>
              <Link
                href={`/customize?destination=${encodeURIComponent(searchDestination)}`}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
              >
                Request Custom Itinerary →
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* ── Package Lead Enquiry Modal ── */}
      {selectedPackageForEnquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedPackageForEnquiry(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            {enquirySuccess ? (
              <div className="py-8 text-center space-y-3">
                <span className="text-4xl block">🎉</span>
                <h3 className="text-xl font-black text-slate-900">Enquiry Received!</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thank you! Our travel specialist will call or WhatsApp you within 15 minutes with verified pricing and itinerary customization for <strong>{selectedPackageForEnquiry.title}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-600">Quick Holiday Enquiry</span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5 line-clamp-1">
                    {selectedPackageForEnquiry.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedPackageForEnquiry.nights} Nights · Starting from {selectedPackageForEnquiry.price}/person
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={enquiryName}
                      onChange={(e) => setEnquiryName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp / Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={enquiryEmail}
                      onChange={(e) => setEnquiryEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={enquirySubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  {enquirySubmitting ? "Submitting..." : "Get Instant Quote & Customization"}
                </button>

                <p className="text-[10px] text-center text-slate-400">
                  🔒 100% Privacy Guaranteed. Zero spam. Real-time quote on WhatsApp.
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Universal Site Footer ── */}
      <SiteFooter />
    </div>
  );
}

export default function PackagesCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
            <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            Loading Holiday Tour Packages...
          </div>
        </div>
      }
    >
      <PackagesContent />
    </Suspense>
  );
}
