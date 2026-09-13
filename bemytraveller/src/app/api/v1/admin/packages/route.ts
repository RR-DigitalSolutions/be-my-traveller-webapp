import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { PackageModel } from "@/domains/packages/package.model";
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
        { tagline: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const packages = await PackageModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, packages });
  } catch (error: any) {
    console.error("[ADMIN_PACKAGES_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch packages", detail: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const body = await req.json();

    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "Package Name and URL Slug are required" }, { status: 400 });
    }

    const cleanSlug = String(body.slug).toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

    const standardTierPrice = Number(body.hotelTiers?.standard?.pricePerAdult) || Number(body.startingPrice) || 18999;
    const discountPct = Number(body.discountPercent) || 0;
    const computedOriginal = discountPct > 0
      ? Math.round(standardTierPrice / (1 - discountPct / 100))
      : (Number(body.originalPrice) || Math.round(standardTierPrice * 1.25));

    const newDoc = {
      ...body,
      slug: cleanSlug,
      startingPrice: standardTierPrice,
      originalPrice: computedOriginal,
      discountPercent: discountPct,
      discountBadge: body.discountBadge || (discountPct > 0 ? `Save ${discountPct}% Today` : ""),
      countries: Array.isArray(body.countries) ? body.countries : (body.countrySlug ? [body.countrySlug] : ["india"]),
      states: Array.isArray(body.states) ? body.states : (body.stateSlug ? [body.stateSlug] : []),
      cities: Array.isArray(body.cities) ? body.cities : (body.citySlug ? [body.citySlug] : []),
      nights: Number(body.nights) || 0,
      days: Number(body.days) || (Number(body.nights) || 0) + 1,
      highlights: Array.isArray(body.highlights)
        ? body.highlights
        : (body.highlights ? String(body.highlights).split(",").map((s: string) => s.trim()).filter(Boolean) : []),
      inclusions: Array.isArray(body.inclusions) ? body.inclusions : [],
      exclusions: Array.isArray(body.exclusions) ? body.exclusions : [],
      itinerary: Array.isArray(body.itinerary) ? body.itinerary : [],
      hotelTiers: body.hotelTiers || {
        standard: { title: "Deluxe 3★", pricePerAdult: standardTierPrice, desc: "Cozy verified boutique stays" },
        deluxe: { title: "Super Deluxe 4★", pricePerAdult: Math.round(standardTierPrice * 1.3), desc: "Valley/river view premium rooms" },
        luxury: { title: "Luxury 5★ Resort", pricePerAdult: Math.round(standardTierPrice * 1.9), desc: "Spa resorts & luxury chalets" },
      },
      seasonalHike: body.seasonalHike || {
        enabled: false,
        seasonType: "NONE",
        hikeType: "PERCENTAGE",
        hikeValue: 0,
        seasonLabel: "",
        validityNote: "",
      },
      seasonalHikes: Array.isArray(body.seasonalHikes) ? body.seasonalHikes : [],
      faqs: Array.isArray(body.faqs) ? body.faqs : [],
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      status: body.status || "PUBLISHED",
      createdBy: session.user.id || "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("packages").insertOne(newDoc);

    return NextResponse.json(
      { success: true, package: { ...newDoc, _id: result.insertedId }, message: "Package created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ADMIN_PACKAGES_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create package", detail: error?.message },
      { status: 500 }
    );
  }
}
