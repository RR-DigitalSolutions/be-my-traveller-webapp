"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AdminPageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetRoute, setTargetRoute] = useState("");
  const [, startTransition] = useTransition();

  // Reset navigation status whenever pathname or search params settle
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Intercept navigation link clicks globally inside the admin dashboard
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Only handle internal admin page navigations
      if (
        href.startsWith("/admin") &&
        !href.startsWith("#") &&
        !anchor.target &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        // If clicking current route, no need to trigger full loading
        const currentFullUrl = window.location.pathname + window.location.search;
        if (href === currentFullUrl || href === window.location.pathname) {
          return;
        }

        // Trigger live loading feeling immediately on click
        setTargetRoute(href.replace("/admin/", "").replace(/-/g, " ").toUpperCase());
        startTransition(() => {
          setIsNavigating(true);
        });
      }
    };

    // Listen for custom trigger events if programmatic navigation occurs
    const handleNavigationStart = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.target) {
        setTargetRoute(String(customEvent.detail.target));
      }
      setIsNavigating(true);
    };

    const handleNavigationEnd = () => {
      setIsNavigating(false);
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    window.addEventListener("admin_navigation_start", handleNavigationStart);
    window.addEventListener("admin_navigation_end", handleNavigationEnd);

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      window.removeEventListener("admin_navigation_start", handleNavigationStart);
      window.removeEventListener("admin_navigation_end", handleNavigationEnd);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <>
      {/* Top Laser Progress Bar with Amber Glow */}
      <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
        <div className="h-[2.5px] w-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse" />
      </div>

      {/* Floating Dynamic Small UI Pill with Watermark */}
      <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-amber-500/40 shadow-2xl shadow-black/80 backdrop-blur-xl ring-1 ring-amber-500/20 text-slate-100">
          {/* Animated Turbine / Radar */}
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
            <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold tracking-wider uppercase font-mono bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                RRDS V8 Travel Engine Loading
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
              <span className="text-amber-400/90 font-semibold">⚡ Switch:</span>
              <span className="truncate max-w-[130px] text-slate-300 font-medium">
                {targetRoute ? targetRoute : "Route"}
              </span>
            </div>
          </div>

          {/* Micro Spinner */}
          <svg
            className="w-4 h-4 text-amber-400 animate-spin shrink-0 ml-0.5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25 text-slate-700"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
