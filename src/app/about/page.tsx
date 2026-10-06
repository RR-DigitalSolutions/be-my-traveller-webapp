import type { Metadata } from "next";
import Link from "next/link";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";
import { getPageBySlug } from "@/domains/cms/pages.config";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("about");
  return {
    title: page.seo?.metaTitle || "About Us | Be My Traveller — India's Premier Custom Holiday Platform",
    description:
      page.seo?.metaDescription ||
      "Learn about Be My Traveller — an experiential travel company dedicated to 100% tailor-made private tours, handpicked boutique stays, and authentic local discovery.",
    keywords: page.seo?.keywords,
  };
}

export default async function AboutPage() {
  const page = await getPageBySlug("about");

  const comparisonPoints = [
    {
      feature: "Itinerary Customization",
      bmt: "100% Personalized to your dates, pace & hotel choices",
      others: "Fixed departures or generic pre-packaged templates",
    },
    {
      feature: "Vehicle & Sightseeing",
      bmt: "Dedicated private sanitized cab with verified mountain driver",
      others: "Shared buses or unverified random taxi operators",
    },
    {
      feature: "Accommodations",
      bmt: "Physically audited boutique stays with mountain views & heating",
      others: "Unvetted budget hotels often far from city centers",
    },
    {
      feature: "On-Trip Support",
      bmt: "Dedicated 24/7 Concierge Manager via WhatsApp & phone",
      others: "Call center queues with slow escalation times",
    },
    {
      feature: "Price Transparency",
      bmt: "All-inclusive (GST, fuel, tolls, permits, driver allowances)",
      others: "Frequent unexpected on-ground surcharges",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* ── Transparent Navbar (Transitions to Solid White on Scroll) ── */}
      <BmtNavMenu variant="transparent" />

      {/* ── Hero Section with Background Overlay ── */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white -mt-[79px] pt-[124px] pb-20 px-4 overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <img
            src={page.heroImage || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80"}
            alt="Scenic Mountains"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-4 py-1.5 text-xs font-bold text-amber-300">
            {page.badge || "🌍 India's Custom Travel Architects"}
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {page.title}
          </h1>

          <p className="mx-auto max-w-3xl text-sm sm:text-base leading-relaxed text-slate-300">
            {page.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={page.heroCtaLink || "/packages"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/25 transition-all"
            >
              <span>{page.heroCtaText || "Explore Custom Packages"}</span>
              <span>→</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-700 transition-all"
            >
              <span>💬</span>
              <span>Speak to a Destination Specialist</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust Metrics Strip ── */}
      {page.stats && page.stats.length > 0 && (
        <section className="bg-slate-900 border-y border-slate-800 px-4 py-8 relative z-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {page.stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center justify-center gap-1.5">
                    {stat.icon && <span className="text-xl">{stat.icon}</span>}
                    <span>{stat.value}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Brand Narrative & Story ── */}
      {page.sections && page.sections.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto space-y-16">
            {page.sections.map((sec, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-2">
                  {sec.badge && (
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                      {sec.badge}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {sec.title}
                </h2>
                {sec.subtitle && (
                  <p className="text-sm font-semibold text-amber-600">{sec.subtitle}</p>
                )}
                <div className="text-sm sm:text-base leading-relaxed text-slate-600 whitespace-pre-line space-y-3">
                  {sec.content}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── The 6 Core Commitments & Guarantees (Highlights Grid) ── */}
      {page.highlights && page.highlights.length > 0 && (
        <section className="py-20 px-4 bg-slate-50 border-t border-slate-200">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">The BMT Guarantee</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Our Non-Negotiable Standards of Quality
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Every itinerary we deliver is backed by these six customer-first operating principles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {page.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Competitor Comparison Matrix (Why BMT Beats Traditional OTAs) ── */}
      <section className="py-20 px-4 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Clear Comparison</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Why Travelers Choose Be My Traveller
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              See how our experiential concierge approach compares with conventional mass-market tour portals.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4 sm:p-5">Feature</th>
                  <th className="p-4 sm:p-5 text-amber-300 font-bold">Be My Traveller (Private Concierge)</th>
                  <th className="p-4 sm:p-5 text-slate-400">Generic Portals &amp; Budget Operators</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {comparisonPoints.map((row, i) => (
                  <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-slate-900">{row.feature}</td>
                    <td className="p-4 sm:p-5 font-semibold text-emerald-800 bg-emerald-50/30">
                      <span className="inline-block mr-1.5 text-emerald-600">✓</span>
                      {row.bmt}
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">
                      <span className="inline-block mr-1.5 text-rose-500">✕</span>
                      {row.others}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Frequently Asked Questions ── */}
      {page.faqs && page.faqs.length > 0 && (
        <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Common Questions</span>
              <h2 className="text-2xl font-black text-slate-900">Everything You Need to Know</h2>
            </div>

            <div className="space-y-4">
              {page.faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-start gap-2">
                    <span className="text-amber-500 font-mono">Q.</span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── High-Converting CTA Banner ── */}
      <section className="bg-gradient-to-r from-[#0b1b36] via-slate-900 to-[#0b1b36] text-white py-16 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Your Next Chapter Starts Here</span>
          <h2 className="text-2xl sm:text-4xl font-black">
            Ready to Experience Truly Personalized Travel?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Tell our destination specialists where you want to go. We&apos;ll craft your custom quote within 2 business hours with zero hidden charges.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/packages"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all"
            >
              Browse Destinations &amp; Packages →
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all"
            >
              Contact Our 24/7 Desk
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <SiteFooter />
    </div>
  );
}
