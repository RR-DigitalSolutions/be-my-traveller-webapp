// ============================================================
// Sales & CRM — Lead Domain Service
// Enterprise business logic for Lead capture, deduplication,
// assignment, ownership, SLA tracking, communication timeline,
// follow-ups, tasks, quote integration, and conversion.
// ============================================================

import mongoose from "mongoose";
import connectDB from "@/lib/db/mongoose";
import { LeadModel, type ILead, type LeadStatus, type ILeadFollowUp, type ILeadCommunication } from "./lead.model";
import { CustomerModel, type ICustomer } from "./customer.model";
import { LeadStateMachine } from "@/domains/workflow/state-machine";
import { AuditService } from "@/domains/auth/audit.service";
import { TaskService } from "@/domains/tasks/task.service";
import { NotificationService } from "@/domains/notifications/notification.service";
import { Department } from "@/lib/auth/permissions";
import { UserModel } from "@/domains/auth/user.model";

export interface CaptureLeadInput {
  name: string;
  email: string;
  phone: string;
  packageId?: string;
  destinations?: string[];
  leadType?: "HOLIDAY_PACKAGE" | "CUSTOM_ITINERARY" | "TRANSPORTATION" | "HOTEL_STAY" | "GENERAL";
  tripDetails?: {
    tripType?: "ONE_WAY" | "ROUND_TRIP" | "MULTICITY";
    pickupCity?: string;
    dropCity?: string;
    multicityStops?: string[];
    vehicleType?: string;
    pickupDate?: string;
    returnDate?: string;
    pickupTime?: string;
    passengers?: number;
  };
  travelDates?: { from?: Date; to?: Date; flexible: boolean };
  travellers?: { adults: number; children: number; infants: number };
  budget?: { min?: number; max?: number; currency: string };
  hotelCategory?: string;
  themes?: string[];
  specialRequirements?: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPage?: string;
  referrer?: string;
  device?: "MOBILE" | "TABLET" | "DESKTOP";
}

export class LeadService {
  /**
   * Normalizes a phone number to standard digits for reliable deduplication.
   */
  static normalizePhone(phone: string): string {
    const digits = phone.replace(/[^0-9]/g, "");
    // If standard 10 digit Indian number with country code 91
    if (digits.length === 12 && digits.startsWith("91")) {
      return digits.slice(2);
    }
    // If starting with 0
    if (digits.length === 11 && digits.startsWith("0")) {
      return digits.slice(1);
    }
    return digits;
  }

  /**
   * 1. LEAD CAPTURE & DEDUPLICATION ENGINE
   * Detects duplicate inquiries within 30 days or active pipeline stages.
   */
  static async captureLead(input: CaptureLeadInput): Promise<{
    lead: ILead;
    isDuplicate: boolean;
    primaryLeadId?: string;
  }> {
    await connectDB();

    const normalizedPhone = this.normalizePhone(input.phone);
    const cleanEmail = (input.email || "").toLowerCase().trim();

    // Check for existing lead with matching phone or email within last 30 days or in active state
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const phoneRegex = new RegExp(normalizedPhone ? normalizedPhone.slice(-10) : input.phone.trim(), "i");

    const existingLead = await LeadModel.findOne({
      $or: [
        { phone: { $regex: phoneRegex } },
        ...(cleanEmail && cleanEmail !== "traveller@bemytraveller.com" ? [{ email: cleanEmail }] : []),
      ],
      createdAt: { $gte: thirtyDaysAgo },
      status: { $ne: "LOST" },
    }).sort({ createdAt: -1 });

    const isDuplicate = Boolean(existingLead);
    const now = new Date();

    // SLA: 30 minutes response time default
    const slaDueAt = new Date(now.getTime() + 30 * 60 * 1000);

    const initialCommunication: ILeadCommunication = {
      _id: new mongoose.Types.ObjectId(),
      type: "SYSTEM",
      summary: isDuplicate
        ? `Duplicate Inquiry Captured (${input.source || "WEB"})`
        : `Lead Captured via ${input.source || "DIRECT"}`,
      details: input.specialRequirements || input.tripDetails?.vehicleType
        ? `Requirement: ${input.specialRequirements || `${input.tripDetails?.vehicleType} ${input.tripDetails?.pickupCity} -> ${input.tripDetails?.dropCity}`}`
        : "Standard web inquiry",
      timestamp: now,
    };

    const newLead = await LeadModel.create({
      ...input,
      email: cleanEmail || "traveller@bemytraveller.com",
      status: "NEW",
      slaDueAt,
      slaStatus: "WITHIN_SLA",
      isDuplicate,
      primaryLeadId: existingLead ? existingLead._id : undefined,
      duplicateCount: 0,
      communications: [initialCommunication],
      ownershipHistory: [],
      notes: [],
      followUps: [],
      quoteIds: [],
    });

    if (existingLead) {
      // Append inquiry update into primary lead's timeline
      const duplicateComm: ILeadCommunication = {
        _id: new mongoose.Types.ObjectId(),
        type: "SYSTEM",
        summary: `Repeat Inquiry Received: ${input.source || "WEB"}`,
        details: `Traveller re-submitted inquiry. Requirements: ${input.specialRequirements || "Cab/Tour inquiry"}. Lead ID: ${newLead._id}`,
        timestamp: now,
      };

      await LeadModel.findByIdAndUpdate(existingLead._id, {
        $inc: { duplicateCount: 1 },
        $push: { communications: duplicateComm },
      });

      // Notify assigned consultant if lead was already assigned
      if (existingLead.assignedTo) {
        await NotificationService.notifyUser(
          existingLead.assignedTo.toString(),
          "Repeat Lead Inquiry Received",
          `${existingLead.name} submitted another travel inquiry. Check their timeline.`,
          {
            type: "INFO",
            link: `/admin/leads?search=${encodeURIComponent(existingLead.name)}`,
          }
        );
      }
    } else {
      // Broadcast to Sales department
      await NotificationService.notifyDepartment(
        Department.SALES,
        "⚡ New Inbound Lead",
        `${newLead.name} (${newLead.phone}) inquired for ${input.tripDetails?.vehicleType ? `Cab Transfer: ${input.tripDetails.pickupCity} → ${input.tripDetails.dropCity}` : "Tour Package"}. SLA: 30 mins.`,
        {
          type: "INFO",
          link: `/admin/leads?search=${encodeURIComponent(newLead.name)}`,
        }
      );
    }

    return {
      lead: newLead,
      isDuplicate,
      primaryLeadId: existingLead ? existingLead._id.toString() : undefined,
    };
  }

  /**
   * 2. LEAD ASSIGNMENT & OWNERSHIP MANAGEMENT
   */
  static async assignLead(params: {
    leadId: string;
    assignedToId: string;
    assignedById: string;
    assignedByName: string;
    reason?: string;
  }): Promise<ILead> {
    await connectDB();

    const lead = await LeadModel.findById(params.leadId);
    if (!lead) throw new Error("Lead not found");

    const now = new Date();
    const assignedToObj = new mongoose.Types.ObjectId(params.assignedToId);
    const assignedByObj = new mongoose.Types.ObjectId(params.assignedById);

    // Record ownership change history
    lead.ownershipHistory.push({
      assignedTo: assignedToObj,
      assignedBy: assignedByObj,
      assignedAt: now,
      reason: params.reason || "Manual Assignment",
    });

    lead.assignedTo = assignedToObj;
    lead.assignedBy = assignedByObj;
    lead.assignedAt = now;

    // Timeline event
    lead.communications.push({
      _id: new mongoose.Types.ObjectId(),
      type: "STATUS_CHANGE",
      summary: `Assigned to Travel Consultant (${params.assignedToId})`,
      details: params.reason || `Assigned by ${params.assignedByName}`,
      performedBy: assignedByObj,
      performedByName: params.assignedByName,
      timestamp: now,
    });

    await lead.save();

    // Log in central audit
    await AuditService.logTransition({
      userId: params.assignedById,
      userEmail: params.assignedByName,
      entityType: "Lead",
      entityId: lead._id.toString(),
      fromState: "UNASSIGNED",
      toState: params.assignedToId,
      trigger: "LEAD_ASSIGN",
      metadata: { reason: params.reason },
    });

    // Notify assigned consultant
    await NotificationService.notifyUser(
      params.assignedToId,
      "📋 New Lead Assigned to You",
      `You have been assigned lead "${lead.name}". Contact traveller before SLA deadline.`,
      {
        type: "LEAD_ALERT",
        link: `/admin/leads?search=${encodeURIComponent(lead.name)}`,
      }
    );

    // Create First-Contact Task for consultant
    try {
      await TaskService.createTask({
        title: `First Contact: ${lead.name} (${lead.phone})`,
        description: `Reach out to traveller regarding their inquiry: ${lead.specialRequirements || "Tour / Transfer request"}. Check SLA compliance.`,
        type: "CUSTOMER_FOLLOW_UP",
        priority: "HIGH",
        department: Department.SALES,
        assignedTo: params.assignedToId,
        assignedBy: params.assignedById,
        entityType: "Lead",
        entityId: lead._id.toString(),
        entityRef: lead.name,
        dueDate: lead.slaDueAt || new Date(now.getTime() + 30 * 60 * 1000),
      });
    } catch (e) {
      console.warn("[LeadService] Task creation warning:", e);
    }

    return lead;
  }

  /**
   * 3. LEAD PIPELINE STATE TRANSITION WITH STATE MACHINE & SLA RECONCILIATION
   */
  static async updateStatus(params: {
    leadId: string;
    newStatus: LeadStatus;
    userId: string;
    userEmail: string;
    lostReason?: string;
    reason?: string;
  }): Promise<ILead> {
    await connectDB();

    const lead = await LeadModel.findById(params.leadId);
    if (!lead) throw new Error("Lead not found");

    const previousStatus = lead.status;
    const now = new Date();

    // Run through formal state machine
    await LeadStateMachine.executeTransition({
      entityId: lead._id.toString(),
      currentState: previousStatus,
      targetState: params.newStatus,
      trigger: "ADMIN_PIPELINE_MOVE",
      context: {
        userId: params.userId,
        userEmail: params.userEmail,
        reason: params.reason || params.lostReason,
      },
    });

    // SLA Reconciliation: Check if this transition counts as first contact
    if (
      !lead.firstContactedAt &&
      ["CONTACTED", "CONNECTED", "FOLLOW_UP", "QUALIFIED", "QUOTE_SENT", "CONFIRMED"].includes(params.newStatus)
    ) {
      lead.firstContactedAt = now;
      if (lead.slaDueAt) {
        lead.slaStatus = now.getTime() <= lead.slaDueAt.getTime() ? "MET" : "BREACHED";
      } else {
        lead.slaStatus = "MET";
      }
    }

    lead.status = params.newStatus;
    if (params.lostReason) lead.lostReason = params.lostReason;

    // Timeline event
    lead.communications.push({
      _id: new mongoose.Types.ObjectId(),
      type: "STATUS_CHANGE",
      summary: `Stage Changed: ${previousStatus} → ${params.newStatus}`,
      details: params.lostReason ? `Lost Reason: ${params.lostReason}` : params.reason || undefined,
      performedBy: new mongoose.Types.ObjectId(params.userId),
      performedByName: params.userEmail,
      timestamp: now,
    });

    await lead.save();
    return lead;
  }

  /**
   * 4. FOLLOW-UP SCHEDULING & SYNCHRONIZATION WITH TASKS
   */
  static async scheduleFollowUp(params: {
    leadId: string;
    dueAt: Date;
    type: "CALL" | "EMAIL" | "WHATSAPP" | "MEETING";
    priority?: "LOW" | "MEDIUM" | "HIGH";
    note?: string;
    userId: string;
    userEmail: string;
  }): Promise<ILead> {
    await connectDB();

    const lead = await LeadModel.findById(params.leadId);
    if (!lead) throw new Error("Lead not found");

    const followUpRecord: ILeadFollowUp = {
      _id: new mongoose.Types.ObjectId(),
      dueAt: new Date(params.dueAt),
      type: params.type,
      priority: params.priority || "MEDIUM",
      note: params.note,
    };

    lead.followUps.push(followUpRecord);

    // If currently NEW or CONTACTED, auto advance to FOLLOW_UP
    if (lead.status === "NEW" || lead.status === "CONTACTED") {
      lead.status = "FOLLOW_UP";
    }

    lead.communications.push({
      _id: new mongoose.Types.ObjectId(),
      type: "NOTE",
      summary: `Follow-up Scheduled: ${params.type}`,
      details: `Scheduled for ${new Date(params.dueAt).toLocaleString("en-IN")}. Note: ${params.note || "N/A"}`,
      performedBy: new mongoose.Types.ObjectId(params.userId),
      performedByName: params.userEmail,
      timestamp: new Date(),
    });

    await lead.save();

    // Create synchronised task in Operational Tasks system
    try {
      await TaskService.createTask({
        title: `Follow-up: ${lead.name} (${params.type})`,
        description: params.note || `Scheduled follow-up with traveller for ${lead.destinations?.[0] || "inquiry"}.`,
        type: "CUSTOMER_FOLLOW_UP",
        priority: params.priority || "MEDIUM",
        department: Department.SALES,
        assignedTo: lead.assignedTo ? lead.assignedTo.toString() : params.userId,
        assignedBy: params.userId,
        entityType: "Lead",
        entityId: lead._id.toString(),
        entityRef: lead.name,
        dueDate: new Date(params.dueAt),
      });
    } catch (e) {
      console.warn("[LeadService] Follow-up task sync warning:", e);
    }

    return lead;
  }

  /**
   * Complete a scheduled follow-up
   */
  static async completeFollowUp(params: {
    leadId: string;
    followUpId: string;
    outcome?: string;
    userId: string;
    userEmail: string;
  }): Promise<ILead> {
    await connectDB();

    const lead = await LeadModel.findById(params.leadId);
    if (!lead) throw new Error("Lead not found");

    const followUp = lead.followUps.find((f) => f._id.toString() === params.followUpId);
    if (followUp) {
      followUp.completedAt = new Date();
      followUp.completedBy = new mongoose.Types.ObjectId(params.userId);
      followUp.outcome = params.outcome || "Completed";

      lead.communications.push({
        _id: new mongoose.Types.ObjectId(),
        type: followUp.type,
        summary: `Follow-up Completed: ${followUp.type}`,
        details: `Outcome: ${params.outcome || "Follow-up concluded"}`,
        performedBy: new mongoose.Types.ObjectId(params.userId),
        performedByName: params.userEmail,
        timestamp: new Date(),
      });

      await lead.save();
    }

    return lead;
  }

  /**
   * 5. LOG COMMUNICATION TIMELINE EVENT (Call, WhatsApp, Email, Meeting)
   */
  static async logCommunication(params: {
    leadId: string;
    type: "CALL" | "WHATSAPP" | "EMAIL" | "MEETING" | "NOTE";
    summary: string;
    details?: string;
    outcome?: string;
    durationMinutes?: number;
    userId: string;
    userEmail: string;
  }): Promise<ILead> {
    await connectDB();

    const lead = await LeadModel.findById(params.leadId);
    if (!lead) throw new Error("Lead not found");

    const now = new Date();

    // Check SLA first contact
    if (!lead.firstContactedAt && ["CALL", "WHATSAPP", "EMAIL", "MEETING"].includes(params.type)) {
      lead.firstContactedAt = now;
      if (lead.slaDueAt) {
        lead.slaStatus = now.getTime() <= lead.slaDueAt.getTime() ? "MET" : "BREACHED";
      } else {
        lead.slaStatus = "MET";
      }
      if (lead.status === "NEW") {
        lead.status = "CONTACTED";
      }
    }

    const commEntry: ILeadCommunication = {
      _id: new mongoose.Types.ObjectId(),
      type: params.type,
      summary: params.summary,
      details: params.details,
      outcome: params.outcome,
      durationMinutes: params.durationMinutes,
      performedBy: new mongoose.Types.ObjectId(params.userId),
      performedByName: params.userEmail,
      timestamp: now,
    };

    lead.communications.push(commEntry);
    await lead.save();

    return lead;
  }

  /**
   * 6. QUOTE INTEGRATION FROM LEAD
   * Generates or associates a formal Quotation directly with the Lead.
   */
  static async attachQuote(params: {
    leadId: string;
    quoteId: string;
    quoteNumber: string;
    totalAmount: number;
    userId: string;
    userEmail: string;
  }): Promise<ILead> {
    await connectDB();

    const lead = await LeadModel.findById(params.leadId);
    if (!lead) throw new Error("Lead not found");

    const quoteObjId = new mongoose.Types.ObjectId(params.quoteId);
    if (!lead.quoteIds.some((q) => q.toString() === params.quoteId)) {
      lead.quoteIds.push(quoteObjId);
    }

    // Auto-advance status to QUOTE_SENT
    if (["NEW", "CONTACTED", "CONNECTED", "FOLLOW_UP", "QUALIFIED"].includes(lead.status)) {
      lead.status = "QUOTE_SENT";
    }

    lead.communications.push({
      _id: new mongoose.Types.ObjectId(),
      type: "STATUS_CHANGE",
      summary: `Quotation Attached: ${params.quoteNumber}`,
      details: `Total Amount: ₹${params.totalAmount.toLocaleString("en-IN")}`,
      performedBy: new mongoose.Types.ObjectId(params.userId),
      performedByName: params.userEmail,
      timestamp: new Date(),
    });

    await lead.save();
    return lead;
  }

  /**
   * 7. LEAD CONVERSION PREPARATION & CUSTOMER CREATION
   */
  static async convertLeadToCustomer(params: {
    leadId: string;
    userId: string;
    userEmail: string;
  }): Promise<{ customer: ICustomer; lead: ILead }> {
    await connectDB();

    const lead = await LeadModel.findById(params.leadId);
    if (!lead) throw new Error("Lead not found");

    const cleanEmail = lead.email.toLowerCase().trim();

    // Check if customer profile exists, otherwise create
    let customer = await CustomerModel.findOne({
      $or: [{ phone: lead.phone }, { email: cleanEmail }],
    });

    if (!customer) {
      customer = await CustomerModel.create({
        name: lead.name,
        email: cleanEmail !== "traveller@bemytraveller.com" ? cleanEmail : `customer.${lead.phone}@bemytraveller.com`,
        phone: lead.phone,
        leadId: lead._id,
        assignedAgent: lead.assignedTo || new mongoose.Types.ObjectId(params.userId),
        totalBookings: 0,
        totalSpend: 0,
        currency: "INR",
        tags: [lead.leadType || "TOUR_PACKAGE"],
        isActive: true,
      });
    }

    lead.customerId = customer._id;
    lead.convertedAt = new Date();
    lead.convertedBy = new mongoose.Types.ObjectId(params.userId);
    lead.status = "CONFIRMED";

    lead.communications.push({
      _id: new mongoose.Types.ObjectId(),
      type: "STATUS_CHANGE",
      summary: `🎉 Lead Converted to Customer Profile`,
      details: `Customer ID: ${customer._id}. Ready for Booking Voucher issuance.`,
      performedBy: new mongoose.Types.ObjectId(params.userId),
      performedByName: params.userEmail,
      timestamp: new Date(),
    });

    await lead.save();

    // Notify Operations team
    await NotificationService.notifyDepartment(
      Department.OPERATIONS,
      "🎉 New Booking Handover",
      `Lead ${lead.name} has been confirmed and converted. Ready for operational desk fulfillment.`,
      {
        type: "BOOKING_CONFIRMED",
        link: `/admin/leads?search=${encodeURIComponent(lead.name)}`,
      }
    );

    return { customer, lead };
  }

  /**
   * 8. CONSULTANT DASHBOARD METRICS
   */
  static async getConsultantDashboard(consultantUserId: string) {
    await connectDB();

    const consultantObjId = new mongoose.Types.ObjectId(consultantUserId);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Leads assigned to consultant
    const myLeads = await LeadModel.find({ assignedTo: consultantObjId })
      .sort({ createdAt: -1 })
      .lean();

    const activeLeads = myLeads.filter((l) => !["TRAVEL_COMPLETED", "LOST"].includes(l.status));

    // Follow-ups due today
    const followUpsToday = myLeads.flatMap((l) =>
      (l.followUps || [])
        .filter((f) => !f.completedAt && new Date(f.dueAt) >= startOfToday && new Date(f.dueAt) <= endOfToday)
        .map((f) => ({ ...f, leadId: l._id, leadName: l.name, phone: l.phone }))
    );

    // Overdue follow-ups
    const overdueFollowUps = myLeads.flatMap((l) =>
      (l.followUps || [])
        .filter((f) => !f.completedAt && new Date(f.dueAt) < startOfToday)
        .map((f) => ({ ...f, leadId: l._id, leadName: l.name, phone: l.phone }))
    );

    // SLA urgency: Status NEW, assigned, near breach (less than 15 mins left or breached)
    const urgentSlaLeads = activeLeads.filter(
      (l) => l.status === "NEW" && (!l.firstContactedAt || l.slaStatus === "BREACHED")
    );

    // Stage counts
    const stageCounts: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      FOLLOW_UP: 0,
      QUALIFIED: 0,
      QUOTE_SENT: 0,
      CONFIRMED: 0,
      LOST: 0,
    };

    myLeads.forEach((l) => {
      stageCounts[l.status] = (stageCounts[l.status] || 0) + 1;
    });

    const conversionCount = (stageCounts["CONFIRMED"] || 0) + (stageCounts["BOOKED"] || 0);
    const conversionRate = myLeads.length > 0 ? Math.round((conversionCount / myLeads.length) * 100) : 0;

    return {
      totalAssigned: myLeads.length,
      activeLeadsCount: activeLeads.length,
      conversionRate,
      followUpsTodayCount: followUpsToday.length,
      followUpsToday,
      overdueFollowUpsCount: overdueFollowUps.length,
      overdueFollowUps,
      urgentSlaCount: urgentSlaLeads.length,
      urgentSlaLeads,
      stageCounts,
      recentLeads: activeLeads.slice(0, 10),
    };
  }

  /**
   * 9. SALES MANAGER DASHBOARD METRICS
   */
  static async getSalesManagerDashboard() {
    await connectDB();

    const allLeads = await LeadModel.find()
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const totalLeads = allLeads.length;
    const unassignedLeads = allLeads.filter((l) => !l.assignedTo && l.status === "NEW");

    // SLA metrics
    const breachedLeads = allLeads.filter((l) => l.slaStatus === "BREACHED");
    const metLeads = allLeads.filter((l) => l.slaStatus === "MET");
    const totalWithSlaEvaluated = breachedLeads.length + metLeads.length;
    const slaComplianceRate =
      totalWithSlaEvaluated > 0 ? Math.round((metLeads.length / totalWithSlaEvaluated) * 100) : 100;

    // Stage counts across company
    const stageBreakdown: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      FOLLOW_UP: 0,
      QUALIFIED: 0,
      QUOTE_SENT: 0,
      CONFIRMED: 0,
      LOST: 0,
    };

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {
      TRANSPORTATION: 0,
      HOLIDAY_PACKAGE: 0,
      CUSTOM_ITINERARY: 0,
      HOTEL_STAY: 0,
    };

    allLeads.forEach((l) => {
      stageBreakdown[l.status] = (stageBreakdown[l.status] || 0) + 1;
      const type = (l.leadType || "").toUpperCase();
      if (type === "TRANSPORTATION" || l.tripDetails?.vehicleType) {
        categoryBreakdown.TRANSPORTATION++;
      } else if (type === "CUSTOM_ITINERARY") {
        categoryBreakdown.CUSTOM_ITINERARY++;
      } else if (type === "HOTEL_STAY") {
        categoryBreakdown.HOTEL_STAY++;
      } else {
        categoryBreakdown.HOLIDAY_PACKAGE++;
      }
    });

    // Consultant workload distribution
    const consultantWorkload: Record<string, { id: string; name: string; email: string; activeCount: number; wonCount: number }> = {};

    interface PopulatedAssignee {
      _id: { toString(): string };
      name?: string;
      email?: string;
    }

    allLeads.forEach((l) => {
      const assigned = l.assignedTo as unknown as PopulatedAssignee | undefined;
      if (assigned && assigned._id) {
        const id = assigned._id.toString();
        if (!consultantWorkload[id]) {
          consultantWorkload[id] = {
            id,
            name: assigned.name || "Consultant",
            email: assigned.email || "",
            activeCount: 0,
            wonCount: 0,
          };
        }
        if (!["TRAVEL_COMPLETED", "LOST"].includes(l.status)) {
          consultantWorkload[id].activeCount++;
        }
        if (["CONFIRMED", "BOOKED"].includes(l.status)) {
          consultantWorkload[id].wonCount++;
        }
      }
    });

    // Available staff / consultants for assignment
    const consultants = await UserModel.find({
      status: { $ne: "INACTIVE" },
    })
      .select("_id name email role department")
      .lean();

    return {
      totalLeads,
      unassignedCount: unassignedLeads.length,
      unassignedLeads: unassignedLeads.slice(0, 15),
      slaComplianceRate,
      breachedCount: breachedLeads.length,
      breachedLeads: breachedLeads.slice(0, 10),
      stageBreakdown,
      categoryBreakdown,
      consultantWorkload: Object.values(consultantWorkload),
      consultants: consultants.map((c) => ({
        _id: c._id.toString(),
        name: c.name,
        email: c.email,
        role: c.role,
        department: c.department,
      })),
    };
  }
}
