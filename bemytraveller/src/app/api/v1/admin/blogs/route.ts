import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 500 });

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "ALL") {
      query.category = category;
    }

    const blogs = await db.collection("blogs").find(query).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ blogs, total: blogs.length });
  } catch (error) {
    console.error("[Admin Blogs GET Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, slug, excerpt, content, category, coverImage, author, readTimeMinutes, status } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 500 });

    const doc = {
      title,
      slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-"),
      excerpt: excerpt || "",
      content: content || "",
      category: category || "Travel Guides",
      coverImage: coverImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
      author: author || session.user.name || "BMT Editorial Team",
      readTimeMinutes: Number(readTimeMinutes) || 5,
      status: status || "PUBLISHED",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("blogs").insertOne(doc);

    return NextResponse.json({ success: true, blog: { ...doc, _id: result.insertedId } }, { status: 201 });
  } catch (error) {
    console.error("[Admin Blogs POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
