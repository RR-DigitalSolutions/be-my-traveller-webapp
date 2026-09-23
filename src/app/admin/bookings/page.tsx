"use client";

import React, { useState, useEffect } from "react";

interface BookingItem {
  _id: string;
  bookingReference: string;
  travelerName: string;
  travelerPhone: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  paxCount: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  assignedDriver?: string;
  hotelVoucherCode?: string;
  status: string;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<BookingItem | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/bookings?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.bookings) setBookings(data.bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search]);

  const handlePrintVoucher = (b: BookingItem) => {
    setSelectedVoucher(b);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Active Bookings &amp; Travel Vouchers</h1>
          <p className="text-slate-400 text-sm mt-1">
            Confirmed customer trips, driver assignments, payment balances, and 1-Click Printable Travel Vouchers.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search booking ref, traveler name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3.5 px-4">Booking Ref</th>
              <th className="py-3.5 px-4">Traveler</th>
              <th className="py-3.5 px-4">Itinerary &amp; Dates</th>
              <th className="py-3.5 px-4">Assigned Chauffeur / Vehicle</th>
              <th className="py-3.5 px-4">Payment Balance</th>
              <th className="py-3.5 px-4">Trip Status</th>
              <th className="py-3.5 px-4 text-right">Travel Voucher</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Loading bookings...
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No active bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-black text-amber-400 text-xs">
                      {b.bookingReference}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white text-[13px]">{b.travelerName}</p>
                    <p className="text-slate-400 text-[11px] font-mono">{b.travelerPhone}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white">{b.destination}</p>
                    <p className="text-slate-400 text-[11px]">📅 {b.departureDate} – {b.returnDate} · {b.paxCount}</p>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-300 font-medium text-[11px] truncate">
                      🚗 {b.assignedDriver || "Pending Dispatch"}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-black text-white text-sm">₹{b.paidAmount.toLocaleString("en-IN")}</p>
                    <span
                      className={`text-[10px] font-bold ${
                        b.paidAmount >= b.totalAmount ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ● {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handlePrintVoucher(b)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1 ml-auto shadow-xs cursor-pointer"
                    >
                      <span>🖨️</span> View Voucher
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Travel Voucher Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Voucher Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">
                <img src="/Logo for website PNG.webp" alt="Be My Traveller" className="h-10 object-contain" />
                <div>
                  <h2 className="font-black text-lg text-slate-950 uppercase tracking-tight">Official Travel Voucher</h2>
                  <p className="text-[11px] text-slate-600 font-semibold">Be My Traveller Pvt. Ltd. · 24/7 Helpline: 1800 22 7979</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 block">Voucher Ref</span>
                <span className="text-sm font-mono font-black text-amber-600">{selectedVoucher.bookingReference}</span>
              </div>
            </div>

            {/* Traveler & Trip Details Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Lead Passenger Name</span>
                <span className="font-black text-sm text-slate-900">{selectedVoucher.travelerName}</span>
                <span className="text-slate-600 block mt-0.5">{selectedVoucher.travelerPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Total Travelers</span>
                <span className="font-black text-sm text-slate-900">{selectedVoucher.paxCount}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200">
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Confirmed Itinerary</span>
                <span className="font-bold text-slate-900 text-[13px]">{selectedVoucher.destination}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Trip Start Date</span>
                <span className="font-bold text-slate-900">📅 {selectedVoucher.departureDate}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Trip End Date</span>
                <span className="font-bold text-slate-900">📅 {selectedVoucher.returnDate}</span>
              </div>
            </div>

            {/* Logistics & Driver Details */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-1.5">
              <span className="text-amber-800 uppercase font-black text-[10px] tracking-wider block">
                🚗 Designated Vehicle &amp; Driver Contact
              </span>
              <p className="font-bold text-slate-900 text-[13px]">
                {selectedVoucher.assignedDriver || "Assigned 24 Hours prior to departure."}
              </p>
              <p className="text-slate-600 text-[11px]">
                Driver will report at airport/station with traveler name placard.
              </p>
            </div>

            {/* Hotel Voucher Code */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 text-xs">
              <span className="font-bold text-slate-700">Hotel Check-in Voucher Code:</span>
              <span className="font-mono font-black text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-300">
                {selectedVoucher.hotelVoucherCode || "BMT-CONFIRMED"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-[11px] text-slate-500">Please present this voucher or digital copy during hotel check-in.</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs cursor-pointer shadow-md"
                >
                  🖨️ Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
