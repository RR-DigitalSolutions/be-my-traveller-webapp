import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req: NextRequest & { auth: unknown }) {
  const { pathname } = req.nextUrl;
  const session = (req as { auth: { user?: { role?: string; permissions?: string[] } } | null }).auth;

  // ── Protect all /admin routes ────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Allow /admin/login always
    if (pathname === "/admin/login") {
      // If already logged in, redirect to dashboard
      if (session?.user) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // No session → redirect to login
    if (!session?.user) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = session.user.role || "";
    const perms = session.user.permissions || [];
    const isSuperAdmin = role === "SUPER_ADMIN" || perms.includes("*");

    // Role & Privilege restricted routes
    if (pathname.startsWith("/admin/settings")) {
      const hasSettingsAccess = isSuperAdmin || perms.includes("settings.manage") || perms.includes("settings");
      if (!hasSettingsAccess) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    if (pathname.startsWith("/admin/users")) {
      const hasUsersAccess = isSuperAdmin || role === "ADMIN" || perms.includes("user.manage") || perms.includes("users");
      if (!hasUsersAccess) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }
  }

  // ── Protect /api/v1/admin routes (except seed for first-time setup) ──
  if (pathname.startsWith("/api/v1/admin") && pathname !== "/api/v1/admin/seed") {
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_ERROR", message: "Authentication required" } },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/v1/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
