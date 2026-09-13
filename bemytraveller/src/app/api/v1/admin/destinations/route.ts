import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const countryId = searchParams.get("countryId") || "";
    const stateId = searchParams.get("stateId") || "";

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { stateName: { $regex: search, $options: "i" } },
        { countryName: { $regex: search, $options: "i" } },
        { region: { $regex: search, $options: "i" } },
      ];
    }
    if (countryId) {
      if (ObjectId.isValid(countryId)) {
        query.countryId = new ObjectId(countryId);
      } else {
        query.countrySlug = countryId.toLowerCase();
      }
    }
    if (stateId) {
      if (ObjectId.isValid(stateId)) {
        query.stateId = new ObjectId(stateId);
      } else {
        query.stateSlug = stateId.toLowerCase();
      }
    }

    // Ensure master country India exists
    const indiaExists = await db.collection("destinations").findOne({ slug: "india", type: "COUNTRY" });
    if (!indiaExists) {
      await db.collection("destinations").updateOne(
        { slug: "india" },
        {
          $set: {
            slug: "india",
            name: "India",
            type: "COUNTRY",
            region: "Domestic / India",
            displayOrder: 1,
            tagline: "Incredible India - Himalayas, Beaches, Palaces & Backwaters",
            shortDescription: "Experience diverse cultures, snow-clad peaks, royal heritage palaces, and emerald backwaters across India.",
            coverImageStr: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
            startingPrice: "₹12,999",
            idealDuration: "5 to 14 Days",
            bestTimeToVisit: "October to April",
            weather: "Diverse: 15°C to 30°C in plains · -5°C to 18°C in Himalayas",
            howToReach: "Major international hubs: New Delhi (DEL), Mumbai (BOM), Bengaluru (BLR), Cochin (COK).",
            highlights: ["Taj Mahal & Forts", "Himalayan Snow Passes", "Kerala Backwaters", "Goa Beaches"],
            status: "PUBLISHED",
            isFeatured: true,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    const destinations = await db
      .collection("destinations")
      .find(query)
      .sort({ displayOrder: 1, sortOrder: 1, updatedAt: -1 })
      .toArray();

    return NextResponse.json({ destinations, total: destinations.length });
  } catch (error) {
    console.error("[Admin Destinations GET Error]:", error);
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
    const {
      name,
      slug,
      type,
      countryId,
      countrySlug,
      countryName,
      stateId,
      stateSlug,
      stateName,
      region,
      displayOrder,
      startingPrice,
      tagline,
      idealDuration,
      bestTimeToVisit,
      weather,
      howToReach,
      shortDescription,
      highlights,
      attractions,
      faqs,
      seo,
      gallery,
      coverImage,
      coverImageStr,
      status,
    } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    // Resolve parent metadata if passed
    let finalCountryId: ObjectId | undefined = undefined;
    let finalCountrySlug = countrySlug;
    let finalCountryName = countryName;

    let finalStateId: ObjectId | undefined = undefined;
    let finalStateSlug = stateSlug;
    let finalStateName = stateName;

    if (countryId) {
      if (ObjectId.isValid(countryId)) {
        finalCountryId = new ObjectId(countryId);
        const parentCountry = await db.collection("destinations").findOne({ _id: finalCountryId });
        if (parentCountry) {
          finalCountrySlug = parentCountry.slug;
          finalCountryName = parentCountry.name;
        }
      } else {
        const parentCountry = await db.collection("destinations").findOne({ slug: String(countryId).toLowerCase() });
        if (parentCountry) {
          finalCountryId = parentCountry._id;
          finalCountrySlug = parentCountry.slug;
          finalCountryName = parentCountry.name;
        } else {
          finalCountrySlug = String(countryId).toLowerCase();
          finalCountryName = countryName || "India";
        }
      }
    }

    if (stateId) {
      if (ObjectId.isValid(stateId)) {
        finalStateId = new ObjectId(stateId);
        const parentState = await db.collection("destinations").findOne({ _id: finalStateId });
        if (parentState) {
          finalStateSlug = parentState.slug;
          finalStateName = parentState.name;
          if (parentState.countryId) {
            finalCountryId = parentState.countryId;
            finalCountrySlug = parentState.countrySlug;
            finalCountryName = parentState.countryName;
          }
        }
      } else {
        const parentState = await db.collection("destinations").findOne({ slug: String(stateId).toLowerCase() });
        if (parentState) {
          finalStateId = parentState._id;
          finalStateSlug = parentState.slug;
          finalStateName = parentState.name;
        }
      }
    }

    const doc = {
      name,
      slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-"),
      type: type || "STATE",
      countryId: finalCountryId,
      countrySlug: finalCountrySlug || "",
      countryName: finalCountryName || "",
      stateId: finalStateId,
      stateSlug: finalStateSlug || "",
      stateName: finalStateName || "",
      region: region || (type === "COUNTRY" ? "Domestic / India" : "North India"),
      displayOrder: Number(displayOrder) || 0,
      startingPrice: startingPrice || "₹14,999",
      tagline: tagline || "",
      idealDuration: idealDuration || "4 to 6 Days",
      bestTimeToVisit: bestTimeToVisit || "October to March",
      weather: weather || "Pleasant & Mountainous",
      howToReach: howToReach || "",
      shortDescription: shortDescription || "",
      highlights: Array.isArray(highlights) ? highlights : (highlights ? String(highlights).split(",").map((s) => s.trim()) : []),
      attractions: Array.isArray(attractions) ? attractions : [],
      faqs: Array.isArray(faqs) ? faqs : [],
      seo: seo || {
        metaTitle: `${name} Tour Packages | Best Handcrafted Itineraries - Be My Traveller`,
        metaDescription: `Book custom ${name} tour packages with verified stays and cabs.`,
        keywords: `${name} tour packages, ${name} holiday`,
      },
      gallery: Array.isArray(gallery) ? gallery : [],
      coverImage: coverImage || coverImageStr || "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80",
      coverImageStr: coverImageStr || coverImage || "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80",
      status: status || "PUBLISHED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("destinations").insertOne(doc);

    return NextResponse.json({ success: true, destination: { ...doc, _id: result.insertedId } }, { status: 201 });
  } catch (error) {
    console.error("[Admin Destinations POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
