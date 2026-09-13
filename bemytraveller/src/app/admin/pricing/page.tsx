"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AdminPricingOverviewPage() {
  const [agencyMargin, setAgencyMargin] = useState(18);
  const [gstRate, setGstRate] = useState(5);
  const [peakMultiplier, setPeakMultiplier] = useState(1.35);
  const [saved, setSaved] = useState(false);

  const handleSaveQuick = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const PRICING_MODULES = [
    {
      title: "Pricing Rules & Margins",
      href: "/admin/pricing/rules",
      icon: "📈",
      badge: "Core Engine",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      description: "Define base markup percentages, minimum profit margins per adult, and dynamic calculation formulas across domestic & international packages.",
    },
    {
      title: "Seasonal Multipliers & Calendar",
      href: "/admin/pricing/seasons",
      icon: "🏔️",
      badge: "4 Active Seasons",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      description: "Manage blackout dates, high season peak multipliers (Summer, Snow Season, Diwali) and off-peak promotional discounts by date ranges.",
    },
    {
      title: "Promotional Discounts & Flash Deals",
      href: "/admin/pricing/discounts",
      icon: "🔥",
      badge: "Auto 3-Tier Sync",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      description: "Configure site-wide flash deal banners, early bird percentages, and dynamic strikethrough original prices across Deluxe, Super Deluxe & Luxury.",
    },
    {
      title: "Coupons & Promo Codes",
      href: "/admin/pricing/coupons",
      icon: "🏷️",
      badge: "Voucher Engine",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      description: "Create promo codes with fixed or percentage discounts, minimum booking cart limits, expiry dates, and usage tracking.",
    },
    {
      title: "Tax Rules & GST Compliance",
      href: "/admin/pricing/taxes",
      icon: "🏛️",
      badge: "5% SAC 998555",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      description: "Manage standard 5% Tour Package GST without ITC, 18% corporate GST with ITC, 5% TCS on international packages, and invoice rules.",
    },
    {
      title: "Live Margin & Quote Simulator",
      href: "/admin/pricing/simulator",
      icon: "🧮",
      badge: "Interactive Tool",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      description: "Test contracted hotel and cab net rates with dynamic markups, seasonal surge, and coupon discounts to preview final quotes and profit margins in real-time.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200" data-watermark="RRDS">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
              Revenue &amp; Yield Management
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs">OTA Pricing Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dynamic Pricing &amp; Yield Command Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage profit markups, seasonal date surcharges, GST compliance, discount tiers, and interactive quote simulations.
          </p>
        </div>

        <button
          onClick={handleSaveQuick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
        >
          {saved ? "✓ Global Rules Saved!" : "💾 Save Quick Settings"}
        </button>
      </div>

      {/* Global Quick KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-2xl">📈</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live Markup
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-300">Default Profit Margin</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Added over net contracted rates</p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="number"
              min={5}
              max={50}
              value={agencyMargin}
              onChange={(e) => setAgencyMargin(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-black text-base focus:outline-hidden focus:border-amber-500 text-center"
            />
            <span className="text-xs font-bold text-slate-300">% Gross Margin</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🏛️</span>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              Statutory GST
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-300">Tour Package GST Rate</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">SAC Code 998555 (without ITC)</p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="number"
              min={0}
              max={28}
              value={gstRate}
              onChange={(e) => setGstRate(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-blue-400 font-black text-base focus:outline-hidden focus:border-blue-500 text-center"
            />
            <span className="text-xs font-bold text-slate-300">% GST Auto-Computed</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-2xl">⚡</span>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Peak Surge
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-300">Default Peak Multiplier</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Applied during blackout sessions</p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="number"
              step={0.05}
              min={1}
              max={2.5}
              value={peakMultiplier}
              onChange={(e) => setPeakMultiplier(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-indigo-400 font-black text-base focus:outline-hidden focus:border-indigo-500 text-center"
            />
            <span className="text-xs font-bold text-slate-300">× Base Fare (+{Math.round((peakMultiplier - 1) * 100)}%)</span>
          </div>
        </div>
      </div>

      {/* Pricing Modules Navigation Grid */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>⚙️</span>
          <span>Pricing Architecture &amp; Yield Tools</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRICING_MODULES.map((mod, i) => (
            <Link
              key={i}
              href={mod.href}
              className="group p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3 shadow-md hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {mod.icon}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                  <span>{mod.title}</span>
                  <span className="text-slate-600 group-hover:text-amber-400 transition-colors text-xs">→</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-400/80 group-hover:text-amber-300 font-semibold">
                <span>Manage settings</span>
                <span>Open Module ↗</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
