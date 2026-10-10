import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";
import DestinationCardCarousel from "@/components/destinations/DestinationCardCarousel";
import DestinationPackageGrid from "@/components/destinations/DestinationPackageGrid";
import DestinationReviewsCarousel from "@/components/destinations/DestinationReviewsCarousel";
import connectDB from "@/lib/db/mongoose";
import {
  parseDestinationSlug,
  buildDestinationUrl,
  stripPackageSuffix,
  PLACE_TO_STATE_MAP,
  STATE_SLUG_MAP,
} from "@/lib/destinations/slug-resolver";
import { Types } from "mongoose";

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

  const targetSlug = parsed.cleanTargetSlug.toLowerCase();

  // Determine hierarchy level accurately
  const isCountryLevel =
    parsed.level === "COUNTRY" ||
    targetSlug === "india" ||
    targetSlug === "all-india" ||
    parsed.cleanTargetSlug === "india";

  const isStateLevel =
    !isCountryLevel &&
    (parsed.level === "STATE" ||
      (STATE_SLUG_MAP[targetSlug] !== undefined && parsed.rawSegments.length <= 2));

  const isCityLevel = !isCountryLevel && !isStateLevel;

  // 1. Connect and Fetch from MongoDB Collections
  let dbDest: any = null;
  let dbChildDestinations: any[] = [];
  let dbPackages: any[] = [];
  let dbAttractions: any[] = [];
  let dbActivities: any[] = [];

  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (db) {
      // Find destination document for THIS specific target
      const targetSlugVariants = [
        targetSlug,
        `${targetSlug}-tour-packages`,
        `${targetSlug}-packages`,
        `${targetSlug}-tours`,
        `${targetSlug}-pradesh`,
        targetSlug.replace(/-pradesh$/, ""),
      ];

      dbDest = await db.collection("destinations").findOne({
        $or: [
          { slug: { $in: targetSlugVariants } },
          { name: { $regex: new RegExp(`^${targetSlug.replace(/-/g, " ")}$`, "i") } },
        ],
      });

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
        dbChildDestinations = await db
          .collection("destinations")
          .find({
            type: { $in: ["CITY", "AREA"] },
            ...(parentId ? { _id: { $ne: parentId } } : {}),
            $or: [
              ...(parentId ? [{ stateId: parentId }] : []),
              { stateSlug: targetSlug },
              { stateName: { $regex: new RegExp(`^${(dbDest?.name || targetSlug).replace(/-/g, " ")}`, "i") } },
            ],
            status: { $ne: "DRAFT" },
          })
          .sort({ displayOrder: 1, sortOrder: 1, name: 1 })
          .toArray();
      }
      // ── Hierarchy Level 3: CITY -> Fetch Sibling Cities in the same State ──
      else {
        const parentStateSlug = parsed.stateSlug || dbDest?.stateSlug || "uttarakhand";
        dbChildDestinations = await db
          .collection("destinations")
          .find({
            type: { $in: ["CITY", "AREA"] },
            slug: { $nin: [targetSlug, `${targetSlug}-tour-packages`] },
            ...(parentId ? { _id: { $ne: parentId } } : {}),
            $or: [
              ...(dbDest?.stateId ? [{ stateId: dbDest.stateId }] : []),
              { stateSlug: parentStateSlug },
            ],
            status: { $ne: "DRAFT" },
          })
          .sort({ displayOrder: 1, sortOrder: 1, name: 1 })
          .toArray();
      }

      // ── Query Packages strictly matching THIS destination ──
      const packageSearchTerms = Array.from(
        new Set([
          targetSlug,
          targetSlug.replace(/-/g, " "),
          parsed.placeSlug,
        ].filter(Boolean) as string[])
      );

      const pkgQueryOr: any[] = [
        { "destinations.slug": { $in: packageSearchTerms } },
        { "citySlug": { $in: packageSearchTerms } },
        { "name": { $regex: new RegExp(targetSlug.replace(/-/g, " "), "i") } },
        { "title": { $regex: new RegExp(targetSlug.replace(/-/g, " "), "i") } },
        { "tagline": { $regex: new RegExp(targetSlug.replace(/-/g, " "), "i") } },
        { "route": { $regex: new RegExp(targetSlug.replace(/-/g, " "), "i") } },
      ];

      if (parentId) {
        pkgQueryOr.push(
          { destinationId: parentId },
          { destinations: parentId },
          { destinations: String(parentId) }
        );
      }

      if (isStateLevel) {
        pkgQueryOr.push(
          { stateSlug: targetSlug },
          { state: { $regex: new RegExp(targetSlug.replace(/-/g, " "), "i") } }
        );
      } else if (isCountryLevel) {
        pkgQueryOr.push(
          { countrySlug: "india" },
          { country: { $regex: /india/i } }
        );
      }

      dbPackages = await db.collection("packages").find({ $or: pkgQueryOr }).toArray();

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
    }
  } catch (err) {
    console.error("DB Query error on destination page:", err);
  }

  // 2. Resolve Current Destination Info from Database
  const stateInfo = PLACE_TO_STATE_MAP[targetSlug] || {
    stateSlug: parsed.stateSlug || dbDest?.stateSlug || "uttarakhand",
    stateName: dbDest?.stateName || "Uttarakhand",
  };

  const currentStateSlug = dbDest?.stateSlug || stateInfo.stateSlug || "uttarakhand";

  const currentName =
    dbDest?.name ||
    targetSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // 3. Map Child Places with Consistent URLs & Hierarchy
  const mappedDbChildPlaces = dbChildDestinations.map((d: any) => {
    let cardUrl = "/destination/india-tour-packages";
    if (isCountryLevel) {
      cardUrl = buildDestinationUrl({ country: "india", state: d.slug });
    } else {
      cardUrl = buildDestinationUrl({
        country: "india",
        state: d.stateSlug || currentStateSlug,
        place: d.slug,
      });
    }

    return {
      name: d.name,
      slug: d.slug,
      url: cardUrl,
      stateSlug: d.stateSlug || currentStateSlug,
      count: `${d.displayOrder ? d.displayOrder + 4 : 8} Tours`,
      img: d.coverImageStr || d.coverImage || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80",
      price: d.fastFacts?.startingPrice || d.startingPrice || "₹14,999",
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
  const resolvedPackages = dbPackages.map((p: any) => ({
    slug: p.slug,
    title: p.title || p.name,
    route: p.route || p.tagline || `${p.nights || 5}N Tour Package`,
    nights: p.nights ? `${p.nights} Nights / ${p.days || p.nights + 1} Days` : "5 Nights / 6 Days",
    price: p.price || `₹${Number(p.startingPrice || 14999).toLocaleString("en-IN")}`,
    originalPrice: p.originalPrice || `₹${Number((p.startingPrice || 14999) * 1.3).toLocaleString("en-IN")}`,
    rating: p.rating || 4.9,
    reviews: p.reviews || 140,
    img: p.coverImage || dbDest?.coverImageStr || dbDest?.coverImage || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80",
    inclusions: p.inclusions || ["4★ Hotel Stays", "Private AC Cab", "Daily Breakfast & Dinner"],
  }));

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
    type: dbDest?.type || parsed.level,
    countryName: dbDest?.countryName || "India",
    stateName: dbDest?.stateName || stateInfo.stateName,
    stateSlug: dbDest?.stateSlug || stateInfo.stateSlug,
    tagline:
      dbDest?.tagline ||
      `Best Handcrafted Tour Packages & Curated Itineraries in ${currentName}`,
    heroImg:
      dbDest?.coverImageStr ||
      dbDest?.coverImage ||
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1600&auto=format&fit=crop&q=80",
    overview:
      dbDest?.overview ||
      dbDest?.shortDescription ||
      `Explore extraordinary experiential travel packages, verified 4-star stays, and private chauffeured tours in ${currentName}.`,
    startingPrice: dbDest?.fastFacts?.startingPrice || dbDest?.startingPrice || "₹14,999",
    idealDuration: dbDest?.fastFacts?.idealDuration || dbDest?.idealDuration || "4 to 6 Days",
    bestTime: dbDest?.fastFacts?.bestTime || dbDest?.bestTimeToVisit || dbDest?.bestTime || "Year-Round",
    weather: dbDest?.fastFacts?.weather || dbDest?.weather || "Pleasant Climate",
    howToReach: dbDest?.fastFacts?.howToReach || dbDest?.howToReach || "Easily accessible via nearest airport, train station, and national highway network.",
    highlights: dbDest?.highlights || [],
    childPlaces: mappedDbChildPlaces,
    attractions: resolvedAttractions,
    activities: resolvedActivities,
    packages: resolvedPackages,
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
          {
            "@type": "ListItem",
            "position": 2,
            "name": "India Tours",
            "item": "https://www.bemytraveller.com/destination/india-tour-packages",
          },
          ...(current.stateName && current.name !== current.stateName
            ? [
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": current.stateName,
                  "item": `https://www.bemytraveller.com${buildDestinationUrl({ state: current.stateSlug })}`,
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

        <div className="max-w-[1280px] 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pb-8 sm:pb-10 relative z-10 w-full space-y-3">
          {/* SEO Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs text-amber-400 font-bold">
            <Link href="/" className="hover:underline text-slate-300 hover:text-white">Home</Link>
            <span className="text-slate-500">›</span>
            <Link href="/destination/india-tour-packages" className="hover:underline text-slate-300 hover:text-white">
              India Tours
            </Link>
            {current.stateName && current.name !== current.stateName && (
              <>
                <span className="text-slate-500">›</span>
                <Link
                  href={buildDestinationUrl({ state: current.stateSlug })}
                  className="text-slate-300 hover:text-white hover:underline"
                >
                  {current.stateName}
                </Link>
              </>
            )}
            <span className="text-slate-500">›</span>
            <span className="text-amber-400">{current.name}</span>
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
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Best {current.name} Tour Packages
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-3xl font-medium">
            {current.tagline}
          </p>
        </div>
      </section>

      {/* ── Fast Facts Bar ── */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 text-xs shadow-xs">
        <div className="max-w-[1280px] 2xl:max-w-[1360px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <span className="text-emerald-600 font-bold text-xs">4★ / 5★ Handpicked Stays</span>
          </div>
        </div>
      </div>

      {/* ── Main Body ── */}
      <main className="max-w-[1280px] 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left 2 Columns: Tour Packages (#1), Destination Carousel (#2), Overview (#3), Attractions (#4), Activities (#5), FAQs (#6) */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── 1. TOUR PACKAGES GRID ── */}
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

            {/* ── 3. OVERVIEW & TRAVEL ESSENTIALS ── */}
            <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900">
                  Experience {current.name} with Be My Traveller
                </h2>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {current.overview}
                </p>
              </div>

              {/* Highlight Tags */}
              {current.highlights && (Array.isArray(current.highlights) ? current.highlights.length > 0 : Boolean(current.highlights)) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {(Array.isArray(current.highlights)
                    ? current.highlights
                    : String(current.highlights).split(",")
                  ).map((h: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/70 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="text-amber-500">✨</span> {h.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Fast Facts Grid: Weather & How to Reach */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                {current.weather && (
                  <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-lg shrink-0">⛅</span>
                    <div>
                      <strong className="text-slate-900 block font-bold">Weather &amp; Climate</strong>
                      <span className="text-slate-600 mt-0.5 block">{current.weather}</span>
                    </div>
                  </div>
                )}

                {current.howToReach && (
                  <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-lg shrink-0">✈️</span>
                    <div>
                      <strong className="text-slate-900 block font-bold">How to Reach</strong>
                      <span className="text-slate-600 mt-0.5 block">{current.howToReach}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>

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
                      <option>4N / 5D</option>
                      <option>5N / 6D</option>
                      <option>6N / 7D</option>
                      <option>7N+ Custom</option>
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
