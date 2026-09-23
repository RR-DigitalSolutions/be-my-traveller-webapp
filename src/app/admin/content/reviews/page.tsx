"use client";

import React, { useState } from "react";
import { toggleReviewPublish, replyToReview } from "@/domains/cms/content.actions";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([
    {
      _id: "rev-1",
      customerName: "Ananya Sharma",
      customerLocation: "Mumbai, India",
      packageTitle: "7 Days Scenic Himachal & Spiti Circuit",
      rating: 5,
      title: "Unforgettable snow experience in Rohtang!",
      content: "The driver was exceptionally polite, the hotels in Old Manali were top-tier, and the Chandratal camp was surreal. 10/10 service.",
      isVerified: true,
      isPublished: true,
      adminReply: "Thank you Ananya! We are thrilled you enjoyed the Chandratal camping experience.",
      date: "14 Aug 2026",
    },
    {
      _id: "rev-2",
      customerName: "Rohan & Priya Mehta",
      customerLocation: "Bengaluru, India",
      packageTitle: "6 Days Kerala Backwaters & Munnar Hills",
      rating: 5,
      title: "Magical houseboat stay",
      content: "Everything from airport pickup at Kochi to the private chef on the Alleppey houseboat was flawless. Highly recommended.",
      isVerified: true,
      isPublished: false,
      adminReply: "",
      date: "18 Aug 2026",
    },
  ]);

  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleReviewPublish(id, !current);
      setReviews(
        reviews.map((r) => (r._id === id ? { ...r, isPublished: !current } : r))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update review status.");
    }
  };

  const handleReply = async (id: string) => {
    const text = replyText[id];
    if (!text) return;

    try {
      await replyToReview(id, text);
      setReviews(
        reviews.map((r) => (r._id === id ? { ...r, adminReply: text } : r))
      );
      setReplyText({ ...replyText, [id]: "" });
    } catch (err: any) {
      alert(err.message || "Failed to submit reply.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Customer Reviews & Testimonials
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Moderate verified customer feedback, toggle public showcase, and write official responses.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev._id}
            className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{rev.customerName}</span>
                  <span className="text-xs text-slate-400">· {rev.customerLocation}</span>
                  {rev.isVerified && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ Verified Booking
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-400 font-medium mt-0.5">{rev.packageTitle}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex text-amber-400 text-sm">
                  {"★".repeat(rev.rating)}
                  <span className="text-slate-600">{"★".repeat(5 - rev.rating)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(rev._id, rev.isPublished)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    rev.isPublished
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {rev.isPublished ? "Published" : "Hidden (Draft)"}
                </button>
              </div>
            </div>

            <div>
              <p className="font-bold text-white text-sm mb-1">{rev.title}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{rev.content}</p>
            </div>

            {/* Official Admin Response */}
            {rev.adminReply ? (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Be My Traveller Response:
                </span>
                <p className="text-slate-300">{rev.adminReply}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Write an official response..."
                  value={replyText[rev._id] || ""}
                  onChange={(e) =>
                    setReplyText({ ...replyText, [rev._id]: e.target.value })
                  }
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleReply(rev._id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Reply
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
