"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface ReviewCard {
  id: string;
  name: string;
  location: string;
  destination: string;
  rating: number;
  review: string;
  date?: string;
}

const FALLBACK_REVIEWS: ReviewCard[] = [
  { id: "r1", name: "Ananya Sharma", location: "Mumbai", destination: "Himachal Pradesh", rating: 5, review: "Our Himachal trip with Be My Traveller was magical. The cab driver in Manali was polite, the river-facing resort was breathtaking, and the Rohtang Pass permits were arranged seamlessly.", date: "Sep 2026" },
  { id: "r2", name: "Rohan & Priya Mehta", location: "Bengaluru", destination: "Kerala", rating: 5, review: "We booked our honeymoon to Kerala through Be My Traveller. The Alleppey luxury houseboat chef prepared amazing authentic meals. Will definitely book Kashmir next winter!", date: "Aug 2026" },
  { id: "r3", name: "Vikramaditya Rao", location: "Hyderabad", destination: "Rajasthan", rating: 5, review: "Exceptional service. When our flight from Delhi was delayed, their support team immediately rescheduled our airport cab without extra charges. Highly recommended!", date: "Oct 2026" },
  { id: "r4", name: "Preethi & Suresh K.", location: "Chennai", destination: "Kashmir", rating: 5, review: "Kashmir was a dream come true! The Dal Lake houseboat was gorgeous, and the Gulmarg Gondola experience was unforgettable. Thank you Be My Traveller!", date: "Jul 2026" },
  { id: "r5", name: "Gaurav Malhotra", location: "Pune", destination: "Andaman", rating: 5, review: "Amazing value for money. The Andaman package included scuba diving, island hopping and ferry transfers - everything was perfectly coordinated. 10/10 would book again!", date: "Jun 2026" },
  { id: "r6", name: "Neha Joshi", location: "Jaipur", destination: "Dubai", rating: 5, review: "Our Dubai trip was organized flawlessly. Hotel in Downtown Dubai, Desert Safari with live entertainment, Burj Khalifa tickets - all included. A premium experience!", date: "May 2026" },
];

interface ReviewsCarouselProps {
  adminReviews?: ReviewCard[];
}

export default function ReviewsCarousel({ adminReviews }: ReviewsCarouselProps) {
  const [reviewsList, setReviewsList] = useState<ReviewCard[]>(adminReviews && adminReviews.length > 0 ? adminReviews : FALLBACK_REVIEWS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adminReviews && adminReviews.length > 0) {
      setReviewsList(adminReviews);
      return;
    }
    fetch("/api/v1/admin/homepage-content")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.content?.reviews) && data.content.reviews.length > 0) {
          const active = data.content.reviews.filter((r: any) => r.isActive !== false);
          if (active.length > 0) setReviewsList(active);
        }
      })
      .catch(() => {});
  }, [adminReviews]);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev >= reviewsList.length - 1 ? 0 : prev + 1));
  }, [reviewsList.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? reviewsList.length - 1 : prev - 1));
  }, [reviewsList.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-review-card]") as HTMLElement | null;
    if (!card) return;
    const cardW = card.offsetWidth + 20;
    track.style.transform = `translateX(-${currentIndex * cardW}px)`;
  }, [currentIndex]);

  return (
    <section className="py-10 px-4 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">Real Traveller Stories</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Loved by Explorers Worldwide</h2>
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="flex text-amber-500 text-sm">★★★★★</div>
            <span className="text-xs font-bold text-slate-700">4.9 / 5.0 Rating (4,500+ Verified Bookings)</span>
          </div>
        </div>

        <div className="overflow-hidden" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
          <div ref={trackRef} className="flex gap-5 transition-transform duration-500 ease-in-out" style={{ willChange: "transform" }}>
            {reviewsList.map((rev) => (
              <div key={rev.id} data-review-card="true" className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex-shrink-0 p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col">
                <div className="flex text-amber-500 text-sm">
                  {Array.from({ length: rev.rating }).map((_, i) => <span key={i}>★</span>)}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic flex-1">“{rev.review}”</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xs shrink-0">
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{rev.name}</p>
                      <p className="text-[10px] text-slate-500">{rev.location} · Travelled to {rev.destination}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">✓ Verified</span>
                    {rev.date && <span className="text-[9px] text-slate-400">{rev.date}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => { setIsAutoPlaying(false); prev(); }} className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-500 hover:text-amber-600 flex items-center justify-center transition-all cursor-pointer" aria-label="Previous review">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-1.5">
            {reviewsList.map((_, idx) => (
              <button key={idx} onClick={() => { setIsAutoPlaying(false); setCurrentIndex(idx); }} className={`rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex ? "w-5 h-2 bg-amber-500" : "w-2 h-2 bg-slate-300 hover:bg-slate-400"}`} aria-label={`Review ${idx + 1}`} />
            ))}
          </div>
          <button onClick={() => { setIsAutoPlaying(false); next(); }} className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-500 hover:text-amber-600 flex items-center justify-center transition-all cursor-pointer" aria-label="Next review">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}