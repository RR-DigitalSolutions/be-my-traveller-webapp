"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import MediaPickerModal, { MediaItem } from "@/components/common/MediaPickerModal";

interface AttractionItem {
  _id: string;
  name: string;
  destinationId?: string;
  destinationSlug: string;
  destinationName: string;
  stateSlug?: string;
  stateName?: string;
  desc: string;
  img: string;
  category: string;
  entryFee?: string;
  timing?: string;
  idealDuration?: string;
  rating?: number;
  displayOrder: number;
  isFeatured?: boolean;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
}

interface DestinationOption {
  _id: string;
  name: string;
  slug: string;
  type: string;
  stateName?: string;
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

export default function AdminAttractionsPage() {
  const [attractions, setAttractions] = useState<AttractionItem[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDestFilter, setSelectedDestFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
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
    destinationSlug: "manali",
    destinationName: "Manali",
    category: "Adventure & Snow",
    desc: "",
    img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80",
    entryFee: "Free",
    timing: "9:00 AM - 6:00 PM",
    idealDuration: "2 to 3 Hours",
    rating: 4.9,
    displayOrder: 1,
    isFeatured: true,
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
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
      destinationSlug: slug,
      destinationName: dest ? dest.name : slug,
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
      uploadForm.append("folder", `bemytraveller/attractions/${formData.destinationSlug || "general"}`);

      const res = await fetch("/api/v1/cloudinary/upload", {
        method: "POST",
        body: uploadForm,
      });

      const data = await res.json();
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, img: data.secure_url }));
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingItem
        ? `/api/v1/admin/attractions/${editingItem._id}`
        : "/api/v1/admin/attractions";
      const method = editingItem ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
    setFormData({
      name: att.name,
      destinationSlug: att.destinationSlug,
      destinationName: att.destinationName,
      category: att.category || "Sightseeing",
      desc: att.desc,
      img: att.img,
      entryFee: att.entryFee || "Free",
      timing: att.timing || "9:00 AM - 6:00 PM",
      idealDuration: att.idealDuration || "2 to 3 Hours",
      rating: att.rating || 4.9,
      displayOrder: att.displayOrder || 1,
      isFeatured: Boolean(att.isFeatured),
      status: att.status || "PUBLISHED",
    });
    setEditModalOpen(true);
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      destinationSlug: destinations[0]?.slug || "manali",
      destinationName: destinations[0]?.name || "Manali",
      category: "Adventure & Snow",
      desc: "",
      img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80",
      entryFee: "Free",
      timing: "9:00 AM - 6:00 PM",
      idealDuration: "2 to 3 Hours",
      rating: 4.9,
      displayOrder: attractions.length + 1,
      isFeatured: true,
      status: "PUBLISHED",
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
              🎡 Sightseeing Engine
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              Live Front-End Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Attractions &amp; Sightseeing Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage iconic places to visit, adventure spots, entry fees, and photos for Indian states and cities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAttractions()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <span>🔄</span> Refresh
          </button>
          <button
            onClick={openAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Add Attraction
          </button>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attractions by name, destination, category..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
            />
          </div>

          {/* Destination Dropdown Filter */}
          <div className="sm:w-60 shrink-0">
            <select
              value={selectedDestFilter}
              onChange={(e) => setSelectedDestFilter(e.target.value)}
              aria-label="Filter attractions by destination"
              className="w-full py-2 px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 font-semibold text-slate-300 cursor-pointer"
            >
              <option value="ALL">📍 All Destinations</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name} ({d.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/60">
          <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Category:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950 shadow-xs"
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
          {attractions.map((att) => (
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
                  <div className="text-[11px] text-slate-500">
                    Order: <strong className="text-slate-300">#{att.displayOrder}</strong>
                  </div>

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
          ))}
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                  {editingItem ? "Edit Attraction" : "New Attraction"}
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {editingItem ? editingItem.name : "Create Iconic Sightseeing Attraction"}
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

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Solang Valley, Rohtang Pass, Hadimba Temple"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                {/* Entry Fee */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Entry Fee</label>
                  <input
                    type="text"
                    value={formData.entryFee}
                    onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                    placeholder="e.g. Free, ₹50 / person"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                  />
                </div>

                {/* Ideal Duration */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Time to Spend</label>
                  <input
                    type="text"
                    value={formData.idealDuration}
                    onChange={(e) => setFormData({ ...formData, idealDuration: e.target.value })}
                    placeholder="e.g. 2 to 3 Hours, Half Day"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Short Highlights Description</label>
                <textarea
                  rows={3}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Describe key attractions, activities, mountain views, and why travellers love it..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 leading-relaxed"
                />
              </div>

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
                    placeholder="Paste external image URL or upload to Cloudinary"
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                  />

                  {/* Hidden file input */}
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
                    {uploadingImage ? "Uploading..." : "☁️ Upload (Cloudinary)"}
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

                {/* Preview Thumbnail */}
                {formData.img && (
                  <div className="relative h-28 w-44 rounded-xl overflow-hidden border border-slate-700 mt-2">
                    <img src={formData.img} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Order & Status */}
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
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
                >
                  {submitting ? "Saving..." : editingItem ? "Update Attraction" : "Create Attraction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <MediaPickerModal
          isOpen={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(item: MediaItem) => {
            setFormData((prev) => ({ ...prev, img: item.url }));
            setMediaPickerOpen(false);
          }}
          defaultFolderType="destinations"
          defaultSlug={formData.destinationSlug || "general"}
        />
      )}
    </div>
  );
}
