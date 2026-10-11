"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  leadId?: string;
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
  assignedSalesPerson?: {
    name: string;
    phone: string;
    email: string;
    role: string;
  };
  assignedToName?: string;
  notes?: string;
}

interface InboundLeadOption {
  _id: string;
  name: string;
  phone: string;
  email: string;
  destinations?: string[];
  travelDates?: { from?: string; to?: string };
  travellers?: { adults: number; children: number; infants?: number };
  budget?: { min?: number; max?: number; currency?: string };
  hotelCategory?: string;
  specialRequirements?: string;
  assignedTo?: { name?: string };
}

export const ITINERARY_TEMPLATES: Record<
  string,
  {
    name: string;
    destination: string;
    hotelTier: string;
    cabType: string;
    inclusions: string[];
    exclusions: string[];
    netCost: number;
    markupPercent: number;
    days: IQuoteDay[];
  }
> = {
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
        activities:
          "Pick up from Srinagar Airport. Check in to hotel. Evening relax with a magical 1-hour romantic Shikara ride on Dal Lake visiting Floating Market and Char Chinar.",
      },
      {
        dayNumber: 2,
        title: "Srinagar to Gulmarg Meadow Excursion & Gondola",
        city: "Gulmarg",
        hotelName: "Hotel Heevan Retreat / Pine Palace",
        roomCategory: "Valley View Deluxe",
        mealPlan: "MAP",
        vehicleType: "Private Innova Crysta",
        activities:
          "Scenic drive past apple orchards to Gulmarg (8,825 ft). Board the famous Gulmarg Gondola to Kongdoori and Apharwat Peak. Enjoy snow activities and golf course views.",
      },
      {
        dayNumber: 3,
        title: "Gulmarg to Pahalgam - The Valley of Shepherds",
        city: "Pahalgam",
        hotelName: "Pine N Peak Resort / Hotel Heevan",
        roomCategory: "River View Room",
        mealPlan: "MAP",
        vehicleType: "Private Innova Crysta",
        activities:
          "Drive along the Lidder River to Pahalgam. Enroute visit saffron fields of Pampore and historic Avantipur ruins. Evening riverside stroll at leisure.",
      },
      {
        dayNumber: 4,
        title: "Pahalgam Valley Exploration (Betaab & Aru)",
        city: "Pahalgam",
        hotelName: "Pine N Peak Resort / Hotel Heevan",
        roomCategory: "River View Room",
        mealPlan: "MAP",
        vehicleType: "Private Innova Crysta",
        activities:
          "Full day excursion to picturesque Betaab Valley, Aru Valley wildlife sanctuary, and Chandanwari. Savor local Kashmiri Kahwa by the river.",
      },
      {
        dayNumber: 5,
        title: "Pahalgam to Srinagar & Luxury Houseboat Experience",
        city: "Srinagar",
        hotelName: "Wangnoo Heritage Luxury Houseboat (Nigeen Lake)",
        roomCategory: "Royal Carved Suite",
        mealPlan: "MAP",
        vehicleType: "Private Innova Crysta",
        activities:
          "Return to Srinagar. Visit famous Mughal Gardens: Nishat Bagh and Shalimar Bagh. Check in to luxury cedarwood houseboat. Candlelight dinner on waters.",
      },
      {
        dayNumber: 6,
        title: "Old City Craft Tour & Srinagar Airport Departure",
        city: "Srinagar",
        hotelName: "Check-out",
        roomCategory: "N/A",
        mealPlan: "CP",
        vehicleType: "Private Innova Crysta",
        activities:
          "Morning visit to Lal Chowk for Pashmina and saffron shopping. Timely private transfer to Srinagar Airport for return flight with fond memories.",
      },
    ],
  },
  UTTARAKHAND: {
    name: "Uttarakhand Himalayan Explorer (5N/6D)",
    destination: "Nainital, Jim Corbett & Mussoorie Circuit",
    hotelTier: "4★ Boutique Nature Resorts & Wildlife Lodge",
    cabType: "Private Dedicated AC Ertiga / Innova",
    inclusions: [
      "2N Nainital + 1N Jim Corbett + 2N Mussoorie Stays",
      "Daily Breakfast & Dinner at all resorts (MAP Plan)",
      "Private sanitized cab for all inter-city transfers and local sightseeing",
      "Jim Corbett Open Jeep Jungle Safari permit & entry",
      "Private boat ride on Naini Lake",
      "All toll taxes, parking, driver allowance & fuel",
    ],
    exclusions: [
      "Airfare / Train tickets to/from Delhi or Kathgodam",
      "Adventure activities (Paragliding, River Rafting in Rishikesh)",
      "Personal laundry, phone calls & gratuities",
    ],
    netCost: 58000,
    markupPercent: 20,
    days: [
      {
        dayNumber: 1,
        title: "Delhi to Nainital - Lake City Arrival & Boat Ride",
        city: "Nainital",
        hotelName: "The Manu Maharani / Shervani Hilltop",
        roomCategory: "Premium Lake/Valley View",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities:
          "Morning pickup from Delhi. Scenic drive to Nainital. Check in at resort. Evening stroll along Mall Road and enjoy a serene boat ride on Naini Lake.",
      },
      {
        dayNumber: 2,
        title: "Nainital Lake Tour & Snow View Point",
        city: "Nainital",
        hotelName: "The Manu Maharani / Shervani Hilltop",
        roomCategory: "Premium Lake/Valley View",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities:
          "Visit Bhimtal, Sattal, and Naukuchiatal. Cable car ride to Snow View Point offering panoramic views of the Trishul and Nanda Devi peaks.",
      },
      {
        dayNumber: 3,
        title: "Nainital to Jim Corbett & Evening Wilderness Walk",
        city: "Jim Corbett",
        hotelName: "Corbett The Baagh / Namah Resort",
        roomCategory: "Jungle Luxury Cottage",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities:
          "Drive to Jim Corbett National Park. Enroute visit Corbett Waterfall and Garjiya Devi Temple. Evening relax by the Kosi river.",
      },
      {
        dayNumber: 4,
        title: "Morning Jeep Safari & Transfer to Mussoorie",
        city: "Mussoorie",
        hotelName: "Fortune Resort Grace / Jaypee Residency Manor",
        roomCategory: "Valley View Deluxe",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities:
          "Early morning 4x4 open jeep jungle safari in Corbett core zone. Afternoon scenic drive past Dehradun to Mussoorie (Queen of the Hills).",
      },
      {
        dayNumber: 5,
        title: "Mussoorie Sightseeing & Kempty Falls",
        city: "Mussoorie",
        hotelName: "Fortune Resort Grace / Jaypee Residency Manor",
        roomCategory: "Valley View Deluxe",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities:
          "Visit Kempty Falls, Gun Hill ropeway, Company Garden, and walk along the scenic Camel's Back Road. Sunset dinner overlooking Doon valley.",
      },
      {
        dayNumber: 6,
        title: "Mussoorie to Delhi International Airport Departure",
        city: "Delhi",
        hotelName: "Check-out",
        roomCategory: "N/A",
        mealPlan: "CP",
        vehicleType: "Private AC Cab",
        activities:
          "Breakfast and timely transfer back to Delhi Airport/Railway Station with unforgettable Himalayan memories.",
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
        activities:
          "Pick up from Chandigarh. Drive through Himalayan foothills to Shimla. Evening walk on Mall Road, Christ Church, and Lakkar Bazaar.",
      },
      {
        dayNumber: 2,
        title: "Kufri Adventure Park & Green Valley Excursion",
        city: "Shimla",
        hotelName: "Radisson Hotel Shimla / Willow Banks",
        roomCategory: "Deluxe Valley Room",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities:
          "Excursion to Kufri (Himalayan Nature Park, horse riding to Mahasu Peak) and scenic deodar forest trails in Mashobra.",
      },
      {
        dayNumber: 3,
        title: "Shimla to Manali via Kullu Valley & River Rafting",
        city: "Manali",
        hotelName: "Snow Valley Resorts / Apple Country Resort",
        roomCategory: "Premium Mountain View",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities:
          "Panoramic 7-hour drive to Manali along the Beas river. Enroute stop at Kullu Shawl factories and white-water river rafting point. Check in at Manali.",
      },
      {
        dayNumber: 4,
        title: "Solang Valley Snow Adventure & Atal Tunnel Experience",
        city: "Manali",
        hotelName: "Snow Valley Resorts / Apple Country Resort",
        roomCategory: "Premium Mountain View",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities:
          "Drive through engineering marvel Atal Tunnel to Sissu (Lahaul). Solang Valley adventure hub for zorbing, quad biking, and ropeway.",
      },
      {
        dayNumber: 5,
        title: "Local Manali Heritage & Hot Springs",
        city: "Manali",
        hotelName: "Snow Valley Resorts / Apple Country Resort",
        roomCategory: "Premium Mountain View",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities:
          "Visit 500-year-old wooden Hadimba Temple, Tibetan Monastery, and natural sulfur hot springs at Vashisht. Evening cafe hopping in Old Manali.",
      },
      {
        dayNumber: 6,
        title: "Manali to Chandigarh Airport Drop",
        city: "Chandigarh",
        hotelName: "Check-out",
        roomCategory: "N/A",
        mealPlan: "CP",
        vehicleType: "Private AC Cab",
        activities:
          "Early morning breakfast and return drive to Chandigarh Airport/Railway station for onward journey.",
      },
    ],
  },
  KERALA: {
    name: "Kerala God's Own Country (5N/6D)",
    destination: "Munnar, Thekkady & Alleppey Luxury Houseboat",
    hotelTier: "4★ Tea Plantation Resort & Premium AC Houseboat",
    cabType: "Private AC Sedan / Ertiga",
    inclusions: [
      "2N Munnar + 1N Thekkady + 1N Alleppey Houseboat + 1N Cochin",
      "Daily Breakfast & Dinner at resorts + All Meals on Houseboat",
      "Private AC vehicle throughout from Cochin Airport",
      "Exclusive private AC Houseboat cruise through backwaters",
      "Spice plantation guided tour in Thekkady",
      "All driver allowances, tolls & taxes",
    ],
    exclusions: [
      "Airfare / Train tickets to Cochin",
      "Periyar Lake boat safari tickets",
      "Kathakali & Kalaripayattu dance show tickets",
    ],
    netCost: 52000,
    markupPercent: 20,
    days: [
      {
        dayNumber: 1,
        title: "Cochin to Munnar - Waterfalls & Tea Gardens",
        city: "Munnar",
        hotelName: "Fragrant Nature Munnar / Blanket Hotel",
        roomCategory: "Valley View Room",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities:
          "Arrival at Cochin Airport. Drive through lush Western Ghats. Enroute see Cheeyappara and Valara waterfalls. Check in to tea estate resort.",
      },
      {
        dayNumber: 2,
        title: "Munnar Tea Museum, Mattupetty & Eravikulam",
        city: "Munnar",
        hotelName: "Fragrant Nature Munnar / Blanket Hotel",
        roomCategory: "Valley View Room",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities:
          "Visit Eravikulam National Park (home to endangered Nilgiri Tahr), Tea Museum, Mattupetty Dam, and Echo Point.",
      },
      {
        dayNumber: 3,
        title: "Munnar to Thekkady - Periyar Wildlife & Spices",
        city: "Thekkady",
        hotelName: "Elephant Court / Spice Village",
        roomCategory: "Patio Room",
        mealPlan: "MAP",
        vehicleType: "Private AC Cab",
        activities:
          "Drive to Thekkady. Visit certified organic spice plantations (cardamom, pepper, cinnamon). Evening Kathakali cultural show.",
      },
      {
        dayNumber: 4,
        title: "Thekkady to Alleppey - Private Backwater Houseboat",
        city: "Alleppey",
        hotelName: "Luxury AC Private Houseboat (Vembanad Lake)",
        roomCategory: "Deluxe Bedroom",
        mealPlan: "AP",
        vehicleType: "Private AC Cab",
        activities:
          "Board your traditional thatched houseboat at noon. Cruise through palm-fringed canals and paddy fields. Savor authentic Kerala fish curry and coastal delicacies.",
      },
      {
        dayNumber: 5,
        title: "Alleppey to Cochin - Fort Kochi Heritage",
        city: "Cochin",
        hotelName: "Brunton Boatyard / Casino Hotel",
        roomCategory: "Heritage Room",
        mealPlan: "CP",
        vehicleType: "Private AC Cab",
        activities:
          "Disembark houseboat and drive to historic Fort Kochi. See Chinese Fishing Nets, St. Francis Church, Mattancherry Dutch Palace, and Jew Town.",
      },
      {
        dayNumber: 6,
        title: "Cochin International Airport Departure",
        city: "Cochin",
        hotelName: "Check-out",
        roomCategory: "N/A",
        mealPlan: "CP",
        vehicleType: "Private AC Cab",
        activities:
          "Timely transfer to Cochin Airport for flight back home.",
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
        activities:
          "Arrival in Delhi. Tour Qutub Minar, India Gate, drive past Parliament House & Rashtrapati Bhavan. Evening dinner at Connaught Place.",
      },
      {
        dayNumber: 2,
        title: "Delhi to Agra & Sunset at Taj Mahal",
        city: "Agra",
        hotelName: "ITC Mughal / Radisson Hotel Agra",
        roomCategory: "Mughal Chamber",
        mealPlan: "CP",
        vehicleType: "Private Innova Crysta",
        activities:
          "Expressway drive to Agra. Check in. Afternoon guided tour of the UNESCO World Heritage Agra Fort. Marvel at the sunset view of the Taj Mahal.",
      },
      {
        dayNumber: 3,
        title: "Fatehpur Sikri Enroute to Jaipur Pink City",
        city: "Jaipur",
        hotelName: "Trident Jaipur / Marriott Hotel",
        roomCategory: "Deluxe Pool View",
        mealPlan: "CP",
        vehicleType: "Private Innova Crysta",
        activities:
          "Drive to Jaipur with en-route visit to Emperor Akbar's abandoned ghost city of Fatehpur Sikri and Chand Baori stepwell.",
      },
      {
        dayNumber: 4,
        title: "Jaipur Forts, Palaces & Johari Bazaar",
        city: "Jaipur",
        hotelName: "Trident Jaipur / Marriott Hotel",
        roomCategory: "Deluxe Pool View",
        mealPlan: "CP",
        vehicleType: "Private Innova Crysta",
        activities:
          "Morning elephant / jeep ride to Amber Fort. Photo-stop at Jal Mahal. Visit City Palace, Jantar Mantar observatory, and iconic Hawa Mahal.",
      },
      {
        dayNumber: 5,
        title: "Jaipur to Delhi International Airport Transfer",
        city: "Departure",
        hotelName: "Check-out",
        roomCategory: "N/A",
        mealPlan: "CP",
        vehicleType: "Private Innova Crysta",
        activities:
          "Breakfast and relaxed morning shopping for blue pottery and gems. Drive to Delhi International Airport for return departure.",
      },
    ],
  },
};

function formatTravelDates(td: string | { from?: string | Date; to?: string | Date } | any): string {
  if (!td) return "Flexible Dates";
  if (typeof td === "string") return td;
  if (typeof td === "object") {
    try {
      const fromStr = td.from
        ? new Date(td.from).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "";
      const toStr = td.to
        ? new Date(td.to).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "";
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
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [previewQuote, setPreviewQuote] = useState<QuoteItem | null>(null);
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Inbound Leads list for 1-click import
  const [inboundLeads, setInboundLeads] = useState<InboundLeadOption[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

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

  // Assigned Sales Consultant
  const [consultantName, setConsultantName] = useState("Admin / Senior Consultant");
  const [consultantPhone, setConsultantPhone] = useState("+91 8091638090");
  const [consultantEmail, setConsultantEmail] = useState("bookings@bemytraveller.com");

  // Computed Totals
  const totalTravelers = useMemo(() => adultsCount + childrenCount, [adultsCount, childrenCount]);
  const grossBeforeTax = useMemo(
    () => Math.round(netCost * (1 + markupPercent / 100)),
    [netCost, markupPercent]
  );
  const gstAmount = useMemo(() => (applyGst ? Math.round(grossBeforeTax * 0.05) : 0), [grossBeforeTax, applyGst]);
  const computedTotalAmount = useMemo(() => grossBeforeTax + gstAmount, [grossBeforeTax, gstAmount]);
  const computedPerPerson = useMemo(
    () => (totalTravelers > 0 ? Math.round(computedTotalAmount / totalTravelers) : computedTotalAmount),
    [computedTotalAmount, totalTravelers]
  );

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const fetchQuotes = useCallback(async () => {
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
  }, [search]);

  // Load Inbound Leads to enable 1-click import into builder
  const fetchInboundLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/leads");
      const data = await res.json();
      if (data.leads && Array.isArray(data.leads)) {
        setInboundLeads(data.leads);
      }
    } catch (err) {
      console.error("Failed to load inbound leads:", err);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    fetchInboundLeads();
  }, [fetchQuotes, fetchInboundLeads]);

  // Handle auto-import from Inbound Lead
  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    const lead = inboundLeads.find((l) => l._id === leadId);
    if (!lead) return;

    setCustomerName(lead.name || "");
    setCustomerPhone(lead.phone || "");
    setCustomerEmail(lead.email || "");

    if (lead.destinations && lead.destinations.length > 0) {
      const destStr = lead.destinations.join(", ");
      setDestination(`${destStr} Holiday Tour Package`);
      const matchedKey = Object.keys(ITINERARY_TEMPLATES).find((k) =>
        destStr.toLowerCase().includes(k.toLowerCase())
      );
      if (matchedKey) {
        handleLoadTemplate(matchedKey);
      }
    }

    if (lead.travelDates) {
      setTravelDates(formatTravelDates(lead.travelDates));
    }

    if (lead.travellers) {
      setAdultsCount(lead.travellers.adults || 2);
      setChildrenCount(lead.travellers.children || 0);
      setInfantsCount(lead.travellers.infants || 0);
    }

    if (lead.hotelCategory) {
      setHotelTier(`${lead.hotelCategory} Verified Resorts & Hotels`);
    }

    if (lead.budget?.max) {
      setNetCost(Math.round(lead.budget.max * 0.8));
    }

    if (lead.assignedTo?.name) {
      setConsultantName(lead.assignedTo.name);
    }

    showNotification(`Imported client profile for ${lead.name}`);
  };

  // Load Itinerary Template
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

  // Open Edit Mode for an existing Quote
  const handleOpenEditQuote = (q: QuoteItem) => {
    setEditingQuoteId(q._id);
    setSelectedLeadId(q.leadId || "");
    setCustomerName(q.customerName || "");
    setCustomerPhone(q.customerPhone || "");
    setCustomerEmail(q.customerEmail || "");
    setDestination(q.destination || "Custom Itinerary");
    setTravelDates(formatTravelDates(q.travelDates));
    setAdultsCount(q.travellers?.adults || 2);
    setChildrenCount(q.travellers?.children || 0);
    setInfantsCount(q.travellers?.infants || 0);
    setHotelTier(q.hotelTier || "4★ Deluxe");
    setCabType(q.cabType || "Private AC Vehicle");
    setItineraryDays(
      Array.isArray(q.itinerary) && q.itinerary.length > 0
        ? JSON.parse(JSON.stringify(q.itinerary))
        : ITINERARY_TEMPLATES.KASHMIR.days
    );
    setInclusions(q.inclusions || ITINERARY_TEMPLATES.KASHMIR.inclusions);
    setExclusions(q.exclusions || ITINERARY_TEMPLATES.KASHMIR.exclusions);
    setNetCost(q.costing?.netCost || Math.round((q.totalAmount || 60000) * 0.8));
    setMarkupPercent(q.costing?.markupPercent || 20);
    if (q.assignedSalesPerson) {
      setConsultantName(q.assignedSalesPerson.name || "Senior Holiday Specialist");
      setConsultantPhone(q.assignedSalesPerson.phone || "+91 8091638090");
      setConsultantEmail(q.assignedSalesPerson.email || "bookings@bemytraveller.com");
    }
    setModalOpen(true);
  };

  // Open Blank Builder
  const handleOpenNewQuote = () => {
    setEditingQuoteId(null);
    setSelectedLeadId("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setDestination("Kashmir Paradise Special (6N/7D)");
    setTravelDates("15 Oct 2026 – 21 Oct 2026");
    setAdultsCount(2);
    setChildrenCount(0);
    setInfantsCount(0);
    setHotelTier("4★ Deluxe Hotels + Luxury Houseboat");
    setCabType("Private Dedicated Innova Crysta");
    setItineraryDays(JSON.parse(JSON.stringify(ITINERARY_TEMPLATES.KASHMIR.days)));
    setInclusions([...ITINERARY_TEMPLATES.KASHMIR.inclusions]);
    setExclusions([...ITINERARY_TEMPLATES.KASHMIR.exclusions]);
    setNetCost(65000);
    setMarkupPercent(20);
    setModalOpen(true);
  };

  // Add Day
  const handleAddDay = () => {
    const nextDayNum = itineraryDays.length + 1;
    setItineraryDays([
      ...itineraryDays,
      {
        dayNumber: nextDayNum,
        title: `Day ${nextDayNum} Sightseeing & Scenic Excursion`,
        city: itineraryDays[itineraryDays.length - 1]?.city || "Destination",
        hotelName: itineraryDays[itineraryDays.length - 1]?.hotelName || "4★ Deluxe Hotel",
        roomCategory: "Deluxe Premium Room",
        mealPlan: "MAP",
        vehicleType: cabType,
        activities: "Full day excursion and local sightseeing as scheduled.",
      },
    ]);
  };

  // Remove Day
  const handleRemoveDay = (idx: number) => {
    if (itineraryDays.length <= 1) return;
    const filtered = itineraryDays
      .filter((_, i) => i !== idx)
      .map((day, i) => ({
        ...day,
        dayNumber: i + 1,
      }));
    setItineraryDays(filtered);
  };

  // Update Day Field
  const handleUpdateDay = (idx: number, field: keyof IQuoteDay, value: any) => {
    const updated = [...itineraryDays];
    updated[idx] = { ...updated[idx], [field]: value };
    setItineraryDays(updated);
  };

  // Save / Update Itinerary Quote
  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please provide the Customer Name and Mobile Number");
      return;
    }

    const paxSummary = `${adultsCount} Adults${childrenCount ? `, ${childrenCount} Child` : ""}${
      infantsCount ? `, ${infantsCount} Infant` : ""
    }`;

    const payload = {
      _id: editingQuoteId || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      destination: destination.trim(),
      travelDates,
      paxCount: paxSummary,
      adultsCount,
      childrenCount,
      infantsCount,
      hotelTier,
      cabType,
      totalAmount: computedTotalAmount,
      leadId: selectedLeadId || undefined,
      itinerary: itineraryDays,
      inclusions,
      exclusions,
      costing: {
        netCost,
        markupPercent,
        gstPercent: applyGst ? 5 : 0,
        perPersonCost: computedPerPerson,
      },
      assignedSalesPerson: {
        name: consultantName,
        phone: consultantPhone,
        email: consultantEmail,
        role: "Senior Holiday Specialist",
      },
      status: "SENT",
    };

    try {
      const res = await fetch("/api/v1/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setModalOpen(false);
        showNotification(
          editingQuoteId
            ? "Proposal itinerary updated successfully!"
            : "New day-wise tour proposal generated and attached!"
        );
        fetchQuotes();
      } else {
        const err = await res.json();
        alert(err?.error || "Failed to save proposal");
      }
    } catch (err) {
      console.error("Error saving quote:", err);
    }
  };

  // WhatsApp Proposal Dispatch
  const generateWhatsAppQuote = (q: QuoteItem) => {
    const datesStr = formatTravelDates(q.travelDates);
    let dayWiseSummary = "";
    if (q.itinerary && q.itinerary.length > 0) {
      dayWiseSummary =
        "\n📋 *DAY-WISE TOUR TIMELINE:*\n" +
        q.itinerary
          .map(
            (d) =>
              `• *Day ${d.dayNumber}: ${d.title}*\n  🏨 *Stay:* ${d.hotelName || "4★ Hotel"} (${
                d.mealPlan || "MAP"
              } Plan)\n  🚗 *Transport:* ${d.vehicleType || q.cabType}\n  📍 *Activity:* ${
                d.activities ? d.activities.substring(0, 85) + "..." : "Sightseeing"
              }`
          )
          .join("\n\n");
    }

    const assignedConsultantText = q.assignedSalesPerson?.name
      ? `\n👤 *Your Dedicated Specialist:* ${q.assignedSalesPerson.name} (${q.assignedSalesPerson.phone})`
      : "";

    const text =
      `🌟 *CUSTOM TOUR ITINERARY PROPOSAL* 🌟\n*Be My Traveller Holidays*\n\n` +
      `Dear *${q.customerName}*,\n` +
      `Thank you for connecting with us! Here is your custom handcrafted tour itinerary:\n\n` +
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
        ? q.inclusions.slice(0, 5).map((inc) => `✓ ${inc}`).join("\n")
        : "✓ 4★ Deluxe Hotels\n✓ Daily Breakfast & Dinner\n✓ Dedicated Private Vehicle\n✓ Tolls, Parking & Driver Allowances\n✓ 24/7 On-Tour Support") +
      `\n\n👉 *Reply directly to this message to customize any day or confirm your dates!*` +
      assignedConsultantText +
      `\n📞 *Hotline / 24/7 Concierge:* +91 8091638090 | www.bemytraveller.com`;

    const cleanPhone = q.customerPhone.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank");
  };

  // Email Dispatch
  const handleSendEmail = async (q: QuoteItem) => {
    let emailToSend = q.customerEmail;
    if (!emailToSend) {
      const emailInput = prompt(`Enter customer email address for ${q.customerName}:`);
      if (!emailInput || !emailInput.includes("@")) {
        alert("Valid email address is required to dispatch proposal.");
        return;
      }
      emailToSend = emailInput;
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
          recipientEmail: emailToSend,
          destination: q.destination,
          travelDates: formatTravelDates(q.travelDates),
          paxCount: q.paxCount,
          hotelTier: q.hotelTier,
          cabType: q.cabType,
          totalAmount: q.totalAmount,
          itinerary: q.itinerary,
          inclusions: q.inclusions,
          exclusions: q.exclusions,
          assignedSalesPerson: q.assignedSalesPerson,
        }),
      });
      if (res.ok) {
        showNotification(`Official Proposal emailed to ${emailToSend}`);
      } else {
        alert("Failed to deliver email. Opening direct email client...");
        window.open(
          `mailto:${emailToSend}?subject=${encodeURIComponent(
            `Be My Traveller Tour Proposal #${q.quoteNumber} - ${q.destination}`
          )}&body=${encodeURIComponent(`Dear ${q.customerName},\n\nPlease find your tour proposal for ${q.destination} attached.\nTotal: ${formatINR(q.totalAmount)}\n\nBest Regards,\nBe My Traveller Holidays`)}`
        );
      }
    } catch {
      alert("Error dispatching email");
    } finally {
      setSendingEmailId(null);
    }
  };

  // Convert Quote to Active Booking
  const handleConvertToBooking = async (quoteId: string) => {
    if (!confirm("Confirm and convert this proposal into an active Booking? This will automatically notify Hotel Desk, Transport Desk, and Accounts.")) {
      return;
    }

    try {
      const res = await fetch("/api/v1/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      });
      if (res.ok) {
        showNotification("🎉 Proposal accepted & converted to active Booking! Operations desks notified.");
        fetchQuotes();
      } else {
        const err = await res.json();
        alert(err?.error || "Failed to convert quote to booking");
      }
    } catch (err) {
      console.error("Convert error:", err);
      alert("Error executing booking conversion");
    }
  };

  const copyQuoteSummary = (q: QuoteItem) => {
    const text = `Be My Traveller Proposal - ${q.quoteNumber}\nCustomer: ${q.customerName} (${q.customerPhone})\nDestination: ${q.destination}\nDates: ${formatTravelDates(q.travelDates)}\nAmount: ${formatINR(q.totalAmount)}`;
    navigator.clipboard.writeText(text);
    setCopiedMsg(q._id);
    setTimeout(() => setCopiedMsg(null), 2000);
  };

  const filteredQuotes = useMemo(() => {
    if (statusFilter === "ALL") return quotes;
    return quotes.filter((q) => q.status === statusFilter);
  }, [quotes, statusFilter]);

  const stats = useMemo(() => {
    const total = quotes.length;
    const sent = quotes.filter((q) => q.status === "SENT").length;
    const confirmed = quotes.filter(
      (q) => q.status === "CONFIRMED" || q.status === "ACCEPTED" || q.status === "CONVERTED"
    ).length;
    const totalPipelineValue = quotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0);
    return { total, sent, confirmed, totalPipelineValue };
  }, [quotes]);

  return (
    <div className="space-y-6 pb-16">
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

        <button
          onClick={handleOpenNewQuote}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <span>+</span> Build Itinerary Quote
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Total Proposals</span>
          <p className="text-2xl font-black text-white">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-black text-sky-400 uppercase tracking-wider block">Dispatched to Clients</span>
          <p className="text-2xl font-black text-sky-400">{stats.sent}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider block">Converted &amp; Booked</span>
          <p className="text-2xl font-black text-emerald-400">{stats.confirmed}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">Pipeline Proposal Value</span>
          <p className="text-2xl font-black text-amber-400">{formatINR(stats.totalPipelineValue)}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search proposals by client name, mobile, destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {["ALL", "SENT", "DRAFT", "CONFIRMED", "CONVERTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
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
                <th className="py-3.5 px-4 min-w-[200px]">Client Details</th>
                <th className="py-3.5 px-4 min-w-[220px]">Tour Package &amp; Timeline</th>
                <th className="py-3.5 px-4 min-w-[190px]">Hotel &amp; Transport Setup</th>
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
                filteredQuotes.map((q) => {
                  const cleanPhone = q.customerPhone ? q.customerPhone.replace(/[^0-9]/g, "") : "";
                  const phoneWithCountry = cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone;

                  return (
                    <tr key={q._id} className="hover:bg-slate-800/50 transition-colors">
                      {/* 1. Proposal Ref */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-mono font-black text-amber-400 text-xs block">
                          {q.quoteNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                        {q.assignedSalesPerson?.name && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 truncate max-w-[120px]">
                            👤 {q.assignedSalesPerson.name}
                          </span>
                        )}
                      </td>

                      {/* 2. Client Details (Properly Populated) */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-bold text-white text-[13px]">{q.customerName || "Valued Traveller"}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <a
                            href={`https://wa.me/${phoneWithCountry}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] font-semibold flex items-center gap-0.5"
                            title="Chat on WhatsApp"
                          >
                            <span>💬</span> {q.customerPhone}
                          </a>
                        </div>
                        {q.customerEmail && (
                          <p className="text-slate-500 text-[10px] truncate max-w-[180px] mt-0.5">
                            ✉️ {q.customerEmail}
                          </p>
                        )}
                      </td>

                      {/* 3. Tour Package & Timeline */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-semibold text-white leading-tight">{q.destination}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-slate-400 text-[11px]">
                          <span>📅 {formatTravelDates(q.travelDates)}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-medium">{q.paxCount}</span>
                        </div>
                        {Array.isArray(q.itinerary) && q.itinerary.length > 0 && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                            📋 {q.itinerary.length} Days Plan Included
                          </span>
                        )}
                      </td>

                      {/* 4. Hotel & Transport Setup */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="text-slate-300 font-medium line-clamp-1">🏨 {q.hotelTier}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">🚗 {q.cabType}</p>
                      </td>

                      {/* 5. Package Price */}
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

                      {/* 6. Status */}
                      <td className="py-3.5 px-4 align-top">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black ${
                            q.status === "CONFIRMED" || q.status === "ACCEPTED" || q.status === "CONVERTED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : q.status === "SENT"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {q.status === "CONVERTED" ? "✓ BOOKED" : q.status}
                        </span>
                      </td>

                      {/* 7. Multi-Channel Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Preview / Voucher */}
                          <button
                            onClick={() => setPreviewQuote(q)}
                            className="p-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                            title="Preview Full Daywise Proposal & Voucher"
                          >
                            👁️ View
                          </button>

                          {/* Re-edit Itinerary */}
                          <button
                            onClick={() => handleOpenEditQuote(q)}
                            className="p-1.5 px-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition cursor-pointer"
                            title="Edit Itinerary & Pricing"
                          >
                            ✏️ Edit
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
                          {q.status !== "CONVERTED" && (
                            <button
                              onClick={() => handleConvertToBooking(q._id)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Convert to Confirmed Booking"
                            >
                              <span>✈️</span> Book
                            </button>
                          )}

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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── HIGH-END BRANDED PROPOSAL VOUCHER PREVIEW MODAL ── */}
      {previewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-xl">📄</span>
                <div>
                  <h3 className="text-lg font-black text-white">Client Itinerary Voucher Spec</h3>
                  <p className="text-xs text-slate-400">Proposal #{previewQuote.quoteNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>🖨️</span> Print / PDF
                </button>
                <button
                  onClick={() => setPreviewQuote(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Branded Voucher Paper */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-inner">
              {/* Company Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-500 block">
                    BE MY TRAVELLER HOLIDAYS
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    Handcrafted Holiday Itinerary Proposal
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Govt. Approved &amp; Verified Travel Network • 24/7 Concierge Hotline: +91 8091638090
                  </p>
                </div>
                <div className="text-left sm:text-right space-y-1">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                    ✓ Verified Itinerary
                  </span>
                  <p className="text-xs font-mono text-slate-300">Ref: {previewQuote.quoteNumber}</p>
                  <p className="text-[10px] text-slate-400">
                    Date: {new Date(previewQuote.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Guest & Trip Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px]">Traveler Name</span>
                  <p className="font-bold text-white text-sm mt-0.5">👤 {previewQuote.customerName}</p>
                  <p className="text-slate-400 font-mono mt-0.5">📱 {previewQuote.customerPhone}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px]">Destination</span>
                  <p className="font-bold text-amber-400 text-sm mt-0.5">📍 {previewQuote.destination}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px]">Travel Dates &amp; Pax</span>
                  <p className="font-bold text-white text-xs mt-0.5">📅 {formatTravelDates(previewQuote.travelDates)}</p>
                  <p className="text-slate-400 font-medium mt-0.5">👥 {previewQuote.paxCount}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px]">Total Package Price</span>
                  <p className="font-black text-amber-400 text-base mt-0.5">{formatINR(previewQuote.totalAmount)}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">All-Inclusive (Taxes &amp; GST)</p>
                </div>
              </div>

              {/* Hotel & Vehicle Standards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <span className="text-slate-400 font-bold block mb-1">🏨 Accommodation Tier:</span>
                  <p className="text-white font-semibold">{previewQuote.hotelTier}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <span className="text-slate-400 font-bold block mb-1">🚗 Transport &amp; Transfers:</span>
                  <p className="text-white font-semibold">{previewQuote.cabType}</p>
                </div>
              </div>

              {/* Day-by-Day Timeline */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>🗓️</span> Day-by-Day Tour Program &amp; Sightseeing
                </h4>
                <div className="space-y-3">
                  {Array.isArray(previewQuote.itinerary) && previewQuote.itinerary.length > 0 ? (
                    previewQuote.itinerary.map((day) => (
                      <div
                        key={day.dayNumber}
                        className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70 space-y-2.5"
                      >
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
                            <span className="text-slate-500 font-medium">Hotel Stay: </span>
                            <span className="text-slate-200 font-semibold">{day.hotelName || "4★ Hotel"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Meal Plan: </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold">
                              {day.mealPlan === "MAP"
                                ? "MAP (Breakfast + Dinner)"
                                : day.mealPlan === "CP"
                                ? "CP (Breakfast Only)"
                                : day.mealPlan === "AP"
                                ? "AP (All Meals Included)"
                                : "EP (Room Only)"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Vehicle: </span>
                            <span className="text-slate-200 font-semibold">
                              {day.vehicleType || previewQuote.cabType}
                            </span>
                          </div>
                        </div>

                        {day.activities && (
                          <p className="text-xs text-slate-300 leading-relaxed pt-1">{day.activities}</p>
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
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <h5 className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <span>✓</span> 100% Guaranteed Inclusions
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

                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
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

              {/* Assigned Specialist & Concierge Contact */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px]">Your Dedicated Trip Specialist</span>
                  <p className="text-white font-bold text-sm mt-0.5">
                    👤 {previewQuote.assignedSalesPerson?.name || "Senior Holiday Specialist"}
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    📞 {previewQuote.assignedSalesPerson?.phone || "+91 8091638090"} • ✉️ {previewQuote.assignedSalesPerson?.email || "bookings@bemytraveller.com"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateWhatsAppQuote(previewQuote)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>💬</span> WhatsApp Proposal
                  </button>
                  <button
                    onClick={() => handleSendEmail(previewQuote)}
                    className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>✉️</span> Email Proposal
                  </button>
                </div>
              </div>

              {/* Company Footer Note */}
              <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                Be My Traveller Main Office: Manali &amp; Delhi NCR • Official Support: +91 8091638090 • info@bemytraveller.com • www.bemytraveller.com
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT ITINERARY QUOTE MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-400">
                  ENTERPRISE CRM WORKFLOW
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {editingQuoteId ? "✏️ Edit Tour Itinerary & Quotation Proposal" : "Day-Wise Tour Itinerary & Quotation Builder"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 1. Inbound Lead Auto-Import Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-800/80 to-slate-800/60 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔗</span> 1-Click Auto-Import Active Inbound Lead
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {inboundLeads.length} Leads Available
                </span>
              </div>
              <select
                value={selectedLeadId}
                onChange={(e) => handleSelectLead(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="">-- Choose Inbound Lead to Auto-Fill Client Data --</option>
                {inboundLeads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name} ({l.phone}) — {l.destinations?.[0] || l.specialRequirements || "Holiday Package"}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Pre-saved Template Quick-Loader */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                ⚡ Quick Load Destination Template
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {Object.keys(ITINERARY_TEMPLATES).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleLoadTemplate(key)}
                    className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold text-white transition cursor-pointer"
                  >
                    {ITINERARY_TEMPLATES[key].name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveQuote} className="space-y-6">
              {/* Client & Travel Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +91 98200 45678"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. vikram.m@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Tour Destination &amp; Circuit *</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Kashmir Paradise (Srinagar, Gulmarg, Pahalgam)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Travel Dates / Duration</label>
                  <input
                    type="text"
                    value={travelDates}
                    onChange={(e) => setTravelDates(e.target.value)}
                    placeholder="e.g. 15 Oct 2026 – 21 Oct 2026 (6N/7D)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Passengers Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  👥 Passenger Group Composition
                </span>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Adults (12+ yrs)</label>
                    <input
                      type="number"
                      min="1"
                      value={adultsCount}
                      onChange={(e) => setAdultsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Children (2-11 yrs)</label>
                    <input
                      type="number"
                      min="0"
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Infants (&lt; 2 yrs)</label>
                    <input
                      type="number"
                      min="0"
                      value={infantsCount}
                      onChange={(e) => setInfantsCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Hotel Tier & Fleet Setup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Hotel Category / Stays</label>
                  <input
                    type="text"
                    value={hotelTier}
                    onChange={(e) => setHotelTier(e.target.value)}
                    placeholder="e.g. 4★ Deluxe Hotels & Luxury Houseboat"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Vehicle / Cab Fleet</label>
                  <input
                    type="text"
                    value={cabType}
                    onChange={(e) => setCabType(e.target.value)}
                    placeholder="e.g. Private Dedicated Innova Crysta"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Day-by-Day Timeline Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>🗓️</span> Day-Wise Tour Program ({itineraryDays.length} Days)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition cursor-pointer"
                  >
                    + Add Day
                  </button>
                </div>

                <div className="space-y-4">
                  {itineraryDays.map((day, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                            {day.dayNumber}
                          </span>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => handleUpdateDay(idx, "title", e.target.value)}
                            placeholder="Day Title / Sightseeing Headline"
                            className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        {itineraryDays.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDay(idx)}
                            className="text-slate-500 hover:text-rose-400 text-xs p-1 cursor-pointer"
                            title="Remove Day"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">City / Location</label>
                          <input
                            type="text"
                            value={day.city}
                            onChange={(e) => handleUpdateDay(idx, "city", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Hotel Name</label>
                          <input
                            type="text"
                            value={day.hotelName}
                            onChange={(e) => handleUpdateDay(idx, "hotelName", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Room Category</label>
                          <input
                            type="text"
                            value={day.roomCategory}
                            onChange={(e) => handleUpdateDay(idx, "roomCategory", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Meal Plan</label>
                          <select
                            value={day.mealPlan}
                            onChange={(e) => handleUpdateDay(idx, "mealPlan", e.target.value as any)}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold"
                          >
                            <option value="MAP">MAP (Breakfast + Dinner)</option>
                            <option value="CP">CP (Breakfast Only)</option>
                            <option value="AP">AP (All Meals)</option>
                            <option value="EP">EP (Room Only)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">
                          Activities &amp; Sightseeing Description
                        </label>
                        <textarea
                          rows={2}
                          value={day.activities}
                          onChange={(e) => handleUpdateDay(idx, "activities", e.target.value)}
                          placeholder="Detailed itinerary and stops for the day..."
                          className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Inclusions */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    ✓ Inclusions Checklist
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom inclusion..."
                      value={newInclusion}
                      onChange={(e) => setNewInclusion(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newInclusion.trim()) {
                          setInclusions([...inclusions, newInclusion.trim()]);
                          setNewInclusion("");
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
                    {inclusions.map((inc, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
                        <span>• {inc}</span>
                        <button
                          type="button"
                          onClick={() => setInclusions(inclusions.filter((_, idx) => idx !== i))}
                          className="text-slate-500 hover:text-rose-400 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exclusions */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-2">
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                    ✕ Exclusions Checklist
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom exclusion..."
                      value={newExclusion}
                      onChange={(e) => setNewExclusion(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newExclusion.trim()) {
                          setExclusions([...exclusions, newExclusion.trim()]);
                          setNewExclusion("");
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
                    {exclusions.map((exc, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
                        <span>• {exc}</span>
                        <button
                          type="button"
                          onClick={() => setExclusions(exclusions.filter((_, idx) => idx !== i))}
                          className="text-slate-500 hover:text-rose-400 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Costing Engine & Assigned Specialist */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-800 to-slate-800 border border-amber-500/30 space-y-4">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                  💰 Commercials &amp; Costing Calculator
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Net Vendor Cost (₹)</label>
                    <input
                      type="number"
                      value={netCost}
                      onChange={(e) => setNetCost(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Company Markup (%)</label>
                    <input
                      type="number"
                      value={markupPercent}
                      onChange={(e) => setMarkupPercent(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="gstToggle"
                      checked={applyGst}
                      onChange={(e) => setApplyGst(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="gstToggle" className="text-xs font-bold text-slate-300 cursor-pointer">
                      Apply 5% GST
                    </label>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Package Price</span>
                    <span className="text-lg font-black text-amber-400">{formatINR(computedTotalAmount)}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {formatINR(computedPerPerson)} / person
                    </span>
                  </div>
                </div>

                {/* Assigned Consultant Input */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-700 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Assigned Specialist Name</label>
                    <input
                      type="text"
                      value={consultantName}
                      onChange={(e) => setConsultantName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Specialist Direct Contact</label>
                    <input
                      type="text"
                      value={consultantPhone}
                      onChange={(e) => setConsultantPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Specialist Email</label>
                    <input
                      type="email"
                      value={consultantEmail}
                      onChange={(e) => setConsultantEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition cursor-pointer"
                >
                  {editingQuoteId ? "Save & Update Proposal" : "Save Itinerary & Dispatch Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
