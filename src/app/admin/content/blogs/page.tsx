"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  author?: string;
  readTimeMinutes?: number;
  status: string;
  createdAt: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Travel Guides",
    coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
    author: "BMT Editorial Team",
    readTimeMinutes: 5,
    status: "PUBLISHED",
  });

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/blogs?search=${encodeURIComponent(search)}&category=${category}`);
      const data = await res.json();
      if (data.blogs) {
        setBlogs(data.blogs);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [search, category]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        setFormData({
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          category: "Travel Guides",
          coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
          author: "BMT Editorial Team",
          readTimeMinutes: 5,
          status: "PUBLISHED",
        });
        fetchBlogs();
      }
    } catch (err) {
      console.error("Error creating blog:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete blog "${title}"?`)) return;
    try {
      await fetch(`/api/v1/admin/blogs/${id}`, { method: "DELETE" });
      fetchBlogs();
    } catch (err) {
      console.error("Error deleting blog:", err);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await fetch(`/api/v1/admin/blogs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchBlogs();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Travel Blogs &amp; Guides CMS</h1>
          <p className="text-slate-400 text-sm mt-1">
            Publish destination guides, seasonal travel tips, and tourist attraction stories.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <span>＋</span> Write Article
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search articles by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {["ALL", "Travel Guides", "Itineraries", "Food & Culture", "Tips & Hacks"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                category === cat
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
          Loading travel blogs from database...
        </div>
      ) : blogs.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-base">No blog articles found yet.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
          >
            Create First Blog Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <div
              key={b._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col hover:border-slate-700 transition"
            >
              <div className="relative h-44 w-full bg-slate-800">
                {b.coverImage ? (
                  <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">📰</div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-950/80 text-amber-400 backdrop-blur-xs">
                  {b.category || "Guide"}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-950/80 text-slate-300 backdrop-blur-xs">
                  ⏱ {b.readTimeMinutes || 5} min read
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white leading-snug line-clamp-2">{b.title}</h3>
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">{b.excerpt || "No excerpt provided."}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">✍️ {b.author || "BMT"}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusToggle(b._id, b.status)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black cursor-pointer ${
                        b.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {b.status}
                    </button>
                    <button
                      onClick={() => handleDelete(b._id, b.title)}
                      className="text-red-400 hover:text-red-300 text-xs p-1 cursor-pointer"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Blog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Write Travel Article</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBlog} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Top 10 Things To Do In Kashmir in Winter"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Travel Guides">Travel Guides</option>
                    <option value="Itineraries">Itineraries</option>
                    <option value="Food & Culture">Food &amp; Culture</option>
                    <option value="Tips & Hacks">Tips &amp; Hacks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Short Summary / Excerpt</label>
                <textarea
                  rows={2}
                  placeholder="A compelling overview for search engines and preview cards..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Article Content (Markdown or Text)</label>
                <textarea
                  rows={6}
                  placeholder="Write the full travel guide here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Author Name</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Read Time (Minutes)</label>
                  <input
                    type="number"
                    value={formData.readTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, readTimeMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
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
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-md"
                >
                  {submitting ? "Publishing..." : "Publish Blog Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
