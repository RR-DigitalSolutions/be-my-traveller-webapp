"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { RoleKey, PermissionKey, DepartmentKey } from "@/lib/auth/permissions";
import { hasSectionAccess, Role } from "@/lib/auth/permissions";

interface NavItem {
  label: string;
  href: string;
  section: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
  roles?: RoleKey[]; // optional role filter override
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    section: "dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    label: "Content",
    href: "/admin/content",
    section: "content",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    children: [
      { label: "Destinations", href: "/admin/content/destinations" },
      { label: "Attractions", href: "/admin/content/attractions" },
      { label: "Activities", href: "/admin/content/activities" },
      { label: "Blogs", href: "/admin/content/blogs" },
      { label: "FAQs", href: "/admin/content/faqs" },
      { label: "Reviews", href: "/admin/content/reviews" },
      { label: "Pages", href: "/admin/content/pages" },
    ],
  },
  {
    label: "Packages",
    href: "/admin/packages",
    section: "packages",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    children: [
      { label: "All Packages", href: "/admin/packages" },
      { label: "New Package", href: "/admin/packages/new" },
      { label: "Hotels", href: "/admin/products/hotels" },
      { label: "Activities", href: "/admin/products/activities" },
      { label: "Transfers", href: "/admin/products/transfers" },
    ],
  },
  {
    label: "Pricing",
    href: "/admin/pricing",
    section: "pricing",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    children: [
      { label: "Pricing Rules", href: "/admin/pricing/rules" },
      { label: "Seasons", href: "/admin/pricing/seasons" },
      { label: "Discounts", href: "/admin/pricing/discounts" },
      { label: "Coupons", href: "/admin/pricing/coupons" },
      { label: "Tax Rules", href: "/admin/pricing/taxes" },
      { label: "Simulator", href: "/admin/pricing/simulator" },
    ],
  },
  {
    label: "Sales & CRM",
    href: "/admin/leads",
    section: "sales",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { label: "Leads", href: "/admin/leads" },
      { label: "Quotes", href: "/admin/quotes" },
      { label: "Customers", href: "/admin/customers" },
      { label: "Bookings", href: "/admin/bookings" },
    ],
  },
  {
    label: "Media",
    href: "/admin/media",
    section: "media",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "SEO",
    href: "/admin/seo",
    section: "seo",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    children: [
      { label: "Metadata", href: "/admin/seo/metadata" },
      { label: "Redirects", href: "/admin/seo/redirects" },
      { label: "Sitemap", href: "/admin/seo/sitemap" },
    ],
  },
  {
    label: "Suppliers",
    href: "/admin/suppliers",
    section: "suppliers",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    section: "analytics",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Staff & RBAC",
    href: "/admin/users",
    section: "users",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/admin/settings",
    section: "settings",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    roles: [Role.SUPER_ADMIN],
  },
];

interface AdminSidebarProps {
  userRole: RoleKey;
  permissions?: (PermissionKey | string)[];
  department?: DepartmentKey;
}

export default function AdminSidebar({
  userRole,
  permissions = [],
  department,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const visibleItems = navItems.filter((item) => {
    // Super admin sees everything
    if (userRole === Role.SUPER_ADMIN) return true;

    // Check specific role restrictions if defined on item
    if (item.roles && !item.roles.includes(userRole)) {
      return false;
    }

    // Check section privilege access
    return hasSectionAccess(
      { role: userRole, permissions, department },
      item.section
    );
  });

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Be My Traveller</p>
          <p className="text-xs text-slate-500">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          const expanded = expandedItems.has(item.href);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.href}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                    active
                      ? "bg-amber-500/10 text-amber-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <span className={cn(active ? "text-amber-400" : "text-slate-500")}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  <svg
                    className={cn(
                      "w-4 h-4 transition-transform text-slate-600",
                      expanded ? "rotate-90" : ""
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-amber-500/10 text-amber-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <span className={cn(active ? "text-amber-400" : "text-slate-500")}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              )}

              {/* Children */}
              {hasChildren && expanded && (
                <div className="ml-9 mt-0.5 space-y-0.5 border-l border-slate-800 pl-3">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "block px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                        pathname === child.href
                          ? "text-amber-400 bg-amber-500/5"
                          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom: app version */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-600">BMT Admin v1.0.0 · RBAC Active</p>
      </div>
    </aside>
  );
}
