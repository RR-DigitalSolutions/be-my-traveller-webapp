"use client";

import React, { useState, useEffect } from "react";
import { formatINR } from "@/lib/utils";

interface ActivityItem {
  _id: string;
  name: string;
  destination: string;
  category: string;
  duration: string;
  adultPrice: number;
  childPrice: number;
  status: string;
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    destination: "Kashmir",
    category: "Adventure & Sightseeing",
    duration: "3 Hours",
    adultPrice: 1500,
    childPrice: 900,
  });

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/activities?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.activities) setActivities(data.activities);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.destination) return;
    try {
      const res = await fetch("/api/v1/admin/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        setFormData({
          name: "",
          destination: "Kashmir",
          category: "Adventure & Sightseeing",
          duration: "3 Hours",
          adultPrice: 1500,
          childPrice: 900,
        });
        fetchActivities();
      }
    } catch (err) {
      console.error("Error adding activity:", err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete activity "${name}"?`)) return;
    try {
      await fetch(`/api/v1/admin/activities?id=${id}`, { method: "DELETE" });
      fetchActivities();
    } catch (err) {
      console.error("Error deleting activity:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Activities, Passes &amp; Sightseeing</h1>
          <p className="text-slate-400 text-sm mt-1">
            Supplier passes (Gulmarg Gondola, Burj Khalifa, Scuba, Shikara rides) and adventure add-ons.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <span>＋</span> Add Activity / Pass
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search activities or destinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3.5 px-4">Activity Name</th>
              <th className="py-3.5 px-4">Destination</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Adult Rate</th>
              <th className="py-3.5 px-4">Child Rate</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Loading activities from database...
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No activities found.
                </td>
              </tr>
            ) : (
              activities.map((a) => (
                <tr key={a._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white text-[13px]">
                    {a.name}
                  </td>
                  <td className="py-3.5 px-4 text-amber-400 font-semibold">
                    📍 {a.destination}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {a.category}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    ⏱ {a.duration}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {formatINR(a.adultPrice)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-400">
                    {formatINR(a.childPrice)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(a._id, a.name)}
                      className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold cursor-pointer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Add Activity / Sightseeing Pass</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Activity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuba Diving with Photos & Video"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Andaman or Kashmir"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Hours or Full Day"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Adult Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.adultPrice}
                    onChange={(e) => setFormData({ ...formData, adultPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Child Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.childPrice}
                    onChange={(e) => setFormData({ ...formData, childPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
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
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
