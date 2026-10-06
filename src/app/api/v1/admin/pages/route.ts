import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import connectDB from "@/lib/db/mongoose";
import { PageModel } from "@/domains/cms/page.model";
import { DEFAULT_PAGES, getPageBySlug } from "@/domains/cms/pages.config";
import { hasSectionAccess } from "@/lib/auth/permissions";

const CORE_SLUGS = ["about", "cancellation-policy", "terms", "privacy", "contact"];

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasSectionAccess(session.user, "content")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const dbPages = await PageModel.find({ slug: { $in: CORE_SLUGS } }).lean();
    const dbPagesMap = new Map(dbPages.map((p) => [p.slug, p]));

    const pages = await Promise.all(
      CORE_SLUGS.map(async (slug) => {
        const full = await getPageBySlug(slug);
        const doc = dbPagesMap.get(slug);
        return {
          slug,
          title: full.title,
          subtitle: full.subtitle,
          badge: full.badge,
          template: full.template,
          status: full.status || "PUBLISHED",
          updatedAt: full.updatedAt || (doc ? new Date(doc.updatedAt).toISOString() : new Date().toISOString()),
          isCustomized: !!doc,
        };
      })
    );

    return NextResponse.json({
      success: true,
      pages,
    });
  } catch (error: any) {
    console.error("[ADMIN_PAGES_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load pages", detail: error?.message },
      { status: 500 }
    );
  }
}
