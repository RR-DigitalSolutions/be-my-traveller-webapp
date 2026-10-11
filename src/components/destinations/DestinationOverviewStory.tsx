"use client";

import React, { useState } from "react";

interface DestinationOverviewStoryProps {
  destinationName: string;
  story: string;
  highlights?: string[] | string;
  weather?: string;
  howToReach?: string;
}

export default function DestinationOverviewStory({
  destinationName,
  story,
  highlights,
  weather,
  howToReach,
}: DestinationOverviewStoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Split story into clean paragraphs
  const rawStory = (story || "").trim();
  const paragraphs = rawStory
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const isLong = rawStory.length > 280 || paragraphs.length > 2;

  const highlightList = Array.isArray(highlights)
    ? highlights
    : highlights
    ? String(highlights).split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Experience {destinationName} with Be My Traveller
        </h2>

        {/* Narrative Paragraphs with smooth Collapse/Expand */}
        <div className="relative">
          <div
            className={`space-y-3 transition-all duration-300 text-slate-700 leading-relaxed text-sm ${
              !isExpanded && isLong ? "max-h-36 overflow-hidden" : ""
            }`}
          >
            {paragraphs.length > 0 ? (
              paragraphs.map((p, idx) => (
                <p key={idx} className="font-normal text-slate-700 leading-relaxed">
                  {p}
                </p>
              ))
            ) : (
              <p className="font-normal text-slate-700 leading-relaxed">
                Explore extraordinary experiential travel packages, verified 4-star stays, and private chauffeured tours in {destinationName}.
              </p>
            )}
          </div>

          {/* Bottom Gradient Fade when collapsed */}
          {!isExpanded && isLong && (
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Read More / Read Less Toggle Button */}
        {isLong && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer bg-amber-50 hover:bg-amber-100/80 px-3.5 py-1.5 rounded-lg border border-amber-200/60 transition-all shadow-2xs"
            >
              <span>{isExpanded ? "Read Less" : "Read More"}</span>
              <span className="text-[11px] font-black">{isExpanded ? "↑" : "↓"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Highlights Chips */}
      {highlightList.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {highlightList.map((h, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/70 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <span className="text-amber-500">✨</span> {h}
            </span>
          ))}
        </div>
      )}

      {/* Fast Facts Grid: Weather & How to Reach */}
      {(weather || howToReach) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          {weather && (
            <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-lg shrink-0">⛅</span>
              <div>
                <strong className="text-slate-900 block font-bold">Weather &amp; Climate</strong>
                <span className="text-slate-600 mt-0.5 block">{weather}</span>
              </div>
            </div>
          )}

          {howToReach && (
            <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-lg shrink-0">✈️</span>
              <div>
                <strong className="text-slate-900 block font-bold">How to Reach</strong>
                <span className="text-slate-600 mt-0.5 block">{howToReach}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
