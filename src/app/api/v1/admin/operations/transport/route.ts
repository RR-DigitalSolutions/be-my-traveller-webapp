import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { TransportOperationsService } from "@/domains/transfers/transport-operations.service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";

    const queue = await TransportOperationsService.listTransportOperationsQueue({ status });
    return NextResponse.json({ success: true, queue, total: queue.length });
  } catch (error: unknown) {
    console.error("[Transport Operations GET Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load transport queue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
