import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { HolidayThemeModel } from "@/domains/cms/holiday-theme.model";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const keywords = Array.isArray(body.keywords)
      ? body.keywords.map(String).map((s: string) => s.trim()).filter(Boolean)
      : typeof body.keywords === "string"
      ? body.keywords.split(",").map((s: string) => s.trim()).filter(Boolean)
      : undefined;

    const targetLocations = Array.isArray(body.targetLocations)
      ? body.targetLocations.map(String).map((s: string) => s.trim()).filter(Boolean)
      : typeof body.targetLocations === "string"
      ? body.targetLocations.split(",").map((s: string) => s.trim()).filter(Boolean)
      : undefined;

    const theme = await HolidayThemeModel.findByIdAndUpdate(
      id,
      {
        ...body,
        ...(keywords !== undefined ? { keywords } : {}),
        ...(targetLocations !== undefined ? { targetLocations } : {}),
        name: String(body.name || "").trim().toUpperCase(),
        label: String(body.label || body.name || "").trim(),
        slug: String(body.slug || body.name || "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      },
      { new: true }
    );

    return NextResponse.json({ success: true, theme });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update theme" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    await HolidayThemeModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete theme" }, { status: 500 });
  }
}
