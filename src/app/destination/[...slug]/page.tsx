import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";
import DestinationCardCarousel, { DestinationCardItem } from "@/components/destinations/DestinationCardCarousel";
import DestinationPackageGrid from "@/components/destinations/DestinationPackageGrid";
import connectDB from "@/lib/db/mongoose";
import {
  parseDestinationSlug,
  buildDestinationUrl,
  stripPackageSuffix,
  PLACE_TO_STATE_MAP,
  STATE_SLUG_MAP,
} from "@/lib/destinations/slug-resolver";

interface DestinationRouteProps {
  params: Promise<{ slug: string[] }>;
}

// ── Curated High-Converting Master Database for Indian States & Places ──
const REGIONAL_DESTINATIONS: Record<string, any> = {
  // ── COUNTRY: INDIA ──
  india: {
    name: "India",
    type: "COUNTRY",
    countryName: "India",
    tagline: "28 States, 8 Union Territories · Royal Forts, Snow Valleys & Emerald Backwaters",
    heroImg: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&auto=format&fit=crop&q=80",
    overview:
      "India is a land of infinite wonders, where snow-draped Himalayan ranges meet royal sandstone desert palaces, tranquil tropical backwaters, and pristine coral islands. Explore handcrafted holiday packages with verified 4-star & 5-star hotels, private chauffeured cabs, and 24/7 dedicated concierge assistance.",
    startingPrice: "₹12,999",
    idealDuration: "5 to 14 Days",
    bestTime: "October to April (Ideal throughout India) · Year-round for Hill Stations",
    weather: "Diverse: 15°C to 30°C in plains · -5°C to 18°C in Himalayas",
    howToReach: "Major international hubs: New Delhi (DEL), Mumbai (BOM), Bengaluru (BLR), Cochin (COK). Domestic flights connect all state capitals.",
    childPlaces: [
      { name: "Himachal Pradesh", slug: "himachal", stateSlug: "himachal", count: "24 Tours", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80", price: "₹14,999", tag: "Snow & Peaks" },
      { name: "Kashmir Paradise", slug: "kashmir", stateSlug: "kashmir", count: "18 Tours", img: "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=600&auto=format&fit=crop&q=80", price: "₹24,999", tag: "Shikara & Gondola" },
      { name: "Kerala Backwaters", slug: "kerala", stateSlug: "kerala", count: "21 Tours", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80", price: "₹19,499", tag: "Houseboats & Tea" },
      { name: "Royal Rajasthan", slug: "rajasthan", stateSlug: "rajasthan", count: "16 Tours", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80", price: "₹18,500", tag: "Palaces & Forts" },
      { name: "Goa Coastal Escapes", slug: "goa", stateSlug: "goa", count: "20 Tours", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80", price: "₹12,999", tag: "Beaches & Sunsets" },
      { name: "Andaman Islands", slug: "andaman", stateSlug: "andaman", count: "14 Tours", img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&auto=format&fit=crop&q=80", price: "₹28,999", tag: "Scuba & Coral" },
      { name: "Uttarakhand Hill Stations", slug: "uttarakhand", stateSlug: "uttarakhand", count: "14 Tours", img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80", price: "₹15,999", tag: "Ganga & Valleys" },
      { name: "Sikkim & Darjeeling", slug: "sikkim", stateSlug: "sikkim", count: "15 Tours", img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600&auto=format&fit=crop&q=80", price: "₹22,999", tag: "Kanchenjunga" },
    ],
    packages: [
      {
        slug: "6-nights-himachal-manali-tour",
        title: "6 Nights 7 Days Majestic Himachal & Rohtang Pass Tour",
        route: "Shimla (2N) · Manali (3N) · Chandigarh (1N)",
        nights: "6 Nights / 7 Days",
        price: "₹29,999",
        originalPrice: "₹38,000",
        rating: 4.9,
        reviews: 184,
        img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
        inclusions: ["4★ Hotel Stays", "Private AC Cab", "Daily Meals", "Sightseeing"],
      },
      {
        slug: "5-nights-kashmir-paradise-tour",
        title: "5 Nights 6 Days Heavenly Kashmir with Gulmarg Gondola & Houseboat",
        route: "Srinagar (2N) · Gulmarg (1N) · Pahalgam (1N) · Houseboat (1N)",
        nights: "5 Nights / 6 Days",
        price: "₹24,999",
        originalPrice: "₹34,000",
        rating: 4.9,
        reviews: 248,
        img: "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&auto=format&fit=crop&q=80",
        inclusions: ["4★ Stays & Houseboat", "Private Cab", "Daily Breakfast & Dinner", "Shikara Ride"],
      },
      {
        slug: "5-nights-kerala-backwaters-luxury",
        title: "5 Nights 6 Days Kerala Tea Estates, Spice Hills & Alleppey Houseboat",
        route: "Munnar (2N) · Thekkady (1N) · Alleppey Houseboat (1N) · Cochin (1N)",
        nights: "5 Nights / 6 Days",
        price: "₹27,999",
        originalPrice: "₹37,000",
        rating: 4.9,
        reviews: 198,
        img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80",
        inclusions: ["4★ Resort Stays", "Private Houseboat with Chef", "Private Cab", "All Meals on Boat"],
      },
    ],
    faqs: [
      { q: "How are tours arranged across India?", a: "All Be My Traveller holidays are 100% tailor-made. We arrange verified 4-star/5-star hotels, dedicated private sanitized vehicles with local drivers, and on-trip support." },
      { q: "Can we combine multiple states in one itinerary?", a: "Yes, popular combo tours include Delhi-Agra-Jaipur (Golden Triangle), Himachal-Kashmir, Kerala-Karnataka, or North East multi-state circuits." },
    ],
  },

  // ── STATE: HIMACHAL PRADESH ──
  himachal: {
    name: "Himachal Pradesh",
    type: "STATE",
    countryName: "India",
    stateName: "Himachal Pradesh",
    tagline: "Valley of Gods · Rohtang Snow Pass, Solang Valley & Colonial Hill Stays",
    heroImg: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600&auto=format&fit=crop&q=80",
    overview:
      "Himachal Pradesh is India's crown jewel for Himalayan escapes. From high-altitude snow adventures in Manali and Solang Valley to colonial heritage in Shimla and Tibetan spirituality in Dharamshala, our Himachal tour packages offer the perfect balance of luxury and mountain wilderness.",
    startingPrice: "₹14,999",
    idealDuration: "5 to 8 Days",
    bestTime: "Oct to Jun (Peak Snow Dec–Feb · Pleasant Summers Apr–Jun)",
    weather: "Summer: 12°C to 28°C · Winter: -7°C to 10°C (Heavy Snow)",
    howToReach: "Fly to Chandigarh (IXC) or Bhuntar (KUU). Daily luxury Volvo coaches and private cabs connect from Delhi and Chandigarh.",
    childPlaces: [
      { name: "Manali", slug: "manali", stateSlug: "himachal", count: "12 Tours", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80", price: "₹14,999", tag: "Snow & Skiing" },
      { name: "Shimla", slug: "shimla", stateSlug: "himachal", count: "8 Tours", img: "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=600&auto=format&fit=crop&q=80", price: "₹12,999", tag: "Queen of Hills" },
      { name: "Dharamshala & McLeodganj", slug: "dharamshala", stateSlug: "himachal", count: "6 Tours", img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&auto=format&fit=crop&q=80", price: "₹15,499", tag: "Tibetan Heritage" },
      { name: "Spiti Valley", slug: "spiti", stateSlug: "himachal", count: "5 Tours", img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600&auto=format&fit=crop&q=80", price: "₹34,500", tag: "4x4 Roadtrip" },
      { name: "Kasol & Parvati Valley", slug: "kasol", stateSlug: "himachal", count: "4 Tours", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80", price: "₹11,999", tag: "Cafes & Treks" },
      { name: "Dalhousie & Khajjiar", slug: "dalhousie", stateSlug: "himachal", count: "5 Tours", img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80", price: "₹16,999", tag: "Mini Switzerland" },
    ],
    packages: [
      {
        slug: "6-nights-himachal-manali-tour",
        title: "6 Nights 7 Days Majestic Himachal & Rohtang Pass Tour",
        route: "Shimla (2N) · Manali (3N) · Chandigarh (1N)",
        nights: "6 Nights / 7 Days",
        price: "₹29,999",
        originalPrice: "₹38,000",
        rating: 4.9,
        reviews: 184,
        img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
        inclusions: ["4★ Hotel Stays", "Private AC Cab", "Daily Meals", "Sightseeing"],
      },
    ],
    faqs: [
      { q: "What is the best itinerary for a first-time Himachal trip?", a: "A 6 Nights / 7 Days Shimla, Kullu, and Manali itinerary is the most popular, covering Mall Road, Kufri, Solang Valley, Rohtang Pass, and Atal Tunnel." },
    ],
  },

  // ── PLACE: MANALI (under Himachal) ──
  manali: {
    name: "Manali",
    type: "CITY",
    countryName: "India",
    stateName: "Himachal Pradesh",
    stateSlug: "himachal",
    tagline: "Snow Valleys, Solang Adventures & Rohtang Pass High-Altitude Drives",
    heroImg: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600&auto=format&fit=crop&q=80",
    overview:
      "Nestled in the breathtaking Beas River valley at 6,726 feet, Manali is India's most celebrated mountain escape. Renowned for snow sports at Solang Valley, high-altitude expeditions to Rohtang Pass and Atal Tunnel, Hadimba Devi Temple, and vibrant Old Manali cafes.",
    startingPrice: "₹14,999",
    idealDuration: "4 to 6 Days",
    bestTime: "Oct to Jun (Peak Snow Dec–Feb · Pleasant Summers Apr–Jun)",
    weather: "Summer: 10°C to 25°C · Winter: -7°C to 10°C (Snowfall)",
    howToReach: "Nearest Airport: Bhuntar (50 km). Volvo coaches & private cabs connect from Delhi (530 km) and Chandigarh (290 km).",
    attractions: [
      { name: "Solang Valley", desc: "Adventure sports capital offering paragliding, ATV quad biking, zorbing, and winter snow skiing.", img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&auto=format&fit=crop&q=80" },
      { name: "Rohtang Pass", desc: "Majestic 13,058 ft snow pass with jaw-dropping views of Pir Panjal peaks and Lahaul Valley.", img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&auto=format&fit=crop&q=80" },
      { name: "Hadimba Devi Temple", desc: "16th-century four-tiered wooden pagoda temple nestled inside towering cedar pine forests.", img: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&auto=format&fit=crop&q=80" },
      { name: "Atal Tunnel & Sissu", desc: "World's longest highway tunnel above 10,000 ft leading to picturesque Sissu waterfall in Lahaul.", img: "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=600&auto=format&fit=crop&q=80" },
    ],
    packages: [
      {
        slug: "6-nights-himachal-manali-tour",
        title: "6 Nights 7 Days Majestic Himachal & Rohtang Pass Tour",
        route: "Shimla (2N) · Manali (3N) · Chandigarh (1N)",
        nights: "6 Nights / 7 Days",
        price: "₹29,999",
        originalPrice: "₹38,000",
        rating: 4.9,
        reviews: 184,
        img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
        inclusions: ["4★ Hotel Stays", "Private AC Sedan", "Breakfast & Dinner", "Rohtang Permit Support"],
      },
      {
        slug: "4-nights-manali-volvo-honeymoon-package",
        title: "4 Nights 5 Days Manali Luxury Volvo & Solang Valley Special",
        route: "Delhi to Manali (Overnight Volvo) · Manali Stays (3N)",
        nights: "4 Nights / 5 Days",
        price: "₹14,999",
        originalPrice: "₹21,500",
        rating: 4.9,
        reviews: 215,
        img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&auto=format&fit=crop&q=80",
        inclusions: ["Luxury Volvo Transfers", "Valley View Resort", "Candlelight Dinner", "Sightseeing Cab"],
      },
    ],
    faqs: [
      { q: "What is the best time to see snowfall in Manali?", a: "Snowfall in Manali town and Solang Valley typically starts in mid-December and lasts through February." },
    ],
  },
  // ── PLACE: SHIMLA (under Himachal) ──
  shimla: {
    name: "Shimla",
    type: "CITY",
    countryName: "India",
    stateName: "Himachal Pradesh",
    stateSlug: "himachal",
    tagline: "Queen of Hills · Mall Road, Colonial Heritage & Kufri Snow Viewpoint",
    heroImg: "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=1600&auto=format&fit=crop&q=80",
    overview:
      "Shimla, the former summer capital of British India, is renowned for its historic Victorian architecture, vibrant Mall Road, Christ Church on The Ridge, and scenic snow activities in Kufri.",
    startingPrice: "₹12,999",
    idealDuration: "3 to 5 Days",
    bestTime: "October to June (Pleasant Summers & Winter Snowfall)",
    weather: "Summer: 15°C to 26°C · Winter: -2°C to 12°C",
    howToReach: "Nearest Airport: Chandigarh (115 km) or Jubbarhatti (22 km). Connected by Kalka-Shimla Toy Train.",
    attractions: [
      { name: "Mall Road & The Ridge", desc: "Pedestrian-only promenade bustling with cafes, handicraft emporiums, and iconic Christ Church.", img: "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=600&auto=format&fit=crop&q=80" },
      { name: "Kufri Snow Point", desc: "Scenic alpine adventure zone offering horse rides, yak rides, and snow sledging.", img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&auto=format&fit=crop&q=80" },
      { name: "Jakhoo Hanuman Temple", desc: "Ancient hilltop temple at 8,054 ft featuring the world's tallest 108 ft Hanuman statue.", img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80" },
      { name: "Viceregal Lodge", desc: "Majestic Scottish baronial mansion surrounded by manicured botanical gardens.", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80" },
    ],
    packages: [
      {
        slug: "6-nights-himachal-manali-tour",
        title: "6 Nights 7 Days Shimla, Kullu & Manali Classic Tour",
        route: "Shimla (2N) · Manali (3N) · Chandigarh (1N)",
        nights: "6 Nights / 7 Days",
        price: "₹29,999",
        originalPrice: "₹38,000",
        rating: 4.9,
        reviews: 184,
        img: "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800&auto=format&fit=crop&q=80",
        inclusions: ["4★ Hotel Stays", "Private AC Cab", "Daily Meals", "Kufri Sightseeing"],
      },
      {
        slug: "3-nights-shimla-weekend-getaway",
        title: "3 Nights 4 Days Shimla & Kufri Scenic Hill Getaway",
        route: "Delhi/Chandigarh to Shimla Stays (3N)",
        nights: "3 Nights / 4 Days",
        price: "₹12,999",
        originalPrice: "₹18,000",
        rating: 4.8,
        reviews: 112,
        img: "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800&auto=format&fit=crop&q=80",
        inclusions: ["Deluxe Hotel Stays", "Private Cab", "Daily Breakfast & Dinner", "Mall Road Walking Tour"],
      },
    ],
    faqs: [
      { q: "What are the top things to do in Shimla?", a: "Stroll along Mall Road, take a horse ride at Kufri, visit Jakhoo Temple, and experience the historic UNESCO Toy Train." },
    ],
  },

  // ── PLACE: DHARAMSHALA (under Himachal) ──
  dharamshala: {
    name: "Dharamshala",
    type: "CITY",
    countryName: "India",
    stateName: "Himachal Pradesh",
    stateSlug: "himachal",
    tagline: "Little Lhasa · Dalai Lama Temple, Triund Trek & Kangra Valley Tea Hills",
    heroImg: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&auto=format&fit=crop&q=80",
    overview:
      "Perched against the majestic snow-capped Dhauladhar range, Dharamshala & McLeodganj offer a serene blend of Tibetan Buddhist culture, panoramic mountain treks, and lush tea gardens.",
    startingPrice: "₹15,499",
    idealDuration: "3 to 5 Days",
    bestTime: "March to June & Sept to Nov (Ideal Trekking & Clear Skies)",
    weather: "Summer: 15°C to 28°C · Winter: 0°C to 14°C",
    howToReach: "Fly to Gaggal Airport (DHM, 15 km) or drive from Pathankot (85 km).",
    attractions: [
      { name: "Tsuglagkhang Complex (Dalai Lama Temple)", desc: "Spiritual headquarters of His Holiness the Dalai Lama and Tibetan monastery.", img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&auto=format&fit=crop&q=80" },
      { name: "Triund Hill Trek", desc: "Spectacular beginner-friendly day trek offering panoramic views of Dhauladhar glaciers.", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80" },
      { name: "Bhagsunag Waterfall & Shiva Cafe", desc: "Cascading mountain waterfall with hippie mountain cafes and ancient temple.", img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80" },
    ],
    packages: [
      {
        slug: "4-nights-dharamshala-dalhousie-tour",
        title: "4 Nights 5 Days Dharamshala, McLeodganj & Dalhousie Tour",
        route: "Dharamshala (2N) · Dalhousie & Khajjiar (2N)",
        nights: "4 Nights / 5 Days",
        price: "₹17,999",
        originalPrice: "₹24,000",
        rating: 4.9,
        reviews: 135,
        img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&auto=format&fit=crop&q=80",
        inclusions: ["4★ Resort Stays", "Private AC Sedan", "Breakfast & Dinner", "Sightseeing"],
      },
    ],
    faqs: [
      { q: "Is McLeodganj different from Dharamshala?", a: "McLeodganj is the upper suburb of Dharamshala (9 km uphill) where the Dalai Lama resides and most Tibetan cafes are located." },
    ],
  },

  // ── PLACE: JIBHI (under Himachal) ──
  jibhi: {
    name: "Jibhi",
    type: "CITY",
    countryName: "India",
    stateName: "Himachal Pradesh",
    stateSlug: "himachal",
    tagline: "Hidden Valley of Tirthan · Pine Forests, Waterfall Hikes & Serolsar Lake",
    heroImg: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80",
    overview:
      "Tucked inside the pristine Banjar Valley of Himachal, Jibhi is an offbeat paradise of traditional wooden cottages, crystal-clear trout streams, lush cedar forests, and Jalori Pass.",
    startingPrice: "₹13,999",
    idealDuration: "3 to 5 Days",
    bestTime: "March to June & Sept to Nov",
    weather: "Summer: 12°C to 24°C · Winter: -4°C to 10°C",
    howToReach: "Fly to Bhuntar (KUU, 60 km) or overnight Volvo from Delhi to Aut tunnel followed by private cab.",
    attractions: [
      { name: "Jibhi Waterfall", desc: "Enchanting hidden waterfall accessed via rustic wooden bridges inside pine forest.", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80" },
      { name: "Jalori Pass & Serolsar Lake", desc: "High-altitude 10,800 ft mountain pass with an alpine trek to holy Serolsar Lake.", img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600&auto=format&fit=crop&q=80" },
      { name: "Chehni Kothi Tower", desc: "1,500-year-old traditional Kathkuni architectural timber tower in ancient village.", img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80" },
    ],
    packages: [
      {
        slug: "4-nights-jibhi-tirthan-valley-tour",
        title: "4 Nights 5 Days Serene Jibhi, Tirthan Valley & Jalori Pass Tour",
        route: "Jibhi Valley (3N) · Tirthan Trout River (1N)",
        nights: "4 Nights / 5 Days",
        price: "₹15,499",
        originalPrice: "₹21,000",
        rating: 4.9,
        reviews: 94,
        img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
        inclusions: ["Wooden Cottage Stay", "Private Cab", "Daily Meals", "Jalori Pass Trek Guide"],
      },
    ],
    faqs: [
      { q: "Why is Jibhi famous?", a: "Jibhi is famous for untouched pine forests, waterfall walks, trout fishing in Tirthan, and high-altitude Serolsar Lake treks." },
    ],
  },

  // ── PLACE: MUNNAR (under Kerala) ──
  munnar: {
    name: "Munnar",
    type: "CITY",
    countryName: "India",
    stateName: "Kerala",
    stateSlug: "kerala",
    tagline: "Rolling Tea Plantations, Eravikulam Nilgiri Tahr & Misty Waterfalls",
    heroImg: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1600&auto=format&fit=crop&q=80",
    overview:
      "Perched at 5,200 ft in the Western Ghats, Munnar is South India's premier hill station, world-famous for emerald green carpet tea estates, rare Neelakurinji blooms, and cool mountain breezes.",
    startingPrice: "₹16,999",
    idealDuration: "3 to 5 Days",
    bestTime: "September to May (Pleasant & Clear Hills)",
    weather: "Pleasant: 15°C to 25°C year-round",
    howToReach: "Fly to Cochin International Airport (COK, 110 km). Scenic 3.5 hr private cab ride.",
    attractions: [
      { name: "Eravikulam National Park", desc: "Home to endangered Nilgiri Tahr and highest peak Anamudi.", img: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&auto=format&fit=crop&q=80" },
      { name: "Mattupetty Dam & Echo Point", desc: "Picturesque dam with speed boating, elephant spotting, and natural acoustic echo point.", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80" },
      { name: "Tata Tea Museum", desc: "Historic tea processing machinery and authentic Kerala tea tasting experience.", img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80" },
    ],
    packages: [
      {
        slug: "5-nights-kerala-backwaters-luxury",
        title: "5 Nights 6 Days Munnar Tea Estates & Alleppey Houseboat Classic",
        route: "Munnar (2N) · Thekkady (1N) · Alleppey Houseboat (1N) · Cochin (1N)",
        nights: "5 Nights / 6 Days",
        price: "₹27,999",
        originalPrice: "₹37,000",
        rating: 4.9,
        reviews: 198,
        img: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&auto=format&fit=crop&q=80",
        inclusions: ["4★ Resort Stays", "Private Houseboat with Chef", "Private Cab", "All Meals on Boat"],
      },
    ],
    faqs: [
      { q: "What is the best time to visit Munnar?", a: "September to March provides crystal-clear blue skies, misty mornings, and pleasant temperatures." },
    ],
  },

  // ── PLACE: GULMARG (under Kashmir) ──
  gulmarg: {
    name: "Gulmarg",
    type: "CITY",
    countryName: "India",
    stateName: "Jammu & Kashmir",
    stateSlug: "kashmir",
    tagline: "Meadow of Flowers · World's Highest Gondola & Powder Snow Skiing",
    heroImg: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&auto=format&fit=crop&q=80",
    overview:
      "Gulmarg is India's premier winter sports wonderland and summer floral meadow. Home to the world's highest cable car (Gulmarg Gondola Phase 1 & Phase 2 up to 13,780 ft) with breathtaking vistas of Apharwat Peak.",
    startingPrice: "₹24,999",
    idealDuration: "3 to 5 Days",
    bestTime: "Dec to Feb (Snow Sports) · April to June (Flower Blossoms)",
    weather: "Summer: 12°C to 22°C · Winter: -8°C to 4°C (Deep Snow)",
    howToReach: "Fly to Srinagar Airport (SXR, 56 km). 1.5 hr private cab transfer.",
    attractions: [
      { name: "Gulmarg Gondola (Phase 1 & 2)", desc: "World's second highest operating cable car ascending to Mount Apharwat at 13,780 ft.", img: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80" },
      { name: "Apharwat Peak Snow Slopes", desc: "World-class off-piste powder skiing, snowboarding, and snowmobiling.", img: "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=600&auto=format&fit=crop&q=80" },
      { name: "St. Mary's Victorian Church", desc: "100-year-old historic stone church set amidst alpine meadows and snow pines.", img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600&auto=format&fit=crop&q=80" },
    ],
    packages: [
      {
        slug: "5-nights-kashmir-paradise-tour",
        title: "5 Nights 6 Days Gulmarg Gondola, Srinagar & Pahalgam Special",
        route: "Srinagar (2N) · Gulmarg (1N) · Pahalgam (1N) · Houseboat (1N)",
        nights: "5 Nights / 6 Days",
        price: "₹24,999",
        originalPrice: "₹34,000",
        rating: 4.9,
        reviews: 248,
        img: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80",
        inclusions: ["4★ Hotel & Houseboat", "Private Cab", "Breakfast & Dinner", "Shikara Ride"],
      },
    ],
    faqs: [
      { q: "How do I book tickets for the Gulmarg Gondola?", a: "Gondola Phase 1 & Phase 2 tickets should be pre-booked online through official portal or arranged via Be My Traveller package." },
    ],
  },

  // ── STATE: KASHMIR ──
  kashmir: {
    name: "Kashmir",
    type: "STATE",
    countryName: "India",
    stateName: "Jammu & Kashmir",
    tagline: "Paradise on Earth · Dal Lake Shikaras, Gulmarg Gondola & Betaab Valley",
    heroImg: "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=1600&auto=format&fit=crop&q=80",
    overview:
      "Kashmir enchants travellers with ornate wooden houseboats on Dal Lake, world-class ski slopes and gondola rides at Gulmarg, saffron meadows in Pampore, and pine valleys in Pahalgam.",
    startingPrice: "₹24,999",
    idealDuration: "5 to 7 Days",
    bestTime: "April to October (Lush Meadows) · Dec to Feb (Snowfall & Skiing)",
    weather: "Summer: 14°C to 28°C · Winter: -5°C to 8°C",
    howToReach: "Fly directly to Srinagar International Airport (SXR).",
    childPlaces: [
      { name: "Gulmarg", slug: "gulmarg", stateSlug: "kashmir", count: "8 Tours", img: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80", price: "₹24,999", tag: "Gondola & Snow" },
      { name: "Srinagar", slug: "srinagar", stateSlug: "kashmir", count: "10 Tours", img: "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=600&auto=format&fit=crop&q=80", price: "₹21,999", tag: "Houseboats & Gardens" },
      { name: "Pahalgam", slug: "pahalgam", stateSlug: "kashmir", count: "6 Tours", img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&auto=format&fit=crop&q=80", price: "₹23,500", tag: "Betaab & Aru Valley" },
      { name: "Sonamarg", slug: "sonamarg", stateSlug: "kashmir", count: "4 Tours", img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600&auto=format&fit=crop&q=80", price: "₹22,999", tag: "Thajiwas Glacier" },
    ],
    packages: [
      {
        slug: "5-nights-kashmir-paradise-tour",
        title: "5 Nights 6 Days Kashmir Paradise, Gulmarg & Houseboat Escape",
        route: "Srinagar (2N) · Gulmarg (1N) · Pahalgam (1N) · Houseboat (1N)",
        nights: "5 Nights / 6 Days",
        price: "₹24,999",
        originalPrice: "₹34,000",
        rating: 4.9,
        reviews: 248,
        img: "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&auto=format&fit=crop&q=80",
        inclusions: ["4★ Hotel & Houseboat", "Private Cab", "Breakfast & Dinner", "Shikara Ride"],
      },
    ],
    faqs: [
      { q: "Is Kashmir safe for families and honeymooners?", a: "Yes, Kashmir is peaceful and welcoming with thousands of happy tourists visiting daily." },
    ],
  },

  // ── STATE: KERALA ──
  kerala: {
    name: "Kerala",
    type: "STATE",
    countryName: "India",
    stateName: "Kerala",
    tagline: "God's Own Country · Alleppey Houseboats & Munnar Tea Terraces",
    heroImg: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&auto=format&fit=crop&q=80",
    overview:
      "Kerala is an enchanting tropical paradise on India's Malabar Coast. Famed for palm-fringed emerald backwaters, world-renowned Ayurvedic healing, misty tea estates in Munnar, and wildlife safaris in Thekkady.",
    startingPrice: "₹19,499",
    idealDuration: "5 to 7 Days",
    bestTime: "September to March (Pleasant) · June to August (Ayurveda Monsoon)",
    weather: "Tropical: 22°C to 32°C year-round",
    howToReach: "Fly to Cochin International Airport (COK) or Trivandrum (TRV).",
    childPlaces: [
      { name: "Munnar", slug: "munnar", stateSlug: "kerala", count: "9 Tours", img: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&auto=format&fit=crop&q=80", price: "₹19,499", tag: "Tea Gardens" },
      { name: "Alleppey", slug: "alleppey", stateSlug: "kerala", count: "11 Tours", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80", price: "₹22,999", tag: "Houseboats" },
      { name: "Thekkady", slug: "thekkady", stateSlug: "kerala", count: "5 Tours", img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80", price: "₹18,500", tag: "Periyar Wildlife" },
      { name: "Kovalam & Varkala", slug: "kovalam", stateSlug: "kerala", count: "6 Tours", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80", price: "₹21,000", tag: "Cliff Beaches" },
      { name: "Wayanad", slug: "wayanad", stateSlug: "kerala", count: "5 Tours", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80", price: "₹17,999", tag: "Rainforest Resorts" },
    ],
    packages: [
      {
        slug: "5-nights-kerala-backwaters-luxury",
        title: "5 Nights 6 Days Kerala Romance, Tea Estates & Luxury Houseboat",
        route: "Munnar (2N) · Thekkady (1N) · Alleppey (1N) · Cochin (1N)",
        nights: "5 Nights / 6 Days",
        price: "₹27,999",
        originalPrice: "₹37,000",
        rating: 4.9,
        reviews: 198,
        img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80",
        inclusions: ["4★ Resort Stays", "Private Houseboat with Chef", "Private Cab", "All Meals on Boat"],
      },
    ],
    faqs: [
      { q: "What is included in the Alleppey houseboat stay?", a: "A private houseboat with personal chef, captain, welcome drink, traditional Kerala meals, and sunset backwater cruising." },
    ],
  },

  // ── STATE: RAJASTHAN ──
  rajasthan: {
    name: "Rajasthan",
    type: "STATE",
    countryName: "India",
    stateName: "Rajasthan",
    tagline: "Land of Kings · Grand Forts, Desert Safaris & Royal Palace Stays",
    heroImg: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&auto=format&fit=crop&q=80",
    overview:
      "Experience royal grandeur across the Pink City of Jaipur, romantic lake palaces of Udaipur, golden sand dunes of Jaisalmer, and majestic blue forts of Jodhpur.",
    startingPrice: "₹18,500",
    idealDuration: "6 to 9 Days",
    bestTime: "October to March (Pleasant & Desert Festival Season)",
    weather: "Winter: 10°C to 26°C · Summer: 28°C to 42°C",
    howToReach: "Fly to Jaipur (JAI) or Udaipur (UDR). Express trains connect from Delhi & Mumbai.",
    childPlaces: [
      { name: "Jaipur (Pink City)", slug: "jaipur", stateSlug: "rajasthan", count: "11 Tours", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80", price: "₹15,999", tag: "Hawa Mahal & Amber" },
      { name: "Udaipur (City of Lakes)", slug: "udaipur", stateSlug: "rajasthan", count: "9 Tours", img: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&auto=format&fit=crop&q=80", price: "₹19,500", tag: "Lake Pichola Luxury" },
      { name: "Jaisalmer (Golden City)", slug: "jaisalmer", stateSlug: "rajasthan", count: "7 Tours", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80", price: "₹16,999", tag: "Sam Sand Dunes" },
      { name: "Jodhpur (Blue City)", slug: "jodhpur", stateSlug: "rajasthan", count: "6 Tours", img: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=600&auto=format&fit=crop&q=80", price: "₹16,499", tag: "Mehrangarh Fort" },
    ],
    packages: [
      {
        slug: "6-nights-royal-rajasthan-heritage-tour",
        title: "6 Nights 7 Days Royal Rajasthan Forts, Palaces & Desert Safari",
        route: "Jaipur (2N) · Jodhpur (1N) · Jaisalmer Dunes (2N) · Bikaner (1N)",
        nights: "6 Nights / 7 Days",
        price: "₹28,500",
        originalPrice: "₹36,000",
        rating: 4.9,
        reviews: 172,
        img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
        inclusions: ["Heritage Hotel Stays", "Desert Swiss Camp with Camel Safari", "Private AC Cab", "Daily Meals"],
      },
    ],
    faqs: [
      { q: "What are the must-visit cities in Rajasthan?", a: "The classic circuit includes Jaipur, Jodhpur, Jaisalmer (Desert Camp), and Udaipur." },
    ],
  },
};

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
  } catch (e) {
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
  const rawSlugs = parsed.rawSegments.map((s) => stripPackageSuffix(s).toLowerCase());

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

  // 1. Try DB lookup first
  let dbDest: any = null;
  let dbChildDestinations: any[] = [];
  let dbPackages: any[] = [];

  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (db) {
      // Find destination document for THIS specific target ONLY
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

      if (isCountryLevel) {
        // COUNTRY LEVEL (e.g. India): Query ONLY States & UTs (NEVER individual cities/places)
        dbChildDestinations = await db
          .collection("destinations")
          .find({
            type: { $in: ["STATE", "UNION_TERRITORY", "ISLAND"] },
            slug: { $nin: ["india", "all-india", "world", "international"] },
            status: { $ne: "DRAFT" },
          })
          .sort({ displayOrder: 1, sortOrder: 1, name: 1 })
          .toArray();
      } else if (isStateLevel) {
        // STATE LEVEL (e.g. Himachal Pradesh): Query Places/Cities belonging to this State
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
      } else {
        // CITY/PLACE LEVEL (e.g. Manali): Query Sibling places in the same state
        const parentStateSlug = parsed.stateSlug || dbDest?.stateSlug || "himachal";
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

      // Query packages from DB specifically for this target
      const packageSearchTerms = Array.from(
        new Set([
          targetSlug,
          targetSlug.replace(/-/g, " "),
          parsed.placeSlug,
        ].filter(Boolean) as string[])
      );

      const queryOr: any[] = [
        { "destinations.slug": { $in: packageSearchTerms } },
        { "citySlug": { $in: packageSearchTerms } },
        { "name": { $regex: new RegExp(targetSlug.replace(/-/g, " "), "i") } },
        { "tagline": { $regex: new RegExp(targetSlug.replace(/-/g, " "), "i") } },
        { "route": { $regex: new RegExp(targetSlug.replace(/-/g, " "), "i") } },
      ];

      if (isStateLevel) {
        queryOr.push(
          { "stateSlug": targetSlug },
          { "state": { $regex: new RegExp(targetSlug.replace(/-/g, " "), "i") } }
        );
      } else if (isCountryLevel) {
        queryOr.push(
          { "countrySlug": "india" },
          { "country": { $regex: /india/i } }
        );
      }

      dbPackages = await db.collection("packages").find({ $or: queryOr }).toArray();
    }
  } catch (err) {
    console.error("DB Query error on destination detail:", err);
  }

  // 2. Fetch master fallback data
  const fallback =
    REGIONAL_DESTINATIONS[targetSlug] ||
    REGIONAL_DESTINATIONS[parsed.placeSlug] ||
    (isStateLevel ? REGIONAL_DESTINATIONS[parsed.stateSlug || "himachal"] : null) ||
    (isCityLevel ? REGIONAL_DESTINATIONS[targetSlug] : null) ||
    REGIONAL_DESTINATIONS["himachal"];

  const stateInfo = PLACE_TO_STATE_MAP[targetSlug] || {
    stateSlug: parsed.stateSlug || (dbDest?.stateSlug) || (fallback?.stateSlug) || "himachal",
    stateName: (dbDest?.stateName) || (fallback?.stateName) || "Himachal Pradesh",
  };

  const currentStateSlug = dbDest?.stateSlug || stateInfo.stateSlug || "himachal";

  const currentName =
    dbDest?.name ||
    fallback?.name ||
    targetSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Map dynamic DB child places with proper SEO URLs based on hierarchy
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
      img: d.coverImageStr || d.coverImage || "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80",
      price: d.startingPrice || "₹14,999",
      tag: d.tagline || d.region || (isCountryLevel ? "State of India" : "Scenic Spot"),
    };
  });

  // Curated fallback items mapped with appropriate URLs
  // For a city page, grab siblings from its parent state fallback
  const fallbackSourcePlaces = isCityLevel
    ? (REGIONAL_DESTINATIONS[currentStateSlug]?.childPlaces || []).filter((p: any) => p.slug !== targetSlug)
    : (fallback?.childPlaces || []);

  const fallbackChildPlaces = fallbackSourcePlaces.map((p: any) => {
    let cardUrl = "/destination/india-tour-packages";
    if (isCountryLevel) {
      cardUrl = buildDestinationUrl({ country: "india", state: p.slug });
    } else {
      cardUrl = buildDestinationUrl({
        country: "india",
        state: p.stateSlug || currentStateSlug,
        place: p.slug,
      });
    }

    return {
      name: p.name,
      slug: p.slug,
      url: cardUrl,
      stateSlug: p.stateSlug || currentStateSlug,
      count: p.count || "6 Tours",
      img: p.img || "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80",
      price: p.price || "₹14,999",
      tag: p.tag || "Sightseeing",
    };
  });

  // Merge DB child places with fallback places without duplicate slugs
  const existingChildSlugs = new Set(mappedDbChildPlaces.map((p) => p.slug));
  const mergedChildPlaces = [
    ...mappedDbChildPlaces,
    ...fallbackChildPlaces.filter((p: any) => !existingChildSlugs.has(p.slug)),
  ];

  const current = {
    name: currentName,
    type: dbDest?.type || fallback?.type || parsed.level,
    countryName: dbDest?.countryName || "India",
    stateName: dbDest?.stateName || stateInfo.stateName,
    stateSlug: dbDest?.stateSlug || stateInfo.stateSlug,
    tagline:
      dbDest?.tagline ||
      fallback?.tagline ||
      `Best Handcrafted Tour Packages & Curated Itineraries in ${currentName}`,
    heroImg:
      dbDest?.coverImageStr ||
      dbDest?.coverImage ||
      fallback?.heroImg ||
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600&auto=format&fit=crop&q=80",
    overview:
      dbDest?.shortDescription ||
      fallback?.overview ||
      `Explore extraordinary experiential travel packages, verified 4-star stays, and private chauffeured tours in ${currentName}.`,
    startingPrice: dbDest?.startingPrice || fallback?.startingPrice || "₹14,999",
    idealDuration: dbDest?.idealDuration || fallback?.idealDuration || "4 to 6 Days",
    bestTime: dbDest?.bestTimeToVisit || fallback?.bestTime || "Year-Round Peak",
    weather: dbDest?.weather || fallback?.weather || "Pleasant Mountain Weather",
    howToReach: dbDest?.howToReach || fallback?.howToReach || "Easily accessible via nearest airport, train station, and national highway network.",
    highlights: dbDest?.highlights || fallback?.highlights || [],
    childPlaces: mergedChildPlaces,
    attractions:
      dbDest?.attractions && dbDest.attractions.length > 0
        ? dbDest.attractions
        : fallback?.attractions || [],
    packages:
      dbPackages.length > 0
        ? dbPackages.map((p) => ({
            slug: p.slug,
            title: p.name,
            route: p.tagline || `${p.nights}N Package`,
            nights: `${p.nights} Nights / ${p.days || p.nights + 1} Days`,
            price: `₹${Number(p.startingPrice || 14999).toLocaleString("en-IN")}`,
            originalPrice: `₹${Number((p.startingPrice || 14999) * 1.3).toLocaleString("en-IN")}`,
            rating: 4.9,
            reviews: 140,
            img: p.coverImage || fallback?.heroImg,
            inclusions: p.inclusions || ["4★ Hotel Stays", "Private AC Cab", "Daily Breakfast & Dinner"],
          }))
        : fallback?.packages || [],
    faqs:
      dbDest?.faqs && dbDest.faqs.length > 0
        ? dbDest.faqs
        : fallback?.faqs || [
            { q: "Can we customize this itinerary?", a: "Yes, all Be My Traveller packages are 100% customizable to your exact dates, hotel category, and group size." },
            { q: "What is included in the package cost?", a: "Packages include verified hotel stays, daily breakfast and dinner, dedicated private sanitized cab, airport/station pick & drop, and toll/parking." },
          ],
  };

  // Carousel headings based on hierarchy
  let carouselBadge = "Popular States of India";
  let carouselTitle = "Explore States of India";
  let carouselSubtitle = "Choose an Indian state to explore curated hill stations, backwaters, and luxury packages";

  if (isStateLevel) {
    carouselBadge = `Places in ${current.name}`;
    carouselTitle = `Popular Places to Visit in ${current.name}`;
    carouselSubtitle = `Discover scenic hill stations, valleys, and top attractions across ${current.name}`;
  } else if (isCityLevel) {
    carouselBadge = `More Places in ${current.stateName}`;
    carouselTitle = `Explore More Places in ${current.stateName}`;
    carouselSubtitle = `Combine your ${current.name} trip with these recommended nearby destinations`;
  }

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristDestination",
        "name": `${current.name} Tour Packages`,
        "description": current.overview,
        "image": current.heroImg,
        "touristType": ["Families", "Couples", "Honeymooners", "Adventure Seekers"],
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.bemytraveller.com" },
          { "@type": "ListItem", "position": 2, "name": "India Holidays", "item": "https://www.bemytraveller.com/destination/india-tour-packages" },
          ...(current.stateName && current.name !== current.stateName
            ? [{ "@type": "ListItem", "position": 3, "name": current.stateName, "item": `https://www.bemytraveller.com${buildDestinationUrl({ state: current.stateSlug })}` }]
            : []),
          { "@type": "ListItem", "position": current.stateName && current.name !== current.stateName ? 4 : 3, "name": current.name, "item": `https://www.bemytraveller.com${parsed.canonicalUrl}` },
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": current.faqs.map((f: any) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── JSON-LD Structured Data for Google Search ── */}
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

        <div className="max-w-7xl mx-auto px-4 pb-10 relative z-10 w-full space-y-3">
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
              ⭐ 4.9/5 (1,240+ Reviews)
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
              ✓ 100% Tailor-Made
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-xs">
              🚗 Dedicated Private Cab
            </span>
          </div>

          {/* Single H1 for Best SEO Ranking */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {current.name} Tour Packages
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-3xl font-medium">
            {current.tagline}
          </p>
        </div>
      </section>

      {/* ── Fast Facts Bar ── */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 text-xs shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
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
      <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left 2 Columns: Tour Packages (#1), Destination Carousel (#2), Overview (#3), Attractions (#4), FAQs (#5) */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── 1. VERIFIED TOUR PACKAGES (MAKE MY TRIP 2-CARDS-PER-ROW GRID WITH SMART SEARCH & FILTERS) ── */}
            <DestinationPackageGrid
              destinationName={current.name}
              packages={current.packages}
            />

            {/* ── 2. DESTINATION / PLACES CAROUSEL (CAROUSEL UI FOR DESKTOP & MOBILE) ── */}
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

            {/* ── 4. ATTRACTIONS & SIGHTSEEING HIGHLIGHTS ── */}
            {current.attractions && current.attractions.length > 0 && (
              <section className="space-y-4">
                <div>
                  <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">Sightseeing Highlights</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                    Iconic Places to Visit in {current.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {current.attractions.map((att: any) => (
                    <div
                      key={att.name}
                      className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="h-40 w-full overflow-hidden bg-slate-100">
                        <img src={att.img} alt={att.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-4 space-y-1">
                        <h3 className="font-bold text-slate-900 text-sm">{att.name}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{att.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── 5. TRAVELLER FAQS ── */}
            {current.faqs && current.faqs.length > 0 && (
              <section className="space-y-4">
                <div>
                  <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">Traveller FAQs</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                    Frequently Asked Questions about {current.name} Tours
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {current.faqs.map((faq: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-start gap-2">
                        <span className="text-amber-500 font-extrabold">Q.</span>
                        <span>{faq.q}</span>
                      </h3>
                      <p className="text-xs text-slate-600 pl-4 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Right Column: Sticky Booking & Custom Quote Engine */}
          <aside className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600">
                    Bespoke Trip Planner
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    Plan Your {current.name} Holiday
                  </h3>
                </div>
                <span className="text-2xl">✈️</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Travel Month</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-amber-500 cursor-pointer">
                    <option>October 2026</option>
                    <option>November 2026</option>
                    <option>December 2026 (Snow / Peak)</option>
                    <option>January 2027</option>
                    <option>February 2027</option>
                    <option>March – June 2027 (Summer)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Duration</label>
                    <select className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-amber-500 cursor-pointer">
                      <option>4N / 5D</option>
                      <option>5N / 6D</option>
                      <option>6N / 7D</option>
                      <option>7N+ Extended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Travellers</label>
                    <select className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-amber-500 cursor-pointer">
                      <option>2 Adults (Couple)</option>
                      <option>Family (2A + 1C)</option>
                      <option>Family (2A + 2C)</option>
                      <option>Group (4+ Adults)</option>
                    </select>
                  </div>
                </div>

                {/* Estimated Price */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-800 font-bold block uppercase">Estimated Starting</span>
                    <span className="text-base font-black text-amber-900">{current.startingPrice}</span>
                    <span className="text-[10px] text-slate-500"> / person</span>
                  </div>
                  <span className="text-emerald-700 text-[10px] font-black bg-emerald-100 px-2 py-0.5 rounded-full">
                    Includes Cab + Stays
                  </span>
                </div>

                {/* Actions */}
                <Link
                  href={`/customize?destination=${encodeURIComponent(current.name)}`}
                  className="block w-full py-2.5 text-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Get Instant Custom Quote →
                </Link>

                <a
                  href={`https://wa.me/918091638090?text=${encodeURIComponent(`Hi Be My Traveller, I would like to enquire about ${current.name} Tour Packages.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <span>💬</span> WhatsApp Travel Expert
                </a>

                <div className="pt-2 text-[10.5px] text-slate-500 text-center space-y-0.5">
                  <p>🔒 Zero booking fee · Instant callback within 15 mins</p>
                  <p>📞 24/7 Helpline: <a href="tel:918091638090" className="font-bold text-slate-700 hover:underline">+91 8091638090</a></p>
                </div>
              </div>
            </div>

            {/* Why Book With BMT */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 text-xs">
              <h4 className="font-black text-sm text-amber-400">Why Book with Be My Traveller?</h4>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>100% Tailor-made itineraries with private cabs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Verified 4★/5★ hotels with daily breakfast &amp; dinner</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Dedicated 24/7 on-trip concierge manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Guaranteed best rate with zero hidden charges</span>
                </li>
              </ul>
            </div>
          </aside>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
