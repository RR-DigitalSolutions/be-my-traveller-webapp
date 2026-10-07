import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { FinanceOperationsService } from "@/domains/finance/finance.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await FinanceOperationsService.getFinancialOverview();
    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    console.error("[Finance Overview GET Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load financial overview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, paymentId, notes, referenceNumber, paidAt } = body;

    const userId = session.user.id || "admin";
    const userEmail = session.user.email || "admin@bemytraveller.com";

    switch (action) {
      case "APPROVE_SUPPLIER_PAYMENT": {
        const approved = await FinanceOperationsService.approveSupplierPayment({
          paymentId,
          userId,
          userEmail,
          notes,
        });
        return NextResponse.json({
          success: true,
          payable: approved,
          message: "Supplier payable approved successfully",
        });
      }

      case "DISBURSE_SUPPLIER_PAYMENT": {
        if (!referenceNumber) {
          return NextResponse.json(
            { error: "Transaction reference number is required for disbursement" },
            { status: 400 }
          );
        }
        const paid = await FinanceOperationsService.disburseSupplierPayment({
          paymentId,
          referenceNumber,
          paidAt: paidAt ? new Date(paidAt) : undefined,
          userId,
          userEmail,
          notes,
        });
        return NextResponse.json({
          success: true,
          payable: paid,
          message: "Supplier payment marked as disbursed",
        });
      }

      default:
        return NextResponse.json({ error: `Unknown finance action: ${action}` }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("[Finance Action POST Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to process finance action";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
