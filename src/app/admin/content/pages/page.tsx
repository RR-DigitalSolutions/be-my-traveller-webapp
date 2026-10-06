"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { ManagedPageData, PageStatItem, PageSectionItem, PageFaqItem, PageHighlightItem, PageTableItem } from "@/domains/cms/pages.config";

interface PageSummary {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  template: string;
  status: string;
  updatedAt: string;
  isCustomized: boolean;
}

const PAGE_DEFINITIONS = [
  { slug: "about", name: "About Us", path: "/about", icon: "🌍", color: "amber", desc: "Company story, core guarantees, specialist profiles & conversion metrics" },
  { slug: "cancellation-policy", name: "Cancellation & Refunds", path: "/cancellation-policy", icon: "🛡️", color: "emerald", desc: "Refund slabs, date flexibility, force majeure waivers & resolution workflows" },
  { slug: "terms", name: "Terms & Conditions", path: "/terms", icon: "📜", color: "sky", desc: "Booking contracts, vehicle mountain guidelines & legal jurisdictions" },
  { slug: "privacy", name: "Privacy Policy", path: "/privacy", icon: "🔒", color: "purple", desc: "DPDP 2023 compliance, payment tokenization & traveler confidentiality" },
  { slug: "contact", name: "Contact & Concierge", path: "/contact", icon: "📞", color: "rose", desc: "24/7 mountain helplines, WhatsApp desk & ground operations offices" },
];

export default function AdminPagesManager() {
  const [activeSlug, setActiveSlug] = useState<string>("about");
  const [pagesList, setPagesList] = useState<PageSummary[]>([]);
  const [pageData, setPageData] = useState<ManagedPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"HERO" | "STATS" | "HIGHLIGHTS" | "SECTIONS" | "TABLE" | "FAQS" | "SEO">("HERO");
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage(text, type);
  };

  const setToastMessage = (text: string, type: "success" | "error") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all pages summary
  const fetchPagesList = async () => {
    try {
      const res = await fetch("/api/v1/admin/pages");
      const data = await res.json();
      if (data.success) {
        setPagesList(data.pages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch single page data
  const fetchPageDetail = async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/pages/${slug}`);
      const data = await res.json();
      if (data.success && data.page) {
        setPageData(data.page);
      } else {
        showToast(data.error || "Failed to load page content", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error fetching page", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagesList();
    fetchPageDetail(activeSlug);
  }, [activeSlug]);

  // Handle Save
  const handleSave = async () => {
    if (!pageData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/pages/${activeSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Page '${pageData.title}' updated & published successfully!`);
        fetchPagesList();
      } else {
        showToast(data.error || "Failed to update page", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("An unexpected error occurred while saving", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle Reset to Defaults
  const handleReset = async () => {
    const confirmed = window.confirm(
      `Restore '${activeSlug}' to verified competitor-benchmarked default content? Any custom text will be replaced.`
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/pages/${activeSlug}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Restored to verified default content");
        setPageData(data.page);
        fetchPagesList();
      } else {
        showToast(data.error || "Failed to reset page", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error resetting page", "error");
    } finally {
      setSaving(false);
    }
  };

  const activeDef = PAGE_DEFINITIONS.find((p) => p.slug === activeSlug) || PAGE_DEFINITIONS[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold backdrop-blur-md transition-all ${
            toast.type === "success"
              ? "bg-emerald-950/90 border border-emerald-500/50 text-emerald-200"
              : "bg-rose-950/90 border border-rose-500/50 text-rose-200"
          }`}
        >
          <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header with Title and Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Website Pages &amp; Legal CMS
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              5 Managed Pages
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage public page narratives, refund slab tables, legal agreements, privacy disclosures &amp; verified contact desks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={activeDef.path}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-colors"
          >
            <span>🌐</span> View Live Page
          </Link>
          <button
            onClick={handleReset}
            disabled={saving || loading}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/60 text-xs font-medium transition-colors"
          >
            Restore Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save &amp; Publish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pages Selector Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PAGE_DEFINITIONS.map((def) => {
          const isSelected = def.slug === activeSlug;
          const summary = pagesList.find((p) => p.slug === def.slug);
          return (
            <button
              key={def.slug}
              type="button"
              onClick={() => setActiveSlug(def.slug)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-b from-slate-800 to-slate-900 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500"
                  : "bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{def.icon}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    summary?.isCustomized
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {summary?.isCustomized ? "Customized" : "Verified"}
                </span>
              </div>
              <h3 className="font-bold text-white text-xs leading-snug line-clamp-1">{def.name}</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{def.path}</p>
            </button>
          );
        })}
      </div>

      {/* Active Editor Workspace */}
      {loading || !pageData ? (
        <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">Loading page architecture &amp; sections...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Subheader & Section Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 px-5 pt-3 overflow-x-auto scrollbar-none bg-slate-950/40">
            <div className="flex items-center gap-1">
              {[
                { id: "HERO", label: "Hero & Banner", icon: "✨" },
                ...(pageData.stats && pageData.stats.length > 0 ? [{ id: "STATS", label: "Stats & Metrics", icon: "📊" }] : []),
                ...(pageData.highlights && pageData.highlights.length > 0 ? [{ id: "HIGHLIGHTS", label: "Key Highlights", icon: "⭐" }] : []),
                ...(pageData.tableData && pageData.tableData.length > 0 ? [{ id: "TABLE", label: "Refund Slabs Table", icon: "📋" }] : []),
                { id: "SECTIONS", label: "Story & Clauses", icon: "📝" },
                { id: "FAQS", label: "Page FAQs", icon: "❓" },
                { id: "SEO", label: "SEO & Social", icon: "🔍" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                    activeTab === tab.id
                      ? "text-amber-400 border-amber-500 bg-slate-900"
                      : "text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              Editing: <strong className="text-slate-300">{pageData.slug}</strong>
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* ── TAB 1: HERO & HEADER ── */}
            {activeTab === "HERO" && (
              <div className="space-y-4 max-w-4xl text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Page Headline Title *</label>
                    <input
                      type="text"
                      value={pageData.title}
                      onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                      placeholder="e.g. Crafting Unforgettable Journeys..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Top Badge Pill</label>
                    <input
                      type="text"
                      value={pageData.badge}
                      onChange={(e) => setPageData({ ...pageData, badge: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                      placeholder="e.g. 🌍 India's Custom Travel Architects"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subtitle / Narrative Summary</label>
                  <textarea
                    rows={3}
                    value={pageData.subtitle}
                    onChange={(e) => setPageData({ ...pageData, subtitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500 text-xs leading-relaxed"
                    placeholder="Provide a clear, conversion-oriented description..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Hero Background Image URL</label>
                    <input
                      type="text"
                      value={pageData.heroImage || ""}
                      onChange={(e) => setPageData({ ...pageData, heroImage: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Hero CTA Button Text</label>
                    <input
                      type="text"
                      value={pageData.heroCtaText || ""}
                      onChange={(e) => setPageData({ ...pageData, heroCtaText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                      placeholder="e.g. Explore Custom Packages"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Hero CTA Link</label>
                    <input
                      type="text"
                      value={pageData.heroCtaLink || ""}
                      onChange={(e) => setPageData({ ...pageData, heroCtaLink: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                      placeholder="/packages or /contact"
                    />
                  </div>
                </div>

                {/* Hero Preview Box */}
                <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 font-mono">
                    Live Header Preview (With Transparent Navbar Simulation)
                  </div>
                  <div className="rounded-lg bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 text-center border border-slate-800/80 space-y-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {pageData.badge || "Page Badge"}
                    </span>
                    <h2 className="text-lg font-black text-white">{pageData.title || "Page Title"}</h2>
                    <p className="text-xs text-slate-300 max-w-xl mx-auto">{pageData.subtitle || "Page Subtitle"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: STATS & METRICS ── */}
            {activeTab === "STATS" && (
              <div className="space-y-4 max-w-4xl text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">Conversion &amp; Trust Statistics</h3>
                    <p className="text-slate-400 text-xs">Featured in top summary strip to build credibility</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...(pageData.stats || []), { value: "10,000+", label: "New Stat", icon: "✨" }];
                      setPageData({ ...pageData, stats: updated });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold"
                  >
                    + Add Stat Metric
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(pageData.stats || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <input
                        type="text"
                        value={item.icon || "✨"}
                        onChange={(e) => {
                          const updated = [...(pageData.stats || [])];
                          updated[idx].icon = e.target.value;
                          setPageData({ ...pageData, stats: updated });
                        }}
                        className="w-10 text-center bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-xs text-white"
                        title="Emoji Icon"
                      />
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => {
                          const updated = [...(pageData.stats || [])];
                          updated[idx].value = e.target.value;
                          setPageData({ ...pageData, stats: updated });
                        }}
                        className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-bold"
                        placeholder="Value (25K+)"
                      />
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const updated = [...(pageData.stats || [])];
                          updated[idx].label = e.target.value;
                          setPageData({ ...pageData, stats: updated });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                        placeholder="Label"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (pageData.stats || []).filter((_, i) => i !== idx);
                          setPageData({ ...pageData, stats: updated });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 3: KEY HIGHLIGHTS ── */}
            {activeTab === "HIGHLIGHTS" && (
              <div className="space-y-4 max-w-4xl text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">Key Value Propositions &amp; Pillars</h3>
                    <p className="text-slate-400 text-xs">Displayed as interactive feature cards</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [
                        ...(pageData.highlights || []),
                        { icon: "✨", title: "New Guarantee", desc: "Description of your core differentiator..." },
                      ];
                      setPageData({ ...pageData, highlights: updated });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold"
                  >
                    + Add Feature Card
                  </button>
                </div>

                <div className="space-y-3">
                  {(pageData.highlights || []).map((item, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={item.icon}
                          onChange={(e) => {
                            const updated = [...(pageData.highlights || [])];
                            updated[idx].icon = e.target.value;
                            setPageData({ ...pageData, highlights: updated });
                          }}
                          className="w-12 text-center bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-sm text-white"
                        />
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...(pageData.highlights || [])];
                            updated[idx].title = e.target.value;
                            setPageData({ ...pageData, highlights: updated });
                          }}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                          placeholder="Feature Title"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (pageData.highlights || []).filter((_, i) => i !== idx);
                            setPageData({ ...pageData, highlights: updated });
                          }}
                          className="text-slate-500 hover:text-rose-400 px-2 py-1"
                        >
                          Delete
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={item.desc}
                        onChange={(e) => {
                          const updated = [...(pageData.highlights || [])];
                          updated[idx].desc = e.target.value;
                          setPageData({ ...pageData, highlights: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
                        placeholder="Feature Description..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 4: REFUND SLABS / TABLE ── */}
            {activeTab === "TABLE" && (
              <div className="space-y-4 max-w-4xl text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">Notice Period &amp; Refund Slabs Matrix</h3>
                    <p className="text-slate-400 text-xs">Industry-standard transparent cancellation deduction tiers</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [
                        ...(pageData.tableData || []),
                        { label: "New Notice Window", value: "50% Refund", badge: "50% Fee" },
                      ];
                      setPageData({ ...pageData, tableData: updated });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold"
                  >
                    + Add Refund Slab
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(pageData.tableData || []).map((row, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => {
                          const updated = [...(pageData.tableData || [])];
                          updated[idx].label = e.target.value;
                          setPageData({ ...pageData, tableData: updated });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                        placeholder="Notice Timeline (e.g. 45+ Days before travel)"
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => {
                          const updated = [...(pageData.tableData || [])];
                          updated[idx].value = e.target.value;
                          setPageData({ ...pageData, tableData: updated });
                        }}
                        className="w-56 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-semibold"
                        placeholder="Refund Amount (e.g. 100% Refund)"
                      />
                      <input
                        type="text"
                        value={row.badge || ""}
                        onChange={(e) => {
                          const updated = [...(pageData.tableData || [])];
                          updated[idx].badge = e.target.value;
                          setPageData({ ...pageData, tableData: updated });
                        }}
                        className="w-32 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                        placeholder="Fee Badge"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (pageData.tableData || []).filter((_, i) => i !== idx);
                          setPageData({ ...pageData, tableData: updated });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 5: CONTENT SECTIONS & CLAUSES ── */}
            {activeTab === "SECTIONS" && (
              <div className="space-y-4 max-w-4xl text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">Narrative Chapters &amp; Policy Sections</h3>
                    <p className="text-slate-400 text-xs">Richly formatted content blocks with subheadings</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [
                        ...(pageData.sections || []),
                        { title: "New Section Title", subtitle: "Subtitle (Optional)", content: "Write detailed content here..." },
                      ];
                      setPageData({ ...pageData, sections: updated });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold cursor-pointer"
                  >
                    + Add Section Block
                  </button>
                </div>

                <div className="space-y-4">
                  {(pageData.sections || []).map((sec, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center font-mono text-[10px] text-amber-400">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => {
                            const updated = [...(pageData.sections || [])];
                            updated[idx].title = e.target.value;
                            setPageData({ ...pageData, sections: updated });
                          }}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                          placeholder="Section Title"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (pageData.sections || []).filter((_, i) => i !== idx);
                            setPageData({ ...pageData, sections: updated });
                          }}
                          className="text-slate-500 hover:text-rose-400 text-xs px-2"
                        >
                          Remove
                        </button>
                      </div>

                      <input
                        type="text"
                        value={sec.subtitle || ""}
                        onChange={(e) => {
                          const updated = [...(pageData.sections || [])];
                          updated[idx].subtitle = e.target.value;
                          setPageData({ ...pageData, sections: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                        placeholder="Subtitle (Optional)"
                      />

                      <textarea
                        rows={6}
                        value={sec.content}
                        onChange={(e) => {
                          const updated = [...(pageData.sections || [])];
                          updated[idx].content = e.target.value;
                          setPageData({ ...pageData, sections: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 leading-relaxed font-sans"
                        placeholder="Write detailed section copy..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 6: FAQS ── */}
            {activeTab === "FAQS" && (
              <div className="space-y-4 max-w-4xl text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">Page Specific FAQs</h3>
                    <p className="text-slate-400 text-xs">Answer traveler questions to boost conversion and reduce support tickets</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [
                        ...(pageData.faqs || []),
                        { question: "New FAQ Question?", answer: "Clear, helpful answer..." },
                      ];
                      setPageData({ ...pageData, faqs: updated });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="space-y-3">
                  {(pageData.faqs || []).map((faq, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-amber-400 font-mono">Q{idx + 1}</span>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const updated = [...(pageData.faqs || [])];
                            updated[idx].question = e.target.value;
                            setPageData({ ...pageData, faqs: updated });
                          }}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-semibold"
                          placeholder="Frequently Asked Question"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (pageData.faqs || []).filter((_, i) => i !== idx);
                            setPageData({ ...pageData, faqs: updated });
                          }}
                          className="text-slate-500 hover:text-rose-400 px-2"
                        >
                          ✕
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={faq.answer}
                        onChange={(e) => {
                          const updated = [...(pageData.faqs || [])];
                          updated[idx].answer = e.target.value;
                          setPageData({ ...pageData, faqs: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 leading-relaxed"
                        placeholder="Answer..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 7: SEO METADATA ── */}
            {activeTab === "SEO" && (
              <div className="space-y-4 max-w-4xl text-xs">
                <div>
                  <h3 className="font-bold text-white text-sm">Search Engine &amp; Social Optimization</h3>
                  <p className="text-slate-400 text-xs">Control Google SERP appearance, meta titles, descriptions and robot tags</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={pageData.seo?.metaTitle || ""}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        seo: { ...pageData.seo, metaTitle: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs"
                    placeholder="e.g. About Us | Be My Traveller"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Meta Description</label>
                  <textarea
                    rows={3}
                    value={pageData.seo?.metaDescription || ""}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        seo: { ...pageData.seo, metaDescription: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs"
                    placeholder="Compelling 150-character summary for Google..."
                  />
                </div>

                {/* SERP Preview */}
                <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 font-mono">
                    Google Search Result Snippet Preview
                  </div>
                  <div className="space-y-1">
                    <div className="text-sky-400 text-sm font-semibold truncate hover:underline cursor-pointer">
                      {pageData.seo?.metaTitle || pageData.title}
                    </div>
                    <div className="text-emerald-400 text-[11px] font-mono">
                      https://bemytraveller.com{activeDef.path}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {pageData.seo?.metaDescription || pageData.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
