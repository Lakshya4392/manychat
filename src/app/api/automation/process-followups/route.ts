import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { instagram } from "@/lib/instagram";
import { generateGeminiResponse } from "@/lib/gemini";

export async function GET(req: Request) {
  try {
    const now = new Date();
    
    // 1. Find pending follow-ups
    const followUps = await db.followUp.findMany({
      where: {
        processed: false,
        scheduledAt: { lte: now }
      },
      take: 10 // Process in batches
    });

    console.log(`🤖 Processing ${followUps.length} follow-ups...`);

    for (const followUp of followUps) {
      try {
        // 2. Get Automation & Listener info for context
        const automation = await db.automation.findUnique({
          where: { id: followUp.automationId },
          include: { listener: true }
        });

        if (!automation || !automation.listener) {
          await db.followUp.update({
            where: { id: followUp.id },
            data: { processed: true }
          });
          continue;
        }

        // 3. Generate Follow-up Message using Gemini
        const creator = await db.user.findUnique({
            where: { id: followUp.userId },
            select: { brandContext: true }
        });
        const brandSoul = creator?.brandContext ? `\n\nCREATOR BRAND CONTEXT: ${creator.brandContext}` : "";

        const systemPrompt = `You are an Instagram assistant. You are following up with a user who interacted with us 24 hours ago.
Original Context: ${followUp.context || "No context"}
Creator's Instruction: ${automation.listener.prompt || "Be friendly and check in."}${brandSoul}

Goal: Re-engage the user briefly (under 50 words).
Tone: Casual, helpful, non-spammy.`;

        // Check if there's context or a prompt to follow up on
        if (!followUp.context && !automation.listener.prompt) {
           await db.followUp.update({
            where: { id: followUp.id },
            data: { processed: true }
          });
          continue;
        }

        const followUpMessage = await generateGeminiResponse(
          systemPrompt,
          "Send a friendly follow-up message to this user.",
          []
        );

        // 4. Send DM
        const token = await instagram.getUserToken(followUp.userId);
        if (token) {
          await instagram.sendDM(followUp.senderId, followUpMessage, token);
          console.log(`✅ Follow-up sent to ${followUp.senderId}`);
        }

        // 5. Mark as processed
        await db.followUp.update({
          where: { id: followUp.id },
          data: { processed: true }
        });

      } catch (err) {
        console.error(`Failed to process follow-up ${followUp.id}:`, err);
      }
    }

    return NextResponse.json({ processed: followUps.length });
  } catch (error) {
    console.error("Follow-up processing error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
