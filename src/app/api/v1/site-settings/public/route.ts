import { NextResponse } from "next/server";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getPublicSiteSettings();
    return NextResponse.json(
      { success: true, settings },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
        },
      }
    );
  } catch (error: any) {
    console.error("[PUBLIC_SETTINGS_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch public settings", detail: error?.message },
      { status: 500 }
    );
  }
}
