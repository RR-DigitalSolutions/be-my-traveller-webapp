import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import connectDB from "@/lib/db/mongoose";
import { PageModel } from "@/domains/cms/page.model";
import { getPageBySlug, DEFAULT_PAGES } from "@/domains/cms/pages.config";
import { hasSectionAccess } from "@/lib/auth/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasSectionAccess(session.user, "content")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    const normalizedSlug = slug.trim().toLowerCase();

    const pageData = await getPageBySlug(normalizedSlug);

    return NextResponse.json({
      success: true,
      page: pageData,
    });
  } catch (error: any) {
    console.error("[ADMIN_PAGE_DETAIL_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch page data", detail: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasSectionAccess(session.user, "content")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    const normalizedSlug = slug.trim().toLowerCase();

    const body = await req.json();
    await connectDB();

    const updated = await PageModel.findOneAndUpdate(
      { slug: normalizedSlug },
      {
        $set: {
          title: body.title?.trim() || "Untitled Page",
          template: body.template || "DEFAULT",
          content: {
            subtitle: body.subtitle?.trim() || "",
            badge: body.badge?.trim() || "",
            heroImage: body.heroImage?.trim() || "",
            heroCtaText: body.heroCtaText?.trim() || "",
            heroCtaLink: body.heroCtaLink?.trim() || "",
            stats: Array.isArray(body.stats) ? body.stats : [],
            sections: Array.isArray(body.sections) ? body.sections : [],
            faqs: Array.isArray(body.faqs) ? body.faqs : [],
            highlights: Array.isArray(body.highlights) ? body.highlights : [],
            tableData: Array.isArray(body.tableData) ? body.tableData : [],
          },
          seo: {
            metaTitle: body.seo?.metaTitle?.trim() || body.title?.trim(),
            metaDescription: body.seo?.metaDescription?.trim() || body.subtitle?.trim(),
            keywords: Array.isArray(body.seo?.keywords) ? body.seo.keywords : [],
          },
          status: body.status || "PUBLISHED",
          publishedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Page '${normalizedSlug}' updated successfully`,
      page: await getPageBySlug(normalizedSlug),
    });
  } catch (error: any) {
    console.error("[ADMIN_PAGE_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update page", detail: error?.message },
      { status: 500 }
    );
  }
}

// Reset page to verified competitor defaults
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasSectionAccess(session.user, "content")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    const normalizedSlug = slug.trim().toLowerCase();

    await connectDB();
    await PageModel.deleteOne({ slug: normalizedSlug });

    return NextResponse.json({
      success: true,
      message: `Page '${normalizedSlug}' restored to default content`,
      page: DEFAULT_PAGES[normalizedSlug] || DEFAULT_PAGES.about,
    });
  } catch (error: any) {
    console.error("[ADMIN_PAGE_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to reset page", detail: error?.message },
      { status: 500 }
    );
  }
}
