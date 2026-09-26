"use client";

import React, { useState, useEffect } from "react";
import { formatINR } from "@/lib/utils";

interface QuoteItem {
  _id: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  destination: string;
  travelDates: string;
  paxCount: string;
  hotelTier: string;
  cabType: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    destination: "Kashmir Paradise Special (6N/7D)",
    travelDates: "15 Oct 2026 – 21 Oct 2026",
    paxCount: "2 Adults",
    hotelTier: "4★ Deluxe Hotels + Luxury Houseboat",
    cabType: "Private Dedicated Innova Crysta",
    totalAmount: 78500,
  });

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/quotes?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.quotes) setQuotes(data.quotes);
    } catch (err) {
      console.error("Error fetching quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [search]);

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone) return;
    try {
      const res = await fetch("/api/v1/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        setFormData({
          customerName: "",
          customerPhone: "",
          customerEmail: "",
          destination: "Kashmir Paradise Special (6N/7D)",
          travelDates: "15 Oct 2026 – 21 Oct 2026",
          paxCount: "2 Adults",
          hotelTier: "4★ Deluxe Hotels + Luxury Houseboat",
          cabType: "Private Dedicated Innova Crysta",
          totalAmount: 78500,
        });
        fetchQuotes();
      }
    } catch (err) {
      console.error("Error creating quote:", err);
    }
  };

  const generateWhatsAppQuote = (q: QuoteItem) => {
    const text = `🌟 *Custom Holiday Proposal from Be My Traveller* 🌟\n\n` +
      `Dear *${q.customerName}*,\n` +
      `Here is your tailor-made itinerary proposal:\n\n` +
      `📌 *Quote Ref:* ${q.quoteNumber}\n` +
      `📍 *Destination:* ${q.destination}\n` +
      `📅 *Travel Dates:* ${q.travelDates}\n` +
      `👥 *Travelers:* ${q.paxCount}\n` +
      `🏨 *Stay Tier:* ${q.hotelTier}\n` +
      `🚗 *Transfers:* ${q.cabType}\n\n` +
      `💰 *Total Package Price:* ${formatINR(q.totalAmount)} (Inclusive of all taxes & GST)\n\n` +
      `✅ *Inclusions:* 4★/5★ Hotels, Daily Breakfast & Dinner, Private Sanitized Cab with Driver, Sightseeing Passes, 24/7 On-Trip Tour Support.\n\n` +
      `👉 Reply to this message to lock your dates or make adjustments!\n` +
      `📞 *Toll Free:* +91 8091638090 | www.bemytraveller.com`;

    const cleanPhone = q.customerPhone.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const copyQuoteSummary = (q: QuoteItem) => {
    const text = `Be My Traveller Proposal - ${q.quoteNumber}\nCustomer: ${q.customerName}\nDestination: ${q.destination}\nDates: ${q.travelDates}\nAmount: ${formatINR(q.totalAmount)}`;
    navigator.clipboard.writeText(text);
    setCopiedMsg(q._id);
    setTimeout(() => setCopiedMsg(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Custom Quotes &amp; Proposals</h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate itemized travel quotations, send WhatsApp quotes, and track proposal conversions.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <span>＋</span> Create New Quote
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by customer name, phone, or quote ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3.5 px-4">Quote Ref</th>
              <th className="py-3.5 px-4">Customer Details</th>
              <th className="py-3.5 px-4">Destination &amp; Dates</th>
              <th className="py-3.5 px-4">Hotel &amp; Cab Specs</th>
              <th className="py-3.5 px-4">Quote Value</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Loading quotes from database...
                </td>
              </tr>
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No quotes found. Click &quot;Create New Quote&quot; above.
                </td>
              </tr>
            ) : (
              quotes.map((q) => (
                <tr key={q._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-black text-amber-400 text-xs">
                      {q.quoteNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white text-[13px]">{q.customerName}</p>
                    <p className="text-slate-400 text-[11px] font-mono">{q.customerPhone}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white">{q.destination}</p>
                    <p className="text-slate-400 text-[11px]">📅 {q.travelDates} · {q.paxCount}</p>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-300 truncate">🏨 {q.hotelTier}</p>
                    <p className="text-slate-400 text-[11px] truncate">🚗 {q.cabType}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-sm font-black text-amber-400">
                      {formatINR(q.totalAmount)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        q.status === "CONFIRMED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : q.status === "SENT"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => generateWhatsAppQuote(q)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Send via WhatsApp"
                      >
                        <span>💬</span> WhatsApp
                      </button>
                      <button
                        onClick={() => copyQuoteSummary(q)}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer"
                        title="Copy Summary"
                      >
                        {copiedMsg === q._id ? "✓ Copied" : "📋"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Quote Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Generate Custom Travel Quotation</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Mobile / WhatsApp No.</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 8091638090"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Destination &amp; Itinerary Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kashmir 5N/6D with Gulmarg &amp; Houseboat"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Travel Dates / Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Oct – 21 Oct 2026"
                    value={formData.travelDates}
                    onChange={(e) => setFormData({ ...formData, travelDates: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Travelers (Pax)</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Adults + 1 Child"
                    value={formData.paxCount}
                    onChange={(e) => setFormData({ ...formData, paxCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Hotel Tier Selected</label>
                  <input
                    type="text"
                    placeholder="e.g. 4★ Deluxe (Radisson / Lemon Tree)"
                    value={formData.hotelTier}
                    onChange={(e) => setFormData({ ...formData, hotelTier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Vehicle / Cab</label>
                  <input
                    type="text"
                    placeholder="e.g. Private AC Innova Crysta"
                    value={formData.cabType}
                    onChange={(e) => setFormData({ ...formData, cabType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Total Quotation Value (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-base font-black text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-md"
                >
                  Generate Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
