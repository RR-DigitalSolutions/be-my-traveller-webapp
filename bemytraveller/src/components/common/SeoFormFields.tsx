"use client";

import React from "react";
import type { ISeoMetadata } from "@/lib/db/sub-schemas";

interface SeoFormFieldsProps {
  value: ISeoMetadata;
  onChange: (seo: ISeoMetadata) => void;
  entityName?: string;
  defaultSlug?: string;
}

export default function SeoFormFields({
  value,
  onChange,
  entityName = "Destination",
  defaultSlug = "",
}: SeoFormFieldsProps) {
  const update = (field: keyof ISeoMetadata, val: unknown) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const titleLength = value.title?.length || 0;
  const descLength = value.metaDescription?.length || 0;

  return (
    <div className="space-y-6 rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">SEO & Search Engine Configuration</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Optimize how this {entityName.toLowerCase()} appears on Google, Bing, and AI search engines.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          SEO-First
        </span>
      </div>

      {/* Live Google Search Preview */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
          Search Snippet Preview
        </span>
        <p className="text-xs text-emerald-400 truncate">
          https://bemytraveller.com/{defaultSlug ? defaultSlug : "preview-url"}
        </p>
        <p className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer truncate">
          {value.title || `${entityName} | Be My Traveller`}
        </p>
        <p className="text-xs text-slate-400 line-clamp-2">
          {value.metaDescription ||
            "Discover comprehensive travel guides, curated stays, top attractions, and custom itineraries for your next journey."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* SEO Title */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              SEO Title Tag
            </label>
            <span
              className={`text-[11px] font-mono ${
                titleLength > 60
                  ? "text-red-400 font-bold"
                  : titleLength > 45
                  ? "text-amber-400"
                  : "text-slate-500"
              }`}
            >
              {titleLength} / 70 chars
            </span>
          </div>
          <input
            type="text"
            value={value.title || ""}
            onChange={(e) => update("title", e.target.value)}
            placeholder={`${entityName} Travel Guide & Tour Packages | Be My Traveller`}
            className="w-full px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Meta Description */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Meta Description
            </label>
            <span
              className={`text-[11px] font-mono ${
                descLength > 155
                  ? "text-red-400 font-bold"
                  : descLength > 120
                  ? "text-amber-400"
                  : "text-slate-500"
              }`}
            >
              {descLength} / 160 chars
            </span>
          </div>
          <textarea
            rows={3}
            value={value.metaDescription || ""}
            onChange={(e) => update("metaDescription", e.target.value)}
            placeholder="Compelling, factual description highlighting top experiences, best season, and packages..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
        </div>

        {/* Primary Keyword */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Primary Target Keyword
          </label>
          <input
            type="text"
            value={value.primaryKeyword || ""}
            onChange={(e) => update("primaryKeyword", e.target.value)}
            placeholder="e.g. manali tour packages"
            className="w-full px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Canonical URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Canonical URL Override (Optional)
          </label>
          <input
            type="url"
            value={value.canonicalUrl || ""}
            onChange={(e) => update("canonicalUrl", e.target.value)}
            placeholder="https://bemytraveller.com/..."
            className="w-full px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Search Intent */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Search Intent
          </label>
          <select
            value={value.searchIntent || "INFORMATIONAL"}
            onChange={(e) =>
              update("searchIntent", e.target.value as "INFORMATIONAL" | "NAVIGATIONAL" | "TRANSACTIONAL")
            }
            className="w-full px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="INFORMATIONAL">Informational (Guide, Facts)</option>
            <option value="TRANSACTIONAL">Transactional (Packages, Bookings)</option>
            <option value="NAVIGATIONAL">Navigational (Brand, Portal)</option>
          </select>
        </div>

        {/* Robots Index */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Robots Meta
          </label>
          <select
            value={value.robots || "index, follow"}
            onChange={(e) => update("robots", e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="index, follow">index, follow (Default Recommended)</option>
            <option value="noindex, follow">noindex, follow</option>
            <option value="noindex, nofollow">noindex, nofollow</option>
          </select>
        </div>
      </div>
    </div>
  );
}
