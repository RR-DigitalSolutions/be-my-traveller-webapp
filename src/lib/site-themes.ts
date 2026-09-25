export interface HolidayThemeItem {
  _id?: string;
  slug: string;
  name: string;
  label: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export function normalizeThemeValue(theme: string | null | undefined): string {
  if (!theme) return "ALL";
  const normalized = theme
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "ALL";
}

export function buildThemeHref(themeValue: string): string {
  const normalized = normalizeThemeValue(themeValue);
  return `/packages?theme=${encodeURIComponent(normalized)}`;
}
