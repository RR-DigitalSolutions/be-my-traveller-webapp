import connectDB from "@/lib/db/mongoose";
import {
  DEFAULT_HOLIDAY_THEMES,
  HolidayThemeModel,
  type IHolidayTheme,
} from "@/domains/cms/holiday-theme.model";
import type { HolidayThemeItem } from "@/lib/site-themes";

export async function getHolidayThemes(): Promise<HolidayThemeItem[]> {
  try {
    await connectDB();
    const storedThemes = await HolidayThemeModel.find({ isActive: true })
      .sort({ sortOrder: 1, label: 1 })
      .lean<IHolidayTheme[]>()
      .catch(() => []);

    if (storedThemes?.length) {
      return storedThemes.map((theme) => ({
        _id: String((theme as any)._id ?? ""),
        slug: String(theme.slug || theme.name || ""),
        name: String(theme.name || theme.slug || ""),
        label: String(theme.label || theme.name || theme.slug || ""),
        description: String(theme.description || ""),
        isActive: Boolean(theme.isActive),
        sortOrder: Number(theme.sortOrder || 0),
      }));
    }
  } catch (error) {
    console.warn("[site-themes] Falling back to default holiday themes.", error);
  }

  return DEFAULT_HOLIDAY_THEMES.map((theme) => ({
    slug: theme.slug,
    name: theme.name,
    label: theme.label,
    description: theme.description,
    isActive: theme.isActive,
    sortOrder: theme.sortOrder,
  }));
}
