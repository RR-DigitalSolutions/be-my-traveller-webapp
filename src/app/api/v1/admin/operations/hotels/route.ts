import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { HotelOperationsService } from "@/domains/hotels/hotel-operations.service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";

    const queue = await HotelOperationsService.listHotelOperationsQueue({ status });
    return NextResponse.json({ success: true, queue, total: queue.length });
  } catch (error: unknown) {
    console.error("[Hotel Operations GET Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load hotel queue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
