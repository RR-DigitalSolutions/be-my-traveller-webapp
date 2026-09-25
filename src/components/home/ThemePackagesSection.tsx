"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { normalizeThemeValue } from "@/lib/site-themes";

export default function ThemePackagesSection() {
  const [activeTheme, setActiveTheme] = useState<string>("ALL");
  const [themes, setThemes] = useState([
    { id: "ALL", label: "🌟 All Signature Themes", icon: "✨" },
    { id: "HONEYMOON", label: "Honeymoon & Romance", icon: "💍" },
    { id: "ADVENTURE", label: "Adventure & Snow", icon: "🏔️" },
    { id: "HERITAGE", label: "Heritage & Palaces", icon: "🏰" },
    { id: "WILDLIFE", label: "Wildlife & Jungle Safaris", icon: "🐅" },
    { id: "PILGRIMAGE", label: "Spiritual & Temple Circuits", icon: "🛕" },
    { id: "BEACH", label: "Beach & Island Villas", icon: "🏖️" },
  ]);

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch("/api/v1/themes");
        const data = await response.json();
        const apiThemes = Array.isArray(data.themes) ? data.themes : [];
        if (apiThemes.length > 0) {
          const nextThemes = apiThemes.map((theme: any) => ({
            id: String(theme.name || theme.slug || "").toUpperCase(),
            label: String(theme.label || theme.name || theme.slug || ""),
            icon: "✨",
          }));
          setThemes([{ id: "ALL", label: "🌟 All Signature Themes", icon: "✨" }, ...nextThemes]);
        }
      } catch (error) {
        console.warn("Unable to load admin-managed themes for home section.", error);
      }
    };

    loadThemes();
  }, []);

  const themePackages = [
    {
      id: "tp-1",
      theme: "honeymoon",
      title: "5 Nights 6 Days Heavenly Kashmir Honeymoon with Gulmarg Gondola",
      destination: "Srinagar (2N) · Gulmarg (1N) · Pahalgam (2N)",
      nights: "5 Nights / 6 Days",
      originalPrice: "₹45,000",
      price: "₹34,999",
      discount: "22% OFF",
      rating: 4.9,
      reviews: 210,
      specialInclusion: "Candlelight Dinner & Shikara Sunset Ride",
      img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
      badge: "Honeymoon Special",
      slug: "5-nights-kashmir-gulmarg-tour",
    },
    {
      id: "tp-2",
      theme: "adventure",
      title: "6 Nights 7 Days Himachal Rohtang Snow & Spiti Safari Circuit",
      destination: "Shimla · Manali · Solang Valley · Rohtang Pass",
      nights: "6 Nights / 7 Days",
      originalPrice: "₹39,000",
      price: "₹29,999",
      discount: "23% OFF",
      rating: 4.9,
      reviews: 184,
      specialInclusion: "Solang Valley ATV Ride & Camp Stay",
      img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
      badge: "Adventure Top Pick",
      slug: "6-nights-himachal-manali-tour",
    },
    {
      id: "tp-3",
      theme: "heritage",
      title: "5 Nights 6 Days Royal Forts, Havelis & Lakes of Rajasthan",
      destination: "Jaipur (2N) · Jodhpur (1N) · Udaipur (2N)",
      nights: "5 Nights / 6 Days",
      originalPrice: "₹36,000",
      price: "₹26,500",
      discount: "26% OFF",
      rating: 4.8,
      reviews: 142,
      specialInclusion: "Lake Pichola Sunset Cruise & Desert Camp",
      img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
      badge: "Heritage Gem",
      slug: "5-nights-royal-rajasthan-heritage",
    },
    {
      id: "tp-4",
      theme: "honeymoon",
      title: "5 Nights 6 Days Kerala Romance, Tea Estates & Luxury Houseboat",
      destination: "Munnar (2N) · Thekkady (1N) · Alleppey (1N) · Cochin (1N)",
      nights: "5 Nights / 6 Days",
      originalPrice: "₹37,000",
      price: "₹27,999",
      discount: "24% OFF",
      rating: 4.9,
      reviews: 198,
      specialInclusion: "Private Houseboat Chef & Tea Garden Villa",
      img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80",
      badge: "Romantic Escape",
      slug: "5-nights-kerala-backwaters-luxury",
    },
    {
      id: "tp-5",
      theme: "beach",
      title: "4 Nights 5 Days Bali Tropical Pool Villas & Nusa Penida Island",
      destination: "Ubud (2N) · Seminyak Private Pool Villa (2N)",
      nights: "4 Nights / 5 Days",
      originalPrice: "₹49,000",
      price: "₹38,500",
      discount: "21% OFF",
      rating: 4.9,
      reviews: 165,
      specialInclusion: "Private Pool Villa & Nusa Penida Speedboat",
      img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80",
      badge: "International Favorite",
      slug: "4-nights-bali-tropical-villa",
    },
    {
      id: "tp-6",
      theme: "spiritual",
      title: "6 Nights 7 Days Sacred Varanasi, Prayagraj & Ayodhya Ram Mandir",
      destination: "Varanasi (2N) · Ayodhya (2N) · Prayagraj (2N)",
      nights: "6 Nights / 7 Days",
      originalPrice: "₹32,000",
      price: "₹23,999",
      discount: "25% OFF",
      rating: 4.9,
      reviews: 140,
      specialInclusion: "VIP Darshan, Ganga Aarti Boat & Vedic Guide",
      img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80",
      badge: "Spiritual Circuit",
      slug: "6-nights-varanasi-ayodhya-pilgrimage",
    },
  ];

  const filteredPackages =
    activeTheme === "ALL"
      ? themePackages
      : themePackages.filter((p) => normalizeThemeValue(p.theme) === normalizeThemeValue(activeTheme));

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">
            Curated For Every Travel Style
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Speciality Holiday Themes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse hand-crafted tour packages categorized by your travel interests and special celebrations.
          </p>
        </div>

        <Link
          href="/packages"
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 self-start md:self-auto"
        >
          View All Tour Packages →
        </Link>
      </div>

      {/* Theme Filter Pills (BMT signature theme strip) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTheme(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTheme === t.id
                ? "bg-[#0b1b36] text-white shadow-md"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Theme Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between group"
          >
            {/* Card Header Media */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
              <img
                src={pkg.img}
                alt={pkg.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-slate-950 shadow-sm">
                  {pkg.badge}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white shadow-sm">
                  {pkg.discount}
                </span>
              </div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between bg-slate-950/80 backdrop-blur-md rounded-lg px-2.5 py-1.5 text-white text-xs">
                <span className="font-medium">🕒 {pkg.nights}</span>
                <span className="text-amber-400 font-bold">★ {pkg.rating} ({pkg.reviews})</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide block">
                  {pkg.destination}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-amber-600 transition-colors leading-snug mt-1 line-clamp-2">
                  {pkg.title}
                </h3>

                <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2 font-medium">
                  <span>✨</span> {pkg.specialInclusion}
                </div>
              </div>

              {/* Pricing & CTA Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 line-through block">{pkg.originalPrice}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900">{pkg.price}</span>
                    <span className="text-[11px] text-slate-500">/ person</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/packages/${pkg.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/customize?package=${pkg.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
                  >
                    Customize
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
