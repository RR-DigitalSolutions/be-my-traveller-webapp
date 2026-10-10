"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import MediaPickerModal, { MediaItem } from "@/components/common/MediaPickerModal";

interface AttractionItem {
  _id: string;
  name: string;
  slug?: string;
  destinationId?: string;
  destinationSlug: string;
  destinationName: string;
  stateSlug?: string;
  stateName?: string;
  desc: string;
  detailedContent?: string;
  highlights?: string[] | string;
  howToReach?: string;
  bestTime?: string;
  img: string;
  category: string;
  entryFee?: string;
  timing?: string;
  idealDuration?: string;
  rating?: number;
  displayOrder: number;
  isFeatured?: boolean;
  status: "PUBLISHED" | "DRAFT";
  faqs?: Array<{ q: string; a: string }>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  createdAt: string;
}

interface DestinationOption {
  _id: string;
  name: string;
  slug: string;
  type: string;
  stateName?: string;
  stateSlug?: string;
}

const CATEGORIES = [
  "All",
  "Adventure & Snow",
  "Heritage & Forts",
  "Temples & Spiritual",
  "Nature & Valleys",
  "Lakes & Waterfalls",
  "Wildlife & Safaris",
  "Beaches & Coastal",
  "Sightseeing",
];

type ModalTab = "BASIC" | "MEDIA_PRICING" | "STORY" | "SEO_FAQS";

export default function AdminAttractionsPage() {
  const [attractions, setAttractions] = useState<AttractionItem[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDestFilter, setSelectedDestFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Modals & Tab State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>("BASIC");
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<AttractionItem | null>(null);

  // Media picker & Cloudinary upload
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    destinationId: "",
    destinationSlug: "manali",
    destinationName: "Manali",
    stateSlug: "",
    stateName: "",
    category: "Adventure & Snow",
    desc: "",
    detailedContent: "",
    highlightsText: "",
    howToReach: "",
    bestTime: "",
    img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80",
    entryFee: "Free",
    timing: "9:00 AM - 6:00 PM",
    idealDuration: "2 to 3 Hours",
    rating: 4.9,
    displayOrder: 1,
    isFeatured: true,
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    faqs: [] as Array<{ q: string; a: string }>,
  });

  const fetchDestinations = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/destinations");
      if (res.ok) {
        const data = await res.json();
        setDestinations(data.destinations || []);
      }
    } catch (err) {
      console.error("Error fetching destinations:", err);
    }
  }, []);

  const fetchAttractions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedDestFilter !== "ALL") params.append("destinationSlug", selectedDestFilter);

      const res = await fetch(`/api/v1/admin/attractions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAttractions(data.attractions || []);
      }
    } catch (err) {
      console.error("Error fetching attractions:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedDestFilter]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  useEffect(() => {
    fetchAttractions();
  }, [fetchAttractions]);

  const handleDestinationChange = (slug: string) => {
    const dest = destinations.find((d) => d.slug === slug);
    setFormData((prev) => ({
      ...prev,
      destinationId: dest?._id || "",
      destinationSlug: slug,
      destinationName: dest ? dest.name : slug,
      stateSlug: dest?.stateSlug || "",
      stateName: dest?.stateName || "",
    }));
  };

  const handleNameChange = (name: string) => {
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingItem ? prev.slug : (prev.slug ? prev.slug : generatedSlug),
      metaTitle: prev.metaTitle || `${name} Travel Guide - Timings, Entry Fee & Visitor Highlights | Be My Traveller`,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      const targetFolder = `bemytraveller/attractions/${formData.destinationSlug || "general"}`;
      uploadForm.append("folder", targetFolder);
      uploadForm.append("customFolder", targetFolder);

      const res = await fetch("/api/v1/cloudinary/upload", {
        method: "POST",
        body: uploadForm,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image to Cloudinary.");
      }

      setFormData((prev) => ({ ...prev, img: data.url }));
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMediaSelect = (item: MediaItem) => {
    setFormData((prev) => ({ ...prev, img: item.url || (item as any).secure_url }));
    setMediaPickerOpen(false);
  };

  // FAQ management helpers
  const addFaqItem = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { q: "", a: "" }],
    }));
  };

  const updateFaqItem = (index: number, field: "q" | "a", val: string) => {
    setFormData((prev) => {
      const nextFaqs = [...prev.faqs];
      nextFaqs[index] = { ...nextFaqs[index], [field]: val };
      return { ...prev, faqs: nextFaqs };
    });
  };

  const removeFaqItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingItem
        ? `/api/v1/admin/attractions/${editingItem._id}`
        : "/api/v1/admin/attractions";
      const method = editingItem ? "PATCH" : "POST";

      const highlightsArray = formData.highlightsText
        ? formData.highlightsText.split("\n").map((h) => h.trim()).filter(Boolean)
        : [];

      const payload = {
        ...formData,
        highlights: highlightsArray,
        seo: {
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          keywords: formData.keywords,
        },
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setAddModalOpen(false);
        setEditModalOpen(false);
        setEditingItem(null);
        fetchAttractions();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to save attraction");
      }
    } catch (err: any) {
      alert(err.message || "Error saving attraction");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete attraction "${name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/attractions/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAttractions();
      } else {
        alert("Failed to delete attraction");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting attraction");
    }
  };

  const openEdit = (att: AttractionItem) => {
    setEditingItem(att);
    setActiveTab("BASIC");
    const highlightsStr = Array.isArray(att.highlights)
      ? att.highlights.join("\n")
      : att.highlights || "";

    setFormData({
      name: att.name,
      slug: att.slug || att.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      destinationId: att.destinationId || "",
      destinationSlug: att.destinationSlug,
      destinationName: att.destinationName,
      stateSlug: att.stateSlug || "",
      stateName: att.stateName || "",
      category: att.category || "Sightseeing",
      desc: att.desc || "",
      detailedContent: att.detailedContent || att.desc || "",
      highlightsText: highlightsStr,
      howToReach: att.howToReach || "",
      bestTime: att.bestTime || "",
      img: att.img,
      entryFee: att.entryFee || "Free",
      timing: att.timing || "9:00 AM - 6:00 PM",
      idealDuration: att.idealDuration || "2 to 3 Hours",
      rating: att.rating || 4.9,
      displayOrder: att.displayOrder || 1,
      isFeatured: Boolean(att.isFeatured),
      status: att.status || "PUBLISHED",
      metaTitle: att.seo?.metaTitle || "",
      metaDescription: att.seo?.metaDescription || "",
      keywords: att.seo?.keywords || "",
      faqs: Array.isArray(att.faqs) ? att.faqs : [],
    });
    setEditModalOpen(true);
  };

  const openAdd = () => {
    setEditingItem(null);
    setActiveTab("BASIC");
    const firstDest = destinations[0];
    setFormData({
      name: "",
      slug: "",
      destinationId: firstDest?._id || "",
      destinationSlug: firstDest?.slug || "manali",
      destinationName: firstDest?.name || "Manali",
      stateSlug: firstDest?.stateSlug || "",
      stateName: firstDest?.stateName || "",
      category: "Adventure & Snow",
      desc: "",
      detailedContent: "",
      highlightsText: "",
      howToReach: "",
      bestTime: "",
      img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80",
      entryFee: "Free",
      timing: "9:00 AM - 6:00 PM",
      idealDuration: "2 to 3 Hours",
      rating: 4.9,
      displayOrder: attractions.length + 1,
      isFeatured: true,
      status: "PUBLISHED",
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      faqs: [
        { q: "What is the best time to visit?", a: "Early morning or late afternoon offers pleasant weather and fewer crowds." },
        { q: "Are camera and photography permits required?", a: "Personal mobile photography is allowed. Commercial videography may require local permits." },
      ],
    });
    setAddModalOpen(true);
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-xs font-black uppercase tracking-wider">
              🎡 Sightseeing &amp; Attraction Points
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              Live Front-End Sync
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
              SEO, AEO &amp; AIO Rich
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Attractions Management</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage iconic sightseeing spots, viewpoints, temples, waterfalls, and nature spots. Attractions automatically appear under &quot;Top Attraction Points&quot; on destination pages and have dedicated standalone guide URLs.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>+ Add Attraction</span>
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search attractions by name, description, or landmark..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 placeholder-slate-500"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
        </div>

        {/* Destination Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-400">Destination:</span>
          <select
            value={selectedDestFilter}
            onChange={(e) => setSelectedDestFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 cursor-pointer"
          >
            <option value="ALL">All Destinations ({destinations.length})</option>
            {destinations.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name} ({d.type})
              </option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Attractions Grid ── */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Loading attractions...</div>
      ) : attractions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {attractions.map((att) => {
            const liveUrl = `/attraction/${att.destinationSlug || "india"}/${att.slug || att.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            return (
              <div
                key={att._id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Card Image */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={att.img}
                    alt={att.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-950/80 text-amber-400 text-[10px] font-black uppercase backdrop-blur-xs border border-amber-500/20">
                      📍 {att.destinationName || att.destinationSlug}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 text-[10px] font-black uppercase">
                      {att.category || "Sightseeing"}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                    <span>⏱️ {att.idealDuration || "1-2 Hours"}</span>
                    <span className="text-amber-400 font-extrabold">🎟️ {att.entryFee || "Free"}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                      {att.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {att.desc || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all border border-emerald-500/20 cursor-pointer flex items-center gap-1"
                    >
                      View on Site ↗
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(att)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(att._id, att.name)}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all border border-red-500/20 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900/30 rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <div className="text-4xl">🎡</div>
          <h3 className="text-lg font-bold text-white">No attractions found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add iconic sightseeing spots, valleys, temples, and adventures to showcase on destination pages.
          </p>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400 transition-all"
          >
            + Create First Attraction
          </button>
        </div>
      )}

      {/* ── Add / Edit Attraction Modal ── */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-0 my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                  {editingItem ? "Edit Attraction Guide" : "New Attraction Guide"}
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {editingItem ? editingItem.name : "Create Iconic Attraction Point"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 gap-2 overflow-x-auto">
              {[
                { id: "BASIC" as ModalTab, label: "✨ Basic & Destination" },
                { id: "MEDIA_PRICING" as ModalTab, label: "📸 Media & Timings" },
                { id: "STORY" as ModalTab, label: "📖 Detailed Guide & Story" },
                { id: "SEO_FAQS" as ModalTab, label: "🔍 SEO, AEO & FAQs" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === tab.id
                      ? "border-amber-500 text-amber-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* ── TAB 1: BASIC & DESTINATION ── */}
              {activeTab === "BASIC" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Attraction Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Attraction Name <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Solang Valley, Ram Jhula, Naini Lake"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                      />
                    </div>

                    {/* URL Slug */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        URL Slug <span className="text-slate-500 text-[10px]">(for /attraction/[dest]/[slug])</span>
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="e.g. solang-valley-manali"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Parent Destination */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Associated Destination <span className="text-amber-500">*</span>
                      </label>
                      <select
                        value={formData.destinationSlug}
                        onChange={(e) => handleDestinationChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 cursor-pointer"
                      >
                        {destinations.map((d) => (
                          <option key={d.slug} value={d.slug}>
                            {d.name} ({d.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 cursor-pointer"
                      >
                        {CATEGORIES.filter((c) => c !== "All").map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Display Order</label>
                      <input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "PUBLISHED" | "DRAFT" })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 cursor-pointer"
                      >
                        <option value="PUBLISHED">Published (Visible on Site)</option>
                        <option value="DRAFT">Draft (Hidden)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: MEDIA & TIMINGS ── */}
              {activeTab === "MEDIA_PRICING" && (
                <div className="space-y-4">
                  {/* Photo Image URL & Cloudinary Upload */}
                  <div className="space-y-2 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">Cover Photo / Media</label>
                      <span className="text-[10px] text-amber-500 font-mono">
                        bemytraveller/attractions/{formData.destinationSlug}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        value={formData.img}
                        onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                        placeholder="Paste image URL or upload to Cloudinary"
                        className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                      />

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        {uploadingImage ? "Uploading..." : "☁️ Upload"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setMediaPickerOpen(true)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all shrink-0 border border-slate-700 cursor-pointer"
                      >
                        🖼️ Gallery
                      </button>
                    </div>

                    {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}

                    {formData.img && (
                      <div className="relative h-32 w-48 rounded-xl overflow-hidden border border-slate-700 mt-2">
                        <img src={formData.img} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Entry Fee</label>
                      <input
                        type="text"
                        value={formData.entryFee}
                        onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                        placeholder="e.g. Free, ₹50 / person, ₹250"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Visiting Hours / Timing</label>
                      <input
                        type="text"
                        value={formData.timing}
                        onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                        placeholder="e.g. 6:00 AM - 6:00 PM, Open 24h"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Time Required</label>
                      <input
                        type="text"
                        value={formData.idealDuration}
                        onChange={(e) => setFormData({ ...formData, idealDuration: e.target.value })}
                        placeholder="e.g. 2 to 3 Hours, Half Day"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Traveller Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Best Season / Time to Visit</label>
                      <input
                        type="text"
                        value={formData.bestTime}
                        onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
                        placeholder="e.g. October to May, Early mornings for Aarti"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: DETAILED STORY & HIGHLIGHTS ── */}
              {activeTab === "STORY" && (
                <div className="space-y-4">
                  {/* Short Summary Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Short Summary Description <span className="text-slate-500 text-[10px]">(Appears on destination card)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.desc}
                      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                      placeholder="Brief 2-3 lines overview of the attraction..."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 leading-relaxed"
                    />
                  </div>

                  {/* Detailed Narrative & History */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      In-Depth Travel Guide &amp; History <span className="text-amber-500 text-[10px]">(Rich narrative for dedicated detail page)</span>
                    </label>
                    <textarea
                      rows={6}
                      value={formData.detailedContent}
                      onChange={(e) => setFormData({ ...formData, detailedContent: e.target.value })}
                      placeholder="Provide comprehensive details about history, architectural significance, what visitors can see, mythology, tips, and experiences..."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 leading-relaxed font-sans"
                    />
                  </div>

                  {/* Key Highlights list */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Key Highlights &amp; Must-Do Experiences <span className="text-slate-500 text-[10px]">(One highlight per line)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.highlightsText}
                      onChange={(e) => setFormData({ ...formData, highlightsText: e.target.value })}
                      placeholder={"Traditional wooden row boats\nEvening Ganga Aarti view\nScenic ropeway cable car"}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 leading-relaxed"
                    />
                  </div>

                  {/* How to Reach */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">How to Reach Guide</label>
                    <input
                      type="text"
                      value={formData.howToReach}
                      onChange={(e) => setFormData({ ...formData, howToReach: e.target.value })}
                      placeholder="e.g. Located 3 km from railway station. Accessible via auto-rickshaw or taxi."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 4: SEO, AEO & FAQS ── */}
              {activeTab === "SEO_FAQS" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">SEO Meta Title</label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="e.g. Solang Valley Manali - Complete Travel Guide, Timings & Paragliding"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">SEO Meta Description</label>
                    <textarea
                      rows={2}
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Compelling SERP description (150-160 characters)..."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Search Keywords (Comma separated)</label>
                    <input
                      type="text"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="e.g. solang valley, manali sightseeing, rohtang pass, manali tour"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                    />
                  </div>

                  {/* FAQs Section */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">
                          Frequently Asked Questions (AEO &amp; Voice Search)
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          These will be embedded into the FAQPage schema for Google AI Overviews and Snippets.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addFaqItem}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        + Add FAQ
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.faqs.map((faq, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-500">FAQ #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeFaqItem(idx)}
                              className="text-red-400 hover:text-red-300 text-xs cursor-pointer font-bold"
                            >
                              ✕ Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            value={faq.q}
                            onChange={(e) => updateFaqItem(idx, "q", e.target.value)}
                            placeholder="Question (e.g. Is boating allowed in winter?)"
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                          />
                          <textarea
                            rows={2}
                            value={faq.a}
                            onChange={(e) => updateFaqItem(idx, "a", e.target.value)}
                            placeholder="Answer..."
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  {activeTab !== "SEO_FAQS" ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "BASIC") setActiveTab("MEDIA_PRICING");
                        else if (activeTab === "MEDIA_PRICING") setActiveTab("STORY");
                        else if (activeTab === "STORY") setActiveTab("SEO_FAQS");
                      }}
                      className="text-amber-400 hover:underline cursor-pointer font-bold"
                    >
                      Next Section →
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAddModalOpen(false);
                      setEditModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg transition-all cursor-pointer"
                  >
                    {submitting ? "Saving..." : editingItem ? "Update Attraction" : "Publish Attraction"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Media Picker Modal ── */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
