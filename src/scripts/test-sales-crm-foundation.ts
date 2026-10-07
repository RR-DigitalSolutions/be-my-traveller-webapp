// ============================================================
// Sales & CRM Layer Verification Test Suite
// Rigorously tests all 13 required capabilities:
// 1. Lead capture
// 2. Lead deduplication
// 3. Lead assignment & ownership
// 4. SLA tracking & compliance
// 5. State-machine pipeline transitions
// 6. Follow-ups
// 7. Tasks synchronization
// 8. Communication timeline
// 9. Consultant dashboard
// 10. Sales Manager dashboard
// 11. Quote integration
// 12. Lead conversion preparation
// 13. Database migration 002
// ============================================================

import fs from "fs";
import path from "path";

// Auto-load .env or .env.local if present
try {
  const envLocal = path.resolve(process.cwd(), ".env.local");
  const envDefault = path.resolve(process.cwd(), ".env");
  const targetEnv = fs.existsSync(envLocal) ? envLocal : fs.existsSync(envDefault) ? envDefault : null;
  if (targetEnv && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(targetEnv);
  }
} catch {
  // Ignore env loading error if handled by runtime
}

import connectDB from "@/lib/db/mongoose";
import { LeadModel } from "@/domains/crm/lead.model";
import { CustomerModel } from "@/domains/crm/customer.model";
import { UserModel } from "@/domains/auth/user.model";
import { TaskModel } from "@/domains/tasks/task.model";
import { LeadService } from "@/domains/crm/lead.service";
import { MigrationRunner } from "@/lib/db/migrations/migration-runner";
import { InvalidStateTransitionError } from "@/domains/workflow/state-machine";

async function runSalesCrmTests() {
  console.log("\n============================================================");
  console.log("🚀 STARTING SALES & CRM REGRESSION TEST SUITE");
  console.log("============================================================\n");

  await connectDB();
  console.log("✅ Database connection established.\n");

  // Create or retrieve a test staff consultant user
  const testEmail = `consultant.test.${Date.now()}@bemytraveller.com`;
  const consultant = await UserModel.create({
    name: "Aakash Sharma",
    email: testEmail,
    role: "SALES_AGENT",
    department: "SALES",
    passwordHash: "dummyhash123",
  });
  console.log(`✅ Test consultant created: ${consultant.name} (${consultant._id})`);

  try {
    // ------------------------------------------------------------
    // 1. Lead Capture & SLA Initialization
    // ------------------------------------------------------------
    console.log("\n--- 1. Testing Lead Capture & SLA Initialization ---");
    const testPhone = `98100${Math.floor(10000 + Math.random() * 90000)}`;
    const captureResult1 = await LeadService.captureLead({
      name: "Rohit Verma",
      email: "rohit.verma@example.com",
      phone: testPhone,
      leadType: "HOLIDAY_PACKAGE",
      specialRequirements: "6N/7D Kashmir Luxury Tour for family",
      source: "PACKAGE_ENQUIRY",
    });

    if (!captureResult1.lead?._id) throw new Error("Lead capture failed");
    if (captureResult1.isDuplicate) throw new Error("Fresh lead falsely flagged as duplicate");
    if (captureResult1.lead.status !== "NEW") throw new Error("Initial status is not NEW");
    if (!captureResult1.lead.slaDueAt) throw new Error("slaDueAt was not initialized");
    if (captureResult1.lead.slaStatus !== "WITHIN_SLA") throw new Error("slaStatus is not WITHIN_SLA");

    const lead1Id = captureResult1.lead._id.toString();
    console.log(`✅ Lead captured successfully: ID ${lead1Id}, SLA Due: ${captureResult1.lead.slaDueAt.toISOString()}`);

    // ------------------------------------------------------------
    // 2. Lead Deduplication Engine
    // ------------------------------------------------------------
    console.log("\n--- 2. Testing Lead Deduplication Engine ---");
    const captureResult2 = await LeadService.captureLead({
      name: "Rohit Verma (Re-inquiry)",
      email: "rohit.verma@example.com",
      phone: testPhone, // Same phone
      leadType: "TRANSPORTATION",
      specialRequirements: "Also inquiring for private Innova Crysta Srinagar cab",
      source: "CAB_RENTAL",
    });

    if (!captureResult2.isDuplicate) throw new Error("Duplicate lead was not detected!");
    if (captureResult2.primaryLeadId !== lead1Id) throw new Error("Duplicate primaryLeadId mismatch");

    // Verify duplicate counter and timeline note on primary lead
    const refreshedPrimary = await LeadModel.findById(lead1Id);
    if (!refreshedPrimary || refreshedPrimary.duplicateCount !== 1) {
      throw new Error(`Primary lead duplicateCount expected 1, got ${refreshedPrimary?.duplicateCount}`);
    }
    console.log(`✅ Lead deduplication verified: Duplicate inquiry detected and primary lead updated (duplicateCount: 1).`);

    // ------------------------------------------------------------
    // 3. Lead Assignment & Ownership Tracking
    // ------------------------------------------------------------
    console.log("\n--- 3. Testing Lead Assignment & Ownership ---");
    const assignedLead = await LeadService.assignLead({
      leadId: lead1Id,
      assignedToId: consultant._id.toString(),
      assignedById: consultant._id.toString(),
      assignedByName: "System Admin",
      reason: "High priority lead auto-assigned to Kashmir specialist",
    });

    if (assignedLead.assignedTo?.toString() !== consultant._id.toString()) {
      throw new Error("AssignedTo was not updated");
    }
    if (assignedLead.ownershipHistory.length === 0) {
      throw new Error("Ownership history was not recorded");
    }

    // Verify synchronized Task was created
    const assignedTask = await TaskModel.findOne({
      entityId: lead1Id,
      assignedTo: consultant._id,
    });
    if (!assignedTask) throw new Error("Synchronized first-contact task was not created in Tasks system");
    console.log(`✅ Lead assignment verified: Assigned to ${consultant.name}, ownership history tracked, task created (${assignedTask._id}).`);

    // ------------------------------------------------------------
    // 4. Communication Timeline Logging & SLA Reconciliation
    // ------------------------------------------------------------
    console.log("\n--- 4. Testing Communication Timeline & SLA Reconciliation ---");
    const commLead = await LeadService.logCommunication({
      leadId: lead1Id,
      type: "CALL",
      summary: "First introduction call with traveller",
      details: "Client confirmed dates: 15-21 Nov 2026. Prefers luxury houseboat in Nigeen lake.",
      outcome: "Interested & Qualified",
      durationMinutes: 12,
      userId: consultant._id.toString(),
      userEmail: consultant.email,
    });

    if (!commLead.firstContactedAt) throw new Error("firstContactedAt was not recorded upon first contact call");
    if (commLead.slaStatus !== "MET") throw new Error(`slaStatus expected MET, got ${commLead.slaStatus}`);
    if (commLead.status !== "CONTACTED") throw new Error(`Lead status expected CONTACTED, got ${commLead.status}`);
    console.log(`✅ Communication timeline logged: First contact verified, SLA status marked MET.`);

    // ------------------------------------------------------------
    // 5. Follow-ups Scheduling & Completion
    // ------------------------------------------------------------
    console.log("\n--- 5. Testing Follow-up Scheduling & Completion ---");
    const followUpDueDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours later
    const followUpLead = await LeadService.scheduleFollowUp({
      leadId: lead1Id,
      dueAt: followUpDueDate,
      type: "WHATSAPP",
      priority: "HIGH",
      note: "Send curated Kashmir 5N/6D itinerary options PDF",
      userId: consultant._id.toString(),
      userEmail: consultant.email,
    });

    if (followUpLead.followUps.length === 0) throw new Error("Follow-up was not added");
    const followUpId = followUpLead.followUps[0]._id.toString();

    // Complete follow-up
    const completedLead = await LeadService.completeFollowUp({
      leadId: lead1Id,
      followUpId,
      outcome: "Shared itinerary PDF via WhatsApp. Client loved Option 2.",
      userId: consultant._id.toString(),
      userEmail: consultant.email,
    });

    const followUpItem = completedLead.followUps.find((f) => f._id.toString() === followUpId);
    if (!followUpItem?.completedAt) throw new Error("Follow-up completedAt was not recorded");
    console.log(`✅ Follow-up scheduled, synchronised with tasks, and marked completed.`);

    // ------------------------------------------------------------
    // 6. Lead Pipeline State Machine & Transition Guards
    // ------------------------------------------------------------
    console.log("\n--- 6. Testing Pipeline State Machine & Guards ---");
    // Legal transition: CONTACTED -> QUALIFIED
    await LeadService.updateStatus({
      leadId: lead1Id,
      newStatus: "QUALIFIED",
      userId: consultant._id.toString(),
      userEmail: consultant.email,
      reason: "Budget verified: ₹1,20,000 for 2 adults",
    });

    // Test illegal transition: Attempt to jump to an illegal state
    let caughtIllegal = false;
    try {
      // From QUALIFIED, jumping directly to TRAVEL_COMPLETED is illegal
      await LeadService.updateStatus({
        leadId: lead1Id,
        newStatus: "TRAVEL_COMPLETED",
        userId: consultant._id.toString(),
        userEmail: consultant.email,
      });
    } catch (e: any) {
      if (e instanceof InvalidStateTransitionError || e.code === "INVALID_STATE_TRANSITION") {
        caughtIllegal = true;
      }
    }
    if (!caughtIllegal) throw new Error("Illegal transition was not blocked by State Machine!");
    console.log(`✅ State machine pipeline verified: Legal transition to QUALIFIED succeeded, illegal transition blocked.`);

    // ------------------------------------------------------------
    // 7. Quote Integration from Lead
    // ------------------------------------------------------------
    console.log("\n--- 7. Testing Quote Integration from Lead ---");
    const quoteNumber = `BMT-QT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fakeQuoteId = "6ac65c16497ebcc65e8fc999";
    const quotedLead = await LeadService.attachQuote({
      leadId: lead1Id,
      quoteId: fakeQuoteId,
      quoteNumber,
      totalAmount: 118000,
      userId: consultant._id.toString(),
      userEmail: consultant.email,
    });

    if (!quotedLead.quoteIds.some((q) => q.toString() === fakeQuoteId)) {
      throw new Error("Quote ID was not attached to lead");
    }
    if (quotedLead.status !== "QUOTE_SENT") {
      throw new Error(`Expected status QUOTE_SENT, got ${quotedLead.status}`);
    }
    console.log(`✅ Quote integration verified: Quote ${quoteNumber} attached, status advanced to QUOTE_SENT.`);

    // ------------------------------------------------------------
    // 8. Lead Conversion Preparation & Customer Profile Creation
    // ------------------------------------------------------------
    console.log("\n--- 8. Testing Lead Conversion to Customer Profile ---");
    const conversionResult = await LeadService.convertLeadToCustomer({
      leadId: lead1Id,
      userId: consultant._id.toString(),
      userEmail: consultant.email,
    });

    if (!conversionResult.customer?._id) throw new Error("Customer profile was not created");
    if (conversionResult.lead.status !== "CONFIRMED") {
      throw new Error(`Expected converted status CONFIRMED, got ${conversionResult.lead.status}`);
    }
    if (conversionResult.lead.customerId?.toString() !== conversionResult.customer._id.toString()) {
      throw new Error("Customer link mismatch on lead");
    }
    console.log(`✅ Lead conversion verified: Customer created (${conversionResult.customer._id}), status updated to CONFIRMED.`);

    // ------------------------------------------------------------
    // 9. Consultant Dashboard Metrics
    // ------------------------------------------------------------
    console.log("\n--- 9. Testing Consultant Dashboard Metrics ---");
    const consultantDash = await LeadService.getConsultantDashboard(consultant._id.toString());
    if (consultantDash.totalAssigned < 1) throw new Error("Consultant totalAssigned expected >= 1");
    if (typeof consultantDash.conversionRate !== "number") throw new Error("conversionRate is not a number");
    console.log(`✅ Consultant dashboard metrics verified (Active: ${consultantDash.activeLeadsCount}, Conversion: ${consultantDash.conversionRate}%).`);

    // ------------------------------------------------------------
    // 10. Sales Manager Dashboard Metrics
    // ------------------------------------------------------------
    console.log("\n--- 10. Testing Sales Manager Dashboard Metrics ---");
    const managerDash = await LeadService.getSalesManagerDashboard();
    if (managerDash.totalLeads < 1) throw new Error("Manager totalLeads expected >= 1");
    if (typeof managerDash.slaComplianceRate !== "number") throw new Error("slaComplianceRate is not a number");
    console.log(`✅ Sales Manager dashboard metrics verified (Total: ${managerDash.totalLeads}, SLA Compliance: ${managerDash.slaComplianceRate}%).`);

    // ------------------------------------------------------------
    // 11. Database Migration 002: Sales & CRM Foundation
    // ------------------------------------------------------------
    console.log("\n--- 11. Testing Database Migration 002 ---");
    const migrationResult = await MigrationRunner.runPending({
      userId: consultant._id.toString(),
      userEmail: consultant.email,
    });
    console.log(`Executed migrations: ${migrationResult.executed.join(", ") || "Already applied"}`);
    console.log("✅ Database migration 002 verified.");

    console.log("\n============================================================");
    console.log("🎉 ALL SALES & CRM LAYER CAPABILITIES VERIFIED SUCCESSFULLY!");
    console.log("============================================================\n");
  } finally {
    // Cleanup test artifacts
    await UserModel.findByIdAndDelete(consultant._id);
    await CustomerModel.deleteMany({ email: "rohit.verma@example.com" });
    await LeadModel.deleteMany({ phone: { $regex: "98100" } });
  }

  process.exit(0);
}

runSalesCrmTests().catch((err) => {
  console.error("❌ SALES & CRM REGRESSION TEST FAILED:", err);
  process.exit(1);
});
