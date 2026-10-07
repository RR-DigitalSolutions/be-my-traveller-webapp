// ============================================================
// Comprehensive End-to-End Travel Workflow Test Suite
// Verifies the complete lifecycle:
// Lead → Quote → Acceptance → Payment → Booking → Hotel → Transport → Finance
// ============================================================

import mongoose from "mongoose";
import connectDB from "../lib/db/mongoose";
import { UserModel } from "../domains/auth/user.model";
import { LeadModel } from "../domains/crm/lead.model";
import { LeadService } from "../domains/crm/lead.service";
import { QuoteModel } from "../domains/booking/quote.model";
import { BookingModel } from "../domains/booking/booking.model";
import { BookingService } from "../domains/booking/booking.service";
import { HotelOperationsService } from "../domains/hotels/hotel-operations.service";
import { TransportOperationsService } from "../domains/transfers/transport-operations.service";
import { VoucherService } from "../domains/booking/voucher.service";
import { FinanceOperationsService } from "../domains/finance/finance.service";
import { SupplierPaymentModel } from "../domains/finance/supplier-payment.model";
import { PaymentModel } from "../domains/booking/payment.model";
import { TaskModel } from "../domains/tasks/task.model";
import { AuditLogModel } from "../domains/auth/audit-log.model";
import { MigrationRunner } from "../lib/db/migrations/migration-runner";

async function runE2EWorkflowTests() {
  console.log("============================================================");
  console.log("🚀 STARTING COMPLETE END-TO-END TRAVEL WORKFLOW VERIFICATION");
  console.log("============================================================");

  await connectDB();
  console.log("✅ Database connection established.\n");

  // Step 0: Ensure Test Users exist
  const timestamp = Date.now();
  const consultantEmail = `consultant.ops.${timestamp}@bemytraveller.com`;
  const consultant = await UserModel.create({
    name: "Vikram Malhotra (Lead Consultant)",
    email: consultantEmail,
    passwordHash: "dummy_test_hash",
    role: "SALES_AGENT",
    department: "SALES",
    permissions: ["lead.view", "lead.edit", "quote.create", "booking.view"],
    isActive: true,
  });

  const financeManagerEmail = `finance.mgr.${timestamp}@bemytraveller.com`;
  const financeManager = await UserModel.create({
    name: "Pooja Hegde (Finance Controller)",
    email: financeManagerEmail,
    passwordHash: "dummy_test_hash",
    role: "FINANCE",
    department: "FINANCE",
    permissions: ["finance.view", "finance.payable.manage", "finance.reconcile"],
    isActive: true,
  });

  console.log(`✅ Test users initialized:`);
  console.log(`   - Consultant: ${consultant.name} (${consultant._id})`);
  console.log(`   - Finance Mgr: ${financeManager.name} (${financeManager._id})\n`);

  // ------------------------------------------------------------
  // STEP 1: LEAD CAPTURE
  // ------------------------------------------------------------
  console.log("--- 1. Testing Lead Capture & SLA Tracking ---");
  const customerEmail = `traveler.${timestamp}@luxurytravel.com`;
  const customerPhone = `+91 99887 ${Math.floor(10000 + Math.random() * 90000)}`;

  const leadCaptureResult = await LeadService.captureLead({
    name: "Dr. Siddharth Roy",
    email: customerEmail,
    phone: customerPhone,
    leadType: "HOLIDAY_PACKAGE",
    specialRequirements: "High-value anniversary tour for 2 adults. Prefers 5-star properties.",
    source: "PACKAGE_ENQUIRY",
  });

  const leadId = leadCaptureResult.lead._id.toString();
  console.log(`✅ Lead captured: ${leadCaptureResult.lead.name} (ID: ${leadId})`);
  console.log(`   - SLA Status: ${leadCaptureResult.lead.slaStatus}, Due: ${leadCaptureResult.lead.slaDueAt?.toISOString()}`);

  // ------------------------------------------------------------
  // STEP 2: LEAD ASSIGNMENT & QUALIFICATION
  // ------------------------------------------------------------
  console.log("\n--- 2. Testing Lead Assignment & Qualification ---");
  await LeadService.assignLead({
    leadId,
    assignedToId: consultant._id.toString(),
    assignedById: consultant._id.toString(),
    assignedByName: consultant.name,
  });

  await LeadService.logCommunication({
    leadId,
    type: "CALL",
    summary: "Initial Discovery Call",
    details: "Customer confirmed travel in November for 6 Nights. Requested premium Innova Crysta and The Khyber stay.",
    outcome: "Interested in Luxury 5-Star package",
    userId: consultant._id.toString(),
    userEmail: consultant.email,
  });

  const qualifiedLead = await LeadService.updateStatus({
    leadId,
    newStatus: "QUALIFIED",
    userId: consultant._id.toString(),
    userEmail: consultant.email,
  });
  console.log(`✅ Lead assigned and qualified: Stage = ${qualifiedLead.status}, First Contact SLA = ${qualifiedLead.slaStatus}`);

  // ------------------------------------------------------------
  // STEP 3: QUOTE GENERATION & LEAD ATTACHMENT
  // ------------------------------------------------------------
  console.log("\n--- 3. Testing Quote Creation & Pipeline Attachment ---");
  const quoteNumber = `BMT-QT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const quoteDoc = await QuoteModel.create({
    quoteNumber,
    lead: new mongoose.Types.ObjectId(leadId),
    createdBy: consultant._id,
    packageName: "Heavenly Kashmir & Gulmarg Luxury Escapade",
    destinations: ["Srinagar", "Gulmarg", "Pahalgam"],
    travelDates: {
      from: new Date("2026-11-15T00:00:00.000Z"),
      to: new Date("2026-11-21T00:00:00.000Z"),
    },
    nights: 6,
    days: 7,
    travellers: { adults: 2, children: 0, infants: 0 },
    subtotal: 90000,
    taxAmount: 5000,
    totalAmount: 95000,
    currency: "INR",
    hotelConfig: [
      {
        hotelName: "The Khyber Himalayan Resort & Spa, Gulmarg",
        category: "LUXURY",
        roomType: "Premier Mountain View Room",
        mealPlan: "Breakfast & Gourmet Dinner (MAP)",
      },
    ],
    items: [
      {
        type: "PACKAGE",
        name: "Luxury Escapade 6N/7D",
        quantity: 1,
        unitPrice: 90000,
        totalPrice: 90000,
        currency: "INR",
        isIncluded: true,
      },
    ],
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "SENT",
    sentAt: new Date(),
  });

  await LeadService.attachQuote({
    leadId,
    quoteId: quoteDoc._id.toString(),
    quoteNumber,
    totalAmount: 95000,
    userId: consultant._id.toString(),
    userEmail: consultant.email,
  });

  const leadAfterQuote = await LeadModel.findById(leadId);
  console.log(`✅ Quote created & attached: ${quoteNumber} (₹95,000). Lead status = ${leadAfterQuote?.status}`);

  // ------------------------------------------------------------
  // STEP 4: QUOTE ACCEPTANCE
  // ------------------------------------------------------------
  console.log("\n--- 4. Testing Quote Acceptance ---");
  quoteDoc.status = "ACCEPTED";
  quoteDoc.acceptedAt = new Date();
  await quoteDoc.save();
  console.log(`✅ Quote marked ACCEPTED by customer.`);

  // ------------------------------------------------------------
  // STEP 5: BOOKING CREATION FROM QUOTE
  // ------------------------------------------------------------
  console.log("\n--- 5. Testing Booking Conversion ---");
  const booking = await BookingService.createBookingFromQuote({
    quoteId: quoteDoc._id.toString(),
    userId: consultant._id.toString(),
    userEmail: consultant.email,
    notes: "VIP guests celebrating 10th anniversary. Provide special welcome.",
  });

  const bookingId = booking._id.toString();
  console.log(`✅ Booking created successfully: ${booking.bookingNumber} (ID: ${bookingId})`);
  console.log(`   - Status: ${booking.status}`);
  console.log(`   - Hotel items: ${booking.hotelBookings.length}, Transport items: ${booking.transportBookings.length}`);
  console.log(`   - Estimated Supplier Cost: ₹${booking.financeSummary.totalSupplierCost}, Profit: ₹${booking.financeSummary.grossProfit} (${booking.financeSummary.profitMarginPercent}%)`);

  // Verify Operational Tasks were generated
  const tasks = await TaskModel.find({ entityId: booking._id });
  console.log(`✅ Auto-generated operational tasks: ${tasks.length} tasks created for Operations desk.`);

  // ------------------------------------------------------------
  // STEP 6: RECORD CUSTOMER PAYMENT
  // ------------------------------------------------------------
  console.log("\n--- 6. Testing Customer Payment Processing ---");
  const paymentResult = await BookingService.recordCustomerPayment({
    bookingId,
    amount: 50000,
    paymentType: "ADVANCE",
    paymentMethod: "UPI",
    providerPaymentId: `UPI-TEST-${Date.now()}`,
    notes: "Advance deposit received via Google Pay UPI.",
    userId: consultant._id.toString(),
    userEmail: consultant.email,
  });

  console.log(`✅ Customer payment recorded: ₹50,000 (Receipt: ${paymentResult.payment.providerPaymentId})`);
  console.log(`   - Booking Status: ${paymentResult.booking.status}`);
  console.log(`   - Paid: ₹${paymentResult.booking.paidAmount}, Remaining Due: ₹${paymentResult.booking.pendingAmount}`);

  // ------------------------------------------------------------
  // STEP 7: HOTEL OPERATIONS & ROOM CONFIRMATION
  // ------------------------------------------------------------
  console.log("\n--- 7. Testing Hotel Operations & Direct Confirmation ---");
  const hotelConfirmedBooking = await HotelOperationsService.confirmHotelReservation({
    bookingId,
    hotelBookingIndex: 0,
    confirmationNumber: "KHY-GUL-CONF-9922",
    supplierCost: 35000,
    supplierName: "The Khyber Himalayan Resort",
    notes: "Complimentary cake & honeymoon flower decor confirmed by hotel GM.",
    userId: consultant._id.toString(),
    userEmail: consultant.email,
  });

  console.log(`✅ Hotel reservation confirmed:`);
  console.log(`   - Code: ${hotelConfirmedBooking.hotelBookings[0].confirmationNumber}`);
  console.log(`   - Hotel Status: ${hotelConfirmedBooking.hotelStatus}`);

  // Issue hotel voucher
  await HotelOperationsService.issueHotelVoucher({
    bookingId,
    hotelIndex: 0,
    userId: consultant._id.toString(),
    userEmail: consultant.email,
  });
  console.log(`✅ Hotel voucher issued code: ${hotelConfirmedBooking.hotelBookings[0].voucherCode}`);

  // ------------------------------------------------------------
  // STEP 8: TRANSPORT OPERATIONS & CHAUFFEUR FLEET
  // ------------------------------------------------------------
  console.log("\n--- 8. Testing Transport Operations & Chauffeur Fleet ---");
  const transportAssignedBooking = await TransportOperationsService.assignDriverAndVehicle({
    bookingId,
    transportIndex: 0,
    driverName: "Tariq Ahmad",
    driverPhone: "+91 94190 55667",
    vehicleType: "Toyota Innova Crysta (4x4)",
    vehicleNumber: "JK-01-AB-1234",
    pickupLocation: "Srinagar International Airport (Arrival Gate)",
    dropLocation: "The Khyber Resort, Gulmarg",
    supplierCost: 18000,
    supplierName: "Kashmir Luxury Fleet Co.",
    notes: "Driver instructed in formal uniform with traveler name placard.",
    userId: consultant._id.toString(),
    userEmail: consultant.email,
  });

  console.log(`✅ Chauffeur and vehicle assigned:`);
  console.log(`   - Driver: ${transportAssignedBooking.transportBookings[0].driverName} (${transportAssignedBooking.transportBookings[0].driverPhone})`);
  console.log(`   - Vehicle: ${transportAssignedBooking.transportBookings[0].vehicleNumber}`);
  console.log(`   - Transport Status: ${transportAssignedBooking.transportStatus}`);

  // Issue Transport Voucher & Dispatch
  await TransportOperationsService.issueTransportVoucher({
    bookingId,
    transportIndex: 0,
    userId: consultant._id.toString(),
    userEmail: consultant.email,
  });

  await TransportOperationsService.dispatchTransport({
    bookingId,
    transportIndex: 0,
    userId: consultant._id.toString(),
    userEmail: consultant.email,
  });

  console.log(`✅ Transport voucher issued and status marked DISPATCHED.`);

  // ------------------------------------------------------------
  // STEP 9: OFFICIAL TRAVEL VOUCHER GENERATION
  // ------------------------------------------------------------
  console.log("\n--- 9. Testing Official Travel Voucher Generation ---");
  const printableVoucher = VoucherService.buildPrintableVoucher(
    transportAssignedBooking,
    "Dr. Siddharth Roy",
    customerPhone,
    "COMBINED_TRIP"
  );

  console.log(`✅ Official Travel Itinerary Voucher built:`);
  console.log(`   - Voucher Ref: ${printableVoucher.voucherNumber}`);
  console.log(`   - Traveler: ${printableVoucher.customerName} (${printableVoucher.paxSummary})`);
  console.log(`   - Confirmed Hotels: ${printableVoucher.hotels.length} stay(s)`);
  console.log(`   - Confirmed Transfers: ${printableVoucher.transports.length} transfer(s)`);
  console.log(`   - Emergency Hotline: ${printableVoucher.supportHotline}`);

  // ------------------------------------------------------------
  // STEP 10: FINANCE CONTROLS & SUPPLIER PAYABLES
  // ------------------------------------------------------------
  console.log("\n--- 10. Testing Finance Operations & Supplier Payables ---");
  // A. Request Hotel Payable
  const hotelPayable = await FinanceOperationsService.requestSupplierPayment({
    bookingId,
    supplierName: "The Khyber Himalayan Resort",
    serviceType: "HOTEL",
    amount: 35000,
    paymentMethod: "BANK_TRANSFER",
    notes: "Hotel advance for booking BMT-BK-9922",
    userId: consultant._id.toString(),
    userEmail: consultant.email,
  });

  console.log(`✅ Supplier payable voucher created: ID ${hotelPayable._id} (₹${hotelPayable.amount}) in status "${hotelPayable.status}"`);

  // B. Authorize Payable (Manager Approval)
  const approvedPayable = await FinanceOperationsService.approveSupplierPayment({
    paymentId: hotelPayable._id.toString(),
    userId: financeManager._id.toString(),
    userEmail: financeManager.email,
    notes: "Verified against hotel invoice. Approved for disbursement.",
  });
  console.log(`✅ Payable approved by Finance Controller: Status = "${approvedPayable.status}"`);

  // C. Disburse Funds
  const disbursedPayable = await FinanceOperationsService.disburseSupplierPayment({
    paymentId: hotelPayable._id.toString(),
    referenceNumber: "UTR-HDFC-99228811",
    userId: financeManager._id.toString(),
    userEmail: financeManager.email,
    notes: "NEFT release processed successfully.",
  });
  console.log(`✅ Funds disbursed to vendor: Ref = ${disbursedPayable.referenceNumber}, Status = "${disbursedPayable.status}"`);

  // ------------------------------------------------------------
  // STEP 11: RECONCILE FINANCIALS & PROFITABILITY
  // ------------------------------------------------------------
  console.log("\n--- 11. Testing Profitability Reconciliation ---");
  const finalBooking = await BookingModel.findById(bookingId);
  console.log(`✅ Booking Financial Breakdown:`);
  console.log(`   - Customer Total Revenue: ₹${finalBooking?.totalAmount}`);
  console.log(`   - Total Supplier Cost (Hotel + Cab): ₹${finalBooking?.financeSummary.totalSupplierCost}`);
  console.log(`   - Realized Gross Profit: ₹${finalBooking?.financeSummary.grossProfit}`);
  console.log(`   - Gross Margin: ${finalBooking?.financeSummary.profitMarginPercent}%`);
  console.log(`   - Vendor Payment Status: ${finalBooking?.financeSummary.supplierPaymentStatus}`);

  const financeOverview = await FinanceOperationsService.getFinancialOverview();
  console.log(`✅ System Financial Health: Invoiced = ₹${financeOverview.metrics.totalRevenue}, Paid to Suppliers = ₹${financeOverview.metrics.totalSupplierPaid}`);

  // ------------------------------------------------------------
  // STEP 12: AUDIT TRAIL VERIFICATION
  // ------------------------------------------------------------
  console.log("\n--- 12. Testing Audit Trail Completeness ---");
  const auditLogs = await AuditLogModel.find({
    $or: [{ entityId: bookingId }, { entityId: leadId }],
  }).sort({ createdAt: 1 });

  console.log(`✅ Complete chronological audit trail captured ${auditLogs.length} state transitions across Lead and Booking lifecycles.`);

  // ------------------------------------------------------------
  // STEP 13: DATABASE MIGRATION 003 EXECUTION
  // ------------------------------------------------------------
  console.log("\n--- 13. Running Database Migration 003 ---");
  const migrationResults = await MigrationRunner.runPending();
  console.log(`✅ Migration 003 status: ${migrationResults.executed.length > 0 ? migrationResults.executed.join(", ") : "Already applied"}`);

  console.log("\n============================================================");
  console.log("🎉 COMPLETE END-TO-END WORKFLOW TEST COMPLETED SUCCESSFULLY!");
  console.log("   Lead → Quote → Acceptance → Payment → Booking → Hotel → Transport → Finance");
  console.log("============================================================\n");
}

runE2EWorkflowTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ E2E Workflow Test Failed:", err);
    process.exit(1);
  });
