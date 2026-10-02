import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { HomepageContentModel } from "@/domains/cms/homepage-content.model";
import { auth } from "@/lib/auth/auth";

// Public GET - no auth needed (for frontend)
export async function GET() {
  try {
    await connectDB();
    const content = await HomepageContentModel.findOne().lean();
    return NextResponse.json({ success: true, content: content || null });
  } catch (err) {
    console.error("HomepageContent GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load homepage content" }, { status: 500 });
  }
}

// Admin PATCH - requires auth
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const updateData: Record<string, any> = {
      updatedBy: session.user.name || session.user.email || "Admin",
    };

    if (body.featuredPackages !== undefined) updateData.featuredPackages = body.featuredPackages;
    if (body.specialOffers !== undefined) updateData.specialOffers = body.specialOffers;
    if (body.popularDestinations !== undefined) updateData.popularDestinations = body.popularDestinations;
    if (body.themePackages !== undefined) updateData.themePackages = body.themePackages;
    if (body.whyBook !== undefined) updateData.whyBook = body.whyBook;
    if (body.reviews !== undefined) updateData.reviews = body.reviews;

    const content = await HomepageContentModel.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, runValidators: false }
    );

    return NextResponse.json({ success: true, content });
  } catch (err) {
    console.error("HomepageContent PATCH error:", err);
    return NextResponse.json({ success: false, error: "Failed to update homepage content" }, { status: 500 });
  }
}
