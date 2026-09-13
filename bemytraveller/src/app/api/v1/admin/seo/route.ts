import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    let redirects = await db.collection("seo_redirects").find({}).sort({ createdAt: -1 }).toArray();

    if (redirects.length === 0) {
      const defaultRedirects = [
        { fromPath: "/kashmir-tour", toPath: "/destinations/kashmir", statusCode: 301, hits: 142, createdAt: new Date() },
        { fromPath: "/himachal-packages", toPath: "/destinations/himachal-pradesh", statusCode: 301, hits: 288, createdAt: new Date() },
        { fromPath: "/kerala-honeymoon", toPath: "/packages?theme=HONEYMOON", statusCode: 302, hits: 96, createdAt: new Date() },
      ];
      await db.collection("seo_redirects").insertMany(defaultRedirects);
      redirects = await db.collection("seo_redirects").find({}).toArray();
    }

    return NextResponse.json({ redirects });
  } catch (error) {
    console.error("[SEO GET Error]:", error);
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
    const { fromPath, toPath, statusCode } = body;

    if (!fromPath || !toPath) {
      return NextResponse.json({ error: "From and To paths are required" }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const doc = {
      fromPath: fromPath.startsWith("/") ? fromPath : `/${fromPath}`,
      toPath: toPath.startsWith("/") ? toPath : `/${toPath}`,
      statusCode: Number(statusCode) || 301,
      hits: 0,
      createdAt: new Date(),
    };

    const res = await db.collection("seo_redirects").insertOne(doc);

    return NextResponse.json({ success: true, redirect: { ...doc, _id: res.insertedId } }, { status: 201 });
  } catch (error) {
    console.error("[SEO POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    await db.collection("seo_redirects").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SEO DELETE Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
