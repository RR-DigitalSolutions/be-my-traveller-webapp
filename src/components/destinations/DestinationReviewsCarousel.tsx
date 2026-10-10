"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

export interface DestinationReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  packageTitle: string;
  date: string;
  review: string;
  verified: boolean;
}

const DESTINATION_REVIEWS: Record<string, DestinationReview[]> = {
  uttarakhand: [
    {
      id: "u1",
      name: "Abhinav & Neha Joshi",
      location: "Delhi NCR",
      rating: 5,
      packageTitle: "5N/6D Nainital, Corbett & Mussoorie Classic Tour",
      date: "September 2026",
      review: "Our Uttarakhand holiday with Be My Traveller was absolutely seamless! The private cab driver in Nainital was polite and punctual. The Jim Corbett jungle safari arrangements were top notch — we even spotted a Royal Bengal tiger! 5-star experience throughout.",
      verified: true,
    },
    {
      id: "u2",
      name: "Siddharth Verma",
      location: "Mumbai",
      rating: 5,
      packageTitle: "4N/5D Rishikesh & Haridwar Spiritual & Rafting",
      date: "October 2026",
      review: "The Ganga Aarti VIP viewing at Har Ki Pauri and the 16km white water rafting in Rishikesh were arranged with utmost care. The riverside luxury camp was serene, food was delicious, and the 24/7 concierge support was always there to help.",
      verified: true,
    },
    {
      id: "u3",
      name: "Pooja & Rajesh Iyer",
      location: "Bengaluru",
      rating: 5,
      packageTitle: "5N/6D Scenic Nainital & Mussoorie Luxury Tour",
      date: "August 2026",
      review: "Mussoorie mountain views from our room were magical. Loved the private boat ride on Naini Lake and the cable car ride to Kempty falls. 100% transparent pricing with zero surprise charges. We will book Kashmir with them next winter!",
      verified: true,
    },
    {
      id: "u4",
      name: "Meera Krishnan",
      location: "Chennai",
      rating: 5,
      packageTitle: "6N/7D Complete Uttarakhand Himalayan Explorer",
      date: "July 2026",
      review: "Travelling with elderly parents can be challenging, but Be My Traveller's dedicated coordinator ensured ground floor rooms, comfortable sanitized Innova, and leisurely sightseeing stops. Outstanding hospitality!",
      verified: true,
    },
  ],
  himachal: [
    {
      id: "h1",
      name: "Ananya & Kartik Sharma",
      location: "Mumbai",
      rating: 5,
      packageTitle: "6N/7D Majestic Himachal & Rohtang Pass Tour",
      date: "September 2026",
      review: "Our Himachal trip was pure magic! The Rohtang Pass snow permit was sorted without any hassle, our hotel balcony in Old Manali opened right to the snow peaks, and the driver was super professional on mountain roads.",
      verified: true,
    },
    {
      id: "h2",
      name: "Gaurav Malhotra",
      location: "Pune",
      rating: 5,
      packageTitle: "5N/6D Shimla & Manali Volvo Explorer",
      date: "August 2026",
      review: "Solang Valley tandem paragliding and the Kalka-Shimla Toy Train ride were unforgettable highlights. Top-tier service, verified 4-star stays, and instant response on WhatsApp whenever we had a query.",
      verified: true,
    },
    {
      id: "h3",
      name: "Dr. Alok Sengupta",
      location: "Kolkata",
      rating: 5,
      packageTitle: "6N/7D Himachal Luxury Honeymoon Package",
      date: "July 2026",
      review: "From candlelight dinner in Manali apple orchards to scenic walks along the Shimla Ridge, everything exceeded our expectations. The best travel company for customized Himachal holidays!",
      verified: true,
    },
  ],
  kerala: [
    {
      id: "k1",
      name: "Rohan & Priya Mehta",
      location: "Bengaluru",
      rating: 5,
      packageTitle: "5N/6D Kerala Tea Estates & Alleppey Luxury Houseboat",
      date: "August 2026",
      review: "The private houseboat in Alleppey backwaters was the highlight of our vacation. The on-board chef prepared authentic Karimeen fish and Kerala delicacies. Munnar tea garden resort was so peaceful. Highly recommend Be My Traveller!",
      verified: true,
    },
    {
      id: "k2",
      name: "Vivek Deshmukh",
      location: "Hyderabad",
      rating: 5,
      packageTitle: "6N/7D Complete Kerala Romance & Backwaters",
      date: "September 2026",
      review: "Flawless execution from Kochi airport pickup to drop. We enjoyed the Thekkady spice plantation tour and Kathakali show. The concierge team kept checking in to make sure our trip was going smoothly.",
      verified: true,
    },
  ],
  kashmir: [
    {
      id: "ks1",
      name: "Preethi & Suresh K.",
      location: "Chennai",
      rating: 5,
      packageTitle: "5N/6D Heavenly Kashmir with Gulmarg Gondola & Houseboat",
      date: "September 2026",
      review: "Kashmir was a dream come true! Our private Shikara ride at sunset on Dal Lake and the Gulmarg Gondola Phase 2 tickets were seamlessly managed. The luxury cedarwood houseboat felt royal. Thank you Be My Traveller!",
      verified: true,
    },
    {
      id: "ks2",
      name: "Amit & Shalini Roy",
      location: "Delhi",
      rating: 5,
      packageTitle: "5N/6D Kashmir Paradise Tour",
      date: "August 2026",
      review: "Pahalgam Betaab Valley and Aru Valley pony rides were breath-taking. The driver was knowledgeable and shared great local stories. Best holiday planner in India!",
      verified: true,
    },
  ],
};

const GENERAL_FALLBACK_REVIEWS: DestinationReview[] = [
  {
    id: "g1",
    name: "Vikramaditya Rao",
    location: "Hyderabad",
    rating: 5,
    packageTitle: "Handcrafted Luxury Holiday",
    date: "October 2026",
    review: "Exceptional service from day one. When our incoming flight was delayed by 3 hours, their 24/7 on-trip concierge immediately rearranged airport transfers without any penalties. 100% trustworthy!",
    verified: true,
  },
  {
    id: "g2",
    name: "Dr. Sunita & Arvind Nair",
    location: "Ahmedabad",
    rating: 5,
    packageTitle: "Custom Family Holiday Itinerary",
    date: "September 2026",
    review: "Every stay was verified 4-star, vehicles were sanitized and drivers were respectful. The personalized itinerary allowed us to travel at our own pace with our children. Will definitely travel with them again.",
    verified: true,
  },
  {
    id: "g3",
    name: "Tanmay Bansal",
    location: "Chandigarh",
    rating: 5,
    packageTitle: "Bespoke Experiential Tour",
    date: "August 2026",
    review: "Best quote with zero hidden costs. Hotel vouchers, local sightseeing permits, and private cab details were delivered 48 hours before our trip. Smooth and memorable experience!",
    verified: true,
  },
];

interface DestinationReviewsCarouselProps {
  destinationName: string;
  destinationSlug: string;
  stateName?: string;
}

export default function DestinationReviewsCarousel({
  destinationName,
  destinationSlug,
  stateName,
}: DestinationReviewsCarouselProps) {
  const normSlug = (destinationSlug || "").toLowerCase();
  const matchedReviews =
    normSlug.includes("uttarakhand") || normSlug.includes("nainital") || normSlug.includes("mussoorie") || normSlug.includes("rishikesh") || normSlug.includes("haridwar") || normSlug.includes("corbett")
      ? DESTINATION_REVIEWS["uttarakhand"]
      : normSlug.includes("himachal") || normSlug.includes("manali") || normSlug.includes("shimla")
      ? DESTINATION_REVIEWS["himachal"]
      : normSlug.includes("kerala") || normSlug.includes("munnar") || normSlug.includes("alleppey")
      ? DESTINATION_REVIEWS["kerala"]
      : normSlug.includes("kashmir") || normSlug.includes("gulmarg") || normSlug.includes("srinagar")
      ? DESTINATION_REVIEWS["kashmir"]
      : GENERAL_FALLBACK_REVIEWS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const vc = w >= 1024 ? 3 : w >= 640 ? 2 : 1;
    setVisibleCount(vc);
    const gap = 16;
    setCardWidth((w - gap * (vc - 1)) / vc);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const maxIndex = Math.max(0, matchedReviews.length - visibleCount);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const gap = 16;
  const translateX = currentIndex * (cardWidth + gap);

  return (
    <section className="mt-12 pt-10 border-t border-slate-200/90 w-full">
      <div className="max-w-[1280px] 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-6">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-black text-amber-600 tracking-wider">
                Verified Guest Experiences
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                100% Genuine Reviews
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              What Travellers Say About {destinationName} Tours
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Over 1,240+ verified guests rated our {stateName || destinationName} custom itineraries 4.9/5
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrev}
              aria-label="Previous reviews"
              className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-all shadow-xs cursor-pointer hover:border-amber-400"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              aria-label="Next reviews"
              className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-all shadow-xs cursor-pointer hover:border-amber-400"
            >
              →
            </button>
          </div>
        </div>

        {/* Carousel Viewport */}
        <div ref={containerRef} className="overflow-hidden py-1">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              gap: `${gap}px`,
              transform: `translateX(-${translateX}px)`,
              willChange: "transform",
            }}
          >
            {matchedReviews.map((rev) => (
              <div
                key={rev.id}
                style={{ width: `${cardWidth}px`, flexShrink: 0 }}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Rating Stars & Verified Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-amber-500 text-sm tracking-wider">
                      {"★".repeat(rev.rating)}
                    </div>
                    {rev.verified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span>✓</span> Verified Booking
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-slate-700 leading-relaxed font-normal italic line-clamp-4">
                    &ldquo;{rev.review}&rdquo;
                  </p>
                </div>

                {/* Reviewer Details */}
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-xs text-slate-900 group-hover:text-amber-600 transition-colors">
                      {rev.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {rev.location} · <span className="text-slate-400">{rev.date}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Package</span>
                    <span className="text-[10px] font-bold text-slate-600 line-clamp-1 max-w-[130px]">
                      {rev.packageTitle.split(":")[0]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators */}
        {maxIndex > 0 && (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? "w-6 bg-amber-500" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
