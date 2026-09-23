import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";

const SEED_TRANSFERS = [
  {
    name: "Chandigarh Airport / Rly Station → Shimla Queen of Hills",
    category: "AIRPORT_RAILWAY",
    type: "PRIVATE_CAR",
    vehicle: "Swift Dzire / Toyota Etios (AC Sedan)",
    vehicleModel: "Swift Dzire / Etios",
    vehicleCategory: "SEDAN",
    fromCity: "Chandigarh",
    toCity: "Shimla",
    fromLocation: "Chandigarh Airport (IXC) / Railway Station",
    toLocation: "Any Shimla Hotel / Mall Road Drop Point",
    fromCountry: "India",
    toCountry: "India",
    fromState: "Chandigarh / Punjab",
    toState: "Himachal Pradesh",
    distanceKm: 115,
    duration: "3.5 Hours",
    maxSeats: 4,
    luggageCapacity: "2 Large + 2 Small Bags",
    pricingModel: "PER_VEHICLE",
    costPerUnit: 3200,
    originalPrice: 4200,
    discountPercent: 24,
    discountBadge: "Instant 24% OFF · Free Tolls Included",
    currency: "INR",
    amenities: ["Air Conditioning", "Bottle Water", "Music System", "Sanitized Cab", "Luggage Carrier"],
    inclusions: [
      "Dedicated AC Sedan with experienced mountain chauffeur",
      "All Highway Tolls, Green Tax & Himachal State Border Permits",
      "Fuel, Parking & Driver Allowance included",
      "Complimentary 60 mins flight/train delay waiting time",
    ],
    exclusions: ["Sightseeing deviations outside Shimla city route", "Night driving surcharge (11 PM - 5 AM, ₹300)"],
    pickupGuidelines: "Driver will meet you at Airport Arrival Gate with your name placard. 24/7 BMT helpline available.",
    coverImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
    isPopular: true,
    isSnowChainEquipped: false,
    tollPermitIncluded: true,
    supplierName: "Himalayan Prime Chauffeurs",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Delhi / Chandigarh → Manali Mountain Gateway",
    category: "INTERCITY",
    type: "SUV_CAB",
    vehicle: "Toyota Innova Crysta (6+1 Seater Captain Seats)",
    vehicleModel: "Innova Crysta Luxury",
    vehicleCategory: "SUV",
    fromCity: "Delhi / Chandigarh",
    toCity: "Manali",
    fromLocation: "Delhi IGI Airport / Chandigarh City",
    toLocation: "Manali / Solang Valley Resorts",
    fromCountry: "India",
    toCountry: "India",
    fromState: "Delhi / Punjab",
    toState: "Himachal Pradesh",
    distanceKm: 310,
    duration: "8.5 Hours",
    maxSeats: 6,
    luggageCapacity: "4 Large Suitcases + 3 Handbags",
    pricingModel: "PER_VEHICLE",
    costPerUnit: 6800,
    originalPrice: 8500,
    discountPercent: 20,
    discountBadge: "Best Seller · Luxury Mountain Ride",
    currency: "INR",
    amenities: ["Dual AC", "Reclining Captain Seats", "Mobile Charging Ports", "First Aid Kit", "Roof Carrier"],
    inclusions: [
      "Toyota Innova Crysta with expert hill driver",
      "All Inter-state Tolls, Green Tax, Driver Bhatta",
      "Pandoh Dam & Kullu Valley scenic stops included",
      "Clean sanitized vehicle with complimentary mineral water",
    ],
    exclusions: ["Rohtang Pass Snow Permit (booked separately in package)"],
    pickupGuidelines: "Pickup from any Delhi/Chandigarh address or Airport Terminal.",
    coverImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    isPopular: true,
    isSnowChainEquipped: true,
    tollPermitIncluded: true,
    supplierName: "BMT Royal Himalayan Fleet",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Srinagar Airport (SXR) → Gulmarg Snow Resort (Snow-Chain SUV)",
    category: "HILL_STATION",
    type: "SUV_CAB",
    vehicle: "Mahindra Scorpio-N / Tata Safari 4x4",
    vehicleModel: "4x4 Hill Terrain Edition",
    vehicleCategory: "SUV",
    fromCity: "Srinagar",
    toCity: "Gulmarg",
    fromLocation: "Sheikh-ul-Alam International Airport (SXR)",
    toLocation: "Gulmarg Gondola Base / Luxury Resort Drop",
    fromCountry: "India",
    toCountry: "India",
    fromState: "Jammu & Kashmir",
    toState: "Jammu & Kashmir",
    distanceKm: 56,
    duration: "1.5 Hours",
    maxSeats: 6,
    luggageCapacity: "3 Large + 3 Small Bags",
    pricingModel: "PER_VEHICLE",
    costPerUnit: 3500,
    originalPrice: 4500,
    discountPercent: 22,
    discountBadge: "Snow-Chain Ready · Certified Tangmarg Driver",
    currency: "INR",
    amenities: ["Snow Chains Equipped", "Room Heaters in Cab", "Warm Fleece Blankets", "4x4 Drive"],
    inclusions: [
      "Tangmarg snow chain fitment included during winter snow",
      "Toll charges and Kashmir tourism permits",
      "Direct drop at Khyber / Highland Park / Grand Mumtaz",
    ],
    exclusions: ["Local Gulmarg sledge or pony rides (union rates apply)"],
    pickupGuidelines: "Immediate pickup from Srinagar Airport Terminal 1.",
    coverImage: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=80",
    isPopular: true,
    isSnowChainEquipped: true,
    tollPermitIncluded: true,
    supplierName: "Kashmir Valley Chauffeurs",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Srinagar Airport → Dal Lake Boulevard & Houseboat Ghat",
    category: "AIRPORT_RAILWAY",
    type: "PRIVATE_CAR",
    vehicle: "Swift Dzire / Toyota Etios (AC Sedan)",
    vehicleModel: "Swift Dzire",
    vehicleCategory: "SEDAN",
    fromCity: "Srinagar",
    toCity: "Srinagar City / Dal Lake",
    fromLocation: "Srinagar International Airport (SXR)",
    toLocation: "Ghat No. 1 - 17, Boulevard Road Dal Lake",
    fromCountry: "India",
    toCountry: "India",
    fromState: "Jammu & Kashmir",
    toState: "Jammu & Kashmir",
    distanceKm: 18,
    duration: "45 Mins",
    maxSeats: 4,
    luggageCapacity: "2 Large Suitcases",
    pricingModel: "PER_VEHICLE",
    costPerUnit: 1200,
    originalPrice: 1600,
    discountPercent: 25,
    discountBadge: "Fixed Fare · No Airport Bargaining",
    currency: "INR",
    amenities: ["AC / Heater", "Clean Interior", "Direct Ghat Drop"],
    inclusions: [
      "Airport parking and toll included",
      "Assistance in contacting houseboat shikara driver at specified Ghat",
    ],
    exclusions: ["Shikara cross-lake transfer"],
    pickupGuidelines: "Driver with name board outside Srinagar Airport arrival gates.",
    coverImage: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80",
    isPopular: true,
    isSnowChainEquipped: false,
    tollPermitIncluded: true,
    supplierName: "Kashmir Valley Chauffeurs",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Delhi Majnu Ka Tilla → Manali Volvo Bus Stand (AC Sleeper / Semi-Sleeper)",
    category: "OVERNIGHT_VOLVO",
    type: "VOLVO_BUS",
    vehicle: "Volvo 9600 Multi-Axle 2x2 AC Bus",
    vehicleModel: "Volvo 9600 Luxury Liner",
    vehicleCategory: "BUS",
    fromCity: "Delhi",
    toCity: "Manali",
    fromLocation: "Majnu Ka Tilla / Kashmiri Gate, Delhi (6:00 PM - 8:30 PM)",
    toLocation: "Private Volvo Bus Stand, Manali (8:00 AM - 9:30 AM)",
    fromCountry: "India",
    toCountry: "India",
    fromState: "Delhi",
    toState: "Himachal Pradesh",
    distanceKm: 540,
    duration: "12.5 Hours (Overnight)",
    maxSeats: 42,
    luggageCapacity: "1 Large Bag in Luggage Bay + 1 Cabin Bag",
    pricingModel: "PER_PASSENGER",
    costPerUnit: 1450,
    originalPrice: 1900,
    discountPercent: 24,
    discountBadge: "Live GPS Tracking · Blanket & Water Bottle",
    currency: "INR",
    amenities: ["Air Suspension", "Reclining 2x2 Pushback Seats", "Personal USB Charging", "LED TV", "Warm Blanket"],
    inclusions: [
      "Guaranteed confirmed seat in Luxury Multi-Axle Volvo",
      "Night halt at hygienic highway food plaza for dinner",
      "Mineral water bottle on boarding",
    ],
    exclusions: ["Dinner / Meal expenses during highway stops"],
    pickupGuidelines: "Boarding reporting 30 minutes before departure at Majnu Ka Tilla.",
    coverImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80",
    isPopular: true,
    isSnowChainEquipped: false,
    tollPermitIncluded: true,
    supplierName: "Northern Luxury Volvo Lines",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Port Blair (Phoenix Bay) → Havelock Island (Makruzz Catamaran Ferry)",
    category: "ISLAND_WATER",
    type: "FERRY",
    vehicle: "Makruzz / Green Ocean Luxury Catamaran Ferry",
    vehicleModel: "Makruzz High-Speed Vessel",
    vehicleCategory: "WATERCRAFT",
    fromCity: "Port Blair",
    toCity: "Havelock Island (Swaraj Dweep)",
    fromLocation: "Phoenix Bay Jetty, Port Blair",
    toLocation: "Havelock Island Jetty",
    fromCountry: "India",
    toCountry: "India",
    fromState: "Andaman & Nicobar",
    toState: "Andaman & Nicobar",
    distanceKm: 45,
    duration: "90 Mins",
    maxSeats: 250,
    luggageCapacity: "2 Check-in Bags (up to 25 kg) + Handbag",
    pricingModel: "PER_PASSENGER",
    costPerUnit: 1850,
    originalPrice: 2200,
    discountPercent: 16,
    discountBadge: "Premium AC Class · Panoramic Sea Views",
    currency: "INR",
    amenities: ["Fully Air-Conditioned", "Onboard Cafeteria", "Panoramic Ocean Windows", "Life Jackets & Marine Safety"],
    inclusions: [
      "Confirmed Luxury AC Premium Class Ticket",
      "Port taxes, passenger safety insurance & harbor charges",
      "BMT Concierge baggage handling assistance at Port Blair Jetty",
    ],
    exclusions: ["Snacks and beverages purchased onboard"],
    pickupGuidelines: "Report to Phoenix Bay Jetty 1 hour before scheduled vessel sailing.",
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
    isPopular: true,
    isSnowChainEquipped: false,
    tollPermitIncluded: true,
    supplierName: "Andaman Marine Ferries",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Phata / Guptkashi → Kedarnath Dham VIP Helicopter Shuttle",
    category: "HELICOPTER_SHUTTLE",
    type: "HELICOPTER",
    vehicle: "Bell 407 / Airbus H125 6-Seater Helicopter",
    vehicleModel: "Airbus H125 Chardham Shuttle",
    vehicleCategory: "AIRCRAFT",
    fromCity: "Phata / Guptkashi",
    toCity: "Kedarnath Helipad",
    fromLocation: "Phata / Sersi / Guptkashi Helipad Base",
    toLocation: "Kedarnath Temple Helipad (500m from Shrine)",
    fromCountry: "India",
    toCountry: "India",
    fromState: "Uttarakhand",
    toState: "Uttarakhand",
    distanceKm: 15,
    duration: "10 Mins (One-Way)",
    maxSeats: 6,
    luggageCapacity: "Handbag only (up to 5 kg per passenger)",
    pricingModel: "PER_PASSENGER",
    costPerUnit: 8500,
    originalPrice: 10500,
    discountPercent: 19,
    discountBadge: "Both Ways Return · Priority Darshan Pass Included",
    currency: "INR",
    amenities: ["DGCA Certified Pilots", "Aviation Turbine Fuel", "Priority Boarding", "Medical Oxygen Onboard"],
    inclusions: [
      "Confirmed round-trip same-day return helicopter flight",
      "Helipad shuttle transfer & VIP Darshan assistance slip",
      "Aviation passenger insurance & government helipad fees",
    ],
    exclusions: ["Pony/Doli charges from Kedarnath Helipad to temple", "Overnight temple stay charges"],
    pickupGuidelines: "Biometric Chardham Yatra registration slip and Aadhaar card mandatory.",
    coverImage: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=900&q=80",
    isPopular: true,
    isSnowChainEquipped: false,
    tollPermitIncluded: true,
    supplierName: "Himalayan Aviation Chardham",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Haridwar / Rishikesh → Chardham 12-Seater Luxury Maharaja Tempo Traveller",
    category: "INTERCITY",
    type: "TEMPO_TRAVELLER",
    vehicle: "Force Urbania / Luxury Maharaja 12-Seater (1x1 Pushback)",
    vehicleModel: "Force Urbania Premium",
    vehicleCategory: "TEMPO",
    fromCity: "Haridwar / Rishikesh",
    toCity: "Chardham Circuit / Uttarakhand",
    fromLocation: "Haridwar Railway Station / Rishikesh Hotel",
    toLocation: "Yamunotri · Gangotri · Kedarnath · Badrinath",
    fromCountry: "India",
    toCountry: "India",
    fromState: "Uttarakhand",
    toState: "Uttarakhand",
    distanceKm: 950,
    duration: "10-12 Days Dedicated Chauffeur",
    maxSeats: 12,
    luggageCapacity: "12 Large Suitcases in Heavy Rear Bay + Rooftop",
    pricingModel: "PER_DAY",
    costPerUnit: 7500,
    originalPrice: 9000,
    discountPercent: 17,
    discountBadge: "Per Day Dedicated Vehicle · Hill Certified Chauffeur",
    currency: "INR",
    amenities: ["Individual AC Vents", "1x1 Reclining Maharaja Sofa Seats", "Surround Sound & Android LED", "First Aid & Oxygen Cylinder"],
    inclusions: [
      "Dedicated luxury Tempo Traveller with seasoned Chardham hill driver",
      "Green Card, Hill Fitness Permit, Tolls, State Border Taxes",
      "Driver boarding, food allowance & fuel included",
    ],
    exclusions: ["Parking fees at individual remote temple spots (approx ₹100/day)"],
    pickupGuidelines: "Vehicle reports 1 hour prior at Haridwar or Dehradun Airport.",
    coverImage: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=80",
    isPopular: true,
    isSnowChainEquipped: true,
    tollPermitIncluded: true,
    supplierName: "Devbhoomi Luxury Fleet",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Dubai International Airport (DXB) → Downtown & Marina VIP Chauffeur",
    category: "AIRPORT_RAILWAY",
    type: "LUXURY_VIP",
    vehicle: "Mercedes-Benz E-Class / Lexus ES 300h (Luxury VIP)",
    vehicleModel: "Mercedes E-Class / Lexus Hybrid",
    vehicleCategory: "LUXURY",
    fromCity: "Dubai",
    toCity: "Dubai Downtown / Palm Jumeirah / Marina",
    fromLocation: "DXB Terminal 1, 2, or 3 (Arrival Hall)",
    toLocation: "Any Hotel in Dubai / Palm Jumeirah",
    fromCountry: "United Arab Emirates",
    toCountry: "United Arab Emirates",
    fromState: "Dubai",
    toState: "Dubai",
    distanceKm: 25,
    duration: "30 Mins",
    maxSeats: 4,
    luggageCapacity: "3 Large Suitcases",
    pricingModel: "PER_VEHICLE",
    costPerUnit: 4200,
    originalPrice: 5500,
    discountPercent: 24,
    discountBadge: "VIP Meet & Greet · Zero Salik Surcharge",
    currency: "INR",
    amenities: ["Leather Interior", "Complimentary Wi-Fi", "Chilled Bottled Water", "English Speaking Chauffeur", "Flight Tracking"],
    inclusions: [
      "VIP Chauffeur meet & greet inside Dubai Airport Terminal",
      "Salik highway toll gates & DXB airport parking fees included",
      "60 minutes complimentary flight delay waiting time",
    ],
    exclusions: ["Gratuities for driver"],
    pickupGuidelines: "Chauffeur holds digital tablet with your name at Terminal 3 Arrivals.",
    coverImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
    isPopular: true,
    isSnowChainEquipped: false,
    tollPermitIncluded: true,
    supplierName: "Emirates Royal VIP Limousine",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Kochi Airport (COK) → Munnar Tea Hills & Waterfalls",
    category: "HILL_STATION",
    type: "SUV_CAB",
    vehicle: "Toyota Innova Crysta (AC SUV)",
    vehicleModel: "Innova Crysta AC",
    vehicleCategory: "SUV",
    fromCity: "Kochi",
    toCity: "Munnar",
    fromLocation: "Cochin International Airport (COK) / Ernakulam Rly",
    toLocation: "Munnar Hill View Resorts & Tea Plantations",
    fromCountry: "India",
    toCountry: "India",
    fromState: "Kerala",
    toState: "Kerala",
    distanceKm: 130,
    duration: "4.0 Hours",
    maxSeats: 6,
    luggageCapacity: "4 Large Suitcases",
    pricingModel: "PER_VEHICLE",
    costPerUnit: 3800,
    originalPrice: 4800,
    discountPercent: 21,
    discountBadge: "Valara & Cheeyappara Waterfalls Halt Included",
    currency: "INR",
    amenities: ["AC", "Comfortable Captain Seats", "Bottled Water", "Kerala Tourism Certified Driver"],
    inclusions: [
      "Private AC Innova Crysta for scenic Western Ghats drive",
      "Sightseeing stop at Valara and Cheeyappara Waterfalls",
      "All tolls, parking & driver allowance included",
    ],
    exclusions: ["Spice garden entry tickets en route"],
    pickupGuidelines: "Driver waiting at Cochin Airport exit canopy.",
    coverImage: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=900&q=80",
    isPopular: true,
    isSnowChainEquipped: false,
    tollPermitIncluded: true,
    supplierName: "Kerala Gods Own Chauffeurs",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const vehicleCategory = searchParams.get("vehicleCategory") || "ALL";

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const collection = db.collection("transfers");

    // Check count and seed realistic defaults if collection empty
    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(SEED_TRANSFERS as any);
    }

    const query: Record<string, any> = {};

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { fromCity: { $regex: search, $options: "i" } },
        { toCity: { $regex: search, $options: "i" } },
        { vehicle: { $regex: search, $options: "i" } },
        { vehicleModel: { $regex: search, $options: "i" } },
        { fromState: { $regex: search, $options: "i" } },
        { toState: { $regex: search, $options: "i" } },
      ];
    }

    if (category !== "ALL") {
      query.category = category;
    }

    if (status !== "ALL") {
      query.status = status;
    }

    if (vehicleCategory !== "ALL") {
      query.vehicleCategory = vehicleCategory;
    }

    const transfers = await collection
      .find(query)
      .sort({ isPopular: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      transfers,
      totalCount: transfers.length,
    });
  } catch (error: any) {
    console.error("[ADMIN_TRANSFERS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch transfers", detail: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const body = await req.json();

    if (!body.name || !body.fromCity || !body.toCity || !body.vehicle) {
      return NextResponse.json(
        { error: "Name, Origin City, Destination City, and Vehicle name are required." },
        { status: 400 }
      );
    }

    const costPerUnit = Number(body.costPerUnit) || 0;
    const originalPrice = Number(body.originalPrice) || Math.round(costPerUnit * 1.25);
    const discountPercent =
      Number(body.discountPercent) ||
      (originalPrice > costPerUnit
        ? Math.round(((originalPrice - costPerUnit) / originalPrice) * 100)
        : 0);

    const newDoc = {
      name: body.name.trim(),
      category: body.category || "INTERCITY",
      type: body.type || "PRIVATE_CAR",
      vehicle: body.vehicle.trim(),
      vehicleModel: body.vehicleModel || body.vehicle,
      vehicleCategory: body.vehicleCategory || "SEDAN",
      fromCity: body.fromCity.trim(),
      toCity: body.toCity.trim(),
      fromLocation: body.fromLocation || `${body.fromCity} City / Airport`,
      toLocation: body.toLocation || `${body.toCity} City / Hotel`,
      fromCountry: body.fromCountry || "India",
      toCountry: body.toCountry || "India",
      fromState: body.fromState || "",
      toState: body.toState || "",
      distanceKm: Number(body.distanceKm) || 0,
      duration: body.duration || "2 Hours",
      maxSeats: Number(body.maxSeats) || 4,
      luggageCapacity: body.luggageCapacity || "2 Large + 2 Small Bags",
      pricingModel: body.pricingModel || "PER_VEHICLE",
      costPerUnit,
      originalPrice,
      discountPercent,
      discountBadge: body.discountBadge || (discountPercent > 0 ? `Save ${discountPercent}% Today` : ""),
      currency: body.currency || "INR",
      amenities: Array.isArray(body.amenities)
        ? body.amenities
        : (body.amenities ? String(body.amenities).split(",").map((s) => s.trim()).filter(Boolean) : []),
      inclusions: Array.isArray(body.inclusions)
        ? body.inclusions
        : (body.inclusions ? String(body.inclusions).split("\n").map((s) => s.trim()).filter(Boolean) : []),
      exclusions: Array.isArray(body.exclusions)
        ? body.exclusions
        : (body.exclusions ? String(body.exclusions).split("\n").map((s) => s.trim()).filter(Boolean) : []),
      pickupGuidelines: body.pickupGuidelines || "Driver contact details will be shared 2 hours before pickup.",
      coverImage: body.coverImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
      isPopular: Boolean(body.isPopular),
      isSnowChainEquipped: Boolean(body.isSnowChainEquipped),
      tollPermitIncluded: body.tollPermitIncluded !== undefined ? Boolean(body.tollPermitIncluded) : true,
      supplierName: body.supplierName || "Be My Traveller Fleet Partner",
      status: body.status || "ACTIVE",
      createdBy: session.user.id || "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("transfers").insertOne(newDoc);

    return NextResponse.json({
      success: true,
      insertedId: result.insertedId,
      transfer: { ...newDoc, _id: result.insertedId },
    });
  } catch (error: any) {
    console.error("[ADMIN_TRANSFERS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create transfer product", detail: error?.message },
      { status: 500 }
    );
  }
}
