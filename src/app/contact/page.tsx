"use client";

import { useState } from "react";

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
        body: JSON.stringify({ name, phone, email, specialRequirements: `${subject}: ${message}`, source: "CONTACT_PAGE" }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black">Contact Us</h1>
        <p className="text-slate-400 mt-3 text-sm max-w-xl mx-auto">
          Our destination specialists are ready to help you plan your perfect holiday. Reach out via any channel below.
        </p>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-6">Get in Touch</h2>
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
                    className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 hover:border-amber-500/50 hover:bg-amber-50/50 transition-all group"
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{info.label}</p>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-amber-600 mt-0.5">{info.value}</p>
                      <p className="text-xs text-slate-500">{info.sub}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80">
              <p className="text-xs font-bold text-amber-700 mb-1">⏰ Office Hours</p>
              <p className="text-sm text-slate-700">Mon–Sat: 9:00 AM – 8:00 PM IST</p>
              <p className="text-sm text-slate-700">Emergency support: 24/7</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
            {submitted ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 text-3xl flex items-center justify-center mx-auto">✓</div>
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
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <input
                    required
                    type="tel"
                    placeholder="Phone / WhatsApp *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-colors cursor-pointer"
                >
                  {loading ? "Sending..." : "Send Enquiry →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
