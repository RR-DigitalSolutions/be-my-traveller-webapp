import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import AdminShell from "@/components/admin/AdminShell";

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

  // If not logged in (e.g. on /admin/login), render the clean auth container.
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated responsive admin layout with AdminShell
  return (
    <AdminShell user={session.user}>
      {children}
    </AdminShell>
  );
}
