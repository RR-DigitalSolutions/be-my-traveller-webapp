"use client";

import React, { useState, useEffect } from "react";

interface HotelItem {
  _id: string;
  name: string;
  city: string;
  starRating: number;
  tier: string;
  basePricePerNight: number;
  amenities: string[];
  coverImage?: string;
  status: string;
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [search, setSearch] = useState("");
  const [stars, setStars] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    starRating: 5,
    tier: "LUXURY",
    basePricePerNight: 12000,
    amenities: "",
    coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    status: "ACTIVE",
  });

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/hotels?search=${encodeURIComponent(search)}&stars=${stars}`);
      const data = await res.json();
      if (data.hotels) setHotels(data.hotels);
    } catch (err) {
      console.error("Error fetching hotels:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [search, stars]);

  const handleAddHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.city) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        setFormData({
          name: "",
          city: "",
          starRating: 5,
          tier: "LUXURY",
          basePricePerNight: 12000,
          amenities: "",
          coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
          status: "ACTIVE",
        });
        fetchHotels();
      }
    } catch (err) {
      console.error("Error adding hotel:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete hotel property "${name}"?`)) return;
    try {
      await fetch(`/api/v1/admin/hotels?id=${id}`, { method: "DELETE" });
      fetchHotels();
    } catch (err) {
      console.error("Error deleting hotel:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Hotels &amp; Luxury Stays Inventory</h1>
          <p className="text-slate-400 text-sm mt-1">
            Contracted supplier hotels, room tiers (3★, 4★, 5★ Luxury, Pool Villas), and per-night base rates.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <span>＋</span> Add Contracted Hotel
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search hotels by property name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {["ALL", "5", "4", "3"].map((s) => (
            <button
              key={s}
              onClick={() => setStars(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                stars === s
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {s === "ALL" ? "All Star Ratings" : `★ ${s} Star`}
            </button>
          ))}
        </div>
      </div>

      {/* Hotels Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
          Loading hotel contracts...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((h) => (
            <div
              key={h._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="relative h-44 w-full bg-slate-800">
                <img src={h.coverImage} alt={h.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-950/80 text-amber-400 backdrop-blur-xs">
                    {"★".repeat(h.starRating)} {h.starRating} Star
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-slate-950/80 text-slate-300 backdrop-blur-xs">
                    {h.tier}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white leading-snug">{h.name}</h3>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">📍 {h.city}</p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {Array.isArray(h.amenities) && h.amenities.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Contract Base Rate</span>
                    <p className="text-sm font-black text-amber-400">₹{h.basePricePerNight.toLocaleString("en-IN")} <span className="text-[10px] text-slate-400 font-normal">/ night</span></p>
                  </div>
                  <button
                    onClick={() => handleDelete(h._id, h.name)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold cursor-pointer"
                    title="Delete Hotel"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Hotel Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Add Hotel / Stay Property</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddHotel} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Hotel Property Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radisson Blu Resort"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">City / Region</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manali, Himachal"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Star Rating</label>
                  <select
                    value={formData.starRating}
                    onChange={(e) => setFormData({ ...formData, starRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={5}>5 Star Luxury</option>
                    <option value={4}>4 Star Deluxe</option>
                    <option value={3}>3 Star Standard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category / Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="LUXURY">LUXURY</option>
                    <option value="DELUXE">DELUXE</option>
                    <option value="HERITAGE">HERITAGE</option>
                    <option value="STANDARD">STANDARD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Contract Rate (₹ / Night)</label>
                  <input
                    type="number"
                    required
                    value={formData.basePricePerNight}
                    onChange={(e) => setFormData({ ...formData, basePricePerNight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Amenities (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Free Wifi, Swimming Pool, Mountain View, Spa, Breakfast Included"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
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
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-md"
                >
                  {submitting ? "Saving..." : "Save Hotel Contract"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
