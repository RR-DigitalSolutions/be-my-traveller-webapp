"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export type LeadCategory = "ALL" | "TRANSPORTATION" | "HOLIDAY_PACKAGE" | "CUSTOM_ITINERARY" | "HOTEL_STAY";
export type LeadPipelineStatus = "NEW" | "CONTACTED" | "CONNECTED" | "FOLLOW_UP" | "QUOTE_SENT" | "CONFIRMED" | "BOOKED" | "LOST";

interface ILeadItem {
  _id: string;
  name: string;
  phone: string;
  email: string;
  destinations?: string[];
  packageId?: any;
  specialRequirements?: string;
  leadType?: "HOLIDAY_PACKAGE" | "CUSTOM_ITINERARY" | "TRANSPORTATION" | "HOTEL_STAY" | "GENERAL";
  tripDetails?: {
    tripType?: "ONE_WAY" | "ROUND_TRIP" | "MULTICITY";
    pickupCity?: string;
    dropCity?: string;
    multicityStops?: string[];
    vehicleType?: string;
    pickupDate?: string;
    returnDate?: string;
    pickupTime?: string;
    passengers?: number;
  };
  travelDates?: { from?: string; to?: string; flexible?: boolean };
  duration?: string;
  travellers?: { adults: number; children: number; infants?: number };
  budget?: { min?: number; max?: number; currency?: string };
  hotelCategory?: string;
  status: LeadPipelineStatus;
  source: string;
  notes?: Array<{ _id?: string; content: string; createdAt?: string }> | string;
  createdAt: string;
}

const PIPELINE_STAGES: Array<{
  id: LeadPipelineStatus;
  label: string;
  icon: string;
  badgeClass: string;
  headerClass: string;
}> = [
  {
    id: "NEW",
    label: "New Leads",
    icon: "⚡",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    headerClass: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  },
  {
    id: "CONTACTED",
    label: "Connected",
    icon: "📞",
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    headerClass: "bg-sky-500/10 border-sky-500/30 text-sky-400",
  },
  {
    id: "FOLLOW_UP",
    label: "Followup",
    icon: "🔄",
    badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    headerClass: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
  },
  {
    id: "QUOTE_SENT",
    label: "Quotation Sent",
    icon: "📝",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    headerClass: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  },
  {
    id: "CONFIRMED",
    label: "Won / Confirmed",
    icon: "🎉",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    headerClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  },
  {
    id: "LOST",
    label: "Lost Lead",
    icon: "❌",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    headerClass: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  },
];

function normalizeStatus(st: string): LeadPipelineStatus {
  if (st === "CONNECTED") return "CONTACTED";
  if (st === "BOOKED") return "CONFIRMED";
  if (["NEW", "CONTACTED", "FOLLOW_UP", "QUOTE_SENT", "CONFIRMED", "LOST"].includes(st)) {
    return st as LeadPipelineStatus;
  }
  return "NEW";
}

function getLeadCategory(lead: ILeadItem): { label: string; icon: string; bg: string } {
  const req = (lead.specialRequirements || "").toLowerCase();
  const source = (lead.source || "").toUpperCase();
  const type = lead.leadType || "";

  if (type === "TRANSPORTATION" || source === "CAB_RENTAL" || req.includes("cab") || req.includes("transfer") || lead.tripDetails?.vehicleType) {
    return { label: "Cab / Transfer", icon: "🚗", bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
  }
  if (type === "CUSTOM_ITINERARY" || source === "CUSTOM_TRIP_FORM" || req.includes("custom itinerary")) {
    return { label: "Custom Trip", icon: "🧭", bg: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
  }
  if (type === "HOTEL_STAY" || source === "HOTEL_ENQUIRY" || lead.hotelCategory) {
    return { label: "Luxury Stay", icon: "🏨", bg: "bg-purple-500/15 text-purple-400 border-purple-500/30" };
  }
  return { label: "Tour Package", icon: "🏖️", bg: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
}

function formatRelativeTime(isoString: string) {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return "Just now";
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;

    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return isoString;
  }
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<ILeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState<LeadCategory>("ALL");
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");
  const [selectedLead, setSelectedLead] = useState<ILeadItem | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("leadType", categoryFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/v1/admin/leads?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  // Keep selected lead synced with current leads data
  useEffect(() => {
    if (selectedLead) {
      const found = leads.find((l) => l._id === selectedLead._id);
      if (found) setSelectedLead(found);
    }
  }, [leads]);

  const handleUpdateStatus = async (id: string, newStatus: LeadPipelineStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l))
        );
        if (selectedLead?._id === id) {
          setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (id: string) => {
    if (!newNoteText.trim()) return;
    try {
      setIsSubmittingNote(true);
      const updatedNotes = Array.isArray(selectedLead?.notes)
        ? [...selectedLead.notes, { content: newNoteText.trim(), createdAt: new Date().toISOString() }]
        : [{ content: newNoteText.trim(), createdAt: new Date().toISOString() }];

      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes: updatedNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) => (l._id === id ? { ...l, notes: updatedNotes } : l))
        );
        setSelectedLead((prev) => (prev ? { ...prev, notes: updatedNotes } : null));
        setNewNoteText("");
      }
    } catch (err) {
      alert("Failed to save note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Pipeline stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      FOLLOW_UP: 0,
      QUOTE_SENT: 0,
      CONFIRMED: 0,
      LOST: 0,
    };
    leads.forEach((l) => {
      const st = normalizeStatus(l.status);
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [leads]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<LeadCategory, number> = {
      ALL: leads.length,
      TRANSPORTATION: 0,
      HOLIDAY_PACKAGE: 0,
      CUSTOM_ITINERARY: 0,
      HOTEL_STAY: 0,
    };
    leads.forEach((l) => {
      const cat = getLeadCategory(l);
      if (cat.label.includes("Cab")) counts.TRANSPORTATION++;
      else if (cat.label.includes("Custom")) counts.CUSTOM_ITINERARY++;
      else if (cat.label.includes("Stay")) counts.HOTEL_STAY++;
      else counts.HOLIDAY_PACKAGE++;
    });
    return counts;
  }, [leads]);

  // Clean phone for WhatsApp & Calls
  const cleanPhone = selectedLead?.phone ? selectedLead.phone.replace(/[^0-9]/g, "") : "";

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Leads & CRM Pipeline</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
              Live Inquiries
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time inbound inquiries from Holiday Search, Cab Transfers & Custom Builders.
          </p>
        </div>

        {/* View Mode Switcher & Refresh */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-1 flex items-center">
            <button
              onClick={() => setViewMode("pipeline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "pipeline"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>📊</span> Pipeline
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "table"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>📋</span> Table View
            </button>
          </div>

          <button
            onClick={fetchLeads}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Pipeline Metric Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {PIPELINE_STAGES.map((st) => (
          <button
            key={st.id}
            onClick={() => setStatusFilter(statusFilter === st.id ? "ALL" : st.id)}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === st.id
                ? "bg-slate-800 border-amber-500 ring-2 ring-amber-500/20"
                : "bg-slate-800/60 border-slate-700/60 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
              <span className="flex items-center gap-1">
                <span>{st.icon}</span> <span>{st.label}</span>
              </span>
            </div>
            <p className="text-xl font-black text-white tracking-tight">
              {stageCounts[st.id] || 0}
            </p>
          </button>
        ))}
      </div>

      {/* ── Inbound Service Category Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-1 overflow-x-auto scrollbar-none">
        {[
          { key: "ALL", label: "All Inquiries", icon: "🌐", count: leads.length },
          { key: "TRANSPORTATION", label: "Cab & Transfers", icon: "🚗", count: categoryCounts.TRANSPORTATION },
          { key: "HOLIDAY_PACKAGE", label: "Holiday Packages", icon: "🏖️", count: categoryCounts.HOLIDAY_PACKAGE },
          { key: "CUSTOM_ITINERARY", label: "Custom Itineraries", icon: "🧭", count: categoryCounts.CUSTOM_ITINERARY },
          { key: "HOTEL_STAY", label: "Luxury Stays", icon: "🏨", count: categoryCounts.HOTEL_STAY },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCategoryFilter(tab.key as LeadCategory)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              categoryFilter === tab.key
                ? "bg-slate-800 text-amber-400 border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              categoryFilter === tab.key ? "bg-amber-500/20 text-amber-300" : "bg-slate-700/60 text-slate-400"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[260px] relative">
          <input
            type="text"
            placeholder="Search traveller, phone, pickup, drop city, car type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
        >
          <option value="ALL">All Workflow Stages</option>
          <option value="NEW">⚡ New Leads</option>
          <option value="CONTACTED">📞 Connected</option>
          <option value="FOLLOW_UP">🔄 Followup</option>
          <option value="QUOTE_SENT">📝 Quotation Sent</option>
          <option value="CONFIRMED">🎉 Won / Confirmed</option>
          <option value="LOST">❌ Lost Leads</option>
        </select>
      </div>

      {/* ── VIEW 1: PIPELINE KANBAN BOARD ── */}
      {viewMode === "pipeline" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => normalizeStatus(l.status) === stage.id);
            return (
              <div
                key={stage.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col min-h-[460px] shadow-lg overflow-hidden"
              >
                {/* Column Header */}
                <div className={`px-3.5 py-3 border-b flex items-center justify-between ${stage.headerClass}`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
                    <span>{stage.icon}</span>
                    <span>{stage.label}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-900/70 text-slate-200 text-[11px] font-mono font-bold">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[680px]">
                  {stageLeads.length === 0 ? (
                    <div className="py-12 text-center text-slate-600 text-xs">
                      No leads in {stage.label}
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const category = getLeadCategory(lead);
                      const isSelected = selectedLead?._id === lead._id;

                      return (
                        <div
                          key={lead._id}
                          onClick={() => setSelectedLead(lead)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-sm relative group ${
                            isSelected
                              ? "bg-slate-800 border-amber-500 ring-2 ring-amber-500/20"
                              : "bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600"
                          }`}
                        >
                          {/* Header: Category Badge & Time */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${category.bg}`}>
                              <span>{category.icon}</span> <span>{category.label}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {formatRelativeTime(lead.createdAt)}
                            </span>
                          </div>

                          {/* Client Name & Phone */}
                          <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">
                            {lead.name}
                          </h4>
                          <p className="text-[11px] font-mono text-amber-400 mt-0.5 font-semibold">
                            {lead.phone}
                          </p>

                          {/* Service Specific Details */}
                          {lead.tripDetails?.vehicleType ? (
                            <div className="mt-2 bg-slate-900/60 rounded-lg p-2 text-[11px] border border-slate-700/40 text-slate-300 space-y-0.5">
                              <p className="font-semibold text-white truncate">
                                🚗 {lead.tripDetails.tripType?.replace("_", " ")}: {lead.tripDetails.pickupCity} → {lead.tripDetails.dropCity}
                              </p>
                              <p className="text-slate-400 text-[10px] truncate">
                                Car: <span className="text-amber-300 font-medium">{lead.tripDetails.vehicleType}</span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-slate-400 text-[11px] mt-1.5 line-clamp-2 leading-relaxed">
                              {lead.specialRequirements || lead.destinations?.[0] || "Custom Tour Package Inquiry"}
                            </p>
                          )}

                          {/* Quick Stage Move Dropdown in Card */}
                          <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-medium">Stage:</span>
                            <select
                              value={normalizeStatus(lead.status)}
                              disabled={updatingStatus}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleUpdateStatus(lead._id, e.target.value as LeadPipelineStatus)}
                              className="text-[10px] font-bold bg-slate-900 border border-slate-700 rounded-md px-1.5 py-0.5 text-slate-300 hover:text-white cursor-pointer focus:outline-none"
                            >
                              <option value="NEW">⚡ New</option>
                              <option value="CONTACTED">📞 Connected</option>
                              <option value="FOLLOW_UP">🔄 Followup</option>
                              <option value="QUOTE_SENT">📝 Quoted</option>
                              <option value="CONFIRMED">🎉 Confirmed</option>
                              <option value="LOST">❌ Lost</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VIEW 2: TABLE VIEW ── */}
      {viewMode === "table" && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Traveller</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Service & Requirement</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline Stage</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Received</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading && leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                        Loading live CRM leads...
                      </div>
                    </td>
                  </tr>
                ) : leads.map((lead) => {
                  const category = getLeadCategory(lead);
                  const statusObj = PIPELINE_STAGES.find((s) => s.id === normalizeStatus(lead.status)) || PIPELINE_STAGES[0];
                  const isSelected = selectedLead?._id === lead._id;

                  return (
                    <tr
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isSelected ? "bg-slate-800/60" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-white leading-snug">{lead.name}</p>
                          <p className="text-xs text-amber-400 mt-0.5 font-mono">{lead.phone}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{lead.email}</p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${category.bg}`}>
                            <span>{category.icon}</span> <span>{category.label}</span>
                          </span>
                          <p className="font-medium text-slate-300 text-xs line-clamp-2 mt-1">
                            {lead.tripDetails?.vehicleType
                              ? `Cab: ${lead.tripDetails.tripType?.replace("_", " ")} | ${lead.tripDetails.pickupCity} → ${lead.tripDetails.dropCity} (${lead.tripDetails.vehicleType})`
                              : lead.specialRequirements || lead.destinations?.[0] || "Custom Trip Requirement"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${statusObj.badgeClass}`}>
                          <span>{statusObj.icon}</span> <span>{statusObj.label}</span>
                        </span>
                      </td>

                      <td className="px-4 py-4 hidden md:table-cell text-slate-400 text-xs font-mono">
                        {formatRelativeTime(lead.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition-colors cursor-pointer"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && leads.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-slate-400 text-sm font-semibold">No lead inquiries found for this filter.</p>
            </div>
          )}
        </div>
      )}

      {/* ── LEAD DETAILS SLIDE-OVER DRAWER (Sticky / Modal) ── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl space-y-6">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getLeadCategory(selectedLead).bg}`}>
                      {getLeadCategory(selectedLead).icon} {getLeadCategory(selectedLead).label}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(selectedLead.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1.5">{selectedLead.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Direct Communication Action CTAs */}
              <div className="grid grid-cols-3 gap-2.5">
                <a
                  href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(selectedLead.name)}%2C%20thank%20you%20for%20contacting%20Be%20My%20Traveller%20regarding%20your%20travel%20inquiry.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <span>💬</span> WhatsApp
                </a>
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <span>📞</span> Call
                </a>
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>✉️</span> Email
                </a>
              </div>

              {/* Pipeline Workflow Stage Transition */}
              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-3">
                <label className="text-[11px] uppercase font-black tracking-wider text-slate-400 block">
                  Update Lead Pipeline Stage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PIPELINE_STAGES.map((stage) => {
                    const isActive = normalizeStatus(selectedLead.status) === stage.id;
                    return (
                      <button
                        key={stage.id}
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus(selectedLead._id, stage.id)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isActive
                            ? "bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-400/40"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        }`}
                      >
                        <span>{stage.icon}</span> <span>{stage.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* In-depth Requirement Card */}
              <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/40 space-y-3.5 text-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Inquiry Details
                </h4>

                {/* If Cab details exist */}
                {selectedLead.tripDetails && (
                  <div className="space-y-2.5 bg-slate-900/80 rounded-xl p-3 border border-slate-700/50">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Trip Type:</span>
                      <span className="font-bold text-white uppercase">{selectedLead.tripDetails.tripType?.replace("_", " ") || "One Way"}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Pickup Location:</span>
                      <span className="font-bold text-amber-300">{selectedLead.tripDetails.pickupCity || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Drop / Destination:</span>
                      <span className="font-bold text-emerald-300">{selectedLead.tripDetails.dropCity || "N/A"}</span>
                    </div>
                    {selectedLead.tripDetails.vehicleType && (
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Vehicle Preferred:</span>
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{selectedLead.tripDetails.vehicleType}</span>
                      </div>
                    )}
                    {selectedLead.tripDetails.pickupDate && (
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Pickup Date & Time:</span>
                        <span className="font-medium text-slate-200">
                          {selectedLead.tripDetails.pickupDate} {selectedLead.tripDetails.pickupTime ? `at ${selectedLead.tripDetails.pickupTime}` : ""}
                        </span>
                      </div>
                    )}
                    {selectedLead.tripDetails.passengers && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Passengers:</span>
                        <span className="font-medium text-slate-200">{selectedLead.tripDetails.passengers} Travellers</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Special Requirements / Package Info */}
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase mb-1">Traveller Notes / Notes</span>
                  <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/40 text-slate-200 leading-relaxed">
                    {selectedLead.specialRequirements || "No special requests mentioned."}
                  </div>
                </div>

                {/* Travellers & Budget */}
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-700/40">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Travellers</span>
                    <span className="font-bold text-white">
                      {selectedLead.travellers?.adults || 2} Adults {selectedLead.travellers?.children ? `+ ${selectedLead.travellers.children} Kids` : ""}
                    </span>
                  </div>
                  <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-700/40">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Source</span>
                    <span className="font-mono text-xs text-amber-400">{selectedLead.source}</span>
                  </div>
                </div>
              </div>

              {/* Internal CRM Discussion & Notes */}
              <div className="space-y-2.5">
                <label className="text-[11px] uppercase font-black tracking-wider text-slate-400 block">
                  Internal CRM Notes
                </label>

                {/* Existing Notes list */}
                {Array.isArray(selectedLead.notes) && selectedLead.notes.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedLead.notes.map((note, idx) => (
                      <div key={idx} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 text-xs">
                        <p className="text-slate-200 leading-snug">{note.content}</p>
                        {note.createdAt && (
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                            {new Date(note.createdAt).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add follow-up notes, quote details..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    disabled={isSubmittingNote || !newNoteText.trim()}
                    onClick={() => handleAddNote(selectedLead._id)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Close Drawer Button */}
            <button
              onClick={() => setSelectedLead(null)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
