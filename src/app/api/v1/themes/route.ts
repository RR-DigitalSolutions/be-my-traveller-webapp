import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import {
  DEFAULT_HOLIDAY_THEMES,
  HolidayThemeModel,
} from "@/domains/cms/holiday-theme.model";

function normalizeThemeInput(payload: Record<string, any>) {
  const name = String(payload.name || payload.slug || "").trim();
  const label = String(payload.label || name || "").trim();
  const slug = String(payload.slug || name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    slug: slug || "travel-theme",
    name: name || label || "TRAVEL",
    label: label || name || "Travel Theme",
    description: String(payload.description || "").trim(),
    isActive: payload.isActive !== false,
    sortOrder: Number(payload.sortOrder ?? 0),
  };
}

export async function GET() {
  try {
    await connectDB();

    const themes = await HolidayThemeModel.find({})
      .sort({ sortOrder: 1, label: 1 })
      .lean();

    if (themes.length === 0) {
      const seeded = await HolidayThemeModel.insertMany(
        DEFAULT_HOLIDAY_THEMES.map((theme) => ({ ...theme }))
      );
      return NextResponse.json({ themes: seeded });
    }

    return NextResponse.json({ themes });
  } catch (error: any) {
    console.error("[themes:get]", error);
    return NextResponse.json({ error: error.message || "Failed to load themes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const payload = normalizeThemeInput(body);

    if (!payload.name) {
      return NextResponse.json({ error: "Theme name is required" }, { status: 400 });
    }

    const existingId = body.id || body._id;

    let theme;
    if (existingId) {
      theme = await HolidayThemeModel.findByIdAndUpdate(
        existingId,
        { ...payload, name: payload.name.toUpperCase() },
        { new: true }
      );
    } else {
      theme = await HolidayThemeModel.create({
        ...payload,
        name: payload.name.toUpperCase(),
      });
    }

    return NextResponse.json({ success: true, theme });
  } catch (error: any) {
    console.error("[themes:post]", error);
    return NextResponse.json({ error: error.message || "Failed to save theme" }, { status: 500 });
  }
}
