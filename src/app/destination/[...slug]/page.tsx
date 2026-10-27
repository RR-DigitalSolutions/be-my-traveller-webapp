import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";
import DestinationCardCarousel from "@/components/destinations/DestinationCardCarousel";
import DestinationPackageGrid from "@/components/destinations/DestinationPackageGrid";
import DestinationReviewsCarousel from "@/components/destinations/DestinationReviewsCarousel";
import DestinationOverviewStory from "@/components/destinations/DestinationOverviewStory";
import connectDB from "@/lib/db/mongoose";
import {
  parseDestinationSlug,
  buildDestinationUrl,
  stripPackageSuffix,
  PLACE_TO_STATE_MAP,
  STATE_SLUG_MAP,
} from "@/lib/destinations/slug-resolver";
import { Types } from "mongoose";
import { HolidayThemeModel, DEFAULT_HOLIDAY_THEMES } from "@/domains/cms/holiday-theme.model";

interface DestinationRouteProps {
  params: Promise<{ slug: string[] }>;
}

// ── Dynamic SEO Metadata Generator ──
export async function generateMetadata({ params }: DestinationRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseDestinationSlug(slug);

  const formattedTarget = parsed.cleanTargetSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Try DB lookup for custom SEO
  let customSeo: any = null;
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (db) {
      const dest = await db.collection("destinations").findOne({
        $or: [
          { slug: parsed.cleanTargetSlug },
          { slug: `${parsed.cleanTargetSlug}-tour-packages` },
          { name: { $regex: new RegExp(`^${parsed.cleanTargetSlug.replace(/-/g, " ")}$`, "i") } },
        ],
      });
      if (dest?.seo) {
        customSeo = dest.seo;
      }
    }
  } catch {
    // fallback gracefully
  }

  const title =
    customSeo?.metaTitle ||
    `${formattedTarget} Tour Packages | Best Handcrafted Itineraries & Deals - Be My Traveller`;

  const description =
    customSeo?.metaDescription ||
    `Book custom ${formattedTarget} tour packages with verified 4★/5★ hotels, private sanitized cabs, daily breakfast & dinner, guided sightseeing, and 24/7 on-trip assistance. 100% customizable holidays.`;

  const keywordsList = customSeo?.keywords
    ? String(customSeo.keywords).split(",").map((s: string) => s.trim())
    : [
        `${formattedTarget.toLowerCase()} tour packages`,
        `${formattedTarget.toLowerCase()} holiday packages`,
        `${formattedTarget.toLowerCase()} honeymoon packages`,
        `${formattedTarget.toLowerCase()} family tour`,
        `best ${formattedTarget.toLowerCase()} travel deals`,
        `be my traveller ${formattedTarget.toLowerCase()}`,
      ];

  return {
    title,
    description,
    keywords: keywordsList,
    openGraph: {
      title,
      description,
      url: `https://www.bemytraveller.com${parsed.canonicalUrl}`,
      siteName: "Be My Traveller",
      locale: "en_IN",
      type: "website",
    },
    alternates: {
      canonical: `https://www.bemytraveller.com${parsed.canonicalUrl}`,
    },
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DestinationPage({ params }: DestinationRouteProps) {
  const { slug } = await params;
  const parsed = parseDestinationSlug(slug);

  const rawTargetSlug = parsed.cleanTargetSlug.toLowerCase();

  // 1. Connect and Fetch from MongoDB Collections
  let dbDest: any = null;
  let dbChildDestinations: any[] = [];
  let dbPackages: any[] = [];
  let dbAttractions: any[] = [];
  let dbActivities: any[] = [];
  let dbThemes: any[] = [];
  let targetSlug = rawTargetSlug;

  // Initial fallback hierarchy guess
  let isCountryLevel =
    parsed.level === "COUNTRY" ||
    rawTargetSlug === "india" ||
    rawTargetSlug === "all-india" ||
    parsed.cleanTargetSlug === "india";

  let isStateLevel =
    !isCountryLevel &&
    (parsed.level === "STATE" ||
      (STATE_SLUG_MAP[rawTargetSlug] !== undefined && parsed.rawSegments.length <= 2));

  let isCityLevel = !isCountryLevel && !isStateLevel;

  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (db) {
      // Find destination document for THIS specific target with comprehensive alias support
      const targetSlugVariants = Array.from(
        new Set([
          rawTargetSlug,
          `${rawTargetSlug}-tour-packages`,
          `${rawTargetSlug}-packages`,
          `${rawTargetSlug}-tours`,
          `${rawTargetSlug}-pradesh`,
          rawTargetSlug.replace(/-pradesh$/, ""),
          STATE_SLUG_MAP[rawTargetSlug],
          rawTargetSlug === "kashmir" ? "jammu-kashmir" : null,
          rawTargetSlug === "jammu-kashmir" ? "kashmir" : null,
          rawTargetSlug === "himachal" ? "himachal-pradesh" : null,
          rawTargetSlug === "himachal-pradesh" ? "himachal" : null,
          rawTargetSlug === "jimcorbett" ? "jim-corbett" : null,
          rawTargetSlug === "jim-corbett" ? "jimcorbett" : null,
          rawTargetSlug === "calangute" ? "baga-and-calangute" : null,
          rawTargetSlug === "baga" ? "baga-and-calangute" : null,
        ].filter(Boolean) as string[])
      );

      dbDest = await db.collection("destinations").findOne({
        $or: [
          { slug: { $in: targetSlugVariants } },
          { slug: new RegExp(`^${rawTargetSlug.replace(/-/g, "[- ]?")}$`, "i") },
          { name: { $regex: new RegExp(`^${rawTargetSlug.replace(/-/g, " ")}$`, "i") } },
          { name: { $regex: new RegExp(rawTargetSlug.replace(/-/g, " "), "i") } },
        ],
      });

      // If DB destination is found, override hierarchy level according to admin setting
      if (dbDest?.type) {
        if (dbDest.type === "COUNTRY" || rawTargetSlug === "india" || rawTargetSlug === "all-india") {
          isCountryLevel = true;
          isStateLevel = false;
          isCityLevel = false;
        } else if (dbDest.type === "STATE" || dbDest.type === "UNION_TERRITORY") {
          isStateLevel = true;
          isCountryLevel = false;
          isCityLevel = false;
        } else if (dbDest.type === "CITY" || dbDest.type === "AREA" || dbDest.type === "ISLAND") {
          isCityLevel = true;
          isCountryLevel = false;
          isStateLevel = false;
        }
      }

      targetSlug = (dbDest?.slug || rawTargetSlug).toLowerCase();
      const parentId = dbDest?._id;

      // ── Hierarchy Level 1: COUNTRY (India) -> Fetch States/UTs ──
      if (isCountryLevel) {
        dbChildDestinations = await db
          .collection("destinations")
          .find({
            type: { $in: ["STATE", "UNION_TERRITORY", "ISLAND"] },
            slug: { $nin: ["india", "all-india", "world", "international"] },
            status: { $ne: "DRAFT" },
          })
          .sort({ displayOrder: 1, sortOrder: 1, name: 1 })
          .toArray();
      }
      // ── Hierarchy Level 2: STATE -> Fetch Cities belonging to this State ──
      else if (isStateLevel) {
        const stateSlugs = Array.from(
          new Set(
            [
              targetSlug,
              rawTargetSlug,
              STATE_SLUG_MAP[targetSlug],
              STATE_SLUG_MAP[rawTargetSlug],
              targetSlug.replace(/-pradesh$/, ""),
              `${targetSlug}-pradesh`,
              dbDest?.slug,
              dbDest?.stateSlug,
            ].filter(Boolean) as string[]
          )
        );

        const stateIds: any[] = [];
        if (parentId) {
          stateIds.push(parentId);
          stateIds.push(String(parentId));
          if (Types.ObjectId.isValid(String(parentId))) {
            stateIds.push(new Types.ObjectId(String(parentId)));
          }
        }

        const stateCleanName = (dbDest?.name || targetSlug)
          .replace(/-/g, " ")
          .replace(/ (pradesh|backwaters|coastal|paradise)$/i, "");

        dbChildDestinations = await db
          .collection("destinations")
          .find({
            type: { $in: ["CITY", "AREA", "ISLAND"] },
            ...(parentId ? { _id: { $ne: parentId } } : {}),
            $or: [
              ...(stateIds.length > 0 ? [{ stateId: { $in: stateIds } }] : []),
              { stateSlug: { $in: stateSlugs } },
              { stateName: { $regex: new RegExp(`^${stateCleanName}`, "i") } },
            ],
            status: { $ne: "DRAFT" },
          })
          .sort({ displayOrder: 1, sortOrder: 1, name: 1 })
          .toArray();
      }
      // ── Hierarchy Level 3: CITY -> Fetch Sibling Cities in the same State ──
      else {
        const rawParentState =
          dbDest?.stateSlug ||
          parsed.stateSlug ||
          PLACE_TO_STATE_MAP[rawTargetSlug]?.stateSlug ||
          PLACE_TO_STATE_MAP[targetSlug]?.stateSlug ||
          "";

        const stateSlugs = Array.from(
          new Set(
            [
              rawParentState,
              STATE_SLUG_MAP[rawParentState],
              rawParentState.replace(/-pradesh$/, ""),
              `${rawParentState}-pradesh`,
              dbDest?.stateSlug,
            ].filter(Boolean) as string[]
          )
        );

        const stateIds: any[] = [];
        const rawStateId = dbDest?.stateId;
        if (rawStateId) {
          stateIds.push(rawStateId);
          stateIds.push(String(rawStateId));
          if (Types.ObjectId.isValid(String(rawStateId))) {
            stateIds.push(new Types.ObjectId(String(rawStateId)));
          }
        }

        const stateCleanName = (dbDest?.stateName || rawParentState)
          .replace(/-/g, " ")
          .replace(/ (pradesh|backwaters|coastal|paradise)$/i, "");

        dbChildDestinations = await db
          .collection("destinations")
          .find({
            type: { $in: ["CITY", "AREA", "ISLAND"] },
            slug: { $nin: [targetSlug, rawTargetSlug, `${targetSlug}-tour-packages`] },
            ...(parentId ? { _id: { $ne: parentId } } : {}),
            ...(stateSlugs.length > 0 || stateIds.length > 0
              ? {
                  $or: [
                    ...(stateIds.length > 0 ? [{ stateId: { $in: stateIds } }] : []),
                    { stateSlug: { $in: stateSlugs } },
                    { stateName: { $regex: new RegExp(`^${stateCleanName}`, "i") } },
                  ],
                }
              : {}),
            status: { $ne: "DRAFT" },
          })
          .sort({ displayOrder: 1, sortOrder: 1, name: 1 })
          .toArray();
      }

      // ── Query Packages strictly matching THIS destination ──
      if (isCountryLevel) {
        // Collect all Indian state and city slugs from destinations collection
        const indianDests = await db
          .collection("destinations")
          .find({
            $or: [
              { countrySlug: "india" },
              { parentCountry: { $regex: /^india/i } },
              { type: { $in: ["STATE", "UNION_TERRITORY", "CITY", "AREA", "ISLAND"] } },
            ],
            slug: {
              $nin: [
                "dubai",
                "bali",
                "thailand",
                "singapore",
                "vietnam",
                "maldives",
                "switzerland",
                "france",
                "italy",
                "uk",
                "central-europe",
                "australia",
                "mauritius",
              ],
            },
          })
          .toArray();

        const indianDestIds = indianDests.map((d) => d._id);
        const indianDestIdStrs = indianDests.map((d) => String(d._id));
        const indianSlugs = indianDests.map((d) => d.slug);

        const intlDests = await db
          .collection("destinations")
          .find({
            $or: [
              {
                slug: {
                  $in: [
                    "dubai",
                    "bali",
                    "thailand",
                    "singapore",
                    "vietnam",
                    "maldives",
                    "switzerland",
                    "france",
                    "italy",
                    "uk",
                    "central-europe",
                    "australia",
                    "mauritius",
                  ],
                },
              },
              { type: "COUNTRY", slug: { $ne: "india" } },
            ],
          })
          .toArray();

        const intlDestIds = intlDests.map((d) => d._id);
        const intlDestIdStrs = intlDests.map((d) => String(d._id));
        const intlSlugs = intlDests.map((d) => d.slug);

        dbPackages = await db
          .collection("packages")
          .find({
            $and: [
              {
                $or: [
                  { countries: { $in: ["india", "India", "all-india"] } },
                  { countrySlug: "india" },
                  { country: { $regex: /india/i } },
                  { destinationId: { $in: [...indianDestIds, ...indianDestIdStrs] } },
                  { destinations: { $in: [...indianDestIds, ...indianDestIdStrs, ...indianSlugs] } },
                  { stateSlug: { $in: indianSlugs } },
                  { states: { $in: indianSlugs } },
                  { cities: { $in: indianSlugs } },
                  { citySlug: { $in: indianSlugs } },
                ],
              },
              {
                destinationId: { $nin: [...intlDestIds, ...intlDestIdStrs] },
                destinations: { $nin: [...intlDestIds, ...intlDestIdStrs, ...intlSlugs] },
                countries: { $nin: intlSlugs },
                slug: { $not: /dubai|bali|thailand|singapore|vietnam|maldives|switzerland|france|italy|europe/i },
                status: { $ne: "DRAFT" },
              },
            ],
          })
          .toArray();
      } else if (isStateLevel) {
        // Collect child cities of this state from destinations collection
        const stateChildCities = dbChildDestinations.map((c) => c.slug);
        const stateChildIds = dbChildDestinations.map((c) => c._id);
        const stateChildIdStrs = dbChildDestinations.map((c) => String(c._id));

        const targetSlug = (dbDest?.slug || rawTargetSlug).toLowerCase();
        const stateSearchSlugs = Array.from(
          new Set(
            [
              targetSlug,
              rawTargetSlug,
              dbDest?.slug,
              dbDest?.stateSlug,
              STATE_SLUG_MAP[targetSlug],
              STATE_SLUG_MAP[rawTargetSlug],
              targetSlug === "jammu-kashmir" ? "kashmir" : null,
              targetSlug === "kashmir" ? "jammu-kashmir" : null,
              targetSlug === "himachal-pradesh" ? "himachal" : null,
              targetSlug === "himachal" ? "himachal-pradesh" : null,
            ].filter(Boolean) as string[]
          )
        );

        const stateCleanTitle = (dbDest?.name || targetSlug).replace(/-/g, " ");

        const statePkgOr: any[] = [
          { stateSlug: { $in: stateSearchSlugs } },
          { states: { $in: stateSearchSlugs } },
          { state: { $regex: new RegExp(stateCleanTitle, "i") } },
          { "destinations.slug": { $in: [...stateSearchSlugs, ...stateChildCities] } },
          {
            destinations: {
              $in: [
                ...stateSearchSlugs,
                ...stateChildCities,
                ...(parentId ? [parentId, String(parentId)] : []),
                ...stateChildIds,
                ...stateChildIdStrs,
              ],
            },
          },
          { citySlug: { $in: stateChildCities } },
          { cities: { $in: stateChildCities } },
          { name: { $regex: new RegExp(stateCleanTitle, "i") } },
          { title: { $regex: new RegExp(stateCleanTitle, "i") } },
          { tagline: { $regex: new RegExp(stateCleanTitle, "i") } },
          { route: { $regex: new RegExp(stateCleanTitle, "i") } },
        ];

        if (parentId) {
          statePkgOr.push({ destinationId: parentId }, { destinationId: String(parentId) });
        }

        dbPackages = await db
          .collection("packages")
          .find({
            $and: [{ $or: statePkgOr }, { status: { $ne: "DRAFT" } }],
          })
          .toArray();
      } else {
        // City Level
        const targetSlug = (dbDest?.slug || rawTargetSlug).toLowerCase();
        const citySearchSlugs = Array.from(
          new Set([targetSlug, rawTargetSlug, dbDest?.slug, parsed.placeSlug].filter(Boolean) as string[])
        );

        const cityCleanTitle = (dbDest?.name || targetSlug).replace(/-/g, " ");

        const cityPkgOr: any[] = [
          { citySlug: { $in: citySearchSlugs } },
          { cities: { $in: citySearchSlugs } },
          { "destinations.slug": { $in: citySearchSlugs } },
          { destinations: { $in: [...citySearchSlugs, ...(parentId ? [parentId, String(parentId)] : [])] } },
          { name: { $regex: new RegExp(cityCleanTitle, "i") } },
          { title: { $regex: new RegExp(cityCleanTitle, "i") } },
          { tagline: { $regex: new RegExp(cityCleanTitle, "i") } },
          { route: { $regex: new RegExp(cityCleanTitle, "i") } },
        ];

        if (parentId) {
          cityPkgOr.push({ destinationId: parentId }, { destinationId: String(parentId) });
        }

        dbPackages = await db
          .collection("packages")
          .find({
            $and: [{ $or: cityPkgOr }, { status: { $ne: "DRAFT" } }],
          })
          .toArray();
      }

      // ── Query Attractions from Attractions Collection (/admin/content/attractions) ──
      const attractionQueryOr: any[] = [
        { destinationSlug: { $in: targetSlugVariants } },
        { destinationName: { $regex: new RegExp(`^${(dbDest?.name || targetSlug).replace(/-/g, " ")}$`, "i") } },
      ];
      if (parentId) {
        attractionQueryOr.push(
          { destinationId: parentId },
          { destination: parentId },
          { destinationId: String(parentId) }
        );
      }
      if (isStateLevel) {
        attractionQueryOr.push(
          { stateSlug: targetSlug },
          { stateName: { $regex: new RegExp(`^${(dbDest?.name || targetSlug).replace(/-/g, " ")}$`, "i") } }
        );
      }

      dbAttractions = await db
        .collection("attractions")
        .find({
          $or: attractionQueryOr,
          status: { $ne: "DRAFT" },
        })
        .sort({ displayOrder: 1, sortOrder: 1, _id: -1 })
        .toArray();

      // ── Query Activities from Activities Collection (/admin/content/activities) ──
      const activityQueryOr: any[] = [
        { destinationSlug: { $in: targetSlugVariants } },
        { destinationName: { $regex: new RegExp(`^${(dbDest?.name || targetSlug).replace(/-/g, " ")}$`, "i") } },
        { destination: { $regex: new RegExp(`^${(dbDest?.name || targetSlug).replace(/-/g, " ")}$`, "i") } },
      ];
      if (parentId) {
        activityQueryOr.push(
          { destinationId: parentId },
          { destinations: parentId },
          { destinationId: String(parentId) }
        );
      }

      dbActivities = await db
        .collection("activities")
        .find({
          $or: activityQueryOr,
          status: { $ne: "INACTIVE" },
        })
        .sort({ createdAt: -1 })
        .toArray();

      // ── Query Active Themes for Destination Theme Filters ──
      try {
        dbThemes = await HolidayThemeModel.find({ isActive: true })
          .sort({ sortOrder: 1, label: 1 })
          .lean();
        if (!dbThemes || dbThemes.length === 0) {
          dbThemes = [...DEFAULT_HOLIDAY_THEMES];
        }
      } catch {
        dbThemes = [...DEFAULT_HOLIDAY_THEMES];
      }
    }
  } catch (err) {
    console.error("DB Query error on destination page:", err);
  }

  if (!dbThemes || dbThemes.length === 0) {
    dbThemes = [...DEFAULT_HOLIDAY_THEMES];
  }

  // 2. Resolve Current Destination Info from Database without hardcoded fallbacks
  const parentCountry = dbDest?.parentCountry || dbDest?.countryName || "India";
  const parentCountrySlug = (dbDest?.countrySlug || "india").toLowerCase();

  let resolvedStateName = "";
  let resolvedStateSlug = "";

  if (isCountryLevel) {
    resolvedStateName = "";
    resolvedStateSlug = "";
  } else if (isStateLevel) {
    resolvedStateName = dbDest?.name || targetSlug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    resolvedStateSlug = dbDest?.slug || targetSlug;
  } else {
    // City Level
    resolvedStateName =
      dbDest?.stateName ||
      PLACE_TO_STATE_MAP[rawTargetSlug]?.stateName ||
      PLACE_TO_STATE_MAP[targetSlug]?.stateName ||
      "";
    resolvedStateSlug =
      dbDest?.stateSlug ||
      PLACE_TO_STATE_MAP[rawTargetSlug]?.stateSlug ||
      PLACE_TO_STATE_MAP[targetSlug]?.stateSlug ||
      "";
  }

  const currentName =
    dbDest?.name ||
    targetSlug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  // 3. Map Child Places with Consistent URLs & Hierarchy
  const mappedDbChildPlaces = dbChildDestinations.map((d: any) => {
    let cardUrl = "/destination/india-tour-packages";
    if (isCountryLevel) {
      cardUrl = buildDestinationUrl({ country: "india", state: d.slug });
    } else {
      cardUrl = buildDestinationUrl({
        country: "india",
        state: d.stateSlug || resolvedStateSlug,
        place: d.slug,
      });
    }

    return {
      name: d.name,
      slug: d.slug,
      url: cardUrl,
      stateSlug: d.stateSlug || resolvedStateSlug,
      count: `${d.displayOrder ? d.displayOrder + 4 : 8} Tours`,
      img: d.coverImageStr || d.coverImage || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80",
      price: (typeof d.startingPrice === "string" && d.startingPrice.trim()) ? d.startingPrice.trim() : (d.fastFacts?.startingPrice || "₹14,999"),
      tag: d.tagline || d.region || (isCountryLevel ? "State of India" : "Scenic Spot"),
    };
  });

  // 4. Attractions Resolution: 100% Dynamic from DB collection (/admin/content/attractions)
  const resolvedAttractions = dbAttractions.map((a: any) => ({
    name: a.name,
    slug: a.slug || a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    destinationSlug: a.destinationSlug || targetSlug,
    desc: a.desc || a.shortDescription || "Iconic sightseeing landmark and scenic traveller viewpoint.",
    img: a.img || dbDest?.coverImageStr || dbDest?.coverImage || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80",
    category: a.category || "Sightseeing",
    entryFee: a.entryFee || "Free",
    timing: a.timing || "Open Daily",
    idealDuration: a.idealDuration || "2 to 3 Hours",
  }));

  // 5. Packages Resolution: 100% Dynamic from DB collection (/admin/products/packages)
  const resolvedPackages = dbPackages.map((p: any) => {
    const rawPrice = p.price ?? (p.startingPrice ? `₹${Number(p.startingPrice).toLocaleString("en-IN")}` : "₹14,999");
    const formattedPrice = typeof rawPrice === "number" ? `₹${rawPrice.toLocaleString("en-IN")}` : String(rawPrice);

    const rawOrig = p.originalPrice ?? (p.startingPrice ? `₹${Math.round(Number(p.startingPrice) * 1.3).toLocaleString("en-IN")}` : "₹19,499");
    const formattedOrig = typeof rawOrig === "number" ? `₹${rawOrig.toLocaleString("en-IN")}` : String(rawOrig);

    let formattedNights = "5 Nights / 6 Days";
    if (typeof p.nights === "string" && p.nights.trim()) {
      formattedNights = p.nights.includes("Night") ? p.nights : `${p.nights} Nights / ${p.days || 6} Days`;
    } else if (typeof p.nights === "number") {
      formattedNights = `${p.nights} Nights / ${p.days || p.nights + 1} Days`;
    }

    return {
      slug: p.slug,
      title: p.title || p.name,
      route: p.route || p.tagline || formattedNights,
      nights: formattedNights,
      price: formattedPrice,
      originalPrice: formattedOrig,
      rating: p.rating || 4.9,
      reviews: p.reviews || 140,
      img: p.coverImage || p.coverImageStr || dbDest?.coverImageStr || dbDest?.coverImage || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80",
      inclusions: p.inclusions || ["4★ Hotel Stays", "Private AC Cab", "Daily Breakfast & Dinner"],
    };
  });

  // 6. Activities Resolution: 100% Dynamic from Activities collection (/admin/content/activities)
  const resolvedActivities = dbActivities.map((act: any) => ({
    _id: act._id?.toString(),
    name: act.name,
    category: act.category || "Adventure & Experience",
    duration: act.duration || "3 Hours",
    adultPrice: act.adultPrice || 1500,
    childPrice: act.childPrice,
    img: act.img || dbDest?.coverImageStr || dbDest?.coverImage || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80",
    desc: act.desc || act.shortDescription || "Thrilling outdoor activity with certified instructors and gear.",
    inclusions: Array.isArray(act.inclusions) ? act.inclusions : act.inclusions ? String(act.inclusions).split(",") : [],
    destinationName: act.destinationName || act.destination || currentName,
  }));

  const current = {
    name: currentName,
    type: dbDest?.type || (isCountryLevel ? "COUNTRY" : isStateLevel ? "STATE" : "CITY"),
    countryName: parentCountry,
    stateName: resolvedStateName,
    stateSlug: resolvedStateSlug,
    childPlaces: mappedDbChildPlaces,
    attractions: resolvedAttractions,
    packages: resolvedPackages,
    activities: resolvedActivities,
    tagline:
      dbDest?.tagline ||
      `Best Handcrafted Tour Packages & Curated Itineraries in ${currentName}`,
    heroImg:
      dbDest?.coverImageStr ||
      dbDest?.coverImage ||
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1600&auto=format&fit=crop&q=80",
    overview:
      dbDest?.shortDescription ||
      dbDest?.overview ||
      `Explore extraordinary experiential travel packages, verified 4-star stays, and private chauffeured tours in ${currentName}.`,
    startingPrice: (typeof dbDest?.startingPrice === "string" && dbDest.startingPrice.trim())
      ? dbDest.startingPrice.trim()
      : (dbDest?.fastFacts?.startingPrice || "₹14,999"),
    idealDuration: (typeof dbDest?.idealDuration === "string" && dbDest.idealDuration.trim())
      ? dbDest.idealDuration.trim()
      : (dbDest?.fastFacts?.idealDuration || "4 to 6 Days"),
    bestTime: (typeof dbDest?.bestTimeToVisit === "string" && dbDest.bestTimeToVisit.trim())
      ? dbDest.bestTimeToVisit.trim()
      : (dbDest?.fastFacts?.bestTime || (typeof dbDest?.bestTimeToVisit === "object" ? dbDest.bestTimeToVisit?.summary : "") || "Year-Round"),
    weather: (typeof dbDest?.weather === "string" && dbDest.weather.trim())
      ? dbDest.weather.trim()
      : (dbDest?.fastFacts?.weather || ""),
    howToReach: (typeof dbDest?.howToReach === "string" && dbDest.howToReach.trim())
      ? dbDest.howToReach.trim()
      : (dbDest?.fastFacts?.howToReach || ""),
    verifiedStays: (typeof dbDest?.verifiedStays === "string" && dbDest.verifiedStays.trim())
      ? dbDest.verifiedStays.trim()
      : (dbDest?.fastFacts?.verifiedStays || "4★ / 5★ Handpicked Stays"),
    highlights: dbDest?.highlights || [],
    faqs:
      dbDest?.faqs && dbDest.faqs.length > 0
        ? dbDest.faqs
        : [
            {
              q: `How can I customize my tour package for ${currentName}?`,
              a: `Every holiday with Be My Traveller is 100% customizable. You can request hotel upgrades, change vehicle types, adjust trip duration, and add specific sightseeing spots.`,
            },
            {
              q: `What is included in the ${currentName} tour package?`,
              a: `Our standard packages include verified 4★/5★ hotel stays, daily breakfast & dinner, dedicated private sanitized vehicle with driver, sightseeing permits, and 24/7 on-trip concierge assistance.`,
            },
          ],
  };

  // 7. Carousel Titles based on hierarchy level
  const carouselTitle = isCountryLevel
    ? "Explore States & Regions of India"
    : isStateLevel
    ? `Popular Places to Visit in ${current.name}`
    : `Explore More Places in ${current.stateName}`;

  const carouselSubtitle = isCountryLevel
    ? "Browse handpicked holiday circuits across North, South, East & West India"
    : isStateLevel
    ? `Discover iconic hill stations, serene lakes & valleys in ${current.name}`
    : `Other popular travel destinations near ${current.name} in ${current.stateName}`;

  const carouselBadge = isCountryLevel
    ? "States & Territories"
    : isStateLevel
    ? "Destinations & Cities"
    : "Similar Places";

  // 8. Build Rich JSON-LD Schemas (SEO, AEO, AIO, GEO)
  const canonicalUrl = `https://www.bemytraveller.com${parsed.canonicalUrl}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristDestination",
        "@id": `${canonicalUrl}#destination`,
        "name": `${current.name} Travel & Tour Packages`,
        "description": current.overview,
        "url": canonicalUrl,
        "touristType": ["Family", "Couples", "Honeymoon", "Adventure", "Solo"],
        ...(current.childPlaces.length > 0 && {
          "containsPlace": current.childPlaces.map((cp) => ({
            "@type": "TouristDestination",
            "name": cp.name,
            "url": `https://www.bemytraveller.com${cp.url}`,
          })),
        }),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.bemytraveller.com",
          },
          ...(isCountryLevel
            ? [
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": `${current.name} Tours`,
                  "item": canonicalUrl,
                },
              ]
            : [
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": parentCountry === "India" ? "India Tours" : `${parentCountry} Tours`,
                  "item": `https://www.bemytraveller.com${buildDestinationUrl({ country: parentCountrySlug })}`,
                },
                ...(isCityLevel && current.stateName && current.name !== current.stateName
                  ? [
                      {
                        "@type": "ListItem",
                        "position": 3,
                        "name": current.stateName,
                        "item": `https://www.bemytraveller.com${buildDestinationUrl({ country: parentCountrySlug, state: current.stateSlug })}`,
                      },
                      {
                        "@type": "ListItem",
                        "position": 4,
                        "name": current.name,
                        "item": canonicalUrl,
                      },
                    ]
                  : [
                      {
                        "@type": "ListItem",
                        "position": 3,
                        "name": current.name,
                        "item": canonicalUrl,
                      },
                    ]),
              ]),
        ],
      },
      ...(current.attractions.length > 0
        ? [
            {
              "@type": "ItemList",
              "@id": `${canonicalUrl}#attractions`,
              "name": `Top Attractions in ${current.name}`,
              "itemListElement": current.attractions.map((att: any, idx: number) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "name": att.name,
                "description": att.desc,
              })),
            },
          ]
        : []),
      ...(current.activities.length > 0
        ? [
            {
              "@type": "ItemList",
              "@id": `${canonicalUrl}#activities`,
              "name": `Top Activities in ${current.name}`,
              "itemListElement": current.activities.map((act: any, idx: number) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "name": act.name,
                "description": act.desc,
              })),
            },
          ]
        : []),
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "mainEntity": current.faqs.map((faq: any) => ({
          "@type": "Question",
          "name": faq.q || faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a || faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-amber-500 selection:text-slate-950 pb-16 lg:pb-0">
      {/* ── JSON-LD Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Top Navigation Bar ── */}
      <BmtNavMenu />

      {/* ── Hero Header ── */}
      <section className="relative -mt-[96px] pt-[112px] pb-10 min-h-[460px] sm:min-h-[520px] text-white flex items-end overflow-hidden">
        <img
          src={current.heroImg}
          alt={`${current.name} Tour Packages`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10 relative z-10 w-full space-y-3">
          {/* SEO Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs text-amber-300 font-bold drop-shadow-sm">
            <Link href="/" className="hover:underline text-slate-200 hover:text-white">Home</Link>
            <span className="text-slate-400">›</span>
            {isCountryLevel ? (
              <span className="text-amber-300">{current.name} Tours</span>
            ) : (
              <>
                <Link
                  href={buildDestinationUrl({ country: parentCountrySlug })}
                  className="hover:underline text-slate-200 hover:text-white"
                >
                  {parentCountry === "India" ? "India Tours" : `${parentCountry} Tours`}
                </Link>
                {isCityLevel && current.stateName && current.name !== current.stateName && (
                  <>
                    <span className="text-slate-400">›</span>
                    <Link
                      href={buildDestinationUrl({ country: parentCountrySlug, state: current.stateSlug })}
                      className="text-slate-200 hover:text-white hover:underline"
                    >
                      {current.stateName}
                    </Link>
                  </>
                )}
                <span className="text-slate-400">›</span>
                <span className="text-amber-300">{current.name}</span>
              </>
            )}
          </nav>

          {/* Trust Badges */}
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-xs flex items-center gap-1">
              ⭐ 4.9/5 (1,240+ Verified Reviews)
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
              ✓ 100% Tailor-Made
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-xs">
              🚗 Dedicated Private Cab
            </span>
          </div>

          {/* Single H1 for Best SEO / SERP Ranking */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            Best {current.name} Tour Packages
          </h1>
          <p className="text-sm sm:text-base text-white/95 max-w-3xl font-medium drop-shadow-sm">
            {current.tagline}
          </p>
        </div>
      </section>

      {/* ── Fast Facts Bar ── */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 text-xs shadow-xs">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Starting From</span>
            <span className="text-amber-600 font-extrabold text-sm">{current.startingPrice} <span className="text-[10px] font-normal text-slate-500">/ person</span></span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Ideal Duration</span>
            <span className="text-slate-900 font-bold text-xs">{current.idealDuration}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Best Time to Visit</span>
            <span className="text-slate-900 font-bold text-xs">{current.bestTime}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Verified Stays</span>
            <span className="text-emerald-600 font-bold text-xs">{current.verifiedStays}</span>
          </div>
        </div>
      </div>

      {/* ── Main Body ── */}
      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left 2 Columns: Tour Packages (#1), Destination Carousel (#2), Overview (#3), Attractions (#4), Activities (#5), FAQs (#6) */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── 1. TOUR PACKAGES GRID ── */}
            {/* ── Theme Filter Pills (SEO: targets Destination + Theme compound keywords) ── */}
            {dbThemes.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-amber-600 tracking-wider">Browse by Trip Type</span>
                    <h2 className="text-sm font-black text-slate-900 mt-0.5">{current.name} Tour Packages by Theme</h2>
                  </div>
                  <Link
                    href="/themes"
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline"
                  >
                    All Themes →
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dbThemes.map((theme: any) => (
                    <Link
                      key={theme.slug}
                      href={`/themes/${theme.slug}?destination=${encodeURIComponent(current.name)}`}
                      title={`${current.name} ${theme.label} Tour Packages`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold bg-slate-100 hover:bg-amber-500 text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-amber-500 transition-all"
                    >
                      {theme.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {current.packages.length > 0 ? (
              <DestinationPackageGrid
                destinationName={current.name}
                packages={current.packages}
              />
            ) : (
              <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-center">
                <span className="text-4xl">🏔️</span>
                <h3 className="text-xl font-black text-slate-900">
                  Custom Handcrafted {current.name} Itineraries
                </h3>
                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Every holiday in {current.name} is bespoke. We arrange verified luxury resorts, private sanitized cabs, local permits, and 24/7 concierge assistance customized to your travel dates.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    href={`/customize?destination=${encodeURIComponent(current.name)}`}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Build Custom Itinerary →
                  </Link>
                  <a
                    href={`https://wa.me/918091638090?text=${encodeURIComponent(`Hi Be My Traveller, I would like to plan a custom trip to ${current.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>💬</span> Chat with {current.name} Specialist
                  </a>
                </div>
              </div>
            )}

            {/* ── 2. DESTINATION / PLACES CAROUSEL ── */}
            {current.childPlaces && current.childPlaces.length > 0 && (
              <DestinationCardCarousel
                badge={carouselBadge}
                title={carouselTitle}
                subtitle={carouselSubtitle}
                items={current.childPlaces}
              />
            )}

            {/* ── 3. OVERVIEW & TRAVEL ESSENTIALS (with Read More / Read Less) ── */}
            <DestinationOverviewStory
              destinationName={current.name}
              story={current.overview}
              highlights={current.highlights}
              weather={current.weather}
              howToReach={current.howToReach}
            />

            {/* ── 4. ATTRACTIONS & SIGHTSEEING HIGHLIGHTS (from /admin/content/attractions) ── */}
            {current.attractions && current.attractions.length > 0 && (
              <section className="space-y-4">
                <div>
                  <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">Sightseeing Highlights</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                    Top Attraction Points in {current.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {current.attractions.map((att: any, idx: number) => (
                    <a
                      key={att.name || idx}
                      href={`/attraction/${att.destinationSlug || targetSlug}/${att.slug || att.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                        <img
                          src={att.img || current.heroImg || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80"}
                          alt={att.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {att.category && (
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-950/80 backdrop-blur-md text-amber-400 border border-slate-800">
                            {att.category}
                          </span>
                        )}
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-white">
                          Explore Guide ↗
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors flex items-center justify-between">
                            <span>{att.name}</span>
                            <span className="text-amber-500 text-xs">↗</span>
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-3">
                            {att.desc}
                          </p>
                        </div>

                        {(att.timing || att.entryFee) && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            {att.timing && <span>🕒 {att.timing}</span>}
                            {att.entryFee && <span className="font-bold text-amber-600">🎟️ {att.entryFee}</span>}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* ── 5. TOP ACTIVITIES & EXPERIENCES (from /admin/content/activities) ── */}
            {current.activities && current.activities.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">Things To Do</span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                      Top Activities &amp; Experiences in {current.name}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {current.activities.length} Available
                  </span>
                </div>

                {/* 3 cards per row in compact sizing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {current.activities.map((act: any) => (
                    <div
                      key={act._id || act.name}
                      className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="h-32 sm:h-36 w-full overflow-hidden bg-slate-100 relative">
                        <img
                          src={act.img || current.heroImg || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80"}
                          alt={act.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-950/80 backdrop-blur-md text-amber-400 border border-slate-800">
                            {act.category}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 backdrop-blur-md text-white">
                          ⏱️ {act.duration}
                        </div>
                      </div>

                      <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-amber-600 transition-colors line-clamp-1">
                            {act.name}
                          </h3>
                          <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 line-clamp-2">
                            {act.desc}
                          </p>

                          {act.inclusions && act.inclusions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {act.inclusions.slice(0, 2).map((inc: string, i: number) => (
                                <span key={i} className="text-[9px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                                  ✓ {inc.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Price</span>
                            <span className="text-xs sm:text-sm font-black text-amber-600">
                              ₹{Number(act.adultPrice).toLocaleString("en-IN")}{" "}
                              <span className="text-[9px] text-slate-500 font-normal">/ person</span>
                            </span>
                          </div>

                          <a
                            href={`https://wa.me/918091638090?text=${encodeURIComponent(`Hi Be My Traveller, I would like to book the activity: "${act.name}" in ${current.name}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-[11px] transition-all shadow-xs"
                          >
                            Book →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── 6. FREQUENTLY ASKED QUESTIONS (SEO / AEO) ── */}
            <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">Traveller Help</span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  Frequently Asked Questions about {current.name} Tours
                </h2>
              </div>

              <div className="space-y-3">
                {current.faqs.map((faq: any, idx: number) => (
                  <details
                    key={idx}
                    className="group bg-slate-50 rounded-xl p-4 border border-slate-200/80 open:bg-white open:border-amber-400/60 transition-all cursor-pointer"
                  >
                    <summary className="font-bold text-sm text-slate-900 list-none flex items-center justify-between">
                      <span>{faq.q || faq.question}</span>
                      <span className="text-amber-500 text-lg group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2 pt-2 border-t border-slate-100">
                      {faq.a || faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column: Sticky Trip Planner Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-4">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                Bespoke Trip Planner
              </span>

              <h3 className="text-xl font-black text-slate-900 leading-tight">
                Plan Your {current.name} Holiday
              </h3>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Travel Month</label>
                  <select className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800">
                    <option>October 2026</option>
                    <option>November 2026</option>
                    <option>December 2026</option>
                    <option>January 2027</option>
                    <option>February 2027</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Duration</label>
                    <select className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800">
                      <option>2N / 3D (Weekend Getaway)</option>
                      <option>3N / 4D (Short Break)</option>
                      <option>4N / 5D (Popular)</option>
                      <option>5N / 6D (Recommended)</option>
                      <option>6N / 7D (Extended Circuit)</option>
                      <option>7N+ Custom Itinerary</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Travellers</label>
                    <select className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800">
                      <option>2 Adults (Couple)</option>
                      <option>Family (3-4)</option>
                      <option>Group (5+)</option>
                      <option>Solo</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-bold uppercase text-[10px]">Estimated Starting</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded">
                      Includes Cab + Stays
                    </span>
                  </div>
                  <div className="text-xl font-black text-amber-600 mt-0.5">
                    {current.startingPrice} <span className="text-xs font-normal text-slate-600">/ person</span>
                  </div>
                </div>

                <Link
                  href={`/customize?destination=${encodeURIComponent(current.name)}`}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Get Instant Custom Quote →
                </Link>

                <a
                  href={`https://wa.me/918091638090?text=${encodeURIComponent(`Hi Be My Traveller, I would like to plan a custom holiday to ${current.name}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>💬</span> WhatsApp Travel Expert
                </a>

                <div className="text-[10px] text-slate-500 text-center space-y-1 pt-1">
                  <div>🔒 Zero booking fee · Instant callback within 15 mins</div>
                  <div>📞 24/7 Helpline: <strong>+91 8091638090</strong></div>
                </div>
              </div>
            </div>

            {/* Why Book With Us Banner */}
            <div className="bg-slate-950 p-6 rounded-2xl text-white space-y-3 shadow-lg">
              <h4 className="font-extrabold text-sm text-amber-400">Why Book with Be My Traveller?</h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>100% Tailor-made itineraries with private cabs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Verified 4★/5★ hotels with daily breakfast &amp; dinner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Dedicated 24/7 on-trip concierge manager</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Guaranteed best rate with zero hidden charges</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* ── 7. VERIFIED CUSTOMER REVIEWS CAROUSEL (Below FAQs & Why Book) ── */}
      <DestinationReviewsCarousel
        destinationName={current.name}
        destinationSlug={targetSlug}
        stateName={current.stateName}
      />

      {/* ── Mobile Native App-Style Sticky Bottom Booking Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2.5 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider leading-none">Starting From</span>
          <span className="text-base font-black text-amber-600 leading-tight">
            {current.startingPrice} <span className="text-[10px] font-normal text-slate-500">/ person</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/918091638090?text=${encodeURIComponent(`Hi Be My Traveller, I would like to plan a custom holiday to ${current.name}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all"
          >
            <span>💬</span> WhatsApp
          </a>

          <Link
            href={`/customize?destination=${encodeURIComponent(current.name)}`}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all whitespace-nowrap"
          >
            Custom Quote →
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <SiteFooter />
    </div>
  );
}
