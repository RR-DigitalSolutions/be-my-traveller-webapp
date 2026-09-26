"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import { normalizeThemeValue } from "@/lib/site-themes";

interface ThemeOption {
  name: string;
  label: string;
}

const mergeThemeOptions = (base: ThemeOption[], incoming: ThemeOption[]) => {
  const seen = new Set<string>();

  return [...base, ...incoming].filter((theme) => {
    const key = String(theme.name || "").trim().toUpperCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export default function PackagesCatalogPage() {
  const [selectedTheme, setSelectedTheme] = useState("ALL");
  const [selectedDuration, setSelectedDuration] = useState("ALL");
  const [themeOptions, setThemeOptions] = useState<ThemeOption[]>([
    { name: "ALL", label: "All Themes" },
    { name: "HONEYMOON", label: "Honeymoon & Romance" },
    { name: "ADVENTURE", label: "Adventure & Trekking" },
    { name: "HERITAGE", label: "Heritage & Culture" },
    { name: "LUXURY", label: "Luxury Escapes" },
  ]);

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

  const allPackages = [
    {
      slug: "6-nights-himachal-manali-tour",
      title: "6 Nights 7 Days Majestic Himachal & Rohtang Pass Tour",
      destination: "Himachal Pradesh (Shimla 2N · Manali 3N · Chandigarh 1N)",
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
    },
    {
      slug: "5-nights-kashmir-gulmarg-tour",
      title: "5 Nights 6 Days Heavenly Kashmir with Gulmarg Gondola",
      destination: "Kashmir (Srinagar 2N · Gulmarg 1N · Pahalgam 2N)",
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
    },
    {
      slug: "5-nights-kerala-backwaters-luxury",
      title: "5 Nights 6 Days Kerala Romance & Backwaters Luxury",
      destination: "Kerala (Munnar 2N · Thekkady 1N · Alleppey 1N · Cochin 1N)",
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
    },
    {
      slug: "5-nights-royal-rajasthan-heritage",
      title: "5 Nights 6 Days Royal Forts & Palaces of Rajasthan",
      destination: "Rajasthan (Jaipur 2N · Jodhpur 1N · Udaipur 2N)",
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
    },
    {
      slug: "4-nights-bali-tropical-villa",
      title: "4 Nights 5 Days Bali Tropical Pool Villas & Nusa Penida",
      destination: "Bali (Ubud 2N · Seminyak Private Pool Villa 2N)",
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
    },
    {
      slug: "4-nights-dubai-shopping-desert-safari",
      title: "4 Nights 5 Days Dubai Extravaganza with Desert Safari",
      destination: "Dubai (Burj Khalifa · Marina Cruise · Desert Camp)",
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
    },
  ];

  const filtered = allPackages.filter((p) => {
    const packageThemes = Array.isArray(p.theme) ? p.theme : [p.theme].filter(Boolean);
    const selectedValue = normalizeThemeValue(selectedTheme);
    const matchesTheme =
      selectedValue === "ALL" ||
      packageThemes.some((theme) => normalizeThemeValue(theme) === selectedValue);

    if (!matchesTheme) return false;
    if (selectedDuration === "SHORT" && p.nights > 4) return false;
    if (selectedDuration === "MEDIUM" && (p.nights < 5 || p.nights > 7)) return false;
    if (selectedDuration === "LONG" && p.nights < 8) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* ── BMT Top Navigation ── */}
      <BmtNavMenu />

      <section className="bg-slate-900 text-white -mt-[96px] pt-[124px] pb-12 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
            <Link href="/" className="hover:underline">Home</Link>
            <span>›</span>
            <span>Tour Packages</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Holiday Tour Packages</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Confirmed handpicked itineraries with hotel choices, private cabs, daily breakfast, and guaranteed departure pacing.
          </p>
        </div>
      </section>

      {/* Filters Bar */}
      <div className="border-b border-slate-200 bg-slate-50 py-3.5 px-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="text-slate-500 mr-1">Theme:</span>
            {themeOptions.map((theme) => (
              <button
                key={theme.name}
                onClick={() => setSelectedTheme(theme.name)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedTheme === theme.name
                    ? "bg-[#0b1b36] text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-500">Duration:</span>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none"
            >
              <option value="ALL">Any Duration</option>
              <option value="SHORT">Up to 4 Nights</option>
              <option value="MEDIUM">5 to 7 Nights</option>
              <option value="LONG">8+ Nights</option>
            </select>
          </div>
        </div>
      </div>

      {/* Package List */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Showing {filtered.length} Curated Packages
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pkg) => (
            <div
              key={pkg.slug}
              className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={pkg.img}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-slate-950 shadow-sm">
                    {pkg.theme}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white shadow-sm">
                    {pkg.discount}
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between bg-slate-950/80 backdrop-blur-md rounded-lg px-2.5 py-1 text-white text-xs">
                  <span>🕒 {pkg.nights} Nights / {pkg.days} Days</span>
                  <span className="text-amber-400 font-bold">★ {pkg.rating} ({pkg.reviews})</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                    {pkg.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{pkg.destination}</p>

                  <div className="mt-4 space-y-1.5">
                    {pkg.inclusions.map((inc) => (
                      <div key={inc} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="text-emerald-500 font-bold">✓</span> {inc}
                      </div>
                    ))}
                  </div>
                </div>

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
                      className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                    >
                      Itinerary
                    </Link>
                    <Link
                      href={`/customize?package=${pkg.slug}`}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
                    >
                      Customize
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
