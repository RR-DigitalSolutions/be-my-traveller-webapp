import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";
import connectDB from "@/lib/db/mongoose";
import { HolidayThemeModel, DEFAULT_HOLIDAY_THEMES } from "@/domains/cms/holiday-theme.model";

interface ThemePageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ destination?: string }>;
}

const THEME_HERO_IMAGES: Record<string, string> = {
  honeymoon: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80",
  adventure: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&auto=format&fit=crop&q=80",
  family: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&auto=format&fit=crop&q=80",
  heritage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&auto=format&fit=crop&q=80",
  luxury: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&auto=format&fit=crop&q=80",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80",
  wildlife: "https://images.unsplash.com/photo-1466853817435-05b43fe45b39?w=1600&auto=format&fit=crop&q=80",
  pilgrimage: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&auto=format&fit=crop&q=80",
  "hill-station": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&auto=format&fit=crop&q=80",
  "weekend-escape": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&auto=format&fit=crop&q=80",
};

const THEME_KEYWORDS: Record<string, string[]> = {
  honeymoon: ["honeymoon tour packages", "romantic holiday packages India", "couple tour packages", "honeymoon packages Himachal", "Manali honeymoon packages", "Kashmir honeymoon tour", "Goa honeymoon packages", "Maldives honeymoon"],
  adventure: ["adventure tour packages India", "trekking packages", "Spiti Valley tours", "Ladakh 4x4 packages", "river rafting Rishikesh", "paragliding Manali", "adventure holiday India"],
  family: ["family tour packages India", "family holiday packages", "family vacation India", "Himachal family tour", "Manali family packages", "Goa family trip", "family trip with kids"],
  heritage: ["heritage tour packages India", "cultural tour packages", "Rajasthan heritage tours", "palace hotel stays", "fort and palace tours India", "Golden Triangle tour packages"],
  luxury: ["luxury tour packages India", "luxury holiday India", "5 star hotel packages", "premium travel India", "luxury resort stays", "private villa holidays India"],
  beach: ["beach holiday packages India", "beach tour packages", "Goa beach packages", "Andaman beach tour", "Maldives beach holiday", "seaside vacation India"],
  wildlife: ["wildlife safari India", "jungle safari packages", "Jim Corbett packages", "Ranthambore safari tours", "wildlife tour packages", "tiger safari India"],
  pilgrimage: ["pilgrimage tour packages India", "Chardham Yatra packages", "Vaishno Devi tour", "Tirupati pilgrimage packages", "Kedarnath tour", "spiritual journey India"],
  "hill-station": ["hill station tour packages", "hill station holidays India", "Manali hill station", "Shimla tour packages", "Ooty hill station", "hill station getaway India"],
  "weekend-escape": ["weekend getaway packages India", "short trip packages", "weekend holiday near Delhi", "2 night 3 day packages", "quick getaway India", "weekend tour India"],
};

const THEME_FAQS: Record<string, Array<{ q: string; a: string }>> = {
  honeymoon: [
    { q: "What are the best honeymoon destinations in India?", a: "India offers incredible honeymoon destinations including Shimla, Manali, Kashmir (Gulmarg, Pahalgam), Goa, Kerala (Alleppey backwaters), Andaman Islands, and Coorg. International options include Bali, Maldives, and Switzerland. Be My Traveller crafts 100% customized honeymoon packages for all budgets." },
    { q: "How much does a honeymoon tour package cost?", a: "Honeymoon packages start from ₹14,999 per person for domestic destinations. International packages start from ₹39,999 per person. All packages include verified hotel stays, private cab, daily meals, and 24/7 support." },
    { q: "What is included in a Be My Traveller honeymoon package?", a: "Our honeymoon packages include 4-star and 5-star hotel stays with couple-friendly amenities, private sanitized cab with dedicated driver, daily breakfast and dinner, room decorations on arrival, candle-light dinners, and 24/7 trip assistance." },
    { q: "Can I customize my honeymoon itinerary?", a: "Absolutely! Every honeymoon package is 100% tailored to your preferences - hotel category, destinations, trip duration, special activities, and add-ons like spa sessions, private boat rides, or sunset dinners." },
  ],
  adventure: [
    { q: "What adventure activities are available in India?", a: "India offers a wide range of adventure activities: river rafting in Rishikesh, paragliding in Bir Billing and Manali, trekking in Spiti Valley and Ladakh, 4x4 off-roading in Leh, skiing in Gulmarg, and jungle safaris across Madhya Pradesh and Uttarakhand." },
    { q: "Is Spiti Valley safe for adventure trips?", a: "Yes, Spiti Valley is safe for adventure travel between May and October. Be My Traveller arranges permits, experienced local guides, acclimatization stops, and 4x4 vehicles for high-altitude stretches. We include safety gear and emergency protocols." },
    { q: "Which is the best time for a Ladakh adventure tour?", a: "June to September is the ideal window for Ladakh adventure. Roads are accessible, weather is dry, and passes like Khardung La and Chang La are open. We recommend 7-10 days for a comprehensive circuit." },
  ],
  family: [
    { q: "What are the best family tour packages in India?", a: "Top family destinations include Shimla-Manali, Goa, Rajasthan (Jaipur, Udaipur), Kerala, Coorg, Andaman Islands, Nainital, and Jim Corbett. Be My Traveller curates safe, kid-friendly itineraries with private cabs and age-appropriate activities." },
    { q: "Are these packages safe for children?", a: "Yes, all our family packages prioritize safety. We arrange sanitized private vehicles, child-friendly hotels with extra beds or connecting rooms, and family-safe activities. Our trip managers are trained to assist families with young children." },
    { q: "Can I plan a family trip on a budget?", a: "Absolutely. We have family packages starting from ₹11,999 per person. We help you choose value-for-money hotels without compromising comfort, and recommend off-peak travel for additional savings." },
  ],
  pilgrimage: [
    { q: "What is the Chardham Yatra route?", a: "The Chardham Yatra circuit covers Yamunotri, Gangotri, Kedarnath, and Badrinath in Uttarakhand. Best done between May and June and September to November. Be My Traveller arranges permits, darshan bookings, comfortable accommodation, and private cabs." },
    { q: "Can senior citizens go on pilgrimage tours?", a: "Yes. We specialize in senior-friendly pilgrimage tours with comfortable pacing, wheelchair-accessible accommodation where available, and helicopter services for Kedarnath and Vaishno Devi. Medical assistance is arranged at key stops." },
    { q: "What pilgrimage destinations does Be My Traveller cover?", a: "We cover Chardham Yatra, Vaishno Devi, Amarnath Yatra, Dwarka-Somnath, Shirdi, Tirupati, Rameshwaram, Madurai, Vrindavan-Mathura, Kashi Vishwanath, and more across India." },
  ],
};

const DEFAULT_FAQS = [
  { q: "Are these tour packages 100% customizable?", a: "Yes! Every package from Be My Traveller is fully customizable - you can change hotel categories, adjust trip duration, select vehicle type, add activities, and build a completely bespoke itinerary." },
  { q: "What is included in the packages?", a: "Standard inclusions are: verified 4-star and 5-star hotel stays, daily breakfast and dinner, private sanitized AC cab with dedicated driver, all applicable permits, sightseeing as per itinerary, and 24/7 on-trip concierge assistance." },
  { q: "How do I book a tour package with Be My Traveller?", a: "Call or WhatsApp our helpline, fill out our free quote form, or use the Trip Builder on our website. Our team will send you a customized itinerary and quote within 24 hours." },
];

function getThemeDestinations(slug: string) {
  const map: Record<string, Array<{ name: string; slug: string; url: string; icon: string; tagline: string }>> = {
    honeymoon: [
      { name: "Shimla", slug: "shimla", url: "/destination/india/himachal-pradesh/shimla-tour-packages", icon: "❄️", tagline: "Romantic hill station" },
      { name: "Manali", slug: "manali", url: "/destination/india/himachal-pradesh/manali-tour-packages", icon: "🏔️", tagline: "Snow & scenic valleys" },
      { name: "Kashmir", slug: "kashmir", url: "/destination/india/jammu-kashmir-tour-packages", icon: "🌸", tagline: "Heaven on earth" },
      { name: "Goa", slug: "goa", url: "/destination/india/goa-tour-packages", icon: "🏖️", tagline: "Beach & nightlife" },
      { name: "Andaman", slug: "andaman", url: "/destination/india/andaman-tour-packages", icon: "🌊", tagline: "Pristine islands" },
      { name: "Kerala", slug: "kerala", url: "/destination/india/kerala-tour-packages", icon: "🌴", tagline: "Backwaters & spice" },
    ],
    adventure: [
      { name: "Spiti Valley", slug: "spiti", url: "/destination/india/himachal-pradesh/spiti-tour-packages", icon: "🏔️", tagline: "High-altitude desert" },
      { name: "Manali", slug: "manali", url: "/destination/india/himachal-pradesh/manali-tour-packages", icon: "🎿", tagline: "Skiing & biking" },
      { name: "Ladakh", slug: "ladakh", url: "/destination/india/ladakh-tour-packages", icon: "🚵", tagline: "4x4 & trekking" },
      { name: "Rishikesh", slug: "rishikesh", url: "/destination/india/uttarakhand/rishikesh-tour-packages", icon: "🚣", tagline: "River rafting hub" },
      { name: "Sikkim", slug: "sikkim", url: "/destination/india/sikkim-tour-packages", icon: "🌄", tagline: "Himalayan trekking" },
      { name: "Meghalaya", slug: "meghalaya", url: "/destination/india/meghalaya-tour-packages", icon: "💧", tagline: "Caves & waterfalls" },
    ],
    family: [
      { name: "Shimla Manali", slug: "shimla-manali", url: "/destination/india/himachal-pradesh-tour-packages", icon: "🏔️", tagline: "Classic hill circuit" },
      { name: "Goa", slug: "goa", url: "/destination/india/goa-tour-packages", icon: "🏖️", tagline: "Beach & fun" },
      { name: "Rajasthan", slug: "rajasthan", url: "/destination/india/rajasthan-tour-packages", icon: "🏰", tagline: "Forts & palaces" },
      { name: "Kerala", slug: "kerala", url: "/destination/india/kerala-tour-packages", icon: "🌴", tagline: "Houseboats & nature" },
      { name: "Nainital", slug: "nainital", url: "/destination/india/uttarakhand/nainital-tour-packages", icon: "🏡", tagline: "Lake-side retreat" },
      { name: "Andaman", slug: "andaman", url: "/destination/india/andaman-tour-packages", icon: "🐠", tagline: "Island adventure" },
    ],
    heritage: [
      { name: "Rajasthan", slug: "rajasthan", url: "/destination/india/rajasthan-tour-packages", icon: "🏰", tagline: "Forts & royal palaces" },
      { name: "Agra", slug: "agra", url: "/packages?destination=agra", icon: "🕌", tagline: "Taj Mahal & Mughal heritage" },
      { name: "Hampi", slug: "hampi", url: "/destination/india/karnataka-tour-packages", icon: "🗿", tagline: "Vijayanagara ruins" },
      { name: "Khajuraho", slug: "khajuraho", url: "/destination/india/madhya-pradesh-tour-packages", icon: "⛩️", tagline: "UNESCO temples" },
      { name: "Varanasi", slug: "varanasi", url: "/packages?destination=varanasi", icon: "🪔", tagline: "Ghats & spirituality" },
      { name: "Delhi", slug: "delhi", url: "/packages?destination=delhi", icon: "🕍", tagline: "Mughal & British history" },
    ],
    pilgrimage: [
      { name: "Kedarnath", slug: "kedarnath", url: "/destination/india/uttarakhand/kedarnath-tour-packages", icon: "🛕", tagline: "Shiva temple, Himalayas" },
      { name: "Varanasi", slug: "varanasi", url: "/packages?destination=varanasi", icon: "🪔", tagline: "Moksha & Ganga aarti" },
      { name: "Tirupati", slug: "tirupati", url: "/destination/india/andhra-pradesh-tour-packages", icon: "🌸", tagline: "Lord Venkateswara" },
      { name: "Vaishno Devi", slug: "vaishno-devi", url: "/destination/india/jammu-kashmir-tour-packages", icon: "⛰️", tagline: "Trikuta Mountains" },
      { name: "Shirdi", slug: "shirdi", url: "/destination/india/maharashtra-tour-packages", icon: "🙏", tagline: "Sai Baba Dham" },
      { name: "Rameshwaram", slug: "rameshwaram", url: "/destination/india/tamil-nadu-tour-packages", icon: "🌊", tagline: "Ramayana sacred site" },
    ],
    luxury: [
      { name: "Kashmir", slug: "kashmir", url: "/destination/india/jammu-kashmir-tour-packages", icon: "✨", tagline: "Luxury houseboats" },
      { name: "Rajasthan", slug: "rajasthan", url: "/destination/india/rajasthan-tour-packages", icon: "👑", tagline: "Palace hotel stays" },
      { name: "Kerala", slug: "kerala", url: "/destination/india/kerala-tour-packages", icon: "🌴", tagline: "Luxury resorts" },
      { name: "Maldives", slug: "maldives", url: "/packages?destination=maldives", icon: "🏝️", tagline: "Overwater villas" },
      { name: "Andaman", slug: "andaman", url: "/destination/india/andaman-tour-packages", icon: "🌊", tagline: "Private beach resorts" },
      { name: "Shimla", slug: "shimla", url: "/destination/india/himachal-pradesh/shimla-tour-packages", icon: "🏡", tagline: "Heritage hotel stays" },
    ],
  };

  const defaultDests = [
    { name: "Himachal Pradesh", slug: "himachal-pradesh", url: "/destination/india/himachal-pradesh-tour-packages", icon: "🏔️", tagline: "Mountain paradise" },
    { name: "Goa", slug: "goa", url: "/destination/india/goa-tour-packages", icon: "🏖️", tagline: "Sun, sand & sea" },
    { name: "Kerala", slug: "kerala", url: "/destination/india/kerala-tour-packages", icon: "🌴", tagline: "God's own country" },
    { name: "Rajasthan", slug: "rajasthan", url: "/destination/india/rajasthan-tour-packages", icon: "🏰", tagline: "Royal heritage" },
    { name: "Uttarakhand", slug: "uttarakhand", url: "/destination/india/uttarakhand-tour-packages", icon: "⛰️", tagline: "Dev bhumi" },
    { name: "Andaman", slug: "andaman", url: "/destination/india/andaman-tour-packages", icon: "🌊", tagline: "Island escape" },
  ];

  return map[slug] || defaultDests;
}

export async function generateMetadata({ params, searchParams }: ThemePageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const destinationParam = sp?.destination?.trim() || "";

  let themeLabel = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  let themeDesc = "";

  try {
    await connectDB();
    const theme = (await HolidayThemeModel.findOne({ slug }).lean()) as any;
    if (theme) {
      themeLabel = theme.label || themeLabel;
      themeDesc = theme.description || "";
    }
  } catch {
    /* fallback */
  }

  const title = destinationParam
    ? `${destinationParam} ${themeLabel} Tour Packages | Best Handcrafted Trips - Be My Traveller`
    : `${themeLabel} Tour Packages | Best Handcrafted ${themeLabel} Holidays - Be My Traveller`;

  const description = destinationParam
    ? `Book verified ${destinationParam} ${themeLabel.toLowerCase()} holiday packages with 4-star and 5-star hotel stays, private sanitized cab, daily meals and 24/7 support. 100% customizable itineraries.`
    : themeDesc ||
      `Book handcrafted ${themeLabel} tour packages with verified 4-star and 5-star hotels, private sanitized cabs, daily meals and 24/7 support. 100% customizable ${themeLabel.toLowerCase()} holidays across India and worldwide. Starting from ₹12,999 per person.`;

  const keywords = destinationParam
    ? [
        `${destinationParam} ${themeLabel.toLowerCase()} tour packages`,
        `${destinationParam} ${themeLabel.toLowerCase()} packages`,
        `best ${destinationParam} ${themeLabel.toLowerCase()} tours`,
        ...(THEME_KEYWORDS[slug] || []),
      ]
    : THEME_KEYWORDS[slug] || [
        `${themeLabel} tour packages India`,
        `${themeLabel} holiday packages`,
        `best ${themeLabel.toLowerCase()} tours`,
      ];

  const canonicalUrl = destinationParam
    ? `https://www.bemytraveller.com/themes/${slug}?destination=${encodeURIComponent(destinationParam)}`
    : `https://www.bemytraveller.com/themes/${slug}`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Be My Traveller",
      images: [
        {
          url: THEME_HERO_IMAGES[slug] || THEME_HERO_IMAGES.honeymoon,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: canonicalUrl },
  };
}

export default async function ThemePackagePage({ params, searchParams }: ThemePageProps) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const destinationParam = sp?.destination?.trim() || "";

  let themeData: any = null;
  let allThemes: any[] = [];
  let dbPackages: any[] = [];
  let hasExactDestinationMatch = false;

  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db!;

    themeData = await HolidayThemeModel.findOne({ slug }).lean();
    if (!themeData) {
      const defaultTheme = (DEFAULT_HOLIDAY_THEMES as readonly any[]).find((t: any) => t.slug === slug);
      if (!defaultTheme) notFound();
      themeData = defaultTheme;
    }

    allThemes = await HolidayThemeModel.find({ isActive: true }).sort({ sortOrder: 1, label: 1 }).lean();
    if (allThemes.length === 0) {
      allThemes = (DEFAULT_HOLIDAY_THEMES as readonly any[]).map((t) => ({ ...t }));
    }

    const themeName = (themeData.name || slug).toUpperCase().replace(/-/g, "_");
    const themeSlug = themeData.slug || slug;

    const themeUpper = themeName;
    const themeSlugs = [themeUpper, slug, themeSlug, slug.toLowerCase(), themeName.toLowerCase()];

    const baseThemeCondition = {
      $or: [
        { primaryTheme: { $in: themeSlugs } },
        { theme: { $in: themeSlugs } },
        { themes: { $in: themeSlugs } },
        { theme: themeName },
        { theme: slug },
        { themes: themeName },
        { themes: slug },
      ],
      status: { $ne: "DRAFT" },
    };

    if (destinationParam) {
      const safeDest = destinationParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const destRegex = new RegExp(safeDest, "i");
      const destSlugRegex = new RegExp(destinationParam.toLowerCase().replace(/[^a-z0-9]+/g, "-"), "i");

      const queryWithDest = {
        $and: [
          baseThemeCondition,
          {
            $or: [
              { destination: destRegex },
              { destinationName: destRegex },
              { destinations: destRegex },
              { stateName: destRegex },
              { stateSlug: destSlugRegex },
              { city: destRegex },
              { citySlug: destSlugRegex },
              { title: destRegex },
              { slug: destSlugRegex },
            ],
          },
        ],
      };

      dbPackages = await db
        .collection("packages")
        .find(queryWithDest)
        .sort({ displayOrder: 1, createdAt: -1 })
        .limit(48)
        .toArray();

      if (dbPackages.length > 0) {
        hasExactDestinationMatch = true;
      } else {
        // Fall back to general theme packages so user gets recommendations
        dbPackages = await db
          .collection("packages")
          .find(baseThemeCondition)
          .sort({ displayOrder: 1, createdAt: -1 })
          .limit(24)
          .toArray();
      }
    } else {
      dbPackages = await db
        .collection("packages")
        .find(baseThemeCondition)
        .sort({ displayOrder: 1, createdAt: -1 })
        .limit(48)
        .toArray();
    }
  } catch {
    /* show graceful page */
    allThemes = (DEFAULT_HOLIDAY_THEMES as readonly any[]).map((t) => ({ ...t }));
  }

  const themeLabel = themeData?.label || slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const themeDescription = themeData?.description || "";
  const heroImg = THEME_HERO_IMAGES[slug] || THEME_HERO_IMAGES.honeymoon;

  const packages = dbPackages.map((p: any) => {
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
      nights: formattedNights,
      price: formattedPrice,
      originalPrice: formattedOrig,
      rating: p.rating || 4.9,
      reviews: p.reviews || 140,
      img: p.coverImage || p.coverImageStr || heroImg,
      inclusions: p.inclusions || ["4-star Hotel Stays", "Private AC Cab", "Daily Breakfast & Dinner"],
      destination: p.destination || p.destinationName || "",
    };
  });

  const faqs = THEME_FAQS[slug] || DEFAULT_FAQS;
  const keywords = THEME_KEYWORDS[slug] || [`${themeLabel} tour packages India`];
  const canonicalUrl = destinationParam
    ? `https://www.bemytraveller.com/themes/${slug}?destination=${encodeURIComponent(destinationParam)}`
    : `https://www.bemytraveller.com/themes/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: destinationParam ? `${destinationParam} ${themeLabel} Tour Packages - Be My Traveller` : `${themeLabel} Tour Packages - Be My Traveller`,
        description: themeDescription || `Best ${themeLabel} holiday packages across India and worldwide`,
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
        inLanguage: "en-IN",
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "h2", ".speakable-content"],
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.bemytraveller.com" },
          { "@type": "ListItem", position: 2, name: "Holiday Themes", item: "https://www.bemytraveller.com/themes" },
          { "@type": "ListItem", position: 3, name: `${themeLabel} Packages`, item: `https://www.bemytraveller.com/themes/${slug}` },
          ...(destinationParam ? [{ "@type": "ListItem", position: 4, name: destinationParam, item: canonicalUrl }] : []),
        ],
      },
      ...(packages.length > 0
        ? [
            {
              "@type": "ItemList",
              "@id": `${canonicalUrl}#packages`,
              name: destinationParam ? `Best ${destinationParam} ${themeLabel} Tour Packages` : `Best ${themeLabel} Tour Packages`,
              numberOfItems: packages.length,
              itemListElement: packages.slice(0, 10).map((pkg: any, idx: number) => ({
                "@type": "ListItem",
                position: idx + 1,
                item: {
                  "@type": "Product",
                  name: pkg.title,
                  url: `https://www.bemytraveller.com/packages/${pkg.slug}`,
                  offers: {
                    "@type": "Offer",
                    price: pkg.price.replace(/[^0-9]/g, ""),
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                  },
                },
              })),
            },
          ]
        : []),
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: faqs.map((faq: any) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
      {
        "@type": "TravelAgency",
        "@id": "https://www.bemytraveller.com#agency",
        name: "Be My Traveller",
        url: "https://www.bemytraveller.com",
        telephone: "+918091638090",
        priceRange: "₹₹ - ₹₹₹",
        areaServed: ["India", "Worldwide"],
        knowsAbout: [themeLabel, "Holiday Packages", "Tour Packages India", "Customized Tours"],
      },
    ],
  };

  const themeDestinations = getThemeDestinations(slug);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-amber-500 selection:text-slate-950 pb-16 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BmtNavMenu />

      {/* Hero */}
      <section className="relative -mt-[96px] pt-[112px] pb-10 min-h-[420px] sm:min-h-[500px] text-white flex items-end overflow-hidden">
        <img
          src={heroImg}
          alt={`${destinationParam ? `${destinationParam} ` : ""}${themeLabel} Tour Packages`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10 relative z-10 w-full space-y-3">
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs text-amber-300 font-bold drop-shadow-sm">
            <Link href="/" className="hover:underline text-slate-200 hover:text-white">Home</Link>
            <span className="text-slate-400">›</span>
            <Link href="/themes" className="hover:underline text-slate-200 hover:text-white">Holiday Themes</Link>
            <span className="text-slate-400">›</span>
            {destinationParam ? (
              <>
                <Link href={`/themes/${slug}`} className="hover:underline text-slate-200 hover:text-white">{themeLabel}</Link>
                <span className="text-slate-400">›</span>
                <span className="text-amber-300">{destinationParam}</span>
              </>
            ) : (
              <span className="text-amber-300">{themeLabel}</span>
            )}
          </nav>
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-xs">
              ⭐ 4.9/5 Verified Reviews
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
              ✓ 100% Customizable
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-xs">
              🚗 Dedicated Private Cab
            </span>
            {packages.length > 0 && (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-xs">
                📦 {packages.length}+ Packages
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            Best {destinationParam ? `${destinationParam} ` : ""}{themeLabel} Tour Packages
          </h1>
          <p className="speakable-content text-sm sm:text-base text-white/95 max-w-3xl font-medium drop-shadow-sm">
            {destinationParam
              ? `Discover handcrafted ${destinationParam} ${themeLabel.toLowerCase()} holiday packages with verified luxury stays, private chauffeur, scenic tours and 24/7 concierge assistance.`
              : themeDescription || `Discover handcrafted ${themeLabel.toLowerCase()} holiday packages with verified luxury stays, private cabs, expert guides and 24/7 support - 100% customized to your preferences.`}
          </p>
        </div>
      </section>

      {/* Theme Switcher Strip */}
      {allThemes.length > 1 && (
        <div className="bg-white border-b border-slate-200 py-3 shadow-xs sticky top-[52px] sm:top-[56px] z-40 overflow-x-auto scrollbar-none">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 min-w-max">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0 hidden sm:block">
                All Themes:
              </span>
              <Link
                href="/themes"
                className="px-3 py-1.5 rounded-full text-[11.5px] font-bold bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-900 transition-all shrink-0"
              >
                ← All Themes Overview
              </Link>
              {allThemes.map((t: any) => (
                <Link
                  key={t.slug}
                  href={`/themes/${t.slug}${destinationParam ? `?destination=${encodeURIComponent(destinationParam)}` : ""}`}
                  className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold whitespace-nowrap transition-all ${
                    t.slug === slug
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">

            {/* Active Destination Filter Banner */}
            {destinationParam && (
              <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-700">Destination:</span>
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-2xs">
                    📍 {destinationParam}
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    {hasExactDestinationMatch
                      ? `Showing ${packages.length} matching packages`
                      : `No exact match found; showing popular ${themeLabel} options`}
                  </span>
                </div>
                <Link
                  href={`/themes/${slug}`}
                  className="text-xs font-bold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-all shrink-0"
                >
                  ✕ Clear Destination Filter
                </Link>
              </div>
            )}

            {/* Destination Quick Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold text-amber-600 tracking-wider">
                  Filter {themeLabel} Packages by Destination
                </span>
                {destinationParam && (
                  <Link href={`/themes/${slug}`} className="text-[11px] font-bold text-amber-600 hover:underline">
                    View All Destinations
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {themeDestinations.map((dest) => {
                  const isSelected = destinationParam.toLowerCase() === dest.name.toLowerCase();
                  return (
                    <Link
                      key={dest.slug}
                      href={`/themes/${slug}?destination=${encodeURIComponent(dest.name)}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 shadow-xs"
                          : "bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-950 border border-slate-200/80"
                      }`}
                    >
                      <span>{dest.icon}</span>
                      <span>{dest.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Section header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">
                  {destinationParam ? `${destinationParam} · ` : ""}{themeLabel} Holidays
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                  {packages.length > 0
                    ? `${packages.length} Curated ${destinationParam ? `${destinationParam} ` : ""}${themeLabel} Packages`
                    : `Handcrafted ${destinationParam ? `${destinationParam} ` : ""}${themeLabel} Itineraries`}
                </h2>
              </div>
              {packages.length > 0 && (
                <Link
                  href={`/customize?theme=${encodeURIComponent(themeLabel)}${destinationParam ? `&destination=${encodeURIComponent(destinationParam)}` : ""}`}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all"
                >
                  ✨ Custom Trip
                </Link>
              )}
            </div>

            {/* Packages grid or bespoke CTA */}
            {packages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packages.map((pkg: any) => (
                  <Link
                    key={pkg.slug}
                    href={`/packages/${pkg.slug}`}
                    className="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={pkg.img}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-950/80 backdrop-blur-md text-amber-400 border border-slate-800">
                          {themeLabel}
                        </span>
                      </div>
                      {pkg.destination && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-white/90 text-slate-800 text-[10px] font-bold">
                          📍 {pkg.destination}
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-black">
                        {pkg.price}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{pkg.nights}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(pkg.inclusions || []).slice(0, 3).map((inc: string, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-1.5 py-0.5 rounded"
                          >
                            ✓ {inc}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Starting from</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-black text-amber-600">{pkg.price}</span>
                            <span className="text-[10px] text-slate-400 line-through">{pkg.originalPrice}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">per person</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                            ★★★★★ <span className="text-[10px] text-slate-500 ml-1">{pkg.rating} ({pkg.reviews})</span>
                          </div>
                          <span className="text-[11px] font-bold text-amber-700 group-hover:underline">View Details →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
                <span className="text-5xl block">🌟</span>
                <h3 className="text-xl font-black text-slate-900">
                  Custom {destinationParam ? `${destinationParam} ` : ""}{themeLabel} Itineraries
                </h3>
                <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  We craft bespoke {themeLabel.toLowerCase()} holidays tailored exactly to your preferences. Tell us your dates, group size, and dream destinations.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    href={`/customize?theme=${encodeURIComponent(themeLabel)}${destinationParam ? `&destination=${encodeURIComponent(destinationParam)}` : ""}`}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-all"
                  >
                    Build Custom {themeLabel} Trip →
                  </Link>
                  <a
                    href={`https://wa.me/918091638090?text=${encodeURIComponent(`Hi Be My Traveller, I want to book a ${destinationParam ? `${destinationParam} ` : ""}${themeLabel} tour package. Please share details.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
                  >
                    💬 Chat with Expert
                  </a>
                </div>
              </div>
            )}

            {/* Popular Destinations for Theme */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">Top Destinations</span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">Explore {themeLabel} Destinations</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {themeDestinations.map((dest) => (
                  <Link
                    key={dest.slug}
                    href={dest.url}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400/60 transition-all group"
                  >
                    <span className="text-base">{dest.icon}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 group-hover:text-amber-700 truncate">{dest.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{dest.tagline}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* FAQs */}
            <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">Traveller Help</span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  Frequently Asked Questions — {destinationParam ? `${destinationParam} ` : ""}{themeLabel} Tours
                </h2>
              </div>
              <div className="space-y-3">
                {faqs.map((faq: any, idx: number) => (
                  <details
                    key={idx}
                    className="group bg-slate-50 rounded-xl p-4 border border-slate-200/80 open:bg-white open:border-amber-400/60 transition-all cursor-pointer"
                  >
                    <summary className="font-bold text-sm text-slate-900 list-none flex items-center justify-between">
                      <span>{faq.q}</span>
                      <span className="text-amber-500 text-lg group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2 pt-2 border-t border-slate-100">{faq.a}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* SEO / Why Us Block */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-2xl space-y-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">Why Be My Traveller</span>
                <h2 className="text-xl font-black text-white mt-1">Book Your {themeLabel} Holiday with Confidence</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: "🏨", title: "Verified 4-star and 5-star Hotels", desc: "Handpicked, quality-checked stays with stellar reviews" },
                  { icon: "🚗", title: "Private Sanitized Cabs", desc: "Dedicated vehicle and driver throughout your trip" },
                  { icon: "🍽️", title: "Daily Meals Included", desc: "Breakfast and dinner at your hotel, no hidden costs" },
                  { icon: "📞", title: "24/7 On-Trip Support", desc: "Real human experts available round the clock" },
                  { icon: "✨", title: "100% Customizable", desc: "Change anything — dates, hotels, destinations, activities" },
                  { icon: "💰", title: "Zero Hidden Charges", desc: "Transparent pricing with complete itinerary breakdown" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 bg-white/10 p-3 rounded-xl">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {keywords.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] text-slate-400 font-medium">Popular searches: {keywords.slice(0, 5).join(" · ")}</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-4">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                Free Bespoke Quote
              </span>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                Plan Your {destinationParam ? `${destinationParam} ` : ""}{themeLabel} Holiday
              </h3>
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Travel Month</label>
                  <select className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800">
                    <option>November 2026</option>
                    <option>December 2026</option>
                    <option>January 2027</option>
                    <option>February 2027</option>
                    <option>March 2027</option>
                    <option>April 2027</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Duration</label>
                    <select className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800">
                      <option>3N / 4D</option>
                      <option>4N / 5D (Popular)</option>
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
                <Link
                  href={`/customize?theme=${encodeURIComponent(themeLabel)}${destinationParam ? `&destination=${encodeURIComponent(destinationParam)}` : ""}`}
                  className="block w-full text-center py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md transition-all"
                >
                  Get Free Personalized Quote →
                </Link>
                <a
                  href={`https://wa.me/918091638090?text=${encodeURIComponent(`Hi Be My Traveller, I am interested in ${destinationParam ? `${destinationParam} ` : ""}${themeLabel} tour packages. Please help me plan.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full text-center py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all"
                >
                  <span>💬</span> Chat on WhatsApp
                </a>
              </div>
            </div>

            {allThemes.length > 1 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900">More Holiday Themes</h3>
                  <Link href="/themes" className="text-[11px] font-bold text-amber-600 hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-1.5">
                  {allThemes
                    .filter((t: any) => t.slug !== slug)
                    .slice(0, 8)
                    .map((t: any) => (
                      <Link
                        key={t.slug}
                        href={`/themes/${t.slug}${destinationParam ? `?destination=${encodeURIComponent(destinationParam)}` : ""}`}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 border border-transparent hover:border-amber-200/60 transition-all group"
                      >
                        <span className="font-semibold text-xs text-slate-800 group-hover:text-amber-700">{t.label}</span>
                        <span className="text-xs text-amber-600 font-bold">Explore →</span>
                      </Link>
                    ))}
                </div>
                <Link
                  href="/themes"
                  className="block text-center text-xs font-bold text-amber-600 hover:text-amber-700 pt-1 border-t border-slate-100"
                >
                  Browse All Travel Themes →
                </Link>
              </div>
            )}

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-5 rounded-2xl space-y-2">
              <h3 className="font-black text-sm text-slate-900 mb-2">Why Travellers Choose Us</h3>
              {["✈️ 5,000+ Happy Travellers", "⭐ 4.9/5 Average Rating", "🔒 100% Secure Booking", "💼 15+ Years of Experience", "🌏 Pan-India & International"].map((item) => (
                <div key={item} className="text-xs font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
