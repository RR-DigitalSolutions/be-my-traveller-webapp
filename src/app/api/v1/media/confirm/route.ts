import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/authorize";
import { Permission } from "@/lib/auth/permissions";
import connectDB from "@/lib/db/mongoose";
import { MediaModel } from "@/domains/media/media.model";
import { apiSuccess, apiError } from "@/lib/errors/app-errors";

const confirmMediaSchema = z.object({
  filename: z.string().min(1),
  r2Key: z.string().min(1),
  publicUrl: z.string().url(),
  mimeType: z.string().min(1),
  size: z.number().positive(),
  width: z.number().optional(),
  height: z.number().optional(),
  altText: z.string().optional(),
  caption: z.string().optional(),
  folder: z.string().optional(),
  tags: z.array(z.string()).default([]),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(Permission.MEDIA_UPLOAD);

    const body = await req.json();
    const data = confirmMediaSchema.parse(body);

    await connectDB();

    const media = await MediaModel.create({
      ...data,
      variants: [],
      uploadedBy: session.user.id,
    });

    return apiSuccess(media, 201);
  } catch (error) {
    return apiError(error);
  }
}
