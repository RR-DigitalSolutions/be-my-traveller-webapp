// ============================================================
// Cloudflare R2 Client
// Wraps the AWS SDK S3-compatible client for R2.
// Provides typed helpers for presigned URL generation.
// ============================================================

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

// ── Optional R2 configuration ───────────────────────────────
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID?.trim();
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID?.trim();
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY?.trim();
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME?.trim();
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim();

const hasR2Config = Boolean(
  R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET_NAME &&
    R2_PUBLIC_URL
);

function ensureR2Configured(): void {
  if (!hasR2Config) {
    throw new Error("R2 storage is not configured for this deployment.");
  }
}

// ── R2 S3 Client ──────────────────────────────────────────────
export const r2Client = hasR2Config
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: R2_SECRET_ACCESS_KEY ?? "",
      },
    })
  : null;

// ── Allowed file types ────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_DOC_TYPES = ["application/pdf"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DOC_SIZE = 50 * 1024 * 1024;   // 50 MB

// ── Helpers ───────────────────────────────────────────────────

export function validateUpload(mimeType: string, size: number): void {
  const allAllowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];
  if (!allAllowed.includes(mimeType)) {
    throw new Error(
      `File type "${mimeType}" is not allowed. Allowed: ${allAllowed.join(", ")}`
    );
  }
  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;
  if (size > maxSize) {
    throw new Error(
      `File size ${(size / 1024 / 1024).toFixed(1)} MB exceeds limit of ${maxSize / 1024 / 1024} MB`
    );
  }
}

export interface PresignedUploadResult {
  /** The presigned PUT URL to upload to directly from browser */
  uploadUrl: string;
  /** The R2 object key — store this in MongoDB after upload confirmation */
  r2Key: string;
  /** The public CDN URL — usable after upload is confirmed */
  publicUrl: string;
}

/**
 * Generate a presigned URL for a direct browser-to-R2 upload.
 * Expires in 10 minutes.
 *
 * @param folder  Virtual folder prefix e.g. "destinations/himachal"
 * @param filename Original filename (will be sanitized)
 * @param mimeType MIME type of the file
 * @param size     File size in bytes
 */
export async function generatePresignedUploadUrl(
  folder: string,
  filename: string,
  mimeType: string,
  size: number
): Promise<PresignedUploadResult> {
  ensureR2Configured();
  validateUpload(mimeType, size);

  // Sanitize filename: lowercase, no spaces, with unique prefix
  const sanitized = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  const uniqueId = nanoid(10);
  const r2Key = `${folder.replace(/^\/+|\/+$/g, "")}/${uniqueId}-${sanitized}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: r2Key,
    ContentType: mimeType,
    ContentLength: size,
    // Set cache headers for CDN
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(r2Client!, command, {
    expiresIn: 600, // 10 minutes
  });

  const publicUrl = `${R2_PUBLIC_URL}/${r2Key}`;

  return { uploadUrl, r2Key, publicUrl };
}

/**
 * Delete an object from R2.
 * Called when a media record is deleted from MongoDB.
 */
export async function deleteR2Object(r2Key: string): Promise<void> {
  ensureR2Configured();
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: r2Key,
  });
  await r2Client!.send(command);
}
