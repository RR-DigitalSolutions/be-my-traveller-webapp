import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db/mongoose";
import PackageDetailClient, { type PackageData } from "@/components/packages/PackageDetailClient";

interface PackagePageProps {
  params: Promise<{ slug: string }>;
}

// ─── Curated Fallback Registry ────────────────────────────────────────────────
const pkgRegistry: Record<string, PackageData> = {
  "6-nights-himachal-manali-tour": {
    slug: "6-nights-himachal-manali-tour",
    title: "6 Nights 7 Days Majestic Himachal & Rohtang Pass Tour",
    destination: "Shimla (2N) · Manali (3N) · Chandigarh (1N)",
    route: "Shimla (2N) · Manali (3N) · Chandigarh (1N)",
    nights: 6,
    days: 7,
    rating: 4.9,
    reviews: 184,
    tag: "Best Seller",
    basePriceAdult: 24999,
    originalPrice: 32000,
    heroImg: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&auto=format&fit=crop&q=80",
    ],
    overview: "Embark on an unforgettable journey through the majestic Himalayas. From the British colonial charm of Shimla's Mall Road to the high-adrenaline snow valleys of Solang and Rohtang Pass in Manali, this tour balances leisure, scenic grandeur, and private vehicle luxury. Every detail is handled — from porter assistance at check-in to packed lunches on mountain excursions.",
    highlights: [
      "Rohtang Pass Snow Drive & Solang Valley Adventure",
      "Shimla Mall Road & Ridge Himalayan Walk",
      "Kufri Snow Viewpoint & Himalayan Nature Park",
      "Hidimba Devi Temple, Old Manali Bazaars & Cafes",
      "Pandoh Dam & Scenic Kullu Valley Drive",
    ],
    inclusions: [
      "6 Nights accommodation in handpicked verified hotels",
      "Daily buffet breakfast and freshly prepared multi-cuisine dinner",
      "Private AC Sedan/SUV for entire arrival to departure transfers",
      "Full-day excursion to Solang Valley and Rohtang Pass snow point",
      "Toll taxes, parking, driver allowance & state road permits",
      "24/7 dedicated on-trip concierge assistance",
    ],
    exclusions: [
      "Airfare or train tickets (available as flight add-on)",
      "Personal expenses (laundry, phone calls, room heaters)",
      "Adventure activity fees (ATV, paragliding, skiing)",
      "5% GST applicable on total package amount",
    ],
    paymentPolicies: [
      "25% advance token payment at the time of booking confirmation",
      "50% payment 15 days prior to arrival / hotel voucher release",
      "Remaining 25% balance payment upon check-in on Day 1",
      "Special peak session (Christmas, New Year & Long Weekends) may require 100% advance as per hotel rules",
    ],
    importantInfo: [
      "Valid Government photo ID (Aadhaar / Passport / Voter ID) required for all travellers at check-in",
      "AC will remain switched off during driving in high-altitude uphill mountain roads",
      "Hotel standard check-in time is 12:00 PM / 02:00 PM and check-out is 10:00 AM / 11:00 AM",
      "Vehicles are provided on point-to-point basis as per tour schedule, not on disposable 24/7 basis",
      "Rohtang Pass & high mountain pass visits are subject to NGT green permits and climatic safety clearance",
    ],
    cancellationPolicies: [
      "30+ days prior to departure: 10% administrative fee only",
      "15 to 29 days prior to departure: 25% cancellation charge",
      "7 to 14 days prior to departure: 50% cancellation charge",
      "Less than 7 days / No-Show: 100% non-refundable as per peak vendor contracts",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival · Scenic Drive to Shimla (Queen of Hills)",
        desc: "Meet and greet at New Delhi / Chandigarh Airport or Railway Station. Board your private sanitized SUV and commence your scenic drive up the Himalayan foothills via Pinjore and Parwanoo. Check in to your Shimla resort and relax. Evening at leisure — stroll Mall Road and The Ridge with panoramic valley views.",
        meals: "Dinner Included",
        hotel: "Riverfront Stay",
        transport: "Private Sedan / SUV",
        hotelsByTier: {
          budget: "Apple View Budget Cottage / Homestay",
          standard: "Pine View Boutique Resort",
          deluxe: "Riverfront Stay",
          luxury: "The Oberoi Cecil",
        },
      },
      {
        day: 2,
        title: "Shimla Sightseeing & Kufri Snow Viewpoint",
        desc: "After a hearty breakfast, head for a picturesque excursion to Kufri (8,600 ft). Enjoy pony rides, Himalayan Nature Park, and stunning panoramic views. Return to visit the historic Viceregal Lodge, Jakhoo Hanuman Temple, and Christ Church on The Ridge.",
        meals: "Breakfast & Dinner",
        hotel: "Riverfront Stay",
        transport: "Private Sedan / SUV",
        hotelsByTier: {
          budget: "Apple View Budget Cottage / Homestay",
          standard: "Pine View Boutique Resort",
          deluxe: "Riverfront Stay",
          luxury: "The Oberoi Cecil",
        },
      },
      {
        day: 3,
        title: "Shimla → Manali via Kullu Valley & Pandoh Dam",
        desc: "Drive from Shimla to Manali (280 km) along the beautiful Beas River. En route stop at the magnificent Pandoh Dam, Hanogi Mata Temple, and Kullu Shawl weaving factory. Arrive in Manali by evening and check in to your riverside mountain resort.",
        meals: "Breakfast & Dinner",
        hotel: "Riverfront Mountain Resort",
        transport: "Private Sedan / SUV",
        hotelsByTier: {
          budget: "Snow Valley Camp & Budget Cottage",
          standard: "Snow Peak Retreat",
          deluxe: "Riverfront Mountain Resort",
          luxury: "Span Resort & Spa",
        },
      },
      {
        day: 4,
        title: "Manali Local Sightseeing & Old Manali Heritage",
        desc: "Explore the 450-year-old Hadimba Devi wooden temple surrounded by cedar forest. Visit Vashisht Hot Sulphur Springs, Tibetan Monastery, and the vibrant lane cafes of Old Manali. Evening free for shopping at Mall Road.",
        meals: "Breakfast & Dinner",
        hotel: "Riverfront Mountain Resort",
        transport: "Private Sedan / SUV",
        hotelsByTier: {
          budget: "Snow Valley Camp & Budget Cottage",
          standard: "Snow Peak Retreat",
          deluxe: "Riverfront Mountain Resort",
          luxury: "Span Resort & Spa",
        },
      },
      {
        day: 5,
        title: "Solang Valley & Rohtang Pass Snow Excursion",
        desc: "Early morning departure for the most anticipated day — Rohtang Pass (13,050 ft) and Solang Valley. Experience snow in peak summer, paragliding, zorbing, ATV rides, and breathtaking Himalayan panoramas. Return to Manali by evening for a relaxed dinner.",
        meals: "Breakfast & Dinner",
        hotel: "Riverfront Mountain Resort",
        transport: "Private Sedan / SUV",
        hotelsByTier: {
          budget: "Snow Valley Camp & Budget Cottage",
          standard: "Snow Peak Retreat",
          deluxe: "Riverfront Mountain Resort",
          luxury: "Span Resort & Spa",
        },
      },
      {
        day: 6,
        title: "Manali → Chandigarh Drive (Scenic Beas Valley)",
        desc: "After breakfast, check out and drive to Chandigarh (310 km). En route visit the picturesque Kullu town and Manikaran Sahib Gurudwara hot springs. Arrive in Chandigarh, visit the iconic Rock Garden and Sukhna Lake. Check in to hotel.",
        meals: "Breakfast & Dinner",
        hotel: "Hotel Mountview",
        transport: "Private Sedan / SUV",
        hotelsByTier: {
          budget: "City Center Budget Stay / Homestay",
          standard: "Hotel Sunbeam Premium",
          deluxe: "Hotel Mountview",
          luxury: "JW Marriott Chandigarh",
        },
      },
      {
        day: 7,
        title: "Chandigarh Departure with Warm Memories",
        desc: "After a leisurely breakfast, your private vehicle will transfer you to Chandigarh Airport / Railway Station for your onward journey. Tour concludes with warm memories of the majestic Himalayas.",
        meals: "Breakfast Included",
        hotel: "Tour Concludes (Checkout)",
        stayType: "CHECKOUT",
        transport: "Private Sedan / SUV",
        transportIcons: ["🚗"],
        hotelsByTier: {
          budget: "Tour Concludes",
          standard: "Tour Concludes",
          deluxe: "Tour Concludes",
          luxury: "Tour Concludes",
        },
      },
    ],
    hotelTiers: {
      budget: { title: "Budget 2★ Stays", pricePerAdult: 14999, desc: "Tent, cottage, homestay & clean verified budget stays", enabled: true },
      standard: { title: "Deluxe 3★", pricePerAdult: 18999, desc: "Cozy verified boutique stays with mountain views", enabled: true },
      deluxe: { title: "Super Deluxe 4★", pricePerAdult: 24999, desc: "Valley/river view premium rooms with private balcony & buffet meals", enabled: true },
      luxury: { title: "Luxury 5★ Resort", pricePerAdult: 38999, desc: "Mountain spa resorts & Swiss luxury chalets with heated pool access", enabled: true },
    },
    faq: [
      { q: "How does changing hotel category affect the package?", a: "Selecting Budget (2★), Deluxe (3★), Super Deluxe (4★), or Luxury (5★) dynamically upgrades your verified hotel stays and recalculates the live price per adult across the itinerary." },
      { q: "Is Rohtang Pass visit guaranteed?", a: "Rohtang Pass visits are subject to government permits and weather. We arrange permits in advance and guarantee Solang Valley as a premier alternative snow experience." },
      { q: "Is airfare included in this package?", a: "No. This package covers only land arrangements. Airfare can be added as an optional service — please contact our team." },
      { q: "What type of vehicle is provided?", a: "We provide a dedicated private AC Sedan (Swift Dzire / Ertiga) or SUV (Innova / Crysta) based on group size, for the entire duration." },
      { q: "Can I customize the hotels or add extra nights?", a: "Absolutely! All Be My Traveller packages are 100% tailor-made to your dates and hotel preferences." },
    ],
  },
};

// ── Helper to Fetch Package from DB or Fallback ──
async function getPackageData(slug: string): Promise<PackageData> {
  const fallback = pkgRegistry[slug] || {
    ...pkgRegistry["6-nights-himachal-manali-tour"],
    slug,
    title: slug
      .split("-")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  };

  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return fallback;

    const dbPkg = await db.collection("packages").findOne({
      $or: [{ slug }, { slug: slug.replace(/-tour$/, "") }],
    });

    if (dbPkg) {
      const startingPrice = Number(dbPkg.startingPrice) || fallback.basePriceAdult;
      const originalPrice = Number(dbPkg.originalPrice) || Math.round(startingPrice * 1.3);
      const computedDiscount = originalPrice > startingPrice
        ? Math.round(((originalPrice - startingPrice) / originalPrice) * 100)
        : 0;
      const discountPercent = Number(dbPkg.discountPercent) || computedDiscount;

      return {
        slug: dbPkg.slug || slug,
        title: dbPkg.name || fallback.title,
        destination: dbPkg.route || dbPkg.tagline || dbPkg.destination || fallback.destination,
        route: dbPkg.route || dbPkg.tagline || fallback.route,
        nights: Number(dbPkg.nights) || fallback.nights,
        days: Number(dbPkg.days) || fallback.days,
        rating: Number(dbPkg.averageRating) || fallback.rating,
        reviews: Number(dbPkg.reviewCount) || fallback.reviews,
        tag: dbPkg.tag || fallback.tag,
        basePriceAdult: startingPrice,
        originalPrice: originalPrice,
        discountPercent: discountPercent,
        discountBadge: dbPkg.discountBadge || "",
        seasonalHike: dbPkg.seasonalHike || undefined,
        seasonalHikes: Array.isArray(dbPkg.seasonalHikes) ? dbPkg.seasonalHikes : [],
        countries: Array.isArray(dbPkg.countries) ? dbPkg.countries : (dbPkg.countrySlug ? [dbPkg.countrySlug] : ["india"]),
        states: Array.isArray(dbPkg.states) ? dbPkg.states : (dbPkg.stateSlug ? [dbPkg.stateSlug] : []),
        cities: Array.isArray(dbPkg.cities) ? dbPkg.cities : (dbPkg.citySlug ? [dbPkg.citySlug] : []),
        heroImg: dbPkg.coverImageStr || dbPkg.coverImage || fallback.heroImg,
        gallery: Array.isArray(dbPkg.gallery) && dbPkg.gallery.length > 0
          ? dbPkg.gallery.map((g: any) => (typeof g === "string" ? g : g.url))
          : fallback.gallery,
        overview: dbPkg.overview || dbPkg.shortDescription || fallback.overview,
        highlights: Array.isArray(dbPkg.highlights) && dbPkg.highlights.length > 0
          ? dbPkg.highlights
          : fallback.highlights,
        inclusions: Array.isArray(dbPkg.inclusions) && dbPkg.inclusions.length > 0
          ? dbPkg.inclusions
          : fallback.inclusions,
        exclusions: Array.isArray(dbPkg.exclusions) && dbPkg.exclusions.length > 0
          ? dbPkg.exclusions
          : fallback.exclusions,
        paymentPolicies: Array.isArray(dbPkg.paymentPolicies) && dbPkg.paymentPolicies.length > 0
          ? dbPkg.paymentPolicies
          : fallback.paymentPolicies,
        importantInfo: Array.isArray(dbPkg.importantInfo) && dbPkg.importantInfo.length > 0
          ? dbPkg.importantInfo
          : fallback.importantInfo,
        cancellationPolicies: Array.isArray(dbPkg.cancellationPolicies) && dbPkg.cancellationPolicies.length > 0
          ? dbPkg.cancellationPolicies
          : fallback.cancellationPolicies,
        transportType: dbPkg.transportType || "Private AC Sedan / SUV",
        itinerary: Array.isArray(dbPkg.itinerary) && dbPkg.itinerary.length > 0
          ? dbPkg.itinerary.map((d: any, i: number) => {
              const rawHotel = typeof d.hotel === "string" ? d.hotel.trim() : "";
              let hotelsByTier: Record<string, string> =
                d.hotelsByTier && typeof d.hotelsByTier === "object" ? { ...d.hotelsByTier } : {};

              // If hotelsByTier has no discrete values, intelligently extract from rawHotel
              if (!hotelsByTier.standard && !hotelsByTier.deluxe && !hotelsByTier.luxury && !hotelsByTier.budget) {
                if (rawHotel.includes("/")) {
                  const parts = rawHotel.split("/").map((p: string) => p.trim());
                  const bMatch = parts.find((p: string) => p.includes("2★") || /budget|homestay|tent|cottage|camp/i.test(p));
                  const sMatch = parts.find((p: string) => p.includes("3★") || /standard|deluxe 3|3 star/i.test(p));
                  const dMatch = parts.find((p: string) => p.includes("4★") || /super deluxe|4 star/i.test(p));
                  const lMatch = parts.find((p: string) => p.includes("5★") || /luxury|5 star|resort|spa/i.test(p));
                  hotelsByTier = {
                    budget: (bMatch || parts[0] || "").replace(/\s*\([2-5]★\)/g, "").trim(),
                    standard: (sMatch || parts[0] || "").replace(/\s*\([2-5]★\)/g, "").trim(),
                    deluxe: (dMatch || parts[1] || parts[0] || "").replace(/\s*\([2-5]★\)/g, "").trim(),
                    luxury: (lMatch || parts[parts.length - 1] || parts[0] || "").replace(/\s*\([2-5]★\)/g, "").trim(),
                  };
                } else if (rawHotel) {
                  hotelsByTier = {
                    budget: rawHotel,
                    standard: rawHotel,
                    deluxe: rawHotel,
                    luxury: rawHotel,
                  };
                }
              }

              const stayType = (d.stayType as any) || (
                /overnight|night travel|night journey/i.test(rawHotel) || /overnight/i.test(d.title || "")
                  ? "OVERNIGHT_JOURNEY"
                  : (/tour concludes|checkout/i.test(rawHotel) ? "CHECKOUT" : "HOTEL")
              );

              return {
                day: d.day || i + 1,
                title: d.title || `Day ${i + 1}`,
                desc: typeof d.description === "string" ? d.description : (d.desc || ""),
                meals: typeof d.meals === "string" ? d.meals : "Breakfast & Dinner",
                hotel: hotelsByTier.deluxe || hotelsByTier.standard || rawHotel || "Verified Mountain Resort",
                transport: typeof d.transport === "string" && d.transport.trim() ? d.transport : (dbPkg.transportType || "Private AC Sedan / SUV"),
                transportIcons: Array.isArray(d.transportIcons) ? d.transportIcons : undefined,
                stayType,
                overnightNote: d.overnightNote || "",
                hotelsByTier,
              };
            })
          : fallback.itinerary.map((d) => ({
              ...d,
              transport: d.transport || fallback.transportType || "Private AC Sedan / SUV",
            })),
        hotelTiers: dbPkg.hotelTiers || {
          budget: { title: "Budget 2★ Stays", pricePerAdult: Math.round(startingPrice * 0.7) || 14999, desc: "Tent, cottage, homestay & clean verified budget stays", enabled: true },
          standard: { title: "Deluxe 3★", pricePerAdult: Math.round(startingPrice * 0.8) || 18999, desc: "Cozy boutique verified stays with mountain views", enabled: true },
          deluxe: { title: "Super Deluxe 4★", pricePerAdult: startingPrice || 24999, desc: "Valley/river view premium rooms with private balcony & buffet meals", enabled: true },
          luxury: { title: "Luxury 5★ Resort", pricePerAdult: Math.round(startingPrice * 1.6) || 38999, desc: "Mountain spa resorts & Swiss luxury chalets with heated pool access", enabled: true },
        },
        faq: Array.isArray(dbPkg.faqs) && dbPkg.faqs.length > 0
          ? dbPkg.faqs
          : fallback.faq,
      };
    }
  } catch (err) {
    console.error("Error loading package data:", err);
  }

  return fallback;
}

// ── Dynamic SEO Metadata Generation ──
export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageData(slug);

  const title = `${pkg.title} | Be My Traveller`;
  const description = `${pkg.overview.slice(0, 155)}...`;

  return {
    title,
    description,
    keywords: `${pkg.slug.replace(/-/g, " ")}, tour packages, customized holidays, be my traveller`,
    openGraph: {
      title,
      description,
      images: [{ url: pkg.heroImg, width: 1200, height: 630, alt: pkg.title }],
      type: "website",
    },
    alternates: {
      canonical: `https://www.bemytraveller.com/packages/${pkg.slug}`,
    },
  };
}

// ── Page Component ──
export default async function PackageDetailPage({ params }: PackagePageProps) {
  const { slug } = await params;
  const pkg = await getPackageData(slug);

  if (!pkg) {
    notFound();
  }

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": pkg.title,
        "description": pkg.overview,
        "image": pkg.heroImg,
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "INR",
          "lowPrice": pkg.hotelTiers.standard?.pricePerAdult || pkg.basePriceAdult,
          "highPrice": pkg.hotelTiers.luxury?.pricePerAdult || Math.round(pkg.basePriceAdult * 1.6),
          "offerCount": "3",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": pkg.rating || 4.9,
          "reviewCount": pkg.reviews || 184,
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.bemytraveller.com" },
          { "@type": "ListItem", "position": 2, "name": "Tour Packages", "item": "https://www.bemytraveller.com/packages" },
          { "@type": "ListItem", "position": 3, "name": pkg.title, "item": `https://www.bemytraveller.com/packages/${pkg.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": pkg.faq.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PackageDetailClient pkg={pkg} />
    </>
  );
}
