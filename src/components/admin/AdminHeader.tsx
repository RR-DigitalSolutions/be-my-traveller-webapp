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

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
      {/* Left: page context breadcrumb area */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500" title="System operational" />
        <span className="text-xs text-slate-500">All systems operational</span>
      </div>

      {/* Right: user info + sign out */}
      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-200 leading-tight">
              {user.name ?? user.email}
            </p>
            <p className="text-xs text-slate-500">
              {roleLabels[user.role] ?? user.role}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700" />

        {/* Sign out */}
        <button
          id="admin-signout"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-200 transition-colors"
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
