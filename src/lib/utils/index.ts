/**
 * Generate a URL-safe slug from a string.
 * Example: "7 Days Manali & Spiti Tour!" → "7-days-manali-spiti-tour"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "") // remove non-word chars (except hyphen)
    .replace(/[\s_]+/g, "-")  // spaces and underscores → hyphen
    .replace(/-+/g, "-")      // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/**
 * Safely coerce values to a finite number.
 * Avoids null/undefined/NaN crashes when pricing data is missing.
 */
export function safeNumber(value: number | string | null | undefined, fallback = 0): number {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Format a number as Indian currency.
 * Example: 48000 → "₹48,000"
 */
export function formatINR(amount: number | string | null | undefined, fallback = 0): string {
  const safeAmount = safeNumber(amount, fallback);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

/**
 * Generate a sequential document number.
 * Example: prefix="BMT-Q", counter=1 → "BMT-Q-2025-0001"
 */
export function generateDocNumber(prefix: string, counter: number): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(counter).padStart(4, "0")}`;
}

/**
 * Safely truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Parse UTM parameters from a URL search string.
 */
export function parseUtmParams(searchString: string): Record<string, string> {
  const params = new URLSearchParams(searchString);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const result: Record<string, string> = {};
  for (const key of utmKeys) {
    const val = params.get(key);
    if (val) result[key] = val;
  }
  return result;
}

/**
 * Convert Tiptap JSON to plain text (for meta descriptions, previews).
 */
export function tiptapToPlainText(doc: Record<string, unknown>): string {
  if (!doc?.content) return "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function extractText(node: any): string {
    if (node.type === "text") return node.text ?? "";
    if (node.content) return node.content.map(extractText).join("");
    return "";
  }
  return extractText(doc).replace(/\s+/g, " ").trim();
}

/**
 * Merge Tailwind CSS class names (using clsx + tailwind-merge pattern).
 * Avoids duplicating the same utility — import cn() everywhere instead of clsx().
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
