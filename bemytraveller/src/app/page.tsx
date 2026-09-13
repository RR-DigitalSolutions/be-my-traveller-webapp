"use client";

import React, { useState } from "react";
import Link from "next/link";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import ThemePackagesSection from "@/components/home/ThemePackagesSection";
import SpecialOffersCarousel from "@/components/home/SpecialOffersCarousel";

export default function HomePage() {
  const [activeSearchTab, setActiveSearchTab] = useState<
    "holidays" | "custom" | "hotels" | "activities" | "visa"
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

  // Enquiry modal state
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryPackage, setEnquiryPackage] = useState("");
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);

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

  const bestSellerPackages = [
    {
      id: "pkg-1",
      slug: "6-nights-himachal-manali-tour",
      title: "6 Nights 7 Days Majestic Himachal & Rohtang Pass Tour",
      destination: "Shimla (2N) · Manali (3N) · Chandigarh (1N)",
      nights: "6 Nights / 7 Days",
      originalPrice: "₹38,000",
      price: "₹29,999",
      discount: "21% OFF",
      rating: 4.9,
      reviews: 184,
      inclusions: ["4★ Hotel Stay", "Private AC Cab", "Daily Breakfast & Dinner", "Solang Valley Sightseeing"],
      img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
      tag: "Bestseller",
    },
    {
      id: "pkg-2",
      slug: "5-nights-kashmir-gulmarg-tour",
      title: "5 Nights 6 Days Heavenly Kashmir with Gulmarg Gondola",
      destination: "Srinagar (2N) · Gulmarg (1N) · Pahalgam (2N)",
      nights: "5 Nights / 6 Days",
      originalPrice: "₹42,000",
      price: "₹33,500",
      discount: "20% OFF",
      rating: 4.9,
      reviews: 210,
      inclusions: ["Dal Lake Houseboat", "Gulmarg Gondola Ride", "Pahalgam Valley Tour", "Shikara Ride"],
      img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
      tag: "Snow Favorite",
    },
    {
      id: "pkg-3",
      slug: "5-nights-kerala-backwaters-luxury",
      title: "5 Nights 6 Days Kerala Romance & Backwaters Luxury",
      destination: "Cochin · Munnar (2N) · Thekkady (1N) · Alleppey (1N)",
      nights: "5 Nights / 6 Days",
      originalPrice: "₹36,000",
      price: "₹27,999",
      discount: "22% OFF",
      rating: 4.8,
      reviews: 156,
      inclusions: ["Private Houseboat", "Tea Estate Resort", "Kathakali Show", "Periyar Boat Safari"],
      img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80",
      tag: "Couple Special",
    },
    {
      id: "pkg-4",
      slug: "5-nights-royal-rajasthan-heritage",
      title: "5 Nights 6 Days Royal Forts & Palaces of Rajasthan",
      destination: "Jaipur (2N) · Jodhpur (1N) · Udaipur (2N)",
      nights: "5 Nights / 6 Days",
      originalPrice: "₹35,000",
      price: "₹26,500",
      discount: "24% OFF",
      rating: 4.8,
      reviews: 132,
      inclusions: ["Heritage Haveli Stay", "Lake Pichola Boat", "Desert Camel Safari", "Chokhi Dhani Dinner"],
      img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
      tag: "Heritage",
    },
  ];

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
          <div className="bg-white rounded-xl p-5 sm:p-7 shadow-2xl border border-slate-100 text-slate-900">
            {/* Search Type Selector Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 pb-0 mb-5 overflow-x-auto">
              {[
                { key: "holidays", icon: "🏖️", label: "Holiday Packages" },
                { key: "custom", icon: "🧭", label: "Build Custom Itinerary" },
                { key: "hotels", icon: "🏨", label: "Luxury Stays & Resorts" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSearchTab(tab.key as typeof activeSearchTab)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                    activeSearchTab === tab.key
                      ? "text-amber-600 border-amber-500"
                      : "text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* ── TAB 1: Holiday Packages ── */}
            {activeSearchTab === "holidays" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Departure City</label>
                    <input
                      type="text"
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5"
                      placeholder="e.g. New Delhi"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Flying / Starting From</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Destination</label>
                    <input
                      type="text"
                      value={toDestination}
                      onChange={(e) => setToDestination(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5"
                      placeholder="e.g. Himachal Pradesh"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">500+ destinations available</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Travel Month</label>
                    <select
                      value={travelMonth}
                      onChange={(e) => setTravelMonth(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
                    >
                      {["September 2026","October 2026","November 2026","December 2026","January 2027","February 2027","March 2027","April 2027","May 2027"].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Peak & off-season</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
                    >
                      {["2 - 3 Nights","4 - 5 Nights","5 - 7 Nights","7 - 10 Nights","10 - 14 Nights","14+ Nights"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Flexible nights</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setEnquiryPackage(`Holiday to ${toDestination} (${duration}, ${travelMonth})`); setIsEnquiryOpen(true); }}
                    className="w-full min-h-[72px] rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wide flex flex-col items-center justify-center gap-1 shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Packages
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-semibold">🔥 Trending:</span>
                  {["Manali Snow Tour","Kashmir Houseboat","Kerala Backwaters","Royal Rajasthan","Andaman Islands","Goa Beach"].map(item => (
                    <button key={item} onClick={() => setToDestination(item)} className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 text-[11px] font-medium transition-colors cursor-pointer">{item}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 2: Build Custom Itinerary ── */}
            {activeSearchTab === "custom" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dream Destination</label>
                    <input
                      type="text"
                      value={toDestination}
                      onChange={(e) => setToDestination(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5"
                      placeholder="e.g. Ladakh, Bali, Europe"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Domestic or International</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Travel Style</label>
                    <select className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer">
                      {["Adventure & Trekking","Romantic Honeymoon","Family Vacation","Spiritual Pilgrimage","Luxury & Wellness","Budget Backpacking","Group Tour","Solo Exploration"].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">We customize it for you</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Budget Per Person</label>
                    <select className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer">
                      {["Under ₹15,000","₹15,000 – ₹25,000","₹25,000 – ₹40,000","₹40,000 – ₹60,000","₹60,000 – ₹1,00,000","₹1,00,000+ (Luxury)"].map(b => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">All-inclusive estimate</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Approx Travel Date</label>
                    <input
                      type="month"
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Flexible dates welcome</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Group Size</label>
                    <select className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer">
                      {["Solo (1 Person)","Couple (2 People)","Family (3–5)","Group (6–10)","Large Group (10+)"].map(g => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Private cab sizing</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setEnquiryPackage(`Custom Itinerary — ${toDestination}`); setIsEnquiryOpen(true); }}
                    className="w-full min-h-[72px] rounded-2xl bg-gradient-to-br from-[#0b1b36] to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white font-black text-sm uppercase tracking-wide flex flex-col items-center justify-center gap-1 shadow-lg transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <span className="text-lg">✨</span>
                    Build My Itinerary
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-semibold">✨ Popular Custom Trips:</span>
                  {["Spiti Valley Circuit","South India Temple Route","Rajasthan Heritage Loop","Golden Triangle","North East Adventure","Europe in 12 Days"].map(item => (
                    <button key={item} onClick={() => setToDestination(item)} className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 text-[11px] font-medium transition-colors cursor-pointer">{item}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 3: Luxury Stays & Resorts ── */}
            {activeSearchTab === "hotels" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors lg:col-span-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Destination / Property</label>
                    <input
                      type="text"
                      placeholder="e.g. Manali, Udaipur..."
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">4★ & 5★ curated only</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Check-In Date</label>
                    <input
                      type="date"
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Arrival date</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Check-Out Date</label>
                    <input
                      type="date"
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Departure date</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rooms & Guests</label>
                    <select className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none mt-0.5 cursor-pointer">
                      {["1 Room · 1 Adult","1 Room · 2 Adults","2 Rooms · 2–4 Adults","2 Rooms · 4+ Adults","3+ Rooms (Group)"].map(r => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Private room basis</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setEnquiryPackage("Luxury Stay Booking"); setIsEnquiryOpen(true); }}
                    className="w-full min-h-[72px] rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wide flex flex-col items-center justify-center gap-1 shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <span className="text-lg">🏨</span>
                    Check Availability
                  </button>
                </div>

                {/* Hotel category filters */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-semibold">⭐ Popular Luxury Stays:</span>
                  {["Private Pool Villas Bali","Heritage Havelis Rajasthan","Overwater Maldives Resort","Hill Station Chalets Shimla","Houseboat Alleppey","Jungle Lodges Coorg"].map(item => (
                    <button key={item} className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium transition-colors cursor-pointer">{item}</button>
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
          {(destinationTab === "domestic" ? domesticDestinations : internationalDestinations).map((dest) => (
            <Link
              key={dest.name}
              href={`/destinations/${dest.slug}`}
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

      {/* ── Best Selling Tour Packages (Rich Cards) ── */}
      <section className="py-8 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">Verified Itineraries</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Best-Selling Holiday Packages
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Complete dynamic packages with confirmed hotels, private transfers, meals, and activities.
              </p>
            </div>

            <Link
              href="/packages"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View All 100+ Packages →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellerPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                {/* Photo & Duration */}
                <Link href={`/packages/${pkg.slug}`} className="block">
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={pkg.img}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 shadow-sm">
                        {pkg.tag}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white shadow-sm">
                        {pkg.discount}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between bg-slate-950/75 backdrop-blur-md rounded-lg px-2.5 py-1 text-white text-xs">
                      <span>🕒 {pkg.nights}</span>
                      <span className="text-amber-400 font-bold">★ {pkg.rating}</span>
                    </div>
                  </div>
                </Link>

                {/* Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <Link href={`/packages/${pkg.slug}`}>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">
                        {pkg.title}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">{pkg.destination}</p>

                    {/* Inclusions Chips */}
                    <div className="mt-2.5 space-y-1">
                      {pkg.inclusions.slice(0, 3).map((inc) => (
                        <div key={inc} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <span className="text-emerald-500 font-bold">✓</span> {inc}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Box & CTAs */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 line-through block">{pkg.originalPrice}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-slate-900">{pkg.price}</span>
                        <span className="text-[10px] text-slate-500">/ person</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/packages/${pkg.slug}`}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
                      >
                        Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setEnquiryPackage(pkg.title);
                          setIsEnquiryOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
                      >
                        Quote
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* ── Why Choose Be My Traveller (Trust Indicators) ── */}
      <section className="py-8 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">Trusted by 25,000+ Travellers</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Why Book with Be My Traveller?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            We combine high-tech server-authoritative pricing with personalized high-touch destination expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xl flex items-center justify-center">
              ⚡
            </div>
            <h3 className="font-bold text-sm text-slate-900">Authoritative Pricing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time calculations for season surcharges, room upgrades, and taxes. No hidden surcharges at checkout.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 font-bold text-xl flex items-center justify-center">
              🏨
            </div>
            <h3 className="font-bold text-sm text-slate-900">Verified 4★ &amp; 5★ Stays</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every hotel, resort, and houseboat is physically vetted for hygiene, scenic views, and hospitality standards.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xl flex items-center justify-center">
              🛡️
            </div>
            <h3 className="font-bold text-sm text-slate-900">24/7 On-Trip Concierge</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dedicated trip managers support you through arrival, hotel check-in, permits, and sightseeing at every step.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 font-bold text-xl flex items-center justify-center">
              🎯
            </div>
            <h3 className="font-bold text-sm text-slate-900">100% Customized Trips</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Swap hotels, add private transfers, change meal plans, and include adventure sports according to your schedule.
            </p>
          </div>
        </div>
      </section>

      {/* ── Verified Customer Reviews ── */}
      <section className="py-8 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">Real Traveller Stories</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Loved by Explorers Worldwide
            </h2>
            <div className="flex items-center justify-center gap-2 pt-1">
              <div className="flex text-amber-500 text-sm">★★★★★</div>
              <span className="text-xs font-bold text-slate-700">4.9 / 5.0 Rating (4,500+ Verified Bookings)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <div className="flex text-amber-500 text-sm">★★★★★</div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                &ldquo;Our Himachal trip with Be My Traveller was magical. The cab driver in Manali was polite, the river-facing resort was breathtaking, and the Rohtang Pass permits were arranged smoothly.&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Ananya Sharma</p>
                  <p className="text-[10px] text-slate-500">Mumbai · Travelled to Himachal</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">✓ Verified</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <div className="flex text-amber-500 text-sm">★★★★★</div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                &ldquo;We booked our honeymoon to Kerala through Be My Traveller. The Alleppey luxury houseboat chef prepared amazing authentic meals. Will definitely book Kashmir next winter!&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Rohan &amp; Priya Mehta</p>
                  <p className="text-[10px] text-slate-500">Bengaluru · Travelled to Kerala</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">✓ Verified</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <div className="flex text-amber-500 text-sm">★★★★★</div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                &ldquo;Exceptional service. When our flight from Delhi was delayed, their support team immediately rescheduled our airport cab without extra charges. Highly recommended!&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Vikramaditya Rao</p>
                  <p className="text-[10px] text-slate-500">Hyderabad · Travelled to Rajasthan</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">✓ Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comprehensive OTA Footer (BMT Travel Portal) ── */}
      <footer className="bg-slate-950 text-slate-400 text-xs pt-10 pb-8 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Main Footer Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {/* Column 1: Popular Domestic */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Domestic Holidays</h4>
              <ul className="space-y-2 text-[11px]">
                <li><Link href="/destinations/himachal-pradesh" className="hover:text-amber-400 transition-colors">Himachal Tour Packages</Link></li>
                <li><Link href="/destinations/kashmir" className="hover:text-amber-400 transition-colors">Kashmir Holiday Packages</Link></li>
                <li><Link href="/destinations/kerala" className="hover:text-amber-400 transition-colors">Kerala Backwaters Tours</Link></li>
                <li><Link href="/destinations/rajasthan" className="hover:text-amber-400 transition-colors">Rajasthan Forts & Palaces</Link></li>
                <li><Link href="/destinations/goa" className="hover:text-amber-400 transition-colors">Goa Beach Packages</Link></li>
                <li><Link href="/destinations/andaman" className="hover:text-amber-400 transition-colors">Andaman Islands Scuba</Link></li>
                <li><Link href="/destinations/ladakh" className="hover:text-amber-400 transition-colors">Ladakh & Spiti Roadtrips</Link></li>
                <li><Link href="/destinations/uttarakhand" className="hover:text-amber-400 transition-colors">Uttarakhand Spiritual Circuits</Link></li>
              </ul>
            </div>

            {/* Column 2: Popular International */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">International Tours</h4>
              <ul className="space-y-2 text-[11px]">
                <li><Link href="/destinations/dubai" className="hover:text-amber-400 transition-colors">Dubai Tour Packages</Link></li>
                <li><Link href="/destinations/bali" className="hover:text-amber-400 transition-colors">Bali Honeymoon Packages</Link></li>
                <li><Link href="/destinations/thailand" className="hover:text-amber-400 transition-colors">Thailand Beach Holidays</Link></li>
                <li><Link href="/destinations/vietnam" className="hover:text-amber-400 transition-colors">Vietnam & Ha Long Bay</Link></li>
                <li><Link href="/destinations/singapore" className="hover:text-amber-400 transition-colors">Singapore & Sentosa</Link></li>
                <li><Link href="/destinations/maldives" className="hover:text-amber-400 transition-colors">Maldives Overwater Villas</Link></li>
                <li><Link href="/destinations/europe" className="hover:text-amber-400 transition-colors">Europe Grand Tours</Link></li>
              </ul>
            </div>

            {/* Column 3: Holiday Themes */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Holiday Themes</h4>
              <ul className="space-y-2 text-[11px]">
                <li><Link href="/packages?theme=HONEYMOON" className="hover:text-amber-400 transition-colors">Honeymoon Specials</Link></li>
                <li><Link href="/packages?theme=FAMILY" className="hover:text-amber-400 transition-colors">Family Vacation Circuits</Link></li>
                <li><Link href="/packages?theme=ADVENTURE" className="hover:text-amber-400 transition-colors">Adventure & Trekking</Link></li>
                <li><Link href="/packages?theme=SPIRITUAL" className="hover:text-amber-400 transition-colors">Spiritual & Pilgrimage</Link></li>
                <li><Link href="/packages?theme=LUXURY" className="hover:text-amber-400 transition-colors">Luxury Heritage Stays</Link></li>
                <li><Link href="/customize?duration=SHORT" className="hover:text-amber-400 transition-colors">Weekend Roadtrips</Link></li>
              </ul>
            </div>

            {/* Column 4: Company & Support */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Company & Legal</h4>
              <ul className="space-y-2 text-[11px]">
                <li><Link href="/about" className="hover:text-amber-400 transition-colors">About Be My Traveller</Link></li>
                <li><Link href="/admin/login" className="hover:text-amber-400 transition-colors">Admin Portal Login</Link></li>
                <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Careers & Partners</Link></li>
                <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/cancellation-policy" className="hover:text-amber-400 transition-colors">Cancellation & Refund Policy</Link></li>
              </ul>
            </div>

            {/* Column 5: Payment & Trust Badges */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Secure Booking</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                256-Bit SSL Encrypted checkout. Authorized payments through Razorpay, UPI, Visa, Mastercard, and Net Banking.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-slate-300 font-bold text-[10px]">
                <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">VISA</span>
                <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">Mastercard</span>
                <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">UPI</span>
                <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">Net Banking</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                B
              </span>
              <span>© 2026 Be My Traveller Technologies Pvt. Ltd. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Made with ❤️ for Global Explorers · Technology Partner RRDS</span>
              <span className="text-amber-400 font-semibold">v1.0.0 Live</span>
            </div>
          </div>
        </div>
      </footer>

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
                      placeholder="e.g. +91 98765 43210"
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
