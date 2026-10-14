import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
        { quoteNumber: { $regex: search, $options: "i" } },
      ];
    }

    let quotes = await db.collection("quotes").find(query).sort({ createdAt: -1 }).toArray();

    if (quotes.length === 0) {
      const defaultQuotes = [
        {
          quoteNumber: "BMT-QT-2026-104",
          customerName: "Vikram Malhotra",
          customerPhone: "+91 98200 45678",
          customerEmail: "vikram.m@gmail.com",
          destination: "Kashmir Luxury Tour",
          travelDates: "15 Oct 2026 – 21 Oct 2026 (6N/7D)",
          paxCount: "2 Adults",
          hotelTier: "5★ Luxury (The Khyber & Houseboat)",
          cabType: "Private Innova Crysta",
          totalAmount: 94500,
          status: "SENT",
          createdAt: new Date(),
        },
        {
          quoteNumber: "BMT-QT-2026-103",
          customerName: "Ananya Deshmukh",
          customerPhone: "+91 97112 34567",
          customerEmail: "ananya.d@outlook.com",
          destination: "Himachal Explorer & Spiti",
          travelDates: "10 Nov 2026 – 17 Nov 2026 (7N/8D)",
          paxCount: "4 Adults",
          hotelTier: "4★ Deluxe & Riverside Camps",
          cabType: "Private 4x4 Scorpio / Urbania",
          totalAmount: 142000,
          status: "CONFIRMED",
          createdAt: new Date(),
        },
        {
          quoteNumber: "BMT-QT-2026-102",
          customerName: "Rahul & Sneha Kapoor",
          customerPhone: "+91 98450 12345",
          customerEmail: "rahul.kapoor@techcorp.in",
          destination: "Bali Honeymoon Villa Special",
          travelDates: "05 Dec 2026 – 12 Dec 2026 (7N/8D)",
          paxCount: "2 Adults (Honeymoon)",
          hotelTier: "Private Pool Villa (Ubud & Seminyak)",
          cabType: "Private AC Vehicle with Guide",
          totalAmount: 188000,
          status: "DRAFT",
          createdAt: new Date(),
        },
      ];
      await db.collection("quotes").insertMany(defaultQuotes);
      quotes = await db.collection("quotes").find(query).toArray();
    }

    // Enrich quotes with referenced Lead and Customer data so Client Details never appear blank
    const enrichedQuotes = await Promise.all(
      quotes.map(async (q: any) => {
        let customerName = q.customerName || "";
        let customerPhone = q.customerPhone || "";
        let customerEmail = q.customerEmail || "";
        let destination =
          q.destination ||
          q.packageName ||
          (Array.isArray(q.destinations) && q.destinations.length > 0 ? q.destinations.join(", ") : "");
        let travelDates = q.travelDates;
        let paxCount = q.paxCount || "";
        let hotelTier =
          q.hotelTier ||
          (q.hotelConfig && q.hotelConfig[0]?.hotelName ? `${q.hotelConfig[0].hotelName} (${q.hotelConfig[0].mealPlan || "MAP"})` : "4★ Deluxe Hotels");
        let cabType = q.cabType || "Private Dedicated Innova Crysta";
        let assignedToName = q.assignedSalesPerson?.name || q.assignedToName || "";

        const leadRefId = q.leadId || q.lead;
        if ((!customerName || !customerPhone || !assignedToName) && leadRefId) {
          try {
            const leadIdObj =
              typeof leadRefId === "string" && mongoose.Types.ObjectId.isValid(leadRefId)
                ? new mongoose.Types.ObjectId(leadRefId)
                : leadRefId;
            const leadDoc = await db.collection("leads").findOne({ _id: leadIdObj });
            if (leadDoc) {
              customerName = customerName || leadDoc.name;
              customerPhone = customerPhone || leadDoc.phone;
              customerEmail = customerEmail || leadDoc.email;
              if (!destination && Array.isArray(leadDoc.destinations) && leadDoc.destinations.length > 0) {
                destination = leadDoc.destinations.join(", ");
              }
              if (!travelDates && leadDoc.travelDates) {
                travelDates = leadDoc.travelDates;
              }
              if (!paxCount && leadDoc.travellers) {
                paxCount = `${leadDoc.travellers.adults || 2} Adults${leadDoc.travellers.children ? `, ${leadDoc.travellers.children} Child` : ""}`;
              }
              if (!assignedToName && leadDoc.assignedTo) {
                const agentDoc = await db.collection("users").findOne({ _id: leadDoc.assignedTo });
                if (agentDoc) assignedToName = agentDoc.name;
              }
            }
          } catch (e) {
            // Safe fallback
          }
        }

        if ((!customerName || !customerPhone) && q.customer) {
          try {
            const custDoc = await db.collection("customers").findOne({ _id: q.customer });
            if (custDoc) {
              customerName = customerName || custDoc.name;
              customerPhone = customerPhone || custDoc.phone;
              customerEmail = customerEmail || custDoc.email;
            }
          } catch (e) {
            // Safe fallback
          }
        }

        // Format travelDates string if stored as date range object
        if (travelDates && typeof travelDates === "object" && travelDates.from) {
          const fromStr = new Date(travelDates.from).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const toStr = travelDates.to
            ? new Date(travelDates.to).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "";
          travelDates = toStr ? `${fromStr} – ${toStr}` : fromStr;
        }

        return {
          ...q,
          customerName: customerName || "Valued Traveller",
          customerPhone: customerPhone || "+91 8091638090",
          customerEmail: customerEmail || "",
          destination: destination || "Custom Tour Itinerary",
          travelDates: travelDates || "Flexible Tour Dates",
          paxCount: paxCount || (q.travellers ? `${q.travellers.adults || 2} Adults` : "2 Adults"),
          hotelTier,
          cabType,
          assignedToName,
        };
      })
    );

    return NextResponse.json({ quotes: enrichedQuotes, total: enrichedQuotes.length });
  } catch (error) {
    console.error("[Quotes GET Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      _id,
      customerName,
      customerPhone,
      customerEmail,
      destination,
      travelDates,
      paxCount,
      hotelTier,
      cabType,
      totalAmount,
      leadId,
      itinerary,
      inclusions,
      exclusions,
      adultsCount,
      childrenCount,
      infantsCount,
      costing,
      assignedSalesPerson,
      paymentPolicies,
      cancellationPolicies,
      importantInfo,
      pricingTiers,
      status,
      notes,
    } = body;

    if (!customerName || !customerPhone || !destination) {
      return NextResponse.json({ error: "Customer details and destination required" }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const quoteStatus = status || "SENT";
    const salesPerson = assignedSalesPerson || {
      name: session.user.name || "Holiday Specialist",
      email: session.user.email || "bookings@bemytraveller.com",
      phone: "+91 8091638090",
      role: "Holiday Specialist",
    };

    // If _id is provided, update existing quote in-place (re-edit proposal)
    if (_id && mongoose.Types.ObjectId.isValid(_id)) {
      const updateDoc = {
        customerName,
        customerPhone,
        customerEmail: customerEmail || "",
        destination,
        travelDates: travelDates || "Flexible",
        paxCount: paxCount || `${adultsCount || 2} Adults${childrenCount ? `, ${childrenCount} Child` : ""}`,
        hotelTier: hotelTier || "4★ Deluxe",
        cabType: cabType || "Private AC Sedan/SUV",
        totalAmount: Number(totalAmount) || 50000,
        itinerary: Array.isArray(itinerary) ? itinerary : [],
        inclusions: Array.isArray(inclusions) ? inclusions : [],
        exclusions: Array.isArray(exclusions) ? exclusions : [],
        travellers: {
          adults: Number(adultsCount) || 2,
          children: Number(childrenCount) || 0,
          infants: Number(infantsCount) || 0,
        },
        costing: costing || {},
        assignedSalesPerson: salesPerson,
        paymentPolicies: Array.isArray(paymentPolicies) ? paymentPolicies : [],
        cancellationPolicies: Array.isArray(cancellationPolicies) ? cancellationPolicies : [],
        importantInfo: Array.isArray(importantInfo) ? importantInfo : [],
        pricingTiers: pricingTiers || null,
        notes: notes || "",
        updatedAt: new Date(),
      };

      await db.collection("quotes").updateOne({ _id: new mongoose.Types.ObjectId(_id) }, { $set: updateDoc });
      const updatedQuote = await db.collection("quotes").findOne({ _id: new mongoose.Types.ObjectId(_id) });

      return NextResponse.json({ success: true, quote: updatedQuote, message: "Quote updated successfully" });
    }

    // Otherwise create brand new quote
    const quoteNumber = `BMT-QT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const doc = {
      quoteNumber,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      destination,
      travelDates: travelDates || "Flexible",
      paxCount: paxCount || `${adultsCount || 2} Adults${childrenCount ? `, ${childrenCount} Child` : ""}`,
      hotelTier: hotelTier || "4★ Deluxe",
      cabType: cabType || "Private AC Sedan/SUV",
      totalAmount: Number(totalAmount) || 50000,
      leadId: leadId && mongoose.Types.ObjectId.isValid(leadId) ? new mongoose.Types.ObjectId(leadId) : undefined,
      status: quoteStatus,
      itinerary: Array.isArray(itinerary) ? itinerary : [],
      inclusions: Array.isArray(inclusions) ? inclusions : [],
      exclusions: Array.isArray(exclusions) ? exclusions : [],
      travellers: {
        adults: Number(adultsCount) || 2,
        children: Number(childrenCount) || 0,
        infants: Number(infantsCount) || 0,
      },
      costing: costing || {},
      assignedSalesPerson: salesPerson,
      paymentPolicies: Array.isArray(paymentPolicies) ? paymentPolicies : [],
      cancellationPolicies: Array.isArray(cancellationPolicies) ? cancellationPolicies : [],
      importantInfo: Array.isArray(importantInfo) ? importantInfo : [],
      pricingTiers: pricingTiers || null,
      notes: notes || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await db.collection("quotes").insertOne(doc);

    // If linked to a lead, automatically attach to the lead pipeline
    if (leadId) {
      try {
        const { LeadService } = await import("@/domains/crm/lead.service");
        await LeadService.attachQuote({
          leadId,
          quoteId: res.insertedId.toString(),
          quoteNumber,
          totalAmount: Number(totalAmount) || 50000,
          userId: session.user.id || "admin",
          userEmail: session.user.email || "admin@bemytraveller.com",
        });
      } catch (attachErr) {
        console.warn("[Quote Create] Lead attach warning:", attachErr);
      }
    }

    return NextResponse.json({ success: true, quote: { ...doc, _id: res.insertedId } }, { status: 201 });
  } catch (error) {
    console.error("[Quotes POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
