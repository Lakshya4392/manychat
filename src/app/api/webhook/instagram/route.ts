import { NextResponse } from "next/server";
import { instagram } from "@/lib/instagram";
import { automationEngine } from "@/lib/automation-engine";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode") || "";
  const token = searchParams.get("hub.verify_token") || "";
  const challenge = searchParams.get("hub.challenge") || "";

  if (mode && token) {
    const verified = instagram.verifyWebhook(mode, token, challenge);
    if (verified) {
      console.log("WEBHOOK_VERIFIED");
      return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Incoming Instagram webhook:", JSON.stringify(body, null, 2));

    const events = instagram.parseWebhook(body);

    for (const event of events) {
      (async () => {
        try {
          if (event.type === "DM") {
            const result = await automationEngine.processDMEvent({
              senderId: event.senderId,
              senderUsername: event.senderUsername,
              recipientId: event.recipientId,
              message: event.message,
              timestamp: event.timestamp,
              type: "DM",
            });

            if (result.triggered) {
              console.log(`✅ Automation triggered: ${result.automationId} -> ${result.response?.substring(0, 50)}`);
            } else {
              console.log(`❌ No automation triggered: ${result.error}`);
            }
          }
        } catch (error) {
          console.error("Webhook processing error:", error);
        }
      })();
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Webhook parse error:", error);
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }
}
