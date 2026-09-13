"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/common/RichTextEditor";
import SeoFormFields from "@/components/common/SeoFormFields";
import MediaPickerModal, { MediaItem } from "@/components/common/MediaPickerModal";
import { createDestination, updateDestination, publishDestination, deleteDestination } from "@/domains/destinations/destination.actions";
import { slugify } from "@/lib/utils";

interface DestinationFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function DestinationForm({
  initialData,
  isEdit = false,
}: DestinationFormProps) {
  const router = useRouter();

  // Basic Info
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [type, setType] = useState(initialData?.type || "CITY");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [highlightsText, setHighlightsText] = useState(initialData?.highlights?.join(", ") || "");

  // Best Time to Visit & Weather
  const [bestTimeSummary, setBestTimeSummary] = useState(initialData?.bestTimeToVisit?.summary || "");
  const [weatherSummer, setWeatherSummer] = useState(initialData?.weather?.summer || "");
  const [weatherWinter, setWeatherWinter] = useState(initialData?.weather?.winter || "");

  // Rich Descriptions
  const [longDescription, setLongDescription] = useState<Record<string, unknown>>(
    initialData?.longDescription || { type: "doc", content: [] }
  );
  const [howToReach, setHowToReach] = useState<Record<string, unknown>>(
    initialData?.howToReach || { type: "doc", content: [] }
  );
  const [culture, setCulture] = useState<Record<string, unknown>>(
    initialData?.culture || { type: "doc", content: [] }
  );

  // Media
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    initialData?.coverImage?.publicUrl || initialData?.coverImageUrl || ""
  );
  const [coverImageId, setCoverImageId] = useState<string>(
    initialData?.coverImage?._id || initialData?.coverImage || ""
  );
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getComputedFolder = () => {
    const clean = (s?: string) => (s || "").toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const cleanSlug = clean(slug || name);
    if (type === "COUNTRY") return `bemytraveller/destinations/${cleanSlug || "india"}`;
    if (type === "STATE" || type === "ISLAND") return `bemytraveller/destinations/india/${cleanSlug || "state"}`;
    return `bemytraveller/destinations/india/${initialData?.stateSlug || "general"}/${cleanSlug || "place"}`;
  };

  const handleDirectCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);
    const targetFolder = getComputedFolder();

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folderType", "destinations");
      data.append("customFolder", targetFolder);
      data.append("title", `${name || "Destination"} Cover Image`);

      const res = await fetch("/api/v1/cloudinary/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to upload image to Cloudinary.");
      }

      const resData = await res.json();
      if (resData?.media?.url) {
        setCoverImageUrl(resData.media.url);
        if (resData.media._id) {
          setCoverImageId(resData.media._id);
        }
      }
    } catch (err: any) {
      console.error("Direct upload error:", err);
      setUploadError(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  // SEO & AEO FAQs
  const [seo, setSeo] = useState<any>(initialData?.seo || {});
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(
    initialData?.faqs || [
      {
        question: "What is the best time to visit?",
        answer: "The ideal months are from October to June with pleasant daytime temperatures and clear skies.",
      },
    ]
  );

  // Status & Display
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder || 0);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && (!slug || slug === slugify(name))) {
      setSlug(slugify(val));
    }
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const removeFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const updateFaq = (idx: number, field: "question" | "answer", val: string) => {
    const next = [...faqs];
    next[idx][field] = val;
    setFaqs(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const highlights = highlightsText
      .split(",")
      .map((h: string) => h.trim())
      .filter(Boolean);

    const payload = {
      name,
      slug: slugify(slug || name),
      type,
      tagline,
      shortDescription,
      highlights,
      bestTimeToVisit: {
        summary: bestTimeSummary,
        months: [],
      },
      weather: {
        summer: weatherSummer,
        winter: weatherWinter,
      },
      longDescription,
      howToReach,
      culture,
      coverImage: coverImageId || undefined,
      seo,
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      status,
      isFeatured,
      sortOrder: Number(sortOrder),
    };

    try {
      if (isEdit && initialData?._id) {
        await updateDestination(initialData._id, payload);
      } else {
        await createDestination(payload);
      }
      router.push("/admin/content/destinations");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!isEdit || !initialData?._id) return;
    setIsSubmitting(true);
    try {
      await publishDestination(initialData._id);
      setStatus("PUBLISHED");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to publish destination.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !initialData?._id) return;
    if (!window.confirm("Are you sure you want to permanently delete this destination?")) return;
    setIsSubmitting(true);
    try {
      await deleteDestination(initialData._id);
      router.push("/admin/content/destinations");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete destination.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-red-400 font-bold">✕</button>
        </div>
      )}

      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-16 z-30 bg-slate-950/90 backdrop-blur-md py-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">
            {isEdit ? `Edit Destination: ${initialData?.name}` : "Create New Destination"}
          </h2>
          <span className="text-xs text-slate-400">
            {status === "PUBLISHED" ? "🟢 Published Live" : "⚪ Draft Mode"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isEdit && status !== "PUBLISHED" && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Publish Live
            </button>
          )}

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold transition-colors"
            >
              Delete
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            {isSubmitting ? "Saving..." : isEdit ? "Update Destination" : "Create Destination"}
          </button>
        </div>
      </div>

      {/* ── Section 1: Basic Information ── */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-5">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          1. Geographic Identity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Destination Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Manali"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="e.g. manali"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-amber-400 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hierarchy Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="COUNTRY">Country (e.g. India)</option>
              <option value="STATE">State / Province (e.g. Himachal Pradesh)</option>
              <option value="CITY">City / Region (e.g. Manali)</option>
              <option value="AREA">Area / Valley (e.g. Solang Valley)</option>
              <option value="ISLAND">Island (e.g. Havelock Island)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tagline / Catchphrase
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Valley of Gods & Himalayan Adventure Capital"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Short Description (Listing snippet) *
            </label>
            <textarea
              rows={2}
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A concise 2-sentence summary used on package cards, search listings, and social shares..."
              className="w-full px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Highlights & Experiences (Comma-separated)
            </label>
            <input
              type="text"
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              placeholder="Solang Valley ATV, Rohtang Pass Snow, Old Manali Cafes, Hadimba Temple"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Media & Cover Asset ── */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div>
            <h3 className="text-base font-bold text-white">2. Visual Media &amp; Cover Image</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cloudinary auto-optimizes format (WebP/AVIF), resolution, and compression.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
            <span>📁</span>
            <span>{getComputedFolder()}</span>
          </span>
        </div>

        {/* Upload & Gallery Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleDirectCoverUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all disabled:opacity-50"
          >
            {uploadingImage ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-slate-950" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Uploading to Cloudinary...</span>
              </>
            ) : (
              <>
                <span>☁️</span>
                <span>Upload from Device (Cloudinary)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700 shadow-sm transition-all"
          >
            <span>🖼️</span>
            <span>Choose from Media Gallery</span>
          </button>
        </div>

        {uploadError && (
          <p className="text-xs text-red-400 font-medium">⚠️ {uploadError}</p>
        )}

        {/* Direct Image URL input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Or Enter Direct Image Link:
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/... or CDN link"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
          />
        </div>

        {coverImageUrl ? (
          <div className="relative rounded-2xl overflow-hidden aspect-[21/9] border border-slate-800 max-h-64">
            <img src={coverImageUrl} alt="Destination Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-4 flex items-end justify-between">
              <span className="text-xs font-semibold text-white">Cover Asset Registered</span>
              <button
                type="button"
                onClick={() => {
                  setCoverImageUrl("");
                  setCoverImageId("");
                }}
                className="px-2.5 py-1 rounded bg-red-500/80 text-white text-[11px] font-bold hover:bg-red-500 cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-500/50 hover:bg-slate-950/40 transition-all"
          >
            <p className="text-xs text-slate-400">Click to upload or browse media library for cover visual.</p>
          </div>
        )}
      </div>

      {/* ── Section 3: Rich Content & Editorial Descriptions ── */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          3. Rich Editorial Content
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Detailed Overview & Story
          </label>
          <RichTextEditor
            value={longDescription}
            onChange={setLongDescription}
            placeholder="Write the comprehensive destination story, history, and geographical allure..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            How to Reach (Air, Train, Road Connectivity)
          </label>
          <RichTextEditor
            value={howToReach}
            onChange={setHowToReach}
            placeholder="Detailed transit routes: Nearest airport, railway hub, and road distances..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Local Culture, Cuisine & Safety
          </label>
          <RichTextEditor
            value={culture}
            onChange={setCulture}
            placeholder="Himachali Dham, local customs, winter precautions, high-altitude advice..."
          />
        </div>
      </div>

      {/* ── Section 4: AEO Q&A / Answer Engine Optimization ── */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">4. AEO Structured Q&A (AI Search Ready)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Concise, factual questions & direct answers for AI Answer Engines</p>
          </div>
          <button
            type="button"
            onClick={addFaq}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            + Add Q&A
          </button>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400">Question #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFaq(idx)}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>

              <input
                type="text"
                value={faq.question}
                onChange={(e) => updateFaq(idx, "question", e.target.value)}
                placeholder="e.g. How many days are enough for Manali?"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <textarea
                rows={2}
                value={faq.answer}
                onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                placeholder="Direct concise answer: 4 to 5 days are sufficient to cover Solang Valley, Rohtang Pass, and local sightseeing."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 5: SEO Subdocument ── */}
      <SeoFormFields
        value={seo}
        onChange={setSeo}
        entityName={name || "Destination"}
        defaultSlug={`destinations/${slug || "slug"}`}
      />

      {/* Media Picker Dialog */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        customFolder={getComputedFolder()}
        defaultFolderType="destinations"
        defaultCategory="domestic"
        defaultSlug={slug || name || "general"}
        onSelect={(media: MediaItem) => {
          setCoverImageUrl(media.optimizedUrl || media.publicUrl || media.url || "");
          setCoverImageId(media._id);
        }}
        title={`Select Destination Cover for ${name || "Destination"}`}
      />
    </form>
  );
}
