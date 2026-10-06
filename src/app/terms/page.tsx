import type { Metadata } from "next";
import Link from "next/link";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";
import { getPageBySlug } from "@/domains/cms/pages.config";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("terms");
  return {
    title: page.seo?.metaTitle || "Terms of Service & Booking Agreement | Be My Traveller",
    description:
      page.seo?.metaDescription ||
      "Read the Terms & Conditions governing travel reservations, vehicle protocols, and platform usage with Be My Traveller.",
    keywords: page.seo?.keywords,
  };
}

export default async function TermsPage() {
  const page = await getPageBySlug("terms");

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* ── Transparent Navbar (Transitions to Solid White on Scroll) ── */}
      <BmtNavMenu variant="transparent" />

      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white -mt-[79px] pt-[124px] pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/15 px-3.5 py-1 text-xs font-bold text-sky-300">
            {page.badge || "📜 Verified Booking Terms & Agreement"}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {page.title}
          </h1>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
            {page.subtitle}
          </p>
        </div>
      </section>

      {/* ── Trust Summary Strip ── */}
      {page.stats && page.stats.length > 0 && (
        <section className="bg-slate-900 border-b border-slate-800 px-4 py-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {page.stats.map((s, idx) => (
              <div key={idx} className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-black text-amber-400">{s.value}</p>
                <p className="text-[11px] font-medium text-slate-300">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Main Legal Clauses Content ── */}
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-16">
        {page.sections && page.sections.length > 0 && (
          <div className="space-y-8">
            {page.sections.map((sec, idx) => (
              <section key={idx} className="space-y-3 pb-8 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2">
                  {sec.icon && <span className="text-lg">{sec.icon}</span>}
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">{sec.title}</h2>
                </div>
                {sec.subtitle && (
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">{sec.subtitle}</p>
                )}
                <div className="text-xs sm:text-sm leading-relaxed text-slate-600 whitespace-pre-line space-y-2">
                  {sec.content}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Cancellation Reference Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">Need details on refunds and cancellations?</h3>
            <p className="text-xs text-slate-600">
              Review our transparent, tiered cancellation slab table and date amendment policies.
            </p>
          </div>
          <Link
            href="/cancellation-policy"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shrink-0"
          >
            Cancellation Policy →
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <SiteFooter />
    </div>
  );
}
