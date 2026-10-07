"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatINR } from "@/lib/utils";

interface HotelQueueItem {
  _id: string;
  bookingNumber: string;
  customer?: {
    name: string;
    phone: string;
  };
  travelDates: {
    from: string;
    to: string;
  };
  hotelStatus: string;
  hotelBookings: {
    hotelName: string;
    roomType: string;
    mealPlan: string;
    checkIn: string;
    checkOut: string;
    confirmationNumber?: string;
    voucherCode?: string;
    cost: number;
    status: string;
  }[];
}

export default function HotelOperationsDeskPage() {
  const [queue, setQueue] = useState<HotelQueueItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Quick Confirm Modal
  const [selectedBooking, setSelectedBooking] = useState<HotelQueueItem | null>(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [supplierCost, setSupplierCost] = useState(30000);
  const [saving, setSaving] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/operations/hotels?status=${statusFilter}`);
      const data = await res.json();
      if (data.queue) setQueue(data.queue);
    } catch (err) {
      console.error("Error fetching hotel queue:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleQuickConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/bookings/${selectedBooking._id}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CONFIRM_HOTEL",
          payload: {
            confirmationNumber: confirmationCode,
            supplierCost,
          },
        }),
      });
      if (res.ok) {
        setSelectedBooking(null);
        setConfirmationCode("");
        fetchQueue();
      }
    } catch (err) {
      console.error("Hotel confirm error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleIssueVoucher = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/bookings/${bookingId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ISSUE_HOTEL_VOUCHER",
          payload: { hotelIndex: 0 },
        }),
      });
      if (res.ok) fetchQueue();
    } catch (err) {
      console.error("Voucher error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Hotel Operations &amp; Room Allocations</h1>
          <p className="text-slate-400 text-sm mt-1">
            Supplier room blocks, direct confirmation numbers, and hotel vouchers across all active itineraries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Confirmation</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="VOUCHER_ISSUED">Voucher Issued</option>
          </select>
          <button
            onClick={() => fetchQueue()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Hotel Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3.5 px-4">Booking Ref</th>
              <th className="py-3.5 px-4">Traveler</th>
              <th className="py-3.5 px-4">Hotel Property &amp; Room</th>
              <th className="py-3.5 px-4">Stay Dates</th>
              <th className="py-3.5 px-4">Direct Confirmation</th>
              <th className="py-3.5 px-4">Supplier Cost</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Loading hotel operational queue...
                </td>
              </tr>
            ) : queue.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No hotel reservations pending action.
                </td>
              </tr>
            ) : (
              queue.map((item) => {
                const hotel = item.hotelBookings?.[0];
                return (
                  <tr key={item._id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white tracking-wide">
                      {item.bookingNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{item.customer?.name}</div>
                      <div className="text-[11px] text-slate-400">{item.customer?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200">{hotel?.hotelName || "Deluxe Hotel Stay"}</div>
                      <div className="text-[11px] text-slate-400">
                        {hotel?.roomType || "Standard Deluxe"} • {hotel?.mealPlan || "MAP Plan"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-300">
                        {item.travelDates?.from
                          ? new Date(item.travelDates.from).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : "TBD"}{" "}
                        –{" "}
                        {item.travelDates?.to
                          ? new Date(item.travelDates.to).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : "TBD"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {hotel?.confirmationNumber ? (
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {hotel.confirmationNumber}
                        </span>
                      ) : (
                        <span className="font-mono text-amber-400 text-[11px]">Pending Code</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-400">
                      {hotel?.cost ? formatINR(hotel.cost) : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!hotel?.confirmationNumber ? (
                          <button
                            onClick={() => {
                              setSelectedBooking(item);
                              setSupplierCost(hotel?.cost || 30000);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition cursor-pointer"
                          >
                            + Confirm
                          </button>
                        ) : (
                          <button
                            onClick={() => handleIssueVoucher(item._id)}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-[11px] transition cursor-pointer"
                          >
                            🎟️ Issue Voucher
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Enter Direct Hotel Confirmation</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickConfirm} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Confirmation Reference / Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HTL-GUL-9988 / VOUCH-102"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Agreed Supplier Cost (₹)</label>
                <input
                  type="number"
                  required
                  value={supplierCost}
                  onChange={(e) => setSupplierCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Confirmation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
