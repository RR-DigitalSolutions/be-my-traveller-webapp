import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export async function proxy(request: NextRequest & { auth: unknown }) {
  const { pathname } = request.nextUrl;
  const session = (request as { auth: { user?: { role?: string; permissions?: string[] } } | null }).auth;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (session?.user) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    if (!session?.user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = session.user.role || "";
    const perms = session.user.permissions || [];
    const isSuperAdmin = role === "SUPER_ADMIN" || perms.includes("*");

    if (pathname.startsWith("/admin/settings")) {
      const hasSettingsAccess = isSuperAdmin || perms.includes("settings.manage") || perms.includes("settings");
      if (!hasSettingsAccess) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }

    if (pathname.startsWith("/admin/users")) {
      const hasUsersAccess = isSuperAdmin || role === "ADMIN" || perms.includes("user.manage") || perms.includes("users");
      if (!hasUsersAccess) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }
  }

  if (pathname.startsWith("/api/v1/admin") && pathname !== "/api/v1/admin/seed") {
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_ERROR", message: "Authentication required" } },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/v1/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};

export default auth(async function proxyHandler(request: NextRequest & { auth: unknown }) {
  return proxy(request);
});
