"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import MediaPickerModal, { MediaItem } from "@/components/common/MediaPickerModal";
import { formatINR } from "@/lib/utils";

export type TransferCategory =
  | "ALL"
  | "AIRPORT_RAILWAY"
  | "INTERCITY"
  | "HILL_STATION"
  | "LOCAL_SIGHTSEEING"
  | "OVERNIGHT_VOLVO"
  | "ISLAND_WATER"
  | "HELICOPTER_SHUTTLE";

export type VehicleCategory =
  | "ALL"
  | "SEDAN"
  | "SUV"
  | "LUXURY"
  | "TEMPO"
  | "BUS"
  | "WATERCRAFT"
  | "AIRCRAFT";

export interface ITransferItem {
  _id: string;
  name: string;
  category: string;
  type: string;
  vehicle: string;
  vehicleModel?: string;
  vehicleCategory?: string;
  fromCity: string;
  toCity: string;
  fromLocation?: string;
  toLocation?: string;
  fromCountry?: string;
  toCountry?: string;
  fromState?: string;
  toState?: string;
  distanceKm?: number;
  duration: string;
  maxSeats: number;
  luggageCapacity?: string;
  pricingModel: "PER_VEHICLE" | "PER_PASSENGER" | "PER_DAY";
  costPerUnit: number;
  originalPrice?: number;
  discountPercent?: number;
  discountBadge?: string;
  currency: string;
  amenities?: string[];
  inclusions?: string[];
  exclusions?: string[];
  pickupGuidelines?: string;
  coverImage?: string;
  supplierName?: string;
  isPopular?: boolean;
  isSnowChainEquipped?: boolean;
  tollPermitIncluded?: boolean;
  status: "ACTIVE" | "INACTIVE" | "SEASONAL";
  createdAt?: string;
}

const CATEGORY_TABS: { id: TransferCategory; label: string; icon: string }[] = [
  { id: "ALL", label: "All Fleet & Routes", icon: "🌐" },
  { id: "AIRPORT_RAILWAY", label: "Airport & Railway", icon: "✈️" },
  { id: "INTERCITY", label: "Intercity Cabs", icon: "🛣️" },
  { id: "HILL_STATION", label: "Hill Station & 4x4", icon: "🏔️" },
  { id: "OVERNIGHT_VOLVO", label: "Luxury Volvo", icon: "🚌" },
  { id: "ISLAND_WATER", label: "Ferry & Speedboat", icon: "🚤" },
  { id: "HELICOPTER_SHUTTLE", label: "Helicopter Shuttle", icon: "🚁" },
];

const VEHICLE_CATEGORIES: { id: VehicleCategory; label: string }[] = [
  { id: "ALL", label: "All Vehicles" },
  { id: "SEDAN", label: "Sedan (4-Seater)" },
  { id: "SUV", label: "SUV (6+1 Seater)" },
  { id: "LUXURY", label: "Luxury VIP" },
  { id: "TEMPO", label: "Tempo Traveller" },
  { id: "BUS", label: "Volvo / Bus" },
  { id: "WATERCRAFT", label: "Ferry / Boat" },
  { id: "AIRCRAFT", label: "Helicopter / Air" },
];

const PRESET_VEHICLE_IMAGES = [
  { label: "AC Sedan (Dzire)", url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80" },
  { label: "Prime SUV (Innova)", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80" },
  { label: "Snow 4x4 Terrain", url: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=80" },
  { label: "Luxury VIP Chauffeur", url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80" },
  { label: "Volvo Luxury Coach", url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80" },
  { label: "Catamaran Island Ferry", url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80" },
  { label: "Kedarnath Helicopter", url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=900&q=80" },
  { label: "Maharaja Tempo 12-Seater", url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=80" },
];

const COMMON_AMENITIES = [
  "Air Conditioning",
  "Complimentary Bottled Water",
  "Luggage Carrier",
  "Music System & Aux",
  "USB Mobile Charging",
  "Pre-Sanitized Interior",
  "Snow Chains Equipped",
  "Pushback Reclining Seats",
  "First Aid Kit",
  "English Speaking Chauffeur",
  "Flight / Train Delay Tracking",
  "VIP Placard Meet & Greet",
];

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState<ITransferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<TransferCategory>("ALL");
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState<VehicleCategory>("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<ITransferItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"route" | "vehicle" | "pricing" | "inclusions">("route");
  const [formError, setFormError] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Success Toast
  const [saveSuccess, setSaveSuccess] = useState<{
    isOpen: boolean;
    name: string;
    action: "created" | "updated";
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "INTERCITY",
    type: "PRIVATE_CAR",
    vehicle: "Toyota Innova Crysta",
    vehicleModel: "Innova Crysta AC (6+1 Seater)",
    vehicleCategory: "SUV",
    fromCity: "Chandigarh",
    toCity: "Shimla",
    fromLocation: "Chandigarh Airport (IXC) / Railway Station",
    toLocation: "Shimla Hotel / Mall Road Drop Point",
    fromCountry: "India",
    toCountry: "India",
    fromState: "Punjab",
    toState: "Himachal Pradesh",
    distanceKm: 115,
    duration: "3.5 Hours",
    maxSeats: 6,
    luggageCapacity: "3 Large + 3 Small Bags",
    pricingModel: "PER_VEHICLE" as "PER_VEHICLE" | "PER_PASSENGER" | "PER_DAY",
    costPerUnit: 3500,
    originalPrice: 4500,
    discountPercent: 22,
    discountBadge: "Save 22% Today · Free Tolls Included",
    currency: "INR",
    amenities: ["Air Conditioning", "Complimentary Bottled Water", "Pre-Sanitized Interior"],
    inclusions: [
      "Dedicated sanitized vehicle with experienced hill chauffeur",
      "All Highway Tolls, Green Tax & State Border Permits",
      "Fuel, Parking & Driver Allowance included",
      "Complimentary 60 mins flight/train delay waiting time",
    ],
    exclusions: ["Sightseeing deviations outside booked route", "Night driving surcharge (11 PM - 5 AM)"],
    pickupGuidelines: "Driver will meet you at Arrival Gate with your name placard. 24/7 BMT concierge assistance.",
    coverImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    supplierName: "BMT Royal Himalayan Fleet",
    isPopular: true,
    isSnowChainEquipped: false,
    tollPermitIncluded: true,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "SEASONAL",
  });

  // Fetch Transfers
  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (activeCategory !== "ALL") params.set("category", activeCategory);
      if (selectedVehicleCategory !== "ALL") params.set("vehicleCategory", selectedVehicleCategory);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/v1/admin/transfers?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.transfers) {
        setTransfers(data.transfers);
      }
    } catch (err) {
      console.error("Failed to load transfers:", err);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, selectedVehicleCategory, statusFilter]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingTransfer(null);
    setFormError(null);
    setActiveModalTab("route");
    setFormData({
      name: "",
      category: "INTERCITY",
      type: "PRIVATE_CAR",
      vehicle: "Swift Dzire / Toyota Etios (AC Sedan)",
      vehicleModel: "Swift Dzire / Etios",
      vehicleCategory: "SEDAN",
      fromCity: "",
      toCity: "",
      fromLocation: "",
      toLocation: "",
      fromCountry: "India",
      toCountry: "India",
      fromState: "",
      toState: "",
      distanceKm: 120,
      duration: "3.5 Hours",
      maxSeats: 4,
      luggageCapacity: "2 Large + 2 Small Bags",
      pricingModel: "PER_VEHICLE",
      costPerUnit: 3200,
      originalPrice: 4200,
      discountPercent: 24,
      discountBadge: "Save 24% Today · Free Tolls Included",
      currency: "INR",
      amenities: ["Air Conditioning", "Complimentary Bottled Water", "Pre-Sanitized Interior"],
      inclusions: [
        "Dedicated sanitized vehicle with experienced hill chauffeur",
        "All Highway Tolls, Green Tax & State Border Permits",
        "Fuel, Parking & Driver Allowance included",
        "Complimentary 60 mins flight/train delay waiting time",
      ],
      exclusions: ["Sightseeing deviations outside booked route", "Night driving surcharge (11 PM - 5 AM)"],
      pickupGuidelines: "Driver will meet you at Arrival Gate with your name placard.",
      coverImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
      supplierName: "Himalayan Prime Chauffeurs",
      isPopular: true,
      isSnowChainEquipped: false,
      tollPermitIncluded: true,
      status: "ACTIVE",
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (t: ITransferItem) => {
    setEditingTransfer(t);
    setFormError(null);
    setActiveModalTab("route");
    const cost = t.costPerUnit || 0;
    const orig = t.originalPrice || Math.round(cost * 1.25);
    const disc = t.discountPercent || (orig > cost ? Math.round(((orig - cost) / orig) * 100) : 0);

    setFormData({
      name: t.name || "",
      category: t.category || "INTERCITY",
      type: t.type || "PRIVATE_CAR",
      vehicle: t.vehicle || "",
      vehicleModel: t.vehicleModel || t.vehicle || "",
      vehicleCategory: (t.vehicleCategory as any) || "SEDAN",
      fromCity: t.fromCity || "",
      toCity: t.toCity || "",
      fromLocation: t.fromLocation || "",
      toLocation: t.toLocation || "",
      fromCountry: t.fromCountry || "India",
      toCountry: t.toCountry || "India",
      fromState: t.fromState || "",
      toState: t.toState || "",
      distanceKm: t.distanceKm || 0,
      duration: t.duration || "2 Hours",
      maxSeats: t.maxSeats || 4,
      luggageCapacity: t.luggageCapacity || "2 Large + 2 Small Bags",
      pricingModel: t.pricingModel || "PER_VEHICLE",
      costPerUnit: cost,
      originalPrice: orig,
      discountPercent: disc,
      discountBadge: t.discountBadge || `Save ${disc}% Today`,
      currency: t.currency || "INR",
      amenities: Array.isArray(t.amenities) ? t.amenities : [],
      inclusions: Array.isArray(t.inclusions) ? t.inclusions : [],
      exclusions: Array.isArray(t.exclusions) ? t.exclusions : [],
      pickupGuidelines: t.pickupGuidelines || "",
      coverImage: t.coverImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
      supplierName: t.supplierName || "Be My Traveller Fleet Partner",
      isPopular: Boolean(t.isPopular),
      isSnowChainEquipped: Boolean(t.isSnowChainEquipped),
      tollPermitIncluded: t.tollPermitIncluded !== undefined ? Boolean(t.tollPermitIncluded) : true,
      status: t.status || "ACTIVE",
    });
    setModalOpen(true);
  };

  // Delete Transfer
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete transfer route "${name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/transfers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTransfers();
      } else {
        alert("Failed to delete transfer product");
      }
    } catch (err: any) {
      alert(err?.message || "Error deleting transfer");
    }
  };

  // Toggle Status
  const handleToggleStatus = async (t: ITransferItem) => {
    const nextStatus = t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await fetch(`/api/v1/admin/transfers/${t._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchTransfers();
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  // Save Transfer Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const endpoint = editingTransfer
        ? `/api/v1/admin/transfers/${editingTransfer._id}`
        : "/api/v1/admin/transfers";
      const method = editingTransfer ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const savedName = formData.name;
        const actionType = editingTransfer ? "updated" : "created";
        setModalOpen(false);
        setEditingTransfer(null);
        setSaveSuccess({
          isOpen: true,
          name: savedName,
          action: actionType,
        });
        fetchTransfers();
      } else {
        const errData = await res.json();
        setFormError(errData.error || errData.detail || "Failed to save transfer. Please verify required fields.");
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Amenity Selection
  const toggleAmenity = (item: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(item);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== item)
          : [...prev.amenities, item],
      };
    });
  };

  // Metrics Calculations
  const totalFleet = transfers.length;
  const activeRoutes = transfers.filter((t) => t.status === "ACTIVE").length;
  const popularCount = transfers.filter((t) => t.isPopular).length;
  const avgCost = totalFleet > 0 ? Math.round(transfers.reduce((acc, t) => acc + (t.costPerUnit || 0), 0) / totalFleet) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12" data-watermark="RRDS">
      {/* ── Page Header & Top Action Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
              Transit &amp; Fleet Logistics CMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Transfers, Cabs &amp; Fleet Inventory
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage airport meet &amp; greets, intercity hill-cabs, luxury Volvo buses, island ferries &amp; helicopter shuttles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
          >
            <span className="text-sm">＋</span>
            <span>Add Transfer Route</span>
          </button>
        </div>
      </div>

      {/* ── Dashboard Metrics Ribbon ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl shrink-0">
            🚕
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Routes</span>
            <span className="text-2xl font-black text-white">{totalFleet}</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
            ✅
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Fleet</span>
            <span className="text-2xl font-black text-emerald-400">{activeRoutes}</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl shrink-0">
            🔥
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Featured / Popular</span>
            <span className="text-2xl font-black text-amber-400">{popularCount}</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl shrink-0">
            💰
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg. Base Fare</span>
            <span className="text-2xl font-black text-purple-300">{formatINR(avgCost)}</span>
          </div>
        </div>
      </div>

      {/* ── Category Filter Tabs Bar ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeCategory === tab.id
                ? "bg-amber-500 text-slate-950 shadow-md font-black shadow-amber-500/20"
                : "bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Search, Vehicle Filter & View Switcher Bar ── */}
      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search by city, vehicle (Innova, Volvo), route origin or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Vehicle Category Filter */}
          <select
            value={selectedVehicleCategory}
            onChange={(e) => setSelectedVehicleCategory(e.target.value as VehicleCategory)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
          >
            {VEHICLE_CATEGORIES.map((vc) => (
              <option key={vc.id} value={vc.id}>
                {vc.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive / Hidden</option>
            <option value="SEASONAL">Seasonal Only</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-slate-800 text-amber-400" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Grid View"
            >
              ▦ Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table" ? "bg-slate-800 text-amber-400" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Table View"
            >
              ☰ Table
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Inventory Content ── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Loading transfer fleet and route inventory...</span>
        </div>
      ) : transfers.length === 0 ? (
        <div className="bg-slate-900/30 rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <div className="text-4xl">🚗</div>
          <h3 className="text-lg font-bold text-white">No transfer routes found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try resetting your search filters or click &apos;Add Transfer Route&apos; to create a new cab or fleet item.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
          >
            ＋ Add First Transfer Route
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── Rich Card Grid View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {transfers.map((t) => {
            const pricingUnitLabel =
              t.pricingModel === "PER_PASSENGER"
                ? " / seat"
                : t.pricingModel === "PER_DAY"
                ? " / day"
                : " / vehicle";

            return (
              <div
                key={t._id}
                className="bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden transition-all duration-200 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Vehicle Image Banner */}
                  <div className="relative h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={t.coverImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80"}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-xs">
                        {t.category.replace(/_/g, " ")}
                      </span>
                      {t.isSnowChainEquipped && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-600/90 text-white backdrop-blur-xs">
                          ❄️ Snow-Chain 4x4
                        </span>
                      )}
                      {t.isPopular && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600/90 text-white backdrop-blur-xs">
                          🔥 Popular
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleStatus(t)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase cursor-pointer border ${
                          t.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30"
                        }`}
                      >
                        {t.status}
                      </button>
                    </div>

                    {/* Bottom Specs on Image */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
                      <span className="font-bold flex items-center gap-1">
                        <span>🚗</span> {t.vehicle}
                      </span>
                      <span className="bg-slate-950/80 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-300">
                        👥 {t.maxSeats} Seats
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3.5">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                        {t.name}
                      </h3>
                      {/* Route Path Pill */}
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                        <span className="text-amber-400 font-bold">📍 {t.fromCity}</span>
                        <span className="text-slate-500">➔</span>
                        <span className="text-emerald-400 font-bold">📍 {t.toCity}</span>
                        {t.distanceKm ? <span className="text-[10px] text-slate-400 ml-auto">{t.distanceKm} km</span> : null}
                      </div>
                    </div>

                    {/* Fast Specs */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-y border-slate-800/80 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span>⏱️</span>
                        <span>{t.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>🧳</span>
                        <span className="line-clamp-1">{t.luggageCapacity || "Standard Bags"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>🏷️</span>
                        <span className="text-slate-300">{t.tollPermitIncluded ? "Tolls & Permits Included" : "Tolls Extra"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>🏢</span>
                        <span className="line-clamp-1">{t.supplierName || "BMT Chauffeur"}</span>
                      </div>
                    </div>

                    {/* Inclusions Chips */}
                    {t.inclusions && t.inclusions.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Key Features:</span>
                        <div className="flex flex-wrap gap-1">
                          {t.inclusions.slice(0, 2).map((inc, i) => (
                            <span key={i} className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 line-clamp-1">
                              ✓ {inc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Pricing & Action Buttons */}
                <div className="p-5 pt-0">
                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-amber-400">
                          {formatINR(t.costPerUnit)}
                        </span>
                        <span className="text-[10px] text-slate-400">{pricingUnitLabel}</span>
                      </div>
                      {t.originalPrice && t.originalPrice > t.costPerUnit ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500 line-through">
                            {formatINR(t.originalPrice)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400">
                            {t.discountPercent || Math.round(((t.originalPrice - t.costPerUnit) / t.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(t)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t._id, t.name)}
                        className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
                        title="Delete Route"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Structured Table View ── */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] font-black uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Route &amp; Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Vehicle &amp; Specs</th>
                  <th className="p-4">Origin ➔ Destination</th>
                  <th className="p-4">Duration / Dist.</th>
                  <th className="p-4">Base Rate</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transfers.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={t.coverImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=300&q=80"}
                          alt=""
                          className="w-12 h-10 rounded-lg object-cover bg-slate-950"
                        />
                        <div>
                          <span className="font-bold text-white block line-clamp-1">{t.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t.supplierName || "Be My Traveller Fleet"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 text-amber-400 border border-amber-500/20">
                        {t.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-200 block">{t.vehicle}</span>
                      <span className="text-[10px] text-slate-400">👥 {t.maxSeats} Seats · {t.luggageCapacity}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-200 font-medium">
                        <span>📍 {t.fromCity}</span>
                        <span className="text-slate-500 mx-1">➔</span>
                        <span>📍 {t.toCity}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="block font-medium text-slate-300">{t.duration}</span>
                      {t.distanceKm ? <span className="text-[10px] text-slate-400">{t.distanceKm} km</span> : null}
                    </td>
                    <td className="p-4">
                      <div className="font-black text-amber-400 text-sm">
                        {formatINR(t.costPerUnit)}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {t.pricingModel === "PER_PASSENGER" ? "per seat" : t.pricingModel === "PER_DAY" ? "per day" : "per cab"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(t)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase cursor-pointer border ${
                          t.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-red-500/20 text-red-400 border-red-500/40"
                        }`}
                      >
                        {t.status}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(t)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.name)}
                          className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Enlarged 4-Tab Transfer Builder Modal (Max-W-5xl) ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] my-4">
            {/* Modal Top Bar */}
            <div className="p-5 sm:px-7 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚗</span>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                    {editingTransfer ? `Edit Transfer: ${editingTransfer.name}` : "Add New Transfer & Fleet Route"}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {formData.name || "Transfer Product & Chauffeur Settings"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer text-base"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex items-center gap-1.5 px-6 pt-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto scrollbar-none">
              {[
                { id: "route", label: "Route & Geographic Origins", icon: "🗺️" },
                { id: "vehicle", label: "Fleet & Vehicle Specs", icon: "🚗" },
                { id: "pricing", label: "Pricing & Discounts", icon: "💰" },
                { id: "inclusions", label: "Features, Inclusions & Media", icon: "📋" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveModalTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeModalTab === tab.id
                      ? "border-amber-500 text-amber-400 bg-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                  ⚠️ {formError}
                </div>
              )}

              {/* TAB 1: Route & Geographic Details */}
              {activeModalTab === "route" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Transfer Route Title <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Chandigarh Airport / Railway Station → Shimla Queen of Hills"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Origin City <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fromCity}
                        onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
                        placeholder="e.g. Chandigarh, Delhi, Srinagar, Kochi, Dubai"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Destination City <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.toCity}
                        onChange={(e) => setFormData({ ...formData, toCity: e.target.value })}
                        placeholder="e.g. Shimla, Manali, Gulmarg, Munnar, Downtown"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Specific Pickup Location / Hub</label>
                      <input
                        type="text"
                        value={formData.fromLocation}
                        onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                        placeholder="e.g. Chandigarh Airport (IXC) / Rly Station / City Hotel"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Specific Drop Location / Point</label>
                      <input
                        type="text"
                        value={formData.toLocation}
                        onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                        placeholder="e.g. Any Hotel in Shimla / Mall Road Lift Point"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Distance (approx. km)</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.distanceKm}
                        onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })}
                        placeholder="115"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Estimated Duration</label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g. 3.5 Hours, 45 Mins, Overnight 12h"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Origin State / Region</label>
                      <input
                        type="text"
                        value={formData.fromState}
                        onChange={(e) => setFormData({ ...formData, fromState: e.target.value })}
                        placeholder="e.g. Punjab / Delhi"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Destination State</label>
                      <input
                        type="text"
                        value={formData.toState}
                        onChange={(e) => setFormData({ ...formData, toState: e.target.value })}
                        placeholder="e.g. Himachal Pradesh"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Fleet & Vehicle Specifications */}
              {activeModalTab === "vehicle" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Transfer Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        <option value="AIRPORT_RAILWAY">Airport &amp; Railway Meet &amp; Greet</option>
                        <option value="INTERCITY">Intercity Road Trip</option>
                        <option value="HILL_STATION">Hill Station &amp; High Altitude Cab</option>
                        <option value="OVERNIGHT_VOLVO">Overnight Volvo / Sleeper Coach</option>
                        <option value="ISLAND_WATER">Ferry &amp; Speedboat Water Transfer</option>
                        <option value="HELICOPTER_SHUTTLE">Helicopter / Aerial Shuttle</option>
                        <option value="LOCAL_SIGHTSEEING">Full-Day Local Sightseeing Chauffeur</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Vehicle Category</label>
                      <select
                        value={formData.vehicleCategory}
                        onChange={(e) => setFormData({ ...formData, vehicleCategory: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        <option value="SEDAN">Sedan (4-Seater Dzire/Etios)</option>
                        <option value="SUV">SUV (6+1 Innova/Crysta/Scorpio)</option>
                        <option value="LUXURY">Luxury VIP (Mercedes/BMW/Lexus)</option>
                        <option value="TEMPO">Tempo Traveller (12/17/26 Seater)</option>
                        <option value="BUS">Volvo / Multi-Axle Bus</option>
                        <option value="WATERCRAFT">Ferry / Speedboat</option>
                        <option value="AIRCRAFT">Helicopter / Aircraft</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Transit Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        <option value="PRIVATE_CAR">Private Car / Sedan</option>
                        <option value="SUV_CAB">SUV Hill Cab</option>
                        <option value="LUXURY_VIP">Luxury VIP Limousine</option>
                        <option value="TEMPO_TRAVELLER">Tempo Traveller</option>
                        <option value="VOLVO_BUS">Volvo AC Bus</option>
                        <option value="FERRY">Island Passenger Ferry</option>
                        <option value="SPEEDBOAT">Speedboat</option>
                        <option value="HELICOPTER">Helicopter Shuttle</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Vehicle Name <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.vehicle}
                        onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                        placeholder="e.g. Toyota Innova Crysta (6+1 Seater Captain Seats)"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Vehicle Model / Fleet Series</label>
                      <input
                        type="text"
                        value={formData.vehicleModel}
                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                        placeholder="e.g. Innova Crysta Luxury / Force Urbania"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Max Passenger Seating Capacity</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={formData.maxSeats}
                        onChange={(e) => setFormData({ ...formData, maxSeats: Number(e.target.value) })}
                        placeholder="4"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Luggage Allowance / Capacity</label>
                      <input
                        type="text"
                        value={formData.luggageCapacity}
                        onChange={(e) => setFormData({ ...formData, luggageCapacity: e.target.value })}
                        placeholder="e.g. 4 Large Suitcases + 3 Handbags"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Operational Checkboxes */}
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={formData.tollPermitIncluded}
                        onChange={(e) => setFormData({ ...formData, tollPermitIncluded: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                      />
                      <span>Tolls &amp; Border Permits Included</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={formData.isSnowChainEquipped}
                        onChange={(e) => setFormData({ ...formData, isSnowChainEquipped: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                      />
                      <span>❄️ Snow-Chain / 4x4 Hill Equipped</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={formData.isPopular}
                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                      />
                      <span>🔥 Featured &amp; Popular Route</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 3: Pricing & Discounts */}
              {activeModalTab === "pricing" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Pricing Model</label>
                      <select
                        value={formData.pricingModel}
                        onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        <option value="PER_VEHICLE">Per Vehicle / Cab (Fixed Route Rate)</option>
                        <option value="PER_PASSENGER">Per Passenger / Seat (Volvo / Heli / Ferry)</option>
                        <option value="PER_DAY">Per Day (Dedicated Chauffeur &amp; Cab)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        <option value="INR">INR (₹ - Indian Rupee)</option>
                        <option value="AED">AED (United Arab Emirates Dirham)</option>
                        <option value="USD">USD ($ - US Dollar)</option>
                        <option value="EUR">EUR (€ - Euro)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Publish Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        <option value="ACTIVE">Active (Available for Booking)</option>
                        <option value="INACTIVE">Inactive / Hidden</option>
                        <option value="SEASONAL">Seasonal Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Base Selling Price</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formData.costPerUnit}
                        onChange={(e) => {
                          const p = Number(e.target.value);
                          const orig = formData.originalPrice || Math.round(p * 1.25);
                          const disc = orig > p ? Math.round(((orig - p) / orig) * 100) : 0;
                          setFormData((prev) => ({
                            ...prev,
                            costPerUnit: p,
                            discountPercent: disc,
                          }));
                        }}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-amber-400 font-black focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Original Strikethrough Price</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.originalPrice}
                        onChange={(e) => {
                          const orig = Number(e.target.value);
                          const cost = formData.costPerUnit;
                          const disc = orig > cost ? Math.round(((orig - cost) / orig) * 100) : 0;
                          setFormData((prev) => ({
                            ...prev,
                            originalPrice: orig,
                            discountPercent: disc,
                          }));
                        }}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Discount %</label>
                      <input
                        type="number"
                        min={0}
                        max={90}
                        value={formData.discountPercent}
                        onChange={(e) => {
                          const d = Number(e.target.value);
                          const orig = formData.originalPrice || Math.round(formData.costPerUnit * 1.25);
                          const newCost = Math.round(orig * (1 - d / 100));
                          setFormData((prev) => ({
                            ...prev,
                            discountPercent: d,
                            costPerUnit: newCost > 0 ? newCost : prev.costPerUnit,
                          }));
                        }}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-bold focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Promotional Offer Badge / Banner</label>
                    <input
                      type="text"
                      value={formData.discountBadge}
                      onChange={(e) => setFormData({ ...formData, discountBadge: e.target.value })}
                      placeholder="e.g. Save 24% Today · Free Tolls & State Permits Included"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  {/* Live Fare Preview Banner */}
                  <div className="p-4 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-red-600/20 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                        Live Fare Preview
                      </span>
                      <span className="text-sm font-bold text-white">
                        {formData.name || "Transfer Route"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-400">
                        {formatINR(formData.costPerUnit)}
                      </span>
                      <span className="text-xs text-slate-400 block">
                        {formData.pricingModel === "PER_PASSENGER" ? "/ seat" : formData.pricingModel === "PER_DAY" ? "/ day" : "/ vehicle"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Inclusions, Amenities & Media */}
              {activeModalTab === "inclusions" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Fleet Cover Image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">Cover / Vehicle Fleet Image URL</label>
                      <button
                        type="button"
                        onClick={() => setMediaPickerOpen(true)}
                        className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                      >
                        📸 Open Media Picker
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                    />

                    {/* Quick Image Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {PRESET_VEHICLE_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                          className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 font-semibold cursor-pointer"
                        >
                          📷 {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Supplier Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Fleet Supplier / Partner Chauffeur</label>
                    <input
                      type="text"
                      value={formData.supplierName}
                      onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                      placeholder="e.g. Himalayan Prime Chauffeurs, BMT Luxury Fleet"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  {/* Amenities Quick Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">
                      Vehicle Amenities &amp; Conveniences (Click to Toggle)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_AMENITIES.map((am) => {
                        const isSelected = formData.amenities.includes(am);
                        return (
                          <button
                            key={am}
                            type="button"
                            onClick={() => toggleAmenity(am)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {am}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Inclusions (One line per item)
                      </label>
                      <textarea
                        rows={4}
                        value={formData.inclusions.join("\n")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            inclusions: e.target.value.split("\n").filter((s) => s.trim().length > 0),
                          })
                        }
                        placeholder="Dedicated sanitized vehicle with experienced hill chauffeur&#10;All Highway Tolls, Green Tax & State Border Permits&#10;Fuel, Parking & Driver Allowance included"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Exclusions (One line per item)
                      </label>
                      <textarea
                        rows={4}
                        value={formData.exclusions.join("\n")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            exclusions: e.target.value.split("\n").filter((s) => s.trim().length > 0),
                          })
                        }
                        placeholder="Sightseeing deviations outside booked route&#10;Night driving surcharge (11 PM - 5 AM)&#10;Rohtang Pass Snow Permit"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Pickup / Meeting Guidelines for Driver &amp; Guests
                    </label>
                    <textarea
                      rows={2}
                      value={formData.pickupGuidelines}
                      onChange={(e) => setFormData({ ...formData, pickupGuidelines: e.target.value })}
                      placeholder="e.g. Driver will meet you at Airport Arrival Gate with your name placard. 24/7 BMT concierge assistance available."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving Route..." : editingTransfer ? "Update Transfer Route" : "Save Transfer Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Media Picker Modal ── */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(item: MediaItem) => {
          setFormData((prev) => ({ ...prev, coverImage: item.optimizedUrl || item.url }));
          setMediaPickerOpen(false);
        }}
        defaultFolderType="destinations"
        title="Select Fleet / Vehicle Photo"
      />

      {/* ── Modern Save Success Modal ── */}
      {saveSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Success
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Transfer Route {saveSuccess.action === "updated" ? "Updated" : "Created"}!
              </h3>
              <p className="text-xs text-slate-300 mt-2 font-medium">
                &ldquo;{saveSuccess.name}&rdquo; has been saved to your transit &amp; fleet logistics inventory.
              </p>
            </div>
            <button
              onClick={() => setSaveSuccess(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Continue Managing Fleet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
