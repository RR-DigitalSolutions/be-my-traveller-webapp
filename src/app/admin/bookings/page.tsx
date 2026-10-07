"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatINR } from "@/lib/utils";

interface HotelBookingItem {
  _id?: string;
  hotelName: string;
  roomType: string;
  mealPlan: string;
  checkIn: string;
  checkOut: string;
  roomsCount: number;
  confirmationNumber?: string;
  voucherCode?: string;
  cost: number;
  status: "REQUESTED" | "CONFIRMED" | "VOUCHERED" | "CANCELLED";
}

interface TransportBookingItem {
  _id?: string;
  serviceName: string;
  vehicleType: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  pickupLocation: string;
  dropLocation: string;
  pickupTime: string;
  cost: number;
  status: "UNASSIGNED" | "ASSIGNED" | "DISPATCHED" | "COMPLETED";
}

interface VoucherItem {
  _id?: string;
  voucherNumber: string;
  type: string;
  issuedAt: string;
  status: string;
  contentSummary?: string;
}

interface FinanceSummary {
  totalRevenue: number;
  totalSupplierCost: number;
  grossProfit: number;
  profitMarginPercent: number;
  supplierPaymentStatus: string;
}

interface BookingRecord {
  _id: string;
  bookingNumber: string;
  packageName: string;
  destination?: string;
  customer?: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  travelDates: {
    from: string;
    to: string;
  };
  nights: number;
  travellers: {
    adults: number;
    children: number;
    infants: number;
  };
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  hotelStatus: "PENDING" | "CONFIRMED" | "VOUCHER_ISSUED";
  transportStatus: "PENDING" | "ASSIGNED" | "DISPATCHED" | "COMPLETED";
  voucherStatus: "PENDING" | "GENERATED" | "SENT";
  financeStatus: "UNPAID" | "PARTIAL" | "PAID" | "RECONCILED";
  status: string;
  hotelBookings?: HotelBookingItem[];
  transportBookings?: TransportBookingItem[];
  vouchers?: VoucherItem[];
  financeSummary?: FinanceSummary;
  internalNotes?: string;
  operationsNotes?: string;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [hotelFilter, setHotelFilter] = useState("ALL");
  const [transportFilter, setTransportFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Selected Booking Drawer & Tabs
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "HOTELS" | "TRANSPORT" | "VOUCHER" | "FINANCE">("OVERVIEW");

  // Operational Action Modals
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [transportModalOpen, setTransportModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [supplierPayModalOpen, setSupplierPayModalOpen] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);

  // Modal Form States
  const [hotelForm, setHotelForm] = useState({
    confirmationNumber: "",
    supplierCost: 35000,
    hotelName: "",
    notes: "",
  });

  const [transportForm, setTransportForm] = useState({
    driverName: "",
    driverPhone: "",
    vehicleType: "Innova Crysta",
    vehicleNumber: "",
    supplierCost: 18000,
    pickupLocation: "",
    dropLocation: "",
    notes: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 50000,
    paymentType: "ADVANCE" as "ADVANCE" | "PARTIAL" | "FINAL",
    paymentMethod: "UPI" as "UPI" | "CARD" | "NET_BANKING" | "BANK_TRANSFER" | "CASH",
    providerPaymentId: "",
    notes: "",
  });

  const [supplierPayForm, setSupplierPayForm] = useState({
    supplierName: "",
    serviceType: "HOTEL" as "HOTEL" | "TRANSPORT",
    amount: 25000,
    paymentMethod: "BANK_TRANSFER" as "BANK_TRANSFER" | "UPI" | "CHEQUE",
    notes: "",
  });

  const [printableVoucherData, setPrintableVoucherData] = useState<any>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (hotelFilter !== "ALL") params.set("hotelStatus", hotelFilter);
      if (transportFilter !== "ALL") params.set("transportStatus", transportFilter);

      const res = await fetch(`/api/v1/admin/bookings?${params.toString()}`);
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
        // Sync selected booking if open
        if (selectedBooking) {
          const fresh = data.bookings.find((b: BookingRecord) => b._id === selectedBooking._id);
          if (fresh) setSelectedBooking(fresh);
        }
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, hotelFilter, transportFilter, selectedBooking?._id]);

  useEffect(() => {
    fetchBookings();
  }, [search, statusFilter, hotelFilter, transportFilter]);

  // Operations Handlers
  const handleConfirmHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      const res = await fetch(`/api/v1/admin/bookings/${selectedBooking._id}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CONFIRM_HOTEL",
          payload: hotelForm,
        }),
      });
      if (res.ok) {
        setHotelModalOpen(false);
        setHotelForm({ confirmationNumber: "", supplierCost: 35000, hotelName: "", notes: "" });
        await fetchBookings();
      }
    } catch (err) {
      console.error("Hotel confirm error:", err);
    }
  };

  const handleIssueHotelVoucher = async () => {
    if (!selectedBooking) return;
    try {
      const res = await fetch(`/api/v1/admin/bookings/${selectedBooking._id}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ISSUE_HOTEL_VOUCHER",
          payload: { hotelIndex: 0 },
        }),
      });
      if (res.ok) await fetchBookings();
    } catch (err) {
      console.error("Hotel voucher error:", err);
    }
  };

  const handleAssignTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      const res = await fetch(`/api/v1/admin/bookings/${selectedBooking._id}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN_TRANSPORT",
          payload: transportForm,
        }),
      });
      if (res.ok) {
        setTransportModalOpen(false);
        setTransportForm({
          driverName: "",
          driverPhone: "",
          vehicleType: "Innova Crysta",
          vehicleNumber: "",
          supplierCost: 18000,
          pickupLocation: "",
          dropLocation: "",
          notes: "",
        });
        await fetchBookings();
      }
    } catch (err) {
      console.error("Transport assign error:", err);
    }
  };

  const handleDispatchTransport = async () => {
    if (!selectedBooking) return;
    try {
      const res = await fetch(`/api/v1/admin/bookings/${selectedBooking._id}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DISPATCH_TRANSPORT",
          payload: { transportIndex: 0 },
        }),
      });
      if (res.ok) await fetchBookings();
    } catch (err) {
      console.error("Dispatch transport error:", err);
    }
  };

  const handleRecordCustomerPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      const res = await fetch(`/api/v1/admin/bookings/${selectedBooking._id}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_CUSTOMER_PAYMENT",
          payload: paymentForm,
        }),
      });
      if (res.ok) {
        setPaymentModalOpen(false);
        setPaymentForm({
          amount: 50000,
          paymentType: "PARTIAL",
          paymentMethod: "UPI",
          providerPaymentId: "",
          notes: "",
        });
        await fetchBookings();
      }
    } catch (err) {
      console.error("Record payment error:", err);
    }
  };

  const handleRequestSupplierPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      const res = await fetch(`/api/v1/admin/bookings/${selectedBooking._id}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REQUEST_SUPPLIER_PAYMENT",
          payload: supplierPayForm,
        }),
      });
      if (res.ok) {
        setSupplierPayModalOpen(false);
        setSupplierPayForm({
          supplierName: "",
          serviceType: "HOTEL",
          amount: 25000,
          paymentMethod: "BANK_TRANSFER",
          notes: "",
        });
        await fetchBookings();
      }
    } catch (err) {
      console.error("Request supplier payment error:", err);
    }
  };

  const handleOpenPrintableVoucher = async (b: BookingRecord) => {
    try {
      const res = await fetch(`/api/v1/admin/bookings/${b._id}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GENERATE_TRIP_VOUCHER" }),
      });
      const data = await res.json();
      if (data.voucher) {
        setPrintableVoucherData(data.voucher);
        setVoucherModalOpen(true);
      }
    } catch (err) {
      console.error("Voucher error:", err);
    }
  };

  // KPI aggregates
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalReceivables = bookings.reduce((sum, b) => sum + (b.pendingAmount || 0), 0);
  const activeOpsCount = bookings.filter((b) => b.hotelStatus !== "CONFIRMED" || b.transportStatus !== "ASSIGNED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Booking Operations &amp; Travel Desk</h1>
          <p className="text-slate-400 text-sm mt-1">
            End-to-end trip fulfillment: Hotel reservations, chauffeur allocations, vouchers, and financials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBookings()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔄</span> Refresh Desk
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs font-semibold text-slate-400">Total Bookings</p>
          <p className="text-2xl font-black text-white mt-1">{bookings.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active trips in fulfillment</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs font-semibold text-amber-400">Pending Operations</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{activeOpsCount}</p>
          <p className="text-[11px] text-amber-500/80 mt-0.5">Hotel or cab unassigned</p>
        </div>
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <p className="text-xs font-semibold text-rose-400">Receivables Balance</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{formatINR(totalReceivables)}</p>
          <p className="text-[11px] text-rose-500/80 mt-0.5">Due from travelers</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs font-semibold text-emerald-400">Total Invoiced</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{formatINR(totalRevenue)}</p>
          <p className="text-[11px] text-emerald-500/80 mt-0.5">Confirmed trip sales</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search booking ref, traveler, destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Trip Statuses</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Hotel Filter */}
          <select
            value={hotelFilter}
            onChange={(e) => setHotelFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Hotel: All</option>
            <option value="PENDING">Hotel: Pending</option>
            <option value="CONFIRMED">Hotel: Confirmed</option>
            <option value="VOUCHER_ISSUED">Hotel: Vouchered</option>
          </select>

          {/* Transport Filter */}
          <select
            value={transportFilter}
            onChange={(e) => setTransportFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Transport: All</option>
            <option value="PENDING">Transport: Pending</option>
            <option value="ASSIGNED">Transport: Assigned</option>
            <option value="DISPATCHED">Transport: Dispatched</option>
            <option value="COMPLETED">Transport: Completed</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3.5 px-4">Booking Ref</th>
              <th className="py-3.5 px-4">Traveler</th>
              <th className="py-3.5 px-4">Destination &amp; Dates</th>
              <th className="py-3.5 px-4">Hotel Status</th>
              <th className="py-3.5 px-4">Chauffeur Status</th>
              <th className="py-3.5 px-4">Balance Due</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Loading bookings...
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No bookings found matching filters.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr
                  key={b._id}
                  onClick={() => setSelectedBooking(b)}
                  className="hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white tracking-wide">{b.bookingNumber}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{b.customer?.name || "Customer"}</div>
                    <div className="text-[11px] text-slate-400">{b.customer?.phone || ""}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-200">{b.destination || b.packageName}</div>
                    <div className="text-[11px] text-slate-400">
                      {b.travelDates?.from
                        ? new Date(b.travelDates.from).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                        : "TBD"}{" "}
                      –{" "}
                      {b.travelDates?.to
                        ? new Date(b.travelDates.to).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                        : "TBD"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        b.hotelStatus === "CONFIRMED" || b.hotelStatus === "VOUCHER_ISSUED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {b.hotelStatus || "PENDING"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        b.transportStatus === "ASSIGNED" || b.transportStatus === "DISPATCHED"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : b.transportStatus === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {b.transportStatus || "PENDING"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold">
                    <div className="text-white">{formatINR(b.totalAmount)}</div>
                    <div
                      className={`text-[11px] ${
                        b.pendingAmount === 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {b.pendingAmount === 0 ? "✓ Fully Paid" : `Due: ${formatINR(b.pendingAmount)}`}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenPrintableVoucher(b)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold border border-amber-500/30 transition cursor-pointer"
                        title="1-Click Printable Voucher"
                      >
                        🎟️ Voucher
                      </button>
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition cursor-pointer"
                      >
                        Manage ⚙️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over Booking Workspace Drawer */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">{selectedBooking.bookingNumber}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {selectedBooking.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedBooking.destination || selectedBooking.packageName} • Customer:{" "}
                  <strong className="text-white">{selectedBooking.customer?.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-slate-800 px-6 gap-2 bg-slate-950/20">
              {(
                [
                  { key: "OVERVIEW", label: "Overview", icon: "📋" },
                  { key: "HOTELS", label: "Hotels", icon: "🏨" },
                  { key: "TRANSPORT", label: "Transport & Chauffeur", icon: "🚗" },
                  { key: "VOUCHER", label: "Travel Voucher", icon: "🎟️" },
                  { key: "FINANCE", label: "Finance & Profit", icon: "💰" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                    activeTab === tab.key
                      ? "border-amber-500 text-amber-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-6 flex-1 space-y-6 text-xs">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "OVERVIEW" && (
                <div className="space-y-6">
                  {/* Status Matrix */}
                  <div className="grid grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Trip Stage</p>
                      <p className="text-xs font-black text-white mt-1">{selectedBooking.status}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Hotel Status</p>
                      <p className="text-xs font-black text-amber-400 mt-1">{selectedBooking.hotelStatus}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Cab / Driver</p>
                      <p className="text-xs font-black text-sky-400 mt-1">{selectedBooking.transportStatus}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Payments</p>
                      <p className="text-xs font-black text-emerald-400 mt-1">{selectedBooking.financeStatus}</p>
                    </div>
                  </div>

                  {/* Traveler Details */}
                  <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
                    <h4 className="font-black text-slate-200 text-xs uppercase tracking-wider">Primary Traveler</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-500 block">Name:</span>
                        <span className="text-white font-bold text-sm">{selectedBooking.customer?.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Phone:</span>
                        <span className="text-white font-bold text-sm">{selectedBooking.customer?.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Email:</span>
                        <span className="text-white font-semibold">{selectedBooking.customer?.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Party Size:</span>
                        <span className="text-white font-semibold">
                          {selectedBooking.travellers?.adults} Adults
                          {selectedBooking.travellers?.children ? `, ${selectedBooking.travellers.children} Children` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Travel Dates */}
                  <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-2">
                    <h4 className="font-black text-slate-200 text-xs uppercase tracking-wider">Itinerary Duration</h4>
                    <p className="text-slate-300 text-sm">
                      📅{" "}
                      <strong>
                        {selectedBooking.travelDates?.from
                          ? new Date(selectedBooking.travelDates.from).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Flexible"}{" "}
                        to{" "}
                        {selectedBooking.travelDates?.to
                          ? new Date(selectedBooking.travelDates.to).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Flexible"}
                      </strong>{" "}
                      ({selectedBooking.nights} Nights)
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: HOTEL OPERATIONS */}
              {activeTab === "HOTELS" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white">Hotel Reservations &amp; Allocations</h3>
                      <p className="text-slate-400 text-xs">Direct hotel confirmation codes and supplier costs.</p>
                    </div>
                    <button
                      onClick={() => setHotelModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
                    >
                      + Confirm Hotel
                    </button>
                  </div>

                  {(selectedBooking.hotelBookings || []).length === 0 ? (
                    <div className="p-8 text-center bg-slate-800/20 rounded-2xl border border-slate-800 text-slate-400">
                      No hotel rooms allocated yet. Click &quot;+ Confirm Hotel&quot; to assign.
                    </div>
                  ) : (
                    (selectedBooking.hotelBookings || []).map((h, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-black text-white text-sm">{h.hotelName}</div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              h.status === "CONFIRMED" || h.status === "VOUCHERED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {h.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-300">
                          <div>
                            <span className="text-slate-500 block">Room Category:</span>
                            <span className="font-semibold text-white">{h.roomType}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Meal Plan:</span>
                            <span className="font-semibold text-white">{h.mealPlan}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Confirmation Code:</span>
                            <span className="font-bold text-amber-400">{h.confirmationNumber || "Pending Code"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Rooms:</span>
                            <span className="font-semibold">{h.roomsCount} Room(s)</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Supplier Cost:</span>
                            <span className="font-semibold text-rose-400">{formatINR(h.cost)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Hotel Voucher:</span>
                            <span className="font-bold text-sky-400">{h.voucherCode || "Not Generated"}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                          <button
                            onClick={() => handleIssueHotelVoucher()}
                            className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold text-xs border border-sky-500/30 cursor-pointer"
                          >
                            🎟️ Issue Hotel Voucher
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: TRANSPORT OPERATIONS */}
              {activeTab === "TRANSPORT" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white">Chauffeur &amp; Vehicle Allocation</h3>
                      <p className="text-slate-400 text-xs">Assign dedicated sanitized cabs, drivers, and dispatches.</p>
                    </div>
                    <button
                      onClick={() => setTransportModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs cursor-pointer"
                    >
                      + Assign Chauffeur
                    </button>
                  </div>

                  {(selectedBooking.transportBookings || []).length === 0 ? (
                    <div className="p-8 text-center bg-slate-800/20 rounded-2xl border border-slate-800 text-slate-400">
                      No vehicles assigned yet. Click &quot;+ Assign Chauffeur&quot; to assign.
                    </div>
                  ) : (
                    (selectedBooking.transportBookings || []).map((t, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-black text-white text-sm">{t.serviceName}</div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              t.status === "ASSIGNED" || t.status === "DISPATCHED"
                                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                : t.status === "COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-300">
                          <div>
                            <span className="text-slate-500 block">Vehicle Model:</span>
                            <span className="font-semibold text-white">{t.vehicleType}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Registration Plate:</span>
                            <span className="font-bold text-amber-400">{t.vehicleNumber || "Unassigned"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Chauffeur Name:</span>
                            <span className="font-bold text-white">{t.driverName || "Unassigned"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Chauffeur Contact:</span>
                            <span className="font-semibold text-sky-400">{t.driverPhone || "—"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Pickup Location:</span>
                            <span className="font-semibold text-slate-200">{t.pickupLocation}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Cab Cost:</span>
                            <span className="font-semibold text-rose-400">{formatINR(t.cost)}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                          <button
                            onClick={() => handleDispatchTransport()}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 cursor-pointer"
                          >
                            🚀 Mark Dispatched
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: TRAVEL VOUCHER */}
              {activeTab === "VOUCHER" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white">Official Trip Vouchers</h3>
                      <p className="text-slate-400 text-xs">Printable, exportable vouchers for hotels and chauffeured transfers.</p>
                    </div>
                    <button
                      onClick={() => handleOpenPrintableVoucher(selectedBooking)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
                    >
                      🎟️ Generate &amp; Print Full Voucher
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
                    <p className="text-slate-300">
                      The official Be My Traveller voucher includes all confirmed hotels, room voucher codes, driver
                      contacts, vehicle registration numbers, daily meal inclusions, and our 24/7 on-tour emergency hotline.
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenPrintableVoucher(selectedBooking)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
                      >
                        👁️ Preview Voucher
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FINANCE & PROFITABILITY */}
              {activeTab === "FINANCE" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white">Financial Controls &amp; Profitability</h3>
                      <p className="text-slate-400 text-xs">Customer receivables, vendor payables, and gross margin.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPaymentModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer"
                      >
                        + Record Payment
                      </button>
                      <button
                        onClick={() => setSupplierPayModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs cursor-pointer"
                      >
                        + Request Supplier Payable
                      </button>
                    </div>
                  </div>

                  {/* Financial Breakdown Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Total Invoiced</span>
                      <p className="text-sm font-black text-white mt-1">{formatINR(selectedBooking.totalAmount)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Customer Paid</span>
                      <p className="text-sm font-black text-emerald-400 mt-1">{formatINR(selectedBooking.paidAmount)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Balance Due</span>
                      <p className="text-sm font-black text-rose-400 mt-1">{formatINR(selectedBooking.pendingAmount)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Gross Margin</span>
                      <p className="text-sm font-black text-amber-400 mt-1">
                        {selectedBooking.financeSummary?.profitMarginPercent ?? 35}%
                      </p>
                    </div>
                  </div>

                  {/* Profitability Calculation */}
                  <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-2">
                    <h4 className="font-black text-slate-200 text-xs uppercase tracking-wider">
                      Trip Profitability Snapshot
                    </h4>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span>Total Customer Revenue:</span>
                        <span className="font-bold text-white">{formatINR(selectedBooking.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>Total Supplier Cost (Hotels + Cab):</span>
                        <span className="font-bold">
                          -{formatINR(selectedBooking.financeSummary?.totalSupplierCost ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-700 text-sm font-black text-emerald-400">
                        <span>Estimated Gross Profit:</span>
                        <span>{formatINR(selectedBooking.financeSummary?.grossProfit ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CONFIRM HOTEL */}
      {hotelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Confirm Hotel Reservation</h3>
              <button onClick={() => setHotelModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>
            <form onSubmit={handleConfirmHotel} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Hotel Direct Confirmation Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KHY-GUL-9022 / HTL-2026-CONF"
                  value={hotelForm.confirmationNumber}
                  onChange={(e) => setHotelForm({ ...hotelForm, confirmationNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Supplier / Hotel Purchase Cost (₹)</label>
                <input
                  type="number"
                  required
                  value={hotelForm.supplierCost}
                  onChange={(e) => setHotelForm({ ...hotelForm, supplierCost: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Notes / Room Details</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Mountain View Deluxe room with extra bed confirmed"
                  value={hotelForm.notes}
                  onChange={(e) => setHotelForm({ ...hotelForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setHotelModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer"
                >
                  Save &amp; Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN TRANSPORT */}
      {transportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Assign Chauffeur &amp; Dedicated Vehicle</h3>
              <button
                onClick={() => setTransportModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAssignTransport} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Chauffeur Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Ahmad"
                    value={transportForm.driverName}
                    onChange={(e) => setTransportForm({ ...transportForm, driverName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Chauffeur Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 94190 55667"
                    value={transportForm.driverPhone}
                    onChange={(e) => setTransportForm({ ...transportForm, driverPhone: e.target.value })}
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
                    placeholder="e.g. Innova Crysta"
                    value={transportForm.vehicleType}
                    onChange={(e) => setTransportForm({ ...transportForm, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Registration Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JK-01-AB-1234"
                    value={transportForm.vehicleNumber}
                    onChange={(e) => setTransportForm({ ...transportForm, vehicleNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Transport Cost (₹)</label>
                <input
                  type="number"
                  required
                  value={transportForm.supplierCost}
                  onChange={(e) => setTransportForm({ ...transportForm, supplierCost: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black cursor-pointer"
                >
                  Assign Chauffeur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD CUSTOMER PAYMENT */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Record Customer Payment</h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRecordCustomerPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Payment Type</label>
                  <select
                    value={paymentForm.paymentType}
                    onChange={(e: any) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="ADVANCE">Advance (Initial)</option>
                    <option value="PARTIAL">Partial Payment</option>
                    <option value="FINAL">Final Settlement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e: any) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="UPI">UPI / Google Pay</option>
                    <option value="BANK_TRANSFER">Bank NEFT / IMPS</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Bank / Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-REF-992211 or Bank UTR"
                  value={paymentForm.providerPaymentId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, providerPaymentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REQUEST SUPPLIER PAYABLE */}
      {supplierPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Request Supplier Payable</h3>
              <button
                onClick={() => setSupplierPayModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRequestSupplierPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Supplier / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Khyber Himalayan Resort / Tariq Travels"
                  value={supplierPayForm.supplierName}
                  onChange={(e) => setSupplierPayForm({ ...supplierPayForm, supplierName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Service Type</label>
                  <select
                    value={supplierPayForm.serviceType}
                    onChange={(e: any) => setSupplierPayForm({ ...supplierPayForm, serviceType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="HOTEL">Hotel Stay</option>
                    <option value="TRANSPORT">Cab / Chauffeur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Payable Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={supplierPayForm.amount}
                    onChange={(e) => setSupplierPayForm({ ...supplierPayForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSupplierPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black cursor-pointer"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: 1-CLICK PRINTABLE TRAVEL VOUCHER */}
      {voucherModalOpen && printableVoucherData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            {/* Voucher Branding Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">BE MY TRAVELLER</h2>
                <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">
                  Verified Luxury Travel Voucher
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-slate-500 block">Voucher Ref:</span>
                <span className="font-mono text-sm font-black text-slate-900">{printableVoucherData.voucherNumber}</span>
              </div>
            </div>

            {/* Traveler & Trip Overview */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-500 block font-semibold">Traveler Name:</span>
                <span className="font-bold text-slate-900 text-sm">{printableVoucherData.customerName}</span>
                <span className="text-slate-600 block">{printableVoucherData.customerPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Destination:</span>
                <span className="font-bold text-slate-900 text-sm">{printableVoucherData.destination}</span>
                <span className="text-slate-600 block">{printableVoucherData.paxSummary}</span>
              </div>
            </div>

            {/* Confirmed Hotels */}
            {printableVoucherData.hotels && printableVoucherData.hotels.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                  🏨 Confirmed Hotel Stay
                </h4>
                {printableVoucherData.hotels.map((h: any, i: number) => (
                  <div key={i} className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{h.hotelName}</span>
                      <span className="text-amber-700">Code: {h.confirmationNumber || h.voucherCode || "Direct"}</span>
                    </div>
                    <p className="text-slate-600">
                      {h.roomType} • {h.mealPlan}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Confirmed Transport & Chauffeur */}
            {printableVoucherData.transports && printableVoucherData.transports.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                  🚗 Dedicated Chauffeur &amp; Vehicle
                </h4>
                {printableVoucherData.transports.map((t: any, i: number) => (
                  <div key={i} className="p-3 bg-sky-500/5 rounded-xl border border-sky-500/20 space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>
                        {t.vehicleType} ({t.vehicleNumber || "Assigned"})
                      </span>
                      <span className="text-sky-700">Driver: {t.driverName || "On Duty"}</span>
                    </div>
                    <p className="text-slate-600">
                      Chauffeur Contact: <strong>{t.driverPhone || "+91 80916 38090"}</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 24/7 Hotline */}
            <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-700">
              24x7 Dedicated Trip Support Hotline: <strong>+91 80916 38090</strong> | operations@bemytraveller.com
            </div>

            {/* Print and Close buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setVoucherModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md cursor-pointer"
              >
                🖨️ Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
