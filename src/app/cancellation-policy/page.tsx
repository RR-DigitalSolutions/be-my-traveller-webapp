import type { Metadata } from "next";
import Link from "next/link";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";
import { getPageBySlug } from "@/domains/cms/pages.config";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("cancellation-policy");
  return {
    title: page.seo?.metaTitle || "Cancellation & Refund Policy | Be My Traveller",
    description:
      page.seo?.metaDescription ||
      "Understand Be My Traveller's transparent cancellation, amendment, and refund policy for holiday packages.",
    keywords: page.seo?.keywords,
  };
}

export default async function CancellationPolicyPage() {
  const page = await getPageBySlug("cancellation-policy");

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* ── Transparent Navbar (Turns Solid White on Scroll) ── */}
      <BmtNavMenu variant="transparent" />

      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white -mt-[79px] pt-[124px] pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1 text-xs font-bold text-emerald-300">
            {page.badge || "🛡️ Clear & Fair Booking Protection"}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {page.title}
          </h1>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
            {page.subtitle}
          </p>
        </div>
      </section>

      {/* ── Key Policy Guarantees Strip ── */}
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

      {/* ── Main Policy Content ── */}
      <div className="mx-auto max-w-4xl space-y-14 px-4 py-16">
        {/* Visual Refund Slabs Table */}
        {page.tableData && page.tableData.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Standard Refund Slabs Matrix
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated from the exact timestamp written cancellation notice is received.
                </p>
              </div>
              <span className="hidden sm:inline-block text-[11px] font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold">
                Direct Bank/UPI Transfer
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Cancellation Notice Period</th>
                    <th className="px-5 py-3.5">Refund Payable</th>
                    <th className="px-5 py-3.5 text-right">Fee Deduction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {page.tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-800">{row.label}</td>
                      <td className="px-5 py-3.5 font-semibold text-emerald-700">{row.value}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {row.badge || "Standard"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * A non-refundable processing fee of ₹500 applies to cover bank payment gateway transaction charges.
            </p>
          </section>
        )}

        {/* Narrative Policy Chapters */}
        {page.sections && page.sections.length > 0 && (
          <div className="space-y-10">
            {page.sections.map((sec, idx) => (
              <section key={idx} className="space-y-3 bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  {sec.icon && <span className="text-xl">{sec.icon}</span>}
                  <h2 className="text-lg font-black text-slate-900">{sec.title}</h2>
                </div>
                {sec.subtitle && (
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">{sec.subtitle}</p>
                )}
                <div className="text-xs sm:text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                  {sec.content}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* 3 Steps to Refund */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
          <h2 className="text-lg font-black text-slate-900">How to Submit a Cancellation Request</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="font-mono text-amber-600 font-bold text-sm">STEP 1</span>
              <h3 className="font-bold text-slate-900">Send Written Request</h3>
              <p className="text-slate-600">Email cancel@bemytraveller.com or WhatsApp your trip manager with booking ID.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="font-mono text-amber-600 font-bold text-sm">STEP 2</span>
              <h3 className="font-bold text-slate-900">Manager Review</h3>
              <p className="text-slate-600">Our operations team reviews hotel and cab terms and calculates exact eligible refund.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="font-mono text-amber-600 font-bold text-sm">STEP 3</span>
              <h3 className="font-bold text-slate-900">Direct Bank Credit</h3>
              <p className="text-slate-600">Refund credited to original bank/UPI source within 5 to 7 working days with bank ARN.</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        {page.faqs && page.faqs.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-900">Cancellation FAQs</h2>
            <div className="space-y-3">
              {page.faqs.map((faq, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-1.5 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{faq.question}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Immediate Support Alert Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">Need immediate help with a flight delay or emergency?</p>
            <p className="text-xs text-slate-600">
              Speak directly with our 24/7 on-trip operations concierge desk.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://wa.me/918091638090"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              <span>💬</span> WhatsApp Desk
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Support Center →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <SiteFooter />
    </div>
  );
}
