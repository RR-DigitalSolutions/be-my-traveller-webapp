// ============================================================
// Cloudinary Enterprise Media Service for Be My Traveller
// Configured with high-efficiency compression (f_auto, q_auto, c_limit)
// to maximize free-tier quota while maintaining crisp visual quality.
// ============================================================

import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";

// ── Configure Cloudinary ──────────────────────────────────────
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "oxi3tetk";
const API_KEY = process.env.CLOUDINARY_API_KEY || "876368118834242";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "4secYW_tMuCxaCqt9GV5Wtt2S0M";

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

export { cloudinary };

// ── Travel Enterprise Folder Structure Taxonomy ──────────────
export type DestinationCategory = "domestic" | "international";
export type MediaFolderType =
  | "destinations"
  | "packages"
  | "hotels"
  | "activities"
  | "banners"
  | "blogs"
  | "general";

const ROOT_FOLDER = "bemytraveller";

export interface TravelFolderPathOptions {
  type: MediaFolderType;
  category?: DestinationCategory | string;
  slug?: string;
  customFolder?: string;
  countrySlug?: string;
  stateSlug?: string;
  placeSlug?: string;
  destType?: "COUNTRY" | "STATE" | "CITY" | "ISLAND";
}

/**
 * Builds standard enterprise folder paths for organized media storage
 * Supports deep hierarchy:
 * - Country:  bemytraveller/destinations/india
 * - State:    bemytraveller/destinations/india/himachal
 * - City/Place: bemytraveller/destinations/india/himachal/jibhi
 */
export function buildTravelFolderPath(options: TravelFolderPathOptions): string {
  const { type, category, slug, customFolder, countrySlug, stateSlug, placeSlug, destType } = options;

  if (customFolder && customFolder.trim()) {
    return customFolder.trim().replace(/^\/+|\/+$/g, "");
  }

  const clean = (s?: string) =>
    s
      ? s
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      : "";

  const cSlug = clean(countrySlug) || (category === "international" ? "international" : "india");
  const sSlug = clean(stateSlug);
  const pSlug = clean(placeSlug || slug);

  switch (type) {
    case "destinations": {
      if (destType === "COUNTRY" || (!sSlug && !pSlug)) {
        return `${ROOT_FOLDER}/destinations/${cSlug || "india"}`;
      }
      if (destType === "STATE" || (sSlug && !pSlug)) {
        return `${ROOT_FOLDER}/destinations/${cSlug}/${sSlug}`;
      }
      if (sSlug && pSlug) {
        return `${ROOT_FOLDER}/destinations/${cSlug}/${sSlug}/${pSlug}`;
      }
      if (category === "international") {
        return `${ROOT_FOLDER}/destinations/international/${pSlug || "general"}`;
      }
      return `${ROOT_FOLDER}/destinations/${cSlug}/${pSlug || "general"}`;
    }
    case "packages":
      return `${ROOT_FOLDER}/packages/${pSlug || "general"}`;
    case "hotels":
      return `${ROOT_FOLDER}/hotels/${pSlug || "general"}`;
    case "activities":
      return `${ROOT_FOLDER}/activities/${pSlug || "general"}`;
    case "banners":
      return `${ROOT_FOLDER}/banners/${category || "hero"}`;
    case "blogs":
      return `${ROOT_FOLDER}/blogs/${pSlug || "general"}`;
    default:
      return `${ROOT_FOLDER}/general`;
  }
}

// ── Upload with Auto-Optimization ─────────────────────────────

export interface CloudinaryUploadOptions {
  folder: string;
  filename?: string;
  tags?: string[];
  maxWidth?: number;
  maxHeight?: number;
}

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  optimizedUrl: string;
  thumbnailUrl: string;
  cardUrl: string;
  bannerUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resourceType: string;
  folder: string;
}

/**
 * Uploads a file buffer or base64 data to Cloudinary with automatic
 * resolution capping and metadata compression to save storage quota.
 */
export async function uploadToCloudinary(
  fileBufferOrDataUri: Buffer | string,
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  const { folder, filename, tags = [], maxWidth = 1920, maxHeight = 1080 } = options;

  // Upload transformation rules:
  // Downsize excessively large images (e.g. 4K/DSLR 15MB) upon upload without loss of visual quality.
  const uploadOptions: UploadApiOptions = {
    folder,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    resource_type: "auto",
    tags: ["bemytraveller", ...tags],
    transformation: [
      {
        width: maxWidth,
        height: maxHeight,
        crop: "limit", // Only scale down if image exceeds dimensions
      },
      {
        quality: "auto:good",
        fetch_format: "auto",
      },
    ],
  };

  if (filename) {
    uploadOptions.public_id = filename
      .toLowerCase()
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");
  }

  let result: UploadApiResponse;

  if (typeof fileBufferOrDataUri === "string") {
    result = await cloudinary.uploader.upload(fileBufferOrDataUri, uploadOptions);
  } else {
    // Buffer stream upload
    result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, uploadResult) => {
          if (error || !uploadResult) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve(uploadResult);
        }
      );
      uploadStream.end(fileBufferOrDataUri);
    });
  }

  // Dynamic on-the-fly optimized URLs (0 storage cost, instant CDN cached)
  const publicId = result.public_id;
  const optimizedUrl = getOptimizedDeliveryUrl(publicId);
  const thumbnailUrl = getOptimizedDeliveryUrl(publicId, { width: 300, height: 200, crop: "fill" });
  const cardUrl = getOptimizedDeliveryUrl(publicId, { width: 600, height: 400, crop: "fill" });
  const bannerUrl = getOptimizedDeliveryUrl(publicId, { width: 1920, height: 600, crop: "fill" });

  return {
    publicId,
    secureUrl: result.secure_url,
    optimizedUrl,
    thumbnailUrl,
    cardUrl,
    bannerUrl,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    resourceType: result.resource_type,
    folder,
  };
}

/**
 * Generate a dynamic transformed delivery URL using Cloudinary URL API
 * Always includes `f_auto,q_auto` to ensure smallest possible payload on client.
 */
export function getOptimizedDeliveryUrl(
  publicIdOrUrl: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: "fill" | "limit" | "fit" | "thumb" | "scale";
    gravity?: "auto" | "face" | "center";
    quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | "auto:low";
  }
): string {
  // If full Cloudinary URL is passed, extract public_id
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes("res.cloudinary.com")) {
    const parts = publicIdOrUrl.split("/upload/");
    if (parts.length > 1) {
      const afterUpload = parts[1];
      const segments = afterUpload.split("/");
      if (segments[0].startsWith("v") && !isNaN(Number(segments[0].slice(1)))) {
        publicId = segments.slice(1).join("/").replace(/\.[^/.]+$/, "");
      } else if (segments.length > 1) {
        publicId = segments.slice(1).join("/").replace(/\.[^/.]+$/, "");
      }
    }
  }

  const {
    width,
    height,
    crop = "limit",
    gravity = "auto",
    quality = "auto:good",
  } = transformations || {};

  const transformArray: Record<string, unknown>[] = [
    { fetch_format: "auto", quality },
  ];

  if (width || height) {
    transformArray.push({
      width,
      height,
      crop,
      ...(crop === "fill" || crop === "thumb" ? { gravity } : {}),
    });
  }

  return cloudinary.url(publicId, {
    transformation: transformArray,
    secure: true,
  });
}

/**
 * Delete asset from Cloudinary
 */
export async function deleteCloudinaryAsset(publicId: string): Promise<boolean> {
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === "ok";
  } catch (err) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, err);
    return false;
  }
}

/**
 * Generates signed parameters for secure browser-to-Cloudinary direct upload
 */
export function generateCloudinarySignature(folder: string, tags: string[] = []) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign: Record<string, unknown> = {
    folder,
    timestamp,
    tags: ["bemytraveller", ...tags].join(","),
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, API_SECRET);

  return {
    signature,
    timestamp,
    apiKey: API_KEY,
    cloudName: CLOUD_NAME,
    folder,
  };
}
