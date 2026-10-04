"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

export interface PackageCard {
  id: string;
  slug: string;
  title: string;
  destination: string;
  nights: string;
  originalPrice: string;
  price: string;
  discount: string;
  rating: number;
  reviews: number;
  inclusions: string[];
  img: string;
  tag: string;
}

const FALLBACK_PACKAGES: PackageCard[] = [
  { id: "pkg-1", slug: "6-nights-himachal-manali-tour", title: "6 Nights 7 Days Majestic Himachal & Rohtang Pass Tour", destination: "Shimla (2N) · Manali (3N) · Chandigarh (1N)", nights: "6 Nights / 7 Days", originalPrice: "₹38,000", price: "₹29,999", discount: "21% OFF", rating: 4.9, reviews: 184, inclusions: ["4★ Hotel Stay", "Private AC Cab", "Daily Breakfast & Dinner", "Solang Valley Sightseeing"], img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80", tag: "Bestseller" },
  { id: "pkg-2", slug: "5-nights-kashmir-gulmarg-tour", title: "5 Nights 6 Days Heavenly Kashmir with Gulmarg Gondola", destination: "Srinagar (2N) · Gulmarg (1N) · Pahalgam (2N)", nights: "5 Nights / 6 Days", originalPrice: "₹42,000", price: "₹33,500", discount: "20% OFF", rating: 4.9, reviews: 210, inclusions: ["Dal Lake Houseboat", "Gulmarg Gondola Ride", "Pahalgam Valley Tour", "Shikara Ride"], img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80", tag: "Snow Favorite" },
  { id: "pkg-3", slug: "5-nights-kerala-backwaters-luxury", title: "5 Nights 6 Days Kerala Romance & Backwaters Luxury", destination: "Cochin · Munnar (2N) · Thekkady (1N) · Alleppey (1N)", nights: "5 Nights / 6 Days", originalPrice: "₹36,000", price: "₹27,999", discount: "22% OFF", rating: 4.8, reviews: 156, inclusions: ["Private Houseboat", "Tea Estate Resort", "Kathakali Show", "Periyar Boat Safari"], img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80", tag: "Couple Special" },
  { id: "pkg-4", slug: "5-nights-royal-rajasthan-heritage", title: "5 Nights 6 Days Royal Forts & Palaces of Rajasthan", destination: "Jaipur (2N) · Jodhpur (1N) · Udaipur (2N)", nights: "5 Nights / 6 Days", originalPrice: "₹35,000", price: "₹26,500", discount: "24% OFF", rating: 4.8, reviews: 132, inclusions: ["Heritage Haveli Stay", "Lake Pichola Boat", "Desert Camel Safari", "Chokhi Dhani Dinner"], img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80", tag: "Heritage" },
  { id: "pkg-5", slug: "4-nights-andaman-beach-luxury", title: "4 Nights 5 Days Andaman Islands Beach & Diving Escape", destination: "Port Blair · Havelock Island · Neil Island", nights: "4 Nights / 5 Days", originalPrice: "₹44,000", price: "₹34,999", discount: "20% OFF", rating: 4.7, reviews: 98, inclusions: ["Beach Resort Stay", "Scuba Diving", "Glass Bottom Boat", "Radhanagar Beach Visit"], img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop&q=80", tag: "Beach Paradise" },
  { id: "pkg-6", slug: "6-nights-dubai-abu-dhabi-premium", title: "6 Nights 7 Days Dubai & Abu Dhabi Premium Experience", destination: "Dubai (4N) · Abu Dhabi (2N)", nights: "6 Nights / 7 Days", originalPrice: "₹85,000", price: "₹68,999", discount: "19% OFF", rating: 4.9, reviews: 178, inclusions: ["5★ Hotel Stay", "Desert Safari BBQ", "Burj Khalifa 124th Floor", "Visa Assistance"], img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80", tag: "Visa Included" },
];

interface BestPackagesCarouselProps {
  onEnquire: (packageTitle: string) => void;
  adminPackages?: PackageCard[];
}

// Gap between cards in px
const CARD_GAP = 20;

function getVisibleCount(width: number): number {
  if (width >= 1024) return 4;
  if (width >= 640) return 2;
  return 1;
}

export default function BestPackagesCarousel({ onEnquire, adminPackages }: BestPackagesCarouselProps) {
  const [packagesList, setPackagesList] = useState<PackageCard[]>(
    adminPackages && adminPackages.length > 0 ? adminPackages : FALLBACK_PACKAGES
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  // Pixel-precise measurements
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  // ResizeObserver: measure container, derive exact card width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = (w: number) => {
      const vc = getVisibleCount(w);
      setVisibleCount(vc);
      // card width = (container - total gap) / visible cards
      const cw = (w - CARD_GAP * (vc - 1)) / vc;
      setCardWidth(cw);
    };
    const ro = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    ro.observe(el);
    // Initial measure
    measure(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Fetch admin packages
  useEffect(() => {
    if (adminPackages && adminPackages.length > 0) {
      setPackagesList(adminPackages);
      setCurrentIndex(0);
      return;
    }
    fetch("/api/v1/admin/homepage-content")
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.content?.featuredPackages) && data.content.featuredPackages.length > 0) {
          const active = data.content.featuredPackages.filter((p: any) => p.isActive !== false);
          if (active.length > 0) { setPackagesList(active); setCurrentIndex(0); }
        }
      })
      .catch(() => {});
  }, [adminPackages]);

  // maxIndex: never let last position show empty slots
  const maxIndex = Math.max(0, packagesList.length - visibleCount);

  const next = useCallback(() => setCurrentIndex(p => (p >= maxIndex ? 0 : p + 1)), [maxIndex]);
  const prev = useCallback(() => setCurrentIndex(p => (p <= 0 ? maxIndex : p - 1)), [maxIndex]);

  // Clamp currentIndex when list changes
  useEffect(() => setCurrentIndex(p => Math.min(p, maxIndex)), [maxIndex]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [isAutoPlaying, next]);

  // Pixel-perfect translation: each step = (cardWidth + gap)
  const translateX = currentIndex * (cardWidth + CARD_GAP);

  return (
    <section className="py-10 px-4 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">Verified Itineraries</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">Best-Selling Holiday Packages</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Complete packages with confirmed hotels, private transfers, meals and activities.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => { setIsAutoPlaying(false); prev(); }} className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-600 hover:text-amber-600 flex items-center justify-center transition-all shadow-sm cursor-pointer" aria-label="Previous">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => { setIsAutoPlaying(false); next(); }} className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-600 hover:text-amber-600 flex items-center justify-center transition-all shadow-sm cursor-pointer" aria-label="Next">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
            <Link href="/packages" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 whitespace-nowrap">View All 100+ →</Link>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={containerRef}
          className="overflow-hidden"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              gap: `${CARD_GAP}px`,
              transform: `translateX(-${translateX}px)`,
              willChange: "transform",
            }}
          >
            {packagesList.map((pkg) => (
              <div
                key={pkg.id}
                className="flex-shrink-0"
                style={{
                  // Pixel-exact width; fallback CSS calc shown before measurement fires
                  width: cardWidth > 0
                    ? `${cardWidth}px`
                    : `calc((100% - ${CARD_GAP * (visibleCount - 1)}px) / ${visibleCount})`,
                }}
              >
                <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all flex flex-col group h-full">
                  <Link href={`/packages/${pkg.slug}`} className="block">
                    <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                      <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950">{pkg.tag}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white">{pkg.discount}</span>
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between bg-slate-950/75 backdrop-blur-md rounded-lg px-2.5 py-1 text-white text-xs">
                        <span>🕒 {pkg.nights}</span>
                        <span className="text-amber-400 font-bold">★ {pkg.rating}</span>
                      </div>
                    </div>
                  </Link>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <Link href={`/packages/${pkg.slug}`}><h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">{pkg.title}</h3></Link>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{pkg.destination}</p>
                      <div className="mt-2.5 space-y-1">
                        {pkg.inclusions.slice(0, 3).map((inc) => (
                          <div key={inc} className="flex items-center gap-1.5 text-[11px] text-slate-600"><span className="text-emerald-500 font-bold shrink-0">✓</span>{inc}</div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 line-through block">{pkg.originalPrice}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-slate-900">{pkg.price}</span>
                          <span className="text-[10px] text-slate-500">/ person</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link href={`/packages/${pkg.slug}`} className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs">Details</Link>
                        <button type="button" onClick={() => onEnquire(pkg.title)} className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer">Quote</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators — only valid stop positions */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setIsAutoPlaying(false); setCurrentIndex(idx); }}
              className={`rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex ? "w-5 h-2 bg-amber-500" : "w-2 h-2 bg-slate-300 hover:bg-slate-400"}`}
              aria-label={`Package group ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}