"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import MediaPickerModal, { MediaItem } from "@/components/common/MediaPickerModal";

interface ActivityItem {
  _id: string;
  name: string;
  destination: string;
  destinationId?: string;
  destinationSlug?: string;
  destinationName?: string;
  category: string;
  duration: string;
  adultPrice: number;
  childPrice: number;
  img?: string;
  desc?: string;
  shortDescription?: string;
  highlights?: string[];
  inclusions?: string[];
  status: "ACTIVE" | "INACTIVE";
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
  "Adventure & Water Sports",
  "Trekking & Hiking",
  "Wildlife Safari",
  "Cable Car & Aerial",
  "Boating & Cruise",
  "Sightseeing & Pass",
  "Cultural & Spiritual",
  "Camping & Stargazing",
];

export default function AdminContentActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDestFilter, setSelectedDestFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<ActivityItem | null>(null);

  // Media Picker & Cloudinary Upload
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    destinationId: "",
    destinationSlug: "uttarakhand",
    destinationName: "Uttarakhand",
    destination: "Uttarakhand",
    category: "Adventure & Water Sports",
    duration: "3 Hours",
    adultPrice: 1500,
    childPrice: 900,
    img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
    desc: "",
    highlights: "",
    inclusions: "Certified Instructor, Safety Equipment, Activity Gear",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
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

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedDestFilter !== "ALL") params.append("destinationSlug", selectedDestFilter);

      const res = await fetch(`/api/v1/admin/activities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedDestFilter]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleDestinationChange = (slug: string) => {
    const dest = destinations.find((d) => d.slug === slug);
    setFormData((prev) => ({
      ...prev,
      destinationId: dest?._id || "",
      destinationSlug: slug,
      destinationName: dest ? dest.name : slug,
      destination: dest ? dest.name : slug,
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
      const targetFolder = `bemytraveller/activities/${formData.destinationSlug || "general"}`;
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

      const imageUrl =
        data.secure_url || data.url || data.media?.url || data.media?.secureUrl;
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, img: imageUrl }));
      } else {
        setUploadError(data.error || "Upload succeeded but no image URL was returned");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = "/api/v1/admin/activities";
      const method = editingItem ? "PATCH" : "POST";
      const payload = editingItem
        ? { id: editingItem._id, ...formData }
        : formData;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setAddModalOpen(false);
        setEditModalOpen(false);
        setEditingItem(null);
        fetchActivities();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to save activity");
      }
    } catch (err: any) {
      alert(err.message || "Error saving activity");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete activity "${name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/activities?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchActivities();
      } else {
        alert("Failed to delete activity");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting activity");
    }
  };

  const openEdit = (act: ActivityItem) => {
    setEditingItem(act);
    setFormData({
      name: act.name,
      destinationId: act.destinationId || "",
      destinationSlug: act.destinationSlug || "uttarakhand",
      destinationName: act.destinationName || act.destination,
      destination: act.destination,
      category: act.category || "Adventure & Water Sports",
      duration: act.duration || "3 Hours",
      adultPrice: act.adultPrice || 1500,
      childPrice: act.childPrice || 1000,
      img: act.img || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
      desc: act.desc || act.shortDescription || "",
      highlights: Array.isArray(act.highlights) ? act.highlights.join(", ") : "",
      inclusions: Array.isArray(act.inclusions) ? act.inclusions.join(", ") : "Safety Equipment, Certified Guide",
      status: act.status || "ACTIVE",
    });
    setEditModalOpen(true);
  };

  const openAdd = () => {
    setEditingItem(null);
    const firstDest = destinations[0];
    setFormData({
      name: "",
      destinationId: firstDest?._id || "",
      destinationSlug: firstDest?.slug || "uttarakhand",
      destinationName: firstDest?.name || "Uttarakhand",
      destination: firstDest?.name || "Uttarakhand",
      category: "Adventure & Water Sports",
      duration: "3 Hours",
      adultPrice: 1500,
      childPrice: 900,
      img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
      desc: "",
      highlights: "",
      inclusions: "Certified Instructor, Safety Equipment, Gear Included",
      status: "ACTIVE",
    });
    setAddModalOpen(true);
  };

  const filteredActivities = activities.filter((act) => {
    if (selectedCategory !== "All" && act.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏄‍♂️</span>
            <h1 className="text-2xl font-black text-white tracking-tight">Destination Activities &amp; Experiences</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Manage adventure sports, safari passes, boat rides, and experiences that appear on frontend destination pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <span>＋</span> Add Activity / Pass
          </button>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities, pass names, or destinations..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
            />
          </div>

          {/* Destination Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-bold">Destination:</span>
            <select
              value={selectedDestFilter}
              onChange={(e) => setSelectedDestFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 cursor-pointer min-w-[180px]"
            >
              <option value="ALL">All Destinations ({destinations.length})</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name} ({d.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === c
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Activities Card Grid ── */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm">Loading activities catalog...</div>
      ) : filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((act) => (
            <div
              key={act._id}
              className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-lg hover:border-slate-700 transition-all group flex flex-col justify-between"
            >
              {/* Media & Badges */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <img
                  src={act.img || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80"}
                  alt={act.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-amber-400 border border-slate-800">
                    📍 {act.destinationName || act.destination}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-950/80 backdrop-blur-md text-blue-300 border border-blue-800/40">
                    {act.category}
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-950/90 text-white backdrop-blur-md border border-slate-800">
                  ⏱️ {act.duration}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                    {act.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {act.desc || act.shortDescription || "Exciting destination activity and tour pass with verified local operators."}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400">Adult: <strong className="text-amber-400 font-extrabold text-sm">₹{Number(act.adultPrice).toLocaleString("en-IN")}</strong></span>
                    {act.childPrice ? (
                      <span className="text-slate-500 text-[11px]">Child: ₹{Number(act.childPrice).toLocaleString("en-IN")}</span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      act.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"
                    }`}>
                      {act.status}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(act)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(act._id, act.name)}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all border border-red-500/20 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/30 rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <div className="text-4xl">🏄‍♂️</div>
          <h3 className="text-lg font-bold text-white">No activities found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add water sports, paragliding, jungle safaris, and cable car passes to feature on destination landing pages.
          </p>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400 transition-all"
          >
            + Create First Activity
          </button>
        </div>
      )}

      {/* ── Add / Edit Activity Modal ── */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                  {editingItem ? "Edit Activity" : "New Activity / Pass"}
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {editingItem ? editingItem.name : "Create Destination Activity"}
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
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Activity Name <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. River Rafting in Rishikesh (Shivpuri 16km)"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                  />
                </div>

                {/* Destination Dropdown */}
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

                {/* Duration */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 3 Hours, Half Day"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Adult Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Adult Price (₹)</label>
                  <input
                    type="number"
                    value={formData.adultPrice}
                    onChange={(e) => setFormData({ ...formData, adultPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                  />
                </div>

                {/* Child Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Child Price (₹)</label>
                  <input
                    type="number"
                    value={formData.childPrice}
                    onChange={(e) => setFormData({ ...formData, childPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Cover Photo / Media</label>
                <div className="flex gap-3 items-center">
                  <div className="w-20 h-14 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                    <img
                      src={formData.img}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={formData.img}
                      onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                      placeholder="Paste image URL or upload directly..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 cursor-pointer disabled:opacity-50"
                      >
                        {uploadingImage ? "Uploading to Cloudinary..." : "📁 Upload New Image"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaPickerOpen(true)}
                        className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold border border-amber-500/20 cursor-pointer"
                      >
                        🖼️ Media Gallery
                      </button>
                    </div>
                    {uploadError && <p className="text-[11px] text-red-400">{uploadError}</p>}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Activity Description</label>
                <textarea
                  rows={3}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Describe the experience, safety guidelines, and traveller highlights..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200 leading-relaxed"
                />
              </div>

              {/* Inclusions */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Inclusions (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.inclusions}
                  onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                  placeholder="e.g. Certified Guide, Life Jackets, Safety Helmet, Rapid Briefing"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                />
              </div>

              {/* Highlights */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Key Highlights (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder="e.g. Grade III+ Rapids, Cliff Jump, Body Surfing on Ganga"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingItem ? "Update Activity" : "Create Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(item: MediaItem) => {
          setFormData((prev) => ({ ...prev, img: item.url }));
          setMediaPickerOpen(false);
        }}
      />
    </div>
  );
}
