import type { Metadata } from "next";
import Link from "next/link";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Be My Traveller",
  description: "Understand our cancellation, amendment, and refund policy for holiday packages booked with Be My Traveller.",
};

const cancellationTable = [
  { days: "45+ days before travel", charge: "Nil (Full Refund minus processing fee)" },
  { days: "30–44 days before travel", charge: "25% of total package cost" },
  { days: "15–29 days before travel", charge: "50% of total package cost" },
  { days: "7–14 days before travel", charge: "75% of total package cost" },
  { days: "0–6 days before travel / No Show", charge: "100% of total package cost (No Refund)" },
];

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <BmtNavMenu variant="solid" />

      <div className="bg-slate-900 px-4 py-14 text-center text-white">
        <h1 className="text-3xl font-black">Cancellation & Refund Policy</h1>
        <p className="mt-2 text-sm text-slate-400">Effective from August 2026</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-16">
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900">Cancellation Charges</h2>
          <p className="text-sm text-slate-600">
            All cancellations must be submitted in writing via email to <a href="mailto:cancel@bemytraveller.com" className="text-amber-600 hover:underline">cancel@bemytraveller.com</a> or WhatsApp. Charges are calculated from the date of receiving written notice:
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Notice Period</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Cancellation Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cancellationTable.map((row) => (
                  <tr key={row.days} className="transition-colors hover:bg-amber-50/50">
                    <td className="px-5 py-3.5 font-medium text-slate-700">{row.days}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.charge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">* A non-refundable booking processing fee of ₹500 applies to all cancellations.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900">Amendments to Bookings</h2>
          <div className="space-y-2 text-sm leading-relaxed text-slate-600">
            <p>Date changes, destination swaps, or hotel upgrades may be accommodated subject to availability. Amendment fees may apply:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Changes made 30+ days before travel: ₹1,000 amendment fee</li>
              <li>Changes made 15–29 days before travel: ₹2,500 amendment fee</li>
              <li>Changes made less than 15 days before travel: Subject to supplier terms and availability</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900">Refund Processing</h2>
          <div className="space-y-2 text-sm leading-relaxed text-slate-600">
            <p>Approved refunds are processed within <strong>7–14 working days</strong> to the original payment source (bank account, UPI, or credit card). Refund timelines may vary based on your bank&apos;s processing speed.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900">Force Majeure</h2>
          <div className="text-sm leading-relaxed text-slate-600">
            <p>In the event of natural disasters, government advisories, pandemic restrictions, or other force majeure events, Be My Traveller will work with you on travel credits, rescheduling, or partial refunds on a case-by-case basis.</p>
          </div>
        </section>

        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <span className="text-2xl">📞</span>
          <div>
            <p className="text-sm font-bold text-slate-900">Need to cancel or amend your booking?</p>
            <p className="mt-1 text-xs text-slate-600">Contact our support team immediately at <a href="tel:18002279779" className="font-bold text-amber-600 hover:underline">1800 22 7979</a> or email <a href="mailto:cancel@bemytraveller.com" className="font-bold text-amber-600 hover:underline">cancel@bemytraveller.com</a></p>
            <Link href="/contact" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900">
              Contact Support →
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
