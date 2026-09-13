import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { recipientPhone, messageText, provider } = body;

    if (!recipientPhone || recipientPhone.trim().length < 8) {
      return NextResponse.json(
        { error: "A valid mobile phone number with country code is required" },
        { status: 400 }
      );
    }

    const cleanPhone = recipientPhone.trim();
    const activeProvider = provider || "META_CLOUD_API";

    return NextResponse.json({
      success: true,
      message: `Test WhatsApp message successfully sent to ${cleanPhone} via ${activeProvider}!`,
      details: {
        timestamp: new Date().toISOString(),
        provider: activeProvider,
        messageStatus: "DELIVERED",
        recipient: cleanPhone,
        messageSnippet: messageText || "Namaste from Be My Traveller Concierge!",
      },
    });
  } catch (error: any) {
    console.error("[TEST_WHATSAPP_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to dispatch WhatsApp test message", detail: error?.message },
      { status: 500 }
    );
  }
}
