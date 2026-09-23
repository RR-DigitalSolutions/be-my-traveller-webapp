"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import MediaPickerModal, { MediaItem } from "@/components/common/MediaPickerModal";
import { buildDestinationUrl } from "@/lib/destinations/slug-resolver";

interface AttractionItem {
  name: string;
  desc: string;
  img: string;
  category?: string;
  entryFee?: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface DestinationItem {
  _id: string;
  name: string;
  slug: string;
  type: "COUNTRY" | "STATE" | "CITY" | "ISLAND" | "AREA" | "UNION_TERRITORY";
  countryId?: string;
  countrySlug?: string;
  countryName?: string;
  stateId?: string;
  stateSlug?: string;
  stateName?: string;
  region?: string;
  displayOrder?: number;
  startingPrice?: string;
  tagline?: string;
  idealDuration?: string;
  bestTimeToVisit?: string;
  weather?: string;
  howToReach?: string;
  shortDescription?: string;
  highlights?: string[];
  attractions?: AttractionItem[];
  faqs?: FaqItem[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  coverImage?: string;
  coverImageStr?: string;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED" | "IN_REVIEW";
  createdAt: string;
  updatedAt?: string;
}

const REGION_OPTIONS = [
  "Domestic / India",
  "North India",
  "South India",
  "West & Central",
  "East and North East",
  "Islands and Union Territory",
  "Asia & Middle East",
  "Europe",
  "Americas",
  "Africa & Island Escapes",
];

const MODAL_TABS = [
  { id: "hierarchy", label: "Hierarchy & Basic", icon: "📍" },
  { id: "facts", label: "Fast Facts & Pricing", icon: "🏔️" },
  { id: "overview", label: "Content & Story", icon: "📝" },
  { id: "attractions", label: "Attractions", icon: "🎡" },
  { id: "faqs", label: "FAQs & Schema", icon: "❓" },
  { id: "seo", label: "SEO & AI Search", icon: "🔍" },
  { id: "media", label: "Media & Photos", icon: "📸" },
];

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Master lists for cascading dropdowns
  const [masterCountries, setMasterCountries] = useState<Array<{ _id: string; name: string; slug: string }>>([
    { _id: "india", name: "India", slug: "india" },
    { _id: "uae", name: "United Arab Emirates", slug: "uae" },
    { _id: "indonesia", name: "Indonesia", slug: "indonesia" },
    { _id: "switzerland", name: "Switzerland", slug: "switzerland" },
    { _id: "thailand", name: "Thailand", slug: "thailand" },
  ]);
  const [masterStates, setMasterStates] = useState<Array<{ _id: string; name: string; slug: string; countryName?: string; countryId?: string; region?: string }>>([]);

  // Modals & Active Tab
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("hierarchy");
  const [submitting, setSubmitting] = useState(false);
  const [editingDest, setEditingDest] = useState<DestinationItem | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<{
    isOpen: boolean;
    name: string;
    type: string;
    url: string;
    action: "created" | "updated";
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Media & Cloudinary upload state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "STATE" as "COUNTRY" | "STATE" | "CITY" | "ISLAND" | "AREA" | "UNION_TERRITORY",
    countryId: "india",
    stateId: "",
    region: "North India",
    displayOrder: 1,
    startingPrice: "₹14,999",
    tagline: "",
    idealDuration: "4 to 6 Days",
    bestTimeToVisit: "October to March",
    weather: "Summer: 12°C to 25°C · Winter: -5°C to 10°C",
    howToReach: "Nearest airport or railhead connected with private cabs and luxury Volvo coaches.",
    shortDescription: "",
    highlights: "",
    attractions: [] as AttractionItem[],
    faqs: [] as FaqItem[],
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: "",
    },
    coverImage: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80",
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
  });

  // Inline sub-states for adding new Attraction / FAQ inside the modal
  const [newAttraction, setNewAttraction] = useState<AttractionItem>({
    name: "",
    desc: "",
    img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=600&q=80",
    category: "Sightseeing",
    entryFee: "Free",
  });

  const [newFaq, setNewFaq] = useState<FaqItem>({
    q: "",
    a: "",
  });

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedType !== "ALL") params.append("type", selectedType);

      const res = await fetch(`/api/v1/admin/destinations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDestinations(data.destinations || []);

        // Populate master countries & states
        const allDests: DestinationItem[] = data.destinations || [];
        const countries = allDests.filter((d) => d.type === "COUNTRY");
        if (countries.length > 0) {
          setMasterCountries(countries.map((c) => ({ _id: c._id, name: c.name, slug: c.slug })));
        }

        const states = allDests.filter((d) => d.type === "STATE" || d.type === "UNION_TERRITORY" || d.type === "ISLAND");
        setMasterStates(states.map((s) => ({ _id: s._id, name: s.name, slug: s.slug, countryName: s.countryName, countryId: s.countryId, region: s.region })));
      }
    } catch (err) {
      console.error("Error fetching destinations:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedType]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const getDestinationFolderPath = (form: typeof formData) => {
    const clean = (s?: string) =>
      (s || "")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    const cSlug = "india";
    const stateObj = masterStates.find((s) => String(s._id) === String(form.stateId) || s.slug === form.stateId);
    const sSlug = clean(stateObj?.slug);
    const pSlug = clean(form.slug || form.name);

    if (form.type === "COUNTRY") {
      return `bemytraveller/destinations/${pSlug || "india"}`;
    }
    if (form.type === "STATE" || form.type === "ISLAND") {
      return `bemytraveller/destinations/${cSlug}/${pSlug || sSlug || "state"}`;
    }
    if (form.type === "CITY" || form.type === "AREA") {
      return `bemytraveller/destinations/${cSlug}/${sSlug || "general"}/${pSlug || "place"}`;
    }
    return `bemytraveller/destinations/${cSlug}/${pSlug || "general"}`;
  };

  const handleDirectCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);
    const targetFolder = getDestinationFolderPath(formData);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", targetFolder);

      const res = await fetch("/api/v1/cloudinary/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.secure_url) {
        setFormData((prev) => ({ ...prev, coverImage: json.secure_url }));
      } else {
        setUploadError(json.error || "Upload failed");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddAttraction = () => {
    if (!newAttraction.name.trim()) return;
    setFormData((prev) => ({
      ...prev,
      attractions: [...prev.attractions, newAttraction],
    }));
    setNewAttraction({
      name: "",
      desc: "",
      img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=600&q=80",
      category: "Sightseeing",
      entryFee: "Free",
    });
  };

  const handleRemoveAttraction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attractions: prev.attractions.filter((_, i) => i !== index),
    }));
  };

  const handleAddFaq = () => {
    if (!newFaq.q.trim() || !newFaq.a.trim()) return;
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, newFaq],
    }));
    setNewFaq({ q: "", a: "" });
  };

  const handleRemoveFaq = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const endpoint = editingDest
        ? `/api/v1/admin/destinations/${editingDest._id}`
        : "/api/v1/admin/destinations";
      const method = editingDest ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const parentState = masterStates.find((s) => s._id === formData.stateId || s.slug === formData.stateId);
        let previewUrl = "/destination/india-tour-packages";
        if (formData.type === "COUNTRY") {
          previewUrl = buildDestinationUrl({ country: formData.slug });
        } else if (formData.type === "STATE" || formData.type === "UNION_TERRITORY") {
          previewUrl = buildDestinationUrl({ country: "india", state: formData.slug });
        } else {
          previewUrl = buildDestinationUrl({
            country: "india",
            state: parentState?.slug || "himachal",
            place: formData.slug,
          });
        }

        const savedName = formData.name;
        const savedType = formData.type;
        const actionType = editingDest ? "updated" : "created";

        setAddModalOpen(false);
        setEditModalOpen(false);
        setEditingDest(null);
        setSaveSuccess({
          isOpen: true,
          name: savedName,
          type: savedType,
          url: previewUrl,
          action: actionType,
        });
        fetchDestinations();
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to save destination. Please review all fields.");
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/destinations/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDestinations();
      } else {
        alert("Failed to delete destination");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting destination");
    }
  };

  const openEdit = (dest: DestinationItem) => {
    setEditingDest(dest);
    setFormError(null);
    setActiveTab("hierarchy");
    setFormData({
      name: dest.name,
      slug: dest.slug,
      type: dest.type || "STATE",
      countryId: dest.countryId || "india",
      stateId: dest.stateId || "",
      region: dest.region || "North India",
      displayOrder: dest.displayOrder || 1,
      startingPrice: dest.startingPrice || "₹14,999",
      tagline: dest.tagline || "",
      idealDuration: dest.idealDuration || "4 to 6 Days",
      bestTimeToVisit: dest.bestTimeToVisit || "October to March",
      weather: dest.weather || "Pleasant & Mountainous",
      howToReach: dest.howToReach || "",
      shortDescription: dest.shortDescription || "",
      highlights: Array.isArray(dest.highlights) ? dest.highlights.join(", ") : (dest.highlights || ""),
      attractions: Array.isArray(dest.attractions) ? dest.attractions : [],
      faqs: Array.isArray(dest.faqs) ? dest.faqs : [],
      seo: {
        metaTitle: dest.seo?.metaTitle || `${dest.name} Tour Packages | Best Handcrafted Itineraries - Be My Traveller`,
        metaDescription: dest.seo?.metaDescription || dest.shortDescription || `Book custom ${dest.name} tour packages.`,
        keywords: dest.seo?.keywords || `${dest.name} tour packages, ${dest.name} holidays`,
      },
      coverImage: dest.coverImageStr || dest.coverImage || "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80",
      status: (dest.status === "DRAFT" ? "DRAFT" : "PUBLISHED") as "PUBLISHED" | "DRAFT",
    });
    setEditModalOpen(true);
  };

  const openAdd = () => {
    setEditingDest(null);
    setFormError(null);
    setActiveTab("hierarchy");
    setFormData({
      name: "",
      slug: "",
      type: "STATE",
      countryId: "india",
      stateId: "",
      region: "North India",
      displayOrder: destinations.length + 1,
      startingPrice: "₹14,999",
      tagline: "",
      idealDuration: "4 to 6 Days",
      bestTimeToVisit: "October to March",
      weather: "Summer: 12°C to 25°C · Winter: -5°C to 10°C",
      howToReach: "Nearest airport or railhead connected with private cabs and luxury Volvo coaches.",
      shortDescription: "",
      highlights: "",
      attractions: [],
      faqs: [
        { q: "Can we customize this itinerary?", a: "Yes, all Be My Traveller packages are 100% customizable to your exact dates, hotel category, and group size." },
        { q: "What is included in the package cost?", a: "Packages include verified hotel stays, daily breakfast and dinner, dedicated private sanitized cab, airport/station pick & drop, and toll/parking." },
      ],
      seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: "",
      },
      coverImage: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80",
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
              🗺️ Geographical &amp; Content Engine
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
              Country → State → Place Hierarchy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Destinations &amp; Places Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage multi-tier hierarchy, SEO metadata, sightseeing attractions, FAQs, and pricing with instant front-end rollup.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/content/attractions"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <span>🎡</span> Manage Attractions
          </Link>
          <button
            onClick={() => fetchDestinations()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <span>🔄</span> Refresh
          </button>
          <button
            onClick={openAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Add Destination
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
              placeholder="Search country, state, city, region..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-200"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 shrink-0 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {["ALL", "COUNTRY", "STATE", "CITY"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedType === t
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t === "ALL" ? "All Items" : t === "COUNTRY" ? "🏳️ Countries" : t === "STATE" ? "🏛️ States & UTs" : "📍 Places & Cities"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Destinations Table ── */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Loading destinations...</div>
      ) : destinations.length > 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-black uppercase text-slate-400 border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Place / Destination</th>
                  <th className="py-3.5 px-4">Hierarchy &amp; Region</th>
                  <th className="py-3.5 px-4">Starting Price</th>
                  <th className="py-3.5 px-4">Best Season</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {destinations.map((dest) => (
                  <tr key={dest._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono">#{dest.displayOrder || 0}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-700">
                          <img
                            src={dest.coverImageStr || dest.coverImage || "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=200&q=80"}
                            alt={dest.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm">{dest.name}</span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              dest.type === "COUNTRY" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                              dest.type === "STATE" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                              "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            }`}>
                              {dest.type}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono block">/{dest.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="text-slate-300 font-semibold block">
                        {dest.type === "CITY" && dest.stateName ? `${dest.stateName} · ` : ""}
                        {dest.countryName || "India"}
                      </span>
                      <span className="text-[11px] text-amber-500/80 block">📍 {dest.region || "All Regions"}</span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold font-mono text-xs">
                      {dest.startingPrice || "₹14,999"}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {dest.bestTimeToVisit || "Oct - Mar"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        dest.status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-700 text-slate-400"
                      }`}>
                        {dest.status || "PUBLISHED"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={
                            dest.type === "COUNTRY"
                              ? `/destination/${dest.slug}-tour-packages`
                              : dest.type === "STATE"
                              ? `/destination/india/${dest.slug}-tour-packages`
                              : `/destination/india/${dest.stateSlug || "himachal"}/${dest.slug}-tour-packages`
                          }
                          target="_blank"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                          title="View Live Page"
                        >
                          👁️ View
                        </Link>
                        <button
                          onClick={() => openEdit(dest)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(dest._id, dest.name)}
                          className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/30 rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <div className="text-4xl">🗺️</div>
          <h3 className="text-lg font-bold text-white">No destinations found</h3>
          <p className="text-xs text-slate-400">Add countries, states, or places to manage itineraries and SEO content.</p>
        </div>
      )}

      {/* ── Enlarged Tabbed Destination Modal (Wide Screen Max-w-5xl) ── */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl space-y-0 my-6 flex flex-col max-h-[90vh]">
            {/* Modal Top Header */}
            <div className="p-5 sm:px-7 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🗺️</span>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                    {editingDest ? `Edit Destination: ${editingDest.name}` : "Create New Destination"}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {formData.name ? formData.name : "Destination Details & Content Builder"}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer text-base"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs Bar */}
            <div className="flex items-center gap-1.5 px-6 pt-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto scrollbar-none">
              {MODAL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === tab.id
                      ? "border-amber-500 text-amber-400 bg-slate-900 shadow-xs"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
              {/* TAB 1: Hierarchy & Basic */}
              {activeTab === "hierarchy" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Type Selector */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 block">
                        Geographic Entity Level <span className="text-amber-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-medium">Select hierarchy role for routing &amp; tour aggregation</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {[
                        {
                          type: "COUNTRY",
                          icon: "🌐",
                          tag: "National Root",
                          title: "Country",
                          desc: "Top-level national entity (e.g. India, UAE, Switzerland)",
                          badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
                        },
                        {
                          type: "STATE",
                          icon: "🏛️",
                          tag: "Regional Hub",
                          title: "State / UT",
                          desc: "Indian State / Territory (e.g. Himachal, Kashmir, Kerala)",
                          badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                        },
                        {
                          type: "CITY",
                          icon: "📍",
                          tag: "Tour Target",
                          title: "City / Hill Station",
                          desc: "Tour Place (e.g. Manali, Shimla, Munnar, Jibhi)",
                          badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
                        },
                      ].map((item) => {
                        const isSelected = formData.type === item.type;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: item.type as any })}
                            className={`relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group overflow-hidden ${
                              isSelected
                                ? "bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/80"
                                : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60 hover:text-slate-200"
                            }`}
                          >
                            {/* Subtle ambient light on active */}
                            {isSelected && (
                              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
                            )}

                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl p-2 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform">
                                  {item.icon}
                                </span>
                                <div>
                                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${item.badgeBg}`}>
                                    {item.tag}
                                  </span>
                                  <h4 className="font-extrabold text-sm text-white mt-1">{item.title}</h4>
                                </div>
                              </div>

                              {/* Radio / Check indicator */}
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-amber-500 border-amber-500 text-slate-950 shadow-xs scale-105"
                                    : "border-slate-700 bg-slate-900 text-transparent"
                                }`}
                              >
                                <svg className="w-3 h-3 fill-current font-black" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 leading-relaxed group-hover:text-slate-300">
                              {item.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cascading Parents */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Parent Country</label>
                      <select
                        value={formData.countryId}
                        onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        {masterCountries.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {formData.type === "CITY" && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">
                          Parent State <span className="text-amber-500">*</span>
                        </label>
                        <select
                          value={formData.stateId}
                          onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                        >
                          <option value="">Select State</option>
                          {masterStates.map((s) => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Region / Zone</label>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        {REGION_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Name & Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Destination Name <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            name: val,
                            slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                          }));
                        }}
                        placeholder="e.g. Manali, Himachal Pradesh, Kashmir"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        URL Slug <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })}
                        placeholder="e.g. manali, himachal, kashmir"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-hidden focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Canonical URL: /destination/.../{formData.slug || "slug"}-tour-packages
                      </span>
                    </div>
                  </div>

                  {/* Display Order & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Display Order</label>
                      <input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Publish Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "PUBLISHED" | "DRAFT" })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        <option value="PUBLISHED">Published (Visible on site)</option>
                        <option value="DRAFT">Draft (Hidden)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Fast Facts & Pricing */}
              {activeTab === "facts" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Hero Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g. Snow Valleys, Solang Adventures & Rohtang Pass High-Altitude Drives"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Starting Price</label>
                      <input
                        type="text"
                        value={formData.startingPrice}
                        onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                        placeholder="e.g. ₹14,999"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Ideal Duration</label>
                      <input
                        type="text"
                        value={formData.idealDuration}
                        onChange={(e) => setFormData({ ...formData, idealDuration: e.target.value })}
                        placeholder="e.g. 4 to 6 Days, 5 to 7 Days"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Best Time to Visit</label>
                      <input
                        type="text"
                        value={formData.bestTimeToVisit}
                        onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                        placeholder="e.g. October to June (Peak Snow Dec-Feb)"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Weather &amp; Temperature</label>
                      <input
                        type="text"
                        value={formData.weather}
                        onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                        placeholder="e.g. Summer: 10°C to 25°C · Winter: -7°C to 10°C (Snowfall)"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">How to Reach</label>
                      <input
                        type="text"
                        value={formData.howToReach}
                        onChange={(e) => setFormData({ ...formData, howToReach: e.target.value })}
                        placeholder="e.g. Nearest Airport: Bhuntar (50 km). Volvo coaches connect from Delhi."
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Content & Story */}
              {activeTab === "overview" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Editorial Overview / Destination Experience Story
                    </label>
                    <textarea
                      rows={6}
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="Write a rich, immersive travel story explaining landscapes, adventures, local culture, and why travellers should book with Be My Traveller..."
                      className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 leading-relaxed focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Key Highlights (Comma Separated)</label>
                    <input
                      type="text"
                      value={formData.highlights}
                      onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                      placeholder="e.g. Solang Valley, Rohtang Pass Snow, Hadimba Temple, Old Manali Cafes"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: Attractions & Sightseeing */}
              {activeTab === "attractions" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Iconic Sightseeing Attractions</h3>
                      <p className="text-xs text-slate-400">Add key spots that appear in the Sightseeing Highlights section.</p>
                    </div>
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      {formData.attractions.length} Added
                    </span>
                  </div>

                  {/* Add New Attraction Card */}
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      + Add New Sightseeing Spot
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={newAttraction.name}
                        onChange={(e) => setNewAttraction({ ...newAttraction, name: e.target.value })}
                        placeholder="Attraction Name (e.g. Solang Valley)"
                        className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                      <input
                        type="text"
                        value={newAttraction.category}
                        onChange={(e) => setNewAttraction({ ...newAttraction, category: e.target.value })}
                        placeholder="Category (e.g. Snow & Adventure)"
                        className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                      <input
                        type="text"
                        value={newAttraction.img}
                        onChange={(e) => setNewAttraction({ ...newAttraction, img: e.target.value })}
                        placeholder="Image URL"
                        className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={newAttraction.desc}
                      onChange={(e) => setNewAttraction({ ...newAttraction, desc: e.target.value })}
                      placeholder="Attraction description and traveller highlights..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttraction}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      + Add to List
                    </button>
                  </div>

                  {/* List of Attractions */}
                  {formData.attractions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.attractions.map((att, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex gap-3 items-start justify-between">
                          <div className="flex gap-3">
                            <img src={att.img} alt={att.name} className="w-14 h-14 rounded-lg object-cover bg-slate-800 shrink-0" />
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-white text-xs">{att.name}</h4>
                              <p className="text-[11px] text-slate-400 line-clamp-2">{att.desc}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttraction(idx)}
                            className="text-red-400 hover:text-red-300 text-xs font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4">No custom attractions added yet.</p>
                  )}
                </div>
              )}

              {/* TAB 5: FAQs & Schema */}
              {activeTab === "faqs" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Traveller FAQs (with JSON-LD Schema)</h3>
                      <p className="text-xs text-slate-400">Frequently Asked Questions shown to clients and indexed by Google FAQ Schema.</p>
                    </div>
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      {formData.faqs.length} FAQs
                    </span>
                  </div>

                  {/* Add New FAQ */}
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      + Add New Question &amp; Answer
                    </span>
                    <input
                      type="text"
                      value={newFaq.q}
                      onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
                      placeholder="Question (e.g. What is the best time to see snowfall in Manali?)"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                    <textarea
                      rows={2}
                      value={newFaq.a}
                      onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
                      placeholder="Answer..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      + Add FAQ
                    </button>
                  </div>

                  {/* List of FAQs */}
                  <div className="space-y-2.5">
                    {formData.faqs.map((faq, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-amber-400">Q. {faq.q}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="text-red-400 hover:text-red-300 text-xs font-bold cursor-pointer shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: SEO & AI Search */}
              {activeTab === "seo" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Google &amp; AI Search Snippet Preview
                    </span>

                    {/* Google Live Search Card Preview */}
                    <div className="p-4 bg-white rounded-xl shadow-md text-left space-y-1 text-slate-900">
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 font-sans truncate">
                        <span>https://www.bemytraveller.com</span>
                        <span>›</span>
                        <span>destination</span>
                        <span>›</span>
                        <span className="text-slate-800">{formData.slug || "manali-tour-packages"}</span>
                      </div>
                      <h4 className="text-blue-700 font-semibold text-base hover:underline line-clamp-1">
                        {formData.seo?.metaTitle || `${formData.name || "Destination"} Tour Packages | Best Handcrafted Itineraries - Be My Traveller`}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {formData.seo?.metaDescription || formData.shortDescription || `Book custom ${formData.name || "destination"} tour packages with verified 4★/5★ hotels, private cabs, daily meals, and 24/7 on-trip concierge.`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Meta Title */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">Custom SEO Meta Title</label>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {(formData.seo?.metaTitle || "").length} / 60 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.seo?.metaTitle || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seo: { ...formData.seo, metaTitle: e.target.value },
                          })
                        }
                        placeholder="e.g. Manali Tour Packages | Best Solang & Rohtang Deals - Be My Traveller"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">SEO &amp; AI Meta Description</label>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {(formData.seo?.metaDescription || "").length} / 160 chars
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={formData.seo?.metaDescription || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seo: { ...formData.seo, metaDescription: e.target.value },
                          })
                        }
                        placeholder="Compelling meta description summarizing packages, inclusions, starting prices, and custom quotes..."
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    {/* Keywords */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Focus Keywords (Comma-separated)</label>
                      <input
                        type="text"
                        value={formData.seo?.keywords || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seo: { ...formData.seo, keywords: e.target.value },
                          })
                        }
                        placeholder="e.g. manali tour packages, manali holiday packages, solang valley tour, rohtang pass trip"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: Media & Photos */}
              {activeTab === "media" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white">Cover Banner Image (Hero Header)</label>
                      <span className="text-[10px] text-amber-500 font-mono">
                        Folder: {getDestinationFolderPath(formData)}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        placeholder="Paste image URL or upload to Cloudinary"
                        className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500"
                      />

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleDirectCoverUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                      >
                        {uploadingImage ? "Uploading..." : "☁️ Upload (Cloudinary)"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setMediaPickerOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all shrink-0 border border-slate-700 cursor-pointer"
                      >
                        🖼️ Media Gallery
                      </button>
                    </div>

                    {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}

                    {formData.coverImage && (
                      <div className="relative h-56 w-full rounded-2xl overflow-hidden border border-slate-800 mt-3">
                        <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Error Banner */}
              {formError && (
                <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <span className="text-base shrink-0">⚠️</span>
                  <span className="font-medium">{formError}</span>
                </div>
              )}

              {/* Modal Bottom Sticky Actions */}
              <div className="pt-5 border-t border-slate-800 flex items-center justify-between bg-slate-900">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    formData.status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                  }`}>
                    {formData.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAddModalOpen(false);
                      setEditModalOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      editingDest ? "Update Destination" : "Create Destination"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Save Successfully Premium Modal ── */}
      {saveSuccess && saveSuccess.isOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-emerald-500/10 text-center space-y-5 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              ✓
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Destination {saveSuccess.action === "created" ? "Created" : "Updated"} Successfully
              </span>
              <h3 className="text-xl font-black text-white pt-1">
                {saveSuccess.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                All details, fast facts, FAQs, and SEO tags are now saved and live across Be My Traveller.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href={saveSuccess.url}
                target="_blank"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
              >
                <span>View Live Page</span>
                <span>↗</span>
              </Link>
              <button
                type="button"
                onClick={() => setSaveSuccess(null)}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Done &amp; Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <MediaPickerModal
          isOpen={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(item: MediaItem) => {
            setFormData((prev) => ({ ...prev, coverImage: item.url }));
            setMediaPickerOpen(false);
          }}
          defaultFolderType="destinations"
          defaultSlug={formData.slug}
        />
      )}

      {/* Discrete RRDS Architecture Signature */}
      <footer className="pt-8 pb-4 text-center text-slate-600 text-[10px] flex items-center justify-center gap-2 select-none" data-rrds-engine="v2.5" data-watermark="RRDS">
        <span>Be My Traveller Admin CMS</span>
        <span>•</span>
        <span className="text-slate-500 font-mono">RRDS Core Engine</span>
        <span>•</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}
