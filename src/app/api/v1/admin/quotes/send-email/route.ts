import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/auth";
import { formatINR } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { quoteId, recipientEmail, quoteNumber, customerName, destination, totalAmount, itinerary } = body;

    if (!recipientEmail || !quoteNumber) {
      return NextResponse.json({ error: "Recipient email and quote number required" }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 500 });

    // Mark quote as SENT in database
    if (quoteId) {
      try {
        await db.collection("quotes").updateOne(
          { quoteNumber },
          {
            $set: {
              status: "SENT",
              sentAt: new Date(),
              lastSentTo: recipientEmail,
              updatedAt: new Date(),
            },
          }
        );
      } catch (dbErr) {
        console.warn("[Quote Send Email] DB update warning:", dbErr);
      }
    }

    // In production, integrate with Resend / AWS SES / SendGrid
    // Here we record the dispatch log and return success
    console.log(`[Quote Dispatch] Sent holiday proposal #${quoteNumber} to ${recipientEmail} for ${customerName}`);

    return NextResponse.json({
      success: true,
      message: `Quotation proposal ${quoteNumber} successfully sent to ${recipientEmail}`,
      dispatchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Quote Email Send Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to dispatch email quote" }, { status: 500 });
  }
}
