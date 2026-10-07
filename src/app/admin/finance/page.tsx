"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatINR } from "@/lib/utils";

interface FinancialMetrics {
  totalRevenue: number;
  totalCustomerReceived: number;
  totalCustomerReceivable: number;
  totalSupplierCostEstimated: number;
  totalSupplierPaid: number;
  totalSupplierPending: number;
  totalGrossProfit: number;
  overallMarginPercent: number;
  pendingApprovalsCount: number;
  readyToDisburseCount: number;
}

interface PayableItem {
  _id: string;
  bookingNumber: string;
  supplierName: string;
  serviceType: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "PAID" | "REJECTED";
  dueDate?: string;
  createdAt: string;
}

export default function FinanceOverviewPage() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PayableItem[]>([]);
  const [approvedList, setApprovedList] = useState<PayableItem[]>([]);
  const [recentPayables, setRecentPayables] = useState<PayableItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Disbursement Modal
  const [disburseModalItem, setDisburseModalItem] = useState<PayableItem | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [disbursing, setDisbursing] = useState(false);

  const fetchFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/finance");
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
      if (data.pendingApprovals) setPendingApprovals(data.pendingApprovals);
      if (data.approvedAwaitingDisbursement) setApprovedList(data.approvedAwaitingDisbursement);
      if (data.recentPayables) setRecentPayables(data.recentPayables);
    } catch (err) {
      console.error("Finance fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const handleApprove = async (paymentId: string) => {
    try {
      const res = await fetch("/api/v1/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPROVE_SUPPLIER_PAYMENT",
          paymentId,
          notes: "Approved by Finance Desk",
        }),
      });
      if (res.ok) fetchFinanceData();
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  const handleDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disburseModalItem || !referenceNumber) return;
    setDisbursing(true);
    try {
      const res = await fetch("/api/v1/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DISBURSE_SUPPLIER_PAYMENT",
          paymentId: disburseModalItem._id,
          referenceNumber,
        }),
      });
      if (res.ok) {
        setDisburseModalItem(null);
        setReferenceNumber("");
        fetchFinanceData();
      }
    } catch (err) {
      console.error("Disburse error:", err);
    } finally {
      setDisbursing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Finance, Ledgers &amp; Approvals</h1>
          <p className="text-slate-400 text-sm mt-1">
            Financial controls, booking profitability, vendor payables authorization, and cash flow governance.
          </p>
        </div>
        <button
          onClick={() => fetchFinanceData()}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>🔄</span> Refresh Financials
        </button>
      </div>

      {/* KPI Financial Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs font-semibold text-slate-400">Total Billed Revenue</p>
          <p className="text-2xl font-black text-white mt-1">
            {metrics ? formatINR(metrics.totalRevenue) : "₹0"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">All trip bookings</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs font-semibold text-emerald-400">Cash Received</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {metrics ? formatINR(metrics.totalCustomerReceived) : "₹0"}
          </p>
          <p className="text-[11px] text-emerald-500/80 mt-0.5">Customer payments cleared</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <p className="text-xs font-semibold text-rose-400">Receivables Due</p>
          <p className="text-2xl font-black text-rose-400 mt-1">
            {metrics ? formatINR(metrics.totalCustomerReceivable) : "₹0"}
          </p>
          <p className="text-[11px] text-rose-500/80 mt-0.5">Pending collection from travelers</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs font-semibold text-amber-400">Estimated Gross Margin</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {metrics ? `${metrics.overallMarginPercent}%` : "0%"}
          </p>
          <p className="text-[11px] text-amber-500/80 mt-0.5">
            Profit: {metrics ? formatINR(metrics.totalGrossProfit) : "₹0"}
          </p>
        </div>
      </div>

      {/* SECTION 1: SUPPLIER APPROVAL QUEUE */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">Vendor Payable Authorization Queue</h2>
              {pendingApprovals.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                  {pendingApprovals.length} Pending
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Dual-control gate: Requires managerial sign-off before funds disbursement.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs">Loading authorization queue...</div>
        ) : pendingApprovals.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs bg-slate-800/20 rounded-2xl border border-slate-800">
            ✓ All supplier payables approved and up to date.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-black border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4">Service Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pendingApprovals.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">{p.bookingNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{p.supplierName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-300">
                        {p.serviceType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-rose-400">{formatINR(p.amount)}</td>
                    <td className="py-3 px-4 text-slate-400">{p.paymentMethod}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleApprove(p._id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer shadow-xs"
                      >
                        ✓ Authorize Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: APPROVED PAYABLES READY FOR DISBURSEMENT */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">Authorized Payables Awaiting Disbursement</h2>
              {approvedList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                  {approvedList.length} Ready
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Authorized vouchers ready for NEFT / Bank release with transaction reference.
            </p>
          </div>
        </div>

        {approvedList.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs bg-slate-800/20 rounded-2xl border border-slate-800">
            No approved payables currently pending disbursement.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-black border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Disburse Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {approvedList.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">{p.bookingNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{p.supplierName}</td>
                    <td className="py-3 px-4 font-black text-amber-400">{formatINR(p.amount)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        APPROVED
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setDisburseModalItem(p);
                          setReferenceNumber("");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-black text-xs cursor-pointer shadow-xs"
                      >
                        💸 Release &amp; Record Ref
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: RECENT DISBURSEMENTS LEDGER */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-base font-black text-white">Disbursements Ledger &amp; Paid Vouchers</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-black border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Bank / UTR Reference</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentPayables.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No transactions recorded in ledger.
                  </td>
                </tr>
              ) : (
                recentPayables.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">{p.bookingNumber}</td>
                    <td className="py-3 px-4 text-slate-300">{p.supplierName}</td>
                    <td className="py-3 px-4 text-slate-400">{p.serviceType}</td>
                    <td className="py-3 px-4 font-bold text-slate-200">{formatINR(p.amount)}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{p.referenceNumber || "—"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          p.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : p.status === "APPROVED"
                            ? "bg-sky-500/10 text-sky-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISBURSEMENT MODAL */}
      {disburseModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Record Payment Disbursement</h3>
              <button
                onClick={() => setDisburseModalItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleDisburse} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/40 rounded-xl space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Payable To:</span>
                  <strong className="text-white">{disburseModalItem.supplierName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Booking Ref:</span>
                  <strong className="text-white">{disburseModalItem.bookingNumber}</strong>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Amount:</span>
                  <strong className="text-base">{formatINR(disburseModalItem.amount)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Bank UTR / Transaction Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-HDFC-99228811 or IMPS Ref"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDisburseModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disbursing}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black cursor-pointer"
                >
                  {disbursing ? "Recording..." : "Disburse Funds"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
