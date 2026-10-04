"use client";

import React, { useState } from "react";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

export interface HomeFaqsData {
  badge?: string;
  heading?: string;
  subheading?: string;
  items?: FaqItem[];
  isActive?: boolean;
}

interface HomeFaqsSectionProps {
  data?: HomeFaqsData | null;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Why should I book my holiday package with Be My Traveller?",
    answer: "Be My Traveller combines destination expertise with real-time authoritative pricing and dedicated 24/7 on-trip concierge support. We customize every itinerary, handpick verified 4★ and 5★ properties, assign experienced commercial chauffeurs with sanitized private cabs, and guarantee 100% transparent pricing with zero hidden surcharges.",
    category: "GENERAL",
    isActive: true,
    sortOrder: 0,
  },
  {
    id: "faq-2",
    question: "Can I customize the itinerary, hotel categories, and travel dates?",
    answer: "Yes, 100%! Every package on Be My Traveller is fully customizable. You can adjust hotel tiers (from Deluxe to 5★ Luxury), add or reduce nights, include special sightseeing (such as Rohtang Pass, Shikara rides, or desert camps), change meal plans (CP/MAP), or craft an outstation multi-city tour.",
    category: "CUSTOMIZATION",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "faq-3",
    question: "How does payment and booking confirmation work?",
    answer: "Booking is secure and flexible. You can confirm your reservation with an advance token deposit (20% to 30%). The remaining balance is payable in structured milestones prior to departure. You receive instant digital invoices and official hotel vouchers directly on WhatsApp and email.",
    category: "BOOKING",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "faq-4",
    question: "What is typically included in your holiday tour packages?",
    answer: "Standard packages include verified hotel accommodations, daily breakfast and dinner (MAP buffet plan), a dedicated private cab for all transfers and sightseeing as per itinerary, driver allowances, toll taxes, state permits, and fuel charges. Personal expenses and optional adventure activities are clearly itemized before booking.",
    category: "BOOKING",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "faq-5",
    question: "Do you arrange private airport/railway station cabs and outstation rentals?",
    answer: "Yes! We operate a fleet of sanitized commercial-permit vehicles including Sedans (Dzire, Etios), SUVs (Ertiga, Carens), Premium SUVs (Innova Crysta), Luxury vehicles, and 12/17/26-seater Maharaja Tempo Travellers. Drivers are commercially licensed and skilled in mountain routes.",
    category: "CABS",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "faq-6",
    question: "What is your cancellation and rescheduling policy?",
    answer: "We offer traveler-friendly policies including date rescheduling without penalty when requested in advance, credit shells, or refund calculations in accordance with partner hotel cancellation guidelines.",
    category: "CANCELLATION",
    isActive: true,
    sortOrder: 5,
  },
];

export default function HomeFaqsSection({ data }: HomeFaqsSectionProps) {
  if (data?.isActive === false) return null;

  const heading = data?.heading || "Frequently Asked Questions";
  const subheading =
    data?.subheading ||
    "Everything you need to know about planning, customizing, and booking your dream vacation with Be My Traveller.";
  const badge = data?.badge || "FREQUENTLY ASKED QUESTIONS";

  const allItems: FaqItem[] =
    data?.items && data.items.length > 0
      ? data.items.filter((item) => item.isActive !== false)
      : DEFAULT_FAQS;

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [openFaqId, setOpenFaqId] = useState<string | null>(allItems[0]?.id || "faq-1");

  const categories = [
    { key: "ALL", label: "All Questions" },
    { key: "GENERAL", label: "About BMT" },
    { key: "CUSTOMIZATION", label: "Customization" },
    { key: "BOOKING", label: "Booking & Payments" },
    { key: "CABS", label: "Cabs & Stays" },
    { key: "CANCELLATION", label: "Cancellations" },
  ];

  const filteredItems =
    activeCategory === "ALL"
      ? allItems
      : allItems.filter((i) => i.category.toUpperCase() === activeCategory);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  // ── SEO & AEO (Answer Engine Optimization) FAQPage Schema JSON-LD ──
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="py-8 px-4 bg-white border-t border-slate-200/80">
      {/* ── JSON-LD Structured Data for Google Rich Snippets & AI Overviews ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Heading, Category Filters & Quick Help (4 Cols) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <span>❓</span> {badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {heading}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {subheading}
              </p>
            </div>

            {/* Category Filter Pills (Compact Grid / Wrap) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Filter by Category
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const count =
                    cat.key === "ALL"
                      ? allItems.length
                      : allItems.filter((i) => i.category.toUpperCase() === cat.key).length;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeCategory === cat.key
                          ? "bg-amber-500 text-slate-950 shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] px-1 py-0.2 rounded-full ${
                          activeCategory === cat.key ? "bg-slate-950/20 text-slate-950" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compact Support Help Box */}
            <div className="p-4 rounded-xl bg-slate-950 text-white space-y-2.5 shadow-md">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>💬</span> Have another question?
                </h4>
                <p className="text-[11px] text-slate-300">
                  Our destination desk in Manali and Ahmedabad is available 7 days a week.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://wa.me/918091638090?text=Hello%20Be%20My%20Traveller%2C%20I%20have%20a%20question%20regarding%20my%20holiday."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] text-center transition-colors"
                >
                  WhatsApp Us
                </a>
                <a
                  href="tel:+918091638090"
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] text-center transition-colors"
                >
                  Call Desk
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Full-Width Accordion List (8 Cols) */}
          <div className="lg:col-span-8 space-y-2.5">
            {filteredItems.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-amber-400/90 bg-amber-50/20 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(item.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{item.question}</span>
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? "bg-amber-500 text-slate-950 rotate-180"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-0.5 text-xs text-slate-600 leading-relaxed border-t border-amber-100/60">
                      <p className="whitespace-pre-line">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
