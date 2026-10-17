import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { HomepageContentModel } from "@/domains/cms/homepage-content.model";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Public endpoint for Homepage dynamic content
export async function GET() {
  try {
    await connectDB();
    const content = await HomepageContentModel.findOne().lean();
    return NextResponse.json(
      { success: true, content: content || null },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err) {
    console.error("Public HomepageContent GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load homepage content" }, { status: 500 });
  }
}
