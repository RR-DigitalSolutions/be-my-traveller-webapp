"use client";

import { useState, useEffect, useCallback } from "react";

interface ILeadItem {
  _id: string;
  name: string;
  phone: string;
  email: string;
  destinations?: string[];
  specialRequirements?: string;
  status: "NEW" | "CONTACTED" | "QUOTE_SENT" | "CONFIRMED" | "LOST";
  source: string;
  notes?: string;
  createdAt: string;
  travellers?: { adults: number; children: number };
  budget?: { min?: number; max?: number; currency?: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW: { label: "New Lead", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  CONTACTED: { label: "Contacted", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  QUOTE_SENT: { label: "Quote Sent", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  CONFIRMED: { label: "Confirmed", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  LOST: { label: "Lost", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

function formatTime(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<ILeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<ILeadItem | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
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
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
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
          prev.map((l) => (l._id === id ? { ...l, status: newStatus as any } : l))
        );
        if (selectedLead?._id === id) {
          setSelectedLead((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const newLeadsCount = leads.filter((l) => l.status === "NEW").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Lead Enquiries</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time inbound travel inquiries from the website with one-click status updates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            🔄 Refresh
          </button>
          <span className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black">
            ⚡ {newLeadsCount} New Inquiries
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, email, phone number, requirement..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[240px] px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New Leads</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUOTE_SENT">Quote Sent</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="LOST">Lost</option>
        </select>
        <span className="text-xs text-slate-400 font-bold bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
          Total: {leads.length} leads
        </span>
      </div>

      {/* Leads Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Table Column */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-900/40">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Traveller</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Interest / Destination</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Received</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {loading && leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                        Fetching live inquiries from MongoDB Atlas...
                      </div>
                    </td>
                  </tr>
                ) : leads.map((lead) => {
                  const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                  const isSelected = selectedLead?._id === lead._id;
                  return (
                    <tr
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className={`hover:bg-slate-700/30 transition-colors cursor-pointer ${
                        isSelected ? "bg-slate-700/40" : ""
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
                        <p className="font-semibold text-slate-200 text-xs line-clamp-2">
                          {lead.specialRequirements || lead.destinations?.[0] || "Custom Trip"}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                          via {lead.source}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-slate-400 text-xs">
                        {formatTime(lead.createdAt)}
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
              <p className="text-slate-400 text-sm font-semibold">No lead inquiries found.</p>
            </div>
          )}
        </div>

        {/* Lead Detail Panel (Sticky Sidebar) */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-4 space-y-5">
          {selectedLead ? (
            <>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-500">Lead Details</span>
                <h3 className="text-lg font-black text-white mt-1">{selectedLead.name}</h3>
                <p className="text-xs text-slate-400">{formatTime(selectedLead.createdAt)}</p>
              </div>

              <div className="space-y-3 bg-slate-900/60 rounded-xl p-4 border border-slate-700/40 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Phone Number</span>
                  <a href={`tel:${selectedLead.phone}`} className="text-amber-400 font-bold hover:underline">
                    📞 {selectedLead.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Email Address</span>
                  <a href={`mailto:${selectedLead.email}`} className="text-slate-200 hover:underline">
                    ✉️ {selectedLead.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Enquiry Request</span>
                  <p className="text-slate-200 font-medium mt-0.5 leading-relaxed">
                    {selectedLead.specialRequirements || selectedLead.destinations?.[0] || "Custom Enquiry"}
                  </p>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-2">Change Lead Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["NEW", "CONTACTED", "QUOTE_SENT", "CONFIRMED", "LOST"] as const).map((st) => (
                    <button
                      key={st}
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(selectedLead._id, st)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedLead.status === st
                          ? "bg-amber-500 text-slate-950 font-black shadow-md"
                          : "bg-slate-700/60 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      {STATUS_CONFIG[st]?.label || st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Communication */}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(selectedLead.name)}%2C%20thank%20you%20for%20contacting%20Be%20My%20Traveller!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>💬</span> WhatsApp Traveller
                </a>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <span className="text-3xl block mb-2">📋</span>
              <p className="text-sm font-semibold">Select a lead from the table</p>
              <p className="text-xs text-slate-500 mt-1">Click any row to view full details and update status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
