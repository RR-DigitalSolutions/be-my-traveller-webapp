"use client";

import { signOut } from "next-auth/react";
import type { RoleKey } from "@/lib/auth/permissions";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: RoleKey;
    avatar?: string;
  };
  onMenuToggle?: () => void;
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  PRODUCT_MANAGER: "Product Manager",
  CONTENT_MANAGER: "Content Manager",
  SEO_MANAGER: "SEO Manager",
  SALES_MANAGER: "Sales Manager",
  SALES_AGENT: "Sales Agent",
  OPERATIONS: "Operations",
  FINANCE: "Finance",
  EDITOR: "Editor",
};

export default function AdminHeader({ user, onMenuToggle }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
      {/* Left: Mobile hamburger button & System status */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle button */}
        <button
          onClick={onMenuToggle}
          type="button"
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer active:scale-95"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System operational" />
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">All systems operational</span>
          <span className="text-xs font-bold text-slate-300 sm:hidden">Admin Panel</span>
        </div>
      </div>

      {/* Right: user info + sign out */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User info */}
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-200 leading-tight">
              {user.name ?? user.email}
            </p>
            <p className="text-[11px] text-slate-400">
              {roleLabels[user.role] ?? user.role}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-800" />

        {/* Sign out */}
        <button
          id="admin-signout"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Sign out"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
