"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { formatINR } from "@/lib/utils";

export interface IQuoteDay {
  dayNumber: number;
  title: string;
  city: string;
  cityImageUrl?: string;
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
  paymentPolicies?: string[];
  cancellationPolicies?: string[];
  importantInfo?: string[];
  welcomeMessage?: string;
  showCancellationPolicies?: boolean;
  selectedTier?: "deluxe" | "superDeluxe" | "luxury";
  tierOptions?: {
    showDeluxe?: boolean;
    showSuperDeluxe?: boolean;
    showLuxury?: boolean;
  };
  pricingTiers?: {
    deluxe: { hotelTier: string; cabType: string; netCost: number; totalAmount: number; perPersonCost: number };
    superDeluxe: { hotelTier: string; cabType: string; netCost: number; totalAmount: number; perPersonCost: number };
    luxury: { hotelTier: string; cabType: string; netCost: number; totalAmount: number; perPersonCost: number };
  };
}

export const DEFAULT_WELCOME_MESSAGE =
  "Dear Valued Guest, Greetings from Be My Traveller! Thank you for choosing us to plan your memorable journey. We are pleased to present your customized, handcrafted holiday proposal featuring verified accommodations, dedicated sanitized fleet, and curated day-wise sightseeing. Kindly review your tour program and options below.";

export interface DestinationOption {
  _id: string;
  name: string;
  slug: string;
  type?: string;
  stateName?: string;
  countryName?: string;
  region?: string;
  coverImageStr?: string;
  coverImage?: string | { url?: string };
  gallery?: Array<string | { url?: string }>;
}

export function getDestinationImageUrl(d?: DestinationOption | null, cityName?: string): string {
  if (d) {
    if (typeof d.coverImage === "string" && d.coverImage.trim()) return d.coverImage;
    if (typeof d.coverImage === "object" && d.coverImage?.url) return d.coverImage.url;
    if (d.coverImageStr && d.coverImageStr.trim()) return d.coverImageStr;
    if (Array.isArray(d.gallery) && d.gallery.length > 0) {
      const g = d.gallery[0];
      if (typeof g === "string") return g;
      if (typeof g === "object" && g?.url) return g.url;
    }
  }
  const c = (cityName || "").toLowerCase();
  if (c.includes("srinagar") || c.includes("dal lake")) return "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80";
  if (c.includes("gulmarg")) return "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80";
  if (c.includes("pahalgam")) return "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80";
  if (c.includes("manali")) return "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80";
  if (c.includes("shimla")) return "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80";
  if (c.includes("dharamshala") || c.includes("mcleodganj")) return "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80";
  if (c.includes("kerala") || c.includes("munnar") || c.includes("alleppey") || c.includes("kochi")) return "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80";
  if (c.includes("goa")) return "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80";
  if (c.includes("leh") || c.includes("ladakh") || c.includes("nubra") || c.includes("pangong")) return "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80";
  if (c.includes("jaipur") || c.includes("rajasthan") || c.includes("udaipur") || c.includes("jodhpur")) return "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80";
  if (c.includes("nainital") || c.includes("corbett") || c.includes("mussoorie") || c.includes("rishikesh")) return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
  if (c.includes("bali") || c.includes("ubud") || c.includes("seminyak")) return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80";
  if (c.includes("dubai") || c.includes("abu dhabi")) return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80";
  if (c.includes("phuket") || c.includes("bangkok") || c.includes("thailand") || c.includes("krabi")) return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
  return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80";
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

export const DEFAULT_PAYMENT_POLICIES: string[] = [
  "50% advance payment required at time of booking confirmation.",
  "Remaining 50% balance due 7 days before travel commencement.",
  "Accepted via NEFT / RTGS / UPI / Credit & Debit Cards (2% processing fee on card payments).",
  "GST @5% applicable on total tour value. Tax Invoice issued upon full payment.",
  "This proposal is valid for 7 days from the date of issue.",
];

export const DEFAULT_CANCELLATION_POLICIES: string[] = [
  "30+ days prior to departure: 10% of total tour package deducted as administrative booking charges.",
  "15 to 29 days prior to departure: 25% of total package cost deducted.",
  "7 to 14 days prior to departure: 50% of total package cost deducted.",
  "Less than 7 days prior or No-Show: 100% non-refundable under all circumstances.",
  "Peak Season / Holiday departures (Diwali, Christmas, New Year) are 100% non-refundable upon confirmation.",
  "Flight & train cancellations follow respective airline / railway fare policies.",
  "Refunds, when approved, are credited to original payment method within 7–10 working banking days.",
];

export const DEFAULT_IMPORTANT_INFO: string[] = [
  "Valid Govt. Photo ID (Aadhaar / Voter ID / Passport) is strictly mandatory for all guests at hotel check-in and transit.",
  "Standard hotel check-in is 14:00 hrs & check-out is 11:00 hrs (early check-in subject to room availability).",
  "AC in vehicles will be switched off on hilly / steep ghat roads as per mountain road safety regulations.",
  "Any sightseeing unutilized due to traffic jams, bad weather, or sudden local road closures is non-refundable.",
  "24x7 Dedicated On-Trip Concierge & Emergency Support: +91 8091638090.",
];

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

interface CityPickerInputProps {
  value: string;
  imageUrl?: string;
  destinations: DestinationOption[];
  onSelect: (cityName: string, imageUrl?: string) => void;
  onClearImage?: () => void;
  onCustomImage?: (url: string) => void;
}

function CityPickerInput({
  value,
  imageUrl,
  destinations,
  onSelect,
  onClearImage,
  onCustomImage,
}: CityPickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showUrlPrompt, setShowUrlPrompt] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = (search || value || "").toLowerCase().trim();
    if (!q) return destinations.slice(0, 15);
    return destinations
      .filter((d) => {
        const nameMatch = d.name?.toLowerCase().includes(q);
        const stateMatch = d.stateName?.toLowerCase().includes(q);
        const slugMatch = d.slug?.toLowerCase().includes(q);
        return nameMatch || stateMatch || slugMatch;
      })
      .slice(0, 20);
  }, [destinations, search, value]);

  const activeImage = imageUrl || (value ? getDestinationImageUrl(null, value) : "");

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-0.5">
        <label className="text-[10px] text-slate-400 font-bold">City / Location</label>
        {activeImage && (
          <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
            <span>📷</span> Image linked
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onSelect(e.target.value, imageUrl);
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setSearch(value);
              setIsOpen(true);
            }}
            placeholder="Type or pick destination..."
            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 pr-7"
          />
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px] cursor-pointer"
            title="Toggle destinations dropdown"
          >
            ▼
          </button>
        </div>

        {/* Thumbnail Preview Badge */}
        {activeImage ? (
          <div className="relative group shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/60 bg-slate-800 shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={value || "place"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            {onClearImage && (
              <button
                type="button"
                onClick={onClearImage}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-bold shadow hover:bg-rose-500 cursor-pointer"
                title="Remove image"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUrlPrompt((prev) => !prev)}
            className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-amber-400 font-bold shrink-0 cursor-pointer"
            title="Paste custom image URL"
          >
            + 📷
          </button>
        )}
      </div>

      {/* Custom URL prompt */}
      {showUrlPrompt && (
        <div className="mt-1.5 p-2 rounded-xl bg-slate-900 border border-amber-500/40 shadow-xl space-y-1.5 z-40 relative">
          <span className="text-[10px] text-slate-300 font-bold block">Custom Place Image URL:</span>
          <div className="flex gap-1.5">
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-white"
            />
            <button
              type="button"
              onClick={() => {
                if (customUrl.trim() && onCustomImage) {
                  onCustomImage(customUrl.trim());
                  setShowUrlPrompt(false);
                  setCustomUrl("");
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[10px] cursor-pointer"
            >
              Set
            </button>
            <button
              type="button"
              onClick={() => setShowUrlPrompt(false)}
              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 divide-y divide-slate-800">
          <div className="p-1.5 bg-slate-950 sticky top-0 flex items-center justify-between text-[10px] text-slate-400 px-2 font-bold border-b border-slate-800">
            <span>Choose from /admin/content/destinations ({filtered.length})</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          {filtered.length > 0 ? (
            filtered.map((dest) => {
              const img = getDestinationImageUrl(dest, dest.name);
              return (
                <button
                  key={dest._id || dest.slug}
                  type="button"
                  onClick={() => {
                    onSelect(dest.name, img);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-2 hover:bg-amber-500/10 flex items-center gap-2.5 transition cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700 group-hover:border-amber-500/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                        {dest.name}
                      </span>
                      {dest.type && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                          {dest.type}
                        </span>
                      )}
                    </div>
                    {(dest.stateName || dest.countryName) && (
                      <span className="text-[10px] text-slate-400 truncate block">
                        {dest.stateName ? `${dest.stateName}, ` : ""}{dest.countryName || "India"}
                      </span>
                    )}
                  </div>
                  <span className="text-amber-400 text-xs opacity-0 group-hover:opacity-100 transition font-bold shrink-0">
                    Select ➔
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-slate-400">
              No matching destination found. You can keep &quot;{value}&quot; as custom place.
            </div>
          )}
        </div>
      )}
    </div>
  );
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

  // Destinations list from /admin/content/destinations for dynamic city selector
  const [adminDestinations, setAdminDestinations] = useState<DestinationOption[]>([]);

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

  // Payment Policies
  const [paymentPolicies, setPaymentPolicies] = useState<string[]>([...DEFAULT_PAYMENT_POLICIES]);
  const [newPolicy, setNewPolicy] = useState("");

  // Cancellation Policies & Important Information
  const [cancellationPolicies, setCancellationPolicies] = useState<string[]>([...DEFAULT_CANCELLATION_POLICIES]);
  const [newCancelPolicy, setNewCancelPolicy] = useState("");
  const [importantInfo, setImportantInfo] = useState<string[]>([...DEFAULT_IMPORTANT_INFO]);
  const [newInfoNote, setNewInfoNote] = useState("");

  // Welcome / Greetings Message
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_WELCOME_MESSAGE);

  // Cancellation Policies Visibility Toggle (Show / Hide on PDF)
  const [showCancellationPolicies, setShowCancellationPolicies] = useState(true);

  // Primary Package Tier Selection & Selective Alternative Options
  const [selectedTier, setSelectedTier] = useState<"deluxe" | "superDeluxe" | "luxury">("superDeluxe");
  const [showDeluxeOption, setShowDeluxeOption] = useState(false);
  const [showSuperDeluxeOption, setShowSuperDeluxeOption] = useState(true);
  const [showLuxuryOption, setShowLuxuryOption] = useState(true);

  // Three-Tier Pricing (Deluxe / Super Deluxe / Luxury)
  const [deluxeHotel, setDeluxeHotel] = useState("3★ Standard Deluxe Hotels");
  const [deluxeCab, setDeluxeCab] = useState("Shared AC Cab / Tempo Traveller");
  const [deluxeNetCost, setDeluxeNetCost] = useState(45000);
  const [superDeluxeHotel, setSuperDeluxeHotel] = useState("4★ Premium Resorts & Hotels");
  const [superDeluxeCab, setSuperDeluxeCab] = useState("Private AC Innova / Ertiga");
  const [superDeluxeNetCost, setSuperDeluxeNetCost] = useState(65000);
  const [luxuryHotel, setLuxuryHotel] = useState("5★ Luxury Resorts & Boutique Hotels");
  const [luxuryCab, setLuxuryCab] = useState("Private Innova Crysta / Toyota Fortuner");
  const [luxuryNetCost, setLuxuryNetCost] = useState(95000);

  const handleSelectTier = (tier: "deluxe" | "superDeluxe" | "luxury") => {
    setSelectedTier(tier);
    if (tier === "deluxe") {
      setHotelTier(deluxeHotel);
      setCabType(deluxeCab);
      setNetCost(deluxeNetCost);
      setShowDeluxeOption(true);
      setShowSuperDeluxeOption(true); // Offer 1 upgrade to Super Deluxe
      setShowLuxuryOption(false);
    } else if (tier === "superDeluxe") {
      setHotelTier(superDeluxeHotel);
      setCabType(superDeluxeCab);
      setNetCost(superDeluxeNetCost);
      setShowDeluxeOption(false);
      setShowSuperDeluxeOption(true);
      setShowLuxuryOption(true); // Offer 1 upgrade to Luxury
    } else if (tier === "luxury") {
      setHotelTier(luxuryHotel);
      setCabType(luxuryCab);
      setNetCost(luxuryNetCost);
      setShowDeluxeOption(false);
      setShowSuperDeluxeOption(true); // Offer 1 downgrade to Super Deluxe
      setShowLuxuryOption(true);
    }
  };

  // Computed Totals (primary / default)
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

  // Computed Tier Totals
  const deluxeTotal = useMemo(() => Math.round(deluxeNetCost * (1 + markupPercent / 100) * (applyGst ? 1.05 : 1)), [deluxeNetCost, markupPercent, applyGst]);
  const superDeluxeTotal = useMemo(() => Math.round(superDeluxeNetCost * (1 + markupPercent / 100) * (applyGst ? 1.05 : 1)), [superDeluxeNetCost, markupPercent, applyGst]);
  const luxuryTotal = useMemo(() => Math.round(luxuryNetCost * (1 + markupPercent / 100) * (applyGst ? 1.05 : 1)), [luxuryNetCost, markupPercent, applyGst]);
  const deluxePerPerson = useMemo(() => (totalTravelers > 0 ? Math.round(deluxeTotal / totalTravelers) : deluxeTotal), [deluxeTotal, totalTravelers]);
  const superDeluxePerPerson = useMemo(() => (totalTravelers > 0 ? Math.round(superDeluxeTotal / totalTravelers) : superDeluxeTotal), [superDeluxeTotal, totalTravelers]);
  const luxuryPerPerson = useMemo(() => (totalTravelers > 0 ? Math.round(luxuryTotal / totalTravelers) : luxuryTotal), [luxuryTotal, totalTravelers]);

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

  // Load Admin Destinations from /api/v1/admin/destinations for dynamic city selector
  const fetchAdminDestinations = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/destinations");
      const data = await res.json();
      if (data.destinations && Array.isArray(data.destinations)) {
        setAdminDestinations(data.destinations);
      }
    } catch (err) {
      console.error("Failed to load admin destinations:", err);
    }
  }, []);

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
    fetchAdminDestinations();
  }, [fetchQuotes, fetchInboundLeads, fetchAdminDestinations]);

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
    setHotelTier(q.hotelTier || "4\u2605 Deluxe");
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
    setPaymentPolicies(q.paymentPolicies?.length ? [...q.paymentPolicies] : [...DEFAULT_PAYMENT_POLICIES]);
    setCancellationPolicies(q.cancellationPolicies?.length ? [...q.cancellationPolicies] : [...DEFAULT_CANCELLATION_POLICIES]);
    setImportantInfo(q.importantInfo?.length ? [...q.importantInfo] : [...DEFAULT_IMPORTANT_INFO]);
    if (q.pricingTiers) {
      setDeluxeHotel(q.pricingTiers.deluxe.hotelTier || "3★ Standard Deluxe Hotels");
      setDeluxeCab(q.pricingTiers.deluxe.cabType || "Shared AC Cab / Tempo Traveller");
      setDeluxeNetCost(q.pricingTiers.deluxe.netCost || 45000);
      setSuperDeluxeHotel(q.pricingTiers.superDeluxe.hotelTier || "4★ Premium Resorts & Hotels");
      setSuperDeluxeCab(q.pricingTiers.superDeluxe.cabType || "Private AC Innova / Ertiga");
      setSuperDeluxeNetCost(q.pricingTiers.superDeluxe.netCost || 65000);
      setLuxuryHotel(q.pricingTiers.luxury.hotelTier || "5★ Luxury Resorts & Boutique Hotels");
      setLuxuryCab(q.pricingTiers.luxury.cabType || "Private Innova Crysta / Toyota Fortuner");
      setLuxuryNetCost(q.pricingTiers.luxury.netCost || 95000);
    }
    setWelcomeMessage(q.welcomeMessage !== undefined ? q.welcomeMessage : DEFAULT_WELCOME_MESSAGE);
    setShowCancellationPolicies(q.showCancellationPolicies !== false);
    setSelectedTier(q.selectedTier || "superDeluxe");
    setShowDeluxeOption(q.tierOptions?.showDeluxe !== undefined ? q.tierOptions.showDeluxe : false);
    setShowSuperDeluxeOption(q.tierOptions?.showSuperDeluxe !== undefined ? q.tierOptions.showSuperDeluxe : true);
    setShowLuxuryOption(q.tierOptions?.showLuxury !== undefined ? q.tierOptions.showLuxury : true);
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
    setPaymentPolicies([...DEFAULT_PAYMENT_POLICIES]);
    setCancellationPolicies([...DEFAULT_CANCELLATION_POLICIES]);
    setImportantInfo([...DEFAULT_IMPORTANT_INFO]);
    setWelcomeMessage(DEFAULT_WELCOME_MESSAGE);
    setShowCancellationPolicies(true);
    setSelectedTier("superDeluxe");
    setShowDeluxeOption(false);
    setShowSuperDeluxeOption(true);
    setShowLuxuryOption(true);
    setDeluxeHotel("3★ Standard Deluxe Hotels");
    setDeluxeCab("Shared AC Cab / Tempo Traveller");
    setDeluxeNetCost(45000);
    setSuperDeluxeHotel("4★ Premium Resorts & Hotels");
    setSuperDeluxeCab("Private AC Innova / Ertiga");
    setSuperDeluxeNetCost(65000);
    setLuxuryHotel("5★ Luxury Resorts & Boutique Hotels");
    setLuxuryCab("Private Innova Crysta / Toyota Fortuner");
    setLuxuryNetCost(95000);
    setModalOpen(true);
  };

  // Add Day
  const handleAddDay = () => {
    const nextDayNum = itineraryDays.length + 1;
    const lastCity = itineraryDays[itineraryDays.length - 1]?.city || "Destination";
    const lastImg = itineraryDays[itineraryDays.length - 1]?.cityImageUrl || getDestinationImageUrl(null, lastCity);
    setItineraryDays([
      ...itineraryDays,
      {
        dayNumber: nextDayNum,
        title: `Day ${nextDayNum} Sightseeing & Scenic Excursion`,
        city: lastCity,
        cityImageUrl: lastImg,
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
      welcomeMessage,
      showCancellationPolicies,
      selectedTier,
      tierOptions: {
        showDeluxe: showDeluxeOption,
        showSuperDeluxe: showSuperDeluxeOption,
        showLuxury: showLuxuryOption,
      },
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
      paymentPolicies,
      cancellationPolicies,
      importantInfo,
      pricingTiers: {
        deluxe: { hotelTier: deluxeHotel, cabType: deluxeCab, netCost: deluxeNetCost, totalAmount: deluxeTotal, perPersonCost: deluxePerPerson },
        superDeluxe: { hotelTier: superDeluxeHotel, cabType: superDeluxeCab, netCost: superDeluxeNetCost, totalAmount: superDeluxeTotal, perPersonCost: superDeluxePerPerson },
        luxury: { hotelTier: luxuryHotel, cabType: luxuryCab, netCost: luxuryNetCost, totalAmount: luxuryTotal, perPersonCost: luxuryPerPerson },
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

  // ── Professional A4 Voucher Print (opens in new window → browser PDF) ──
  const handlePrintVoucher = (q: QuoteItem) => {
    const datesStr = formatTravelDates(q.travelDates);
    const policies = q.paymentPolicies?.length ? q.paymentPolicies : DEFAULT_PAYMENT_POLICIES;
    const tiers = q.pricingTiers;
    const baseTierKey = q.selectedTier || "superDeluxe";

    // Determine active tiers to display
    const showDeluxe = q.tierOptions ? !!q.tierOptions.showDeluxe : (baseTierKey === "deluxe");
    const showSuperDeluxe = q.tierOptions ? !!q.tierOptions.showSuperDeluxe : (baseTierKey === "superDeluxe" || !q.tierOptions);
    const showLuxury = q.tierOptions ? !!q.tierOptions.showLuxury : (baseTierKey === "luxury" || !q.tierOptions);

    const activeTierKeys: Array<"deluxe" | "superDeluxe" | "luxury"> = [];
    if (showDeluxe && tiers?.deluxe) activeTierKeys.push("deluxe");
    if (showSuperDeluxe && tiers?.superDeluxe) activeTierKeys.push("superDeluxe");
    if (showLuxury && tiers?.luxury) activeTierKeys.push("luxury");

    if (tiers && tiers[baseTierKey] && !activeTierKeys.includes(baseTierKey)) {
      activeTierKeys.push(baseTierKey);
      activeTierKeys.sort((a, b) => {
        const order = { deluxe: 1, superDeluxe: 2, luxury: 3 };
        return order[a] - order[b];
      });
    }

    const baseTotal = (tiers && tiers[baseTierKey]?.totalAmount) || q.totalAmount || 0;

    const getTierMeta = (tKey: "deluxe" | "superDeluxe" | "luxury") => {
      const isBase = tKey === baseTierKey;
      if (tKey === "deluxe") {
        const diff = (tiers?.deluxe?.totalAmount || 0) - baseTotal;
        const badge = isBase
          ? "✦ DELUXE (Quoted Base Package)"
          : diff < 0
          ? `✦ DELUXE (Budget Alternative — Save ₹${Math.abs(diff).toLocaleString("en-IN")})`
          : "✦ DELUXE";
        return {
          title: badge,
          thBg: isBase ? "#fef3c7" : "#fef9c3",
          thColor: "#92400e",
          border: isBase ? "2px solid #d97706" : "1px solid #ddd",
          highlightBg: isBase ? "#fefce8" : "#fff",
        };
      } else if (tKey === "superDeluxe") {
        const diff = (tiers?.superDeluxe?.totalAmount || 0) - baseTotal;
        const badge = isBase
          ? "★ SUPER DELUXE (Quoted Base Package)"
          : diff > 0
          ? `★ SUPER DELUXE (Upgrade Option — +₹${diff.toLocaleString("en-IN")})`
          : `★ SUPER DELUXE (Value Saver — Save ₹${Math.abs(diff).toLocaleString("en-IN")})`;
        return {
          title: badge,
          thBg: isBase ? "#eff6ff" : "#f0f9ff",
          thColor: "#1d4ed8",
          border: isBase ? "2px solid #2563eb" : "1px solid #ddd",
          highlightBg: isBase ? "#eff6ff" : "#fff",
        };
      } else {
        const diff = (tiers?.luxury?.totalAmount || 0) - baseTotal;
        const badge = isBase
          ? "♛ LUXURY (Quoted Base Package)"
          : diff > 0
          ? `♛ LUXURY (Premium Upgrade — +₹${diff.toLocaleString("en-IN")})`
          : "♛ LUXURY";
        return {
          title: badge,
          thBg: isBase ? "#faf5ff" : "#f5f3ff",
          thColor: "#7c3aed",
          border: isBase ? "2px solid #7c3aed" : "1px solid #ddd",
          highlightBg: isBase ? "#faf5ff" : "#fff",
        };
      }
    };

    const tiersHtml = (tiers && activeTierKeys.length > 0) ? `
      <div style="margin-bottom:24px;page-break-inside:avoid;">
        <h3 style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#92400e;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #d97706;">
          \u{1F48E} Package Tier Options — Quoted Tier &amp; Upgrade/Alternative Comparison
        </h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="padding:10px 12px;text-align:left;background:#f8f3e8;border:1px solid #ddd;font-size:11px;font-weight:900;text-transform:uppercase;color:#666;width:24%;">Category</th>
              ${activeTierKeys.map(k => {
                const meta = getTierMeta(k);
                return `<th style="padding:10px 12px;text-align:center;background:${meta.thBg};border:${meta.border};font-size:11px;font-weight:900;color:${meta.thColor};">${meta.title}</th>`;
              }).join("")}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:9px 12px;border:1px solid #e5e7eb;font-weight:700;background:#fafafa;">Hotel / Stay</td>
              ${activeTierKeys.map(k => {
                const meta = getTierMeta(k);
                return `<td style="padding:9px 12px;border:${meta.border};text-align:center;background:${meta.highlightBg};">${tiers[k].hotelTier}</td>`;
              }).join("")}
            </tr>
            <tr>
              <td style="padding:9px 12px;border:1px solid #e5e7eb;font-weight:700;background:#fafafa;">Transport &amp; Cab</td>
              ${activeTierKeys.map(k => {
                const meta = getTierMeta(k);
                return `<td style="padding:9px 12px;border:${meta.border};text-align:center;background:${meta.highlightBg};">${tiers[k].cabType}</td>`;
              }).join("")}
            </tr>
            <tr style="background:#fffbf0;">
              <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:800;background:#fafafa;">Total Package Price</td>
              ${activeTierKeys.map(k => {
                const meta = getTierMeta(k);
                return `<td style="padding:10px 12px;border:${meta.border};text-align:center;font-weight:900;font-size:15px;color:${meta.thColor};background:${meta.highlightBg};">
                  \u20B9${(tiers[k].totalAmount || 0).toLocaleString("en-IN")}
                </td>`;
              }).join("")}
            </tr>
            <tr>
              <td style="padding:9px 12px;border:1px solid #e5e7eb;font-weight:700;background:#fafafa;">Per Person Cost</td>
              ${activeTierKeys.map(k => {
                const meta = getTierMeta(k);
                return `<td style="padding:9px 12px;border:${meta.border};text-align:center;color:${meta.thColor};background:${meta.highlightBg};">\u20B9${(tiers[k].perPersonCost || 0).toLocaleString("en-IN")}/pax</td>`;
              }).join("")}
            </tr>
          </tbody>
        </table>
        <p style="font-size:10px;color:#9ca3af;margin-top:6px;font-style:italic;">* Prices include GST. Kindly reply to confirm your chosen tier and proceed with booking.</p>
      </div>` : "";

    const dayHtml = Array.isArray(q.itinerary) && q.itinerary.length > 0
      ? q.itinerary.map(day => {
          const dayImg = day.cityImageUrl || getDestinationImageUrl(null, day.city);
          return `
        <div style="margin-bottom:14px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;page-break-inside:avoid;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <div style="background:#f8f3e8;padding:8px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #fde68a;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#d97706;color:#fff;width:24px;height:24px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;flex-shrink:0;">${day.dayNumber}</span>
              <span style="font-weight:800;font-size:13px;color:#111;">${day.title}</span>
            </div>
            <span style="font-size:11px;color:#d97706;font-weight:800;background:#fef3c7;padding:2px 8px;border-radius:12px;">📍 ${day.city}</span>
          </div>
          <div style="padding:12px 14px;background:#fff;display:flex;gap:14px;align-items:flex-start;">
            ${dayImg ? `
            <div style="width:130px;height:95px;border-radius:6px;overflow:hidden;flex-shrink:0;background:#f3f4f6;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
              <img src="${dayImg}" alt="${day.city}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.parentElement.style.display='none'" />
            </div>` : ""}
            <div style="flex:1;min-width:0;">
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;font-size:11px;background:#f9fafb;padding:6px 10px;border-radius:6px;">
                <div><span style="color:#6b7280;font-weight:600;">🏨 Hotel: </span><strong>${day.hotelName||"4★ Hotel"}</strong>${day.roomCategory ? " • "+day.roomCategory : ""}</div>
                <div><span style="color:#6b7280;font-weight:600;">🍽️ Meal: </span><span style="background:#fef3c7;padding:1px 6px;border-radius:4px;font-weight:700;color:#92400e;">${day.mealPlan==="MAP"?"MAP (Bkft+Dinner)":day.mealPlan==="CP"?"CP (Bkft)":day.mealPlan==="AP"?"AP (All Meals)":"EP (Room Only)"}</span></div>
                <div><span style="color:#6b7280;font-weight:600;">🚗 Cab: </span><strong>${day.vehicleType||q.cabType}</strong></div>
              </div>
              ${day.activities ? `<p style="font-size:11.5px;color:#374151;line-height:1.55;margin:0;">${day.activities}</p>` : ""}
            </div>
          </div>
        </div>`;
        }).join("") : "<p style=\"color:#888;font-size:12px;\">Standard itinerary applies.</p>";

    const inclHtml = q.inclusions?.length
      ? q.inclusions.map(i => `<li style="padding:3px 0;color:#065f46;">✓ ${i}</li>`).join("")
      : `<li style="padding:3px 0;">✓ 4★ Hotel Accommodations</li><li style="padding:3px 0;">✓ Daily Breakfast & Dinner</li><li style="padding:3px 0;">✓ Private Cab & Transfers</li>`;
    const exclHtml = q.exclusions?.length
      ? q.exclusions.map(i => `<li style="padding:3px 0;color:#991b1b;">✕ ${i}</li>`).join("")
      : `<li style="padding:3px 0;">✕ Airfare / Train Tickets</li><li style="padding:3px 0;">✕ Personal Expenses</li>`;
    const polHtml = policies.map(p => `<li style="padding:4px 0;color:#374151;">• ${p}</li>`).join("");

    const cancelPolicies = Array.isArray(q.cancellationPolicies) && q.cancellationPolicies.length > 0
      ? q.cancellationPolicies
      : DEFAULT_CANCELLATION_POLICIES;
    const cancelPolHtml = cancelPolicies.map(p => `<li style="padding:3px 0;color:#374151;">• ${p}</li>`).join("");

    const infoList = Array.isArray(q.importantInfo) && q.importantInfo.length > 0
      ? q.importantInfo
      : DEFAULT_IMPORTANT_INFO;
    const infoHtml = infoList.map(inf => `<li style="padding:3px 0;color:#374151;">• ${inf}</li>`).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Be My Traveller \u2014 Tour Proposal ${q.quoteNumber}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;background:#fff;font-size:13px;line-height:1.5;}
    @page{size:A4;margin:16mm 14mm;}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
    .wrap{max-width:750px;margin:0 auto;padding:20px;}
    h3{font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#92400e;margin-bottom:10px;}
    ul{list-style:none;padding:0;}
    table{width:100%;border-collapse:collapse;}
  </style>
</head>
<body>
<div class="wrap">
  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#1e3a5f 0%,#d97706 100%);color:#fff;padding:22px 26px;border-radius:10px 10px 0 0;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <p style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:2px;opacity:.8;">BE MY TRAVELLER HOLIDAYS</p>
        <h1 style="font-size:20px;font-weight:900;margin-top:3px;">Handcrafted Holiday Itinerary Proposal</h1>
        <p style="font-size:11px;opacity:.85;margin-top:3px;">Govt. Approved & Verified Travel Network \u2022 24/7 Concierge: +91 8091638090</p>
      </div>
      <div style="text-align:right;">
        <span style="background:rgba(255,255,255,.9);color:#166534;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:800;text-transform:uppercase;">\u2713 Verified Itinerary</span>
        <p style="margin-top:8px;font-size:11px;font-family:monospace;opacity:.9;">Ref: ${q.quoteNumber}</p>
        <p style="font-size:10px;opacity:.8;">Date: ${new Date(q.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</p>
      </div>
    </div>
  </div>
  <div style="height:6px;background:linear-gradient(90deg,#d97706,#f59e0b);margin-bottom:22px;border-radius:0 0 4px 4px;"></div>

  <!-- CLIENT SUMMARY -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px;padding:14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:22px;font-size:12px;">
    <div><p style="font-size:9px;font-weight:800;text-transform:uppercase;color:#6b7280;margin-bottom:3px;">Traveler Name</p><p style="font-weight:700;">\u{1F464} ${q.customerName}</p><p style="font-size:11px;color:#6b7280;margin-top:2px;">\u{1F4F1} ${q.customerPhone}</p></div>
    <div><p style="font-size:9px;font-weight:800;text-transform:uppercase;color:#6b7280;margin-bottom:3px;">Destination</p><p style="font-weight:700;color:#d97706;">\u{1F4CD} ${q.destination}</p></div>
    <div><p style="font-size:9px;font-weight:800;text-transform:uppercase;color:#6b7280;margin-bottom:3px;">Travel Dates & Pax</p><p style="font-weight:700;">\u{1F4C5} ${datesStr}</p><p style="font-size:11px;color:#6b7280;margin-top:2px;">\u{1F465} ${q.paxCount}</p></div>
    <div><p style="font-size:9px;font-weight:800;text-transform:uppercase;color:#6b7280;margin-bottom:3px;">Package Price</p><p style="font-size:18px;font-weight:900;color:#d97706;">\u20B9${(q.totalAmount||0).toLocaleString("en-IN")}</p><p style="font-size:10px;color:#059669;font-weight:700;">All-Inclusive + GST</p></div>
  </div>

  <!-- WELCOME / GREETINGS MESSAGE -->
  ${(q.welcomeMessage || DEFAULT_WELCOME_MESSAGE) ? `
  <div style="padding:14px 18px;background:#fefce8;border:1px solid #fde047;border-left:5px solid #d97706;border-radius:6px;margin-bottom:22px;page-break-inside:avoid;">
    <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#92400e;margin-bottom:4px;">
      ✨ Greetings &amp; Holiday Welcome Note
    </p>
    <p style="font-size:12px;color:#451a03;line-height:1.6;margin:0;font-style:italic;">
      "${q.welcomeMessage || DEFAULT_WELCOME_MESSAGE}"
    </p>
  </div>` : ""}

  <!-- DAY-BY-DAY -->
  <div style="margin-bottom:22px;">
    <h3 style="border-bottom:2px solid #d97706;padding-bottom:6px;margin-bottom:12px;">\u{1F5D3}\uFE0F Day-by-Day Tour Program &amp; Sightseeing</h3>
    ${dayHtml}
  </div>

  <!-- PRICING TIERS / UPGRADE & DOWNGRADE (Moved Below Day-by-Day Itinerary) -->
  ${tiersHtml}

  <!-- INCLUSIONS & EXCLUSIONS -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:22px;">
    <div style="padding:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <h3 style="color:#166534;border-bottom:1px solid #86efac;padding-bottom:5px;margin-bottom:8px;">\u2713 100% Guaranteed Inclusions</h3>
      <ul style="font-size:12px;">${inclHtml}</ul>
    </div>
    <div style="padding:14px;background:#fff1f2;border:1px solid #fecdd3;border-radius:8px;">
      <h3 style="color:#991b1b;border-bottom:1px solid #fca5a5;padding-bottom:5px;margin-bottom:8px;">\u2715 Package Exclusions</h3>
      <ul style="font-size:12px;">${exclHtml}</ul>
    </div>
  </div>

  <!-- PAYMENT POLICIES -->
  <div style="padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:22px;page-break-inside:avoid;">
    <h3 style="color:#92400e;border-bottom:1px solid #fcd34d;padding-bottom:5px;margin-bottom:8px;">📋 Payment &amp; Booking Policies</h3>
    <ul style="font-size:12px;">${polHtml}</ul>
  </div>

  <!-- CANCELLATION & REFUND POLICIES (Show/Hide) -->
  ${q.showCancellationPolicies !== false ? `
  <div style="padding:14px;background:#fff5f5;border:1px solid #fecdd3;border-radius:8px;margin-bottom:22px;page-break-inside:avoid;">
    <h3 style="color:#991b1b;border-bottom:1px solid #fca5a5;padding-bottom:5px;margin-bottom:8px;">🛑 Cancellation &amp; Refund Policies</h3>
    <table style="width:100%;margin-bottom:10px;font-size:11px;border-collapse:collapse;">
      <thead>
        <tr style="background:#fee2e2;color:#991b1b;text-align:left;">
          <th style="padding:6px 10px;border:1px solid #fca5a5;">Cancellation Timeline Prior to Departure</th>
          <th style="padding:6px 10px;border:1px solid #fca5a5;text-align:right;">Cancellation Charges</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding:5px 10px;border:1px solid #fed7aa;background:#fff;">30 days or more prior to departure</td><td style="padding:5px 10px;border:1px solid #fed7aa;text-align:right;font-weight:700;color:#92400e;">10% Administrative Fee</td></tr>
        <tr><td style="padding:5px 10px;border:1px solid #fed7aa;background:#fff;">15 to 29 days prior to departure</td><td style="padding:5px 10px;border:1px solid #fed7aa;text-align:right;font-weight:700;color:#c2410c;">25% of Package Cost</td></tr>
        <tr><td style="padding:5px 10px;border:1px solid #fed7aa;background:#fff;">7 to 14 days prior to departure</td><td style="padding:5px 10px;border:1px solid #fed7aa;text-align:right;font-weight:700;color:#b91c1c;">50% of Package Cost</td></tr>
        <tr><td style="padding:5px 10px;border:1px solid #fed7aa;background:#fff;">Less than 7 days prior or No Show</td><td style="padding:5px 10px;border:1px solid #fed7aa;text-align:right;font-weight:800;color:#7f1d1d;">100% Non-Refundable</td></tr>
      </tbody>
    </table>
    <ul style="font-size:11.5px;line-height:1.6;color:#374151;">${cancelPolHtml}</ul>
  </div>` : ""}

  <!-- IMPORTANT TRAVEL GUIDELINES -->
  <div style="padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;margin-bottom:22px;page-break-inside:avoid;">
    <h3 style="color:#0369a1;border-bottom:1px solid #7dd3fc;padding-bottom:5px;margin-bottom:8px;">ℹ️ Important Travel Guidelines & Information</h3>
    <ul style="font-size:11.5px;line-height:1.6;color:#374151;">${infoHtml}</ul>
  </div>

  <!-- ASSIGNED SPECIALIST -->
  <div style="padding:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:22px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <p style="font-size:9px;font-weight:800;text-transform:uppercase;color:#6b7280;margin-bottom:3px;">Your Dedicated Trip Specialist</p>
      <p style="font-weight:800;font-size:14px;">\u{1F464} ${q.assignedSalesPerson?.name||"Senior Holiday Specialist"}</p>
      <p style="font-size:12px;color:#6b7280;margin-top:3px;">\u{1F4DE} ${q.assignedSalesPerson?.phone||"+91 8091638090"} \u00A0\u2022\u00A0 \u2709\uFE0F ${q.assignedSalesPerson?.email||"bookings@bemytraveller.com"}</p>
    </div>
    <div style="text-align:right;">
      <p style="font-weight:800;color:#d97706;font-size:13px;">www.bemytraveller.com</p>
      <p style="font-size:11px;color:#6b7280;margin-top:2px;">+91 8091638090</p>
    </div>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;font-size:10px;color:#9ca3af;padding-top:14px;border-top:2px solid #e5e7eb;">
    Be My Traveller \u2022 Main Office: Manali & Delhi NCR \u2022 +91 8091638090 \u2022 info@bemytraveller.com \u2022 www.bemytraveller.com<br/>
    <em style="font-size:9px;">System-generated proposal. Prices subject to availability at time of booking confirmation.</em>
  </div>
</div>
</body>
</html>`;

    const pw = window.open("", "_blank", "width=1050,height=750");
    if (!pw) {
      alert("Please allow pop-ups in your browser to use Print / Save PDF.");
      return;
    }
    pw.document.write(html);
    pw.document.close();
    pw.onload = () => { pw.focus(); pw.print(); };
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
                  onClick={() => handlePrintVoucher(previewQuote)}
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

              {/* Welcome / Greetings Note */}
              {(previewQuote.welcomeMessage || DEFAULT_WELCOME_MESSAGE) && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">✨ Holiday Welcome Note &amp; Greetings</span>
                  </div>
                  <p className="text-amber-100/90 leading-relaxed italic">
                    &ldquo;{previewQuote.welcomeMessage || DEFAULT_WELCOME_MESSAGE}&rdquo;
                  </p>
                </div>
              )}

              {/* Day-by-Day Timeline */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>🗓️</span> Day-by-Day Tour Program &amp; Sightseeing
                </h4>
                <div className="space-y-3">
                  {Array.isArray(previewQuote.itinerary) && previewQuote.itinerary.length > 0 ? (
                    previewQuote.itinerary.map((day) => {
                      const dayImg = day.cityImageUrl || getDestinationImageUrl(null, day.city);
                      return (
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
                          <span className="text-xs text-amber-400 font-semibold">📍 {day.city}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 items-start">
                          {dayImg && (
                            <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-700 bg-slate-800 shadow">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={dayImg}
                                alt={day.city}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 py-1 bg-slate-800/40 px-2.5 rounded-lg border border-slate-700/50">
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
                              <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{day.activities}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 text-xs text-slate-400 text-center">
                      Standard sequential itinerary applies for this proposal.
                    </div>
                  )}
                </div>
              </div>

              {/* ── Package Tier Options (Quoted Base Tier + Upgrade/Downgrade Alternatives) (Moved Below Day-by-Day) ── */}
              {previewQuote.pricingTiers && (() => {
                const baseTierKey = previewQuote.selectedTier || "superDeluxe";
                const showDeluxe = previewQuote.tierOptions ? !!previewQuote.tierOptions.showDeluxe : baseTierKey === "deluxe";
                const showSuperDeluxe = previewQuote.tierOptions ? !!previewQuote.tierOptions.showSuperDeluxe : (baseTierKey === "superDeluxe" || !previewQuote.tierOptions);
                const showLuxury = previewQuote.tierOptions ? !!previewQuote.tierOptions.showLuxury : (baseTierKey === "luxury" || !previewQuote.tierOptions);

                const activeKeys: Array<"deluxe" | "superDeluxe" | "luxury"> = [];
                if (showDeluxe && previewQuote.pricingTiers.deluxe) activeKeys.push("deluxe");
                if (showSuperDeluxe && previewQuote.pricingTiers.superDeluxe) activeKeys.push("superDeluxe");
                if (showLuxury && previewQuote.pricingTiers.luxury) activeKeys.push("luxury");

                if (previewQuote.pricingTiers[baseTierKey] && !activeKeys.includes(baseTierKey)) {
                  activeKeys.push(baseTierKey);
                  activeKeys.sort((a, b) => {
                    const order = { deluxe: 1, superDeluxe: 2, luxury: 3 };
                    return order[a] - order[b];
                  });
                }

                const baseTotal = (previewQuote.pricingTiers[baseTierKey]?.totalAmount) || previewQuote.totalAmount || 0;

                return (
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>💎</span> Package Tier Options — Quoted Tier &amp; Upgrade/Alternative Comparison
                    </h4>
                    <div className={`grid grid-cols-1 ${activeKeys.length === 2 ? "sm:grid-cols-2" : activeKeys.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-1"} gap-3 text-xs`}>
                      {activeKeys.map((k) => {
                        const tier = previewQuote.pricingTiers![k];
                        const isBase = k === baseTierKey;
                        const diff = (tier.totalAmount || 0) - baseTotal;

                        let tierName = "Deluxe";
                        let borderClass = "border-amber-700/40 bg-amber-900/20";
                        let textAccent = "text-amber-300";
                        let badgeBg = "bg-amber-500 text-slate-950";

                        if (k === "deluxe") {
                          tierName = "Deluxe";
                          borderClass = isBase ? "border-2 border-amber-500 bg-amber-500/10" : "border border-amber-700/40 bg-amber-900/20";
                          textAccent = "text-amber-300";
                          badgeBg = "bg-amber-500 text-slate-950";
                        } else if (k === "superDeluxe") {
                          tierName = "Super Deluxe";
                          borderClass = isBase ? "border-2 border-sky-500 bg-sky-500/15" : "border border-sky-500/40 bg-sky-500/10";
                          textAccent = "text-sky-300";
                          badgeBg = "bg-sky-500 text-white";
                        } else {
                          tierName = "Luxury";
                          borderClass = isBase ? "border-2 border-purple-500 bg-purple-500/15" : "border border-purple-500/40 bg-purple-500/10";
                          textAccent = "text-purple-300";
                          badgeBg = "bg-purple-500 text-white";
                        }

                        return (
                          <div key={k} className={`p-4 rounded-xl ${borderClass} space-y-2 relative`}>
                            {isBase ? (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className={`px-2.5 py-0.5 ${badgeBg} text-[9px] font-black uppercase rounded-full whitespace-nowrap shadow-sm`}>
                                  ✓ Quoted Base Package
                                </span>
                              </div>
                            ) : diff > 0 ? (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase rounded-full whitespace-nowrap shadow-sm">
                                  ⬆ Upgrade Option (+{formatINR(diff)})
                                </span>
                              </div>
                            ) : (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-black uppercase rounded-full whitespace-nowrap shadow-sm">
                                  ⬇ Value Saver (Save {formatINR(Math.abs(diff))})
                                </span>
                              </div>
                            )}

                            <div className="text-center mt-1">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${textAccent} block`}>
                                {k === "deluxe" ? "✦ Deluxe" : k === "superDeluxe" ? "★ Super Deluxe" : "♛ Luxury"}
                              </span>
                              <p className={`text-xl font-black ${textAccent} mt-1`}>{formatINR(tier.totalAmount || 0)}</p>
                              <p className="text-[10px] text-slate-400">{formatINR(tier.perPersonCost || 0)}/pax</p>
                            </div>
                            <div className="border-t border-slate-700/50 pt-2 space-y-1">
                              <p className="text-slate-200 leading-snug">🏨 {tier.hotelTier}</p>
                              <p className="text-slate-300 leading-snug">🚗 {tier.cabType}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-500 italic">* All prices inclusive of 5% GST. Contact your specialist to confirm your preferred tier and proceed with booking.</p>
                  </div>
                );
              })()}

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

              {/* ── Payment & Booking Policies ── */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/25 space-y-2">
                <h5 className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span>📋</span> Payment &amp; Booking Policies
                </h5>
                <ul className="space-y-1.5 text-slate-300 text-xs">
                  {(previewQuote.paymentPolicies?.length ? previewQuote.paymentPolicies : DEFAULT_PAYMENT_POLICIES).map((policy, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>{policy}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Cancellation & Refund Policies (Show/Hide) ── */}
              {previewQuote.showCancellationPolicies !== false && (
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/25 space-y-2.5">
                  <h5 className="font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <span>🛑</span> Cancellation &amp; Refund Policies
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pb-1 border-b border-rose-500/20 text-slate-300">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-rose-500/20 text-center">
                      <span className="block text-slate-400">30+ Days Prior</span>
                      <strong className="text-amber-400 font-black">10% Fee</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-rose-500/20 text-center">
                      <span className="block text-slate-400">15–29 Days</span>
                      <strong className="text-amber-500 font-black">25% Charge</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-rose-500/20 text-center">
                      <span className="block text-slate-400">7–14 Days</span>
                      <strong className="text-rose-400 font-black">50% Charge</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-rose-500/20 text-center">
                      <span className="block text-slate-400">&lt; 7 Days / No-Show</span>
                      <strong className="text-rose-500 font-black">100% Non-Refundable</strong>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 text-xs">
                    {(previewQuote.cancellationPolicies?.length ? previewQuote.cancellationPolicies : DEFAULT_CANCELLATION_POLICIES).map((policy, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold shrink-0">•</span>
                        <span>{policy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Important Travel Guidelines ── */}
              <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/25 space-y-2">
                <h5 className="font-bold text-sky-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span>ℹ️</span> Important Travel Guidelines &amp; Information
                </h5>
                <ul className="space-y-1.5 text-slate-300 text-xs">
                  {(previewQuote.importantInfo?.length ? previewQuote.importantInfo : DEFAULT_IMPORTANT_INFO).map((info, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-sky-400 font-bold shrink-0">•</span>
                      <span>{info}</span>
                    </li>
                  ))}
                </ul>
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

              {/* Welcome / Greetings Note Editor */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>✨</span> Welcome / Greetings Note (Appears on Voucher &amp; PDF below Client Summary)
                  </span>
                  <button
                    type="button"
                    onClick={() => setWelcomeMessage(DEFAULT_WELCOME_MESSAGE)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Reset Default Greetings
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Enter greeting / introductory message for the client..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
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
                        <CityPickerInput
                          value={day.city}
                          imageUrl={day.cityImageUrl}
                          destinations={adminDestinations}
                          onSelect={(selectedName, selectedImg) => {
                            const updated = [...itineraryDays];
                            updated[idx] = {
                              ...updated[idx],
                              city: selectedName,
                              cityImageUrl: selectedImg || updated[idx].cityImageUrl,
                            };
                            setItineraryDays(updated);
                          }}
                          onClearImage={() => {
                            const updated = [...itineraryDays];
                            updated[idx] = {
                              ...updated[idx],
                              cityImageUrl: "",
                            };
                            setItineraryDays(updated);
                          }}
                          onCustomImage={(customUrl) => {
                            const updated = [...itineraryDays];
                            updated[idx] = {
                              ...updated[idx],
                              cityImageUrl: customUrl,
                            };
                            setItineraryDays(updated);
                          }}
                        />
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

              {/* ── Package Type Selection & Upgrade/Downgrade Controls (Moved Below Day-Wise Itinerary) ── */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-amber-500/40 space-y-4 shadow-xl">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                        PACKAGE TIER STRATEGY &amp; CLIENT UPGRADE CONTROLS
                      </span>
                      <h4 className="text-sm font-black text-white flex items-center gap-2 mt-0.5">
                        <span>💎</span> 1. Select Client&apos;s Chosen Base Package Type
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Syncs base package hotel, transport &amp; pricing
                    </span>
                  </div>

                  {/* Base Package Pill Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => handleSelectTier("deluxe")}
                      className={`p-3.5 rounded-xl text-left border-2 transition cursor-pointer ${
                        selectedTier === "deluxe"
                          ? "border-amber-500 bg-amber-500/15 shadow-md"
                          : "border-slate-700 bg-slate-800/40 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-amber-400">✦ Deluxe</span>
                        {selectedTier === "deluxe" && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px]">
                            ACTIVE BASE
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-white mt-1">{formatINR(deluxeTotal)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{deluxeHotel}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTier("superDeluxe")}
                      className={`p-3.5 rounded-xl text-left border-2 transition cursor-pointer ${
                        selectedTier === "superDeluxe"
                          ? "border-sky-500 bg-sky-500/15 shadow-md"
                          : "border-slate-700 bg-slate-800/40 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-sky-400">★ Super Deluxe</span>
                        {selectedTier === "superDeluxe" && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-500 text-white font-black text-[9px]">
                            ACTIVE BASE
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-white mt-1">{formatINR(superDeluxeTotal)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{superDeluxeHotel}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTier("luxury")}
                      className={`p-3.5 rounded-xl text-left border-2 transition cursor-pointer ${
                        selectedTier === "luxury"
                          ? "border-purple-500 bg-purple-500/15 shadow-md"
                          : "border-slate-700 bg-slate-800/40 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-purple-400">♛ Luxury</span>
                        {selectedTier === "luxury" && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white font-black text-[9px]">
                            ACTIVE BASE
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-white mt-1">{formatINR(luxuryTotal)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{luxuryHotel}</p>
                    </button>
                  </div>
                </div>

                {/* 2. Selective Alternative Options to Show to Client */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h5 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎯</span> 2. Choose Alternative Option to Show on Voucher (Upgrade or Downgrade)
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      Show smart alternative(s) alongside the quoted package
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* If selectedTier is Super Deluxe */}
                    {selectedTier === "superDeluxe" && (
                      <>
                        <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                          showDeluxeOption ? "border-amber-500/50 bg-amber-500/10" : "border-slate-800 bg-slate-900/60 opacity-60"
                        }`}>
                          <input
                            type="checkbox"
                            checked={showDeluxeOption}
                            onChange={(e) => setShowDeluxeOption(e.target.checked)}
                            className="mt-0.5 rounded accent-amber-500 w-4 h-4 cursor-pointer"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-amber-300 block">Offer Downgrade: Deluxe Tier</span>
                            <span className="text-slate-400 block text-[11px]">
                              Value saver alternative (Save {formatINR(Math.max(0, superDeluxeTotal - deluxeTotal))})
                            </span>
                          </div>
                        </label>

                        <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                          showLuxuryOption ? "border-purple-500/50 bg-purple-500/10" : "border-slate-800 bg-slate-900/60 opacity-60"
                        }`}>
                          <input
                            type="checkbox"
                            checked={showLuxuryOption}
                            onChange={(e) => setShowLuxuryOption(e.target.checked)}
                            className="mt-0.5 rounded accent-purple-500 w-4 h-4 cursor-pointer"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-purple-300 block">Offer Upgrade: Luxury Tier (Recommended)</span>
                            <span className="text-slate-400 block text-[11px]">
                              Premium upgrade (+{formatINR(Math.max(0, luxuryTotal - superDeluxeTotal))} total)
                            </span>
                          </div>
                        </label>
                      </>
                    )}

                    {/* If selectedTier is Deluxe */}
                    {selectedTier === "deluxe" && (
                      <>
                        <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                          showSuperDeluxeOption ? "border-sky-500/50 bg-sky-500/10" : "border-slate-800 bg-slate-900/60 opacity-60"
                        }`}>
                          <input
                            type="checkbox"
                            checked={showSuperDeluxeOption}
                            onChange={(e) => setShowSuperDeluxeOption(e.target.checked)}
                            className="mt-0.5 rounded accent-sky-500 w-4 h-4 cursor-pointer"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-sky-300 block">Offer Upgrade: Super Deluxe (Recommended)</span>
                            <span className="text-slate-400 block text-[11px]">
                              Popular 4★ upgrade (+{formatINR(Math.max(0, superDeluxeTotal - deluxeTotal))} total)
                            </span>
                          </div>
                        </label>

                        <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                          showLuxuryOption ? "border-purple-500/50 bg-purple-500/10" : "border-slate-800 bg-slate-900/60 opacity-60"
                        }`}>
                          <input
                            type="checkbox"
                            checked={showLuxuryOption}
                            onChange={(e) => setShowLuxuryOption(e.target.checked)}
                            className="mt-0.5 rounded accent-purple-500 w-4 h-4 cursor-pointer"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-purple-300 block">Offer High-End Upgrade: Luxury Tier</span>
                            <span className="text-slate-400 block text-[11px]">
                              5★ VIP upgrade (+{formatINR(Math.max(0, luxuryTotal - deluxeTotal))} total)
                            </span>
                          </div>
                        </label>
                      </>
                    )}

                    {/* If selectedTier is Luxury */}
                    {selectedTier === "luxury" && (
                      <>
                        <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                          showSuperDeluxeOption ? "border-sky-500/50 bg-sky-500/10" : "border-slate-800 bg-slate-900/60 opacity-60"
                        }`}>
                          <input
                            type="checkbox"
                            checked={showSuperDeluxeOption}
                            onChange={(e) => setShowSuperDeluxeOption(e.target.checked)}
                            className="mt-0.5 rounded accent-sky-500 w-4 h-4 cursor-pointer"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-sky-300 block">Offer Downgrade: Super Deluxe (Recommended)</span>
                            <span className="text-slate-400 block text-[11px]">
                              Value alternative (Save {formatINR(Math.max(0, luxuryTotal - superDeluxeTotal))})
                            </span>
                          </div>
                        </label>

                        <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                          showDeluxeOption ? "border-amber-500/50 bg-amber-500/10" : "border-slate-800 bg-slate-900/60 opacity-60"
                        }`}>
                          <input
                            type="checkbox"
                            checked={showDeluxeOption}
                            onChange={(e) => setShowDeluxeOption(e.target.checked)}
                            className="mt-0.5 rounded accent-amber-500 w-4 h-4 cursor-pointer"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-amber-300 block">Offer Economy Downgrade: Deluxe Tier</span>
                            <span className="text-slate-400 block text-[11px]">
                              Budget saver (Save {formatINR(Math.max(0, luxuryTotal - deluxeTotal))})
                            </span>
                          </div>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Detailed Specification & Pricing Inputs for all 3 Tiers */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    ⚙️ 3. Hotel &amp; Transport Specifications for Each Tier
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {/* Deluxe Tier Card */}
                    <div className={`p-3.5 rounded-xl border space-y-2 relative transition ${
                      selectedTier === "deluxe"
                        ? "bg-amber-900/30 border-2 border-amber-500"
                        : showDeluxeOption
                        ? "bg-slate-800/60 border-amber-500/30"
                        : "bg-slate-900/40 border-slate-800 opacity-60"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                          ✦ Deluxe Tier
                        </span>
                        {selectedTier === "deluxe" ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                            BASE
                          </span>
                        ) : showDeluxeOption ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            ON VOUCHER
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500">HIDDEN</span>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Hotel / Accommodation</label>
                        <input
                          type="text"
                          value={deluxeHotel}
                          onChange={(e) => setDeluxeHotel(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Transport / Cab</label>
                        <input
                          type="text"
                          value={deluxeCab}
                          onChange={(e) => setDeluxeCab(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Net Vendor Cost (₹)</label>
                        <input
                          type="number"
                          value={deluxeNetCost}
                          onChange={(e) => setDeluxeNetCost(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white"
                        />
                      </div>
                      <div className="pt-1 border-t border-slate-700/40 flex items-baseline justify-between">
                        <span className="text-amber-400 font-black text-sm">{formatINR(deluxeTotal)}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{formatINR(deluxePerPerson)}/pax</span>
                      </div>
                    </div>

                    {/* Super Deluxe Tier Card */}
                    <div className={`p-3.5 rounded-xl border space-y-2 relative transition ${
                      selectedTier === "superDeluxe"
                        ? "bg-sky-500/15 border-2 border-sky-500"
                        : showSuperDeluxeOption
                        ? "bg-slate-800/60 border-sky-500/30"
                        : "bg-slate-900/40 border-slate-800 opacity-60"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider block">
                          ★ Super Deluxe
                        </span>
                        {selectedTier === "superDeluxe" ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500 text-white font-black">
                            BASE
                          </span>
                        ) : showSuperDeluxeOption ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                            ON VOUCHER
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500">HIDDEN</span>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Hotel / Accommodation</label>
                        <input
                          type="text"
                          value={superDeluxeHotel}
                          onChange={(e) => setSuperDeluxeHotel(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Transport / Cab</label>
                        <input
                          type="text"
                          value={superDeluxeCab}
                          onChange={(e) => setSuperDeluxeCab(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Net Vendor Cost (₹)</label>
                        <input
                          type="number"
                          value={superDeluxeNetCost}
                          onChange={(e) => setSuperDeluxeNetCost(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white"
                        />
                      </div>
                      <div className="pt-1 border-t border-slate-700/40 flex items-baseline justify-between">
                        <span className="text-sky-400 font-black text-sm">{formatINR(superDeluxeTotal)}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{formatINR(superDeluxePerPerson)}/pax</span>
                      </div>
                    </div>

                    {/* Luxury Tier Card */}
                    <div className={`p-3.5 rounded-xl border space-y-2 relative transition ${
                      selectedTier === "luxury"
                        ? "bg-purple-500/15 border-2 border-purple-500"
                        : showLuxuryOption
                        ? "bg-slate-800/60 border-purple-500/30"
                        : "bg-slate-900/40 border-slate-800 opacity-60"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">
                          ♛ Luxury Tier
                        </span>
                        {selectedTier === "luxury" ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500 text-white font-black">
                            BASE
                          </span>
                        ) : showLuxuryOption ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                            ON VOUCHER
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500">HIDDEN</span>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Hotel / Accommodation</label>
                        <input
                          type="text"
                          value={luxuryHotel}
                          onChange={(e) => setLuxuryHotel(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Transport / Cab</label>
                        <input
                          type="text"
                          value={luxuryCab}
                          onChange={(e) => setLuxuryCab(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Net Vendor Cost (₹)</label>
                        <input
                          type="number"
                          value={luxuryNetCost}
                          onChange={(e) => setLuxuryNetCost(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white"
                        />
                      </div>
                      <div className="pt-1 border-t border-slate-700/40 flex items-baseline justify-between">
                        <span className="text-purple-400 font-black text-sm">{formatINR(luxuryTotal)}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{formatINR(luxuryPerPerson)}/pax</span>
                      </div>
                    </div>
                  </div>
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

              {/* ── Payment Policies Builder ── */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">📋 Payment & Booking Policies</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add or edit a payment policy clause..."
                    value={newPolicy}
                    onChange={(e) => setNewPolicy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPolicy.trim()) {
                        e.preventDefault();
                        setPaymentPolicies([...paymentPolicies, newPolicy.trim()]);
                        setNewPolicy("");
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => { if (newPolicy.trim()) { setPaymentPolicies([...paymentPolicies, newPolicy.trim()]); setNewPolicy(""); } }}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs cursor-pointer"
                  >+</button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pt-1">
                  {paymentPolicies.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-300 bg-slate-800 px-2.5 py-1.5 rounded-lg">
                      <span>• {p}</span>
                      <button type="button" onClick={() => setPaymentPolicies(paymentPolicies.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400 text-[10px] cursor-pointer ml-2 shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Cancellation & Refund Policies Builder ── */}
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
                      🛑 Cancellation &amp; Refund Policies
                    </span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-rose-300 cursor-pointer ml-3 bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-500/30">
                      <input
                        type="checkbox"
                        checked={showCancellationPolicies}
                        onChange={(e) => setShowCancellationPolicies(e.target.checked)}
                        className="rounded accent-rose-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Show on PDF Voucher</span>
                    </label>
                    {!showCancellationPolicies && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px] font-black uppercase">
                        Hidden from PDF
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCancellationPolicies([...DEFAULT_CANCELLATION_POLICIES])}
                    className="text-[10px] text-rose-400/80 hover:text-rose-300 underline cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add cancellation clause (e.g. 15–29 days prior: 25% charge)..."
                    value={newCancelPolicy}
                    onChange={(e) => setNewCancelPolicy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newCancelPolicy.trim()) {
                        e.preventDefault();
                        setCancellationPolicies([...cancellationPolicies, newCancelPolicy.trim()]);
                        setNewCancelPolicy("");
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCancelPolicy.trim()) {
                        setCancellationPolicies([...cancellationPolicies, newCancelPolicy.trim()]);
                        setNewCancelPolicy("");
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer hover:bg-rose-500"
                  >+</button>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
                  {cancellationPolicies.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-300 bg-slate-800 px-2.5 py-1.5 rounded-lg">
                      <span>• {p}</span>
                      <button type="button" onClick={() => setCancellationPolicies(cancellationPolicies.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400 text-[10px] cursor-pointer ml-2 shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Important Travel Guidelines & Information Builder ── */}
              <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider block">ℹ️ Important Travel Guidelines &amp; Information</span>
                  <button
                    type="button"
                    onClick={() => setImportantInfo([...DEFAULT_IMPORTANT_INFO])}
                    className="text-[10px] text-sky-400/80 hover:text-sky-300 underline cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add travel note (e.g. Valid Govt ID mandatory at check-in)..."
                    value={newInfoNote}
                    onChange={(e) => setNewInfoNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newInfoNote.trim()) {
                        e.preventDefault();
                        setImportantInfo([...importantInfo, newInfoNote.trim()]);
                        setNewInfoNote("");
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newInfoNote.trim()) {
                        setImportantInfo([...importantInfo, newInfoNote.trim()]);
                        setNewInfoNote("");
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs cursor-pointer hover:bg-sky-500"
                  >+</button>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
                  {importantInfo.map((info, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-300 bg-slate-800 px-2.5 py-1.5 rounded-lg">
                      <span>• {info}</span>
                      <button type="button" onClick={() => setImportantInfo(importantInfo.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400 text-[10px] cursor-pointer ml-2 shrink-0">✕</button>
                    </div>
                  ))}
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
