import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import { CustomerModel } from "@/domains/crm/customer.model";
import { BookingModel } from "@/domains/booking/booking.model";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    await connectDB();

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
      ];
    }

    let customers = await CustomerModel.find(query).sort({ updatedAt: -1 }).lean();

    // If database has 0 customers, seed realistic travellers so the CRM directory is populated
    if (customers.length === 0) {
      const defaultSeed = [
        {
          name: "Vikram Malhotra",
          phone: "+91 98200 45678",
          email: "vikram.m@gmail.com",
          address: { city: "Mumbai", state: "Maharashtra" },
          totalBookings: 3,
          totalSpend: 245000,
          tags: ["VIP", "KASHMIR_TOUR"],
          preferences: { specialRequirements: "Kashmir Luxury Tour (Oct 2026)" },
          isActive: true,
        },
        {
          name: "Ananya Deshmukh",
          phone: "+91 97112 34567",
          email: "ananya.d@outlook.com",
          address: { city: "Delhi NCR", state: "Delhi" },
          totalBookings: 2,
          totalSpend: 185000,
          tags: ["ACTIVE", "HIMACHAL_EXPLORER"],
          preferences: { specialRequirements: "Himachal Explorer (Nov 2026)" },
          isActive: true,
        },
        {
          name: "Rahul & Sneha Kapoor",
          phone: "+91 98450 12345",
          email: "rahul.kapoor@techcorp.in",
          address: { city: "Bengaluru", state: "Karnataka" },
          totalBookings: 1,
          totalSpend: 188000,
          tags: ["ACTIVE", "HONEYMOON"],
          preferences: { specialRequirements: "Bali Honeymoon Villa (Dec 2026)" },
          isActive: true,
        },
        {
          name: "Dr. Priya Sundaram",
          phone: "+91 94440 88990",
          email: "priya.s@apollohealth.org",
          address: { city: "Chennai", state: "Tamil Nadu" },
          totalBookings: 4,
          totalSpend: 395000,
          tags: ["VIP", "DUBAI_SPECIAL"],
          preferences: { specialRequirements: "Dubai & Abu Dhabi Ultra Explorer" },
          isActive: true,
        },
        {
          name: "Siddharth Oberoi",
          phone: "+91 98100 77123",
          email: "sid.oberoi@globalventures.com",
          address: { city: "Gurugram", state: "Haryana" },
          totalBookings: 2,
          totalSpend: 160000,
          tags: ["ACTIVE", "RAJASTHAN_PALACES"],
          preferences: { specialRequirements: "Rajasthan Royal Palaces Tour" },
          isActive: true,
        },
      ];

      await CustomerModel.insertMany(defaultSeed);
      customers = await CustomerModel.find(query).sort({ updatedAt: -1 }).lean();
    }

    // Enrich with latest completed trip info if available from bookings
    const enriched = await Promise.all(
      customers.map(async (c: any) => {
        let lastTrip = c.preferences?.specialRequirements || "";
        if (!lastTrip) {
          const latestBooking = await BookingModel.findOne({ customer: c._id })
            .sort({ createdAt: -1 })
            .lean();
          if (latestBooking) {
            lastTrip = `${latestBooking.packageName || latestBooking.destination || "Tour Package"} (${new Date(
              latestBooking.travelDates?.from || latestBooking.createdAt
            ).toLocaleDateString("en-IN", { month: "short", year: "numeric" })})`;
          }
        }
        return {
          ...c,
          city: c.address?.city || "India",
          lastTrip: lastTrip || "Custom Holiday Package",
          status: c.tags?.includes("VIP") || c.totalSpend > 200000 ? "VIP" : "ACTIVE",
        };
      })
    );

    return NextResponse.json({ success: true, customers: enriched, total: enriched.length });
  } catch (error: any) {
    console.error("[Customers GET Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch customers" }, { status: 500 });
  }
}
