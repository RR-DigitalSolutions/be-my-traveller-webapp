// ============================================================
// Migration 002: Sales & CRM Foundation
// Builds compound indexes for Leads (SLA, deduplication, follow-ups,
// ownership) and Customer records.
// Non-destructive: Does NOT alter or delete any document data.
// ============================================================

import connectDB from "@/lib/db/mongoose";
import { LeadModel } from "@/domains/crm/lead.model";
import { CustomerModel } from "@/domains/crm/customer.model";

export const migration002 = {
  id: "002_sales_crm_foundation",
  name: "Sales & CRM Foundation Indexes",
  async up(): Promise<void> {
    await connectDB();

    // Ensure compound indexes for Leads
    await LeadModel.syncIndexes();

    // Ensure compound indexes for Customers
    await CustomerModel.syncIndexes();
  },
  async down(): Promise<void> {
    // No-op: Index removal not required for safe rollback
  },
};
