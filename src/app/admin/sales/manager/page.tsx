"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

interface UnassignedLead {
  _id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  specialRequirements?: string;
  tripDetails?: {
    pickupCity?: string;
    dropCity?: string;
    vehicleType?: string;
  };
  destinations?: string[];
  createdAt: string;
}

interface ConsultantWorkload {
  id: string;
  name: string;
  email: string;
  activeCount: number;
  wonCount: number;
}

interface ManagerDashboardData {
  totalLeads: number;
  unassignedCount: number;
  unassignedLeads: UnassignedLead[];
  slaComplianceRate: number;
  breachedCount: number;
  breachedLeads: Array<{
    _id: string;
    name: string;
    phone: string;
    status: string;
    slaDueAt?: string;
    assignedTo?: { name?: string; email?: string };
  }>;
  stageBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  consultantWorkload: ConsultantWorkload[];
  consultants?: StaffUser[];
}

export default function SalesManagerDashboardPage() {
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const dashRes = await fetch("/api/v1/admin/leads/dashboard?type=manager");
      if (dashRes.ok) {
        const dashJson = await dashRes.json();
        if (dashJson.success && dashJson.data) {
          setData(dashJson.data);
          if (Array.isArray(dashJson.data.consultants) && dashJson.data.consultants.length > 0) {
            setStaff(dashJson.data.consultants);
          }
        }
      }

      // Safe secondary check for staff users if permitted
      try {
        const usersRes = await fetch("/api/v1/admin/users?forAssignment=true");
        if (usersRes.ok) {
          const usersJson = await usersRes.json();
          if (usersJson?.users && Array.isArray(usersJson.users)) {
            setStaff(usersJson.users);
          }
        }
      } catch {
        // Ignored: non-critical fallback
      }
    } catch (e) {
      console.error("Manager dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleQuickAssign = async (leadId: string, assignedToId: string) => {
    if (!assignedToId) return;
    try {
      setAssigningId(leadId);
      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId,
          action: "ASSIGN",
          assignedTo: assignedToId,
          reason: "Assigned by Sales Manager",
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success) {
        fetchDashboard();
      } else {
        alert(resData.error || resData.detail || "Failed to assign lead");
      }
    } catch (e: any) {
      console.error("Assignment error:", e);
      alert(e?.message || "Failed to assign lead");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Sales Manager Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
              Team Oversight & SLA Control
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Monitor incoming leads, enforce SLA response times, reallocate workloads, and drive conversions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh Metrics
          </button>
          <Link
            href="/admin/leads"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors shadow-md flex items-center gap-1.5"
          >
            <span>📊</span> Full Leads Pipeline →
          </Link>
        </div>
      </div>

      {/* ── High-Level Metric Tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
            <span>Total Inbound Leads</span>
            <span className="text-base">📈</span>
          </div>
          <p className="text-2xl font-black text-white">
            {loading ? "..." : data?.totalLeads || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">All channels combined</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
            <span>Unassigned Leads</span>
            <span className="text-base">⚡</span>
          </div>
          <p className="text-2xl font-black text-amber-400">
            {loading ? "..." : data?.unassignedCount || 0}
          </p>
          <p className="text-[11px] text-amber-500/80 mt-1">Requires immediate assignment</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
            <span>SLA Compliance</span>
            <span className="text-base">🛡️</span>
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {loading ? "..." : `${data?.slaComplianceRate || 0}%`}
          </p>
          <p className="text-[11px] text-rose-400 mt-1">
            {data?.breachedCount || 0} breached leads
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
            <span>Team Won / Confirmed</span>
            <span className="text-base">🏆</span>
          </div>
          <p className="text-2xl font-black text-white">
            {loading ? "..." : (data?.stageBreakdown?.["CONFIRMED"] || 0) + (data?.stageBreakdown?.["BOOKED"] || 0)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Active quotes: {data?.stageBreakdown?.["QUOTE_SENT"] || 0}
          </p>
        </div>
      </div>

      {/* ── Unassigned Leads Queue Table (1-Click Assignment) ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">⚡</span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Unassigned Leads Queue ({data?.unassignedCount || 0})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Assign directly to available travel consultants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold text-left uppercase">
                <th className="pb-3 px-3">Traveller</th>
                <th className="pb-3 px-3">Service Inquired</th>
                <th className="pb-3 px-3">Source</th>
                <th className="pb-3 px-3">Received</th>
                <th className="pb-3 px-3 text-right">Quick Assign Consultant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.unassignedLeads && data.unassignedLeads.length > 0 ? (
                data.unassignedLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{lead.name}</p>
                      <p className="text-amber-400 font-mono text-[11px]">{lead.phone}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {lead.tripDetails?.vehicleType
                        ? `Cab: ${lead.tripDetails.pickupCity} → ${lead.tripDetails.dropCity} (${lead.tripDetails.vehicleType})`
                        : lead.destinations?.[0] || lead.specialRequirements || "Holiday Package"}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {new Date(lead.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <select
                        disabled={assigningId === lead._id}
                        defaultValue=""
                        onChange={(e) => handleQuickAssign(lead._id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-xs cursor-pointer focus:outline-none"
                      >
                        <option value="" disabled>
                          Select Consultant...
                        </option>
                        {staff.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No unassigned leads in queue. All leads are distributed!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Consultant Workload Distribution Matrix ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sky-400 text-lg">👥</span>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Consultant Workload & Performance
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Sales Team Matrix</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold text-left uppercase">
                  <th className="pb-3 px-3">Consultant</th>
                  <th className="pb-3 px-3 text-center">Active Leads</th>
                  <th className="pb-3 px-3 text-center">Won Bookings</th>
                  <th className="pb-3 px-3 text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.consultantWorkload && data.consultantWorkload.length > 0 ? (
                  data.consultantWorkload.map((c) => {
                    const total = c.activeCount + c.wonCount;
                    const rate = total > 0 ? Math.round((c.wonCount / total) * 100) : 0;
                    return (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-bold text-white">{c.name}</p>
                          <p className="text-slate-400 text-[10px]">{c.email}</p>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-white font-bold">
                            {c.activeCount}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                            {c.wonCount}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-amber-400">
                          {rate}%
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No consultant activity records found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pipeline Breakdown by Stage & Category ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-lg">📊</span>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Inbound Inquiries by Service Category
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Channel Split</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-slate-400 font-bold block mb-1">🏖️ Holiday Packages</span>
              <p className="text-xl font-black text-white">
                {data?.categoryBreakdown?.["HOLIDAY_PACKAGE"] || 0}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-slate-400 font-bold block mb-1">🚗 Cab & Transfers</span>
              <p className="text-xl font-black text-emerald-400">
                {data?.categoryBreakdown?.["TRANSPORTATION"] || 0}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-slate-400 font-bold block mb-1">🧭 Custom Itineraries</span>
              <p className="text-xl font-black text-amber-400">
                {data?.categoryBreakdown?.["CUSTOM_ITINERARY"] || 0}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-slate-400 font-bold block mb-1">🏨 Luxury Stays</span>
              <p className="text-xl font-black text-purple-400">
                {data?.categoryBreakdown?.["HOTEL_STAY"] || 0}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Stage Distribution Funnel
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              {["NEW", "CONTACTED", "FOLLOW_UP", "QUALIFIED", "QUOTE_SENT", "CONFIRMED"].map((st) => (
                <div key={st} className="p-2 rounded-lg bg-slate-800/70 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">{st}</span>
                  <span className="text-sm font-black text-white">
                    {data?.stageBreakdown?.[st] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
