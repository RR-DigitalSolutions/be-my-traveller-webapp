"use client";

import { useEffect, useMemo, useState } from "react";

interface HolidayThemeItem {
  _id?: string;
  slug: string;
  name: string;
  label: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm = {
  name: "",
  label: "",
  slug: "",
  description: "",
  isActive: true,
  sortOrder: 0,
};

export default function ContentThemesPage() {
  const [themes, setThemes] = useState<HolidayThemeItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleChange = (key: keyof typeof emptyForm, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitTheme = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || form.name,
        name: form.name || form.label,
        label: form.label || form.name,
      };

      const response = await fetch("/api/v1/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: editingId ?? undefined }),
      });

      if (!response.ok) {
        throw new Error("Unable to save theme");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadThemes();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const deleteTheme = async (id?: string) => {
    if (!id) return;
    const response = await fetch(`/api/v1/themes/${id}`, { method: "DELETE" });
    if (response.ok) {
      await loadThemes();
    }
  };

  const editTheme = (theme: HolidayThemeItem) => {
    setEditingId(theme._id ?? null);
    setForm({
      name: theme.name,
      label: theme.label,
      slug: theme.slug,
      description: theme.description || "",
      isActive: theme.isActive,
      sortOrder: Number(theme.sortOrder || 0),
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Content</p>
            <h1 className="mt-2 text-2xl font-black text-white">Holiday Theme Manager</h1>
          </div>
          <a href="/admin/content" className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:border-slate-500 hover:text-white">
            Back to Content Hub
          </a>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingId ? "Edit Theme" : "Add New Theme"}</h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Theme Code
                <input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
                  placeholder="HONEYMOON"
                />
              </label>

              <label className="block text-sm text-slate-300">
                Display Label
                <input
                  value={form.label}
                  onChange={(e) => handleChange("label", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
                  placeholder="Honeymoon & Romance"
                />
              </label>

              <label className="block text-sm text-slate-300">
                URL Slug
                <input
                  value={form.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
                  placeholder="honeymoon"
                />
              </label>

              <label className="block text-sm text-slate-300">
                Sort Order
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => handleChange("sortOrder", Number(e.target.value || 0))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-0"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm text-slate-300">
              Description
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="mt-1 min-h-[100px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
                placeholder="Short summary for this holiday theme"
              />
            </label>

            <label className="mt-4 flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-500"
              />
              Active in public package filters
            </label>

            <button
              type="button"
              onClick={submitTheme}
              disabled={saving}
              className="mt-5 inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Update Theme" : "Save Theme"}
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h2 className="text-lg font-bold text-white">Existing Themes</h2>
            {loading ? (
              <p className="mt-4 text-sm text-slate-400">Loading themes…</p>
            ) : sortOrderList.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No holiday themes configured yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {sortOrderList.map((theme) => (
                  <div key={theme._id ?? theme.slug} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-white">{theme.label}</p>
                        <p className="text-[11px] text-slate-400">{theme.name} · {theme.slug}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${theme.isActive ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-slate-600 bg-slate-800 text-slate-400"}`}>
                        {theme.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                    {theme.description && <p className="mt-2 text-xs text-slate-400">{theme.description}</p>}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => editTheme(theme)}
                        className="rounded-md bg-slate-800 px-2.5 py-1.5 text-[11px] font-bold text-slate-200 hover:bg-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTheme(theme._id)}
                        className="rounded-md bg-red-500/10 px-2.5 py-1.5 text-[11px] font-bold text-red-300 hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
