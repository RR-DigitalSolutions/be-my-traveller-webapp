"use client";

import { useState } from "react";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";

export default function ContactPage() {
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

      <section className="bg-slate-900 px-4 py-16 text-center text-white">
        <h1 className="text-4xl font-black">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
          Our destination specialists are ready to help you plan your perfect holiday. Reach out via any channel below.
        </p>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h2 className="mb-6 text-xl font-black text-slate-900">Get in Touch</h2>
              <div className="space-y-5">
                {[
                  { icon: "📞", label: "Toll-Free Helpline", value: "1800 22 7979", href: "tel:18002279779", sub: "Available 24/7" },
                  { icon: "💬", label: "WhatsApp", value: "+91 90000 00000", href: "https://wa.me/919000000000", sub: "Quick response guaranteed" },
                  { icon: "✉️", label: "Email", value: "support@bemytraveller.com", href: "mailto:support@bemytraveller.com", sub: "Reply within 2 hours" },
                  { icon: "📍", label: "Registered Office", value: "RR Digital Solutions, India", href: "#", sub: "Pan-India operations" },
                ].map((info) => (
                  <a
                    key={info.label}
                    href={info.href}
                    className="group flex items-start gap-4 rounded-2xl border border-slate-200 p-4 transition-all hover:border-amber-500/50 hover:bg-amber-50/50"
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{info.label}</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900 group-hover:text-amber-600">{info.value}</p>
                      <p className="text-xs text-slate-500">{info.sub}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/80 bg-amber-50 p-5">
              <p className="mb-1 text-xs font-bold text-amber-700">⏰ Office Hours</p>
              <p className="text-sm text-slate-700">Mon–Sat: 9:00 AM – 8:00 PM IST</p>
              <p className="text-sm text-slate-700">Emergency support: 24/7</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
            {submitted ? (
              <div className="space-y-4 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div>
                <h3 className="text-xl font-black text-slate-900">We&apos;ve received your enquiry!</h3>
                <p className="text-sm text-slate-500">Our team will contact you within 2 hours on the phone/WhatsApp number provided.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">Send Us a Message</h3>
                <div className="space-y-3">
                  <input
                    required
                    type="text"
                    placeholder="Full Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <input
                    required
                    type="tel"
                    placeholder="Phone / WhatsApp *"
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
                    <option>Corporate Group Travel</option>
                    <option>Existing Booking Support</option>
                    <option>Refund / Cancellation</option>
                    <option>Career / Partnership</option>
                    <option>Other</option>
                  </select>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your travel plans, destination, travel dates, number of people..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer rounded-xl bg-amber-500 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-400 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Enquiry →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
