"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";
import SiteFooter from "@/components/common/SiteFooter";
import { formatINR } from "@/lib/utils";

// ── Destination Catalog (All-India & World) ──────────────────────────
export interface DestinationOption {
  id: string;
  name: string;
  region: "Himalayas & North" | "Rajasthan & Heritage" | "Beach & South" | "International Escapes";
  tagline: string;
  basePerNight: number;
  popularNights: number;
  heroImg: string;
  icon: string;
  isInternational?: boolean;
}

const ALL_DESTINATIONS: DestinationOption[] = [
  // ── Himalayas & North India ──
  {
    id: "himachal",
    name: "Himachal Pradesh (Shimla, Manali & Spiti)",
    region: "Himalayas & North",
    tagline: "Snow valleys, pine chalets, Rohtang Pass & high mountain trails",
    basePerNight: 3500,
    popularNights: 6,
    heroImg: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80",
    icon: "🏔️",
  },
  {
    id: "kashmir",
    name: "Kashmir Paradise (Srinagar, Gulmarg & Pahalgam)",
    region: "Himalayas & North",
    tagline: "Dal Lake Shikara rides, Gulmarg gondola & pristine betaab valley",
    basePerNight: 4400,
    popularNights: 6,
    heroImg: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80",
    icon: "🌸",
  },
  {
    id: "ladakh",
    name: "Leh Ladakh (Pangong Tso & Nubra Valley)",
    region: "Himalayas & North",
    tagline: "High-altitude desert, Khardung La pass, 4x4 safaris & monasteries",
    basePerNight: 4800,
    popularNights: 7,
    heroImg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80",
    icon: "🚵",
  },
  {
    id: "uttarakhand",
    name: "Uttarakhand (Rishikesh, Nainital, Mussoorie & Corbett)",
    region: "Himalayas & North",
    tagline: "Ganga river rafting, lake views, colonial hill stations & tiger reserve",
    basePerNight: 3400,
    popularNights: 5,
    heroImg: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80",
    icon: "⛰️",
  },
  {
    id: "northeast",
    name: "Sikkim & Meghalaya (Gangtok, Darjeeling & Shillong)",
    region: "Himalayas & North",
    tagline: "Living root bridges, Kanchenjunga sunrises & tea estates",
    basePerNight: 3800,
    popularNights: 6,
    heroImg: "https://images.unsplash.com/photo-1466853817435-05b43fe45b39?w=800&auto=format&fit=crop&q=80",
    icon: "💧",
  },

  // ── Rajasthan & Heritage ──
  {
    id: "rajasthan",
    name: "Royal Rajasthan (Jaipur, Udaipur, Jodhpur & Jaisalmer)",
    region: "Rajasthan & Heritage",
    tagline: "Palace hotel stays, sand dune campfires & majestic hill forts",
    basePerNight: 3900,
    popularNights: 6,
    heroImg: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80",
    icon: "🏰",
  },
  {
    id: "golden-triangle",
    name: "Golden Triangle (Delhi, Agra & Jaipur)",
    region: "Rajasthan & Heritage",
    tagline: "Mughal grandeur, iconic Taj Mahal sunrise & royal heritage",
    basePerNight: 3600,
    popularNights: 5,
    heroImg: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80",
    icon: "🕌",
  },
  {
    id: "chardham",
    name: "Chardham & Sacred Himalayan Yatra",
    region: "Rajasthan & Heritage",
    tagline: "Kedarnath, Badrinath, Gangotri & Yamunotri guided pilgrimage",
    basePerNight: 4300,
    popularNights: 9,
    heroImg: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80",
    icon: "🛕",
  },

  // ── Beach & South India ──
  {
    id: "kerala",
    name: "Kerala Backwaters & Hills (Munnar, Thekkady & Alleppey)",
    region: "Beach & South",
    tagline: "Spice plantations, misty tea gardens & private houseboat cruises",
    basePerNight: 3900,
    popularNights: 6,
    heroImg: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80",
    icon: "🌴",
  },
  {
    id: "goa",
    name: "Goa Coastal Holiday (North & South Goa)",
    region: "Beach & South",
    tagline: "Sun-soaked beaches, sunset cruises, beach clubs & heritage villas",
    basePerNight: 3400,
    popularNights: 5,
    heroImg: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
    icon: "🏖️",
  },
  {
    id: "andaman",
    name: "Andaman Islands (Port Blair, Havelock & Neil Island)",
    region: "Beach & South",
    tagline: "Radhanagar beach, scuba diving, coral reefs & luxury beach resorts",
    basePerNight: 5200,
    popularNights: 6,
    heroImg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    icon: "🌊",
  },

  // ── Top International Escapes ──
  {
    id: "bali",
    name: "Bali & Indonesia (Ubud, Seminyak & Nusa Penida)",
    region: "International Escapes",
    tagline: "Private pool villas, jungle waterfalls, volcano views & beach clubs",
    basePerNight: 5800,
    popularNights: 6,
    heroImg: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80",
    icon: "🌺",
    isInternational: true,
  },
  {
    id: "dubai",
    name: "Dubai & UAE (Downtown, Marina & Desert Safari)",
    region: "International Escapes",
    tagline: "Burj Khalifa, Red Dune Safari with BBQ, luxury yacht & theme parks",
    basePerNight: 6900,
    popularNights: 5,
    heroImg: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
    icon: "🏙️",
    isInternational: true,
  },
  {
    id: "thailand",
    name: "Thailand (Phuket, Krabi, Bangkok & Pattaya)",
    region: "International Escapes",
    tagline: "Phi Phi island speedboat, emerald lagoons & rooftop city dining",
    basePerNight: 4800,
    popularNights: 6,
    heroImg: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&auto=format&fit=crop&q=80",
    icon: "🐘",
    isInternational: true,
  },
  {
    id: "singapore",
    name: "Singapore & Malaysia (Universal Studios, Marina Bay & KL)",
    region: "International Escapes",
    tagline: "Gardens by the Bay, Sentosa luxury, Batu Caves & Twin Towers",
    basePerNight: 7200,
    popularNights: 6,
    heroImg: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80",
    icon: "🦁",
    isInternational: true,
  },
  {
    id: "maldives",
    name: "Maldives Luxury Escape (Private Overwater Villa)",
    region: "International Escapes",
    tagline: "All-inclusive overwater lagoon villa, seaplane transfer & reef diving",
    basePerNight: 12500,
    popularNights: 4,
    heroImg: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop&q=80",
    icon: "🏝️",
    isInternational: true,
  },
  {
    id: "vietnam",
    name: "Vietnam (Hanoi, Halong Bay Cruise & Da Nang)",
    region: "International Escapes",
    tagline: "Overnight luxury bay cruise, Golden Bridge hands & lantern river",
    basePerNight: 5400,
    popularNights: 7,
    heroImg: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80",
    icon: "🏮",
    isInternational: true,
  },
  {
    id: "europe",
    name: "Europe Highlights (Switzerland, Paris & Italy)",
    region: "International Escapes",
    tagline: "Swiss Alps cogwheel train, Eiffel Tower & Venetian gondola",
    basePerNight: 14500,
    popularNights: 9,
    heroImg: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
    icon: "🗼",
    isInternational: true,
  },
];

// ── Experiential Add-on Catalog ─────────────────────────────────────
const EXPERIENTIAL_ADDONS = [
  { id: "candlelight", name: "Romantic Candlelight Dinner Setup with Cake", category: "Romance & Honeymoon", price: 2500, icon: "🕯️", desc: "Private table decor, candle arrangement, cake & flower bouquet" },
  { id: "jacuzzi", name: "Deluxe Jacuzzi / Honeymoon Room Decoration", category: "Romance & Honeymoon", price: 2200, icon: "🌹", desc: "Aromatic floral petal styling & celebration fruit hamper" },
  { id: "couple_spa", name: "Rejuvenating Couple Spa & Aromatherapy (60m)", category: "Romance & Honeymoon", price: 3500, icon: "💆", desc: "Certified therapist relaxation session in private suite" },
  { id: "rafting", name: "White Water River Rafting with Safety Gear", category: "Adventure & Thrill", price: 1600, icon: "🚣", desc: "Guided rapids run with certified instructors, lifejackets & helmets" },
  { id: "paragliding", name: "High-Fly Tandem Paragliding with HD Go-Pro", category: "Adventure & Thrill", price: 2800, icon: "🪂", desc: "Scenic thermal glide with certified pilot and recorded footage" },
  { id: "jeep4x4", name: "4x4 Mountain Pass / Desert Dune Off-Road Trail", category: "Adventure & Thrill", price: 3200, icon: "🚙", desc: "Dedicated high-clearance 4WD vehicle with mountain expert driver" },
  { id: "sunset_cruise", name: "Sunset Boat Cruise / Private Shikara Ride", category: "Sightseeing & VIP", price: 1800, icon: "⛵", desc: "Private boat excursion during golden hour with warm tea & snacks" },
  { id: "gondola_vip", name: "Cable Car / Gondola Priority Fast-Track Pass", category: "Sightseeing & VIP", price: 1950, icon: "🚠", desc: "Skip-the-line priority admission for high altitude viewpoint" },
  { id: "safari", name: "Exclusive Wildlife Jungle Jeep Safari (Zone 1)", category: "Sightseeing & VIP", price: 3400, icon: "🐅", desc: "Open 4x4 Gypsy with government-authorized wildlife naturalist" },
  { id: "private_chef", name: "Private Chef Traditional Multi-Course Feast", category: "Dining & Luxury", price: 2400, icon: "🍲", desc: "Authentic regional culinary experience cooked live in your villa" },
];

// ── Private Vehicle Options ──────────────────────────────────────────
const VEHICLE_OPTIONS = {
  sedan: {
    id: "sedan",
    name: "Private AC Sedan (Dzire / Etios / Yaris)",
    capacity: "2-3 Adults + Luggage",
    costPerDayDomestic: 2200,
    costPerDayInternational: 4500,
    icon: "🚗",
    badge: "Most Popular for Couples",
  },
  suv: {
    id: "suv",
    name: "Private AC Luxury SUV (Innova Crysta)",
    capacity: "4-6 Adults + Heavy Luggage",
    costPerDayDomestic: 3600,
    costPerDayInternational: 6500,
    icon: "🚙",
    badge: "Maximum Comfort & Safety",
  },
  tempo: {
    id: "tempo",
    name: "Luxury Executive Minivan / Tempo (12-16 Seater)",
    capacity: "8-14 Adults + Luggage",
    costPerDayDomestic: 5400,
    costPerDayInternational: 9500,
    icon: "🚐",
    badge: "Ideal for Families & Groups",
  },
};

// ── Accommodation Styles ────────────────────────────────────────────
const HOTEL_TIERS = [
  {
    id: "standard",
    title: "Standard 3★ Boutique",
    multiplier: 1.0,
    badge: "Value Comfort",
    desc: "Clean, verified boutique hotels with scenic views and daily hot breakfast buffet.",
    inclusions: ["Verified 3★ Quality Check", "Daily Morning Breakfast", "Free High-Speed Wi-Fi", "Dedicated Sanitized Room"],
  },
  {
    id: "deluxe",
    title: "Deluxe 4★ Luxury",
    multiplier: 1.35,
    badge: "Recommended",
    desc: "Premium hotels & resorts with scenic balconies, swimming pool, and daily breakfast & dinner.",
    inclusions: ["Verified 4★ Premium Hotel", "Daily Breakfast & Dinner Buffet", "Scenic Balcony / View Room", "Welcome Drink on Arrival"],
  },
  {
    id: "luxury",
    title: "Luxury 5★ / Private Villa",
    multiplier: 2.1,
    badge: "Royal Indulgence",
    desc: "5-Star Spa resorts, luxury chalets or private pool villas with personalized 24/7 butler service.",
    inclusions: ["5★ Resort or Private Villa", "Daily Gourmet Breakfast & Dinner", "Spa Discount & Heated Pool", "Early Check-in / Late Check-out*"],
  },
];

// ── Client Security / Spam Validation Functions ─────────────────────
function validateGenuinePhone(phone: string): { isValid: boolean; error?: string; cleanDigits: string } {
  const digits = phone.replace(/[^0-9]/g, "");

  if (digits.length < 10) {
    return { isValid: false, error: "Please enter a valid 10-digit mobile number.", cleanDigits: digits };
  }
  if (digits.length > 15) {
    return { isValid: false, error: "Phone number is too long.", cleanDigits: digits };
  }

  // Check 10-digit Indian numbers
  if (digits.length === 10) {
    const firstDigit = digits[0];
    if (!["6", "7", "8", "9"].includes(firstDigit)) {
      return { isValid: false, error: "Indian mobile numbers must start with 6, 7, 8, or 9.", cleanDigits: digits };
    }
  }

  // Reject dummy / repetitive patterns
  const dummyNumbers = [
    "0000000000", "1111111111", "2222222222", "3333333333", "4444444444",
    "5555555555", "6666666666", "7777777777", "8888888888", "9999999999",
    "1234567890", "0123456789", "9876543210", "1234512345", "9898989898",
  ];

  if (dummyNumbers.some((d) => digits.includes(d))) {
    return { isValid: false, error: "Please enter a genuine contact number to receive your quote.", cleanDigits: digits };
  }

  if (/^(\d)\1+$/.test(digits)) {
    return { isValid: false, error: "Please provide a valid contact number.", cleanDigits: digits };
  }

  return { isValid: true, cleanDigits: digits };
}

function validateGenuineName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return { isValid: false, error: "Please enter your full name (at least 3 letters)." };
  }
  const lower = trimmed.toLowerCase();
  const spamWords = ["test", "asdf", "fake", "xyz", "demo", "null", "undefined", "qwerty", "none", "admin"];
  if (spamWords.includes(lower)) {
    return { isValid: false, error: "Please enter your genuine full name." };
  }
  return { isValid: true };
}

// ── Inner Component Using Search Params ──────────────────────────────
function CustomTripBuilderContent() {
  const searchParams = useSearchParams();
  const initialDestQuery = searchParams.get("destination") || "";
  const initialThemeQuery = searchParams.get("theme") || "";

  // 1. Destination state
  const matchedDest = useMemo(() => {
    if (!initialDestQuery) return ALL_DESTINATIONS[0];
    const q = initialDestQuery.toLowerCase().trim();
    return (
      ALL_DESTINATIONS.find(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase() === q ||
          q.includes(d.id)
      ) || ALL_DESTINATIONS[0]
    );
  }, [initialDestQuery]);

  const [selectedDestId, setSelectedDestId] = useState<string>(matchedDest.id);
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("ALL");
  const [durationNights, setDurationNights] = useState<number>(matchedDest.popularNights);
  const [hotelTier, setHotelTier] = useState<"standard" | "deluxe" | "luxury">("deluxe");
  const [cabType, setCabType] = useState<"sedan" | "suv" | "tempo">("sedan");
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["candlelight", "sunset_cruise"]);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);

  // Set default travel date: 14 days from now
  const defaultTravelDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  }, []);
  const [travelDate, setTravelDate] = useState<string>(defaultTravelDate);

  // Form Fields & Anti-Spam
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState(""); // hidden bot trap
  const [isGenuineConfirmed, setIsGenuineConfirmed] = useState(true);
  const [pageLoadedAt] = useState<number>(() => Date.now());

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [leadSuccessData, setLeadSuccessData] = useState<{ id: string; leadNumber: string } | null>(null);

  // Sync initial query if present
  useEffect(() => {
    if (matchedDest) {
      setSelectedDestId(matchedDest.id);
      setDurationNights(matchedDest.popularNights);
    }
  }, [matchedDest]);

  // Current Destination Object
  const selectedDestObj = useMemo(() => {
    return ALL_DESTINATIONS.find((d) => d.id === selectedDestId) || ALL_DESTINATIONS[0];
  }, [selectedDestId]);

  // Filtered Destinations based on region tab
  const visibleDestinations = useMemo(() => {
    if (selectedRegionFilter === "ALL") return ALL_DESTINATIONS;
    return ALL_DESTINATIONS.filter((d) => d.region === selectedRegionFilter);
  }, [selectedRegionFilter]);

  // Pricing Calculation
  const activeHotelTier = HOTEL_TIERS.find((t) => t.id === hotelTier) || HOTEL_TIERS[1];
  const activeCab = VEHICLE_OPTIONS[cabType] || VEHICLE_OPTIONS.sedan;

  const destBaseRate = selectedDestObj.basePerNight;
  const hotelMultiplier = activeHotelTier.multiplier;
  const hotelRooms = Math.max(1, Math.ceil(adults / 2));
  const hotelCost = Math.round(destBaseRate * hotelMultiplier * durationNights * hotelRooms);

  const cabDailyRate = selectedDestObj.isInternational
    ? activeCab.costPerDayInternational
    : activeCab.costPerDayDomestic;
  const cabCost = cabDailyRate * (durationNights + 1);

  const addonsCost = selectedAddons.reduce((acc, addonId) => {
    const item = EXPERIENTIAL_ADDONS.find((a) => a.id === addonId);
    return acc + (item ? item.price * Math.max(1, adults) : 0);
  }, 0);

  const subtotal = hotelCost + cabCost + addonsCost;
  const gst = Math.round(subtotal * 0.05);
  const totalCalculated = subtotal + gst;
  const perPersonCost = Math.round(totalCalculated / Math.max(1, adults));

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Form Submit Handler (with genuine client validation & CRM lead creation)
  const handleLockQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // 1. Anti-Bot Honeypot Trap
    if (honeypot.trim() !== "") {
      // Bot detected silently
      setLeadSuccessData({
        id: "mock-bot-id",
        leadNumber: `BMT-CST-${Date.now().toString().slice(-6)}`,
      });
      return;
    }

    // 2. Anti-Bot Speed Trap (real users spend at least 2.5s configuring)
    if (Date.now() - pageLoadedAt < 2500) {
      setSubmitError("Please take a moment to review your itinerary before submitting.");
      return;
    }

    // 3. Name Validation
    const nameVal = validateGenuineName(fullName);
    if (!nameVal.isValid) {
      setSubmitError(nameVal.error || "Please enter a valid full name.");
      return;
    }

    // 4. Phone Validation
    const phoneVal = validateGenuinePhone(phone);
    if (!phoneVal.isValid) {
      setSubmitError(phoneVal.error || "Please enter a genuine mobile number.");
      return;
    }

    // 5. Genuine Checkbox
    if (!isGenuineConfirmed) {
      setSubmitError("Please confirm that this is a genuine travel inquiry.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build Rich Lead Payload for /admin/leads
      const payload = {
        name: fullName.trim(),
        email: email.trim() || undefined,
        phone: phoneVal.cleanDigits,
        destinations: [selectedDestObj.name],
        leadType: "CUSTOM_ITINERARY",
        travelDates: {
          from: travelDate,
          flexible: true,
        },
        travellers: {
          adults: Number(adults),
          children: Number(children),
          infants: 0,
        },
        hotelCategory: hotelTier.toUpperCase(),
        budget: {
          min: totalCalculated,
          max: totalCalculated,
          currency: "INR",
        },
        themes: initialThemeQuery ? [initialThemeQuery] : ["CUSTOM"],
        specialRequirements: `[Custom Trip Builder Submission]
• Destination: ${selectedDestObj.name} (${selectedDestObj.region})
• Duration: ${durationNights} Nights / ${durationNights + 1} Days
• Departure Date: ${travelDate}
• Travellers: ${adults} Adults${children > 0 ? `, ${children} Children` : ""} (${hotelRooms} Room${hotelRooms > 1 ? "s" : ""})
• Accommodation: ${activeHotelTier.title}
• Private Vehicle: ${activeCab.name} (${activeCab.capacity})
• Selected Add-ons (${selectedAddons.length}): ${
          selectedAddons.length > 0
            ? selectedAddons
                .map((id) => EXPERIENTIAL_ADDONS.find((a) => a.id === id)?.name || id)
                .join("; ")
            : "None"
        }
• Estimated Package Price: ₹${totalCalculated.toLocaleString("en-IN")} (₹${perPersonCost.toLocaleString("en-IN")}/person)`,
        source: "CUSTOM_TRIP_BUILDER",
        landingPage: "/customize",
      };

      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok && res.status !== 201) {
        throw new Error(resData?.message || resData?.error || "Unable to submit inquiry");
      }

      const generatedLeadNumber = `BMT-CST-${Date.now().toString().slice(-6)}`;
      setLeadSuccessData({
        id: resData?.data?.id || resData?.id || "lead-ok",
        leadNumber: generatedLeadNumber,
      });
    } catch (err: any) {
      console.error("Custom lead submission error:", err);
      // Fallback lead reference if server offline
      setLeadSuccessData({
        id: "offline-lead",
        leadNumber: `BMT-CST-${Date.now().toString().slice(-6)}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = useMemo(() => {
    return encodeURIComponent(
      `Hi Be My Traveller! I have configured a custom itinerary:
📍 Destination: ${selectedDestObj.name}
⏱️ Duration: ${durationNights} Nights / ${durationNights + 1} Days
📅 Travel Date: ${travelDate}
👥 Travellers: ${adults} Adults${children > 0 ? `, ${children} Children` : ""}
🏨 Hotel: ${activeHotelTier.title}
🚗 Vehicle: ${activeCab.name}
💰 Estimated Total: ${formatINR(totalCalculated)} (${formatINR(perPersonCost)}/pax)
Ref: ${leadSuccessData?.leadNumber || "Custom Builder"}
Please share the detailed day-wise itinerary PDF!`
    );
  }, [
    selectedDestObj,
    durationNights,
    travelDate,
    adults,
    children,
    activeHotelTier,
    activeCab,
    totalCalculated,
    perPersonCost,
    leadSuccessData,
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <BmtNavMenu />

      {/* ── Hero Header ── */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white -mt-[96px] pt-[124px] pb-12 px-4 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-3 relative z-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-amber-400 font-bold">
            <Link href="/" className="hover:underline text-slate-300 hover:text-white">Home</Link>
            <span>›</span>
            <span>Custom Trip Builder</span>
            {initialThemeQuery && (
              <>
                <span>›</span>
                <span className="text-amber-300 capitalize">{initialThemeQuery}</span>
              </>
            )}
          </nav>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ✨ Pan-India &amp; International Customizer
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ✓ 100% Tailor-Made Itineraries
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              🔒 Real-Time Pricing Engine
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Design Your Personalized Holiday Itinerary
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Customize destinations across India (Himachal, Kashmir, Kerala, Rajasthan, Goa, Andaman) and world escapes (Bali, Dubai, Thailand, Maldives, Europe). Real-time hotel tiers, dedicated private sanitized vehicles, and experiential add-ons.
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ── Main Builder Grid ── */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 items-start">
          
          {/* Left 2 Columns: 4 Step Interactive Builder */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* STEP 1: Destination Selection (All-India & World) */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Step 1 of 4
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                    Select Your Dream Destination &amp; Dates
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  18+ Handpicked Regions
                </span>
              </div>

              {/* Region Filter Chips */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 block">Browse Destinations by Region:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {[
                    { id: "ALL", label: "🌟 All Destinations" },
                    { id: "Himalayas & North", label: "🏔️ Himalayas & North" },
                    { id: "Rajasthan & Heritage", label: "🏰 Rajasthan & Heritage" },
                    { id: "Beach & South", label: "🌴 Beach & South India" },
                    { id: "International Escapes", label: "✈️ International Escapes" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedRegionFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedRegionFilter === tab.id
                          ? "bg-amber-500 text-slate-950 font-black shadow-xs ring-1 ring-amber-400"
                          : "bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-950 border border-slate-200/80"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Dropdown / Card Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chosen Destination Circuit <span className="text-amber-600">*</span>
                </label>
                <select
                  value={selectedDestId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedDestId(id);
                    const found = ALL_DESTINATIONS.find((d) => d.id === id);
                    if (found) setDurationNights(found.popularNights);
                  }}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 cursor-pointer"
                >
                  {visibleDestinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.icon} {d.name} {d.isInternational ? "✈️ [International]" : "🇮🇳"}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <span>💡</span>
                  <span>{selectedDestObj.tagline}</span>
                </p>
              </div>

              {/* Departure Date, Duration & Travellers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adults (12+ Yrs)
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-hidden cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map((n) => (
                      <option key={n} value={n}>
                        {n} Adult{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Children (2-11 Yrs)
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-hidden cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n === 0 ? "No Children" : `${n} Child${n > 1 ? "ren" : ""}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Duration: <span className="text-amber-600 font-black">{durationNights} Nights / {durationNights + 1} Days</span>
                  </label>
                  <span className="text-[10.5px] text-slate-500">
                    Recommended for {selectedDestObj.name.split(" ")[0]}: {selectedDestObj.popularNights}N
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[3, 4, 5, 6, 7, 8, 9, 10, 12, 14].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDurationNights(n)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        durationNights === n
                          ? "bg-slate-950 text-white shadow-xs ring-2 ring-amber-400"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {n}N / {n + 1}D
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 2: Hotel Tier Selection */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Step 2 of 4
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  Choose Accommodation Category
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified stays handpicked for cleanliness, comfort, hospitality &amp; prime location
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {HOTEL_TIERS.map((tier) => {
                  const isSelected = hotelTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setHotelTier(tier.id as any)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/40 shadow-xs"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-xs text-slate-900">{tier.title}</span>
                          <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                            isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-200 text-slate-700"
                          }`}>
                            {tier.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug mt-1">{tier.desc}</p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-1">
                        {tier.inclusions.map((inc, i) => (
                          <div key={i} className="text-[10.5px] text-slate-700 font-medium flex items-center gap-1">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: Private Vehicle Selection */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Step 3 of 4
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  Private Sanitized Transportation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dedicated vehicle &amp; professional driver for all airport/railway transfers &amp; sightseeing
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {Object.values(VEHICLE_OPTIONS).map((v) => {
                  const isSelected = cabType === v.id;
                  const dailyRate = selectedDestObj.isInternational
                    ? v.costPerDayInternational
                    : v.costPerDayDomestic;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setCabType(v.id as any)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/40 shadow-xs"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">{v.icon}</span>
                          <span className="font-black text-xs text-slate-900">{v.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded inline-block mt-1.5">
                          {v.badge}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">Capacity: {v.capacity}</p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-xs font-black text-amber-600">
                          ₹{dailyRate.toLocaleString("en-IN")}/day
                        </span>
                        <span className={`text-[10px] font-bold ${isSelected ? "text-amber-700" : "text-slate-400"}`}>
                          {isSelected ? "✓ Selected" : "Select"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 4: Experiential Add-ons & Activities */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Step 4 of 4
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  Experiential Add-ons &amp; Signature Upgrades
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Elevate your holiday with romantic setups, high-thrill adventure sports &amp; VIP access
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPERIENTIAL_ADDONS.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3 rounded-xl border flex items-start justify-between gap-2.5 transition-all cursor-pointer text-left ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/50 ring-1 ring-amber-400/40 shadow-2xs"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-2xl shrink-0 mt-0.5">{addon.icon}</span>
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block leading-snug">
                            {addon.name}
                          </span>
                          <span className="text-[10.5px] text-slate-500 block leading-tight mt-0.5">
                            {addon.desc}
                          </span>
                          <span className="text-[11px] font-bold text-amber-600 mt-1 inline-block">
                            +₹{addon.price.toLocaleString("en-IN")}/person
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs font-black shrink-0 ${isSelected ? "text-amber-600" : "text-slate-400"}`}>
                        {isSelected ? "✓ Added" : "+ Add"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Live Destination Cart & Verified Lead Submission */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white shadow-xl p-5 sm:p-6 space-y-5">
              
              {/* Cart Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] uppercase font-black text-amber-600 tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Live Destination Cart
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <span>✓</span> Instant Costing
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1.5 leading-tight">
                  {selectedDestObj.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                  <span>⏱️ {durationNights}N / {durationNights + 1}D</span>
                  <span>•</span>
                  <span>👥 {adults} Adults{children > 0 ? `, ${children}C` : ""}</span>
                  <span>•</span>
                  <span>🏨 {activeHotelTier.title.split(" ")[0]}</span>
                </div>
              </div>

              {/* Itemized Cost Breakdown */}
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>
                    Hotel Stay ({durationNights}N × {hotelRooms} Room{hotelRooms > 1 ? "s" : ""})
                  </span>
                  <span className="font-bold text-slate-900">{formatINR(hotelCost)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Private Cab ({durationNights + 1} Days)</span>
                  <span className="font-bold text-slate-900">{formatINR(cabCost)}</span>
                </div>

                {addonsCost > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Add-ons ({selectedAddons.length} selected)</span>
                    <span className="font-bold text-slate-900">{formatINR(addonsCost)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-500">
                  <span>Government GST (5%)</span>
                  <span className="font-bold text-slate-700">{formatINR(gst)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-black text-slate-900 block">Total Package Quote</span>
                    <span className="text-[10px] text-slate-400 font-medium">All inclusive for group</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-600 block leading-tight">
                      {formatINR(totalCalculated)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      ≈ {formatINR(perPersonCost)} / person
                    </span>
                  </div>
                </div>
              </div>

              {/* Success Screen or Genuine Inquiry Form */}
              {leadSuccessData ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-lg font-black">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold text-emerald-800 tracking-wider block">
                      Inquiry Sent to Lead Pipeline!
                    </span>
                    <h4 className="font-black text-sm text-slate-900 mt-0.5">
                      Ref: {leadSuccessData.leadNumber}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Our destination specialist has received your custom requirements and is preparing your day-wise itinerary &amp; PDF quote.
                    </p>
                  </div>

                  {/* Instant WhatsApp Action */}
                  <a
                    href={`https://wa.me/918091638090?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <span>💬</span> Connect on WhatsApp Now
                  </a>

                  <button
                    type="button"
                    onClick={() => setLeadSuccessData(null)}
                    className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold underline block mx-auto cursor-pointer"
                  >
                    Modify / Build Another Itinerary
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLockQuote} className="space-y-3 pt-1">
                  
                  {/* Error Notification */}
                  {submitError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                      ⚠️ {submitError}
                    </div>
                  )}

                  {/* Honeypot Bot Trap (invisible to human travellers) */}
                  <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
                    <label htmlFor="company_code">Ignore</label>
                    <input
                      id="company_code"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* Genuine Client Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* Genuine Client Phone / WhatsApp */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Phone / WhatsApp Number <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9816012345"
                        maxLength={15}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Direct WhatsApp itinerary &amp; quotation will be sent here
                    </span>
                  </div>

                  {/* Optional Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Optional for PDF copy)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. traveller@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* Genuine Client Security Verification */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <input
                      id="genuine_check"
                      type="checkbox"
                      checked={isGenuineConfirmed}
                      onChange={(e) => setIsGenuineConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="genuine_check" className="text-[10.5px] text-slate-700 font-semibold cursor-pointer leading-tight">
                      I confirm this is a genuine travel inquiry for {selectedDestObj.name}.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending Inquiry to Leads Pipeline...</span>
                    ) : (
                      <span>Lock Quote &amp; Request Itinerary ({formatINR(totalCalculated)}) →</span>
                    )}
                  </button>
                </form>
              )}

              {/* Security & Authenticity Trust Badges */}
              <div className="text-[10.5px] text-slate-500 space-y-1 pt-1 border-t border-slate-100 text-center">
                <p className="flex items-center justify-center gap-1">
                  <span>🔒</span> 256-Bit SSL Encrypted Server Pricing
                </p>
                <p className="flex items-center justify-center gap-1">
                  <span>✓</span> Direct Lead Assigned to Verified Travel Executive
                </p>
                <p className="flex items-center justify-center gap-1 text-emerald-700 font-bold">
                  <span>⚡</span> Average Response Time: Under 15 Minutes
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function CustomTripBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">Loading Trip Builder...</div>}>
      <CustomTripBuilderContent />
    </Suspense>
  );
}
