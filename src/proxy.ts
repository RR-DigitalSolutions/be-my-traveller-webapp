import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";
import { hasSectionAccess } from "@/lib/auth/permissions";

const { auth } = NextAuth(authConfig);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();

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

    const userContext = {
      role: session.user.role as any,
      permissions: (session.user.permissions as string[]) || [],
      department: session.user.department as any,
    };

    let requiredSection: string | null = null;
    if (pathname.startsWith("/admin/hotels")) requiredSection = "hotels";
    else if (pathname.startsWith("/admin/transport")) requiredSection = "transport";
    else if (pathname.startsWith("/admin/finance")) requiredSection = "finance";
    else if (pathname.startsWith("/admin/leads") || pathname.startsWith("/admin/quotes")) requiredSection = "sales";
    else if (pathname.startsWith("/admin/users")) requiredSection = "users";
    else if (pathname.startsWith("/admin/settings")) requiredSection = "settings";
    else if (pathname.startsWith("/admin/media")) requiredSection = "media";
    else if (pathname.startsWith("/admin/seo")) requiredSection = "seo";
    else if (pathname.startsWith("/admin/content")) requiredSection = "content";
    else if (pathname.startsWith("/admin/packages")) requiredSection = "packages";
    else if (pathname.startsWith("/admin/tasks")) requiredSection = "tasks";
    else if (pathname.startsWith("/admin/suppliers")) requiredSection = "suppliers";
    else if (pathname.startsWith("/admin/analytics")) requiredSection = "analytics";
    else if (pathname.startsWith("/admin/bookings")) requiredSection = "operations";

    if (requiredSection && !hasSectionAccess(userContext, requiredSection)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/api/v1/admin") && pathname !== "/api/v1/admin/seed") {
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_ERROR",
            message: "Authentication required",
          },
        },
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
  ],
};

export default function proxyHandler(request: NextRequest) {
  return proxy(request);
}
