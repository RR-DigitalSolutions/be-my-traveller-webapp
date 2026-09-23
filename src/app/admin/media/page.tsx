"use client";

import React, { useState, useEffect } from "react";
import MediaPickerModal, { MediaItem } from "@/components/common/MediaPickerModal";

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [category, setCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyType, setCopyType] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/media?category=${category}`);
      const data = await res.json();
      if (data.media) setMediaList(data.media);
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [category]);

  const handleCopyUrl = (id: string, url: string, type = "Standard") => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setCopyType(type);
    setTimeout(() => {
      setCopiedId(null);
      setCopyType("");
    }, 2000);
  };

  const handleDeleteMedia = async (id: string, title?: string) => {
    if (!confirm(`Are you sure you want to delete "${title || "this image"}" from Cloudinary and database?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/admin/media?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMediaList((prev) => prev.filter((item) => item._id !== id));
      } else {
        alert("Failed to delete media asset.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting media asset.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredList = mediaList.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.folder && item.folder.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Cloudinary Active
            </span>
            <span className="text-slate-500 text-xs">• Free Tier Auto-Optimized (f_auto, q_auto)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Media &amp; CDN Asset Storage</h1>
          <p className="text-slate-400 text-xs">
            Organized travel asset hierarchy for Domestic &amp; International Destinations, Packages, Hotels, and Activities.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer shrink-0 hover:scale-[1.02]"
        >
          <span className="text-base">☁️</span> Upload &amp; Optimize Asset
        </button>
      </div>

      {/* Cloudinary Optimization & Taxonomy Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm shrink-0">
            🏔️
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Domestic Destinations</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              bemytraveller/destinations/domestic/[place]
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm shrink-0">
            ✈️
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">International Destinations</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              bemytraveller/destinations/international/[place]
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm shrink-0">
            🎒
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Tour Packages &amp; Hotels</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              bemytraveller/packages/[package-slug]
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["ALL", "Destinations", "Packages", "Hotels", "Activities", "Banners"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                category === cat
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title, folder or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 pl-9 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse">
          Loading Cloudinary media assets...
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50 space-y-3">
          <p className="text-slate-400 text-sm font-semibold">No media assets found in this folder.</p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
          >
            ☁️ Upload New Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredList.map((item) => (
            <div
              key={item._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg group hover:border-amber-500/50 transition-all flex flex-col justify-between"
            >
              {/* Image Preview */}
              <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                <img
                  src={item.thumbnailUrl || item.optimizedUrl || item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-950/85 text-amber-400 backdrop-blur-xs border border-amber-500/20">
                  {item.category || "Asset"}
                </span>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-medium bg-slate-950/85 text-slate-300 backdrop-blur-xs">
                  {item.dimensions || "Auto-fit"}
                </span>
              </div>

              {/* Asset Details */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1" title={item.title}>
                    {item.title}
                  </h4>
                  <p
                    className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-0.5"
                    title={item.folder || "bemytraveller/general"}
                  >
                    📂 {item.folder || "bemytraveller/general"}
                  </p>
                </div>

                {/* Quick Copy Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => handleCopyUrl(item._id, item.optimizedUrl || item.url, "Auto-Optimized")}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                      copiedId === item._id && copyType === "Auto-Optimized"
                        ? "bg-emerald-500 text-slate-950 font-black"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    {copiedId === item._id && copyType === "Auto-Optimized" ? "✓ Copied!" : "📋 Copy WebP"}
                  </button>

                  <button
                    onClick={() => handleCopyUrl(item._id, item.cardUrl || item.url, "Card")}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                      copiedId === item._id && copyType === "Card"
                        ? "bg-emerald-500 text-slate-950 font-black"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    {copiedId === item._id && copyType === "Card" ? "✓ Copied!" : "📐 Card URL"}
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteMedia(item._id, item.title)}
                  disabled={deletingId === item._id}
                  className="w-full py-1 text-[10px] font-semibold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                >
                  {deletingId === item._id ? "Deleting..." : "🗑️ Delete from Cloudinary"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cloudinary Upload Modal */}
      <MediaPickerModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSelect={(newMedia) => {
          setMediaList((prev) => [newMedia, ...prev]);
        }}
        title="Upload &amp; Optimize Asset to Cloudinary"
      />
    </div>
  );
}
