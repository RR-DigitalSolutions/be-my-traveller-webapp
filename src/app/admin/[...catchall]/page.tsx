"use client";

import React from "react";
import Link from "next/link";

export default function AdminCatchAllNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6" data-watermark="RRDS">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/5">
        ⚠️
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
          Admin Portal 404
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Admin Module Not Found
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          The admin management screen or endpoint you requested is unavailable or has been relocated in the latest CRM release.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl pt-2">
        <Link
          href="/admin/dashboard"
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all"
        >
          <span className="text-lg block mb-1">📊</span>
          <span className="text-xs font-bold text-white block">Dashboard</span>
          <span className="text-[10px] text-slate-500">Analytics &amp; KPIs</span>
        </Link>

        <Link
          href="/admin/packages"
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all"
        >
          <span className="text-lg block mb-1">🎒</span>
          <span className="text-xs font-bold text-white block">Packages</span>
          <span className="text-[10px] text-slate-500">3-Tier Tour CMS</span>
        </Link>

        <Link
          href="/admin/destinations"
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all"
        >
          <span className="text-lg block mb-1">📍</span>
          <span className="text-xs font-bold text-white block">Destinations</span>
          <span className="text-[10px] text-slate-500">Places &amp; States</span>
        </Link>

        <Link
          href="/admin/pricing"
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all"
        >
          <span className="text-lg block mb-1">💰</span>
          <span className="text-xs font-bold text-white block">Pricing</span>
          <span className="text-[10px] text-slate-500">Rules &amp; Margins</span>
        </Link>
      </div>

      <div className="pt-4 flex items-center gap-3">
        <Link
          href="/admin/dashboard"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md"
        >
          Return to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
