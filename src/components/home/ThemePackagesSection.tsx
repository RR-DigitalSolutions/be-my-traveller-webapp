"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { normalizeThemeValue } from "@/lib/site-themes";

const defaultThemePackages = [
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
    highlights: [
      "Candlelight Dinner with Floral Setup",
      "Private Shikara Sunset Ride on Dal Lake",
      "Gulmarg Gondola Phase-1 Cable Car Excursion",
      "Verified 4★ Heritage Resort & Houseboat Stays",
    ],
    img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
    badge: "Honeymoon Special",
    slug: "5-nights-kashmir-gulmarg-tour",
  },
  {
    id: "tp-2",
    theme: "adventure",
    title: "6 Nights 7 Days Himachal Rohtang Snow & Spiti Safari Circuit",
    destination: "Shimla (1N) · Kalpa (1N) · Kaza (2N) · Chandratal (1N) · Manali (1N)",
    nights: "6 Nights / 7 Days",
    originalPrice: "₹39,000",
    price: "₹29,999",
    discount: "23% OFF",
    rating: 4.9,
    reviews: 184,
    specialInclusion: "Dedicated 4x4 Vehicle & Expert Driver",
    highlights: [
      "Dedicated 4x4 Expedition Vehicle & Expert Driver",
      "Solang Valley ATV & Rohtang Snow Pass",
      "Scenic Chandratal High-Altitude Lake Camping",
      "Cozy Riverside Luxury Camp Stay with Bonfire",
    ],
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
    badge: "High Altitude Thrill",
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
    highlights: [
      "Lake Pichola Sunset Boat Cruise in Udaipur",
      "Sam Sand Dunes Camel Safari & Desert Camp",
      "Authentic Rajasthani Cultural Dinner & Folk Dance",
      "4★ Heritage Haveli & Royal Palace Stays",
    ],
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
    highlights: [
      "Private Alleppey Houseboat with Onboard Chef",
      "Munnar Tea Plantation & Spice Garden Guided Walk",
      "Thekkady Periyar Lake Wildlife Boat Safari",
      "Romantic Candlelight Dinner & Flower Bed Setup",
    ],
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
    highlights: [
      "Private Pool Luxury Villa in Seminyak",
      "Nusa Penida West Coast Speedboat Excursion",
      "Ubud Sacred Monkey Forest & Tegalalang Rice Terrace",
      "Private AC Car Transfers & Welcome Balinese Drinks",
    ],
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
    highlights: [
      "VIP Darshan at Shri Ram Janmabhoomi & Kashi Vishwanath",
      "Private Evening Ganga Aarti Boat Ride at Dashashwamedh",
      "Triveni Sangam Holy Snan Boat with Life Jackets",
      "Dedicated Certified Spiritual Tour Guide & Chauffeur",
    ],
    img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80",
    badge: "Spiritual Circuit",
    slug: "6-nights-varanasi-ayodhya-pilgrimage",
  },
];

export function parseTourHighlights(pkg: any): string[] {
  if (Array.isArray(pkg.highlights) && pkg.highlights.length > 0) {
    return pkg.highlights.map((s: any) => String(s || "").trim()).filter(Boolean);
  }
  if (Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0) {
    return pkg.inclusions.map((s: any) => String(s || "").trim()).filter(Boolean);
  }
  if (typeof pkg.specialInclusion === "string" && pkg.specialInclusion.trim()) {
    const raw = pkg.specialInclusion.trim();
    if (raw.includes("\n")) {
      return raw.split("\n").map((s: string) => s.replace(/^[•\-\*\s✓✨]+/, "").trim()).filter(Boolean);
    }
    if (raw.includes("•")) {
      return raw.split("•").map((s: string) => s.replace(/^[•\-\*\s✓✨]+/, "").trim()).filter(Boolean);
    }
    if (raw.includes("&")) {
      return raw.split("&").map((s: string) => s.replace(/^[•\-\*\s✓✨]+/, "").trim()).filter(Boolean);
    }
    if (raw.includes(",")) {
      return raw.split(",").map((s: string) => s.replace(/^[•\-\*\s✓✨]+/, "").trim()).filter(Boolean);
    }
    return [raw.replace(/^[•\-\*\s✓✨]+/, "").trim()];
  }
  return [];
}

interface ThemePackagesSectionProps {
  initialThemePackages?: any[];
}

interface ThemeTabItem {
  id: string;
  label: string;
  icon: string;
  slug?: string;
}

export default function ThemePackagesSection({ initialThemePackages }: ThemePackagesSectionProps = {}) {
  const [activeTheme, setActiveTheme] = useState<string>("ALL");
  const [selectedModalPkg, setSelectedModalPkg] = useState<any | null>(null);
  const [themePackagesList, setThemePackagesList] = useState(
    initialThemePackages && initialThemePackages.length > 0 ? initialThemePackages : defaultThemePackages
  );
  const [themes, setThemes] = useState<ThemeTabItem[]>([
    { id: "ALL", label: "🌟 All Signature Themes", icon: "✨", slug: "all" },
    { id: "HONEYMOON", label: "Honeymoon & Romance", icon: "💍", slug: "honeymoon" },
    { id: "ADVENTURE", label: "Adventure & Snow", icon: "🏔️", slug: "adventure" },
    { id: "HERITAGE", label: "Heritage & Palaces", icon: "🏰", slug: "heritage" },
    { id: "WILDLIFE", label: "Wildlife & Jungle Safaris", icon: "🐅", slug: "wildlife" },
    { id: "PILGRIMAGE", label: "Spiritual & Temple Circuits", icon: "🛕", slug: "pilgrimage" },
    { id: "BEACH", label: "Beach & Island Villas", icon: "🏖️", slug: "beach" },
  ]);

  const matchesTheme = (packageTheme: any, targetTheme: string): boolean => {
    if (targetTheme === "ALL") return true;
    const targetNorm = normalizeThemeValue(targetTheme);
    const themeList = Array.isArray(packageTheme) ? packageTheme : [packageTheme];
    return themeList.some((t) => {
      if (!t) return false;
      const str = String(t);
      return normalizeThemeValue(str) === targetNorm || str.toLowerCase().replace(/[^a-z0-9]+/g, "-") === targetTheme.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    });
  };

  useEffect(() => {
    if (initialThemePackages && initialThemePackages.length > 0) {
      setThemePackagesList(initialThemePackages);
    }
  }, [initialThemePackages]);

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch("/api/v1/themes");
        const data = await response.json();
        const apiThemes = Array.isArray(data.themes) ? data.themes : [];
        if (apiThemes.length > 0) {
          const nextThemes = apiThemes.map((theme: any) => ({
            id: String(theme.name || theme.slug || "").toUpperCase(),
            slug: String(theme.slug || theme.name || "").toLowerCase(),
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

    // Load dynamic theme packages from admin content
    const loadCuratedPackages = async () => {
      try {
        if (!initialThemePackages || initialThemePackages.length === 0) {
          const homeRes = await fetch("/api/v1/homepage-content", { cache: "no-store" });
          const homeData = await homeRes.json();
          if (homeData.success && Array.isArray(homeData.content?.themePackages) && homeData.content.themePackages.length > 0) {
            const active = homeData.content.themePackages.filter((p: any) => p.isActive !== false);
            if (active.length > 0) {
              setThemePackagesList(active);
            }
          }
        } else {
          setThemePackagesList(initialThemePackages);
        }
      } catch (err) {
        console.warn("Error fetching curated theme packages:", err);
      }
    };

    loadCuratedPackages();
  }, [initialThemePackages]);

  const filteredPackages =
    activeTheme === "ALL"
      ? themePackagesList
      : themePackagesList.filter((p) => matchesTheme(p.theme, activeTheme));

  // Exactly max 6 packages for each theme and max 6 in "ALL"
  const displayedPackages = filteredPackages.slice(0, 6);

  const currentThemeObj = themes.find((t) => t.id === activeTheme);
  const isAll = activeTheme === "ALL";
  const themeParam = currentThemeObj?.slug || currentThemeObj?.id || activeTheme;
  const viewAllHref = isAll ? "/packages" : `/packages?theme=${encodeURIComponent(themeParam)}`;
  const viewAllText = isAll ? "View All Tour Packages" : `View All ${currentThemeObj?.label || "Theme"} Packages`;

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
          href={viewAllHref}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 self-start md:self-auto group"
        >
          <span>{viewAllText}</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
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

      {/* Theme Packages Grid (Max 6 shown) */}
      {displayedPackages.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {displayedPackages.map((pkg) => (
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
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white shadow-sm">
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
                    <Link href={`/packages/${pkg.slug}`}>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">
                        {pkg.title}
                      </h3>
                    </Link>

                    {/* Route line matching Best-Selling Holiday Packages section */}
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-medium">
                      {pkg.destination || pkg.route}
                    </p>

                    {/* Tour Highlights: Max 4 lines, one per line with Right/Check icon */}
                    {(() => {
                      const allHl = parseTourHighlights(pkg);
                      const visibleHl = allHl.slice(0, 4);
                      return (
                        <div className="mt-2.5 space-y-1">
                          {visibleHl.map((hl, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                              <span className="text-emerald-500 font-bold shrink-0">✓</span>
                              <span className="truncate">{hl}</span>
                            </div>
                          ))}
                          {allHl.length > 4 && (
                            <button
                              type="button"
                              onClick={() => setSelectedModalPkg(pkg)}
                              className="text-[10.5px] font-semibold text-amber-600 hover:text-amber-700 hover:underline inline-flex items-center gap-0.5 pt-0.5 cursor-pointer"
                            >
                              <span>+{allHl.length - 4} more highlights</span>
                              <span>→</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Pricing & CTA Button */}
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
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/customize?package=${pkg.slug}`}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all"
                      >
                        Customize
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Corner: View All Packages for Selected Theme */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{displayedPackages.length}</span> of{" "}
              <span className="font-bold text-slate-800">{filteredPackages.length}</span> shortlisted packages
              {!isAll && currentThemeObj ? ` for ${currentThemeObj.label}` : ""}.
            </p>
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold transition-all shadow-sm group"
            >
              <span>{viewAllText}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </>
      ) : (
        <div className="p-10 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <p className="text-sm font-bold text-slate-700">Custom tour packages are available for this theme.</p>
          <p className="text-xs text-slate-500">Need a personalized itinerary? Our travel specialists will craft it for you.</p>
          <div className="flex justify-center gap-2 pt-2">
            <Link href={viewAllHref} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">
              {viewAllText}
            </Link>
            <Link href="/customize" className="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-400">
              Customize an Itinerary
            </Link>
          </div>
        </div>
      )}

      {/* ── All Tour Highlights Modal ── */}
      {selectedModalPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative h-40 w-full overflow-hidden bg-slate-900">
              <img
                src={selectedModalPkg.img}
                alt={selectedModalPkg.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedModalPkg(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer text-sm font-bold"
                aria-label="Close modal"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-4 right-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 inline-block mb-1">
                  {selectedModalPkg.badge || selectedModalPkg.nights}
                </span>
                <h3 className="font-bold text-base text-white leading-snug line-clamp-2">
                  {selectedModalPkg.title}
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1 font-medium">
                  {selectedModalPkg.destination || selectedModalPkg.route}
                </p>
              </div>
            </div>

            {/* Modal Body: All Tour Highlights */}
            <div className="p-5 max-h-[55vh] overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    All Tour Highlights ({parseTourHighlights(selectedModalPkg).length})
                  </h4>
                  <span className="text-[10.5px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Guaranteed Inclusions
                  </span>
                </div>
                <div className="space-y-2">
                  {parseTourHighlights(selectedModalPkg).map((hl: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                    >
                      <span className="text-emerald-500 font-bold text-sm shrink-0 mt-[-1px]">✓</span>
                      <span className="leading-relaxed font-medium">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 line-through block">{selectedModalPkg.originalPrice}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-900">{selectedModalPkg.price}</span>
                  <span className="text-[10px] text-slate-500">/ person</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/packages/${selectedModalPkg.slug}`}
                  onClick={() => setSelectedModalPkg(null)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors"
                >
                  Full Package
                </Link>
                <Link
                  href={`/customize?package=${selectedModalPkg.slug}`}
                  onClick={() => setSelectedModalPkg(null)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all"
                >
                  Customize Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
