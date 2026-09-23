"use client";

import React, { useState, useEffect } from "react";

interface RedirectItem {
  _id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  hits: number;
  createdAt: string;
}

export default function AdminSeoRedirectsPage() {
  const [redirects, setRedirects] = useState<RedirectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fromPath: "",
    toPath: "",
    statusCode: 301,
  });

  const fetchRedirects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/seo");
      const data = await res.json();
      if (data.redirects) setRedirects(data.redirects);
    } catch (err) {
      console.error("Error fetching redirects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fromPath || !formData.toPath) return;
    try {
      const res = await fetch("/api/v1/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        setFormData({ fromPath: "", toPath: "", statusCode: 301 });
        fetchRedirects();
      }
    } catch (err) {
      console.error("Error adding redirect:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this URL redirect rule?")) return;
    try {
      await fetch(`/api/v1/admin/seo?id=${id}`, { method: "DELETE" });
      fetchRedirects();
    } catch (err) {
      console.error("Error deleting redirect:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">SEO Redirects &amp; URL Rules</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage 301 permanent and 302 temporary redirects to preserve SEO rankings and traffic.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <span>＋</span> Add Redirect Rule
        </button>
      </div>

      {/* Redirects Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3.5 px-4">From Path</th>
              <th className="py-3.5 px-4">To Path</th>
              <th className="py-3.5 px-4">HTTP Status</th>
              <th className="py-3.5 px-4">Total Hits</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Loading SEO rules...
                </td>
              </tr>
            ) : redirects.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No redirects configured.
                </td>
              </tr>
            ) : (
              redirects.map((r) => (
                <tr key={r._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                    {r.fromPath}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {r.toPath}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {r.statusCode} Permanent
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-400">
                    {r.hits || 0} visits
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold cursor-pointer"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Create Redirect Rule</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">From URL Path</label>
                <input
                  type="text"
                  required
                  placeholder="/old-kashmir-tour"
                  value={formData.fromPath}
                  onChange={(e) => setFormData({ ...formData, fromPath: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">To Destination Path</label>
                <input
                  type="text"
                  required
                  placeholder="/destinations/kashmir"
                  value={formData.toPath}
                  onChange={(e) => setFormData({ ...formData, toPath: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Redirect Type</label>
                <select
                  value={formData.statusCode}
                  onChange={(e) => setFormData({ ...formData, statusCode: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={301}>301 - Moved Permanently (SEO Safe)</option>
                  <option value={302}>302 - Temporary Redirect</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-md"
                >
                  Save Redirect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
