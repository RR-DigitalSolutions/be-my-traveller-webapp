"use client";

import React from "react";
import Link from "next/link";

export interface AboutUsData {
  badge?: string;
  heading?: string;
  subheading?: string;
  story?: string;
  highlights?: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
  }>;
  stats?: Array<{
    id: string;
    number: string;
    label: string;
  }>;
  image?: string;
  experienceYears?: string;
  isActive?: boolean;
}

interface AboutUsSectionProps {
  data?: AboutUsData | null;
}

const DEFAULT_ABOUT: Required<AboutUsData> = {
  badge: "ABOUT BE MY TRAVELLER",
  heading: "Crafting Extraordinary Journeys Across India & Beyond",
  subheading: "Accredited tour operator and holiday specialist delivering bespoke itineraries, vetted luxury stays, and 24/7 on-trip concierge assistance.",
  story: "Headquartered in Manali with key regional desks in Ahmedabad (Gujarat) and New Delhi, Be My Traveller is a premier tour operator specializing in customized vacations. From thoughtful itineraries and signature tour packages with authentic Indian meals to verified 4★ and 5★ resort stays and private commercial cabs, we combine personalized high-touch service with seamless ground execution across the Himalayas, Southern backwaters, royal heritage circuits, and international escapes.",
  highlights: [
    {
      id: "h1",
      icon: "🏨",
      title: "Handpicked & Verified Stays",
      description: "Every hotel, resort, and houseboat is physically vetted for views, hygiene, and guest hospitality.",
    },
    {
      id: "h2",
      icon: "🚗",
      title: "Private Dedicated Cabs",
      description: "Clean, commercial-permit vehicles driven by polite chauffeurs trained in local mountain terrains.",
    },
    {
      id: "h3",
      icon: "🍲",
      title: "Signature Meals with Care",
      description: "Comforting, hygienic MAP buffet meals with authentic regional Indian flavors.",
    },
    {
      id: "h4",
      icon: "🛡️",
      title: "24/7 On-Trip Concierge",
      description: "Dedicated coordinators supporting arrival, sightseeing permits, check-ins, and departures.",
    },
  ],
  stats: [
    { id: "s1", number: "7+ Yrs", label: "Industry Experience" },
    { id: "s2", number: "25,000+", label: "Happy Travellers" },
    { id: "s3", number: "500+", label: "Curated Packages" },
    { id: "s4", number: "4.9 ★", label: "Customer Rating" },
  ],
  image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80",
  experienceYears: "7+",
  isActive: true,
};

export default function AboutUsSection({ data }: AboutUsSectionProps) {
  if (data?.isActive === false) return null;

  const about = {
    badge: data?.badge || DEFAULT_ABOUT.badge,
    heading: data?.heading || DEFAULT_ABOUT.heading,
    subheading: data?.subheading || DEFAULT_ABOUT.subheading,
    story: data?.story || DEFAULT_ABOUT.story,
    highlights: data?.highlights && data.highlights.length > 0 ? data.highlights : DEFAULT_ABOUT.highlights,
    stats: data?.stats && data.stats.length > 0 ? data.stats : DEFAULT_ABOUT.stats,
    image: data?.image || DEFAULT_ABOUT.image,
    experienceYears: data?.experienceYears || DEFAULT_ABOUT.experienceYears,
  };

  return (
    <section className="py-8 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Block (Full Width, No Half-Screen Restriction) */}
        <div className="w-full space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <span className="text-amber-600">★</span> {about.badge}
            </span>

            <div className="flex items-center gap-2">
              <Link
                href="/packages"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                Explore Packages →
              </Link>
              <a
                href="#custom-planner"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Custom Plan ✨
              </a>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight leading-tight w-full">
            {about.heading}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed w-full">
            {about.subheading}
          </p>
        </div>

        {/* Top Grid: Story narrative & Photo showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Narrative Overview (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Our Heritage &amp; Commitment to Travelers</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {about.story}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] font-semibold text-amber-800 flex-wrap">
              <span>📍 Operational Hubs:</span>
              <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 font-bold">Manali (HQ)</span>
              <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 font-bold">Ahmedabad (Gujarat)</span>
              <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 font-bold">New Delhi</span>
            </div>
          </div>

          {/* Right: Visual Showcase & Stats (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3">
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 h-44 sm:h-48 bg-slate-900 group">
              <img
                src={about.image}
                alt="Be My Traveller Experience"
                className="w-full h-full object-cover brightness-[0.92] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 shadow-md flex items-center gap-1">
                  <span>🏆</span> {about.experienceYears} Years of Trust
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-bold text-amber-300 italic line-clamp-1">
                  &ldquo;Curating seamless journeys you cherish for a lifetime.&rdquo;
                </p>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider block">
                  — The Be My Traveller Team
                </span>
              </div>
            </div>

            {/* Quick 4 Metrics Strip (2x2 on Mobile, 4-Cols on Desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {about.stats.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-white rounded-xl p-2.5 border border-slate-200 text-center shadow-3xs"
                >
                  <span className="text-sm sm:text-base font-black text-amber-600 block">
                    {stat.number}
                  </span>
                  <span className="text-[10px] text-slate-600 font-semibold block leading-tight mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Feature Pillars (Compact 4-Column Strip with No Wasted Space) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
          {about.highlights.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-3xs hover:border-amber-400 hover:shadow-xs transition-all flex items-start gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform border border-amber-200/60">
                {item.icon}
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
