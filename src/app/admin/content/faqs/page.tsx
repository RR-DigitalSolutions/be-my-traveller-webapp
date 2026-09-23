"use client";

import React, { useState } from "react";
import { createFAQ, deleteFAQ } from "@/domains/cms/content.actions";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState([
    {
      _id: "faq-1",
      category: "BOOKING",
      question: "How far in advance should I book my customized trip?",
      answer: "We recommend booking at least 3 to 4 weeks in advance for domestic trips and 6 to 8 weeks for peak season dates.",
    },
    {
      _id: "faq-2",
      category: "PAYMENT",
      question: "What payment methods are accepted?",
      answer: "We accept UPI, Net Banking, Credit/Debit Cards, and bank transfers via secure Razorpay checkout.",
    },
    {
      _id: "faq-3",
      category: "CANCELLATION",
      question: "What is your package cancellation policy?",
      answer: "Full refund is available up to 15 days before travel. 50% refund between 7 to 14 days, and non-refundable within 7 days.",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer) return;
    setIsSubmitting(true);

    try {
      const res = await createFAQ({ question, answer, category });
      setFaqs([...faqs, { _id: res.id, question, answer, category }]);
      setQuestion("");
      setAnswer("");
    } catch (err: any) {
      alert(err.message || "Failed to add FAQ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      await deleteFAQ(id);
      setFaqs(faqs.filter((f) => f._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete FAQ.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Global FAQ Management</h1>
        <p className="text-xs text-slate-400 mt-1">
          Structured questions & answers displayed on the public FAQ directory and indexed for AEO.
        </p>
      </div>

      {/* Add FAQ Form */}
      <form onSubmit={handleAdd} className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Add Global Q&A</h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Question *</label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Can we customize the day-wise itinerary?"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="GENERAL">General</option>
              <option value="BOOKING">Booking</option>
              <option value="PAYMENT">Payment</option>
              <option value="CANCELLATION">Cancellation</option>
              <option value="CUSTOMIZATION">Customization</option>
              <option value="VISA">Visa & Entry</option>
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Direct Answer *</label>
            <textarea
              rows={2}
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a concise factual answer..."
              className="w-full px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            {isSubmitting ? "Adding..." : "+ Add FAQ"}
          </button>
        </div>
      </form>

      {/* FAQ List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Configured FAQs ({faqs.length})</h2>

        <div className="space-y-3">
          {faqs.map((f) => (
            <div
              key={f._id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {f.category}
                  </span>
                  <p className="font-bold text-white text-sm">{f.question}</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">{f.answer}</p>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(f._id)}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
