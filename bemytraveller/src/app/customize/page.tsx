"use client";

import React, { useState } from "react";
import Link from "next/link";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";

export default function CustomTripBuilderPage() {
  const [selectedDestination, setSelectedDestination] = useState("Himachal Pradesh");
  const [durationNights, setDurationNights] = useState(6);
  const [hotelTier, setHotelTier] = useState<"standard" | "deluxe" | "luxury">("deluxe");
  const [cabType, setCabType] = useState<"sedan" | "suv" | "tempo">("sedan");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([
    "Solang Valley ATV Adventure",
    "Candlelight Dinner Setup",
  ]);
  const [adults, setAdults] = useState(2);
  const [travelDate, setTravelDate] = useState("2026-10-15");
  const [isSuccess, setIsSuccess] = useState(false);

  const destinationRates: Record<string, { basePerNight: number; name: string }> = {
    "Himachal Pradesh": { basePerNight: 3500, name: "Himachal Pradesh" },
    "Kashmir Paradise": { basePerNight: 4200, name: "Kashmir Paradise" },
    "Kerala Backwaters": { basePerNight: 3800, name: "Kerala Backwaters" },
    "Royal Rajasthan": { basePerNight: 3600, name: "Royal Rajasthan" },
    "Bali & Indonesia": { basePerNight: 5500, name: "Bali & Indonesia" },
    "Dubai Extravaganza": { basePerNight: 6800, name: "Dubai Extravaganza" },
  };

  const hotelTierMultipliers = {
    standard: 1.0,
    deluxe: 1.3,
    luxury: 2.0,
  };

  const cabRates = {
    sedan: { name: "Private AC Sedan (Dzire / Etios)", costPerDay: 2200 },
    suv: { name: "Private AC SUV (Innova Crysta)", costPerDay: 3500 },
    tempo: { name: "Luxury Tempo Traveller (12 Seater)", costPerDay: 5200 },
  };

  const availableAddons = [
    { name: "Solang Valley ATV Adventure", price: 1500, icon: "🏎️" },
    { name: "Candlelight Dinner Setup with Cake", price: 2500, icon: "🕯️" },
    { name: "Gulmarg Gondola Phase 1 & 2 Tickets", price: 1850, icon: "🚠" },
    { name: "Alleppey Houseboat Private Chef Upgrade", price: 3000, icon: "🍲" },
    { name: "Rohtang Pass Snow Permit & 4x4 Cab", price: 4000, icon: "❄️" },
    { name: "Lake Pichola Sunset Boat Cruise", price: 1200, icon: "⛵" },
  ];

  const toggleAddon = (name: string) => {
    if (selectedAddons.includes(name)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== name));
    } else {
      setSelectedAddons([...selectedAddons, name]);
    }
  };

  // Pricing calculation
  const destRate = destinationRates[selectedDestination]?.basePerNight || 3500;
  const hotelMultiplier = hotelTierMultipliers[hotelTier];
  const hotelCost = Math.round(destRate * hotelMultiplier * durationNights * (adults / 2));
  const cabCost = cabRates[cabType].costPerDay * (durationNights + 1);
  const addonsCost = selectedAddons.reduce((acc, addonName) => {
    const item = availableAddons.find((a) => a.name === addonName);
    return acc + (item ? item.price * adults : 0);
  }, 0);

  const subtotal = hotelCost + cabCost + addonsCost;
  const gst = Math.round(subtotal * 0.05);
  const totalCalculated = subtotal + gst;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* ── BMT Top Navigation ── */}
      <BmtNavMenu />

      {/* Header */}
      <section className="bg-slate-900 text-white -mt-[96px] pt-[124px] pb-12 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
            <Link href="/" className="hover:underline">Home</Link>
            <span>›</span>
            <span>Custom Trip Builder</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Custom Trip Builder & Destination Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Build your personalized tour package with real-time hotel tier selection, private vehicles, and experiential add-ons.
          </p>
        </div>
      </section>

      {/* Main Builder Grid */}
      <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Builder Controls */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Base Details */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Step 1</span>
              <h2 className="text-lg font-black text-slate-900">Trip Overview & Dates</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Destination</label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none"
                  >
                    {["Himachal (Shimla & Manali)", "Kashmir (Srinagar & Gulmarg)", "Kerala (Munnar & Alleppey)", "Andaman (Port Blair & Havelock)", "Rajasthan (Jaipur & Udaipur)", "Goa Beach Holiday"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Nights)</label>
                  <div className="flex items-center gap-1.5">
                    {[3, 4, 5, 6, 7, 8, 10].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setDurationNights(n)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          durationNights === n
                            ? "bg-[#0b1b36] text-white shadow-sm"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        {n}N
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Travellers (Adults)</label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <option key={n} value={n}>{n} Adults</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Hotel Tier */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Step 2</span>
              <h2 className="text-lg font-black text-slate-900">Select Accommodation Style</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "standard", title: "Standard 3★", desc: "Clean, verified boutique mountain hotels" },
                  { id: "deluxe", title: "Deluxe 4★", desc: "Premium valley & river view luxury rooms" },
                  { id: "luxury", title: "Luxury 5★ Resort", desc: "5-Star Spa resorts, chalets & private villas" },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setHotelTier(tier.id as any)}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      hotelTier === tier.id
                        ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">{tier.title}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">{tier.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Private Vehicle */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Step 3</span>
              <h2 className="text-lg font-black text-slate-900">Private Vehicle Selection</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(cabRates).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCabType(key as any)}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      cabType === key
                        ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">{val.name}</span>
                    <span className="text-xs font-bold text-amber-600 block mt-1">₹{val.costPerDay}/day</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Experiences & Add-ons */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Step 4</span>
              <h2 className="text-lg font-black text-slate-900">Experiential Add-ons & Activities</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableAddons.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.name);
                  return (
                    <button
                      key={addon.name}
                      type="button"
                      onClick={() => toggleAddon(addon.name)}
                      className={`p-3 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/50 text-slate-900 shadow-xs"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs text-left">
                        <span>{addon.icon}</span>
                        <div>
                          <span className="font-bold block">{addon.name}</span>
                          <span className="text-[10px] text-slate-500">+₹{addon.price}/person</span>
                        </div>
                      </div>
                      <span className={`text-xs font-black ${isSelected ? "text-amber-600" : "text-slate-400"}`}>
                        {isSelected ? "✓ Added" : "+ Add"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Destination Cart & Authoritative Breakdown */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-slate-200 bg-white shadow-xl p-5 sm:p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3.5">
                <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block">
                  Live Destination Cart
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  {selectedDestination} ({durationNights}N / {durationNights + 1}D)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{adults} Adults · {hotelTier.toUpperCase()} Stays</p>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Hotel Stay ({durationNights} Nights)</span>
                  <span className="font-bold text-slate-900">₹{hotelCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Private Cab ({durationNights + 1} Days)</span>
                  <span className="font-bold text-slate-900">₹{cabCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Add-ons ({selectedAddons.length} selected)</span>
                  <span className="font-bold text-slate-900">₹{addonsCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Government GST (5%)</span>
                  <span className="font-bold text-slate-900">₹{gst.toLocaleString("en-IN")}</span>
                </div>

                <div className="pt-2.5 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-amber-600">₹{totalCalculated.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {isSuccess ? (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
                  <span className="text-emerald-700 font-bold text-xs block">✓ Custom Itinerary Generated!</span>
                  <p className="text-[11px] text-emerald-600">Our trip manager is sending your day-wise plan and PDF quote.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-2.5 pt-1">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone / WhatsApp Number *"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    Lock Quote & Book (₹{totalCalculated.toLocaleString("en-IN")}) →
                  </button>
                </form>
              )}

              <div className="text-[11px] text-slate-500 text-center space-y-0.5 pt-1">
                <p>🔒 256-Bit SSL Encrypted Server Pricing</p>
                <p>✓ Free Cancellation & Rescheduling</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
