import type { Metadata } from "next";
import Link from "next/link";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";

export const metadata: Metadata = {
  title: "About Us | Be My Traveller — India's Premier Custom Holiday Platform",
  description:
    "Learn about Be My Traveller — a custom experiential travel company built on 30+ years of combined expertise in India, Asia & Europe tour planning. Zero hidden charges. 100% tailor-made itineraries.",
};

export default function AboutPage() {
  const stats = [
    { value: "25,000+", label: "Happy Travellers" },
    { value: "500+", label: "Curated Itineraries" },
    { value: "80+", label: "Destinations" },
    { value: "4.9★", label: "Average Rating" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <BmtNavMenu variant="solid" />

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 px-4">
        <div className="mx-auto max-w-4xl space-y-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-300">
            🌍 India&apos;s Custom Travel Experts
          </span>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            About{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Be My Traveller
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-300">
            We are a modern, technology-driven travel company specialized in 100% customized holiday packages.
            Every itinerary we craft is built around <em>your</em> travel style, budget, and dream destinations.
          </p>
        </div>
      </section>

      <section className="bg-amber-500 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-black text-slate-950 sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-2 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Our Story</span>
            <h2 className="text-3xl font-black text-slate-900">Built by Travellers, for Travellers</h2>
          </div>
          <div className="prose prose-slate max-w-none space-y-5 text-sm leading-relaxed text-slate-600">
            <p>
              Be My Traveller was founded with a single mission: to make truly personalized travel accessible to every
              Indian family, couple, and group of friends. We recognized that most travel companies offer cookie-cutter
              packages that rarely fit anyone&apos;s real needs.
            </p>
            <p>
              Our platform combines <strong>deep local destination expertise</strong> with a <strong>technology-first
              approach</strong> — giving you real-time pricing, transparent cost breakdowns, and direct access to our
              expert destination specialists.
            </p>
            <p>
              We believe your holiday should be an investment in memories — not in hidden surcharges, overpriced hotels,
              or last-minute surprises. That&apos;s why every quote from Be My Traveller is <strong>server-authoritative,
              transparent, and fixed</strong>.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-black text-slate-900">Our Core Commitments</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "⚡", title: "Zero Hidden Charges", desc: "The price you see is exactly what you pay. Our pricing engine calculates every component transparently." },
              { icon: "🎯", title: "100% Customization", desc: "No fixed departures. No group tours. Every package is built around your travel dates, hotel preferences, and budget." },
              { icon: "🏨", title: "Verified Properties", desc: "Our team physically vets every hotel, houseboat, and resort we recommend before listing it on our platform." },
              { icon: "🛡️", title: "24/7 On-Trip Support", desc: "Your dedicated trip manager is available around the clock for any assistance during your holiday." },
              { icon: "📊", title: "Authoritative Pricing", desc: "Real-time server-side pricing including seasonal surcharges, room type upgrades, and tax calculations." },
              { icon: "🌍", title: "Expert Specialists", desc: "Each destination has a dedicated specialist who has personally travelled there and crafts itineraries from experience." },
            ].map((v) => (
              <div key={v.title} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-3xl">{v.icon}</span>
                <h3 className="font-bold text-slate-900">{v.title}</h3>
                <p className="text-xs leading-relaxed text-slate-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-2xl space-y-5">
          <h2 className="text-3xl font-black">Ready to Plan Your Dream Holiday?</h2>
          <p className="text-slate-400">
            Talk to our destination specialists today. First consultation is always free.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/customize"
              className="rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-400"
            >
              Build My Itinerary →
            </Link>
            <a
              href="tel:918091638090"
              className="rounded-xl border border-slate-700 px-8 py-3.5 text-sm font-bold text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
            >
              📞 24/7 Call +91 8091638090
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
