import type { Metadata } from "next";
import Link from "next/link";

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

  const team = [
    { name: "Raman K Singh", role: "Founder & CEO", experience: "15+ Years in Travel Tech" },
    { name: "Destination Specialists", role: "Pan-India & International", experience: "Expert Planners" },
    { name: "Operations Team", role: "24/7 On-Trip Support", experience: "Your Holiday Partners" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            🌍 India&apos;s Custom Travel Experts
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            About{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Be My Traveller
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We are a modern, technology-driven travel company specialized in 100% customized holiday packages.
            Every itinerary we craft is built around <em>your</em> travel style, budget, and dream destinations.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-amber-500">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-black text-slate-950">{stat.value}</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">Our Story</span>
            <h2 className="text-3xl font-black text-slate-900">Built by Travellers, for Travellers</h2>
          </div>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-5 text-sm leading-relaxed">
            <p>
              Be My Traveller was founded with a single mission: to make truly personalized travel accessible to every
              Indian family, couple, and group of friends. We recognized that most travel companies offer cookie-cutter
              packages that rarely fit anyone&apos;s real needs.
            </p>
            <p>
              Our platform combines <strong>deep local destination expertise</strong> with a{" "}
              <strong>technology-first approach</strong> — giving you real-time pricing, transparent cost breakdowns, and
              direct access to our expert destination specialists.
            </p>
            <p>
              We believe your holiday should be an investment in memories — not in hidden surcharges, overpriced hotels,
              or last-minute surprises. That&apos;s why every quote from Be My Traveller is{" "}
              <strong>server-authoritative, transparent, and fixed</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Our Core Commitments</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "⚡", title: "Zero Hidden Charges", desc: "The price you see is exactly what you pay. Our PricingEngine calculates every component transparently." },
              { icon: "🎯", title: "100% Customization", desc: "No fixed departures. No group tours. Every package is built around your travel dates, hotel preferences, and budget." },
              { icon: "🏨", title: "Verified Properties", desc: "Our team physically vets every hotel, houseboat, and resort we recommend before listing it on our platform." },
              { icon: "🛡️", title: "24/7 On-Trip Support", desc: "Your dedicated trip manager is available around the clock for any assistance during your holiday." },
              { icon: "📊", title: "Authoritative Pricing", desc: "Real-time server-side pricing including seasonal surcharges, room type upgrades, and tax calculations." },
              { icon: "🌍", title: "Expert Specialists", desc: "Each destination has a dedicated specialist who has personally travelled there and crafts itineraries from experience." },
            ].map((v) => (
              <div key={v.title} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <span className="text-3xl">{v.icon}</span>
                <h3 className="font-bold text-slate-900">{v.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-slate-900 text-white text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-3xl font-black">Ready to Plan Your Dream Holiday?</h2>
          <p className="text-slate-400">
            Talk to our destination specialists today. First consultation is always free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/customize"
              className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-colors"
            >
              Build My Itinerary →
            </Link>
            <a
              href="tel:918091638090"
              className="px-8 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-bold text-sm transition-colors"
            >
              📞 24/7 Call +91 8091638090
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
