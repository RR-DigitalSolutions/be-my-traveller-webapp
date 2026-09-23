"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db/mongoose";
import { MediaModel } from "./media.model";
import { requirePermission } from "@/lib/auth/authorize";
import { Permission } from "@/lib/auth/permissions";
import { deleteCloudinaryAsset } from "@/lib/cloudinary/cloudinary.client";
import { deleteR2Object } from "@/lib/r2/r2.client";
import { AuditService } from "@/domains/auth/audit.service";

export async function getMediaList(folder?: string) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (folder) query.folder = folder;

  const items = await MediaModel.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return items.map((m) => ({
    ...m,
    _id: m._id.toString(),
    uploadedBy: m.uploadedBy?.toString(),
    entityId: m.entityId?.toString(),
  }));
}

export async function updateMediaMetadata(
  id: string,
  data: { altText?: string; caption?: string; folder?: string; tags?: string[] }
) {
  const session = await requirePermission(Permission.MEDIA_UPLOAD);
  await connectDB();

  const media = await MediaModel.findByIdAndUpdate(id, data, { new: true });
  if (!media) throw new Error("Media asset not found.");

  revalidatePath("/admin/media");
  return { success: true };
}

export async function deleteMediaAsset(id: string) {
  const session = await requirePermission(Permission.MEDIA_DELETE);
  await connectDB();

  const media = await MediaModel.findById(id);
  if (!media) throw new Error("Media asset not found.");

  // 1. Delete object from Cloudinary or R2
  if (media.cloudinaryPublicId) {
    try {
      await deleteCloudinaryAsset(media.cloudinaryPublicId);
    } catch (err) {
      console.error(`Failed to delete Cloudinary asset: ${media.cloudinaryPublicId}`, err);
    }
  } else if (media.r2Key) {
    try {
      await deleteR2Object(media.r2Key);
    } catch (err) {
      console.error(`Failed to delete R2 key: ${media.r2Key}`, err);
    }
  }

  // 2. Delete document from MongoDB
  await MediaModel.deleteOne({ _id: id });

  // 3. Log audit event
  await AuditService.log({
    userId: session.user.id,
    userEmail: session.user.email || "admin",
    action: "DELETE",
    entityType: "Media",
    entityId: id,
    entitySlug: media.filename,
  });

  revalidatePath("/admin/media");
  return { success: true };
}
