"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

export interface PackageItem {
  slug: string;
  title: string;
  route: string;
  nights: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviews: number;
  img: string;
  inclusions?: string[];
  badge?: string;
  destinationNames?: string[];
}

interface DestinationPackageGridProps {
  destinationName: string;
  packages: PackageItem[];
}

export default function DestinationPackageGrid({
  destinationName,
  packages,
}: DestinationPackageGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<string>("ALL");
  const [selectedBudget, setSelectedBudget] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("FEATURED");

  // Helper to extract raw numeric price
  const parsePrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    const num = priceStr.replace(/[^0-9]/g, "");
    return parseInt(num, 10) || 0;
  };

  // Helper to extract number of nights
  const parseNights = (nightsStr: string): number => {
    if (!nightsStr) return 0;
    const match = nightsStr.match(/(\d+)\s*N/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Filter & Sort Logic
  const filteredPackages = useMemo(() => {
    let result = [...packages];

    // 1. Search Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.route.toLowerCase().includes(q) ||
          p.inclusions?.some((inc) => inc.toLowerCase().includes(q)) ||
          p.destinationNames?.some((d) => d.toLowerCase().includes(q))
      );
    }

    // 2. Duration Filter
    if (selectedDuration !== "ALL") {
      result = result.filter((p) => {
        const nights = parseNights(p.nights);
        if (selectedDuration === "SHORT") return nights < 5;
        if (selectedDuration === "MEDIUM") return nights >= 5 && nights <= 7;
        if (selectedDuration === "LONG") return nights > 7;
        return true;
      });
    }

    // 3. Budget Filter
    if (selectedBudget !== "ALL") {
      result = result.filter((p) => {
        const price = parsePrice(p.price);
        if (selectedBudget === "BUDGET") return price < 20000;
        if (selectedBudget === "MID") return price >= 20000 && price <= 35000;
        if (selectedBudget === "LUXURY") return price > 35000;
        return true;
      });
    }

    // 4. Sort
    if (sortBy === "PRICE_ASC") {
      result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortBy === "PRICE_DESC") {
      result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else if (sortBy === "DURATION_ASC") {
      result.sort((a, b) => parseNights(a.nights) - parseNights(b.nights));
    } else if (sortBy === "DURATION_DESC") {
      result.sort((a, b) => parseNights(b.nights) - parseNights(a.nights));
    } else if (sortBy === "RATING") {
      result.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    }

    return result;
  }, [packages, searchTerm, selectedDuration, selectedBudget, sortBy]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDuration("ALL");
    setSelectedBudget("ALL");
    setSortBy("FEATURED");
  };

  return (
    <section className="space-y-4">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-extrabold text-amber-600 tracking-wider">
              Handcrafted Holiday Deals
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
              100% Customizable
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Best {destinationName} Tour Packages
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Verified 4★/5★ stays, private cabs, daily breakfast &amp; dinner, and 24/7 on-trip concierge
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80">
            {filteredPackages.length} {filteredPackages.length === 1 ? "Package" : "Packages"} Available
          </span>
        </div>
      </div>

      {/* ── Smart Single-Line Compact Search & Filter Bar ── */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          {/* 1. Search Box (Flexible) */}
          <div className="relative min-w-[190px] sm:min-w-[240px] flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by place, tour, route..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-[10px] w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* 2. Duration Dropdown */}
          <div className="shrink-0">
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              aria-label="Filter by duration"
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 font-bold text-slate-700 cursor-pointer"
            >
              <option value="ALL">⏱️ Duration: All</option>
              <option value="SHORT">&lt; 5 Days</option>
              <option value="MEDIUM">5 - 7 Days</option>
              <option value="LONG">8+ Days</option>
            </select>
          </div>

          {/* 3. Budget Dropdown */}
          <div className="shrink-0">
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              aria-label="Filter by budget"
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 font-bold text-slate-700 cursor-pointer"
            >
              <option value="ALL">💰 Budget: All</option>
              <option value="BUDGET">Under ₹20K</option>
              <option value="MID">₹20K - ₹35K</option>
              <option value="LUXURY">₹35K+</option>
            </select>
          </div>

          {/* 4. Sort Dropdown */}
          <div className="shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort packages by"
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 font-bold text-slate-700 cursor-pointer"
            >
              <option value="FEATURED">⭐ Sort: Featured</option>
              <option value="PRICE_ASC">💰 Price: Low to High</option>
              <option value="PRICE_DESC">💎 Price: High to Low</option>
              <option value="DURATION_ASC">⏱️ Duration: Short First</option>
              <option value="DURATION_DESC">⏳ Duration: Long First</option>
              <option value="RATING">⭐ Top Rated</option>
            </select>
          </div>

          {/* 5. Clear Filters Button */}
          {(searchTerm || selectedDuration !== "ALL" || selectedBudget !== "ALL" || sortBy !== "FEATURED") && (
            <button
              onClick={resetFilters}
              className="shrink-0 py-1.5 px-2.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <span>✕</span> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── 2 Cards Per Row (2 Columns Grid) Layout ── */}
      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {filteredPackages.map((pkg) => {
            // Compute discount percentage
            const rawPrice = parsePrice(pkg.price);
            const rawOrig = parsePrice(pkg.originalPrice);
            const discountPercent =
              rawOrig > rawPrice
                ? Math.round(((rawOrig - rawPrice) / rawOrig) * 100)
                : 20;

            return (
              <div
                key={pkg.slug}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-500/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* ── Card Top: Image & Overlay Badges ── */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={pkg.img}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Left: Duration Badge */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/85 text-amber-400 text-[10.5px] font-black uppercase tracking-wide backdrop-blur-xs border border-amber-400/20 shadow-xs">
                    ⏱️ {pkg.nights}
                  </span>

                  {/* Top Right: Rating Pill */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-white/95 text-slate-900 text-[11px] font-extrabold flex items-center gap-1 backdrop-blur-xs shadow-xs">
                    <span className="text-amber-500">⭐</span>
                    <span>{pkg.rating || 4.9}</span>
                    <span className="text-[9.5px] text-slate-500 font-medium">({pkg.reviews || 120})</span>
                  </div>

                  {/* Bottom Left: Route pin banner over image */}
                  <div className="absolute bottom-2 left-2.5 right-2.5">
                    <p className="text-[11.5px] text-white font-bold truncate flex items-center gap-1 drop-shadow-md">
                      <span className="text-amber-400 shrink-0">📍</span>
                      <span className="truncate">{pkg.route}</span>
                    </p>
                  </div>
                </div>

                {/* ── Card Middle: Title & Inclusions ── */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-[15px] leading-snug text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 min-h-[42px]">
                      {pkg.title}
                    </h3>

                    {/* Key Inclusions Pills */}
                    {pkg.inclusions && pkg.inclusions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2.5">
                        {pkg.inclusions.slice(0, 3).map((inc, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-slate-100 text-slate-700 flex items-center gap-1"
                          >
                            <span className="text-emerald-600 font-bold text-[10px]">✓</span>
                            <span className="truncate max-w-[130px]">{inc}</span>
                          </span>
                        ))}
                        {pkg.inclusions.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            +{pkg.inclusions.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Card Bottom: Pricing & CTA Buttons ── */}
                  <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 line-through">
                          {pkg.originalPrice}
                        </span>
                        <span className="text-[9.5px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {discountPercent}% OFF
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-black text-slate-900 tracking-tight">
                          {pkg.price}
                        </span>
                        <span className="text-[10.5px] text-slate-500 font-medium">
                          / person
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* WhatsApp Quick Enquire */}
                      <a
                        href={`https://wa.me/918091638090?text=${encodeURIComponent(
                          `Hi Be My Traveller, I am interested in booking: "${pkg.title}" (${pkg.nights}) priced at ${pkg.price}. Please share customized quote!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 flex items-center justify-center transition-all cursor-pointer"
                        title="Instant WhatsApp Query"
                      >
                        <span className="text-sm">💬</span>
                      </a>

                      {/* Main View Details CTA */}
                      <Link
                        href={`/packages/${pkg.slug}`}
                        className="px-3.5 py-2 rounded-xl bg-[#0b1b36] hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 group-hover:bg-amber-500 group-hover:text-slate-950"
                      >
                        <span>View Details</span>
                        <span className="text-xs font-extrabold group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="text-base font-bold text-slate-800">
            No packages match your search or filters
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords, budget, or duration filters to view all handcrafted {destinationName} packages.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </section>
  );
}
