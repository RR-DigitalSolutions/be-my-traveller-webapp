import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { LeadModel } from "@/domains/crm/lead.model";
import { LeadService } from "@/domains/crm/lead.service";
import { auth } from "@/lib/auth/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const leadType = searchParams.get("leadType");
    const assignedTo = searchParams.get("assignedTo");
    const slaStatus = searchParams.get("slaStatus");
    const myLeads = searchParams.get("myLeads");

    const query: Record<string, unknown> = {};

    if (myLeads === "true" && session.user.id) {
      query.assignedTo = session.user.id;
    } else if (assignedTo) {
      if (assignedTo === "UNASSIGNED") {
        query.assignedTo = { $in: [null, undefined] };
      } else {
        query.assignedTo = assignedTo;
      }
    }

    if (slaStatus && slaStatus !== "ALL") {
      query.slaStatus = slaStatus;
    }

    if (status && status !== "ALL") {
      if (status === "CONTACTED" || status === "CONNECTED") {
        query.status = { $in: ["CONTACTED", "CONNECTED"] };
      } else if (status === "CONFIRMED" || status === "BOOKED") {
        query.status = { $in: ["CONFIRMED", "BOOKED"] };
      } else {
        query.status = status;
      }
    }

    if (leadType && leadType !== "ALL") {
      if (leadType === "TRANSPORTATION") {
        query.$or = [
          { leadType: "TRANSPORTATION" },
          { source: { $in: ["CAB_RENTAL", "TRANSPORTATION"] } },
          { specialRequirements: { $regex: "cab|transfer|vehicle|sedan|suv|innova|ertiga|traveller", $options: "i" } },
        ];
      } else if (leadType === "HOLIDAY_PACKAGE") {
        query.$or = [
          { leadType: "HOLIDAY_PACKAGE" },
          { source: "PACKAGE_ENQUIRY" },
          { packageId: { $exists: true, $ne: null } },
        ];
      } else if (leadType === "CUSTOM_ITINERARY") {
        query.$or = [
          { leadType: "CUSTOM_ITINERARY" },
          { source: "CUSTOM_TRIP_FORM" },
          { specialRequirements: { $regex: "custom|itinerary|build", $options: "i" } },
        ];
      } else if (leadType === "HOTEL_STAY") {
        query.$or = [
          { leadType: "HOTEL_STAY" },
          { source: "HOTEL_ENQUIRY" },
          { hotelCategory: { $exists: true, $ne: "" } },
        ];
      } else {
        query.leadType = leadType;
      }
    }

    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { specialRequirements: { $regex: search, $options: "i" } },
        { "tripDetails.pickupCity": { $regex: search, $options: "i" } },
        { "tripDetails.dropCity": { $regex: search, $options: "i" } },
        { "tripDetails.vehicleType": { $regex: search, $options: "i" } },
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const leads = await LeadModel.find(query)
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, leads });
  } catch (error: unknown) {
    console.error("[ADMIN_LEADS_GET_ERROR]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch leads", detail: message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { id, action, status, notes, assignedTo, reason, followUp, communication, quoteData, lostReason } = body;

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const userId = session.user.id || "admin";
    const userEmail = session.user.email || "admin@bemytraveller.com";
    const userName = session.user.name || "Administrator";

    // 1. Explicit Lead Assignment Action
    if (action === "ASSIGN" && assignedTo) {
      const updated = await LeadService.assignLead({
        leadId: id,
        assignedToId: assignedTo,
        assignedById: userId,
        assignedByName: userName,
        reason,
      });
      return NextResponse.json({ success: true, lead: updated, message: "Lead assigned successfully" });
    }

    // 2. Schedule Follow-up Action
    if (action === "FOLLOW_UP" && followUp) {
      const updated = await LeadService.scheduleFollowUp({
        leadId: id,
        dueAt: new Date(followUp.dueAt),
        type: followUp.type || "CALL",
        priority: followUp.priority || "MEDIUM",
        note: followUp.note,
        userId,
        userEmail,
      });
      return NextResponse.json({ success: true, lead: updated, message: "Follow-up scheduled successfully" });
    }

    // 3. Complete Follow-up Action
    if (action === "COMPLETE_FOLLOW_UP" && body.followUpId) {
      const updated = await LeadService.completeFollowUp({
        leadId: id,
        followUpId: body.followUpId,
        outcome: body.outcome,
        userId,
        userEmail,
      });
      return NextResponse.json({ success: true, lead: updated, message: "Follow-up marked as completed" });
    }

    // 4. Log Communication Action (Call, WhatsApp, Email, Meeting)
    if (action === "COMMUNICATION" && communication) {
      const updated = await LeadService.logCommunication({
        leadId: id,
        type: communication.type || "CALL",
        summary: communication.summary || "Traveller discussion",
        details: communication.details,
        outcome: communication.outcome,
        durationMinutes: communication.durationMinutes,
        userId,
        userEmail,
      });
      return NextResponse.json({ success: true, lead: updated, message: "Communication logged to timeline" });
    }

    // 5. Convert Lead to Customer
    if (action === "CONVERT") {
      const result = await LeadService.convertLeadToCustomer({
        leadId: id,
        userId,
        userEmail,
      });
      return NextResponse.json({
        success: true,
        customer: result.customer,
        lead: result.lead,
        message: "Lead successfully converted to customer",
      });
    }

    // 6. Attach Quote
    if (action === "ATTACH_QUOTE" && quoteData) {
      const updated = await LeadService.attachQuote({
        leadId: id,
        quoteId: quoteData.quoteId,
        quoteNumber: quoteData.quoteNumber,
        totalAmount: Number(quoteData.totalAmount) || 0,
        userId,
        userEmail,
      });
      return NextResponse.json({ success: true, lead: updated, message: "Quote attached to lead" });
    }

    // 7. Status Transition via State Machine
    if (status) {
      const updated = await LeadService.updateStatus({
        leadId: id,
        newStatus: status,
        userId,
        userEmail,
        lostReason,
        reason,
      });
      return NextResponse.json({ success: true, lead: updated, message: "Lead stage updated successfully" });
    }

    // 8. Standard Notes Update fallback
    const update: Record<string, unknown> = {};
    if (notes !== undefined) update.notes = notes;

    const lead = await LeadModel.findByIdAndUpdate(id, { $set: update }, { new: true });
    return NextResponse.json({ success: true, lead, message: "Lead updated successfully" });
  } catch (error: unknown) {
    console.error("[ADMIN_LEADS_PATCH_ERROR]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update lead", detail: message },
      { status: 500 }
    );
  }
}
