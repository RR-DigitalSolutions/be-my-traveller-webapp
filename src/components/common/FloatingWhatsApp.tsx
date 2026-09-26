"use client";

import React, { useState } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function FloatingWhatsApp() {
  const { settings, cleanWhatsApp } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);

  if (settings.website?.enableFloatingWhatsApp === false) {
    return null;
  }

  const greetingMsg = encodeURIComponent(
    `Hello ${settings.tradeName || "Be My Traveller"}! I would like to plan a holiday trip.`
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover Bubble */}
      {isOpen && (
        <div className="mb-3 w-72 rounded-2xl bg-white p-4 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                💬
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{settings.tradeName || "Be My Traveller"}</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online Concierge
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Namaste! Connect with our destination specialist on WhatsApp for quick itineraries &amp; custom quotes.
          </p>
          <a
            href={`https://wa.me/${cleanWhatsApp}?text=${greetingMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors"
          >
            <span>💬</span> Start WhatsApp Chat
          </a>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer active:scale-95 group"
        aria-label="Chat on WhatsApp"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">💬</span>
        <span className="text-xs font-bold hidden sm:inline">WhatsApp Concierge</span>
      </button>
    </div>
  );
}
