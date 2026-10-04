"use client";

import { useState, useEffect } from "react";

export interface WhyBookPoint {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

export interface WhyBookImages {
  img1: string;
  img2: string;
  img3: string;
  img4: string;
}

const DEFAULT_POINTS: WhyBookPoint[] = [
  {
    id: "wp-1",
    icon: "⚡",
    title: "Authoritative Pricing & Zero Hidden Fees",
    description: "Dynamic real-time calculations for seasonal dates, meal plans, and room upgrades. The exact price you see is what you pay — zero surprise charges at checkout.",
    color: "amber",
  },
  {
    id: "wp-2",
    icon: "🎯",
    title: "100% Tailored & Flexible Itineraries",
    description: "Every holiday is customized to your preferences. Modify hotel categories, adjust trip pacing, add adventure sports, and enjoy private transfers on your schedule.",
    color: "blue",
  },
  {
    id: "wp-3",
    icon: "🔒",
    title: "Booking Security & Easy Rescheduling",
    description: "Travel with complete confidence. Structured advance token payments, official hotel vouchers, and traveler-friendly policies with penalty-free date adjustments.",
    color: "emerald",
  },
  {
    id: "wp-4",
    icon: "🏔️",
    title: "Direct Local Fleets & Zero Middlemen",
    description: "Our dedicated regional desks in Manali, Ahmedabad, and New Delhi connect you directly to sanitized commercial cabs and partner properties with no intermediary markups.",
    color: "purple",
  },
];

const DEFAULT_IMAGES: WhyBookImages = {
  img1: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop&q=80",
  img2: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&auto=format&fit=crop&q=80",
  img3: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
  img4: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80",
};

const COLOR_MAP: Record<string, string> = {
  amber: "bg-amber-500/10 text-amber-600 border-amber-200/60",
  blue: "bg-blue-500/10 text-blue-600 border-blue-200/60",
  emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-200/60",
  purple: "bg-purple-500/10 text-purple-600 border-purple-200/60",
};

interface WhyBookSectionProps {
  adminPoints?: WhyBookPoint[];
  adminImages?: WhyBookImages;
}

export default function WhyBookSection({ adminPoints, adminImages }: WhyBookSectionProps) {
  const [points, setPoints] = useState<WhyBookPoint[]>(adminPoints && adminPoints.length > 0 ? adminPoints : DEFAULT_POINTS);
  const [images, setImages] = useState<WhyBookImages>(adminImages || DEFAULT_IMAGES);
  const [heading, setHeading] = useState("Why Book with Be My Traveller?");
  const [subheading, setSubheading] = useState("We combine server-authoritative transparent pricing with direct local ground operations and guaranteed booking protection.");
  const [trustBadge, setTrustBadge] = useState("TRANSPARENT · CUSTOMIZED · GUARANTEED");
  const [activePoint, setActivePoint] = useState(0);

  useEffect(() => {
    if (adminPoints && adminPoints.length > 0) return;
    fetch("/api/v1/admin/homepage-content")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.content?.whyBook) {
          const wb = data.content.whyBook;
          if (wb.heading) setHeading(wb.heading);
          if (wb.subheading) setSubheading(wb.subheading);
          if (wb.trustBadge) {
            // If old trust badge mentions duplicate 25k travellers, modernize it
            if (wb.trustBadge.includes("25,000")) {
              setTrustBadge("TRANSPARENT · CUSTOMIZED · GUARANTEED");
            } else {
              setTrustBadge(wb.trustBadge);
            }
          }
          if (Array.isArray(wb.points) && wb.points.length > 0) {
            const active = wb.points.filter((p: any) => p.isActive !== false);
            if (active.length > 0) {
              // Sanitize any legacy duplicate points from old saves
              const sanitized = active.map((pt: any) => {
                if (pt.title?.includes("Verified 4★") || pt.title?.includes("Verified 4*")) {
                  return DEFAULT_POINTS[2]; // Booking Security
                }
                if (pt.title?.includes("Concierge")) {
                  return DEFAULT_POINTS[3]; // Direct Local Fleets
                }
                return pt;
              });
              setPoints(sanitized);
            }
          }
          if (wb.images) {
            setImages((prev) => ({
              img1: wb.images.img1 || prev.img1,
              img2: wb.images.img2 || prev.img2,
              img3: wb.images.img3 || prev.img3,
              img4: wb.images.img4 || prev.img4,
            }));
          }
        }
      })
      .catch(() => {});
  }, [adminPoints]);

  return (
    <section className="py-8 sm:py-12 px-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <span className="text-amber-600">★</span> {trustBadge}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          {heading}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed px-2">
          {subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left: Distinct Key Booking Points (7 Cols on large screen) */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-3.5">
          {points.map((point, idx) => {
            const isActive = activePoint === idx;
            return (
              <button
                key={point.id || idx}
                type="button"
                onClick={() => setActivePoint(idx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40"
                    : "bg-slate-50 border-slate-200/90 hover:border-amber-300 hover:bg-white"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-3.5">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 transition-colors border ${
                      isActive ? COLOR_MAP[point.color] || COLOR_MAP.amber : "bg-white border-slate-200 text-slate-500"
                    }`}
                  >
                    {point.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-bold text-xs sm:text-sm transition-colors ${
                        isActive ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {point.title}
                    </h3>
                    <p
                      className={`text-[11px] sm:text-xs mt-1 leading-relaxed transition-colors ${
                        isActive ? "text-slate-600" : "text-slate-500"
                      }`}
                    >
                      {point.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: 4-Image Collage (6 Cols on large screen, balanced mobile heights) */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="rounded-xl sm:rounded-2xl overflow-hidden h-36 sm:h-44 lg:h-52 group border border-slate-200 shadow-2xs">
            <img
              src={images.img1}
              alt="Himalayan Mountain Holidays"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
          <div className="rounded-xl sm:rounded-2xl overflow-hidden h-36 sm:h-44 lg:h-52 group border border-slate-200 shadow-2xs">
            <img
              src={images.img2}
              alt="Coastal & Island Vacations"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
          <div className="rounded-xl sm:rounded-2xl overflow-hidden h-36 sm:h-44 lg:h-52 group border border-slate-200 shadow-2xs">
            <img
              src={images.img3}
              alt="Heritage & Cultural Circuits"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
          <div className="rounded-xl sm:rounded-2xl overflow-hidden h-36 sm:h-44 lg:h-52 group relative border border-slate-200 shadow-2xs">
            <img
              src={images.img4}
              alt="Curated Travel Experiences"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-2.5 sm:p-3.5">
              <div className="text-white">
                <div className="text-[11px] sm:text-xs font-black text-amber-300 leading-snug">
                  Bespoke Journeys Made Effortless
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-slate-200 font-medium leading-tight mt-0.5">
                  Direct fleets · Transparent pricing · Guaranteed care
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}