import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";
import connectDB from "@/lib/db/mongoose";
import { buildDestinationUrl } from "@/lib/destinations/slug-resolver";

interface AttractionRouteProps {
  params: Promise<{ slug: string[] }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: AttractionRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const attractionSlug = slug[slug.length - 1];

  let attraction: any = null;
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (db) {
      attraction = await db.collection("attractions").findOne({
        $or: [
          { slug: attractionSlug },
          { name: { $regex: new RegExp(`^${attractionSlug.replace(/-/g, " ")}$`, "i") } },
        ],
      });
    }
  } catch (err) {
    console.error("Attraction metadata query error:", err);
  }

  const name = attraction?.name || attractionSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const destName = attraction?.destinationName || "India";

  const title =
    attraction?.seo?.metaTitle ||
    `${name} (${destName}) - Timings, Entry Fee, Best Time & Complete Guide | Be My Traveller`;

  const description =
    attraction?.seo?.metaDescription ||
    attraction?.desc ||
    `Complete traveller guide to ${name} in ${destName}. Discover visiting hours, entry fees, highlights, history, how to reach, and nearby tour packages.`;

  const canonicalUrl = `https://www.bemytraveller.com/attraction/${slug.join("/")}`;

  return {
    title,
    description,
    keywords: attraction?.seo?.keywords
      ? String(attraction.seo.keywords).split(",").map((s: string) => s.trim())
      : [`${name.toLowerCase()}`, `${name.toLowerCase()} timings`, `${destName.toLowerCase()} sightseeing`],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Be My Traveller",
      locale: "en_IN",
      type: "article",
      images: [
        {
          url: attraction?.img || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&auto=format&fit=crop&q=80",
          width: 1200,
          height: 630,
          alt: `${name} Sightseeing Highlight`,
        },
      ],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function AttractionDetailPage({ params }: AttractionRouteProps) {
  const { slug } = await params;
  const attractionSlug = slug[slug.length - 1];

  const mongoose = await connectDB();
  const db = mongoose.connection.db;
  if (!db) {
    notFound();
  }

  // 1. Fetch Attraction Document
  const attraction = await db.collection("attractions").findOne({
    $or: [
      { slug: attractionSlug },
      { name: { $regex: new RegExp(`^${attractionSlug.replace(/-/g, " ")}$`, "i") } },
    ],
  });

  if (!attraction) {
    notFound();
  }

  // 2. Fetch Parent Destination
  const destination = await db.collection("destinations").findOne({
    $or: [
      ...(attraction.destinationId ? [{ _id: attraction.destinationId }] : []),
      { slug: attraction.destinationSlug },
      { name: { $regex: new RegExp(`^${attraction.destinationName || ""}$`, "i") } },
    ],
  });

  // 3. Fetch Related Tour Packages
  const destSearchTerms = [
    attraction.destinationSlug,
    destination?.slug,
    destination?.stateSlug,
    attraction.stateSlug,
  ].filter(Boolean);

  const relatedPackages = await db
    .collection("packages")
    .find({
      $or: [
        ...(destination?._id ? [{ destinationId: destination._id }, { destinations: destination._id }] : []),
        { "destinations.slug": { $in: destSearchTerms } },
        { stateSlug: { $in: destSearchTerms } },
      ],
      status: { $ne: "DRAFT" },
    })
    .limit(3)
    .toArray();

  // 4. Fetch Sibling Attractions
  const siblingAttractions = await db
    .collection("attractions")
    .find({
      _id: { $ne: attraction._id },
      $or: [
        { destinationSlug: attraction.destinationSlug },
        { stateSlug: attraction.stateSlug || destination?.stateSlug },
      ],
      status: { $ne: "DRAFT" },
    })
    .limit(4)
    .toArray();

  // 5. Build Dynamic JSON-LD Schemas (SEO, AEO, AIO, GEO)
  const canonicalUrl = `https://www.bemytraveller.com/attraction/${slug.join("/")}`;
  const destUrl = destination
    ? buildDestinationUrl({
        country: "india",
        state: destination.stateSlug || destination.slug,
        place: destination.type === "CITY" ? destination.slug : undefined,
      })
    : "/destination/india-tour-packages";

  const attractionFaqs = (Array.isArray(attraction.faqs) && attraction.faqs.length > 0)
    ? attraction.faqs
    : [
        {
          q: `What is the visiting timing for ${attraction.name}?`,
          a: `${attraction.name} is open ${attraction.timing || "daily from 9:00 AM to 6:00 PM"}. Visiting during early morning or sunset provides the best photography lighting and fewer crowds.`,
        },
        {
          q: `What is the entry ticket fee for ${attraction.name}?`,
          a: `The entry fee for ${attraction.name} is ${attraction.entryFee || "Free"}. Additional charges may apply for specialized activities, boat rides, or camera permits.`,
        },
        {
          q: `How much time is required to explore ${attraction.name}?`,
          a: `Travellers typically spend ${attraction.idealDuration || "2 to 3 hours"} exploring ${attraction.name} and taking in surrounding viewpoints.`,
        },
      ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristAttraction",
        "@id": `${canonicalUrl}#attraction`,
        "name": attraction.name,
        "description": attraction.desc || attraction.detailedContent,
        "image": attraction.img,
        "url": canonicalUrl,
        "isAccessibleForFree": Boolean(
          attraction.entryFee && attraction.entryFee.toLowerCase().includes("free")
        ),
        "publicAccess": true,
        "containedInPlace": {
          "@type": "TouristDestination",
          "name": attraction.destinationName || destination?.name || "India",
          "url": `https://www.bemytraveller.com${destUrl}`,
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": attraction.rating || 4.9,
          "reviewCount": 185,
        },
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
          {
            "@type": "ListItem",
            "position": 3,
            "name": attraction.destinationName || destination?.name || "Destination",
            "item": `https://www.bemytraveller.com${destUrl}`,
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": attraction.name,
            "item": canonicalUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "mainEntity": attractionFaqs.map((faq: any) => ({
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* ── JSON-LD Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Navigation Menu ── */}
      <BmtNavMenu />

      {/* ── Hero Banner ── */}
      <section className="relative -mt-[96px] pt-[112px] pb-12 min-h-[440px] sm:min-h-[500px] text-white flex items-end overflow-hidden">
        <img
          src={attraction.img || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1600&auto=format&fit=crop&q=80"}
          alt={attraction.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />

        <div className="max-w-7xl mx-auto px-4 pb-8 relative z-10 w-full space-y-3">
          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs text-amber-400 font-bold">
            <Link href="/" className="hover:underline text-slate-300 hover:text-white">Home</Link>
            <span className="text-slate-500">›</span>
            <Link href="/destination/india-tour-packages" className="hover:underline text-slate-300 hover:text-white">
              India Tours
            </Link>
            <span className="text-slate-500">›</span>
            <Link href={destUrl} className="hover:underline text-slate-300 hover:text-white">
              {attraction.destinationName || destination?.name || "Destination"}
            </Link>
            <span className="text-slate-500">›</span>
            <span className="text-amber-400">{attraction.name}</span>
          </nav>

          {/* Badges */}
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-xs flex items-center gap-1">
              ⭐ {attraction.rating || 4.9}/5 Traveller Rating
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
              📍 {attraction.category || "Sightseeing Highlight"}
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-xs">
              🎟️ {attraction.entryFee || "Free"}
            </span>
          </div>

          {/* H1 SEO Title */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {attraction.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-3xl font-medium leading-relaxed">
            {attraction.desc}
          </p>
        </div>
      </section>

      {/* ── Fast Facts Bar ── */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 text-xs shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Entry Fee</span>
            <span className="text-amber-600 font-extrabold text-sm">{attraction.entryFee || "Free"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Visiting Hours</span>
            <span className="text-slate-900 font-bold text-xs">{attraction.timing || "Open Daily"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Time Required</span>
            <span className="text-slate-900 font-bold text-xs">{attraction.idealDuration || "2 to 3 Hours"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Category</span>
            <span className="text-emerald-600 font-bold text-xs">{attraction.category || "Sightseeing"}</span>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column (2 Cols): Overview, Story, Highlights, How to Reach, Packages, FAQs */}
          <div className="lg:col-span-2 space-y-8">

            {/* Detailed Guide & Narrative Story */}
            <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl font-black text-slate-900">
                About {attraction.name}
              </h2>

              <div className="text-slate-700 leading-relaxed text-sm space-y-3 font-normal whitespace-pre-line">
                {attraction.detailedContent || attraction.desc}
              </div>

              {/* Highlights Checklist */}
              {attraction.highlights && (Array.isArray(attraction.highlights) ? attraction.highlights.length > 0 : Boolean(attraction.highlights)) && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Key Highlights &amp; Must-Do Experiences
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(Array.isArray(attraction.highlights)
                      ? attraction.highlights
                      : String(attraction.highlights).split("\n").filter(Boolean)
                    ).map((highlight: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200/50 text-xs text-slate-800"
                      >
                        <span className="text-amber-500 font-bold shrink-0">✓</span>
                        <span className="font-medium">{highlight.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Practical Travel Guide: How to Reach & Best Time */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {attraction.howToReach && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚗</span>
                    <h3 className="font-bold text-slate-900 text-sm">How to Reach</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {attraction.howToReach}
                  </p>
                </div>
              )}

              {attraction.bestTime && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌤️</span>
                    <h3 className="font-bold text-slate-900 text-sm">Best Time to Visit</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {attraction.bestTime}
                  </p>
                </div>
              )}
            </section>

            {/* Handcrafted Tour Packages Covering this Attraction */}
            {relatedPackages.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">Handcrafted Holidays</span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                      Tour Packages Covering {attraction.name}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedPackages.map((pkg: any) => (
                    <div
                      key={pkg._id?.toString() || pkg.slug}
                      className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                        <img
                          src={pkg.coverImage || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80"}
                          alt={pkg.title || pkg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-amber-400">
                          ⏱️ {pkg.nights || "5N / 6D"}
                        </span>
                      </div>

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors line-clamp-2">
                            {pkg.title || pkg.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {pkg.route}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Starting From</span>
                            <span className="text-base font-black text-amber-600">
                              {pkg.price || "₹14,999"}
                            </span>
                          </div>

                          <Link
                            href={`/packages/${pkg.slug}`}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-xs"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sibling Attractions in the same destination */}
            {siblingAttractions.length > 0 && (
              <section className="space-y-4">
                <div>
                  <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">Nearby Highlights</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                    Other Top Attraction Points in {attraction.destinationName || destination?.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {siblingAttractions.map((sib: any) => (
                    <a
                      key={sib._id?.toString() || sib.slug}
                      href={`/attraction/${sib.destinationSlug || attraction.destinationSlug}/${sib.slug}`}
                      className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group p-3.5 space-y-2"
                    >
                      <div className="h-32 w-full overflow-hidden rounded-xl bg-slate-100 relative">
                        <img
                          src={sib.img || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80"}
                          alt={sib.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-950/80 backdrop-blur-md text-amber-400">
                          {sib.category || "Sightseeing"}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs group-hover:text-amber-600 transition-colors line-clamp-1">
                          {sib.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {sib.desc}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>🎟️ {sib.entryFee || "Free"}</span>
                        <span className="text-amber-600 font-bold">Explore Guide →</span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Interactive FAQs Accordion */}
            <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">Traveller Questions</span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  Frequently Asked Questions about {attraction.name}
                </h2>
              </div>

              <div className="space-y-3">
                {attractionFaqs.map((faq: any, idx: number) => (
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

          {/* Right Column: Sticky Trip Planner Card */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-4">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                Bespoke Holiday Planner
              </span>

              <h3 className="text-xl font-black text-slate-900 leading-tight">
                Plan Your Visit to {attraction.destinationName || destination?.name || "This Destination"}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Connect with our local destination concierge for customized itineraries covering {attraction.name}, verified 4★/5★ boutique resorts, and dedicated private cabs.
              </p>

              <div className="space-y-2 pt-2">
                <a
                  href={`https://wa.me/918091638090?text=${encodeURIComponent(
                    `Hi Be My Traveller, I want to plan a custom trip to visit ${attraction.name} in ${attraction.destinationName || "India"}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>💬</span> WhatsApp {attraction.destinationName || "Travel"} Specialist
                </a>

                <Link
                  href={`/customize?destination=${encodeURIComponent(attraction.destinationName || destination?.name || "India")}`}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Build Custom Itinerary →
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>100% Tailor-made with private sanitized cab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Verified 4★ / 5★ luxury &amp; boutique stays</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>24/7 dedicated on-trip concierge manager</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Guaranteed best rate with zero hidden charges</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* ── Footer ── */}
      <SiteFooter />
    </div>
  );
}
