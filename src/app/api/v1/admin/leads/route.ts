import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { LeadModel } from "@/domains/crm/lead.model";
import { auth } from "@/lib/auth/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: Record<string, any> = {};
    if (status && status !== "ALL") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { specialRequirements: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await LeadModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error("[ADMIN_LEADS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch leads", detail: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const update: Record<string, any> = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const lead = await LeadModel.findByIdAndUpdate(id, { $set: update }, { new: true });

    return NextResponse.json({ success: true, lead, message: "Lead updated successfully" });
  } catch (error: any) {
    console.error("[ADMIN_LEADS_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update lead", detail: error?.message },
      { status: 500 }
    );
  }
}
