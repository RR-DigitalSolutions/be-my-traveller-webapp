// ============================================================
// Sales & CRM Dashboard Metrics API
// Supports role-based metrics for Consultant and Sales Manager
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { LeadService } from "@/domains/crm/lead.service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "consultant";

    if (type === "manager") {
      const data = await LeadService.getSalesManagerDashboard();
      return NextResponse.json({ success: true, data });
    }

    // Default: Consultant view for logged-in user
    const consultantUserId = session.user.id;
    if (!consultantUserId) {
      return NextResponse.json({ error: "User identity missing" }, { status: 400 });
    }

    const data = await LeadService.getConsultantDashboard(consultantUserId);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("[LEADS_DASHBOARD_API_ERROR]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to load dashboard metrics", detail: message },
      { status: 500 }
    );
  }
}
