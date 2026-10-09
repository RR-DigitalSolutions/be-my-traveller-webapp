"use client";

import React, { useState, useEffect, useMemo } from "react";
import { formatINR } from "@/lib/utils";

export interface IQuoteDay {
  dayNumber: number;
  title: string;
  city: string;
  hotelName: string;
  roomCategory: string;
  mealPlan: "EP" | "CP" | "MAP" | "AP";
  vehicleType: string;
  activities: string;
}

export interface QuoteItem {
  _id: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  destination: string;
  travelDates: string | { from?: string | Date; to?: string | Date };
  paxCount: string;
  hotelTier: string;
  cabType: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  itinerary?: IQuoteDay[];
  inclusions?: string[];
  exclusions?: string[];
  travellers?: {
    adults: number;
    children: number;
    infants: number;
  };
  costing?: {
    netCost?: number;
    markupPercent?: number;
    gstPercent?: number;
    perPersonCost?: number;
  };
  notes?: string;
}

const ITINERARY_TEMPLATES: Record<string, {
  name: string;
  destination: string;
  hotelTier: string;
  cabType: string;
  inclusions: string[];
  exclusions: string[];
  netCost: number;
  markupPercent: number;
  days: IQuoteDay[];
}> = {
  KASHMIR: {
    name: "Kashmir Enchantment (5N/6D)",
    destination: "Kashmir Paradise (Srinagar, Gulmarg, Pahalgam)",
    hotelTier: "4★ Deluxe & Heritage Houseboat",
    cabType: "Private Dedicated Innova Crysta",
    inclusions: [
      "5 Nights accommodation (4N Hotel + 1N Houseboat)",
      "Daily Breakfast & Dinner (MAP Plan)",
      "Dedicated AC Innova Crysta for all transfers & sightseeing",
      "1-Hour Sunset Shikara Ride on Dal Lake",
      "All toll taxes, parking, driver allowance & fuel",
      "24/7 On-trip Concierge & Assistance",
    ],
    exclusions: [
      "Airfare / Train tickets to/from Srinagar",
      "Gondola ride tickets at Gulmarg (Phase 1 & 2)",
      "Union cab for Betaab / Aru Valley in Pahalgam",
      "Personal expenses, laundry, tips & pony rides",
    ],
    netCost: 65000,
    markupPercent: 20,
    days: [
      {
        dayNumber: 1,
        title: "Arrival in Srinagar & Dal Lake Sunset Shikara",
        city: "Srinagar",
        hotelName: "Radisson Srinagar / Hotel Grand Boulevard",
        roomCategory: "Deluxe Heritage Room",
        mealPlan: "MAP",
        vehicleType: "Private Innova Crysta",
        activities: "Pick up from Srinagar Airport. Check in to hotel. Evening relax with a magical 1-hour romantic Shikara ride on Dal Lake visiting Floating Market and Char Chinar.",
      },
      {
        dayNumber: 2,
        title: "Srinagar to Gulmarg Meadow Excursion & Gondola",
        city: "Gulmarg",
        hotelName: "Hotel Heevan Retreat / Pine Palace",
        roomCategory: "Valley View Deluxe",
        mealPlan: "MAP",
        vehicleType: "Private Innova Crysta",
        activities: "Scenic drive past apple orchards to Gulmarg (8,825 ft). Board the famous Gulmarg Gondola to Kongdoori and Apharwat Peak. Enjoy snow activities and golf course views.",
      },
      {
        dayNumber: 3,
        title: "Gulmarg to Pahalgam - The Valley of Shepherds",
        city: "Pahalgam",
        hotelName: "Pine N Peak Resort / Hotel Heevan",
        roomCategory: "River View Room",
        mealPlan: "MAP",
        vehicleType: "Private Innova Crysta",
        activities: "Drive along the Lidder River to Pahalgam. Enroute visit saffron fields of Pampore and historic Avantipur ruins. Evening riverside stroll at leisure.",
      },
      {
        dayNumber: 4,
        title: "Pahalgam Valley Exploration (Betaab & Aru)",
        city: "Pahalgam",
        hotelName: "Pine N Peak Resort / Hotel Heevan",
        roomCategory: "River View Room",
        mealPlan: "MAP",
        vehicleType: "Private Innova Crysta",
        activities: "Full day excursion to picturesque Betaab Valley, Aru Valley wildlife sanctuary, and Chandanwari. Savor local Kashmiri Kahwa by the river.",
      },
      {
        dayNumber: 5,
        title: "Pahalgam to Srinagar & Luxury Houseboat Experience",
        city: "Srinagar",
        hotelName: "Wangnoo Heritage Luxury Houseboat (Nigeen Lake)",
        roomCategory: "Royal Carved Suite",
        mealPlan: "MAP",
        vehicleType: "Private Innova Crysta",
        activities: "Return to Srinagar. Visit famous Mughal Gardens: Nishat Bagh and Shalimar Bagh. Check in to luxury cedarwood houseboat. Candlelight dinner on waters.",
      },
      {
        dayNumber: 6,
        title: "Old City Craft Tour & Srinagar Airport Departure",
        city: "Srinagar",
        hotelName: "Check-out",
        roomCategory: "N/A",
        mealPlan: "CP",
        vehicleType: "Private Innova Crysta",
        activities: "Morning visit to Lal Chowk for Pashmina and saffron shopping. Timely private transfer to Srinagar Airport for return flight with fond memories.",
      },
    ],
  },
  HIMACHAL: {
    name: "Himachal Scenic Escape (5N/6D)",
    destination: "Shimla, Kullu & Manali Alpine Tour",
    hotelTier: "4★ Premium Mountain Resorts",
    cabType: "Private AC Ertiga / Innova",
    inclusions: [
      "2 Nights Shimla + 3 Nights Manali Accommodation",
      "Daily Breakfast & Dinner at all resorts (MAP)",
      "Dedicated Private Cab from Chandigarh to Chandigarh",
      "Sightseeing to Kufri, Solang Valley & Atal Tunnel",
      "All state permits, green taxes & parking fees",
    ],
    exclusions: [
      "Rohtang Pass permit & specialized 4x4 cab",
      "Adventure activities (Paragliding, River Rafting)",
      "Personal expenses & porter charges",
    ],
    netCost: 54000,
    markupPercent: 20,
    days: [
      {
        dayNumber: 1,
        title: "Chandigarh to Shimla Scenic Ridge Transfer",
        city: "Shimla",
        hotelName: "Radisson Hotel Shimla / Willow Banks",
        roomCategory: "Deluxe Valley Room",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities: "Pick up from Chandigarh. Drive through Himalayan foothills to Shimla. Evening walk on Mall Road, Christ Church, and Lakkar Bazaar.",
      },
      {
        dayNumber: 2,
        title: "Kufri Adventure Park & Green Valley Excursion",
        city: "Shimla",
        hotelName: "Radisson Hotel Shimla / Willow Banks",
        roomCategory: "Deluxe Valley Room",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities: "Excursion to Kufri (Himalayan Nature Park, horse riding to Mahasu Peak) and scenic deodar forest trails in Mashobra.",
      },
      {
        dayNumber: 3,
        title: "Shimla to Manali via Kullu Valley & River Rafting",
        city: "Manali",
        hotelName: "Snow Valley Resorts / Apple Country Resort",
        roomCategory: "Premium Mountain View",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities: "Panoramic 7-hour drive to Manali along the Beas river. Enroute stop at Kullu Shawl factories and white-water river rafting point. Check in at Manali.",
      },
      {
        dayNumber: 4,
        title: "Solang Valley Snow Adventure & Atal Tunnel Experience",
        city: "Manali",
        hotelName: "Snow Valley Resorts / Apple Country Resort",
        roomCategory: "Premium Mountain View",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities: "Drive through engineering marvel Atal Tunnel to Sissu (Lahaul). Solang Valley adventure hub for zorbing, quad biking, and ropeway.",
      },
      {
        dayNumber: 5,
        title: "Local Manali Heritage & Hot Springs",
        city: "Manali",
        hotelName: "Snow Valley Resorts / Apple Country Resort",
        roomCategory: "Premium Mountain View",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities: "Visit 500-year-old wooden Hadimba Temple, Tibetan Monastery, and natural sulfur hot springs at Vashisht. Evening cafe hopping in Old Manali.",
      },
      {
        dayNumber: 6,
        title: "Manali to Chandigarh Airport Drop",
        city: "Chandigarh",
        hotelName: "Check-out",
        roomCategory: "N/A",
        mealPlan: "CP",
        vehicleType: "Private AC Cab",
        activities: "Early morning breakfast and return drive to Chandigarh Airport/Railway station for onward journey.",
      },
    ],
  },
  GOLDEN_TRIANGLE: {
    name: "Golden Triangle Royal Heritage (4N/5D)",
    destination: "Delhi, Agra & Jaipur Pink City",
    hotelTier: "5★ Royal Heritage Hotels",
    cabType: "Private Dedicated Toyota Innova Crysta",
    inclusions: [
      "1N Delhi, 1N Agra, 2N Jaipur Accommodation",
      "Daily Royal Buffet Breakfast (CP Plan)",
      "Private AC Innova Crysta throughout with English-speaking chauffeur",
      "Government-approved monument tour guides",
      "Expressway tolls, state tax, and parking",
    ],
    exclusions: [
      "Monument entry fees & camera tickets",
      "Lunch & Dinners",
      "Personal gratuities",
    ],
    netCost: 48000,
    markupPercent: 22,
    days: [
      {
        dayNumber: 1,
        title: "Delhi Capital Arrival & Heritage Landmarks",
        city: "Delhi",
        hotelName: "The Lalit New Delhi / ITC Maurya",
        roomCategory: "Superior Room",
        mealPlan: "CP",
        vehicleType: "Private Innova Crysta",
        activities: "Arrival in Delhi. Tour Qutub Minar, India Gate, drive past Parliament House & Rashtrapati Bhavan. Evening dinner at Connaught Place.",
      },
      {
        dayNumber: 2,
        title: "Delhi to Agra & Sunset at Taj Mahal",
        city: "Agra",
        hotelName: "ITC Mughal / Radisson Hotel Agra",
        roomCategory: "Mughal Chamber",
        mealPlan: "CP",
        vehicleType: "Private Innova Crysta",
        activities: "Expressway drive to Agra. Check in. Afternoon guided tour of the UNESCO World Heritage Agra Fort. Marvel at the sunset view of the Taj Mahal.",
      },
      {
        dayNumber: 3,
        title: "Fatehpur Sikri Enroute to Jaipur Pink City",
        city: "Jaipur",
        hotelName: "Trident Jaipur / Marriott Hotel",
        roomCategory: "Deluxe Pool View",
        mealPlan: "CP",
        vehicleType: "Private Innova Crysta",
        activities: "Drive to Jaipur with en-route visit to Emperor Akbar's abandoned ghost city of Fatehpur Sikri and Chand Baori stepwell.",
      },
      {
        dayNumber: 4,
        title: "Jaipur Forts, Palaces & Johari Bazaar",
        city: "Jaipur",
        hotelName: "Trident Jaipur / Marriott Hotel",
        roomCategory: "Deluxe Pool View",
        mealPlan: "CP",
        vehicleType: "Private Innova Crysta",
        activities: "Morning elephant / jeep ride to Amber Fort. Photo-stop at Jal Mahal. Visit City Palace, Jantar Mantar observatory, and iconic Hawa Mahal.",
      },
      {
        dayNumber: 5,
        title: "Jaipur to Delhi International Airport Transfer",
        city: "Departure",
        hotelName: "Check-out",
        roomCategory: "N/A",
        mealPlan: "CP",
        vehicleType: "Private Innova Crysta",
        activities: "Breakfast and relaxed morning shopping for blue pottery and gems. Drive to Delhi International Airport for return departure.",
      },
    ],
  },
};

function formatTravelDates(td: string | { from?: string | Date; to?: string | Date } | any): string {
  if (!td) return "Flexible Dates";
  if (typeof td === "string") return td;
  if (typeof td === "object") {
    try {
      const fromStr = td.from ? new Date(td.from).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
      const toStr = td.to ? new Date(td.to).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
      if (fromStr && toStr) return `${fromStr} – ${toStr}`;
      return fromStr || toStr || "Flexible Dates";
    } catch {
      return "Flexible Dates";
    }
  }
  return String(td);
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewQuote, setPreviewQuote] = useState<QuoteItem | null>(null);
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form State for Itinerary Builder
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [destination, setDestination] = useState("Kashmir Paradise Special (6N/7D)");
  const [travelDates, setTravelDates] = useState("15 Oct 2026 – 21 Oct 2026");
  
  // Passenger Breakdown
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infantsCount, setInfantsCount] = useState(0);

  // Accommodations & Fleet
  const [hotelTier, setHotelTier] = useState("4★ Deluxe Hotels + Luxury Houseboat");
  const [cabType, setCabType] = useState("Private Dedicated Innova Crysta");

  // Daywise Itinerary Timeline
  const [itineraryDays, setItineraryDays] = useState<IQuoteDay[]>(ITINERARY_TEMPLATES.KASHMIR.days);

  // Inclusions & Exclusions
  const [inclusions, setInclusions] = useState<string[]>(ITINERARY_TEMPLATES.KASHMIR.inclusions);
  const [exclusions, setExclusions] = useState<string[]>(ITINERARY_TEMPLATES.KASHMIR.exclusions);
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");

  // Costing Engine
  const [netCost, setNetCost] = useState(65000);
  const [markupPercent, setMarkupPercent] = useState(20);
  const [applyGst, setApplyGst] = useState(true);

  // Computed Totals
  const totalTravelers = useMemo(() => adultsCount + childrenCount, [adultsCount, childrenCount]);
  const grossBeforeTax = useMemo(() => Math.round(netCost * (1 + markupPercent / 100)), [netCost, markupPercent]);
  const gstAmount = useMemo(() => applyGst ? Math.round(grossBeforeTax * 0.05) : 0, [grossBeforeTax, applyGst]);
  const computedTotalAmount = useMemo(() => grossBeforeTax + gstAmount, [grossBeforeTax, gstAmount]);
  const computedPerPerson = useMemo(() => totalTravelers > 0 ? Math.round(computedTotalAmount / totalTravelers) : computedTotalAmount, [computedTotalAmount, totalTravelers]);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/quotes?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.quotes) setQuotes(data.quotes);
    } catch (err) {
      console.error("Error fetching quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [search]);

  // Load Template
  const handleLoadTemplate = (key: string) => {
    const t = ITINERARY_TEMPLATES[key];
    if (!t) return;
    setDestination(t.destination);
    setHotelTier(t.hotelTier);
    setCabType(t.cabType);
    setInclusions([...t.inclusions]);
    setExclusions([...t.exclusions]);
    setNetCost(t.netCost);
    setMarkupPercent(t.markupPercent);
    setItineraryDays(JSON.parse(JSON.stringify(t.days)));
  };

  // Add / Remove Day
  const handleAddDay = () => {
    const nextDayNum = itineraryDays.length + 1;
    setItineraryDays([
      ...itineraryDays,
      {
        dayNumber: nextDayNum,
        title: `Day ${nextDayNum} Sightseeing & Leisure`,
        city: itineraryDays[itineraryDays.length - 1]?.city || "Destination",
        hotelName: itineraryDays[itineraryDays.length - 1]?.hotelName || "4★ Deluxe Hotel",
        roomCategory: "Deluxe Room",
        mealPlan: "MAP",
        vehicleType: cabType,
        activities: "Full day excursion and local sightseeing as scheduled.",
      },
    ]);
  };

  const handleRemoveDay = (idx: number) => {
    if (itineraryDays.length <= 1) return;
    const filtered = itineraryDays.filter((_, i) => i !== idx).map((day, i) => ({
      ...day,
      dayNumber: i + 1,
    }));
    setItineraryDays(filtered);
  };

  const handleUpdateDay = (idx: number, field: keyof IQuoteDay, value: any) => {
    const updated = [...itineraryDays];
    updated[idx] = { ...updated[idx], [field]: value };
    setItineraryDays(updated);
  };

  // Create Itinerary Quote
  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert("Please enter customer name and phone number");
      return;
    }

    const paxSummary = `${adultsCount} Adults${childrenCount ? `, ${childrenCount} Child` : ""}${infantsCount ? `, ${infantsCount} Infant` : ""}`;

    const payload = {
      customerName,
      customerPhone,
      customerEmail,
      destination,
      travelDates,
      paxCount: paxSummary,
      adultsCount,
      childrenCount,
      infantsCount,
      hotelTier,
      cabType,
      totalAmount: computedTotalAmount,
      itinerary: itineraryDays,
      inclusions,
      exclusions,
      costing: {
        netCost,
        markupPercent,
        gstPercent: applyGst ? 5 : 0,
        perPersonCost: computedPerPerson,
      },
    };

    try {
      const res = await fetch("/api/v1/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setModalOpen(false);
        showNotification("Tour itinerary & quote generated successfully!");
        fetchQuotes();
      } else {
        const err = await res.json();
        alert(err?.error || "Failed to create quote");
      }
    } catch (err) {
      console.error("Error creating quote:", err);
    }
  };

  // Multi-Channel WhatsApp Dispatch
  const generateWhatsAppQuote = (q: QuoteItem) => {
    const datesStr = formatTravelDates(q.travelDates);
    let dayWiseSummary = "";
    if (q.itinerary && q.itinerary.length > 0) {
      dayWiseSummary = "\n📋 *DAY-WISE TOUR TIMELINE:*\n" + q.itinerary.map((d) => 
        `• *Day ${d.dayNumber}: ${d.title}*\n  🏨 *Stay:* ${d.hotelName || "4★ Hotel"} (${d.mealPlan || "MAP"} Plan)\n  🚗 *Transport:* ${d.vehicleType || q.cabType}\n  📍 *Activity:* ${d.activities ? d.activities.substring(0, 85) + '...' : 'Sightseeing'}`
      ).join("\n\n");
    }

    const text = `🌟 *CUSTOM TOUR ITINERARY PROPOSAL* 🌟\n*Be My Traveller Holidays*\n\n` +
      `Dear *${q.customerName}*,\n` +
      `Thank you for reaching out! We have crafted a personalized holiday proposal tailored to your preferences:\n\n` +
      `📌 *Proposal ID:* ${q.quoteNumber}\n` +
      `📍 *Destination:* ${q.destination}\n` +
      `📅 *Dates / Duration:* ${datesStr}\n` +
      `👥 *Travellers:* ${q.paxCount}\n` +
      `🏨 *Accommodation:* ${q.hotelTier}\n` +
      `🚗 *Transfers & Cab:* ${q.cabType}\n` +
      dayWiseSummary +
      `\n\n💰 *TOTAL PACKAGE PRICE:* ${formatINR(q.totalAmount)} (All-Inclusive)\n` +
      (q.costing?.perPersonCost ? `👤 *Per Person Cost:* ${formatINR(q.costing.perPersonCost)}\n` : "") +
      `\n✅ *KEY INCLUSIONS:*\n` +
      (q.inclusions && q.inclusions.length > 0
        ? q.inclusions.slice(0, 5).map(inc => `✓ ${inc}`).join("\n")
        : "✓ 4★ Deluxe Hotels\n✓ Daily Breakfast & Dinner\n✓ Dedicated Private Vehicle\n✓ Tolls, Parking & Driver Allowances\n✓ 24/7 On-Tour Support") +
      `\n\n👉 *Reply directly to this message to book or customize any day!*` +
      `\n📞 *Call / WhatsApp Support:* +91 8091638090 | www.bemytraveller.com`;

    const cleanPhone = q.customerPhone.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Direct Email Dispatch
  const handleSendEmail = async (q: QuoteItem) => {
    if (!q.customerEmail) {
      const emailInput = prompt(`Enter customer email address for ${q.customerName}:`);
      if (!emailInput || !emailInput.includes("@")) {
        alert("Valid email address is required to dispatch quote.");
        return;
      }
      q.customerEmail = emailInput;
    }

    setSendingEmailId(q._id);
    try {
      const res = await fetch("/api/v1/admin/quotes/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: q._id,
          quoteNumber: q.quoteNumber,
          customerName: q.customerName,
          recipientEmail: q.customerEmail,
          destination: q.destination,
          totalAmount: q.totalAmount,
          itinerary: q.itinerary,
        }),
      });

      if (res.ok) {
        showNotification(`Quotation #${q.quoteNumber} successfully emailed to ${q.customerEmail}!`);
        fetchQuotes();
      } else {
        const err = await res.json();
        alert(err?.error || "Failed to dispatch email");
      }
    } catch (err) {
      console.error("Email dispatch error:", err);
      alert("Error sending email proposal.");
    } finally {
      setSendingEmailId(null);
    }
  };

  const copyQuoteSummary = (q: QuoteItem) => {
    const text = `Be My Traveller Proposal - ${q.quoteNumber}\nCustomer: ${q.customerName} (${q.customerPhone})\nDestination: ${q.destination}\nDates: ${formatTravelDates(q.travelDates)}\nAmount: ${formatINR(q.totalAmount)}`;
    navigator.clipboard.writeText(text);
    setCopiedMsg(q._id);
    setTimeout(() => setCopiedMsg(null), 2000);
  };

  const handleConvertToBooking = async (quoteId: string) => {
    try {
      const res = await fetch("/api/v1/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      });
      if (res.ok) {
        showNotification("Proposal accepted & converted to active Booking successfully!");
        fetchQuotes();
      } else {
        const err = await res.json();
        alert(err?.error || "Failed to convert quote");
      }
    } catch (err) {
      console.error("Convert error:", err);
    }
  };

  const filteredQuotes = useMemo(() => {
    if (statusFilter === "ALL") return quotes;
    return quotes.filter(q => q.status === statusFilter);
  }, [quotes, statusFilter]);

  const stats = useMemo(() => {
    const total = quotes.length;
    const sent = quotes.filter(q => q.status === "SENT").length;
    const confirmed = quotes.filter(q => q.status === "CONFIRMED" || q.status === "ACCEPTED" || q.status === "CONVERTED").length;
    const totalPipelineValue = quotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0);
    return { total, sent, confirmed, totalPipelineValue };
  }, [quotes]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {actionNotice && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span>✓</span>
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl text-lg font-black">📝</span>
            <h1 className="text-2xl font-black text-white tracking-tight">Day-Wise Itinerary &amp; Quotation Engine</h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Build day-by-day tour proposals with custom hotels, meal plans, private vehicles, passenger pricing &amp; 1-click WhatsApp/Email dispatch.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              handleLoadTemplate("KASHMIR");
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <span>＋</span> Build Itinerary Quote
          </button>
        </div>
      </div>

      {/* Quick KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Proposals</span>
          <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Dispatched to Clients</span>
          <p className="text-2xl font-black text-sky-400 mt-1">{stats.sent}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Converted &amp; Booked</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.confirmed}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pipeline Proposal Value</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{formatINR(stats.totalPipelineValue)}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search proposals by client name, mobile, destination, or ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <span className="absolute left-3 top-3 text-slate-500 text-sm">🔍</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "SENT", "DRAFT", "CONFIRMED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-400"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes & Proposals Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Proposal Ref</th>
                <th className="py-3.5 px-4">Client Details</th>
                <th className="py-3.5 px-4">Tour Package &amp; Timeline</th>
                <th className="py-3.5 px-4">Hotel &amp; Transport Setup</th>
                <th className="py-3.5 px-4">Package Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Multi-Channel Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading travel proposals from database...
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No proposals match the current filter. Click &quot;Build Itinerary Quote&quot; above to create one.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-mono font-black text-amber-400 text-xs block">
                        {q.quoteNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <p className="font-bold text-white text-[13px]">{q.customerName}</p>
                      <p className="text-slate-400 text-[11px] font-mono">{q.customerPhone}</p>
                      {q.customerEmail && (
                        <p className="text-slate-500 text-[10px] truncate max-w-[150px]">{q.customerEmail}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <p className="font-semibold text-white truncate">{q.destination}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-slate-400 text-[11px]">
                        <span>📅 {formatTravelDates(q.travelDates)}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-medium">{q.paxCount}</span>
                      </div>
                      {Array.isArray(q.itinerary) && q.itinerary.length > 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                          {q.itinerary.length} Days Itinerary Included
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <p className="text-slate-300 truncate font-medium">🏨 {q.hotelTier}</p>
                      <p className="text-slate-400 text-[11px] truncate mt-0.5">🚗 {q.cabType}</p>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <span className="text-sm font-black text-amber-400 block">
                        {formatINR(q.totalAmount)}
                      </span>
                      {q.costing?.perPersonCost && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatINR(q.costing.perPersonCost)} / pax
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black ${
                          q.status === "CONFIRMED" || q.status === "ACCEPTED" || q.status === "CONVERTED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : q.status === "SENT"
                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Preview Proposal */}
                        <button
                          onClick={() => setPreviewQuote(q)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                          title="Preview Full Daywise Proposal"
                        >
                          👁️ View
                        </button>

                        {/* WhatsApp Dispatch */}
                        <button
                          onClick={() => generateWhatsAppQuote(q)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Send Daywise Proposal on WhatsApp"
                        >
                          <span>💬</span> WhatsApp
                        </button>

                        {/* Email Dispatch */}
                        <button
                          onClick={() => handleSendEmail(q)}
                          disabled={sendingEmailId === q._id}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-black text-[11px] flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                          title="Email Proposal to Client"
                        >
                          <span>✉️</span> {sendingEmailId === q._id ? "Sending..." : "Email"}
                        </button>

                        {/* Convert to Booking */}
                        <button
                          onClick={() => handleConvertToBooking(q._id)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Convert to Confirmed Booking"
                        >
                          <span>✈️</span> Book
                        </button>

                        {/* Copy Summary */}
                        <button
                          onClick={() => copyQuoteSummary(q)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold cursor-pointer"
                          title="Copy Summary"
                        >
                          {copiedMsg === q._id ? "✓" : "📋"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CLIENT PROPOSAL PREVIEW MODAL ── */}
      {previewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-400">BE MY TRAVELLER HOLIDAYS</span>
                <h3 className="text-xl font-black text-white mt-0.5">Tour Proposal #{previewQuote.quoteNumber}</h3>
              </div>
              <button
                onClick={() => setPreviewQuote(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Proposal Header Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-slate-800/40 border border-amber-500/30 flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Client Itinerary Spec</span>
                <h4 className="text-lg font-black text-white">{previewQuote.destination}</h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span>👤 {previewQuote.customerName}</span>
                  <span>•</span>
                  <span>📱 {previewQuote.customerPhone}</span>
                  <span>•</span>
                  <span>📅 {formatTravelDates(previewQuote.travelDates)}</span>
                </div>
              </div>
              <div className="sm:text-right space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Package Price</span>
                <p className="text-2xl font-black text-amber-400">{formatINR(previewQuote.totalAmount)}</p>
                <p className="text-[11px] text-emerald-400 font-bold">Inclusive of all taxes &amp; GST</p>
              </div>
            </div>

            {/* Hotel & Vehicle Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 font-bold block mb-1">🏨 Accommodation Standard:</span>
                <p className="text-white font-semibold">{previewQuote.hotelTier}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 font-bold block mb-1">🚗 Transport &amp; Transfers:</span>
                <p className="text-white font-semibold">{previewQuote.cabType}</p>
              </div>
            </div>

            {/* Day by Day Timeline */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>🗓️</span> Day-by-Day Tour Program
              </h4>
              <div className="space-y-3">
                {Array.isArray(previewQuote.itinerary) && previewQuote.itinerary.length > 0 ? (
                  previewQuote.itinerary.map((day) => (
                    <div key={day.dayNumber} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/70 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-700/40 pb-2">
                        <div className="flex items-center gap-2 font-bold text-white text-sm">
                          <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
                            {day.dayNumber}
                          </span>
                          <span>{day.title}</span>
                        </div>
                        <span className="text-xs text-amber-400 font-semibold">{day.city}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 py-1">
                        <div>
                          <span className="text-slate-500 font-medium">Hotel: </span>
                          <span className="text-slate-200 font-semibold">{day.hotelName || "4★ Hotel"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Meal Plan: </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold">
                            {day.mealPlan === "MAP" ? "MAP (Breakfast + Dinner)" : day.mealPlan === "CP" ? "CP (Breakfast Only)" : day.mealPlan === "AP" ? "AP (All Meals)" : "EP (Room Only)"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Vehicle: </span>
                          <span className="text-slate-200 font-semibold">{day.vehicleType || previewQuote.cabType}</span>
                        </div>
                      </div>

                      {day.activities && (
                        <p className="text-xs text-slate-400 leading-relaxed pt-1">
                          {day.activities}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 text-xs text-slate-400 text-center">
                    Standard sequential itinerary applies for this proposal.
                  </div>
                )}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <h5 className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span>✓</span> Package Inclusions
                </h5>
                <ul className="space-y-1.5 text-slate-300">
                  {previewQuote.inclusions && previewQuote.inclusions.length > 0 ? (
                    previewQuote.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{inc}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li>• 4★ Deluxe Hotel Accommodations</li>
                      <li>• Daily Breakfast &amp; Dinner (MAP)</li>
                      <li>• Dedicated Chauffeur-driven Sanitized Cab</li>
                      <li>• Tolls, State Taxes, Fuel &amp; Parking</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <h5 className="font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span>✕</span> Package Exclusions
                </h5>
                <ul className="space-y-1.5 text-slate-300">
                  {previewQuote.exclusions && previewQuote.exclusions.length > 0 ? (
                    previewQuote.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{exc}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li>• Domestic / International Airfare</li>
                      <li>• Monument Entry Passes &amp; Pony Rides</li>
                      <li>• Personal Expenses &amp; Laundry</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => generateWhatsAppQuote(previewQuote)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>💬</span> Share on WhatsApp
              </button>
              <button
                onClick={() => handleSendEmail(previewQuote)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>✉️</span> Dispatch via Email
              </button>
              <button
                onClick={() => setPreviewQuote(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / BUILD ITINERARY QUOTE MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-400">ENTERPRISE CRM WORKFLOW</span>
                <h3 className="text-xl font-black text-white">Day-Wise Tour Itinerary &amp; Quotation Builder</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pre-saved Template Quick-Loader */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                ⚡ Quick Load Pre-Saved Destination Template
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadTemplate("KASHMIR")}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold text-white transition cursor-pointer"
                >
                  🏔️ Kashmir Paradise (5N/6D)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadTemplate("HIMACHAL")}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold text-white transition cursor-pointer"
                >
                  🌲 Himachal Scenic (5N/6D)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadTemplate("GOLDEN_TRIANGLE")}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold text-white transition cursor-pointer"
                >
                  🏰 Golden Triangle (4N/5D)
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-6 text-xs">
              {/* Client & Travel Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  1. Client Profile &amp; Trip Parameter
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Mobile / WhatsApp No. *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="client@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tour Package &amp; Destination Title *</label>
                    <input
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Travel Dates / Duration</label>
                    <input
                      type="text"
                      value={travelDates}
                      onChange={(e) => setTravelDates(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Number of Persons Adjuster */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold">Adjust Number of Travelers (Pax):</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono font-bold text-xs">
                      Total: {adultsCount} Adults{childrenCount > 0 ? `, ${childrenCount} Child` : ""}{infantsCount > 0 ? `, ${infantsCount} Infant` : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800 border border-slate-700">
                      <span className="text-slate-400 font-medium">Adults (12+):</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                          className="w-6 h-6 rounded bg-slate-700 text-white font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold text-white w-4 text-center">{adultsCount}</span>
                        <button
                          type="button"
                          onClick={() => setAdultsCount(adultsCount + 1)}
                          className="w-6 h-6 rounded bg-slate-700 text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800 border border-slate-700">
                      <span className="text-slate-400 font-medium">Children (5-11):</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                          className="w-6 h-6 rounded bg-slate-700 text-white font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold text-white w-4 text-center">{childrenCount}</span>
                        <button
                          type="button"
                          onClick={() => setChildrenCount(childrenCount + 1)}
                          className="w-6 h-6 rounded bg-slate-700 text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800 border border-slate-700">
                      <span className="text-slate-400 font-medium">Infants (&lt;5):</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInfantsCount(Math.max(0, infantsCount - 1))}
                          className="w-6 h-6 rounded bg-slate-700 text-white font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold text-white w-4 text-center">{infantsCount}</span>
                        <button
                          type="button"
                          onClick={() => setInfantsCount(infantsCount + 1)}
                          className="w-6 h-6 rounded bg-slate-700 text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Timeline Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                    2. Day-by-Day Timeline Builder ({itineraryDays.length} Days)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/30 cursor-pointer"
                  >
                    ＋ Add Next Day
                  </button>
                </div>

                <div className="space-y-3">
                  {itineraryDays.map((day, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                          Day {day.dayNumber}
                        </span>
                        {itineraryDays.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDay(idx)}
                            className="text-rose-400 hover:text-rose-300 font-bold text-[11px] cursor-pointer"
                          >
                            Remove Day ✕
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Day Heading / Title</label>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => handleUpdateDay(idx, "title", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">City / Region</label>
                          <input
                            type="text"
                            value={day.city}
                            onChange={(e) => handleUpdateDay(idx, "city", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-slate-400 font-bold mb-1">Hotel Name &amp; Category</label>
                          <input
                            type="text"
                            placeholder="e.g. Radisson Srinagar / Pine N Peak"
                            value={day.hotelName}
                            onChange={(e) => handleUpdateDay(idx, "hotelName", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Room Category</label>
                          <input
                            type="text"
                            placeholder="e.g. Deluxe Room"
                            value={day.roomCategory}
                            onChange={(e) => handleUpdateDay(idx, "roomCategory", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Meal Plan</label>
                          <select
                            value={day.mealPlan}
                            onChange={(e) => handleUpdateDay(idx, "mealPlan", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs font-semibold"
                          >
                            <option value="MAP">MAP (Breakfast + Dinner)</option>
                            <option value="CP">CP (Breakfast Only)</option>
                            <option value="AP">AP (All Meals - B, L, D)</option>
                            <option value="EP">EP (Room Only)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Vehicle / Cab for Day</label>
                          <input
                            type="text"
                            placeholder="e.g. Dedicated AC Innova Crysta"
                            value={day.vehicleType}
                            onChange={(e) => handleUpdateDay(idx, "vehicleType", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Sightseeing &amp; Activities Description</label>
                          <textarea
                            rows={2}
                            placeholder="Describe excursions, stops, landmarks..."
                            value={day.activities}
                            onChange={(e) => handleUpdateDay(idx, "activities", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  3. Inclusions &amp; Exclusions Management
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Inclusions */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
                    <span className="font-bold text-emerald-400 block text-xs">Included Items</span>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {inclusions.map((inc, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/60 px-2 py-1 rounded">
                          <span>✓ {inc}</span>
                          <button
                            type="button"
                            onClick={() => setInclusions(inclusions.filter((_, idx) => idx !== i))}
                            className="text-slate-500 hover:text-rose-400 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1 pt-1">
                      <input
                        type="text"
                        placeholder="Add new inclusion..."
                        value={newInclusion}
                        onChange={(e) => setNewInclusion(e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newInclusion.trim()) {
                            setInclusions([...inclusions, newInclusion.trim()]);
                            setNewInclusion("");
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Exclusions */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
                    <span className="font-bold text-rose-400 block text-xs">Excluded Items</span>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {exclusions.map((exc, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/60 px-2 py-1 rounded">
                          <span>✕ {exc}</span>
                          <button
                            type="button"
                            onClick={() => setExclusions(exclusions.filter((_, idx) => idx !== i))}
                            className="text-slate-500 hover:text-rose-400 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1 pt-1">
                      <input
                        type="text"
                        placeholder="Add new exclusion..."
                        value={newExclusion}
                        onChange={(e) => setNewExclusion(e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newExclusion.trim()) {
                            setExclusions([...exclusions, newExclusion.trim()]);
                            setNewExclusion("");
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Costing Engine */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                    4. Professional Pricing &amp; Markup Engine
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Internal margins hidden from client proposal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Supplier / Net Cost (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={netCost}
                      onChange={(e) => setNetCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Agency Markup (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={markupPercent}
                      onChange={(e) => setMarkupPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Apply GST 5%</label>
                    <div className="flex items-center h-10">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                        <input
                          type="checkbox"
                          checked={applyGst}
                          onChange={(e) => setApplyGst(e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                        <span>Include 5% Travel GST</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-slate-400">Estimated Agency Margin:</span>
                    <p className="font-bold text-emerald-400 text-xs">
                      {formatINR(grossBeforeTax - netCost)} ({markupPercent}% Margin)
                    </p>
                  </div>
                  <div className="space-y-0.5 sm:text-right">
                    <span className="text-[11px] text-slate-400">Client Quotation Amount (All-Inc):</span>
                    <p className="text-xl font-black text-amber-400">
                      {formatINR(computedTotalAmount)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Approx. {formatINR(computedPerPerson)} / person
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  ✓ Save &amp; Generate Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
