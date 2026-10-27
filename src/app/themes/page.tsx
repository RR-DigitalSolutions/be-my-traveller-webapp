import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";
import connectDB from "@/lib/db/mongoose";
import { HolidayThemeModel, DEFAULT_HOLIDAY_THEMES } from "@/domains/cms/holiday-theme.model";

export const metadata: Metadata = {
  title: "Speciality Tour Packages & Holiday Themes | Be My Traveller",
  description:
    "Explore handcrafted holiday packages curated by travel style: Honeymoon & Romance, Family Vacations, Adventure & Treks, Spiritual Pilgrimages, Heritage Stays, and Luxury Escapes. Verified 4-star & 5-star hotels, private cabs, daily meals, and 24/7 trip support.",
  keywords: [
    "holiday themes India",
    "speciality tour packages",
    "honeymoon tour packages",
    "family holiday packages",
    "adventure trekking packages",
    "pilgrimage tour packages India",
    "luxury tour packages India",
    "customized holidays",
  ],
  openGraph: {
    title: "Signature Speciality Tour Packages & Holiday Themes | Be My Traveller",
    description:
      "Handcrafted tour packages by travel style. Verified luxury stays, private cabs, meals and 24/7 trip assistance across India and worldwide.",
    url: "https://www.bemytraveller.com/themes",
    type: "website",
    siteName: "Be My Traveller",
    images: [
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Be My Traveller Speciality Holiday Themes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Speciality Tour Packages & Holiday Themes | Be My Traveller",
    description: "Handcrafted holiday packages curated by travel style.",
  },
  alternates: {
    canonical: "https://www.bemytraveller.com/themes",
  },
};

const THEME_HERO_IMAGES: Record<string, string> = {
  honeymoon: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
  adventure: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop&q=80",
  family: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&auto=format&fit=crop&q=80",
  heritage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop&q=80",
  luxury: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&auto=format&fit=crop&q=80",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
  wildlife: "https://images.unsplash.com/photo-1466853817435-05b43fe45b39?w=1200&auto=format&fit=crop&q=80",
  pilgrimage: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&auto=format&fit=crop&q=80",
  "hill-station": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80",
  "weekend-escape": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&auto=format&fit=crop&q=80",
};

const THEME_ICONS: Record<string, string> = {
  honeymoon: "💍",
  adventure: "🏔️",
  family: "👨‍👩‍👧‍👦",
  heritage: "🏛️",
  luxury: "✨",
  beach: "🏖️",
  wildlife: "🐅",
  pilgrimage: "🛕",
  "hill-station": "🌿",
  "weekend-escape": "🌄",
};

const THEME_TOP_DESTINATIONS: Record<string, string[]> = {
  honeymoon: ["Manali", "Shimla", "Kashmir", "Goa", "Kerala", "Andaman", "Maldives"],
  adventure: ["Spiti Valley", "Ladakh", "Rishikesh", "Manali", "Bir Billing", "Sikkim"],
  family: ["Shimla-Manali", "Goa", "Rajasthan", "Kerala", "Nainital", "Jim Corbett"],
  heritage: ["Rajasthan", "Agra", "Khajuraho", "Hampi", "Varanasi", "Delhi"],
  luxury: ["Kashmir Houseboats", "Rajasthan Palaces", "Kerala Resorts", "Maldives", "Andaman"],
  beach: ["Goa", "Andaman Islands", "Kerala Coast", "Gokarna", "Maldives", "Bali"],
  wildlife: ["Jim Corbett", "Ranthambore", "Kaziranga", "Bandhavgarh", "Kanha", "Gir"],
  pilgrimage: ["Kedarnath", "Chardham Yatra", "Vaishno Devi", "Tirupati", "Varanasi", "Shirdi"],
  "hill-station": ["Manali", "Shimla", "Dharamshala", "Mussoorie", "Ooty", "Munnar"],
  "weekend-escape": ["Rishikesh", "Jaipur", "Neemrana", "Kasauli", "Lansdowne", "Agra"],
};

const THEMES_FAQS = [
  {
    q: "How do I choose the best holiday theme for my trip?",
    a: "Browse based on your travel party and style! Couples typically love our Honeymoon & Romance collection with private candle-lit dinners and jacuzzi villas. Families prefer our kid-friendly itineraries with private chauffeured cars, and adventurers enjoy Spiti 4x4 or high-altitude Himalayan treks.",
  },
  {
    q: "Are holiday theme packages 100% customizable?",
    a: "Yes! Every single itinerary can be tailored to your exact travel dates, preferred hotel category (4-star or 5-star), vehicle type, and pace. You can mix themes (e.g. a romantic hill station retreat with adventure paragliding).",
  },
  {
    q: "What is included in Be My Traveller speciality packages?",
    a: "Standard packages include verified 4-star and 5-star accommodations, daily breakfast and dinner, private sanitized cab with dedicated driver for all sightseeing and transfers, state permits, and 24/7 on-trip concierge assistance.",
  },
  {
    q: "Can I combine multiple themes in one holiday?",
    a: "Absolutely. For example, you can combine a Heritage palace tour of Rajasthan with a Wildlife tiger safari in Ranthambore, or a Scenic hill station honeymoon with adventure river rafting in Himachal.",
  },
];

export default async function ThemesIndexPage() {
  let themes: any[] = [];
  const themeCounts: Record<string, number> = {};

  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db!;

    const dbThemes = await HolidayThemeModel.find({ isActive: true })
      .sort({ sortOrder: 1, label: 1 })
      .lean();

    themes = dbThemes.length > 0 ? dbThemes : (DEFAULT_HOLIDAY_THEMES as readonly any[]).map((t) => ({ ...t }));

    // Count packages per theme
    for (const t of themes) {
      const themeName = (t.name || t.slug).toUpperCase().replace(/-/g, "_");
      const themeSlugs = [themeName, t.slug, t.slug.toLowerCase(), themeName.toLowerCase()];
      const count = await db.collection("packages").countDocuments({
        $or: [
          { primaryTheme: { $in: themeSlugs } },
          { theme: { $in: themeSlugs } },
          { themes: { $in: themeSlugs } },
          { theme: themeName },
          { theme: t.slug },
          { themes: themeName },
          { themes: t.slug },
        ],
        status: { $ne: "DRAFT" },
      });
      themeCounts[t.slug] = count;
    }
  } catch {
    themes = (DEFAULT_HOLIDAY_THEMES as readonly any[]).map((t) => ({ ...t }));
  }

  const canonicalUrl = "https://www.bemytraveller.com/themes";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: "Speciality Tour Packages & Holiday Themes - Be My Traveller",
        description:
          "Explore handcrafted holiday packages curated by travel style: Honeymoon, Family, Adventure, Spiritual, Heritage, and Luxury Escapes.",
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.bemytraveller.com" },
          { "@type": "ListItem", "position": 2, "name": "Holiday Themes", "item": canonicalUrl },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${canonicalUrl}#themes`,
        name: "Speciality Holiday Themes",
        numberOfItems: themes.length,
        itemListElement: themes.map((theme: any, idx: number) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "Thing",
            name: theme.label,
            description: theme.description,
            url: `https://www.bemytraveller.com/themes/${theme.slug}`,
          },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: THEMES_FAQS.map((faq) => ({
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
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-amber-500 selection:text-slate-950 pb-16 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BmtNavMenu />

      {/* Hero */}
      <section className="relative -mt-[96px] pt-[112px] pb-12 sm:pb-16 min-h-[440px] sm:min-h-[520px] text-white flex items-end overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80"
          alt="Be My Traveller Holiday Themes"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 relative z-10 w-full space-y-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs text-amber-300 font-bold drop-shadow-sm">
            <Link href="/" className="hover:underline text-slate-200 hover:text-white">Home</Link>
            <span className="text-slate-400">›</span>
            <span className="text-amber-300">Holiday Themes</span>
          </nav>
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-xs">
              ✨ 10+ Signature Travel Styles
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
              ✓ 100% Tailor-Made Itineraries
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-xs">
              🚗 Dedicated Private Cabs
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-xs">
              ⭐ 4.9/5 Verified Reviews
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            Signature Holiday Themes & Speciality Tours
          </h1>
          <p className="text-sm sm:text-base text-white/90 max-w-3xl font-medium drop-shadow-sm">
            Discover vacations designed around how you love to travel. From candle-lit honeymoon suites and high-altitude Himalayan treks to sacred pilgrimage yatras and kid-friendly family resorts.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex-1 space-y-12">
        {/* Intro strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">Curated Styles</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">Explore by Travel Theme</h2>
          </div>
          <Link
            href="/customize"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            ✨ Custom Trip Builder →
          </Link>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme: any) => {
            const count = themeCounts[theme.slug] || 0;
            const heroImage = THEME_HERO_IMAGES[theme.slug] || THEME_HERO_IMAGES.honeymoon;
            const icon = THEME_ICONS[theme.slug] || "🌟";
            const topDests = THEME_TOP_DESTINATIONS[theme.slug] || ["Himachal", "Goa", "Kashmir", "Kerala"];

            return (
              <Link
                key={theme.slug}
                href={`/themes/${theme.slug}`}
                className="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                {/* Image Banner */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={heroImage}
                    alt={`${theme.label} Tour Packages`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white border border-slate-700 text-xs font-black">
                    <span>{icon}</span>
                    <span>{theme.label}</span>
                  </div>
                  {count > 0 && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black shadow-xs">
                      {count} {count === 1 ? "Package" : "Packages"}
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">Starting from ₹12,999</p>
                    <h3 className="text-xl font-black text-white leading-tight mt-0.5">{theme.label}</h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1 space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {theme.description || `Handcrafted ${theme.label.toLowerCase()} itineraries with verified 4/5-star hotels, private cab and 24/7 concierge.`}
                  </p>

                  {/* Top Destinations */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">Top Destinations:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {topDests.slice(0, 5).map((dest, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80"
                        >
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <span>✓</span> 100% Tailor-Made
                    </span>
                    <span className="text-xs font-black text-amber-600 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all flex items-center gap-1">
                      View Packages →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Custom Itinerary Banner */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-500 text-slate-950 inline-block">
              ✨ Free Bespoke Planning
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Can't Find Your Exact Travel Style?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Our travel specialists design completely bespoke holidays for honeymoons, family reunions, corporate retreats, luxury villa buyouts, and solo expeditions. You pick the dates, destinations, and hotel stars — we handle every detail.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/customize"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg transition-all"
              >
                Plan a Custom Holiday →
              </Link>
              <a
                href="https://wa.me/918091638090?text=Hi%20Be%20My%20Traveller,%20I%20would%20like%20to%20plan%20a%20custom%20holiday%20package."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2"
              >
                <span>💬</span> WhatsApp an Expert
              </a>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:block opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent" />
        </section>

        {/* Why Choose Be My Traveller */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">The Be My Traveller Promise</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Why Book Your Theme Holiday with Us?</h2>
            <p className="text-xs sm:text-sm text-slate-600">Every package is curated with passion, verified for quality, and backed by round-the-clock concierge support.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {[
              {
                icon: "🏨",
                title: "Verified 4 & 5-Star Stays",
                desc: "Handpicked boutique hotels, luxury resorts, and romantic pool villas checked for hygiene and hospitality.",
              },
              {
                icon: "🚗",
                title: "Private Dedicated Cabs",
                desc: "Sanitized AC vehicles with courteous, background-verified drivers throughout your holiday.",
              },
              {
                icon: "🍽️",
                title: "Daily Meals Included",
                desc: "Breakfast and dinner provided at hotels so you focus entirely on sightseeing and relaxing.",
              },
              {
                icon: "📞",
                title: "24/7 Live Concierge",
                desc: "Dedicated personal travel manager available via call and WhatsApp across your entire trip.",
              },
            ].map((feature) => (
              <div key={feature.title} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-3xl block">{feature.icon}</span>
                <h4 className="font-bold text-sm text-slate-900">{feature.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-5">
          <div>
            <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">Traveller Help</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {THEMES_FAQS.map((faq, idx) => (
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
      </main>

      <SiteFooter />
    </div>
  );
}
