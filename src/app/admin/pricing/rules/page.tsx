"use client";

import React, { useState } from "react";

export default function AdminPricingRulesPage() {
  const [markupPercent, setMarkupPercent] = useState(18);
  const [gstPercent, setGstPercent] = useState(5);
  const [peakMultiplier, setPeakMultiplier] = useState(1.35);
  const [saved, setSaved] = useState(false);

  const [seasons, setSeasons] = useState([
    { name: "Super Peak (Diwali / Christmas / New Year)", months: "Dec 15 – Jan 10", multiplier: 1.45, active: true },
    { name: "Summer High Season (Himalayas & Kashmir)", months: "Apr 15 – Jun 30", multiplier: 1.25, active: true },
    { name: "Regular Season", months: "Jul – Nov", multiplier: 1.0, active: true },
    { name: "Monsoon Off-Peak Discounts", months: "Jul 15 – Sep 15 (Goa/Kerala)", multiplier: 0.85, active: true },
  ]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Dynamic Pricing &amp; Season Multipliers</h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure OTA profit markups, seasonal surge factors, GST tax calculations, and dynamic package multipliers.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          {saved ? "✓ Settings Saved!" : "💾 Save Pricing Rules"}
        </button>
      </div>

      {/* Global Margins & Tax Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-2xl">📈</span>
          <h3 className="text-sm font-black text-white">Default Agency Profit Margin</h3>
          <p className="text-xs text-slate-400">Added on top of net contracted rates (Hotels + Cabs + Passes).</p>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="number"
              value={markupPercent}
              onChange={(e) => setMarkupPercent(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-amber-500 text-center"
            />
            <span className="text-sm font-bold text-amber-400">% Margin</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-2xl">🏛️</span>
          <h3 className="text-sm font-black text-white">GST Tax Rate (Tour Packages)</h3>
          <p className="text-xs text-slate-400">Standard Ministry of Tourism 5% GST on packaged tour itineraries.</p>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="number"
              value={gstPercent}
              onChange={(e) => setGstPercent(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-amber-500 text-center"
            />
            <span className="text-sm font-bold text-amber-400">% GST (Included in Quotes)</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-2xl">⚡</span>
          <h3 className="text-sm font-black text-white">Peak Season Global Multiplier</h3>
          <p className="text-xs text-slate-400">Applied automatically during blackout high demand dates.</p>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="number"
              step="0.05"
              value={peakMultiplier}
              onChange={(e) => setPeakMultiplier(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-amber-500 text-center"
            />
            <span className="text-sm font-bold text-amber-400">x Multiplier</span>
          </div>
        </div>
      </div>

      {/* Season Calendar Multipliers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Seasonal Multiplier Calendar</h3>
        </div>
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3.5 px-4">Season Rule Name</th>
              <th className="py-3.5 px-4">Calendar Months</th>
              <th className="py-3.5 px-4">Price Multiplier</th>
              <th className="py-3.5 px-4">Effective Impact</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {seasons.map((s, idx) => (
              <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white text-[13px]">{s.name}</td>
                <td className="py-3.5 px-4 text-slate-400 font-medium">📅 {s.months}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{s.multiplier}x</td>
                <td className="py-3.5 px-4 font-medium">
                  {s.multiplier > 1.0 ? (
                    <span className="text-rose-400 font-bold">+{Math.round((s.multiplier - 1) * 100)}% Surge</span>
                  ) : s.multiplier < 1.0 ? (
                    <span className="text-emerald-400 font-bold">-{Math.round((1 - s.multiplier) * 100)}% Discount</span>
                  ) : (
                    <span className="text-slate-400 font-medium">Base Contract Rate</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ● ACTIVE
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
