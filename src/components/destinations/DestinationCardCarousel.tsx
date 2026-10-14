"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";

export interface DestinationCardItem {
  name: string;
  slug: string;
  url: string;
  count: string;
  img: string;
  price: string;
  tag?: string;
  region?: string;
}

interface DestinationCardCarouselProps {
  title: string;
  subtitle?: string;
  badge?: string;
  items: DestinationCardItem[];
}

export default function DestinationCardCarousel({
  title,
  subtitle,
  badge = "Destinations",
  items,
}: DestinationCardCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-3.5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Header & Controls */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-extrabold text-amber-600 tracking-wider">
              {badge}
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {items.length} Options
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Desktop Carousel Arrow Navigation */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              canScrollLeft
                ? "bg-white border-slate-300 text-slate-800 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 shadow-xs"
                : "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
            }`}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              canScrollRight
                ? "bg-white border-slate-300 text-slate-800 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 shadow-xs"
                : "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
            }`}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative -mx-2 px-2">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2 pt-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item) => (
            <Link
              key={item.slug}
              href={item.url}
              className="group w-[230px] sm:w-[260px] shrink-0 snap-start rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-500/60 transition-all flex flex-col"
            >
              {/* Clean Image View with only top tours badge */}
              <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/85 text-amber-400 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs shadow-xs">
                  {item.count}
                </span>
              </div>

              {/* Text info on White Strip */}
              <div className="p-3.5 space-y-1.5 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="text-xs text-amber-600 font-extrabold group-hover:translate-x-1 transition-transform shrink-0">
                      →
                    </span>
                  </div>
                  {item.tag && (
                    <p className="text-[10px] text-slate-500 font-medium line-clamp-1 leading-snug mt-0.5" title={item.tag}>
                      {item.tag}
                    </p>
                  )}
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Starting from</span>
                  <strong className="text-slate-900 font-extrabold">{item.price}</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
