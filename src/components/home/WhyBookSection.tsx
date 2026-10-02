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
  { id: "wp-1", icon: "⚡", title: "Authoritative Pricing", description: "Real-time calculations for season surcharges, room upgrades, and taxes. No hidden surcharges at checkout.", color: "amber" },
  { id: "wp-2", icon: "🏨", title: "Verified 4★ & 5★ Stays", description: "Every hotel, resort, and houseboat is physically vetted for hygiene, scenic views, and hospitality standards.", color: "blue" },
  { id: "wp-3", icon: "🛡️", title: "24/7 On-Trip Concierge", description: "Dedicated trip managers support you through arrival, hotel check-in, permits, and sightseeing at every step.", color: "emerald" },
  { id: "wp-4", icon: "🎯", title: "100% Customized Trips", description: "Swap hotels, add private transfers, change meal plans, and include adventure sports according to your schedule.", color: "purple" },
];

const DEFAULT_IMAGES: WhyBookImages = {
  img1: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop&q=80",
  img2: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&auto=format&fit=crop&q=80",
  img3: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
  img4: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80",
};

const COLOR_MAP: Record<string, string> = {
  amber: "bg-amber-500/10 text-amber-600",
  blue: "bg-blue-500/10 text-blue-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
  purple: "bg-purple-500/10 text-purple-600",
};

interface WhyBookSectionProps {
  adminPoints?: WhyBookPoint[];
  adminImages?: WhyBookImages;
}

export default function WhyBookSection({ adminPoints, adminImages }: WhyBookSectionProps) {
  const [points, setPoints] = useState<WhyBookPoint[]>(adminPoints && adminPoints.length > 0 ? adminPoints : DEFAULT_POINTS);
  const [images, setImages] = useState<WhyBookImages>(adminImages || DEFAULT_IMAGES);
  const [heading, setHeading] = useState("Why Book with Be My Traveller?");
  const [subheading, setSubheading] = useState("We combine high-tech server-authoritative pricing with personalized high-touch destination expertise.");
  const [trustBadge, setTrustBadge] = useState("Trusted by 25,000+ Travellers");
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
          if (wb.trustBadge) setTrustBadge(wb.trustBadge);
          if (Array.isArray(wb.points) && wb.points.length > 0) {
            const active = wb.points.filter((p: any) => p.isActive !== false);
            if (active.length > 0) setPoints(active);
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
    <section className="py-12 px-4 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">{trustBadge}</span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{heading}</h2>
        <p className="text-xs sm:text-sm text-slate-500">{subheading}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: Key Points */}
        <div className="space-y-4">
          {points.map((point, idx) => (
            <button
              key={point.id}
              type="button"
              onClick={() => setActivePoint(idx)}
              className={`w-full text-left p-5 rounded-xl border transition-all duration-300 cursor-pointer ${activePoint === idx ? "bg-white border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40" : "bg-slate-50 border-slate-200 hover:border-amber-300 hover:bg-white"}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 transition-colors ${activePoint === idx ? COLOR_MAP[point.color] || COLOR_MAP.amber : "bg-slate-200/80 text-slate-500"}`}>
                  {point.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm transition-colors ${activePoint === idx ? "text-slate-900" : "text-slate-700"}`}>{point.title}</h3>
                  <p className={`text-xs mt-1 leading-relaxed transition-colors ${activePoint === idx ? "text-slate-600" : "text-slate-500"}`}>{point.description}</p>
                </div>
                {activePoint === idx && (
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { value: "25K+", label: "Happy Travellers" },
              { value: "500+", label: "Tour Packages" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="text-lg font-black text-amber-600">{stat.value}</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 4 Image Grid */}
        <div className="grid grid-cols-2 gap-3 h-full">
          <div className="rounded-2xl overflow-hidden h-52 lg:h-64 group">
            <img src={images.img1} alt="Travel experience 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
          <div className="rounded-2xl overflow-hidden h-52 lg:h-64 group">
            <img src={images.img2} alt="Travel experience 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
          <div className="rounded-2xl overflow-hidden h-52 lg:h-64 group">
            <img src={images.img3} alt="Travel experience 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
          <div className="rounded-2xl overflow-hidden h-52 lg:h-64 group relative">
            <img src={images.img4} alt="Travel experience 4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent flex items-end p-4">
              <div className="text-white">
                <div className="text-lg font-black">4.9 ★</div>
                <div className="text-[10px] font-medium text-slate-200">Avg. Client Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}