import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
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
            startingPrice: "₹14,999",
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

    const allDests = await db
      .collection("destinations")
      .find({})
      .sort({ displayOrder: 1, sortOrder: 1, name: 1 })
      .toArray();

    const countries = allDests.filter((d) => d.type === "COUNTRY");
    const states = allDests.filter((d) => d.type === "STATE" || d.type === "ISLAND");
    const cities = allDests.filter((d) => d.type === "CITY" || d.type === "AREA");

    // Build nested tree structure
    const tree = countries.map((country) => {
      const countryStates = states.filter(
        (s) =>
          String(s.countryId) === String(country._id) ||
          s.countrySlug === country.slug ||
          s.countryName?.toLowerCase() === country.name.toLowerCase()
      );

      const nestedStates = countryStates.map((st) => {
        const stateCities = cities.filter(
          (c) =>
            String(c.stateId) === String(st._id) ||
            c.stateSlug === st.slug ||
            c.stateName?.toLowerCase() === st.name.toLowerCase()
        );
        return {
          ...st,
          cities: stateCities,
        };
      });

      return {
        ...country,
        states: nestedStates,
      };
    });

    return NextResponse.json({
      success: true,
      tree,
      countries,
      states,
      cities,
      total: allDests.length,
    });
  } catch (error) {
    console.error("[Destinations Hierarchy GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch destination hierarchy" }, { status: 500 });
  }
}
