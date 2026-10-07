"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatINR } from "@/lib/utils";

interface TransportQueueItem {
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
  transportStatus: string;
  transportBookings: {
    serviceName: string;
    vehicleType: string;
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    pickupLocation: string;
    dropLocation: string;
    pickupTime: string;
    cost: number;
    status: string;
  }[];
}

export default function TransportOperationsDeskPage() {
  const [queue, setQueue] = useState<TransportQueueItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Quick Assign Modal
  const [selectedBooking, setSelectedBooking] = useState<TransportQueueItem | null>(null);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("Innova Crysta");
  const [supplierCost, setSupplierCost] = useState(18000);
  const [saving, setSaving] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/operations/transport?status=${statusFilter}`);
      const data = await res.json();
      if (data.queue) setQueue(data.queue);
    } catch (err) {
      console.error("Error fetching transport queue:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleQuickAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/bookings/${selectedBooking._id}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN_TRANSPORT",
          payload: {
            driverName,
            driverPhone,
            vehicleType,
            vehicleNumber,
            supplierCost,
          },
        }),
      });
      if (res.ok) {
        setSelectedBooking(null);
        setDriverName("");
        setDriverPhone("");
        setVehicleNumber("");
        fetchQueue();
      }
    } catch (err) {
      console.error("Transport assign error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDispatch = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/bookings/${bookingId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DISPATCH_TRANSPORT",
          payload: { transportIndex: 0 },
        }),
      });
      if (res.ok) fetchQueue();
    } catch (err) {
      console.error("Dispatch error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Transport Dispatch &amp; Chauffeur Fleet</h1>
          <p className="text-slate-400 text-sm mt-1">
            Dedicated vehicle registrations, driver assignments, and live dispatch tracking across traveler trips.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Chauffeur</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button
            onClick={() => fetchQueue()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Transport Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3.5 px-4">Booking Ref</th>
              <th className="py-3.5 px-4">Traveler</th>
              <th className="py-3.5 px-4">Vehicle Model</th>
              <th className="py-3.5 px-4">Reg Plate</th>
              <th className="py-3.5 px-4">Assigned Chauffeur</th>
              <th className="py-3.5 px-4">Transport Cost</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Loading transport operational queue...
                </td>
              </tr>
            ) : queue.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No transport transfers pending assignment.
                </td>
              </tr>
            ) : (
              queue.map((item) => {
                const transport = item.transportBookings?.[0];
                return (
                  <tr key={item._id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white tracking-wide">
                      {item.bookingNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{item.customer?.name}</div>
                      <div className="text-[11px] text-slate-400">{item.customer?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {transport?.vehicleType || "Innova Crysta"}
                    </td>
                    <td className="py-3.5 px-4">
                      {transport?.vehicleNumber ? (
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {transport.vehicleNumber}
                        </span>
                      ) : (
                        <span className="font-mono text-slate-500 text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {transport?.driverName ? (
                        <div>
                          <div className="font-bold text-white">{transport.driverName}</div>
                          <div className="text-[11px] text-sky-400">{transport.driverPhone}</div>
                        </div>
                      ) : (
                        <span className="text-amber-400 text-[11px]">Requires Chauffeur</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-400">
                      {transport?.cost ? formatINR(transport.cost) : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!transport?.driverName ? (
                          <button
                            onClick={() => {
                              setSelectedBooking(item);
                              setSupplierCost(transport?.cost || 18000);
                              setVehicleType(transport?.vehicleType || "Innova Crysta");
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-[11px] transition cursor-pointer"
                          >
                            + Assign
                          </button>
                        ) : transport.status !== "DISPATCHED" ? (
                          <button
                            onClick={() => handleDispatch(item._id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] transition cursor-pointer"
                          >
                            🚀 Dispatch
                          </button>
                        ) : (
                          <span className="px-2 py-1 rounded-md text-[10px] font-black text-emerald-400 bg-emerald-500/10">
                            On Route
                          </span>
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

      {/* Assign Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Assign Chauffeur &amp; Vehicle</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickAssign} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Driver Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Ahmad"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Driver Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 94190 55667"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    required
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Registration Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JK-01-AB-1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Agreed Cab Cost (₹)</label>
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
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black cursor-pointer"
                >
                  {saving ? "Saving..." : "Assign Chauffeur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
