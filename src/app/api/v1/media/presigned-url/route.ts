import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/authorize";
import { Permission } from "@/lib/auth/permissions";
import { generatePresignedUploadUrl } from "@/lib/r2/r2.client";
import { apiSuccess, apiError } from "@/lib/errors/app-errors";

const presignedUrlSchema = z.object({
  folder: z.string().default("uploads"),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermission(Permission.MEDIA_UPLOAD);

    const body = await req.json();
    const data = presignedUrlSchema.parse(body);

    const result = await generatePresignedUploadUrl(
      data.folder,
      data.filename,
      data.mimeType,
      data.size
    );

    return apiSuccess(result, 200);
  } catch (error) {
    return apiError(error);
  }
}
