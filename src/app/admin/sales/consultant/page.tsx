"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface LeadItem {
  _id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  slaStatus?: string;
  slaDueAt?: string;
  firstContactedAt?: string;
  leadType?: string;
  specialRequirements?: string;
  tripDetails?: {
    pickupCity?: string;
    dropCity?: string;
    vehicleType?: string;
  };
  destinations?: string[];
  createdAt: string;
}

interface FollowUpItem {
  _id: string;
  leadId: string;
  leadName: string;
  phone: string;
  type: string;
  priority: string;
  note?: string;
  dueAt: string;
}

interface DashboardData {
  totalAssigned: number;
  activeLeadsCount: number;
  conversionRate: number;
  followUpsTodayCount: number;
  followUpsToday: FollowUpItem[];
  overdueFollowUpsCount: number;
  overdueFollowUps: FollowUpItem[];
  urgentSlaCount: number;
  urgentSlaLeads: LeadItem[];
  stageCounts: Record<string, number>;
  recentLeads: LeadItem[];
}

export default function ConsultantDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [commType, setCommType] = useState<"CALL" | "WHATSAPP" | "EMAIL" | "MEETING">("CALL");
  const [commSummary, setCommSummary] = useState("");
  const [commDetails, setCommDetails] = useState("");
  const [submittingComm, setSubmittingComm] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/leads/dashboard?type=consultant");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      }
    } catch (e) {
      console.error("Failed to load consultant dashboard:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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

      if (res.ok) {
        setLogModalOpen(false);
        setCommSummary("");
        setCommDetails("");
        setSelectedLead(null);
        fetchDashboard();
      }
    } catch (e) {
      console.error("Communication log error:", e);
      alert("Failed to log communication");
    } finally {
      setSubmittingComm(false);
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
          outcome: "Concluded from Consultant Desk",
        }),
      });
      if (res.ok) {
        fetchDashboard();
      }
    } catch (e) {
      console.error("Complete follow-up error:", e);
    }
  };

  const cleanPhone = (p: string) => (p || "").replace(/[^0-9]/g, "");

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Travel Consultant Desk</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              My Active Workspace
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage your assigned inbound inquiries, scheduled follow-ups, and urgent SLA leads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh
          </button>
          <Link
            href="/admin/leads"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors shadow-md flex items-center gap-1.5"
          >
            <span>📊</span> Full Leads Pipeline →
          </Link>
        </div>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
            <span>My Active Leads</span>
            <span className="text-base">💼</span>
          </div>
          <p className="text-2xl font-black text-white">
            {loading ? "..." : data?.activeLeadsCount || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total assigned: {data?.totalAssigned || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
            <span>Follow-ups Today</span>
            <span className="text-base">⏰</span>
          </div>
          <p className="text-2xl font-black text-amber-400">
            {loading ? "..." : data?.followUpsTodayCount || 0}
          </p>
          <p className="text-[11px] text-rose-400 mt-1">
            {data?.overdueFollowUpsCount || 0} overdue
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
            <span>Urgent SLA First Response</span>
            <span className="text-base">⚡</span>
          </div>
          <p className="text-2xl font-black text-rose-400">
            {loading ? "..." : data?.urgentSlaCount || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Need contact within SLA</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
            <span>Won / Conversion Rate</span>
            <span className="text-base">🏆</span>
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {loading ? "..." : `${data?.conversionRate || 0}%`}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Confirmed: {data?.stageCounts?.["CONFIRMED"] || 0}
          </p>
        </div>
      </div>

      {/* ── Urgent SLA Alert Queue ── */}
      {data?.urgentSlaLeads && data.urgentSlaLeads.length > 0 && (
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="animate-pulse text-rose-400 text-lg">⚠️</span>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Urgent First-Contact SLA Queue ({data.urgentSlaLeads.length})
              </h2>
            </div>
            <span className="text-xs text-rose-400 font-mono font-semibold">Immediate Action Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.urgentSlaLeads.map((lead) => (
              <div
                key={lead._id}
                className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-3.5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate">{lead.name}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">
                    {lead.slaStatus === "BREACHED" ? "BREACHED" : "SLA DUE"}
                  </span>
                </div>
                <p className="text-amber-400 font-mono text-xs">{lead.phone}</p>
                <p className="text-slate-400 line-clamp-1">
                  {lead.specialRequirements || lead.tripDetails?.pickupCity || "New Tour Inquiry"}
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={`https://wa.me/${cleanPhone(lead.phone)}?text=Hello%20${encodeURIComponent(lead.name)}%2C%20thank%20you%20for%20contacting%20Be%20My%20Traveller.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center text-[11px] transition-colors"
                  >
                    💬 WhatsApp
                  </a>
                  <button
                    onClick={() => {
                      setSelectedLead(lead);
                      setCommType("CALL");
                      setLogModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px]"
                  >
                    📞 Log Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Today's Follow-up Queue ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">📅</span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Today&apos;s Scheduled Follow-ups
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {data?.followUpsToday?.length || 0} Scheduled
          </span>
        </div>

        {data?.followUpsToday && data.followUpsToday.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {data.followUpsToday.map((item) => (
              <div key={item._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.leadName}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-amber-400 font-bold">
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(item.dueAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{item.note || "Scheduled consultation discussion"}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{item.phone}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${cleanPhone(item.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/30"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`tel:${item.phone}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-600/30"
                  >
                    📞 Call
                  </a>
                  <button
                    onClick={() => handleCompleteFollowUp(item.leadId, item._id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 cursor-pointer shadow-sm"
                  >
                    ✓ Mark Concluded
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs font-medium">
            No follow-ups due today. You are all caught up!
          </div>
        )}
      </div>

      {/* ── My Recent Assigned Inquiries ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sky-400 text-lg">📋</span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              My Active Lead Inquiries
            </h2>
          </div>
          <Link href="/admin/leads" className="text-xs text-amber-400 font-bold hover:underline">
            View All in Pipeline →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold text-left uppercase">
                <th className="pb-3 px-3">Traveller</th>
                <th className="pb-3 px-3">Service</th>
                <th className="pb-3 px-3">Stage</th>
                <th className="pb-3 px-3">SLA Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.recentLeads && data.recentLeads.length > 0 ? (
                data.recentLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{lead.name}</p>
                      <p className="text-amber-400 font-mono text-[11px]">{lead.phone}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {lead.tripDetails?.vehicleType
                        ? `Cab: ${lead.tripDetails.pickupCity} → ${lead.tripDetails.dropCity}`
                        : lead.destinations?.[0] || lead.specialRequirements || "Holiday Package"}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px]">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lead.slaStatus === "MET"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : lead.slaStatus === "BREACHED"
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-sky-500/20 text-sky-400"
                        }`}
                      >
                        {lead.slaStatus || "WITHIN_SLA"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setLogModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Log Activity
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No active leads currently assigned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Log Communication Modal ── */}
      {logModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-base">Log Communication</h3>
                <p className="text-xs text-slate-400">{selectedLead.name} ({selectedLead.phone})</p>
              </div>
              <button
                onClick={() => setLogModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold"
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
                      className={`py-2 rounded-xl border text-center font-bold ${
                        commType === t
                          ? "bg-amber-500 text-slate-950 border-amber-400 font-black"
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
                  placeholder="e.g. Discussed 5N/6D Kashmir Itinerary with Houseboat"
                  value={commSummary}
                  onChange={(e) => setCommSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Detailed Discussion Notes</label>
                <textarea
                  rows={3}
                  placeholder="Client prefers luxury hotels and private Innova Crysta..."
                  value={commDetails}
                  onChange={(e) => setCommDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingComm || !commSummary.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black disabled:opacity-50"
                >
                  {submittingComm ? "Saving..." : "Save to Timeline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
