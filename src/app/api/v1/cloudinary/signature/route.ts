import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  buildTravelFolderPath,
  generateCloudinarySignature,
  MediaFolderType,
  DestinationCategory,
} from "@/lib/cloudinary/cloudinary.client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const folderType = (body.folderType as MediaFolderType) || "destinations";
    const category = (body.category as DestinationCategory | string) || "domestic";
    const slug = (body.slug as string) || "general";
    const tags = Array.isArray(body.tags) ? body.tags : [];

    const folderPath = buildTravelFolderPath({
      type: folderType,
      category,
      slug,
    });

    const signatureData = generateCloudinarySignature(folderPath, [
      folderType,
      category,
      slug,
      ...tags,
    ]);

    return NextResponse.json({
      success: true,
      ...signatureData,
    });
  } catch (error: any) {
    console.error("[Cloudinary Signature Route Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate signature" },
      { status: 500 }
    );
  }
}
