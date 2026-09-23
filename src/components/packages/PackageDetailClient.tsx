"use client";

import React, { useState } from "react";
import Link from "next/link";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";

export interface SeasonalHikePeriod {
  id?: string;
  title: string;
  startDate: string;
  endDate: string;
  hikeType: "PERCENTAGE" | "FIXED_AMOUNT";
  hikeValue: number;
  validityNote?: string;
}

export interface PackageData {
  slug: string;
  title: string;
  destination: string;
  route?: string;
  nights: number;
  days: number;
  rating: number;
  reviews: number;
  tag: string;
  basePriceAdult: number;
  originalPrice: number;
  discountPercent?: number;
  discountBadge?: string;
  seasonalHike?: {
    enabled: boolean;
    seasonType: string;
    hikeType: "PERCENTAGE" | "FIXED_AMOUNT";
    hikeValue: number;
    seasonLabel: string;
    validityNote?: string;
  };
  seasonalHikes?: SeasonalHikePeriod[];
  countries?: string[];
  states?: string[];
  cities?: string[];
  heroImg: string;
  gallery: string[];
  overview: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: { day: number; title: string; desc: string; meals: string; hotel: string }[];
  hotelTiers: {
    standard: { title: string; pricePerAdult: number; desc: string };
    deluxe: { title: string; pricePerAdult: number; desc: string };
    luxury: { title: string; pricePerAdult: number; desc: string };
  };
  faq: { q: string; a: string }[];
}

export default function PackageDetailClient({ pkg }: { pkg: PackageData }) {
  const [openDay, setOpenDay] = useState<number>(1);
  const [hotelTier, setHotelTier] = useState<"standard" | "deluxe" | "luxury">("deluxe");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [travelDate, setTravelDate] = useState("2026-11-15");
  const [showModal, setShowModal] = useState(false);
  const [enquiryDone, setEnquiryDone] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeGallery, setActiveGallery] = useState(0);

  // Dynamic Hotel Tier and Price Calculations
  const activeTierData = pkg.hotelTiers[hotelTier] || pkg.hotelTiers.deluxe || {
    title: "Super Deluxe 4★",
    pricePerAdult: pkg.basePriceAdult,
    desc: "4★ Valley & river view premium rooms with private balcony",
  };

  // Check if selected travelDate falls within any configured peak season date range
  const activePeakHike = (pkg.seasonalHikes || []).find((hike) => {
    if (!hike.startDate || !hike.endDate) return false;
    return travelDate >= hike.startDate && travelDate <= hike.endDate;
  });

  const baseTierPrice = activeTierData.pricePerAdult || pkg.basePriceAdult;

  // Calculate seasonal surcharge if matched; otherwise normal off-peak price applies
  let seasonalSurcharge = 0;
  if (activePeakHike && activePeakHike.hikeValue > 0) {
    if (activePeakHike.hikeType === "PERCENTAGE") {
      seasonalSurcharge = Math.round(baseTierPrice * (activePeakHike.hikeValue / 100));
    } else {
      seasonalSurcharge = activePeakHike.hikeValue;
    }
  }

  const unitPrice = baseTierPrice + seasonalSurcharge;
  const activeDiscountPercent = pkg.discountPercent && pkg.discountPercent > 0 ? pkg.discountPercent : 20;

  // Compute dynamic strikethrough original price from discount percent
  const tierOriginalPrice = Math.round(unitPrice / (1 - activeDiscountPercent / 100));
  const savingsPerAdult = Math.max(0, tierOriginalPrice - unitPrice);

  const childPrice = Math.round(unitPrice * 0.5);
  const childOriginalPrice = Math.round(tierOriginalPrice * 0.5);

  const subtotal = unitPrice * adults + childPrice * children;
  const originalSubtotal = tierOriginalPrice * adults + childOriginalPrice * children;
  const totalSavings = Math.max(0, originalSubtotal - subtotal);

  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          packageSlug: pkg.slug,
          packageName: pkg.title,
          travelDate,
          adults,
          children,
          hotelCategory: hotelTier,
          hotelCategoryTitle: activeTierData.title,
          unitPricePerAdult: unitPrice,
          totalQuotedPrice: total,
          savingsApplied: totalSavings,
          discountPercent: activeDiscountPercent,
          source: "PACKAGE_PAGE",
        }),
      });
    } catch {
      /* graceful */
    }
    setEnquiryDone(true);
  };

  const galleryImages = pkg.gallery && pkg.gallery.length > 0 ? pkg.gallery : [pkg.heroImg];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans" data-watermark="RRDS">
      {/* ── BMT Comprehensive Multi-Tier Navigation ── */}
      <BmtNavMenu variant="solid" />

      {/* Breadcrumb Trail */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span className="text-slate-300">›</span>
          <Link href="/destination/india-tour-packages" className="hover:text-amber-600 transition-colors">India Tours</Link>
          {pkg.states && pkg.states.length > 0 && (
            <>
              <span className="text-slate-300">›</span>
              <Link href={`/destination/${pkg.states[0]}-tour-packages`} className="hover:text-amber-600 capitalize transition-colors">
                {pkg.states[0]}
              </Link>
            </>
          )}
          <span className="text-slate-300">›</span>
          <span className="text-slate-700 font-semibold line-clamp-1 max-w-[320px]">{pkg.title}</span>
        </div>
      </div>

      {/* ── CATCHY TOP PROMOTIONAL FLASH BANNER ── */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-600 text-white py-2 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white uppercase text-[10px] font-black tracking-wider animate-pulse">
              ⚡ Flash Deal
            </span>
            <span>
              Save up to <span className="underline decoration-yellow-300 decoration-2 font-black text-yellow-200">{activeDiscountPercent}% OFF</span> on {activeTierData.title} Packages!
              {pkg.discountBadge ? ` · ${pkg.discountBadge}` : " · Instant Booking Voucher Included"}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-amber-100">
            <span>🎁 Zero Cost EMI Available</span>
            <span>•</span>
            <span>🔒 Free Date Change</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ── HEADER ── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500 text-white shadow-xs">
              {pkg.tag || "Best Seller"}
            </span>
            {activeDiscountPercent > 0 && (
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-xs flex items-center gap-1">
                <span>🔥</span>
                <span>{activeDiscountPercent}% OFF</span>
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              🕒 {pkg.nights} Nights / {pkg.days} Days
            </span>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-amber-500 font-black">★ {pkg.rating || 4.9}</span>
              <span className="text-slate-500">({pkg.reviews || 184} verified reviews)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
            {pkg.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 font-medium">
            <span>📍 {pkg.route || pkg.destination}</span>
            {pkg.cities && pkg.cities.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {pkg.cities.map((city, idx) => (
                  <span key={idx} className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200 capitalize">
                    📍 {city}
                  </span>
                ))}
              </div>
            )}
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span>✓</span> Zero Hidden Charges
            </span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span>✓</span> 100% Tailor-Made
            </span>
          </div>
        </div>

        {/* ── MAIN 2-COLUMN GRID: Gallery & Details LEFT | Sticky Booking Card RIGHT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8 items-start">
          {/* Left Column: Gallery, Hotel Selector, Itinerary, Inclusions, FAQs */}
          <div className="space-y-6">
            {/* Gallery Block */}
            <div className="space-y-2.5">
              {/* Main Image */}
              <div className="relative h-[300px] sm:h-[440px] rounded-2xl overflow-hidden bg-slate-100 shadow-md">
                {/* Gallery Main Image */}
                <img
                  src={galleryImages[activeGallery] || pkg.heroImg}
                  alt={pkg.title}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2">
                  {activeDiscountPercent > 0 && (
                    <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-red-400/40 animate-pulse">
                      <span>🔥</span>
                      <span>{activeDiscountPercent}% OFF</span>
                    </span>
                  )}
                  {savingsPerAdult > 0 && (
                    <span className="bg-slate-900/90 text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1 border border-amber-500/30">
                      <span>💰 Save ₹{Number(savingsPerAdult).toLocaleString("en-IN")}/adult</span>
                    </span>
                  )}
                </div>
                {/* Gallery Navigation Arrows */}
                {galleryImages.length > 1 && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-3">
                    <button
                      onClick={() => setActiveGallery((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                      className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xs text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer text-base"
                    >
                      ‹
                    </button>
                    <div className="flex gap-1.5">
                      {galleryImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveGallery(i)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            activeGallery === i ? "w-6 bg-amber-400" : "w-1.5 bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveGallery((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                      className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xs text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer text-base"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveGallery(i)}
                      className={`h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeGallery === i ? "border-amber-500 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Key Highlights Chips */}
            {pkg.highlights && pkg.highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pkg.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-slate-800 bg-amber-50/70 rounded-xl px-3.5 py-3 border border-amber-200/70 shadow-2xs"
                  >
                    <span className="text-amber-500 font-bold mt-0.5 shrink-0 text-sm">★</span>
                    <span className="font-semibold leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── 🌟 HOTEL CATEGORY SELECTOR & PRICE MODIFIER (DELUXE / SUPER DELUXE / LUXURY) ── */}
            <section className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 block">
                    Tailor Your Stays
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    Select Your Hotel Category &amp; Comfort Level
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pricing, inclusions, and accommodation dynamically update across your itinerary and quotation.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                  Active: {activeTierData.title}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {(["standard", "deluxe", "luxury"] as const).map((tier) => {
                  const t = pkg.hotelTiers[tier];
                  const isSelected = hotelTier === tier;
                  const baseRate = t.pricePerAdult || pkg.basePriceAdult;
                  let tierSurcharge = 0;
                  if (activePeakHike && activePeakHike.hikeValue > 0) {
                    tierSurcharge = activePeakHike.hikeType === "PERCENTAGE"
                      ? Math.round(baseRate * (activePeakHike.hikeValue / 100))
                      : activePeakHike.hikeValue;
                  }
                  const tierRate = baseRate + tierSurcharge;
                  const tierOrig = Math.round(tierRate / (1 - activeDiscountPercent / 100));
                  const tierSav = Math.max(0, tierOrig - tierRate);

                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setHotelTier(tier)}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group overflow-hidden ${
                        isSelected
                          ? "border-amber-500 bg-white shadow-md ring-2 ring-amber-500/20"
                          : "border-slate-200 bg-white/70 hover:border-amber-300 hover:bg-white"
                      }`}
                    >
                      {tier === "deluxe" && (
                        <span className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-bl-lg tracking-wider">
                          Recommended
                        </span>
                      )}
                      {tier === "luxury" && (
                        <span className="absolute top-0 right-0 bg-purple-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-bl-lg tracking-wider">
                          VIP Luxury
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-sm text-slate-900">{t.title}</span>
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-amber-500 border-amber-500 text-white"
                                : "border-slate-300 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-amber-600 font-black text-lg">
                            ₹{Number(tierRate).toLocaleString("en-IN")}
                            <span className="text-[10px] font-normal text-slate-500"> / adult</span>
                          </p>
                          <span className="text-[10.5px] text-slate-400 line-through">
                            ₹{Number(tierOrig).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="text-[9.5px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Save ₹{Number(tierSav).toLocaleString("en-IN")} ({activeDiscountPercent}% OFF)
                          </span>
                          {activePeakHike && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300/50">
                              ⚡ Peak Session (+{activePeakHike.hikeType === "PERCENTAGE" ? `${activePeakHike.hikeValue}%` : `₹${activePeakHike.hikeValue}`})
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed border-t border-slate-100 pt-2">
                        {t.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── Package Overview ── */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-amber-500 inline-block shrink-0"></span>
                Package Overview
              </h2>
              <p className="text-slate-700 leading-relaxed text-sm">{pkg.overview}</p>
            </section>

            {/* ── Detailed Tour Itinerary (Day-Wise Plan) ── */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-600">Day-Wise Plan</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">Detailed Tour Itinerary</h2>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  {pkg.itinerary.length} Days Planned
                </span>
              </div>

              <div className="space-y-2.5">
                {pkg.itinerary.map((dayItem) => {
                  const isOpen = openDay === dayItem.day;
                  return (
                    <div
                      key={dayItem.day}
                      className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                        isOpen ? "border-amber-300 bg-white shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenDay(isOpen ? 0 : dayItem.day)}
                        className={`w-full px-5 py-4 flex items-center gap-4 text-left transition-colors cursor-pointer ${
                          isOpen ? "bg-amber-50/50" : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                            isOpen ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          D{dayItem.day}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm leading-snug truncate ${isOpen ? "text-amber-900" : "text-slate-800"}`}>
                            {dayItem.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>🍽️ {dayItem.meals}</span>
                            <span>•</span>
                            <span className="truncate">🏨 {dayItem.hotel}</span>
                          </p>
                        </div>
                        <svg
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-amber-500" : "text-slate-400"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="px-5 py-4 border-t border-amber-100/60 bg-white space-y-3 text-sm animate-in fade-in duration-150">
                          <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{dayItem.desc}</p>
                          <div className="flex flex-wrap gap-2.5 pt-1">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                              🍽️ Meals: {dayItem.meals}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                              🏨 Stay ({activeTierData.title}): {dayItem.hotel}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── Inclusions & Exclusions ── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5 space-y-3 shadow-2xs">
                <h3 className="font-black text-sm text-emerald-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                    ✓
                  </span>
                  What&apos;s Included in This Package
                </h3>
                <ul className="space-y-2">
                  {pkg.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-emerald-950 font-medium">
                      <span className="text-emerald-600 font-bold mt-0.5 shrink-0">✓</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-red-50/70 border border-red-200 p-5 space-y-3 shadow-2xs">
                <h3 className="font-black text-sm text-red-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black">
                    ✕
                  </span>
                  What&apos;s Excluded
                </h3>
                <ul className="space-y-2">
                  {pkg.exclusions.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-red-950 font-medium">
                      <span className="text-red-500 font-bold mt-0.5 shrink-0">✕</span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ── Frequently Asked Questions (FAQs) ── */}
            {pkg.faq && pkg.faq.length > 0 && (
              <section className="space-y-3 pt-4">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-600">Got Questions?</span>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-2">
                  {pkg.faq.map((f, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : i)}
                          className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex justify-between items-center gap-3 cursor-pointer hover:bg-slate-50"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-amber-500 font-black">Q.</span>
                            <span>{f.q}</span>
                          </span>
                          <span className="text-slate-400 font-black">{isOpen ? "−" : "+"}</span>
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                            {f.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sticky Booking & Live Price Calculator */}
          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-3xl border-2 border-amber-500/80 shadow-2xl p-6 space-y-5">
              {/* Pricing Header */}
              <div className="space-y-1 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    {activeTierData.title}
                  </span>
                  {tierOriginalPrice > unitPrice && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 line-through">
                        ₹{Number(tierOriginalPrice).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[9.5px] font-black uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                        {activeDiscountPercent}% OFF
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{Number(unitPrice).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ adult</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold">
                  Includes private cab, {activeTierData.title} stays, daily meals &amp; sightseeing
                </p>
              </div>

              {/* Passenger & Date Controls */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Departure / Travel Date</label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                  />
                  {activePeakHike ? (
                    <div className="mt-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 text-[11px] font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>⚡</span>
                        <span>Peak Session: <strong>{activePeakHike.title}</strong></span>
                      </span>
                      <span className="text-amber-800 bg-amber-200/70 px-1.5 py-0.5 rounded text-[10px]">
                        +{activePeakHike.hikeType === "PERCENTAGE" ? `${activePeakHike.hikeValue}%` : `₹${activePeakHike.hikeValue}`} / adult
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 text-[10.5px] text-slate-500 flex items-center gap-1 font-medium">
                      <span className="text-emerald-600 font-bold">✓ Standard Off-Peak Rates</span>
                      <span>· No Seasonal Surcharge</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Adults (12+ yrs)</label>
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                        className="w-8 py-1.5 bg-slate-100 text-slate-700 font-black hover:bg-slate-200 cursor-pointer"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center font-black text-slate-900">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults((prev) => prev + 1)}
                        className="w-8 py-1.5 bg-slate-100 text-slate-700 font-black hover:bg-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Children (5-11 yrs)</label>
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                        className="w-8 py-1.5 bg-slate-100 text-slate-700 font-black hover:bg-slate-200 cursor-pointer"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center font-black text-slate-900">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren((prev) => prev + 1)}
                        className="w-8 py-1.5 bg-slate-100 text-slate-700 font-black hover:bg-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Cost Breakdown with Instant Savings Banner */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-[11px]">
                  {totalSavings > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-2 flex items-center justify-between text-emerald-800 font-bold">
                      <span className="flex items-center gap-1">
                        <span>🎉</span>
                        <span>Instant Savings Applied</span>
                      </span>
                      <span>-₹{Number(totalSavings).toLocaleString("en-IN")} ({activeDiscountPercent}% OFF)</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 line-through">
                    <span>Standard Total Value</span>
                    <span>₹{Number(originalSubtotal).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>{adults} Adults × ₹{Number(unitPrice).toLocaleString("en-IN")}</span>
                    <span className="font-semibold">₹{Number(unitPrice * adults).toLocaleString("en-IN")}</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between text-slate-700 font-medium">
                      <span>{children} Child × ₹{Number(childPrice).toLocaleString("en-IN")}</span>
                      <span className="font-semibold">₹{Number(childPrice * children).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>GST (5%)</span>
                    <span className="font-semibold">₹{Number(gst).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-sm pt-1.5 border-t border-slate-200">
                    <div>
                      <span>Total Quoted Cost</span>
                      {totalSavings > 0 && (
                        <span className="block text-[10px] text-emerald-600 font-bold">You save ₹{Number(totalSavings).toLocaleString("en-IN")}</span>
                      )}
                    </div>
                    <span className="text-amber-600 font-black text-base">₹{Number(total).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>⚡ Get Instant Custom Quote</span>
                  <span>→</span>
                </button>

                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(
                    `Hi Be My Traveller! I'm interested in booking the "${pkg.title}" with ${activeTierData.title} accommodation for ${adults} Adults on ${travelDate}. Estimated total: ₹${total.toLocaleString(
                      "en-IN"
                    )}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <span>💬 Chat with Himalayan Expert</span>
                </a>
              </div>

              {/* Trust badges */}
              <div className="pt-2 text-center text-[11px] text-slate-500 space-y-1">
                <p>🔒 Zero booking fees · 100% money-safe guarantee</p>
                <p>📞 24/7 Helpline: <a href="tel:18002279779" className="font-bold text-slate-700 hover:underline">1800 22 7979</a></p>
              </div>
            </div>

            {/* Why Book With Be My Traveller Card */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 text-xs shadow-md">
              <h4 className="font-black text-sm text-amber-400">Why Book with Be My Traveller?</h4>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>100% Customized itineraries &amp; sanitized private cabs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Handpicked verified {activeTierData.title} mountain stays</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Dedicated 24/7 on-trip concierge manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Guaranteed best rates with zero hidden charges</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Instant Custom Quote Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>

            {enquiryDone ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-xl font-black text-slate-900">Custom Quote Requested!</h3>
                <p className="text-xs text-slate-600">
                  Our Destination Specialist will connect with you via phone/WhatsApp within 15 minutes with your customized itinerary and locked rates.
                </p>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEnquiryDone(false);
                  }}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold mt-2 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">Bespoke Quote</span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    Plan Your {pkg.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {adults} Adults · {children} Children · {activeTierData.title} · Est. ₹{total.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">WhatsApp / Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Confirm &amp; Request Callback
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Global Footer with Discrete RRDS Signature ── */}
      <footer className="bg-[#0b1b36] text-white pt-12 pb-8 border-t border-slate-800 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Be My Traveller</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's premier experiential holiday company crafting bespoke vacations across Himachal, Kashmir, Kerala, Rajasthan, and 50+ global destinations.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Top Indian Holidays</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li><Link href="/destination/india/himachal/manali-tour-packages" className="hover:text-amber-400">Manali Tour Packages</Link></li>
              <li><Link href="/destination/india/himachal-tour-packages" className="hover:text-amber-400">Himachal Pradesh Tours</Link></li>
              <li><Link href="/destination/india/kashmir-tour-packages" className="hover:text-amber-400">Kashmir Holiday Packages</Link></li>
              <li><Link href="/destination/india/kerala-tour-packages" className="hover:text-amber-400">Kerala Backwaters Tours</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Hotel Categories</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li><span className="text-slate-300">Standard 3★ Boutique Stays</span></li>
              <li><span className="text-amber-400">Super Deluxe 4★ Valley View Stays</span></li>
              <li><span className="text-purple-400">Luxury 5★ Mountain Spa Chalets</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-3">24/7 Helpline</h4>
            <p className="text-amber-400 font-extrabold text-base mb-1">1800 22 7979</p>
            <p className="text-slate-400 text-xs">support@bemytraveller.com</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px] flex items-center justify-center gap-2 flex-wrap" data-watermark="RRDS">
          <span>© 2026 Be My Traveller. All Rights Reserved.</span>
          <span>•</span>
          <span className="text-slate-400">Crafted with precision by RRDS</span>
        </div>
      </footer>
    </div>
  );
}
