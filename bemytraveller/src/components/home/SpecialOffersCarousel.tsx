"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

export interface OfferItem {
  id: string;
  badge: string;
  validity: string;
  title: string;
  description: string;
  code: string;
  ctaText: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  textColor: string;
  buttonBg: string;
  buttonText: string;
  codeBg: string;
  codeBorder: string;
  codeText: string;
  enquiryName: string;
}

const OFFERS: OfferItem[] = [
  {
    id: "offer-festive",
    badge: "FESTIVE SPECIAL",
    validity: "Valid Till Dec 2026",
    title: "Flat ₹5,000 OFF on All Domestic Customized Tours",
    description:
      "Applicable on Kashmir, Himachal, Kerala, Andaman, and Rajasthan itineraries with min. 4 Nights.",
    code: "BMTFEST",
    ctaText: "Claim ₹5,000 OFF →",
    gradient: "from-amber-500 to-amber-600",
    badgeBg: "bg-slate-950",
    badgeText: "text-amber-400",
    textColor: "text-slate-950",
    buttonBg: "bg-slate-950 hover:bg-slate-900",
    buttonText: "text-amber-400",
    codeBg: "bg-slate-950/15",
    codeBorder: "border-slate-950/20",
    codeText: "text-slate-950",
    enquiryName: "Festive Offer (BMTFEST - ₹5,000 OFF)",
  },
  {
    id: "offer-earlybird",
    badge: "EARLY BIRD",
    validity: "Advance Bookings",
    title: "Flat 15% OFF on Himalayan & International Holidays",
    description:
      "Book 30 days in advance to unlock 15% discount on Bali, Dubai, Ladakh, and Sikkim packages.",
    code: "EARLYBIRD",
    ctaText: "Claim 15% OFF →",
    gradient: "from-slate-900 via-slate-800 to-slate-900",
    badgeBg: "bg-amber-500",
    badgeText: "text-slate-950",
    textColor: "text-white",
    buttonBg: "bg-amber-500 hover:bg-amber-400",
    buttonText: "text-slate-950",
    codeBg: "bg-slate-800",
    codeBorder: "border-slate-700",
    codeText: "text-amber-400",
    enquiryName: "Early Bird Offer (EARLYBIRD - 15% OFF)",
  },
  {
    id: "offer-honeymoon",
    badge: "HONEYMOON SPECIAL",
    validity: "Couples Only",
    title: "Complimentary Candlelight Dinner + Room Upgrade",
    description:
      "Free romantic dinner, floral bed decor, and honeymoon cake on all premium resort bookings.",
    code: "HONEYMOON5000",
    ctaText: "Unlock Inclusions →",
    gradient: "from-rose-500 via-rose-600 to-pink-600",
    badgeBg: "bg-white",
    badgeText: "text-rose-600",
    textColor: "text-white",
    buttonBg: "bg-white hover:bg-rose-50",
    buttonText: "text-rose-700",
    codeBg: "bg-white/20",
    codeBorder: "border-white/30",
    codeText: "text-white",
    enquiryName: "Honeymoon Special Inclusions Offer",
  },
  {
    id: "offer-group",
    badge: "GROUP & FAMILY",
    validity: "Min. 6 Travellers",
    title: "Get ₹8,000 OFF + Free Guided Sightseeing Tour",
    description:
      "Extra group savings on Rajasthan royal heritage circuits, Goa private beach villas, and Kerala backwaters.",
    code: "BMTGROUP",
    ctaText: "Claim Group Deal →",
    gradient: "from-emerald-600 via-teal-600 to-emerald-700",
    badgeBg: "bg-slate-950",
    badgeText: "text-emerald-400",
    textColor: "text-white",
    buttonBg: "bg-slate-950 hover:bg-slate-900",
    buttonText: "text-emerald-400",
    codeBg: "bg-white/15",
    codeBorder: "border-white/25",
    codeText: "text-white",
    enquiryName: "Group & Family Special (BMTGROUP - ₹8,000 OFF)",
  },
  {
    id: "offer-escape",
    badge: "WEEKEND ESCAPE",
    validity: "Friday-Sunday Stays",
    title: "Flat 20% Cashback + Free Breakfast & Spa Access",
    description:
      "Unwind with curated 2N/3D luxury boutique resort stays in Coorg, Wayanad, Rishikesh & Udaipur.",
    code: "ESCAPE20",
    ctaText: "Explore Escapes →",
    gradient: "from-indigo-600 via-purple-600 to-violet-700",
    badgeBg: "bg-amber-400",
    badgeText: "text-slate-950",
    textColor: "text-white",
    buttonBg: "bg-amber-400 hover:bg-amber-300",
    buttonText: "text-slate-950",
    codeBg: "bg-white/15",
    codeBorder: "border-white/25",
    codeText: "text-amber-300",
    enquiryName: "Weekend Luxury Escape (ESCAPE20 - 20% Cashback)",
  },
];

interface SpecialOffersCarouselProps {
  onClaimOffer: (enquiryName: string) => void;
}

export default function SpecialOffersCarousel({
  onClaimOffer,
}: SpecialOffersCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive items count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, OFFERS.length - visibleCount);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // 3-second auto-slide interval
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section
      className="py-8 px-4 max-w-7xl mx-auto w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Handpicked Offers Carousel"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-xs">
              🏷️
            </span>
            <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">
              Exclusive Travel Deals
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Handpicked Offers &amp; Instant Discounts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Limited-period seasonal savings on domestic tours, honeymoon specials, and adventure getaways.
          </p>
        </div>

        {/* Carousel Navigation & Status Indicators */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isPaused ? "Paused (Hovered)" : "Auto-sliding (3s)"}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevSlide}
              aria-label="Previous Offers"
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 flex items-center justify-center text-xs font-black shadow-xs transition-all cursor-pointer active:scale-90"
            >
              ❮
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Offers"
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 flex items-center justify-center text-xs font-black shadow-xs transition-all cursor-pointer active:scale-90"
            >
              ❯
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Track Container */}
      <div className="overflow-hidden relative rounded-2xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
          }}
        >
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="px-2.5 shrink-0"
              style={{ width: `${100 / visibleCount}%` }}
            >
              <div
                className={`relative h-full min-h-[230px] rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${offer.gradient} ${offer.textColor} overflow-hidden shadow-lg flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/10`}
              >
                {/* Background decorative ambient flare */}
                <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

                {/* Offer Content */}
                <div className="space-y-2.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase ${offer.badgeBg} ${offer.badgeText} shadow-xs`}
                    >
                      {offer.badge}
                    </span>
                    <span className="text-[11px] font-bold opacity-90">
                      {offer.validity}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black leading-tight">
                    {offer.title}
                  </h3>

                  <p className="text-xs opacity-85 font-medium leading-relaxed line-clamp-2">
                    {offer.description}
                  </p>
                </div>

                {/* Offer Action & Coupon Footer */}
                <div className="pt-4 mt-4 border-t border-current/15 flex items-center justify-between gap-2 relative z-10">
                  <button
                    type="button"
                    onClick={(e) => handleCopyCode(offer.code, e)}
                    title="Click to copy promo code"
                    className={`${offer.codeBg} ${offer.codeBorder} ${offer.codeText} px-3 py-1.5 rounded-xl border font-mono font-black text-xs tracking-wider flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer shadow-xs`}
                  >
                    <span>{copiedCode === offer.code ? "✓ COPIED" : offer.code}</span>
                    <span className="text-[10px] opacity-70">📋</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onClaimOffer(offer.enquiryName)}
                    className={`${offer.buttonBg} ${offer.buttonText} px-3.5 py-1.5 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer hover:shadow-lg`}
                  >
                    {offer.ctaText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Indicator Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === idx
                ? "w-7 bg-amber-500 shadow-xs shadow-amber-500/50"
                : "w-2 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
