"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import type { RoleKey, PermissionKey, DepartmentKey } from "@/lib/auth/permissions";

interface AdminShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: RoleKey;
    avatar?: string;
    permissions?: (PermissionKey | string)[];
    department?: DepartmentKey;
  };
  children: React.ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close drawer on route navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll on mobile when sidebar drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative">
      {/* Sidebar with mobile drawer support */}
      <AdminSidebar
        userRole={user.role}
        permissions={user.permissions}
        department={user.department}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          user={user}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Page content with responsive mobile padding */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
