import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const conn = await connectDB();
    const db = conn.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    let query: any = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { quoteNumber: id }] };
    } else {
      query = { quoteNumber: id };
    }

    const quote = await db.collection("quotes").findOne(query);
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ quote });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch quote" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const conn = await connectDB();
    const db = conn.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    let query: any = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { quoteNumber: id }] };
    } else {
      query = { quoteNumber: id };
    }

    const updateFields = {
      ...body,
      updatedAt: new Date(),
    };
    delete updateFields._id;

    const result = await db.collection("quotes").findOneAndUpdate(
      query,
      { $set: updateFields },
      { returnDocument: "after" }
    );

    return NextResponse.json({ success: true, quote: result });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update quote" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const conn = await connectDB();
    const db = conn.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    let query: any = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { quoteNumber: id }] };
    } else {
      query = { quoteNumber: id };
    }

    await db.collection("quotes").deleteOne(query);

    return NextResponse.json({ success: true, message: "Quote deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete quote" }, { status: 500 });
  }
}
