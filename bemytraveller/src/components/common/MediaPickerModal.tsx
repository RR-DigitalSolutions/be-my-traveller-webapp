"use client";

import React, { useState, useEffect } from "react";

export interface MediaItem {
  _id: string;
  filename?: string;
  title?: string;
  url: string;
  publicUrl?: string;
  optimizedUrl?: string;
  thumbnailUrl?: string;
  cardUrl?: string;
  bannerUrl?: string;
  altText?: string;
  size?: number;
  mimeType?: string;
  category?: string;
  folder?: string;
  dimensions?: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
  title?: string;
  defaultFolderType?: "destinations" | "packages" | "hotels" | "activities" | "banners" | "blogs";
  defaultCategory?: "domestic" | "international";
  defaultSlug?: string;
  customFolder?: string;
}

const DOMESTIC_DESTINATIONS = [
  { label: "Himachal Pradesh", slug: "himachal-pradesh" },
  { label: "Kashmir", slug: "kashmir" },
  { label: "Kerala", slug: "kerala" },
  { label: "Goa", slug: "goa" },
  { label: "Rajasthan", slug: "rajasthan" },
  { label: "Andaman & Nicobar", slug: "andaman-nicobar" },
  { label: "Uttarakhand", slug: "uttarakhand" },
  { label: "Ladakh", slug: "ladakh" },
  { label: "North East / Sikkim", slug: "north-east" },
];

const INTERNATIONAL_DESTINATIONS = [
  { label: "Dubai & UAE", slug: "dubai" },
  { label: "Bali (Indonesia)", slug: "bali" },
  { label: "Thailand", slug: "thailand" },
  { label: "Vietnam", slug: "vietnam" },
  { label: "Singapore & Malaysia", slug: "singapore" },
  { label: "Maldives", slug: "maldives" },
  { label: "Europe & UK", slug: "europe" },
  { label: "Sri Lanka", slug: "sri-lanka" },
  { label: "Mauritius", slug: "mauritius" },
];

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select & Upload Media",
  defaultFolderType = "destinations",
  defaultCategory = "domestic",
  defaultSlug = "himachal-pradesh",
  customFolder,
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Upload configuration state
  const [folderType, setFolderType] = useState(defaultFolderType);
  const [destCategory, setDestCategory] = useState(defaultCategory);
  const [selectedSlug, setSelectedSlug] = useState(defaultSlug);
  const [customSlug, setCustomSlug] = useState("");
  const [assetTitle, setAssetTitle] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, filterCategory]);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParam = filterCategory !== "ALL" ? `?category=${filterCategory}` : "";
      const res = await fetch(`/api/v1/admin/media${queryParam}`);
      const data = await res.json();
      if (data.media) {
        setMediaList(data.media);
      }
    } catch (err) {
      console.error("Failed to fetch media:", err);
      setError("Failed to load media assets");
    } finally {
      setLoading(false);
    }
  };

  const currentEffectiveSlug =
    customSlug.trim() ||
    (folderType === "destinations"
      ? selectedSlug
      : customSlug || "general");

  const expectedFolderPath =
    customFolder?.trim() ||
    (folderType === "destinations"
      ? `bemytraveller/destinations/${destCategory}/${currentEffectiveSlug}`
      : `bemytraveller/${folderType}/${currentEffectiveSlug}`);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(`Connecting to Cloudinary... Uploading to ${expectedFolderPath}`);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderType", folderType);
      formData.append("category", folderType === "destinations" ? destCategory : folderType);
      formData.append("slug", currentEffectiveSlug);
      if (customFolder) {
        formData.append("customFolder", customFolder);
      }
      formData.append("title", assetTitle || file.name.replace(/\.[^/.]+$/, ""));

      const res = await fetch("/api/v1/cloudinary/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload image to Cloudinary.");
      }

      const result = await res.json();
      const uploadedMedia: MediaItem = result.media;

      setUploadProgress("Image successfully uploaded & auto-optimized!");
      // Add to media list
      setMediaList((prev) => [uploadedMedia, ...prev]);

      // Trigger selection
      onSelect(uploadedMedia);
      onClose();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  if (!isOpen) return null;

  const filteredItems = mediaList.filter((m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (m.title && m.title.toLowerCase().includes(query)) ||
      (m.filename && m.filename.toLowerCase().includes(query)) ||
      (m.folder && m.folder.toLowerCase().includes(query))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              ☁️
            </div>
            <div>
              <h3 className="text-base font-black text-white">{title}</h3>
              <p className="text-xs text-slate-400">
                Cloudinary CDN Storage with Auto WebP/AVIF &amp; High-Efficiency Compression
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            onClick={() => setActiveTab("library")}
            className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "library"
                ? "border-amber-400 text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            🖼️ Media Library ({mediaList.length})
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "upload"
                ? "border-amber-400 text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            ⬆️ Upload to Cloudinary
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} className="text-xs font-bold underline cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          {activeTab === "library" && (
            <div className="space-y-4">
              {/* Category Filter Pills & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {["ALL", "Destinations", "Packages", "Hotels", "Activities", "Banners"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer shrink-0 ${
                        filterCategory === cat
                          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                          : "bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search media by title or folder..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 px-3 py-1.5 pl-8 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute left-2.5 top-2 text-slate-500 text-xs">🔍</span>
                </div>
              </div>

              {/* Media Grid */}
              {loading ? (
                <div className="py-20 text-center text-xs text-slate-500 animate-pulse">
                  Loading Cloudinary media assets...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl p-6 bg-slate-950/30">
                  <p className="text-slate-400 text-xs font-semibold">No media found matching your filter.</p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="mt-3 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30 cursor-pointer"
                  >
                    ⬆️ Upload first image for this section
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredItems.map((m) => (
                    <div
                      key={m._id}
                      onClick={() => {
                        onSelect(m);
                        onClose();
                      }}
                      className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video cursor-pointer hover:border-amber-500/80 transition-all hover:scale-[1.02] shadow-md flex flex-col justify-between"
                    >
                      <img
                        src={m.thumbnailUrl || m.optimizedUrl || m.url}
                        alt={m.altText || m.title || "Media preview"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-slate-950/80 text-amber-400 backdrop-blur-xs border border-amber-500/20">
                        {m.category || "Asset"}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                        <p className="text-[11px] font-bold text-white line-clamp-1">{m.title || m.filename}</p>
                        <p className="text-[9px] text-amber-400 font-bold flex items-center justify-between mt-0.5">
                          <span>✓ Click to Select</span>
                          <span>{m.dimensions || "Optimized"}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-6">
              {/* Folder Taxonomy Picker */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    📁 1. Select Target Folder Taxonomy
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                    {expectedFolderPath}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Category Type */}
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Media Category</label>
                    <select
                      value={folderType}
                      onChange={(e) => setFolderType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="destinations">Destinations</option>
                      <option value="packages">Tour Packages</option>
                      <option value="hotels">Resorts &amp; Hotels</option>
                      <option value="activities">Activities &amp; Sightseeing</option>
                      <option value="banners">Banners &amp; Promos</option>
                      <option value="blogs">Blog Articles</option>
                    </select>
                  </div>

                  {/* Destination Region if category is destinations */}
                  {folderType === "destinations" && (
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Region</label>
                      <select
                        value={destCategory}
                        onChange={(e) => {
                          const val = e.target.value as "domestic" | "international";
                          setDestCategory(val);
                          setSelectedSlug(
                            val === "domestic"
                              ? DOMESTIC_DESTINATIONS[0].slug
                              : INTERNATIONAL_DESTINATIONS[0].slug
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-amber-500"
                      >
                        <option value="domestic">Domestic (India)</option>
                        <option value="international">International</option>
                      </select>
                    </div>
                  )}

                  {/* Place Dropdown */}
                  {folderType === "destinations" ? (
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Place / Destination</label>
                      <select
                        value={selectedSlug}
                        onChange={(e) => {
                          setSelectedSlug(e.target.value);
                          setCustomSlug("");
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-amber-500"
                      >
                        {(destCategory === "domestic"
                          ? DOMESTIC_DESTINATIONS
                          : INTERNATIONAL_DESTINATIONS
                        ).map((place) => (
                          <option key={place.slug} value={place.slug}>
                            {place.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Item / Package Slug</label>
                      <input
                        type="text"
                        placeholder="e.g. kashmir-honeymoon-special"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Optional Custom Slug or Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Image Title / Caption <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rohtang Pass Snow Sunset View"
                      value={assetTitle}
                      onChange={(e) => setAssetTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  {folderType === "destinations" && (
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Custom Place Slug <span className="text-slate-500 font-normal">(Overrides dropdown)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. tirthan-valley or kaziranga"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 transition-colors rounded-2xl p-8 text-center bg-slate-950/40 relative">
                <input
                  type="file"
                  id="cloudinary-picker-upload"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="cloudinary-picker-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    ☁️
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Click to select photo and upload</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Auto-compressed &amp; resized to 1080p max • Optimized for Free Tier Cloudinary Quota
                    </p>
                    <p className="text-[11px] text-amber-400/90 font-mono mt-1">
                      Destination Folder: {expectedFolderPath}
                    </p>
                  </div>
                </label>

                {uploading && (
                  <div className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                    <span className="animate-spin text-base">⏳</span>
                    <span>{uploadProgress}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
