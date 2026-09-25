import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { HolidayThemeModel } from "@/domains/cms/holiday-theme.model";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const theme = await HolidayThemeModel.findByIdAndUpdate(
      id,
      {
        ...body,
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
