import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import { MediaModel } from "@/domains/media/media.model";
import {
  buildTravelFolderPath,
  uploadToCloudinary,
  MediaFolderType,
  DestinationCategory,
} from "@/lib/cloudinary/cloudinary.client";


export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    // Allow authenticated users or admin session
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required to upload media." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderType = (formData.get("folderType") as MediaFolderType) || "destinations";
    const category = (formData.get("category") as DestinationCategory | string) || "domestic";
    const slug = (formData.get("slug") as string) || "general";
    const customFolder = (formData.get("customFolder") as string) || "";
    const countrySlug = (formData.get("countrySlug") as string) || "";
    const stateSlug = (formData.get("stateSlug") as string) || "";
    const placeSlug = (formData.get("placeSlug") as string) || "";
    const destType = (formData.get("destType") as any) || undefined;
    const title = (formData.get("title") as string) || file?.name || "Uploaded Media";
    const altText = (formData.get("altText") as string) || title;
    const tagsRaw = formData.get("tags") as string;
    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    if (!file) {
      return NextResponse.json({ error: "No file provided for upload" }, { status: 400 });
    }

    // Build structured folder taxonomy
    const folderPath = buildTravelFolderPath({
      type: folderType,
      category,
      slug,
      customFolder,
      countrySlug,
      stateSlug,
      placeSlug,
      destType,
    });

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload with automatic resolution capping & optimization
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: folderPath,
      filename: file.name,
      tags: [folderType, category, slug, ...tags],
    });

    await connectDB();

    // Safely drop conflicting legacy r2Key_1 index if present from older R2 migrations
    try {
      const db = mongoose.connection.db;
      if (db) {
        const indexes = await db.collection("media").indexes();
        const hasR2KeyIndex = indexes.some((idx) => idx.name === "r2Key_1" || (idx.key && idx.key.r2Key));
        if (hasR2KeyIndex) {
          await db.collection("media").dropIndex("r2Key_1").catch(() => {});
        }
      }
    } catch {
      // Continue if index already dropped or non-existent
    }

    const mediaDoc = await MediaModel.create({
      filename: file.name,
      provider: "cloudinary",
      cloudinaryPublicId: uploadResult.publicId,
      publicUrl: uploadResult.secureUrl,
      optimizedUrl: uploadResult.optimizedUrl,
      thumbnailUrl: uploadResult.thumbnailUrl,
      cardUrl: uploadResult.cardUrl,
      bannerUrl: uploadResult.bannerUrl,
      mimeType: file.type || `image/${uploadResult.format}`,
      size: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      altText,
      caption: title,
      folder: uploadResult.folder,
      category: folderType === "destinations" ? category : folderType,
      tags: [folderType, category, slug, ...tags],
      uploadedBy: (session.user as any).id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded and optimized successfully",
        media: {
          _id: mediaDoc._id.toString(),
          title: mediaDoc.caption || mediaDoc.filename,
          url: mediaDoc.optimizedUrl || mediaDoc.publicUrl,
          secureUrl: mediaDoc.publicUrl,
          thumbnailUrl: mediaDoc.thumbnailUrl,
          cardUrl: mediaDoc.cardUrl,
          bannerUrl: mediaDoc.bannerUrl,
          publicId: uploadResult.publicId,
          folder: uploadResult.folder,
          category: mediaDoc.category,
          dimensions: `${uploadResult.width}x${uploadResult.height}`,
          size: uploadResult.bytes,
          format: uploadResult.format,
          createdAt: mediaDoc.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Cloudinary Upload Route Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process Cloudinary upload." },
      { status: 500 }
    );
  }
}
