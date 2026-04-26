import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

/**
 * POST /api/webhook/test
 * 
 * Simulates an incoming Instagram DM webhook for testing automations.
 * Tests keyword matching and response generation WITHOUT sending real DMs.
 * Only works in development mode with authenticated users.
 * 
 * Body: {
 *   message: string;           // The DM message to simulate
 *   senderUsername?: string;    // Optional sender name
 * }
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Test endpoint disabled in production" }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const message = body.message || "hello";
    const senderUsername = body.senderUsername || "test_user";

    // Find the user's DB record
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: { integrations: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const integration = dbUser.integrations.find((i) => i.name === "INSTAGRAM");
    if (!integration) {
      return NextResponse.json({ error: "Instagram not connected. Go to Integrations page first." }, { status: 400 });
    }

    console.log(`\n[Test] 🧪 Simulating DM: "${message}" from @${senderUsername}`);

    // Get user's active automations with all relations
    const automations = await db.automation.findMany({
      where: {
        userId: dbUser.id,
        active: true,
      },
      include: {
        keywords: true,
        listener: true,
        trigger: true,
      },
    });

    if (automations.length === 0) {
      console.log("[Test] ❌ No active automations found");
      return NextResponse.json({
        success: true,
        result: { triggered: false, error: "No active automations. Activate an automation first." },
      });
    }

    console.log(`[Test] Found ${automations.length} active automation(s)`);

    // Find matching automation by keywords
    const messageLower = message.toLowerCase();
    let matchingAutomation = null;

    for (const automation of automations) {
      const hasMessageTrigger = automation.trigger.some((t) => t.type === "MESSAGE");
      if (!hasMessageTrigger) continue;

      const hasKeywordMatch = automation.keywords.some((kw) =>
        messageLower.includes(kw.word.toLowerCase())
      );

      if (hasKeywordMatch && automation.listener) {
        matchingAutomation = automation;
        break;
      }
    }

    if (!matchingAutomation) {
      const allKeywords = automations.flatMap((a) => a.keywords.map((k) => k.word));
      console.log(`[Test] ❌ No keyword match. Active keywords: [${allKeywords.join(", ")}]`);
      return NextResponse.json({
        success: true,
        result: {
          triggered: false,
          error: `No keyword match. Your active keywords are: [${allKeywords.join(", ")}]. Your message "${message}" didn't contain any of them.`,
        },
      });
    }

    console.log(`[Test] ✅ Matched automation: "${matchingAutomation.name}"`);

    // Determine response (don't actually send via Instagram API)
    let response: string;

    if (matchingAutomation.listener?.listener === "SMARTAI") {
      if (!process.env.OPENAI_API_KEY) {
        response = "[AI Reply - OPENAI_API_KEY not configured] Would generate AI response using prompt: " + 
          (matchingAutomation.listener.prompt || "No prompt set");
      } else {
        // Would use AI, but for test just show what it would do
        response = "[AI Reply] Would generate AI response using prompt: " + 
          (matchingAutomation.listener.prompt || "No prompt set");
      }
    } else {
      response = matchingAutomation.listener?.commentReply || "Thank you for your message!";
    }

    console.log(`[Test] 💬 Response: "${response}"`);
    console.log(`[Test] ✅ Test complete — automation would fire successfully!\n`);

    // Log test DM to database
    await db.dms.create({
      data: {
        automationId: matchingAutomation.id,
        senderId: "test_sender",
        senderUsername: senderUsername,
        reciever: "test_bot",
        message: message,
        messageType: "DM",
        automationResponse: response,
        isFromBot: true,
      },
    });

    return NextResponse.json({
      success: true,
      result: {
        triggered: true,
        automationId: matchingAutomation.id,
        automationName: matchingAutomation.name,
        response,
        matchedKeywords: matchingAutomation.keywords
          .filter((kw) => messageLower.includes(kw.word.toLowerCase()))
          .map((k) => k.word),
      },
    });
  } catch (error) {
    console.error("[Test] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Test failed" },
      { status: 500 }
    );
  }
}
