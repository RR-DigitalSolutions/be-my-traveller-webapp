import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "DB unavailable" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const theme = searchParams.get("theme");
    const destination = searchParams.get("destination");
    const search = searchParams.get("search");
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 200);

    const query: Record<string, any> = {
      status: { $in: ["PUBLISHED", "ACTIVE", "active", "published"] },
    };

    if (theme && theme !== "ALL") {
      const cleanTheme = theme.trim();
      const themeUpper = cleanTheme.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
      query.$or = [
        { theme: { $regex: new RegExp(`^${cleanTheme}$`, "i") } },
        { theme: { $regex: new RegExp(`^${themeUpper}$`, "i") } },
        { theme: cleanTheme },
        { theme: themeUpper },
      ];
    }

    if (destination) {
      const destRegex = { $regex: destination.trim(), $options: "i" };
      query.$or = [
        ...(query.$or || []),
        { destination: destRegex },
        { route: destRegex },
        { states: destRegex },
        { cities: destRegex },
        { stateSlug: destRegex },
        { citySlug: destRegex },
      ];
    }

    if (search) {
      const sRegex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        ...(query.$or || []),
        { name: sRegex },
        { title: sRegex },
        { tagline: sRegex },
        { destination: sRegex },
        { route: sRegex },
      ];
    }

    const rawPackages = await db
      .collection("packages")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const packages = rawPackages.map((p: any) => {
      const startingPrice = Number(p.hotelTiers?.standard?.pricePerAdult) || Number(p.startingPrice) || Number(p.basePrice) || 19999;
      const originalPrice = Number(p.originalPrice) || (p.discountPercent ? Math.round(startingPrice / (1 - p.discountPercent / 100)) : Math.round(startingPrice * 1.25));
      const discountPct = Number(p.discountPercent) || (originalPrice > startingPrice ? Math.round(((originalPrice - startingPrice) / originalPrice) * 100) : 20);

      const coverImg = p.coverImageStr || p.coverImage || (Array.isArray(p.gallery) && p.gallery[0] ? (typeof p.gallery[0] === 'string' ? p.gallery[0] : p.gallery[0].url) : "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80");

      const rawTheme = Array.isArray(p.theme) ? p.theme[0] : (p.theme || "HONEYMOON");

      return {
        _id: String(p._id),
        id: String(p._id),
        slug: p.slug,
        title: p.name || p.title || "Custom Tour Package",
        destination: p.route || p.destination || p.tagline || (Array.isArray(p.states) ? p.states.join(", ") : "Incredible India"),
        region: (Array.isArray(p.states) && p.states[0]) || (Array.isArray(p.countries) && p.countries[0]) || "India",
        nights: Number(p.nights) || 5,
        days: Number(p.days) || (Number(p.nights) || 5) + 1,
        theme: String(rawTheme).toUpperCase(),
        themeList: Array.isArray(p.theme) ? p.theme : [rawTheme],
        startingPrice,
        price: formatINR(startingPrice),
        originalPrice: formatINR(originalPrice),
        discount: `${discountPct}% OFF`,
        discountPercent: discountPct,
        rating: Number(p.averageRating) || 4.9,
        reviews: Number(p.reviewCount) || 128,
        inclusions: Array.isArray(p.inclusions) && p.inclusions.length > 0 ? p.inclusions : ["Verified 4★ Stay", "Private Cab", "Breakfast & Dinner"],
        specialInclusion: (Array.isArray(p.highlights) && p.highlights[0]) || (Array.isArray(p.inclusions) && p.inclusions[0]) || "Verified Mountain Stay & Transfers",
        highlights: Array.isArray(p.highlights) && p.highlights.length > 0 ? p.highlights : (Array.isArray(p.inclusions) ? p.inclusions : []),
        img: coverImg,
        badge: p.tag || (discountPct > 0 ? `${discountPct}% OFF` : "Best Seller"),
        tags: Array.isArray(p.highlights) ? p.highlights : [],
        status: p.status || "PUBLISHED",
      };
    });

    return NextResponse.json(
      { success: true, count: packages.length, packages },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error: any) {
    console.error("[PUBLIC_PACKAGES_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch packages", detail: error?.message },
      { status: 500 }
    );
  }
}
