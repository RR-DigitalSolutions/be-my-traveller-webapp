import React from "react";
import Link from "next/link";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans relative overflow-hidden" data-watermark="RRDS">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 left-10 w-[350px] h-[350px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-10">
        <BmtNavMenu variant="solid" />
      </header>

      {/* Main 404 Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Floating 404 Graphic & Badges */}
        <div className="relative inline-block">
          <span className="text-8xl sm:text-9xl md:text-[140px] font-black tracking-tighter bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent select-none drop-shadow-2xl">
            404
          </span>
          <div className="absolute -top-3 -right-6 sm:-right-8 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs sm:text-sm font-black px-3.5 py-1 rounded-full shadow-lg rotate-12 flex items-center gap-1 border border-amber-300/40">
            <span>🧭</span>
            <span>Lost in Himalayas?</span>
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-3 max-w-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Oops! You&apos;ve Wandered Off the Map
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            The destination or trail you are looking for might have been moved, renamed, or is currently undiscovered. Let&apos;s get you back on track to your next unforgettable journey!
          </p>
        </div>

        {/* Quick Search & Exploration */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-2xl backdrop-blur-md">
          <form
            action="/destinations"
            method="GET"
            className="flex items-center gap-2"
          >
            <span className="pl-3 text-slate-400 text-base">🔍</span>
            <input
              type="text"
              name="search"
              placeholder="Search destinations (e.g. Manali, Kashmir, Goa)..."
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none px-2 py-2"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer shrink-0"
            >
              Explore
            </button>
          </form>
        </div>

        {/* Popular Destination Shortcuts */}
        <div className="space-y-3 pt-2">
          <span className="text-[11px] uppercase font-bold tracking-widest text-slate-500 block">
            Popular Mountain &amp; Holiday Escapes
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: "🏔️ Himachal Pradesh", href: "/destination/himachal-tour-packages" },
              { label: "❄️ Kashmir Valley", href: "/destination/kashmir-tour-packages" },
              { label: "🏖️ Goa Beach Holidays", href: "/destination/goa-tour-packages" },
              { label: "🏰 Royal Rajasthan", href: "/destination/rajasthan-tour-packages" },
              { label: "🌴 Kerala Backwaters", href: "/destination/kerala-tour-packages" },
              { label: "✨ All India Packages", href: "/destination/india-tour-packages" },
            ].map((dest, i) => (
              <Link
                key={i}
                href={dest.href}
                className="px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-all shadow-xs"
              >
                {dest.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <span>🏠</span>
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/destinations"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>🗺️</span>
            <span>Browse All Destinations</span>
          </Link>

          <a
            href="https://wa.me/919876543210?text=Hi%20Be%20My%20Traveller!%20I%20need%20help%20finding%20a%20tour%20package."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>💬</span>
            <span>Talk to Himalayan Expert</span>
          </a>
        </div>
      </main>

      {/* Footer Support Bar */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Need immediate booking assistance? 24/7 Helpline: <a href="tel:18002279779" className="font-bold text-slate-300 hover:underline">1800 22 7979</a></span>
          <span className="text-[11px] text-slate-600">Be My Traveller © 2026 · All Rights Reserved</span>
        </div>
      </footer>
    </div>
  );
}
