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
  assignedTo?: { _id: string; name: string; email: string; role?: string } | any;
  assignedAt?: string;
  slaStatus?: "WITHIN_SLA" | "MET" | "BREACHED";
  slaDueAt?: string;
  firstContactedAt?: string;
  isDuplicate?: boolean;
  duplicateCount?: number;
  followUps?: Array<{
    _id: string;
    dueAt: string;
    type: "CALL" | "EMAIL" | "WHATSAPP" | "MEETING";
    priority?: string;
    note?: string;
    completedAt?: string;
    outcome?: string;
  }>;
  communications?: Array<{
    _id: string;
    type: string;
    summary: string;
    details?: string;
    outcome?: string;
    timestamp: string;
    performedByName?: string;
  }>;
  quoteIds?: string[];
  customerId?: string;
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

function getLeadCategory(lead: ILeadItem): { category: LeadCategory; label: string; icon: string; bg: string } {
  const req = (lead.specialRequirements || "").toLowerCase();
  const source = (lead.source || "").toUpperCase();
  const type = (lead.leadType || "").toUpperCase();

  // Cab & Transportation
  if (
    type === "TRANSPORTATION" ||
    source === "CAB_RENTAL" ||
    source === "TRANSPORTATION" ||
    req.includes("cab") ||
    req.includes("transfer") ||
    req.includes("sedan") ||
    req.includes("suv") ||
    req.includes("innova") ||
    req.includes("ertiga") ||
    req.includes("tempo traveller") ||
    Boolean(lead.tripDetails?.vehicleType)
  ) {
    return {
      category: "TRANSPORTATION",
      label: "Cab & Transfers",
      icon: "🚗",
      bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    };
  }

  // Custom Itinerary
  if (
    type === "CUSTOM_ITINERARY" ||
    source === "CUSTOM_TRIP_FORM" ||
    source === "CUSTOM_TRIP_BUILDER" ||
    req.includes("custom") ||
    req.includes("itinerary") ||
    req.includes("builder")
  ) {
    return {
      category: "CUSTOM_ITINERARY",
      label: "Custom Itinerary",
      icon: "🧭",
      bg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    };
  }

  // Luxury Stays & Resorts
  if (
    type === "HOTEL_STAY" ||
    source === "HOTEL_ENQUIRY" ||
    Boolean(lead.hotelCategory) ||
    req.includes("villa") ||
    req.includes("resort") ||
    req.includes("hotel") ||
    req.includes("stay")
  ) {
    return {
      category: "HOTEL_STAY",
      label: "Luxury Stay",
      icon: "🏨",
      bg: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    };
  }

  // Default: Holiday Packages
  return {
    category: "HOLIDAY_PACKAGE",
    label: "Tour Package",
    icon: "🏖️",
    bg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
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
  const [rawLeads, setRawLeads] = useState<ILeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState<LeadCategory>("ALL");
  const [slaFilter, setSlaFilter] = useState<"ALL" | "URGENT" | "MET">("ALL");
  const [assignedFilter, setAssignedFilter] = useState<"ALL" | "UNASSIGNED" | "ASSIGNED">("ALL");
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");
  const [selectedLead, setSelectedLead] = useState<ILeadItem | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // CRM State Extensions
  const [staffUsers, setStaffUsers] = useState<Array<{ _id: string; name: string; email: string; role: string }>>([]);
  const [assigningLead, setAssigningLead] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Follow-up Modal State
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpType, setFollowUpType] = useState<"CALL" | "WHATSAPP" | "EMAIL" | "MEETING">("CALL");
  const [followUpDueAt, setFollowUpDueAt] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  // Communication Modal State
  const [showCommModal, setShowCommModal] = useState(false);
  const [commType, setCommType] = useState<"CALL" | "WHATSAPP" | "EMAIL" | "MEETING">("CALL");
  const [commSummary, setCommSummary] = useState("");
  const [commDetails, setCommDetails] = useState("");
  const [submittingComm, setSubmittingComm] = useState(false);

  // Quote Generator Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState(65000);
  const [quoteHotelTier, setQuoteHotelTier] = useState("4★ Deluxe Hotels");
  const [quoteCabType, setQuoteCabType] = useState("Private Dedicated Innova Crysta");
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Fetch all leads once from database (or on refresh)
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/leads");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.leads)) {
          setRawLeads(data.leads);
        }
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/users");
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setStaffUsers(data.users);
        }
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchStaff();
  }, [fetchLeads, fetchStaff]);

  // Keep selected lead synced with current master leads data
  useEffect(() => {
    if (selectedLead) {
      const found = rawLeads.find((l) => l._id === selectedLead._id);
      if (found) setSelectedLead(found);
    }
  }, [rawLeads]);

  // Category counts computed on master dataset — NEVER resets to zero on tab switch!
  const categoryCounts = useMemo(() => {
    const counts: Record<LeadCategory, number> = {
      ALL: rawLeads.length,
      TRANSPORTATION: 0,
      HOLIDAY_PACKAGE: 0,
      CUSTOM_ITINERARY: 0,
      HOTEL_STAY: 0,
    };

    rawLeads.forEach((l) => {
      const cat = getLeadCategory(l);
      if (cat.category === "TRANSPORTATION") counts.TRANSPORTATION++;
      else if (cat.category === "CUSTOM_ITINERARY") counts.CUSTOM_ITINERARY++;
      else if (cat.category === "HOTEL_STAY") counts.HOTEL_STAY++;
      else counts.HOLIDAY_PACKAGE++;
    });

    return counts;
  }, [rawLeads]);

  // Client-side Instant Filter: 0ms lag, zero database load!
  const filteredLeads = useMemo(() => {
    return rawLeads.filter((lead) => {
      // 1. Category Filter
      if (categoryFilter !== "ALL") {
        const cat = getLeadCategory(lead);
        if (cat.category !== categoryFilter) return false;
      }

      // 2. Status Filter
      if (statusFilter !== "ALL") {
        if (normalizeStatus(lead.status) !== statusFilter) return false;
      }

      // 3. SLA Filter
      if (slaFilter === "URGENT" && lead.slaStatus === "MET") return false;
      if (slaFilter === "MET" && lead.slaStatus !== "MET") return false;

      // 4. Assignment Filter
      if (assignedFilter === "UNASSIGNED" && lead.assignedTo) return false;
      if (assignedFilter === "ASSIGNED" && !lead.assignedTo) return false;

      // 5. Search Filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const textToSearch = [
          lead.name,
          lead.phone,
          lead.email,
          lead.specialRequirements,
          lead.source,
          lead.tripDetails?.pickupCity,
          lead.tripDetails?.dropCity,
          lead.tripDetails?.vehicleType,
          ...(lead.destinations || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!textToSearch.includes(q)) return false;
      }

      return true;
    });
  }, [rawLeads, categoryFilter, statusFilter, slaFilter, assignedFilter, search]);

  // Stage counts for the current category context
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      FOLLOW_UP: 0,
      QUOTE_SENT: 0,
      CONFIRMED: 0,
      LOST: 0,
    };

    // Filter by category first so stage badges reflect category selection accurately
    const categoryScoped = categoryFilter === "ALL"
      ? rawLeads
      : rawLeads.filter((l) => getLeadCategory(l).category === categoryFilter);

    categoryScoped.forEach((l) => {
      const st = normalizeStatus(l.status);
      counts[st] = (counts[st] || 0) + 1;
    });

    return counts;
  }, [rawLeads, categoryFilter]);

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
        setRawLeads((prev) =>
          prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l))
        );
        if (selectedLead?._id === id) {
          setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch {
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
        setRawLeads((prev) =>
          prev.map((l) => (l._id === id ? { ...l, notes: updatedNotes } : l))
        );
        setSelectedLead((prev) => (prev ? { ...prev, notes: updatedNotes } : null));
        setNewNoteText("");
      }
    } catch {
      alert("Failed to save note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAssignLead = async (leadId: string, assignedToId: string) => {
    try {
      setAssigningLead(true);
      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId,
          action: "ASSIGN",
          assignedTo: assignedToId,
          reason: "Manual assignment from Pipeline",
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchLeads();
      }
    } catch {
      alert("Failed to assign lead");
    } finally {
      setAssigningLead(false);
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !followUpDueAt) return;
    try {
      setSubmittingFollowUp(true);
      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedLead._id,
          action: "FOLLOW_UP",
          followUp: {
            dueAt: followUpDueAt,
            type: followUpType,
            note: followUpNote,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowFollowUpModal(false);
        setFollowUpNote("");
        setFollowUpDueAt("");
        fetchLeads();
      }
    } catch {
      alert("Failed to schedule follow-up");
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  const handleCompleteFollowUp = async (leadId: string, followUpId: string) => {
    try {
      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId,
          action: "COMPLETE_FOLLOW_UP",
          followUpId,
          outcome: "Concluded from CRM drawer",
        }),
      });
      if (res.ok) fetchLeads();
    } catch {
      alert("Failed to complete follow-up");
    }
  };

  const handleLogCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !commSummary.trim()) return;
    try {
      setSubmittingComm(true);
      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedLead._id,
          action: "COMMUNICATION",
          communication: {
            type: commType,
            summary: commSummary.trim(),
            details: commDetails.trim(),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCommModal(false);
        setCommSummary("");
        setCommDetails("");
        fetchLeads();
      }
    } catch {
      alert("Failed to log communication");
    } finally {
      setSubmittingComm(false);
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      setSubmittingQuote(true);
      const destination = selectedLead.destinations?.[0] || selectedLead.specialRequirements || "Custom Tour Package";
      const travelDates = selectedLead.travelDates?.from
        ? `${new Date(selectedLead.travelDates.from).toLocaleDateString("en-IN")}`
        : "Flexible Dates";
      const paxCount = `${selectedLead.travellers?.adults || 2} Adults`;

      const res = await fetch("/api/v1/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: selectedLead.name,
          customerPhone: selectedLead.phone,
          customerEmail: selectedLead.email,
          destination,
          travelDates,
          paxCount,
          hotelTier: quoteHotelTier,
          cabType: quoteCabType,
          totalAmount: quoteAmount,
          leadId: selectedLead._id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowQuoteModal(false);
        fetchLeads();
        alert(`Quotation ${data.quote?.quoteNumber || ""} created & linked successfully!`);
      }
    } catch {
      alert("Failed to create quote");
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    if (!confirm("Are you ready to convert this Lead into a confirmed Customer profile?")) return;
    try {
      setIsConverting(true);
      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId,
          action: "CONVERT",
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchLeads();
        alert("🎉 Lead successfully converted to Customer profile!");
      }
    } catch {
      alert("Failed to convert lead");
    } finally {
      setIsConverting(false);
    }
  };

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
                  ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>📊</span> Pipeline
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "table"
                  ? "bg-amber-500 text-slate-950 shadow-sm font-black"
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

      {/* ── Inbound Service Category Tabs (Accurate, Never Resets!) ── */}
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-1 overflow-x-auto scrollbar-none">
        {[
          { key: "ALL", label: "All Inquiries", icon: "🌐", count: categoryCounts.ALL },
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
            <span
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold ${
                categoryFilter === tab.key
                  ? "bg-amber-500/25 text-amber-300 border border-amber-500/30"
                  : "bg-slate-700/70 text-slate-300"
              }`}
            >
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
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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

        <select
          value={slaFilter}
          onChange={(e) => setSlaFilter(e.target.value as any)}
          className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
        >
          <option value="ALL">All SLA Statuses</option>
          <option value="URGENT">⚠️ Needs SLA Response</option>
          <option value="MET">✅ SLA Met</option>
        </select>

        <select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value as any)}
          className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
        >
          <option value="ALL">All Ownership</option>
          <option value="UNASSIGNED">⚪ Unassigned Leads</option>
          <option value="ASSIGNED">👤 Assigned to Consultants</option>
        </select>

        {(statusFilter !== "ALL" || slaFilter !== "ALL" || assignedFilter !== "ALL" || search) && (
          <button
            onClick={() => {
              setStatusFilter("ALL");
              setSlaFilter("ALL");
              setAssignedFilter("ALL");
              setSearch("");
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
          >
            Reset Filters ✕
          </button>
        )}
      </div>

      {/* ── VIEW 1: ENTERPRISE PIPELINE KANBAN BOARD ── */}
      {viewMode === "pipeline" && (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start scrollbar-thin">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => normalizeStatus(l.status) === stage.id);
            return (
              <div
                key={stage.id}
                className="w-[320px] min-w-[310px] shrink-0 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col min-h-[580px] max-h-[820px] shadow-xl overflow-hidden backdrop-blur-xs"
              >
                {/* Column Header */}
                <div className={`px-4 py-3.5 border-b flex items-center justify-between ${stage.headerClass}`}>
                  <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                    <span className="text-sm">{stage.icon}</span>
                    <span>{stage.label}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900/90 text-slate-200 text-xs font-mono font-black border border-slate-700/60 shadow-xs">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[740px] scrollbar-thin">
                  {stageLeads.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs font-medium">
                      <span className="text-2xl block mb-2 opacity-40">📭</span>
                      No inquiries in {stage.label}
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const category = getLeadCategory(lead);
                      const isSelected = selectedLead?._id === lead._id;
                      const leadCleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "";
                      const initials = lead.name
                        ? lead.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        : "TR";

                      return (
                        <div
                          key={lead._id}
                          onClick={() => setSelectedLead(lead)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-md relative group ${
                            isSelected
                              ? "bg-slate-800 border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10"
                              : "bg-slate-800/90 hover:bg-slate-800 border-slate-700/70 hover:border-slate-600 hover:shadow-lg"
                          }`}
                        >
                          {/* Header: Category Badge & Time */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border flex items-center gap-1.5 ${category.bg}`}>
                              <span>{category.icon}</span> <span>{category.label}</span>
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <span>🕒</span>
                              <span>{formatRelativeTime(lead.createdAt)}</span>
                            </span>
                          </div>

                          {/* Traveller Profile & Direct CTAs */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-white text-xs sm:text-sm truncate leading-snug">
                                  {lead.name}
                                </h4>
                                <p className="text-[11px] font-mono text-amber-400 font-semibold tracking-wide">
                                  {lead.phone}
                                </p>
                              </div>
                            </div>

                            {/* 1-Click Communication CTAs */}
                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              {leadCleanPhone && (
                                <a
                                  href={`https://wa.me/${leadCleanPhone.startsWith("91") ? leadCleanPhone : "91" + leadCleanPhone}?text=Hello%20${encodeURIComponent(lead.name)}%2C%20thank%20you%20for%20contacting%20Be%20My%20Traveller.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="WhatsApp Traveller"
                                  className="w-7 h-7 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 flex items-center justify-center text-xs font-bold transition-all shadow-xs"
                                >
                                  💬
                                </a>
                              )}
                              {lead.phone && (
                                <a
                                  href={`tel:${lead.phone}`}
                                  title="Call Traveller"
                                  className="w-7 h-7 rounded-lg bg-sky-500/15 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/30 flex items-center justify-center text-xs font-bold transition-all shadow-xs"
                                >
                                  📞
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Service Details Snippet */}
                          {lead.tripDetails?.vehicleType ? (
                            <div className="my-2 bg-slate-900/80 rounded-xl p-2.5 text-xs border border-slate-700/60 text-slate-300 space-y-1">
                              <p className="font-bold text-white truncate flex items-center gap-1.5">
                                <span>🚗</span>
                                <span>{lead.tripDetails.tripType?.replace("_", " ") || "Cab"}: {lead.tripDetails.pickupCity} → {lead.tripDetails.dropCity}</span>
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                                <span>Vehicle: <strong className="text-amber-300 font-semibold">{lead.tripDetails.vehicleType}</strong></span>
                                {lead.tripDetails.passengers && <span>👥 {lead.tripDetails.passengers} Pax</span>}
                              </div>
                            </div>
                          ) : (
                            <div className="my-2 bg-slate-900/60 rounded-xl p-2.5 text-xs border border-slate-700/50 text-slate-300 space-y-1">
                              <p className="font-semibold text-white line-clamp-1 flex items-center gap-1.5">
                                <span>📍</span>
                                <span>{lead.destinations?.[0] || lead.specialRequirements || "Custom Tour Inquiry"}</span>
                              </p>
                              {lead.travelDates?.from && (
                                <p className="text-[11px] text-slate-400">
                                  📅 {new Date(lead.travelDates.from).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                  {lead.travellers?.adults ? ` · 👥 ${lead.travellers.adults} Adults` : ""}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Ownership & SLA Row */}
                          <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-700/50 text-[11px]">
                            <span className="text-slate-400 font-medium truncate max-w-[140px] flex items-center gap-1">
                              {lead.assignedTo?.name ? (
                                <>
                                  <span className="text-emerald-400">👤</span>
                                  <span className="text-slate-300 font-medium">{lead.assignedTo.name}</span>
                                </>
                              ) : (
                                <span className="text-amber-400/90 font-medium flex items-center gap-1">
                                  <span>⚠️</span> Unassigned
                                </span>
                              )}
                            </span>

                            {lead.isDuplicate ? (
                              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                                🔄 Repeat
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                                  lead.slaStatus === "MET"
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                    : lead.slaStatus === "BREACHED"
                                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                    : "bg-sky-500/15 text-sky-400 border-sky-500/30"
                                }`}
                              >
                                {lead.slaStatus === "MET" ? "✓ SLA OK" : lead.slaStatus === "BREACHED" ? "⚠ BREACHED" : "⏱ 30M SLA"}
                              </span>
                            )}
                          </div>

                          {/* Quick Stage Move Dropdown in Card */}
                          <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10.5px] text-slate-400 font-medium">Pipeline Stage:</span>
                            <select
                              value={normalizeStatus(lead.status)}
                              disabled={updatingStatus}
                              onChange={(e) => handleUpdateStatus(lead._id, e.target.value as LeadPipelineStatus)}
                              className="text-[11px] font-bold bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-amber-300 hover:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/50"
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
                {loading && rawLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                        Loading live CRM leads...
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.map((lead) => {
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

          {!loading && filteredLeads.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-slate-400 text-sm font-semibold">No lead inquiries found for this category or filter.</p>
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

              {/* Duplicate Inquiry Alert Banner */}
              {selectedLead.isDuplicate && (
                <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-3.5 space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <span>🔄</span>
                    <span>Repeat Inbound Inquiry Detected</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    This traveller has submitted multiple inquiries across our channels. Check timeline below for interaction history.
                  </p>
                </div>
              )}

              {/* Consultant Ownership & SLA Card */}
              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-[11px] uppercase font-black tracking-wider text-slate-400">
                    Lead Ownership & Assignment
                  </label>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      selectedLead.slaStatus === "MET"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : selectedLead.slaStatus === "BREACHED"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    }`}
                  >
                    SLA: {selectedLead.slaStatus || "WITHIN_SLA"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={
                      typeof selectedLead.assignedTo === "object"
                        ? selectedLead.assignedTo?._id || ""
                        : selectedLead.assignedTo || ""
                    }
                    disabled={assigningLead}
                    onChange={(e) => handleAssignLead(selectedLead._id, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-400 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">Unassigned (Assign Travel Consultant...)</option>
                    {staffUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CRM Direct Actions Ribbon */}
              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setCommType("CALL");
                    setShowCommModal(true);
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center text-slate-200 transition-colors cursor-pointer"
                >
                  <span className="block text-sm mb-0.5">📞</span> Log Activity
                </button>
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(true)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center text-slate-200 transition-colors cursor-pointer"
                >
                  <span className="block text-sm mb-0.5">⏰</span> Follow-up
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(true)}
                  className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-center text-amber-300 transition-colors cursor-pointer"
                >
                  <span className="block text-sm mb-0.5">📝</span> Quote
                </button>
                <button
                  type="button"
                  disabled={isConverting || selectedLead.status === "CONFIRMED"}
                  onClick={() => handleConvertLead(selectedLead._id)}
                  className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-center text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="block text-sm mb-0.5">🏆</span> Convert
                </button>
              </div>

              {/* Scheduled Follow-ups Queue */}
              {Array.isArray(selectedLead.followUps) && selectedLead.followUps.length > 0 && (
                <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/40 space-y-2.5 text-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Scheduled Follow-ups ({selectedLead.followUps.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedLead.followUps.map((f) => (
                      <div
                        key={f._id}
                        className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <span className="text-amber-400">{f.type}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({new Date(f.dueAt).toLocaleString("en-IN")})
                            </span>
                          </div>
                          {f.note && <p className="text-slate-300 text-[11px]">{f.note}</p>}
                        </div>
                        {!f.completedAt ? (
                          <button
                            onClick={() => handleCompleteFollowUp(selectedLead._id, f._id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] hover:bg-amber-400 cursor-pointer shadow-sm"
                          >
                            Done ✓
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-mono text-[10px] font-bold">Completed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Communication Timeline & Activity Stream */}
              {Array.isArray(selectedLead.communications) && selectedLead.communications.length > 0 && (
                <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/40 space-y-2.5 text-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-sky-400">
                    Activity Stream & Timeline
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedLead.communications.map((comm) => (
                      <div
                        key={comm._id}
                        className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-white">
                          <span>{comm.type}: {comm.summary}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(comm.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {comm.details && (
                          <p className="text-slate-400 text-[11px] leading-relaxed">{comm.details}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  <span className="text-slate-400 font-bold block text-[10px] uppercase mb-1">Traveller Notes / Requirements</span>
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

      {/* ── MODAL 1: LOG COMMUNICATION MODAL ── */}
      {showCommModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-base">Log Communication</h3>
                <p className="text-xs text-slate-400">{selectedLead.name} ({selectedLead.phone})</p>
              </div>
              <button
                onClick={() => setShowCommModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogCommunication} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Interaction Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["CALL", "WHATSAPP", "EMAIL", "MEETING"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCommType(t)}
                      className={`py-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        commType === t
                          ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Summary / Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discussed 5N/6D Kashmir Tour & Itinerary"
                  value={commSummary}
                  onChange={(e) => setCommSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Detailed Discussion Notes</label>
                <textarea
                  rows={3}
                  placeholder="Client prefers luxury houseboats and private cab..."
                  value={commDetails}
                  onChange={(e) => setCommDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCommModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingComm || !commSummary.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer disabled:opacity-50"
                >
                  {submittingComm ? "Saving..." : "Save to Timeline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: SCHEDULE FOLLOW-UP MODAL ── */}
      {showFollowUpModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-base">Schedule Follow-up</h3>
                <p className="text-xs text-slate-400">{selectedLead.name} ({selectedLead.phone})</p>
              </div>
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleFollowUp} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Follow-up Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["CALL", "WHATSAPP", "EMAIL", "MEETING"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFollowUpType(t)}
                      className={`py-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        followUpType === t
                          ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Due Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={followUpDueAt}
                  onChange={(e) => setFollowUpDueAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Follow-up Objective / Note</label>
                <textarea
                  rows={3}
                  placeholder="Call to finalize package inclusions and send quotation..."
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFollowUp || !followUpDueAt}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer disabled:opacity-50"
                >
                  {submittingFollowUp ? "Scheduling..." : "Schedule Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: QUICK QUOTE BUILDER MODAL ── */}
      {showQuoteModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-base">Generate Quotation for Lead</h3>
                <p className="text-xs text-slate-400">{selectedLead.name} ({selectedLead.phone})</p>
              </div>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-bold text-white">
                    {selectedLead.destinations?.[0] || selectedLead.specialRequirements || "Custom Tour"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Travellers:</span>
                  <span className="font-bold text-amber-300">{selectedLead.travellers?.adults || 2} Adults</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Hotel Category / Tier</label>
                <input
                  type="text"
                  required
                  value={quoteHotelTier}
                  onChange={(e) => setQuoteHotelTier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Cab & Transportation Setup</label>
                <input
                  type="text"
                  required
                  value={quoteCabType}
                  onChange={(e) => setQuoteCabType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Total Quotation Amount (₹ INR)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuote}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {submittingQuote ? "Creating Quote..." : "Create & Attach Quote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
