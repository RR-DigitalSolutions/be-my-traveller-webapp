"use client";

import React, { useState, useEffect } from "react";

interface CouponItem {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minBookingValue: number;
  maxDiscount: number;
  validTill: string;
  usageLimit: number;
  usedCount: number;
  status: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minBookingValue: 30000,
    maxDiscount: 5000,
    validTill: "2026-12-31",
    usageLimit: 100,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/pricing/coupons");
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) return;
    try {
      const res = await fetch("/api/v1/admin/pricing/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        setFormData({
          code: "",
          discountType: "PERCENTAGE",
          discountValue: 10,
          minBookingValue: 30000,
          maxDiscount: 5000,
          validTill: "2026-12-31",
          usageLimit: 100,
        });
        fetchCoupons();
      }
    } catch (err) {
      console.error("Error adding coupon:", err);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon promo code "${code}"?`)) return;
    try {
      await fetch(`/api/v1/admin/pricing/coupons?id=${id}`, { method: "DELETE" });
      fetchCoupons();
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Discount Promo Codes &amp; Coupons</h1>
          <p className="text-slate-400 text-sm mt-1">
            Create promotional discount coupons, percentage deals, and seasonal flat vouchers.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <span>＋</span> Create Promo Code
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3.5 px-4">Coupon Code</th>
              <th className="py-3.5 px-4">Discount</th>
              <th className="py-3.5 px-4">Min. Booking</th>
              <th className="py-3.5 px-4">Max Cap</th>
              <th className="py-3.5 px-4">Redemptions</th>
              <th className="py-3.5 px-4">Valid Till</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Loading coupons...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No active promo codes.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-black text-xs tracking-wider">
                      🎟️ {c.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue.toLocaleString("en-IN")} FLAT`}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    ₹{c.minBookingValue.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    ₹{c.maxDiscount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <span className="font-bold text-white">{c.usedCount}</span> / {c.usageLimit}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    📅 {c.validTill}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(c._id, c.code)}
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
              <h3 className="text-base font-black text-white">Create Discount Promo Code</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMERESCAPE"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Cash (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Min. Booking Value (₹)</label>
                  <input
                    type="number"
                    value={formData.minBookingValue}
                    onChange={(e) => setFormData({ ...formData, minBookingValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Valid Till</label>
                  <input
                    type="date"
                    value={formData.validTill}
                    onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
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
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
