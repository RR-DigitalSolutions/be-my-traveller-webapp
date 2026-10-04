"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

interface SeoContentEditorProps {
  value: string;
  onChange: (html: string) => void;
  title?: string;
  onTitleChange?: (title: string) => void;
  subtitle?: string;
  onSubtitleChange?: (subtitle: string) => void;
  aiSummary?: string;
  onAiSummaryChange?: (summary: string) => void;
  keywords?: string[];
  onKeywordsChange?: (keywords: string[]) => void;
}

interface DbSlugItem {
  title: string;
  slug: string;
  type: "destination" | "package" | "page";
}

const COMMON_PAGE_SLUGS: DbSlugItem[] = [
  { title: "All Holiday Packages", slug: "/packages", type: "page" },
  { title: "Cabs & Transportation", slug: "/cabs", type: "page" },
  { title: "Hotels & Stays", slug: "/hotels", type: "page" },
  { title: "Custom Itinerary Planner", slug: "/#custom-planner", type: "page" },
  { title: "Contact Us & Concierge", slug: "/contact", type: "page" },
];

export default function SeoContentEditor({
  value,
  onChange,
  title = "",
  onTitleChange,
  subtitle = "",
  onSubtitleChange,
  aiSummary = "",
  onAiSummaryChange,
  keywords = [],
  onKeywordsChange,
}: SeoContentEditorProps) {
  const [editorMode, setEditorMode] = useState<"visual" | "html" | "preview">("visual");
  const [htmlSource, setHtmlSource] = useState(value);

  // Slug Link Modal States
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [selectedSlug, setSelectedSlug] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [activeSlugTab, setActiveSlugTab] = useState<"destinations" | "packages" | "pages" | "custom">("destinations");

  // Dynamic slugs from database
  const [dbDestinations, setDbDestinations] = useState<DbSlugItem[]>([]);
  const [dbPackages, setDbPackages] = useState<DbSlugItem[]>([]);
  const [loadingSlugs, setLoadingSlugs] = useState(false);

  // New Keyword input state
  const [newKeyword, setNewKeyword] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "seo-link text-amber-600 font-semibold underline hover:text-amber-700",
        },
      }),
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlSource(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none p-5 focus:outline-none text-slate-800 text-sm leading-relaxed min-h-[300px]",
      },
    },
  });

  useEffect(() => {
    if (editor && value && !editor.isFocused) {
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value);
        setHtmlSource(value);
      }
    }
  }, [value, editor]);

  // Load real destinations and packages for slug linking
  useEffect(() => {
    const loadCatalogSlugs = async () => {
      setLoadingSlugs(true);
      try {
        // Destinations
        const destRes = await fetch("/api/v1/admin/destinations");
        const destData = await destRes.json();
        const dList = Array.isArray(destData.destinations) ? destData.destinations : Array.isArray(destData) ? destData : [];
        if (dList.length > 0) {
          setDbDestinations(
            dList.map((d: any) => ({
              title: d.name,
              slug: d.type === "INTERNATIONAL"
                ? `/destination/${d.slug}-tour-packages`
                : `/destination/india/${d.slug}-tour-packages`,
              type: "destination",
            }))
          );
        }

        // Packages
        const pkgRes = await fetch("/api/v1/admin/packages?status=ACTIVE");
        const pkgData = await pkgRes.json();
        if (pkgData.success && Array.isArray(pkgData.packages)) {
          setDbPackages(
            pkgData.packages.map((p: any) => ({
              title: p.name,
              slug: `/packages/${p.slug}`,
              type: "package",
            }))
          );
        }
      } catch {
        // Fallback default slugs
      } finally {
        setLoadingSlugs(false);
      }
    };
    loadCatalogSlugs();
  }, []);

  // Open Link Modal with selected text
  const openLinkModal = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to, " ");
    setLinkText(selected || "");
    const previousUrl = editor.getAttributes("link").href || "";
    setSelectedSlug(previousUrl);
    setCustomSlug(previousUrl.startsWith("http") || previousUrl.startsWith("/") ? previousUrl : "");
    setLinkTitle(selected ? `${selected} - Be My Traveller` : "");
    setIsSlugModalOpen(true);
  };

  // Insert or apply link
  const applySlugLink = () => {
    if (!editor) return;
    const finalUrl = activeSlugTab === "custom" ? customSlug.trim() : selectedSlug.trim();
    if (!finalUrl) {
      alert("Please select or enter a valid URL or slug.");
      return;
    }

    if (linkText && editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${finalUrl}" class="seo-link"${openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""}${
            linkTitle ? ` title="${linkTitle}"` : ""
          }>${linkText}</a>`
        )
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href: finalUrl,
          target: openInNewTab ? "_blank" : undefined,
          class: "seo-link text-amber-600 font-semibold underline hover:text-amber-700",
        })
        .run();
    }

    setIsSlugModalOpen(false);
  };

  const handleHtmlSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtmlSource(newHtml);
    onChange(newHtml);
    if (editor) {
      editor.commands.setContent(newHtml);
    }
  };

  const handleAddKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (newKeyword.trim() && onKeywordsChange) {
      if (!keywords.includes(newKeyword.trim())) {
        onKeywordsChange([...keywords, newKeyword.trim()]);
      }
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    if (onKeywordsChange) {
      onKeywordsChange(keywords.filter((k) => k !== kwToRemove));
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Metadata & AI Fields (Card Title, Subtitle, AI Snippet) ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
              AEO &amp; SEO Engine Optimizations
            </span>
            <h3 className="text-sm font-black text-slate-900 mt-0.5">
              Homepage Content Card &amp; Entity Configuration
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            ⚡ AI Rich Rich Snippets Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Main Card Heading (H1/H2 for Rich SEO) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange?.(e.target.value)}
              placeholder="e.g. Be My Traveller – Bespoke Holiday Packages & Curated Travel Experiences"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[10.5px] text-slate-400 mt-1">
              Matches the title seen in the search results and card header.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Subtitle / Supporting Catchphrase (Optional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => onSubtitleChange?.(e.target.value)}
              placeholder="e.g. Discover India & International Destinations with Customized Itineraries"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[10.5px] text-slate-400 mt-1">
              Sub-heading for brand resonance and keyword reinforcement.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>🤖 AI / AEO Summary (Answer Engine Optimization for Google AI &amp; Perplexity)</span>
              <span className="text-[10.5px] font-normal text-slate-400">
                Optimized for Search Generative Experience
              </span>
            </label>
            <textarea
              rows={2}
              value={aiSummary}
              onChange={(e) => onAiSummaryChange?.(e.target.value)}
              placeholder="Brief 2-3 sentence authoritative summary explaining what Be My Traveller does, years in business, destinations served, and why travellers choose it."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs leading-relaxed"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">
              Target SEO Keywords &amp; Entity Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
              {keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-slate-400 hover:text-red-500 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="Type keyword and press Enter..."
                  className="bg-transparent text-xs text-slate-900 focus:outline-none flex-1 px-2"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md text-[11px] font-bold"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Rich Content Editor Container ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Editor View Tabs */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditorMode("visual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                editorMode === "visual"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ✏️ Rich Visual Editor
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("html")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                editorMode === "html"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              &lt;/&gt; HTML Source Code
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                editorMode === "preview"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              👁️ Homepage Live Preview
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Use headings (H2, H3) &amp; slug linking for maximum Google ranking
          </span>
        </div>

        {/* ── Toolbar (Only in Visual Mode) ── */}
        {editorMode === "visual" && editor && (
          <div className="flex flex-wrap items-center gap-1 p-2.5 border-b border-slate-200 bg-white text-xs">
            {/* Paragraph / Heading Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  editor.isActive("paragraph")
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Normal Paragraph"
              >
                Paragraph (P)
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  editor.isActive("heading", { level: 2 })
                    ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Heading 2 (H2 - Major Sections)"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  editor.isActive("heading", { level: 3 })
                    ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Heading 3 (H3 - Sub Sections)"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  editor.isActive("heading", { level: 4 })
                    ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Heading 4 (H4 - Minor Titles)"
              >
                H4
              </button>
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Formatting: Bold, Italic, Strike */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs transition-colors ${
                editor.isActive("bold") ? "bg-amber-500 text-slate-950" : "hover:bg-slate-100 text-slate-700"
              }`}
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`w-7 h-7 rounded flex items-center justify-center font-serif italic text-xs transition-colors ${
                editor.isActive("italic") ? "bg-amber-500 text-slate-950" : "hover:bg-slate-100 text-slate-700"
              }`}
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`w-7 h-7 rounded flex items-center justify-center line-through text-xs transition-colors ${
                editor.isActive("strike") ? "bg-amber-500 text-slate-950" : "hover:bg-slate-100 text-slate-700"
              }`}
              title="Strikethrough"
            >
              S
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Lists & Quotes */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                editor.isActive("bulletList") ? "bg-amber-500 text-slate-950 font-bold" : "hover:bg-slate-100 text-slate-700"
              }`}
              title="Bullet List"
            >
              • Bullet
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                editor.isActive("orderedList") ? "bg-amber-500 text-slate-950 font-bold" : "hover:bg-slate-100 text-slate-700"
              }`}
              title="Numbered List"
            >
              1. Numbered
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                editor.isActive("blockquote") ? "bg-amber-500 text-slate-950 font-bold" : "hover:bg-slate-100 text-slate-700"
              }`}
              title="Quote"
            >
              “ Quote
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* ── Rich Slug Linking Tool (Special User Requirement) ── */}
            <button
              type="button"
              onClick={openLinkModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              title="Link text with destination, package or page slug for rich SEO"
            >
              <span>🔗</span>
              <span>Link with Slug</span>
            </button>

            {editor.isActive("link") && (
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetLink().run()}
                className="px-2 py-1 rounded hover:bg-red-50 text-red-600 text-xs font-semibold"
                title="Remove Link"
              >
                ✕ Unlink
              </button>
            )}

            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="px-2 py-1 rounded hover:bg-slate-100 text-slate-700 text-xs"
              title="Insert Divider"
            >
              ― Line
            </button>
          </div>
        )}

        {/* ── Mode 1: Visual TipTap Canvas ── */}
        {editorMode === "visual" && (
          <div className="bg-white min-h-[340px]">
            <EditorContent editor={editor} />
          </div>
        )}

        {/* ── Mode 2: HTML Source Code ── */}
        {editorMode === "html" && (
          <div className="p-4 bg-slate-900 text-slate-100">
            <textarea
              rows={16}
              value={htmlSource}
              onChange={handleHtmlSourceChange}
              className="w-full bg-transparent font-mono text-xs text-amber-300 focus:outline-none leading-relaxed resize-y"
              placeholder="<p>Enter HTML directly here...</p>"
            />
          </div>
        )}

        {/* ── Mode 3: Live Homepage Card Preview ── */}
        {editorMode === "preview" && (
          <div className="p-6 bg-slate-100">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {title || "Be My Traveller – Bespoke Holiday Packages & Curated Travel Experiences Across India & Worldwide"}
              </h2>
              {subtitle && <p className="text-xs font-semibold text-amber-700">{subtitle}</p>}
              <div
                className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3"
                dangerouslySetInnerHTML={{ __html: htmlSource || value }}
              />
              <div className="pt-2 text-rose-600 font-bold text-xs">
                Read more...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SLUG & INTERNAL LINK MODAL FOR RICH SEO
      ══════════════════════════════════════════════════════════════ */}
      {isSlugModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                  Rich SEO Internal Linking
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  Link Text with Destination or Package Slug
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSlugModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Anchor Text */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-700">Anchor Text to Display *</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Himachal Pradesh Tour Packages"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Slug Category Switcher */}
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 text-xs font-bold">
              {[
                { key: "destinations", label: `Destinations (${dbDestinations.length})`, icon: "📍" },
                { key: "packages", label: `Packages (${dbPackages.length})`, icon: "🏖️" },
                { key: "pages", label: "Site Pages", icon: "📄" },
                { key: "custom", label: "Custom Slug / URL", icon: "✏️" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveSlugTab(tab.key as typeof activeSlugTab)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    activeSlugTab === tab.key
                      ? "bg-amber-500 text-slate-950 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{tab.icon}</span> <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab 1: Database Destinations */}
            {activeSlugTab === "destinations" && (
              <div className="space-y-2 text-xs">
                <p className="text-[11px] text-slate-500">
                  Select a destination to link directly to its canonical holiday package page:
                </p>
                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50">
                  {dbDestinations.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">
                      {loadingSlugs ? "Loading destination catalog..." : "No destinations found."}
                    </div>
                  ) : (
                    dbDestinations.map((d) => (
                      <div
                        key={d.slug}
                        onClick={() => {
                          setSelectedSlug(d.slug);
                          if (!linkText) setLinkText(d.title);
                          if (!linkTitle) setLinkTitle(`${d.title} Tour Packages - Be My Traveller`);
                        }}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          selectedSlug === d.slug ? "bg-amber-100/80 font-bold" : "hover:bg-white"
                        }`}
                      >
                        <span className="font-semibold text-slate-900">{d.title}</span>
                        <span className="font-mono text-[10px] text-amber-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {d.slug}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Database Packages */}
            {activeSlugTab === "packages" && (
              <div className="space-y-2 text-xs">
                <p className="text-[11px] text-slate-500">
                  Select an active package to link directly to its itinerary details:
                </p>
                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50">
                  {dbPackages.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">
                      {loadingSlugs ? "Loading package catalog..." : "No packages found."}
                    </div>
                  ) : (
                    dbPackages.map((p) => (
                      <div
                        key={p.slug}
                        onClick={() => {
                          setSelectedSlug(p.slug);
                          if (!linkText) setLinkText(p.title);
                          if (!linkTitle) setLinkTitle(`${p.title} - Book with Be My Traveller`);
                        }}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          selectedSlug === p.slug ? "bg-amber-100/80 font-bold" : "hover:bg-white"
                        }`}
                      >
                        <span className="font-semibold text-slate-900 truncate max-w-[280px]">
                          {p.title}
                        </span>
                        <span className="font-mono text-[10px] text-amber-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {p.slug}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Site Pages */}
            {activeSlugTab === "pages" && (
              <div className="space-y-2 text-xs">
                <p className="text-[11px] text-slate-500">Select standard site portal sections:</p>
                <div className="space-y-1.5">
                  {COMMON_PAGE_SLUGS.map((pg) => (
                    <div
                      key={pg.slug}
                      onClick={() => {
                        setSelectedSlug(pg.slug);
                        if (!linkText) setLinkText(pg.title);
                        if (!linkTitle) setLinkTitle(`${pg.title} - Be My Traveller`);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedSlug === pg.slug
                          ? "border-amber-400 bg-amber-50"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      }`}
                    >
                      <span className="font-bold text-slate-800">{pg.title}</span>
                      <span className="font-mono text-[11px] text-slate-500">{pg.slug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Custom Slug */}
            {activeSlugTab === "custom" && (
              <div className="space-y-2 text-xs">
                <label className="block font-bold text-slate-700">Enter Custom Path / Slug or Full URL</label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="e.g. /destination/india/ladakh-tour-packages or https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10.5px] text-slate-400">
                  Always use relative path (e.g. <code className="text-amber-700">/packages</code>) for internal SEO ranking.
                </p>
              </div>
            )}

            {/* Selected Link Preview & Target settings */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">Target Slug:</span>
                <span className="font-mono font-bold text-amber-700">
                  {activeSlugTab === "custom" ? customSlug || "(None)" : selectedSlug || "(None)"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={openInNewTab}
                    onChange={(e) => setOpenInNewTab(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Open link in new window / tab</span>
                </label>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  dofollow SEO Link
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSlugModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applySlugLink}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Insert SEO Link →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
