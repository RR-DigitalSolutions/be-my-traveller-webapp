"use client";

import { useState } from "react";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function ContactPage() {
  const { settings, helplinePhone, cleanPhone, cleanWhatsApp, supportEmail, bookingsEmail, fullAddress } = useSiteSettings();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Holiday Package Enquiry");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Website Enquiry",
          phone,
          email: email || `${phone.replace(/\D/g, "") || "callback"}@bemytraveller.com`,
          specialRequirements: `${subject}: ${message}`,
          source: "CONTACT_PAGE",
        }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <BmtNavMenu variant="solid" />

      {/* Header Banner */}
      <section className="bg-slate-900 px-4 py-16 text-center text-white">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 px-3.5 py-1 text-xs font-bold text-amber-300 mb-3">
          ✨ 24/7 Verified Travel Specialist Concierge
        </span>
        <h1 className="text-4xl font-black">{settings.tradeName || "Be My Traveller"} Support &amp; Concierge</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 leading-relaxed">
          {settings.tagline || "Curated Experiential Mountain Holidays & Custom Tour Packages"}. Reach out to our registered head office or ground operational hubs.
        </p>
      </section>

      {/* Main Contact Grid */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left: Contact Helplines */}
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-xl font-black text-slate-900">Official Helplines &amp; Inboxes</h2>
                <p className="text-xs text-slate-500">Fastest response channels for quotes, vouchers &amp; on-trip assistance.</p>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    icon: "📞",
                    label: "Primary Support Phone",
                    value: helplinePhone,
                    href: `tel:${cleanPhone}`,
                    sub: "Available 24/7 for booking & concierge",
                    accent: "amber",
                  },
                  {
                    icon: "🏔️",
                    label: "24/7 Mountain Emergency Helpline",
                    value: settings.emergencyHelpline || helplinePhone,
                    href: `tel:${(settings.emergencyHelpline || helplinePhone).replace(/\D/g, "")}`,
                    sub: "Dedicated fleet & mountain rescue assistance",
                    accent: "rose",
                  },
                  {
                    icon: "💬",
                    label: "Official WhatsApp Concierge",
                    value: settings.whatsappNumber || helplinePhone,
                    href: `https://wa.me/${cleanWhatsApp}`,
                    sub: "Instant itineraries & quote customization",
                    accent: "emerald",
                  },
                  {
                    icon: "✉️",
                    label: "Customer Support Email",
                    value: supportEmail,
                    href: `mailto:${supportEmail}`,
                    sub: "Response guaranteed within 2 business hours",
                    accent: "sky",
                  },
                  {
                    icon: "📋",
                    label: "Bookings & Inquiries Desk",
                    value: bookingsEmail,
                    href: `mailto:${bookingsEmail}`,
                    sub: "For custom itinerary proposals and b2b queries",
                    accent: "violet",
                  },
                  {
                    icon: "📍",
                    label: "Registered Head Office",
                    value: fullAddress,
                    href: "#",
                    sub: `${settings.companyLegalName} (Corporate HQ)`,
                    accent: "slate",
                  },
                ].map((info) => (
                  <a
                    key={info.label}
                    href={info.href}
                    className="group flex items-start gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 transition-all hover:border-amber-500/50 hover:shadow-md hover:bg-amber-50/20"
                  >
                    <span className="text-2xl p-2 rounded-xl bg-slate-100 group-hover:scale-110 transition-transform">
                      {info.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">{info.label}</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors break-words">
                        {info.value}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{info.sub}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Office Hours */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-5">
                <p className="mb-1 text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <span>⏰</span> Operating Working Hours
                </p>
                <p className="text-xs text-slate-700">Central Concierge: Mon–Sat: 9:00 AM – 8:00 PM IST</p>
                <p className="text-xs text-emerald-700 font-bold mt-1">24/7 Mountain &amp; Airport Transfer Fleet Support: Active 365 Days</p>
              </div>
            </div>

            {/* Right: Message Form */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 shadow-sm">
              {submitted ? (
                <div className="space-y-4 py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div>
                  <h3 className="text-xl font-black text-slate-900">We&apos;ve received your message!</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Your destination specialist will connect with you within 2 hours on your provided phone or WhatsApp number.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Send an Enquiry to Concierge</h3>
                    <p className="text-xs text-slate-500 mt-1">Fill out the form below and receive our tailored travel quote.</p>
                  </div>

                  <div className="space-y-3">
                    <input
                      required
                      type="text"
                      placeholder="Your Full Name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                    <input
                      required
                      type="tel"
                      placeholder="Phone / WhatsApp Number *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option>Holiday Package Enquiry</option>
                      <option>Custom Trip Planning</option>
                      <option>Corporate &amp; Group Tour</option>
                      <option>Honeymoon Special Package</option>
                      <option>Existing Booking Support</option>
                      <option>Other</option>
                    </select>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your destination, dates, number of travellers..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-amber-500 py-3.5 text-sm font-black text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Submitting..." : "Send Message →"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Dynamic Branch & Ground Operational Desks */}
          {settings.branchOffices && settings.branchOffices.length > 0 && (
            <div className="pt-8 border-t border-slate-200 space-y-5">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>🏔️</span> Branch &amp; Ground Operational Desks ({settings.branchOffices.length})
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Our on-ground station executives coordinate your drivers, hotel check-ins &amp; adventure vouchers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {settings.branchOffices.map((branch, i) => (
                  <div
                    key={branch.name || i}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                          {branch.isPrimary ? "Primary Station" : "Operational Hub"}
                        </span>
                        <span className="text-xs text-slate-400">Hub #{i + 1}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">{branch.name}</h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        📍 {branch.address}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                      {branch.phone && (
                        <a href={`tel:${branch.phone.replace(/\D/g, "")}`} className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-amber-600">
                          <span>📞</span> {branch.phone}
                        </a>
                      )}
                      {branch.email && (
                        <a href={`mailto:${branch.email}`} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 truncate">
                          <span>✉</span> {branch.email}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Government Tourism Licenses & Verifications */}
          <div className="pt-8 border-t border-slate-200 space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>🛡️</span> Verified Government Tourism Licenses &amp; Credentials
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {settings.companyLegalName} is an accredited tour operator adhering to all Ministry of Tourism and statutory compliances.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "GSTIN Number", value: settings.gstin },
                { label: "Company CIN", value: settings.cin },
                { label: "PAN Number", value: settings.pan },
                { label: "IATA License", value: settings.iataNumber },
                { label: "Ministry of Tourism", value: settings.tourismLicenseNo },
                { label: "DOT Permit No", value: settings.dotPermitNo },
              ]
                .filter((item) => Boolean(item.value))
                .map((lic) => (
                  <div key={lic.label} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lic.label}</p>
                    <p className="text-xs font-bold text-slate-800 mt-1 truncate" title={lic.value}>
                      {lic.value}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
