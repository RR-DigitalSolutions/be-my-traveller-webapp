import React from "react";

export default function AdminLoading() {
  return (
    <div className="relative min-h-[70vh] flex flex-col justify-center items-center p-6 select-none overflow-hidden animate-in fade-in duration-300">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Floating Dynamic UI Widget with Watermark */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Radar Spinner & Logo Container */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Outer glowing radar pulse ring */}
          <div className="absolute w-20 h-20 rounded-2xl bg-amber-500/20 animate-ping opacity-60" />
          <div className="absolute w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 blur-md opacity-40 animate-pulse" />

          {/* Central Engine Core Icon */}
          <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-xl shadow-amber-500/20 flex items-center justify-center backdrop-blur-xl">
            <svg
              className="w-7 h-7 text-amber-400 animate-spin"
              style={{ animationDuration: "2.5s" }}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-20 text-slate-700"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <div className="absolute w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-300" />
          </div>
        </div>

        {/* Premium Watermark & Live Loading Title */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 shadow-lg shadow-black/50 backdrop-blur-md mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text text-transparent font-mono">
            RRDS V8 Travel Engine Loading
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold font-mono">
            LIVE
          </span>
        </div>

        {/* Sub-status & Neon Shimmer Bar */}
        <p className="text-[11px] text-slate-400 tracking-wide font-medium mt-1 mb-4 flex items-center gap-1.5">
          <span>Synthesizing module state & data streams</span>
          <span className="inline-flex gap-0.5">
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
          </span>
        </p>

        {/* Dynamic Progress Bar */}
        <div className="w-56 sm:w-64 h-1.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full animate-[progress_1.2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
        </div>
      </div>

      {/* Decorative Skeleton Preview in Background */}
      <div className="w-full max-w-4xl mt-10 opacity-20 pointer-events-none space-y-4">
        <div className="h-8 bg-slate-800/60 rounded-xl w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-800/40 rounded-xl animate-pulse" />
          <div className="h-24 bg-slate-800/40 rounded-xl animate-pulse" />
          <div className="h-24 bg-slate-800/40 rounded-xl animate-pulse" />
        </div>
        <div className="h-44 bg-slate-800/30 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
