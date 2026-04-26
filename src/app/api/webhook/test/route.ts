import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

/**
 * POST /api/webhook/test
 * Simulates an incoming Instagram DM webhook for testing automations.
 */
export async function POST(req: Request) {
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
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const integration = dbUser.integrations.find((i) => i.name === "INSTAGRAM");
    if (!integration) {
      return NextResponse.json({ error: "Instagram not connected. Go to Integrations page first." }, { status: 400 });
    }

    // Get ALL automations (active or not) for debugging
    const allAutomations = await db.automation.findMany({
      where: { userId: dbUser.id },
      include: {
        keywords: true,
        listener: true,
        trigger: true,
      },
    });

    // Debug info
    const debugInfo = allAutomations.map((a) => ({
      id: a.id,
      name: a.name,
      active: a.active,
      triggers: a.trigger.map((t) => t.type),
      keywords: a.keywords.map((k) => k.word),
      listenerType: a.listener?.listener || "NONE",
      replyMessage: a.listener?.commentReply || "",
    }));

    // Filter active ones
    const activeAutomations = allAutomations.filter((a) => a.active);

    if (activeAutomations.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No active automations found",
        debug: {
          totalAutomations: allAutomations.length,
          automations: debugInfo,
          hint: allAutomations.length > 0 
            ? "You have automations but none are ACTIVE. Toggle the activation switch on." 
            : "No automations exist. Create one first.",
        },
      });
    }

    // Find matching automation by keywords
    const messageLower = message.toLowerCase();
    let matchingAutomation = null;

    for (const automation of activeAutomations) {
      // Check if automation has a DM trigger (MESSAGE type)
      const hasMessageTrigger = automation.trigger.some((t) => t.type === "MESSAGE");
      
      if (!hasMessageTrigger) continue;

      // Check keyword match
      const hasKeywordMatch = automation.keywords.some((kw) =>
        messageLower.includes(kw.word.toLowerCase())
      );

      if (hasKeywordMatch && automation.listener) {
        matchingAutomation = automation;
        break;
      }
    }

    if (!matchingAutomation) {
      const allKeywords = activeAutomations.flatMap((a) => a.keywords.map((k) => k.word));
      const allTriggerTypes = activeAutomations.flatMap((a) => a.trigger.map((t) => t.type));
      
      return NextResponse.json({
        success: false,
        error: "No matching automation found",
        debug: {
          yourMessage: message,
          activeAutomations: activeAutomations.length,
          automations: debugInfo.filter(d => d.active),
          allActiveKeywords: allKeywords,
          allActiveTriggerTypes: allTriggerTypes,
          hint: allKeywords.length === 0 
            ? "Your automations have NO keywords. Add keywords in the builder."
            : !allTriggerTypes.includes("MESSAGE")
            ? "No automation has 'MESSAGE' trigger type. Select 'DM Received' trigger in the builder."
            : `Your keywords are [${allKeywords.join(", ")}]. Your message "${message}" didn't match any of them.`,
        },
      });
    }

    // Determine response
    let response: string;
    if (matchingAutomation.listener?.listener === "SMARTAI") {
      response = "[AI Reply] Would generate AI response using prompt: " + 
        (matchingAutomation.listener.prompt || "No prompt set");
    } else {
      response = matchingAutomation.listener?.commentReply || "Thank you for your message!";
    }

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
