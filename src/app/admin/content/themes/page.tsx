"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface ThemeFaqItem {
  q: string;
  a: string;
}

interface HolidayThemeItem {
  _id?: string;
  slug: string;
  name: string;
  label: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  // SEO, AEO, AIO & GEO Rich Fields
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  heroImage?: string;
  aiOverviewSummary?: string;
  targetLocations?: string[];
  faqs?: ThemeFaqItem[];
  richSnippetText?: string;
}

const emptyForm = {
  name: "",
  label: "",
  slug: "",
  description: "",
  isActive: true,
  sortOrder: 0,
  // SEO, AEO, AIO & GEO Rich Fields
  metaTitle: "",
  metaDescription: "",
  keywordsText: "",
  canonicalUrl: "",
  ogImage: "",
  heroImage: "",
  aiOverviewSummary: "",
  targetLocationsText: "",
  faqs: [] as ThemeFaqItem[],
  richSnippetText: "",
};

export default function ContentThemesPage() {
  const [themes, setThemes] = useState<HolidayThemeItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "seo">("general");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadThemes = async () => {
    try {
      const response = await fetch("/api/v1/themes");
      const data = await response.json();
      setThemes(Array.isArray(data.themes) ? data.themes : []);
    } catch (error) {
      console.error("Unable to load themes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThemes();
  }, []);

  const sortOrderList = useMemo(
    () => [...themes].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)),
    [themes]
  );

  const handleChange = (key: keyof typeof emptyForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // FAQ Handlers
  const addFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { q: "", a: "" }],
    }));
  };

  const updateFaq = (index: number, field: "q" | "a", value: string) => {
    setForm((prev) => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });
  };

  const removeFaq = (index: number) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const submitTheme = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const payload = {
        name: form.name || form.label,
        label: form.label || form.name,
        slug: form.slug || form.name,
        description: form.description,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        keywords: form.keywordsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        canonicalUrl: form.canonicalUrl,
        ogImage: form.ogImage,
        heroImage: form.heroImage,
        aiOverviewSummary: form.aiOverviewSummary,
        targetLocations: form.targetLocationsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        faqs: form.faqs.filter((f) => f.q.trim() && f.a.trim()),
        richSnippetText: form.richSnippetText,
      };

      const response = await fetch("/api/v1/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: editingId ?? undefined }),
      });

      if (!response.ok) {
        throw new Error("Unable to save theme");
      }

      setStatusMessage("Theme & SEO Metadata saved successfully!");
      setForm(emptyForm);
      setEditingId(null);
      setActiveTab("general");
      await loadThemes();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (error: any) {
      console.error(error);
      setStatusMessage("Error: " + (error?.message || "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const deleteTheme = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to remove this theme?")) return;
    const response = await fetch(`/api/v1/themes/${id}`, { method: "DELETE" });
    if (response.ok) {
      await loadThemes();
    }
  };

  const editTheme = (theme: HolidayThemeItem) => {
    setEditingId(theme._id ?? null);
    setForm({
      name: theme.name || "",
      label: theme.label || "",
      slug: theme.slug || "",
      description: theme.description || "",
      isActive: theme.isActive !== false,
      sortOrder: Number(theme.sortOrder || 0),
      metaTitle: theme.metaTitle || "",
      metaDescription: theme.metaDescription || "",
      keywordsText: Array.isArray(theme.keywords) ? theme.keywords.join(", ") : "",
      canonicalUrl: theme.canonicalUrl || "",
      ogImage: theme.ogImage || "",
      heroImage: theme.heroImage || "",
      aiOverviewSummary: theme.aiOverviewSummary || "",
      targetLocationsText: Array.isArray(theme.targetLocations) ? theme.targetLocations.join(", ") : "",
      faqs: Array.isArray(theme.faqs) && theme.faqs.length > 0 ? theme.faqs : [],
      richSnippetText: theme.richSnippetText || "",
    });
    // Auto switch to SEO tab if editing to encourage optimization
    setActiveTab("general");
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Content &amp; CMS</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                SEO · AEO · AIO · GEO Ready
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-white">Holiday Themes &amp; SEO Engine Manager</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure themes, optimize for Google Search, AI Overviews, Perplexity answer engines &amp; geo-local visibility.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/themes"
              target="_blank"
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-amber-400 hover:border-amber-500 hover:text-white transition-all flex items-center gap-1"
            >
              <span>🌐</span> Preview Public Themes
            </Link>
            <Link
              href="/admin/content"
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:border-slate-500 hover:text-white transition-all"
            >
              Back to Content Hub
            </Link>
          </div>
        </div>

        {statusMessage && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-bold flex items-center justify-between ${
            statusMessage.startsWith("Error")
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          }`}>
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Left: Form Editor */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 shadow-inner">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h2 className="text-lg font-bold text-white">
                  {editingId ? `Edit Theme: ${form.label || form.name}` : "Create New Holiday Theme"}
                </h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setActiveTab("general");
                  }}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 mb-5 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`py-2 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "general"
                    ? "border-amber-400 text-amber-400 bg-amber-400/5 rounded-t-lg"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>⚙️</span> General Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className={`py-2 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "seo"
                    ? "border-amber-400 text-amber-400 bg-amber-400/5 rounded-t-lg"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>🚀</span> SEO, AEO, AIO &amp; GEO Engine
                {(form.metaTitle || form.aiOverviewSummary) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            </div>

            {/* TAB 1: General Details */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Theme Code (Internal Identifier)
                    <input
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 placeholder:text-slate-600 font-mono uppercase"
                      placeholder="HONEYMOON"
                    />
                  </label>

                  <label className="block text-xs font-bold text-slate-300">
                    Display Label (Frontend Title)
                    <input
                      value={form.label}
                      onChange={(e) => handleChange("label", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 placeholder:text-slate-600"
                      placeholder="Honeymoon & Romance"
                    />
                  </label>

                  <label className="block text-xs font-bold text-slate-300">
                    URL Slug
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">/themes/</span>
                      <input
                        value={form.slug}
                        onChange={(e) => handleChange("slug", e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-20 pr-3 py-2 text-sm text-white outline-none focus:border-amber-400 placeholder:text-slate-600 font-mono lowercase"
                        placeholder="honeymoon"
                      />
                    </div>
                  </label>

                  <label className="block text-xs font-bold text-slate-300">
                    Display Sort Order
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => handleChange("sortOrder", Number(e.target.value || 0))}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                    />
                  </label>
                </div>

                <label className="block text-xs font-bold text-slate-300">
                  Theme Description (Page Subtitle)
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 placeholder:text-slate-600 leading-relaxed"
                    placeholder="Short summary for this holiday theme. E.g., Romantic escapes and couple-friendly breaks across Himachal, Kashmir, Bali, and Maldives."
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Hero Banner Image URL (Optional)
                    <input
                      value={form.heroImage}
                      onChange={(e) => handleChange("heroImage", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 placeholder:text-slate-600 font-mono text-xs"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </label>

                  <label className="block text-xs font-bold text-slate-300">
                    Social OG Image URL (Optional)
                    <input
                      value={form.ogImage}
                      onChange={(e) => handleChange("ogImage", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 placeholder:text-slate-600 font-mono text-xs"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </label>
                </div>

                <label className="flex items-center gap-3 text-xs font-bold text-slate-300 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-0"
                  />
                  Active in public package filters &amp; theme pages
                </label>
              </div>
            )}

            {/* TAB 2: SEO, AEO, AIO & GEO Engine Rich Metadata */}
            {activeTab === "seo" && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                  💡 <strong>Search &amp; AI Visibility Optimization</strong>: Fields entered here power the theme&apos;s title tag, meta description, OpenGraph, Speakable JSON-LD, FAQ Schema, and AI Answer summaries for Perplexity, Google SGE, and LLMs.
                </div>

                {/* SEO Meta Title */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>SEO Meta Title</span>
                    <span className={`text-[10px] font-mono ${form.metaTitle.length > 60 ? "text-amber-400" : "text-slate-400"}`}>
                      {form.metaTitle.length}/60 chars (Recommended: 50-60)
                    </span>
                  </div>
                  <input
                    value={form.metaTitle}
                    onChange={(e) => handleChange("metaTitle", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 placeholder:text-slate-600"
                    placeholder={`Best ${form.label || "Honeymoon"} Tour Packages 2026 | 100% Customized - Be My Traveller`}
                  />
                </div>

                {/* SEO Meta Description */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>SEO Meta Description</span>
                    <span className={`text-[10px] font-mono ${form.metaDescription.length > 160 ? "text-amber-400" : "text-slate-400"}`}>
                      {form.metaDescription.length}/160 chars (Recommended: 140-160)
                    </span>
                  </div>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => handleChange("metaDescription", e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 placeholder:text-slate-600 leading-relaxed"
                    placeholder={`Book handcrafted ${form.label || "honeymoon"} tour packages with verified luxury stays, private cab transfers, candle-light dinners & 24/7 on-trip support.`}
                  />
                </div>

                {/* AEO / AIO Direct Answer Summary */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5 text-purple-300">
                      <span>🤖</span> AEO &amp; AI Overview Direct Answer (Perplexity / ChatGPT / Google AI)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {form.aiOverviewSummary.length} chars
                    </span>
                  </div>
                  <textarea
                    value={form.aiOverviewSummary}
                    onChange={(e) => handleChange("aiOverviewSummary", e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-purple-500/40 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-purple-400 placeholder:text-slate-600 leading-relaxed"
                    placeholder="Concise 40-60 words factual answer explaining what Be My Traveller offers for this theme, average starting cost (₹14,999), top destinations covered, and inclusions (private vehicle, 4-star stays, daily meals)."
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    AI bots extract this exact paragraph when answering queries like: <em>&quot;What are the best {form.label || "honeymoon"} packages in India?&quot;</em>
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Keywords */}
                  <label className="block text-xs font-bold text-slate-300">
                    Target Keywords (Comma Separated)
                    <input
                      value={form.keywordsText}
                      onChange={(e) => handleChange("keywordsText", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 placeholder:text-slate-600"
                      placeholder="honeymoon tour packages, couple packages, manali honeymoon"
                    />
                  </label>

                  {/* GEO Target Locations */}
                  <label className="block text-xs font-bold text-slate-300">
                    GEO Target Locations (Local SEO &amp; Maps)
                    <input
                      value={form.targetLocationsText}
                      onChange={(e) => handleChange("targetLocationsText", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 placeholder:text-slate-600"
                      placeholder="Himachal Pradesh, Kashmir, Kerala, Goa, Bali, Maldives, India"
                    />
                  </label>
                </div>

                {/* Canonical URL Override */}
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Custom Canonical URL (Default: /themes/{form.slug || "slug"})
                    <input
                      value={form.canonicalUrl}
                      onChange={(e) => handleChange("canonicalUrl", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 placeholder:text-slate-600 font-mono text-xs"
                      placeholder="https://www.bemytraveller.com/themes/..."
                    />
                  </label>
                </div>

                {/* Structured FAQs Manager for Schema */}
                <div className="border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">
                        Structured Theme FAQs (Google FAQPage Schema &amp; Rich Snippets)
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        These appear on the public page and generate rich SERP question accordions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addFaq}
                      className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-all cursor-pointer"
                    >
                      + Add FAQ
                    </button>
                  </div>

                  {form.faqs.length === 0 ? (
                    <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 text-center">
                      <p className="text-xs text-slate-500">No custom FAQs defined. Default high-ranking theme FAQs will be used.</p>
                      <button
                        type="button"
                        onClick={addFaq}
                        className="mt-2 text-xs text-amber-400 hover:underline font-bold"
                      >
                        Click to add custom theme FAQs
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.faqs.map((faq, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-2 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-400">FAQ #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeFaq(idx)}
                              className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                            >
                              ✕ Remove
                            </button>
                          </div>
                          <input
                            value={faq.q}
                            onChange={(e) => updateFaq(idx, "q", e.target.value)}
                            className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 outline-none"
                            placeholder="Question: e.g. What is included in this holiday package?"
                          />
                          <textarea
                            value={faq.a}
                            onChange={(e) => updateFaq(idx, "a", e.target.value)}
                            rows={2}
                            className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 outline-none leading-relaxed"
                            placeholder="Answer: Detailed, helpful answer..."
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={submitTheme}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  <span>💾</span>
                  <span>{saving ? "Saving Changes..." : editingId ? "Update Theme & SEO" : "Save New Theme"}</span>
                </button>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setActiveTab("general");
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Reset Form
                </button>
              )}
            </div>
          </div>

          {/* Right: Existing Themes List */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Active Themes</h2>
                <p className="text-[11px] text-slate-400">Click &apos;Edit &amp; SEO&apos; to configure meta tags</p>
              </div>
              <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                {sortOrderList.length} Total
              </span>
            </div>

            {loading ? (
              <p className="mt-4 text-xs text-slate-400">Loading themes…</p>
            ) : sortOrderList.length === 0 ? (
              <p className="mt-4 text-xs text-slate-400">No holiday themes configured yet.</p>
            ) : (
              <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
                {sortOrderList.map((theme) => {
                  const hasCustomSeo = Boolean(theme.metaTitle || theme.aiOverviewSummary || theme.metaDescription);
                  const isCurrent = editingId === theme._id;
                  return (
                    <div
                      key={theme._id ?? theme.slug}
                      className={`rounded-xl border p-3.5 transition-all ${
                        isCurrent
                          ? "border-amber-400 bg-amber-400/10 ring-1 ring-amber-400/40"
                          : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{theme.label}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {theme.name} · /themes/{theme.slug}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9.5px] font-bold ${
                              theme.isActive
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                : "border-slate-600 bg-slate-800 text-slate-400"
                            }`}
                          >
                            {theme.isActive ? "Active" : "Hidden"}
                          </span>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase ${
                              hasCustomSeo
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {hasCustomSeo ? "SEO & AEO Rich" : "Default SEO"}
                          </span>
                        </div>
                      </div>

                      {theme.description && (
                        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {theme.description}
                        </p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500">
                          Order: #{theme.sortOrder ?? 0}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/themes/${theme.slug}`}
                            target="_blank"
                            className="rounded-md bg-slate-800 px-2 py-1 text-[10.5px] font-bold text-slate-300 hover:text-white hover:bg-slate-700"
                          >
                            View Page ↗
                          </Link>
                          <button
                            type="button"
                            onClick={() => editTheme(theme)}
                            className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 px-2.5 py-1 text-[10.5px] font-black transition-all cursor-pointer"
                          >
                            Edit &amp; SEO
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTheme(theme._id)}
                            className="rounded-md bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 px-2 py-1 text-[10.5px] font-bold transition-all cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
