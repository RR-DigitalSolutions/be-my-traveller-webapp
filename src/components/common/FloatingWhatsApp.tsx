"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function FloatingWhatsApp() {
  const { settings, cleanWhatsApp } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide on admin pages or if disabled in settings
  if (pathname?.startsWith("/admin") || settings.website?.enableFloatingWhatsApp === false) {
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
              className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold cursor-pointer"
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

      {/* Main Floating Trigger Button (Round & Sleek) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 group relative shadow-emerald-500/30 border-2 border-white/20"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
        <svg
          className="w-7 h-7 fill-white transition-transform group-hover:scale-110 relative z-10"
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </button>
    </div>
  );
}
