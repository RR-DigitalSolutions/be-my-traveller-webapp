"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import ThemePackagesSection from "@/components/home/ThemePackagesSection";
import SpecialOffersCarousel from "@/components/home/SpecialOffersCarousel";
import BestPackagesCarousel from "@/components/home/BestPackagesCarousel";
import ReviewsCarousel from "@/components/home/ReviewsCarousel";
import WhyBookSection from "@/components/home/WhyBookSection";
import SiteFooter from "@/components/common/SiteFooter";

export default function HomePage() {
  const router = useRouter();

  const [activeSearchTab, setActiveSearchTab] = useState<
    "holidays" | "custom" | "cabs" | "hotels" | "activities" | "visa"
  >("holidays");

  const [destinationTab, setDestinationTab] = useState<
    "domestic" | "international" | "honeymoon" | "adventure"
  >("domestic");

  // Form search states
  const [fromCity, setFromCity] = useState("New Delhi");
  const [toDestination, setToDestination] = useState("Himachal Pradesh");
  const [travelMonth, setTravelMonth] = useState("October 2026");
  const [duration, setDuration] = useState("5 - 7 Nights");
  const [guests, setGuests] = useState("2 Adults, 1 Room");

  // Cab & Transportation States
  const [cabTripType, setCabTripType] = useState<"ONE_WAY" | "ROUND_TRIP" | "MULTICITY">("ONE_WAY");
  const [cabPickupCity, setCabPickupCity] = useState("New Delhi / NCR");
  const [cabDropCity, setCabDropCity] = useState("Manali / Himachal");
  const [cabVehicleType, setCabVehicleType] = useState("Sedan (Dzire / Etios · 4 Seater)");
  const [cabPickupDate, setCabPickupDate] = useState("2026-10-15");
  const [cabReturnDate, setCabReturnDate] = useState("2026-10-20");
  const [cabPickupTime, setCabPickupTime] = useState("06:00 AM");
  const [cabPassengers, setCabPassengers] = useState(2);
  const [isCabModalOpen, setIsCabModalOpen] = useState(false);
  const [cabName, setCabName] = useState("");
  const [cabPhone, setCabPhone] = useState("");
  const [cabEmail, setCabEmail] = useState("");
  const [cabSpecialReq, setCabSpecialReq] = useState("");
  const [cabSubmitting, setCabSubmitting] = useState(false);
  const [cabSuccess, setCabSuccess] = useState(false);

  // Enquiry modal state
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryPackage, setEnquiryPackage] = useState("");
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const handleSearchPackages = (overrideDestination?: string) => {
    const dest = overrideDestination || toDestination;
    const params = new URLSearchParams();
    if (dest) params.set("destination", dest.trim());
    if (fromCity) params.set("from", fromCity.trim());
    if (travelMonth) params.set("month", travelMonth.trim());
    if (duration) params.set("duration", duration.trim());
    router.push(`/packages?${params.toString()}`);
  };

  const handleCabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cabName.trim() || !cabPhone.trim()) {
      alert("Please enter your name and contact phone number.");
      return;
    }
    try {
      setCabSubmitting(true);
      const tripSummary = `Cab Booking (${cabTripType.replace("_", " ")}): Pickup from "${cabPickupCity}" to "${cabDropCity}" in ${cabVehicleType} on ${cabPickupDate}${cabTripType !== "ONE_WAY" ? ` returning ${cabReturnDate}` : ""} at ${cabPickupTime} for ${cabPassengers} pax. ${cabSpecialReq ? `Notes: ${cabSpecialReq}` : ""}`;

      await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cabName,
          phone: cabPhone,
          email: cabEmail || undefined,
          leadType: "TRANSPORTATION",
          source: "CAB_RENTAL",
          tripDetails: {
            tripType: cabTripType,
            pickupCity: cabPickupCity,
            dropCity: cabDropCity,
            vehicleType: cabVehicleType,
            pickupDate: cabPickupDate,
            returnDate: cabTripType !== "ONE_WAY" ? cabReturnDate : undefined,
            pickupTime: cabPickupTime,
            passengers: cabPassengers,
          },
          specialRequirements: tripSummary,
        }),
      });

      setCabSuccess(true);
      setTimeout(() => {
        setIsCabModalOpen(false);
        setCabSuccess(false);
        setCabName("");
        setCabPhone("");
        setCabEmail("");
        setCabSpecialReq("");
      }, 3000);
    } catch {
      alert("Enquiry received! Our cab desk will call you shortly.");
      setIsCabModalOpen(false);
    } finally {
      setCabSubmitting(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enquiryName,
          email: enquiryEmail,
          phone: enquiryPhone,
          leadType: "HOLIDAY_PACKAGE",
          specialRequirements: `Interested in: ${enquiryPackage || toDestination}`,
          source: "HOMEPAGE_WIDGET",
        }),
      });
      setEnquirySuccess(true);
      setTimeout(() => {
        setIsEnquiryOpen(false);
        setEnquirySuccess(false);
        setEnquiryName("");
        setEnquiryPhone("");
        setEnquiryEmail("");
      }, 2500);
    } catch {
      alert("Thank you! Our travel specialist will call you shortly.");
      setIsEnquiryOpen(false);
    }
  };

  const domesticDestinations = [
    {
      name: "Himachal Pradesh",
      slug: "himachal-pradesh",
      tagline: "Manali, Shimla, Dharamshala, Spiti",
      packages: "24 Packages",
      price: "From ₹18,999",
      img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
      tag: "Top Selling",
    },
    {
      name: "Kashmir Paradise",
      slug: "kashmir",
      tagline: "Srinagar, Gulmarg, Pahalgam, Sonmarg",
      packages: "18 Packages",
      price: "From ₹24,500",
      img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
      tag: "Snow Specials",
    },
    {
      name: "Kerala Backwaters",
      slug: "kerala",
      tagline: "Munnar, Alleppey Houseboat, Thekkady",
      packages: "21 Packages",
      price: "From ₹21,999",
      img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80",
      tag: "Romantic",
    },
    {
      name: "Royal Rajasthan",
      slug: "rajasthan",
      tagline: "Jaipur, Udaipur, Jodhpur, Jaisalmer",
      packages: "16 Packages",
      price: "From ₹19,500",
      img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
      tag: "Heritage",
    },
    {
      name: "Andaman Islands",
      slug: "andaman",
      tagline: "Havelock, Neil Island, Port Blair",
      packages: "14 Packages",
      price: "From ₹28,999",
      img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop&q=80",
      tag: "Beach Holiday",
    },
    {
      name: "Goa Coastal Escapes",
      slug: "goa",
      tagline: "North Goa Beach Clubs, South Goa Stays",
      packages: "20 Packages",
      price: "From ₹12,999",
      img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
      tag: "Trending",
    },
  ];

  const internationalDestinations = [
    {
      name: "Dubai & Abu Dhabi",
      slug: "dubai",
      tagline: "Burj Khalifa, Desert Safari, Marina Dhow",
      packages: "15 Packages",
      price: "From ₹48,999",
      img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
      tag: "Visa Included",
    },
    {
      name: "Bali Tropical Villas",
      slug: "bali",
      tagline: "Ubud Jungles, Seminyak, Nusa Penida",
      packages: "19 Packages",
      price: "From ₹38,500",
      img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80",
      tag: "Private Pool Stays",
    },
    {
      name: "Thailand Holiday",
      slug: "thailand",
      tagline: "Phuket, Krabi, Bangkok, Pattaya",
      packages: "22 Packages",
      price: "From ₹29,999",
      img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&auto=format&fit=crop&q=80",
      tag: "Visa On Arrival",
    },
    {
      name: "Vietnam Wonders",
      slug: "vietnam",
      tagline: "Hanoi, Ha Long Bay Cruise, Da Nang",
      packages: "12 Packages",
      price: "From ₹44,999",
      img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80",
      tag: "Trending 2026",
    },
  ];

  const getCanonicalDestinationUrl = (
    slug: string,
    destinationType: "domestic" | "international" | "honeymoon" | "adventure"
  ) =>
    destinationType === "domestic" || destinationType === "honeymoon" || destinationType === "adventure"
      ? `/destination/india/${slug}-tour-packages`
      : `/destination/${slug}-tour-packages`;

  // Dynamic homepage destinations loaded from admin panel via API
  const [domesticList, setDomesticList] = useState(domesticDestinations);
  const [intlList, setIntlList] = useState(internationalDestinations);

  useEffect(() => {
    fetch("/api/v1/admin/homepage-content")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.content?.popularDestinations) {
          if (Array.isArray(data.content.popularDestinations.domestic) && data.content.popularDestinations.domestic.length > 0) {
            const active = data.content.popularDestinations.domestic.filter((d: any) => d.isActive !== false);
            if (active.length > 0) setDomesticList(active);
          }
          if (Array.isArray(data.content.popularDestinations.international) && data.content.popularDestinations.international.length > 0) {
            const active = data.content.popularDestinations.international.filter((d: any) => d.isActive !== false);
            if (active.length > 0) setIntlList(active);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* ── BMT Comprehensive Multi-Tier Navigation ── */}
      <BmtNavMenu />

      {/* ── Hero & Search Engine Widget (BMT Dynamic Booking Engine) ── */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white -mt-[96px] pt-[116px] pb-12 px-4">
        {/* Background photo with gradient overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80"
            alt="Scenic Mountains"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ★ India&apos;s Leading Custom Tour Platform
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Discover, Customize & Book <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                Your Dream Holiday
              </span>
            </h1>
            <p className="text-sm text-slate-300">
              Over 500+ handpicked itineraries, 4★ & 5★ verified stays, private cabs, and 24/7 on-trip concierge.
            </p>
          </div>

          {/* ── OTA Booking Search Card (Elevated White Box) ── */}
          {/* ── OTA Booking Search Card (Elevated White Box) ── */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-7 shadow-2xl border border-slate-100 text-slate-900">
            {/* Search Type Selector Tabs */}
            <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 pb-0 mb-3.5 sm:mb-5 overflow-x-auto scrollbar-none">
              {[
                { key: "holidays", icon: "🏖️", label: "Holiday Packages" },
                { key: "custom", icon: "🧭", label: "Build Custom Itinerary" },
                { key: "cabs", icon: "🚗", label: "Transportation & Cabs" },
                { key: "hotels", icon: "🏨", label: "Luxury Stays & Resorts" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSearchTab(tab.key as typeof activeSearchTab)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                    activeSearchTab === tab.key
                      ? "text-amber-600 border-amber-500 bg-amber-50/60 rounded-t-lg"
                      : "text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs sm:text-sm">{tab.icon}</span> <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ── TAB 1: Holiday Packages ── */}
            {activeSearchTab === "holidays" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">From City</label>
                    <input
                      type="text"
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 truncate"
                      placeholder="e.g. New Delhi"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">Starting From</span>
                  </div>

                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Destination</label>
                    <input
                      type="text"
                      value={toDestination}
                      onChange={(e) => setToDestination(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 truncate"
                      placeholder="e.g. Himachal"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">500+ destinations</span>
                  </div>

                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Travel Month</label>
                    <select
                      value={travelMonth}
                      onChange={(e) => setTravelMonth(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer truncate"
                    >
                      {["September 2026","October 2026","November 2026","December 2026","January 2027","February 2027","March 2027","April 2027","May 2027"].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">Peak & off-season</span>
                  </div>

                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer truncate"
                    >
                      {["2 - 3 Nights","4 - 5 Nights","5 - 7 Nights","7 - 10 Nights","10 - 14 Nights","14+ Nights"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">Flexible nights</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSearchPackages()}
                    className="col-span-2 lg:col-span-1 w-full py-3.5 sm:py-0 sm:min-h-[68px] rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wide flex flex-row lg:flex-col items-center justify-center gap-1.5 sm:gap-1 shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search Packages</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 overflow-x-auto scrollbar-none whitespace-nowrap">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold shrink-0">🔥 Trending:</span>
                  {["Manali Snow Tour","Kashmir Houseboat","Kerala Backwaters","Royal Rajasthan","Andaman Islands","Goa Beach"].map(item => (
                    <button key={item} onClick={() => { setToDestination(item); handleSearchPackages(item); }} className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 text-[10.5px] sm:text-[11px] font-medium transition-colors cursor-pointer shrink-0">{item}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 2: Build Custom Itinerary ── */}
            {activeSearchTab === "custom" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dream Destination</label>
                    <input
                      type="text"
                      value={toDestination}
                      onChange={(e) => setToDestination(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 truncate"
                      placeholder="e.g. Ladakh, Bali"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">Domestic or International</span>
                  </div>

                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Travel Style</label>
                    <select className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer truncate">
                      {["Adventure & Trekking","Romantic Honeymoon","Family Vacation","Spiritual Pilgrimage","Luxury & Wellness","Budget Backpacking","Group Tour","Solo Exploration"].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">We customize it for you</span>
                  </div>

                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Budget / Person</label>
                    <select className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer truncate">
                      {["Under ₹15,000","₹15,000 – ₹25,000","₹25,000 – ₹40,000","₹40,000 – ₹60,000","₹60,000 – ₹1,00,000","₹1,00,000+ (Luxury)"].map(b => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">All-inclusive estimate</span>
                  </div>

                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Approx Date</label>
                    <input
                      type="month"
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">Flexible dates welcome</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Group Size</label>
                    <select className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer truncate">
                      {["Solo (1 Person)","Couple (2 People)","Family (3–5)","Group (6–10)","Large Group (10+)"].map(g => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">Private cab sizing</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setEnquiryPackage(`Custom Itinerary — ${toDestination}`); setIsEnquiryOpen(true); }}
                    className="col-span-2 sm:col-span-1 w-full py-3.5 sm:py-0 sm:min-h-[68px] rounded-xl bg-gradient-to-br from-[#0b1b36] to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white font-black text-xs sm:text-sm uppercase tracking-wide flex flex-row lg:flex-col items-center justify-center gap-1.5 sm:gap-1 shadow-lg transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className="text-base sm:text-lg">✨</span>
                    <span>Build My Itinerary</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 overflow-x-auto scrollbar-none whitespace-nowrap">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold shrink-0">✨ Popular:</span>
                  {["Spiti Valley Circuit","South India Temple Route","Rajasthan Heritage Loop","Golden Triangle","North East Adventure"].map(item => (
                    <button key={item} onClick={() => setToDestination(item)} className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 text-[10.5px] sm:text-[11px] font-medium transition-colors cursor-pointer shrink-0">{item}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 3: Transportation & Cabs ── */}
            {activeSearchTab === "cabs" && (
              <div className="space-y-3.5">
                {/* Trip Type Selector Pills */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit overflow-x-auto scrollbar-none">
                  {[
                    { id: "ONE_WAY", label: "Single Trip (One Way)", icon: "➡️" },
                    { id: "ROUND_TRIP", label: "Round Trip", icon: "🔁" },
                    { id: "MULTICITY", label: "Multicity / Outstation", icon: "🗺️" },
                  ].map((tt) => (
                    <button
                      key={tt.id}
                      type="button"
                      onClick={() => setCabTripType(tt.id as typeof cabTripType)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                        cabTripType === tt.id
                          ? "bg-amber-500 text-slate-950 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>{tt.icon}</span> <span>{tt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                  {/* Pickup City */}
                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pickup Location</label>
                    <input
                      type="text"
                      value={cabPickupCity}
                      onChange={(e) => setCabPickupCity(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 truncate"
                      placeholder="e.g. Delhi / Airport"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">City, Airport or Station</span>
                  </div>

                  {/* Drop / Destination City */}
                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {cabTripType === "MULTICITY" ? "Outstation Route" : "Drop Destination"}
                    </label>
                    <input
                      type="text"
                      value={cabDropCity}
                      onChange={(e) => setCabDropCity(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 truncate"
                      placeholder={cabTripType === "MULTICITY" ? "e.g. Delhi → Agra → Jaipur" : "e.g. Manali / Shimla"}
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">Drop city or hotel</span>
                  </div>

                  {/* Vehicle Type Selection */}
                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vehicle Type</label>
                    <select
                      value={cabVehicleType}
                      onChange={(e) => setCabVehicleType(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer truncate"
                    >
                      <option value="Sedan (Dzire / Etios · 4 Seater)">Sedan (Dzire / Etios · 4 Seater)</option>
                      <option value="SUV / MPV (Ertiga / Carens · 6 Seater)">SUV / MPV (Ertiga / Carens · 6 Seater)</option>
                      <option value="Premium SUV (Innova Crysta · 7 Seater)">Premium SUV (Innova Crysta · 7 Seater)</option>
                      <option value="Luxury (Fortuner / BMW / Audi)">Luxury (Fortuner / BMW / Audi)</option>
                      <option value="Tempo Traveller (12 Seater Maharaja)">Tempo Traveller (12 Seater Maharaja)</option>
                      <option value="Tempo Traveller (17 / 26 Seater)">Tempo Traveller (17 / 26 Seater)</option>
                    </select>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">AC & verified drivers</span>
                  </div>

                  {/* Travel Dates & Time */}
                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {cabTripType === "ONE_WAY" ? "Pickup Date" : "Pickup & Return"}
                    </label>
                    <input
                      type="date"
                      value={cabPickupDate}
                      onChange={(e) => setCabPickupDate(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">Time: {cabPickupTime}</span>
                  </div>

                  {/* Action CTA Button */}
                  <button
                    type="button"
                    onClick={() => setIsCabModalOpen(true)}
                    className="col-span-2 lg:col-span-1 w-full py-3.5 sm:py-0 sm:min-h-[68px] rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wide flex flex-row lg:flex-col items-center justify-center gap-1.5 sm:gap-1 shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className="text-base sm:text-lg">🚗</span>
                    <span>Get Cab Quote</span>
                  </button>
                </div>

                {/* Popular Cab Routes */}
                <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 overflow-x-auto scrollbar-none whitespace-nowrap">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold shrink-0">🚗 Popular Cabs:</span>
                  {[
                    { from: "Delhi", to: "Manali" },
                    { from: "Delhi", to: "Agra" },
                    { from: "Chandigarh", to: "Shimla" },
                    { from: "Delhi", to: "Jaipur" },
                    { from: "Dehradun", to: "Mussoorie" },
                    { from: "Cochin", to: "Munnar" },
                  ].map((route) => (
                    <button
                      key={`${route.from}-${route.to}`}
                      onClick={() => {
                        setCabPickupCity(route.from);
                        setCabDropCity(route.to);
                      }}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 text-[10.5px] sm:text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                    >
                      {route.from} ⇄ {route.to}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 3: Luxury Stays & Resorts ── */}
            {activeSearchTab === "hotels" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                  <div className="col-span-2 lg:col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Destination / Property</label>
                    <input
                      type="text"
                      placeholder="e.g. Manali, Udaipur..."
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 truncate"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">4★ & 5★ curated only</span>
                  </div>

                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Check-In Date</label>
                    <input
                      type="date"
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">Arrival date</span>
                  </div>

                  <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Check-Out Date</label>
                    <input
                      type="date"
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">Departure date</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-3xs">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rooms & Guests</label>
                    <select className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer truncate">
                      {["1 Room · 1 Adult","1 Room · 2 Adults","2 Rooms · 2–4 Adults","2 Rooms · 4+ Adults","3+ Rooms (Group)"].map(r => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">Private room basis</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setEnquiryPackage("Luxury Stay Booking"); setIsEnquiryOpen(true); }}
                    className="col-span-2 lg:col-span-1 w-full py-3.5 sm:py-0 sm:min-h-[68px] rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wide flex flex-row lg:flex-col items-center justify-center gap-1.5 sm:gap-1 shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className="text-base sm:text-lg">🏨</span>
                    <span>Check Availability</span>
                  </button>
                </div>

                {/* Hotel category filters */}
                <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 overflow-x-auto scrollbar-none whitespace-nowrap">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold shrink-0">⭐ Popular:</span>
                  {["Private Pool Villas Bali","Heritage Havelis Rajasthan","Overwater Maldives Resort","Hill Station Chalets Shimla","Houseboat Alleppey"].map(item => (
                    <button key={item} className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10.5px] sm:text-[11px] font-medium transition-colors cursor-pointer shrink-0">{item}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Special Offers & Exclusive Discounts Carousel (Above Popular Holiday Spots) ── */}
      <SpecialOffersCarousel
        onClaimOffer={(offerName) => {
          setEnquiryPackage(offerName);
          setIsEnquiryOpen(true);
        }}
      />

      {/* ── Popular Destinations Showcase (BMT Multi-Tab Directory) ── */}
      <section className="py-8 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">Top Rated Destinations</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Explore Popular Holiday Spots
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Handpicked destinations offering curated stays, guided sightseeing, and scenic transfers.
            </p>
          </div>

          {/* Destination Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto text-xs font-bold">
            <button
              onClick={() => setDestinationTab("domestic")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                destinationTab === "domestic"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Domestic Gems
            </button>
            <button
              onClick={() => setDestinationTab("international")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                destinationTab === "international"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              International Escapes
            </button>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(destinationTab === "domestic" ? domesticList : intlList).map((dest) => (
            <Link
              key={dest.name}
              href={getCanonicalDestinationUrl(dest.slug, destinationTab)}
              className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col"
            >
              {/* Image with overlay badge */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-amber-400 backdrop-blur-md border border-white/10 shadow-sm">
                    {dest.tag}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
                    {dest.packages}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{dest.tagline}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Starting Price</span>
                    <span className="text-base font-extrabold text-slate-900">{dest.price}</span>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950 text-xs font-bold text-slate-700 transition-colors">
                    Explore →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Best-Selling Holiday Packages Carousel ── */}
      <BestPackagesCarousel
        onEnquire={(packageTitle) => {
          setEnquiryPackage(packageTitle);
          setIsEnquiryOpen(true);
        }}
      />

      {/* ── Speciality Theme Packages (BMT Curated Collections) ── */}
      <ThemePackagesSection />

      {/* ── Custom Trip Planner Banner (BMT Interactive CTA) ── */}
      <section id="custom-planner" className="py-8 px-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto rounded-xl p-6 sm:p-10 bg-slate-950/60 border border-slate-700/80 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              100% Tailor-Made For You
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Want a Completely Custom Holiday Itinerary?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tell us where you want to travel, your preferred dates, hotel style, and budget. Our expert destination planners will create your personalized day-wise itinerary in under 2 hours.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400">✓ Free Quotation &amp; Consultation</span>
              <span className="flex items-center gap-1.5 text-amber-400">✓ Flexible Hotel Categories</span>
              <span className="flex items-center gap-1.5 text-amber-400">✓ Zero Booking Fees</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 text-slate-900 w-full max-w-sm shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Plan in 60 Seconds</h3>
            <p className="text-[11px] text-slate-500">Get an authoritative quote directly from our pricing engine.</p>

            <div className="space-y-2 pt-1 text-xs">
              <input
                type="text"
                placeholder="Your Full Name"
                value={enquiryName}
                onChange={(e) => setEnquiryName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <input
                type="tel"
                placeholder="Phone / WhatsApp Number *"
                value={enquiryPhone}
                onChange={(e) => setEnquiryPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={enquiryEmail}
                onChange={(e) => setEnquiryEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <button
                type="button"
                onClick={handleEnquirySubmit}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all cursor-pointer mt-1"
              >
                Get Instant Quote Now →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Be My Traveller (Dynamic Two-Column) ── */}
      <WhyBookSection />

      {/* ── Verified Customer Reviews Carousel ── */}
      <ReviewsCarousel />

      {/* ── Universal Site Footer (BMT Travel Portal) ── */}
      <SiteFooter />

      {/* ── Cab Booking Lead Modal Dialog ── */}
      {isCabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsCabModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer font-bold"
            >
              ✕
            </button>

            {cabSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 text-3xl flex items-center justify-center mx-auto shadow-inner">
                  ✓
                </div>
                <h3 className="text-xl font-black text-slate-900">Cab Request Received!</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thank you! Our dedicated cab desk has received your request for <strong>{cabPickupCity} → {cabDropCity}</strong> in <strong>{cabVehicleType}</strong>. We will call and WhatsApp you confirmed rates and vehicle photos shortly.
                </p>
                <div className="pt-2">
                  <a
                    href={`https://wa.me/918091638090?text=Hello%2C%20I%20just%20requested%20a%20cab%20from%20${encodeURIComponent(cabPickupCity)}%20to%20${encodeURIComponent(cabDropCity)}%20in%20${encodeURIComponent(cabVehicleType)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <span>💬</span> Connect on WhatsApp for Priority
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCabSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 flex items-center gap-1">
                    <span>🚗</span> Instant Cab & Driver Quote
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {cabTripType === "ONE_WAY" ? "One-Way Cab" : cabTripType === "ROUND_TRIP" ? "Round-Trip Cab" : "Multicity Tour"}
                  </h3>
                  <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                    <p className="font-bold text-slate-800">
                      📍 {cabPickupCity} → {cabDropCity}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Vehicle: <span className="font-semibold text-slate-700">{cabVehicleType}</span>
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Travel Date: <span className="font-semibold text-slate-700">{cabPickupDate}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aman Gupta"
                      value={cabName}
                      onChange={(e) => setCabName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp / Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={cabPhone}
                      onChange={(e) => setCabPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. aman@example.com"
                      value={cabEmail}
                      onChange={(e) => setCabEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Special Notes / Luggage / Pickup Point</label>
                    <input
                      type="text"
                      placeholder="e.g. Terminal 3 Airport pickup, 4 large bags"
                      value={cabSpecialReq}
                      onChange={(e) => setCabSpecialReq(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cabSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  {cabSubmitting ? "Submitting Request..." : "Confirm & Get Instant Cab Quote"}
                </button>

                <p className="text-[10.5px] text-center text-slate-400">
                  🚗 AC Clean Fleet · Commercial Taxi Permit · Verified Drivers
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Quick Enquiry Modal Dialog ── */}
      {isEnquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsEnquiryOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>

            {enquirySuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 text-2xl flex items-center justify-center mx-auto">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-slate-900">Enquiry Received!</h3>
                <p className="text-xs text-slate-500">
                  Our destination specialist is preparing your customized itinerary and will call you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                    Instant Travel Quote
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    {enquiryPackage || "Plan Your Customized Holiday"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter your contact details to receive a full day-wise quote.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={enquiryName}
                      onChange={(e) => setEnquiryName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 8091638090"
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={enquiryEmail}
                      onChange={(e) => setEnquiryEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/25 transition-all cursor-pointer mt-2"
                  >
                    Submit & Receive Quote →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
