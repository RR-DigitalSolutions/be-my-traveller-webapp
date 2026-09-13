import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: { template: "%s | BMT Admin", default: "Dashboard | BMT Admin" },
  robots: "noindex, nofollow", // admin is never indexed
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If not logged in (e.g. on /admin/login), render the clean auth container
  if (!session?.user) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

  // Authenticated admin layout with sidebar and header
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        userRole={session.user.role}
        permissions={session.user.permissions}
        department={session.user.department}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={session.user} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
