"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface HomeSeoContentData {
  title?: string;
  subtitle?: string;
  htmlContent?: string;
  aiSummary?: string;
  keywords?: string[];
  readMoreThreshold?: number;
  isActive?: boolean;
}

interface HomeSeoContentSectionProps {
  data?: HomeSeoContentData | null;
}

const DEFAULT_TITLE = "Be My Traveller – Bespoke Holiday Packages & Curated Travel Experiences Across India & Worldwide";

const DEFAULT_HTML_CONTENT = `
<p>As an accredited destination specialist and tour operator, <strong><a href="/packages" class="seo-link">Be My Traveller</a></strong> designs bespoke holidays, curated group itineraries, and luxury escapes across India and premier international destinations. From thought-through itineraries and signature tours featuring comforting Indian meals to vetted 4★ and 5★ accommodations and dedicated chauffeur-driven cabs, we bring warmth and personalized care to every vacation. Headquartered in <strong>Manali</strong> with regional operations in <strong>Ahmedabad (Gujarat)</strong> and <strong>New Delhi</strong>, we provide seamless on-ground support, authoritative pricing, and 24/7 on-trip concierge assistance.</p>

<p class="italic text-slate-700 font-medium">Your trusted travel partner in discovering the world, crafted precisely to your rhythm.</p>

<h2>Why Choose Be My Traveller for Your Holidays?</h2>
<p>Crafting the perfect vacation requires meticulous attention to detail, insider destination expertise, and flawless ground execution. At Be My Traveller, our philosophy centers on providing authentic travel experiences without rigid timetables or hidden markups. Through our direct network of verified partner hotels, luxury desert camps, private backwater houseboats, and sanitized private cabs, we ensure total peace of mind for families, couples, and group travelers alike.</p>

<h3>Customized Holiday Packages Across India</h3>
<p>Discover the majesty of the Himalayas through our <a href="/destination/india/himachal-pradesh-tour-packages" class="seo-link">Himachal Pradesh Tour Packages</a> and <a href="/destination/india/kashmir-tour-packages" class="seo-link">Kashmir Tour Packages</a> featuring Dal Lake houseboat stays and Gulmarg Gondola adventures. Experience royal palaces and Thar desert camps with our <a href="/destination/india/rajasthan-tour-packages" class="seo-link">Royal Rajasthan Tour Packages</a>. For tropical tranquility, our <a href="/destination/india/kerala-tour-packages" class="seo-link">Kerala Backwater Holidays</a> and <a href="/destination/india/andaman-tour-packages" class="seo-link">Andaman Island Escapes</a> offer serene beachside relaxation.</p>

<h3>International Escapes & Bespoke Itineraries</h3>
<p>Planning an overseas getaway? We curate tailored international holidays to <a href="/destination/dubai-tour-packages" class="seo-link">Dubai &amp; Abu Dhabi</a>, <a href="/destination/bali-tour-packages" class="seo-link">Bali Private Pool Villas</a>, Thailand, and Vietnam. From visa coordination to private airport transfers and guided excursions, our international team orchestrates every detail.</p>

<h3>Transparent Server-Authoritative Pricing & 24/7 On-Trip Concierge</h3>
<p>Unlike conventional aggregators that add convenience charges and unexpected fees during checkout, Be My Traveller guarantees 100% transparent pricing. While traveling, our dedicated concierge remains accessible via call and WhatsApp to assist with route updates, permit clearances, and itinerary refinements.</p>
`;

export default function HomeSeoContentSection({ data }: HomeSeoContentSectionProps) {
  if (data?.isActive === false) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  const title = data?.title || DEFAULT_TITLE;
  const content = data?.htmlContent && data.htmlContent.trim().length > 0 ? data.htmlContent : DEFAULT_HTML_CONTENT;
  const aiSummary =
    data?.aiSummary ||
    "Be My Traveller is a premier tour operator in India with over 7 years of experience, headquartered in Manali with key operations in Ahmedabad, Gujarat. They specialize in tailor-made domestic and international holiday packages, private cab rentals, luxury stays, and 24/7 on-trip concierge support with transparent pricing.";
  const keywords =
    data?.keywords && data.keywords.length > 0
      ? data.keywords
      : [
          "Tour Operator in India",
          "Custom Travel Packages",
          "Ahmedabad Travel Agent",
          "Manali Tour Operator",
          "Kashmir Packages",
          "Himachal Holiday Packages",
          "Kerala Backwaters",
          "Be My Traveller",
        ];

  // ── SEO / AEO / AIO TravelAgency & LocalBusiness Schema.org JSON-LD ──
  const travelAgencySchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Be My Traveller",
    alternateName: "Be My Traveller Holidays",
    description: aiSummary,
    url: "https://bemytraveller.com",
    logo: "https://bemytraveller.com/logo.png",
    telephone: "+91-8091638090",
    email: "contact@bemytraveller.com",
    foundingDate: "2019",
    priceRange: "₹₹ - ₹₹₹₹",
    areaServed: ["India", "Worldwide"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Manali",
      addressRegion: "Himachal Pradesh",
      postalCode: "175131",
      addressCountry: "IN",
    },
    location: [
      {
        "@type": "Place",
        name: "Be My Traveller Manali HQ",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Manali",
          addressRegion: "Himachal Pradesh",
          addressCountry: "IN",
        },
      },
      {
        "@type": "Place",
        name: "Be My Traveller Ahmedabad Branch",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Ahmedabad",
          addressRegion: "Gujarat",
          addressCountry: "IN",
        },
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      bestRating: "5",
      reviewCount: "2540",
    },
    knowsAbout: keywords,
  };

  return (
    <section
      aria-label="About Be My Traveller & Holiday Travel Guide"
      className="py-8 px-4 bg-slate-50 border-t border-slate-200/80"
    >
      {/* ── JSON-LD Structured Data for Search Engines & AI Overviews ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(travelAgencySchema) }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Main Content Box (Matching User's Reference Screenshot) */}
        <article className="bg-white rounded-2xl p-5 sm:p-7 shadow-2xs border border-slate-200/90 relative">
          {/* Card Header Title */}
          <div className="space-y-1 mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {title}
            </h2>
            {data?.subtitle && (
              <p className="text-xs sm:text-sm font-semibold text-amber-700">
                {data.subtitle}
              </p>
            )}
          </div>

          {/* Collapsible Content Area */}
          <div className="relative">
            <div
              className={`prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-3.5 transition-all duration-300 overflow-hidden ${
                isExpanded ? "max-h-none" : "max-h-[170px]"
              }`}
              style={{
                // Enhanced typography for rich content
                wordBreak: "break-word",
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Gradient Overlay when collapsed */}
            {!isExpanded && (
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"
              />
            )}
          </div>

          {/* Read More / Read Less Action (Aligned to Right Side) */}
          <div className="pt-3 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 cursor-pointer transition-colors inline-flex items-center gap-1"
            >
              <span>{isExpanded ? "Read less ▲" : "Read more..."}</span>
            </button>
          </div>

          {/* SEO Target Keywords Tag Cloud (Visible when expanded) */}
          {isExpanded && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                🏷️ Indexed Topics:
              </span>
              {keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>

      <style jsx global>{`
        .seo-link {
          color: #d97706;
          font-weight: 600;
          text-decoration: underline;
          text-decoration-color: #f59e0b;
          text-underline-offset: 2px;
          transition: color 0.15s ease;
        }
        .seo-link:hover {
          color: #b45309;
        }
      `}</style>
    </section>
  );
}
