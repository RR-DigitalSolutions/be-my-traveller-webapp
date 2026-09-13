import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import { MediaModel } from "@/domains/media/media.model";
import { deleteCloudinaryAsset } from "@/lib/cloudinary/cloudinary.client";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "ALL";
    const folder = searchParams.get("folder");
    const search = searchParams.get("search");

    await connectDB();

    const query: Record<string, unknown> = {};
    if (category !== "ALL") {
      query.$or = [
        { category: category },
        { tags: category.toLowerCase() },
        { folder: new RegExp(category.toLowerCase(), "i") },
      ];
    }

    if (folder) {
      query.folder = new RegExp(folder, "i");
    }

    if (search) {
      query.$or = [
        { filename: new RegExp(search, "i") },
        { caption: new RegExp(search, "i") },
        { altText: new RegExp(search, "i") },
        { folder: new RegExp(search, "i") },
        { tags: new RegExp(search, "i") },
      ];
    }

    let items = await MediaModel.find(query).sort({ createdAt: -1 }).lean();

    // Default seeded media if collection is empty
    if (items.length === 0 && category === "ALL" && !search && !folder) {
      const defaultMedia = [
        {
          filename: "himachal-solang-valley.webp",
          caption: "Himachal Solang Valley Snow Peaks",
          publicUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
          optimizedUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=300&q=80",
          cardUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80",
          bannerUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1920&q=80",
          category: "Destinations",
          folder: "bemytraveller/destinations/domestic/himachal-pradesh",
          provider: "unsplash",
          width: 1200,
          height: 800,
          size: 240000,
          mimeType: "image/webp",
          tags: ["destinations", "domestic", "himachal-pradesh"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          filename: "kashmir-dal-lake.webp",
          caption: "Kashmir Dal Lake Shikara Ride",
          publicUrl: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
          optimizedUrl: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=300&q=80",
          cardUrl: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80",
          bannerUrl: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1920&q=80",
          category: "Destinations",
          folder: "bemytraveller/destinations/domestic/kashmir",
          provider: "unsplash",
          width: 1200,
          height: 800,
          size: 260000,
          mimeType: "image/webp",
          tags: ["destinations", "domestic", "kashmir"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          filename: "dubai-marina-skyline.webp",
          caption: "Dubai Marina & Burj Khalifa Skyline",
          publicUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
          optimizedUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&q=80",
          cardUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
          bannerUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80",
          category: "Destinations",
          folder: "bemytraveller/destinations/international/dubai",
          provider: "unsplash",
          width: 1200,
          height: 800,
          size: 310000,
          mimeType: "image/webp",
          tags: ["destinations", "international", "dubai"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          filename: "kashmir-honeymoon-package.webp",
          caption: "Luxury Kashmir Honeymoon Package Cover",
          publicUrl: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
          optimizedUrl: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=300&q=80",
          cardUrl: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=600&q=80",
          bannerUrl: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1920&q=80",
          category: "Packages",
          folder: "bemytraveller/packages/kashmir-honeymoon-special",
          provider: "unsplash",
          width: 1200,
          height: 800,
          size: 290000,
          mimeType: "image/webp",
          tags: ["packages", "kashmir", "honeymoon"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await MediaModel.insertMany(defaultMedia as any);
      items = await MediaModel.find(query).sort({ createdAt: -1 }).lean();
    }

    const formattedMedia = items.map((m: any) => ({
      _id: m._id.toString(),
      title: m.caption || m.filename || "Untitled Image",
      url: m.optimizedUrl || m.publicUrl || m.url,
      publicUrl: m.publicUrl || m.url,
      optimizedUrl: m.optimizedUrl || m.publicUrl || m.url,
      thumbnailUrl: m.thumbnailUrl || m.optimizedUrl || m.publicUrl || m.url,
      cardUrl: m.cardUrl || m.optimizedUrl || m.publicUrl || m.url,
      bannerUrl: m.bannerUrl || m.optimizedUrl || m.publicUrl || m.url,
      publicId: m.cloudinaryPublicId,
      category: m.category || "Destinations",
      folder: m.folder || "bemytraveller/general",
      dimensions: m.width && m.height ? `${m.width}x${m.height}` : "Optimized",
      size: m.size || 0,
      provider: m.provider || "cloudinary",
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ media: formattedMedia });
  } catch (error: any) {
    console.error("[Admin Media GET Error]:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, url, category, folder, publicId, width, height, size } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    await connectDB();

    const mediaDoc = await MediaModel.create({
      filename: title || "Manual Asset",
      caption: title || "Manual Asset",
      publicUrl: url,
      optimizedUrl: url,
      thumbnailUrl: url,
      cardUrl: url,
      bannerUrl: url,
      category: category || "Destinations",
      folder: folder || "bemytraveller/general",
      cloudinaryPublicId: publicId,
      provider: publicId ? "cloudinary" : "custom",
      width: width || 1200,
      height: height || 800,
      size: size || 0,
      tags: [category || "Destinations"],
      uploadedBy: (session.user as any).id,
    });

    return NextResponse.json(
      {
        success: true,
        item: {
          _id: mediaDoc._id.toString(),
          title: mediaDoc.caption,
          url: mediaDoc.optimizedUrl || mediaDoc.publicUrl,
          category: mediaDoc.category,
          folder: mediaDoc.folder,
          createdAt: mediaDoc.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Admin Media POST Error]:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid media ID required" }, { status: 400 });
    }

    await connectDB();
    const media = await MediaModel.findById(id);
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete from Cloudinary if hosted on Cloudinary
    if (media.cloudinaryPublicId) {
      await deleteCloudinaryAsset(media.cloudinaryPublicId);
    }

    await MediaModel.deleteOne({ _id: id });

    return NextResponse.json({ success: true, message: "Media asset deleted successfully" });
  } catch (error: any) {
    console.error("[Admin Media DELETE Error]:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
