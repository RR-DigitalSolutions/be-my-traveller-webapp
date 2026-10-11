"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatINR } from "@/lib/utils";

interface IQuoteDay {
  dayNumber: number;
  title: string;
  city: string;
  hotelName: string;
  roomCategory: string;
  mealPlan: string;
  vehicleType: string;
  activities: string;
}

interface QuoteData {
  _id: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  destination: string;
  travelDates: string | { from?: string; to?: string };
  paxCount: string;
  hotelTier: string;
  cabType: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  itinerary?: IQuoteDay[];
  inclusions?: string[];
  exclusions?: string[];
  costing?: {
    perPersonCost?: number;
  };
  assignedSalesPerson?: {
    name: string;
    phone: string;
    email: string;
    role: string;
  };
}

export default function PublicQuoteProposalPage() {
  const params = useParams();
  const id = params?.id as string;

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProposal = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/admin/quotes/${id}`);
        const data = await res.json();
        if (data.quote) {
          setQuote(data.quote);
        } else {
          setError("Tour proposal not found or link has expired.");
        }
      } catch {
        setError("Failed to load tour proposal. Please try again or contact support.");
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center text-slate-300">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-black text-white">Loading Your Custom Tour Proposal...</h2>
        <p className="text-xs text-slate-500 mt-1">Be My Traveller Holidays • Curated Travel Engine</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center text-slate-300">
        <span className="text-4xl mb-3">🏔️</span>
        <h2 className="text-xl font-black text-white">Proposal Not Available</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md">{error || "This proposal link is inactive."}</p>
        <Link
          href="/"
          className="mt-6 px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  const cleanPhone = quote.assignedSalesPerson?.phone
    ? quote.assignedSalesPerson.phone.replace(/[^0-9]/g, "")
    : "918091638090";
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${encodeURIComponent(
    `Hi Be My Traveller, I am reviewing proposal #${quote.quoteNumber} for ${quote.destination} and would like to proceed with booking!`
  )}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                  Handcrafted Tour Proposal
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                  ✓ Verified Itinerary
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                {quote.destination}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Prepared exclusively for <strong className="text-white">{quote.customerName}</strong> by Be My Traveller Holidays
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Package Investment</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">{formatINR(quote.totalAmount)}</p>
              {quote.costing?.perPersonCost && (
                <p className="text-xs text-slate-400 font-medium">{formatINR(quote.costing.perPersonCost)} / person</p>
              )}
              <span className="inline-block text-[10px] text-emerald-400 font-bold">All-Inclusive (Taxes &amp; GST)</span>
            </div>
          </div>

          {/* Key Trip Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-xs">
            <div>
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Travel Dates</span>
              <span className="font-bold text-white block mt-0.5">
                📅 {typeof quote.travelDates === "string" ? quote.travelDates : "Flexible"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Group Size</span>
              <span className="font-bold text-white block mt-0.5">👥 {quote.paxCount}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Hotel Standard</span>
              <span className="font-bold text-amber-400 block mt-0.5 truncate">🏨 {quote.hotelTier}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Dedicated Fleet</span>
              <span className="font-bold text-white block mt-0.5 truncate">🚗 {quote.cabType}</span>
            </div>
          </div>
        </div>

        {/* Day-by-Day Journey Program */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>🗓️</span> Day-Wise Tour Program &amp; Experiences
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Carefully timed drives, curated hotels, and private transfers
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-800 text-amber-400 font-black text-xs">
              {quote.itinerary?.length || 0} Days Itinerary
            </span>
          </div>

          <div className="space-y-4">
            {quote.itinerary && quote.itinerary.length > 0 ? (
              quote.itinerary.map((day) => (
                <div
                  key={day.dayNumber}
                  className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3 transition hover:border-amber-500/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-700/40 pb-2.5">
                    <div className="flex items-center gap-2.5 font-bold text-white text-sm sm:text-base">
                      <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                        {day.dayNumber}
                      </span>
                      <span>{day.title}</span>
                    </div>
                    <span className="text-xs text-amber-400 font-bold">📍 {day.city}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs py-1">
                    <div className="p-2 rounded-lg bg-slate-800/80">
                      <span className="text-slate-500 block text-[10px] font-bold">Hotel Stay</span>
                      <span className="font-semibold text-slate-200">{day.hotelName || "4★ Hotel"}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800/80">
                      <span className="text-slate-500 block text-[10px] font-bold">Meal Plan</span>
                      <span className="font-bold text-amber-400">
                        {day.mealPlan === "MAP"
                          ? "MAP (Breakfast + Dinner)"
                          : day.mealPlan === "CP"
                          ? "CP (Breakfast Only)"
                          : day.mealPlan === "AP"
                          ? "AP (All Meals Included)"
                          : "EP (Room Only)"}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800/80">
                      <span className="text-slate-500 block text-[10px] font-bold">Dedicated Transfer</span>
                      <span className="font-semibold text-slate-200">{day.vehicleType || quote.cabType}</span>
                    </div>
                  </div>

                  {day.activities && (
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {day.activities}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">Standard sequential itinerary applies.</p>
            )}
          </div>
        </div>

        {/* Inclusions & Exclusions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>✓</span> 100% Guaranteed Inclusions
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {quote.inclusions && quote.inclusions.length > 0 ? (
                quote.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{inc}</span>
                  </li>
                ))
              ) : (
                <>
                  <li>✓ 4★ Deluxe Hotel Accommodations</li>
                  <li>✓ Daily Breakfast &amp; Dinner (MAP)</li>
                  <li>✓ Dedicated Private Sanitized Vehicle</li>
                  <li>✓ Toll Taxes, State Entry, Fuel &amp; Parking</li>
                  <li>✓ 24/7 On-Trip Concierge Support</li>
                </>
              )}
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
            <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>✕</span> Package Exclusions
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {quote.exclusions && quote.exclusions.length > 0 ? (
                quote.exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <span>{exc}</span>
                  </li>
                ))
              ) : (
                <>
                  <li>✕ Airfare / Train Tickets</li>
                  <li>✕ Personal expenses, laundry &amp; tips</li>
                  <li>✕ Optional adventure activities &amp; camera permits</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Dedicated Holiday Specialist & Booking Action Bar */}
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              YOUR DEDICATED HOLIDAY CONCIERGE
            </span>
            <h3 className="text-xl font-black text-white mt-0.5">
              {quote.assignedSalesPerson?.name || "Senior Travel Specialist"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Have questions, custom date requests, or want to modify any hotel? Connect directly:
            </p>
            <p className="text-xs text-slate-300 font-mono mt-1">
              📞 {quote.assignedSalesPerson?.phone || "+91 8091638090"} • ✉️ {quote.assignedSalesPerson?.email || "bookings@bemytraveller.com"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <span>💬</span> Chat on WhatsApp
            </a>
            <button
              onClick={() => window.print()}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              <span>🖨️</span> Save PDF
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 pt-4">
          Be My Traveller Holidays • Verified Travel Network • 24/7 Helpline: +91 8091638090 • www.bemytraveller.com
        </div>
      </div>
    </div>
  );
}
