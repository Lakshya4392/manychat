/**
 * Automation Execution Engine
 * Processes incoming Instagram events and triggers automations
 */

import { db } from "@/lib/db";
import { instagram, InstagramDM } from "@/lib/instagram";
import openai, { MessageContext } from "@/lib/openai";

interface Keyword {
  id: string;
  word: string;
}

interface TriggerRelations {
  id: string;
  type: string; // TRIGGER_TYPE enum stored as string
}

interface Listener {
  id: string;
  listener: "SMARTAI" | "MESSAGE";
  prompt?: string | null;
  commentReply?: string | null;
  welcomeMessage?: string | null;
  dmCount: number;
  commentCount: number;
}

interface AutomationWithRelations {
  id: string;
  name: string;
  active: boolean;
  userId: string;
  keywords: Keyword[];
  listener: Listener | null;
  trigger: TriggerRelations[];
}

export class AutomationEngine {
  /**
   * Process incoming DM event
   */
  async processDMEvent(dm: InstagramDM): Promise<{
    triggered: boolean;
    automationId?: string;
    response?: string;
    error?: string;
  }> {
    // 1. Find user by Instagram ID (the recipient business account)
    let integration = await db.integrations.findUnique({
      where: { instagramId: dm.recipientId },
    });

    // Fallback: If no match by ID, try to find any Instagram integration
    // This handles cases where Instagram ID wasn't auto-detected during OAuth
    if (!integration) {
      integration = await db.integrations.findFirst({
        where: { 
          name: "INSTAGRAM",
          token: { not: "" },
        },
      });
    }

    if (!integration) {
      return { triggered: false, error: "No Instagram integration found" };
    }

    // 2. Get user's active automations
    const automations = (await db.automation.findMany({
      where: {
        userId: integration.userId,
        active: true,
      },
      include: {
        keywords: true,
        listener: true,
        trigger: true,
      },
    })) as unknown as AutomationWithRelations[];

    if (automations.length === 0) {
      return { triggered: false, error: "No active automations" };
    }

    // 3. Find matching automation
    const matchingAutomation = this.findMatchingAutomation(automations, dm);

    if (!matchingAutomation) {
      return { triggered: false, error: "No keyword match" };
    }

    // 4. Check if MESSAGE trigger exists
    const hasMessageTrigger = matchingAutomation.trigger.some(
      (t) => t.type === "MESSAGE"
    );
    if (!hasMessageTrigger) {
      return { triggered: false, error: "MESSAGE trigger not configured" };
    }

    // 5. Execute action
    let response: string;

    try {
      if (matchingAutomation.listener?.listener === "SMARTAI") {
        response = await this.generateAIResponse(
          matchingAutomation.listener.prompt || "",
          dm.message,
          matchingAutomation.userId
        );
        await this.incrementAIUsage(matchingAutomation.userId);
      } else {
        response =
          matchingAutomation.listener?.commentReply ||
          "Thank you for your message!";
      }

      // 6. Send response via Instagram API
      const token = await instagram.getUserToken(matchingAutomation.userId);
      if (!token) {
        throw new Error("No Instagram token found");
      }

      await instagram.sendDM(dm.senderId, response, token);

      // 7. Log DM to database
      await this.logDM(dm, matchingAutomation.id, response);

      // 8. Update listener stats
      if (matchingAutomation.listener) {
        await db.listener.update({
          where: { id: matchingAutomation.listener.id },
          data: { dmCount: { increment: 1 } },
        });
      }

      // 9. Increment DM usage
      await this.incrementDMUsage(matchingAutomation.userId);

      return {
        triggered: true,
        automationId: matchingAutomation.id,
        response,
      };
    } catch (error) {
      console.error("Automation execution error:", error);
      return {
        triggered: false,
        error: error instanceof Error ? error.message : "Execution failed",
      };
    }
  }

  /**
   * Process comment event
   */
  async processCommentEvent(comment: {
    mediaId: string;
    commentId: string;
    senderId: string;
    senderUsername: string;
    text: string;
  }): Promise<{
    triggered: boolean;
    automationId?: string;
    response?: string;
    error?: string;
  }> {
    const integration = await db.integrations.findUnique({
      where: { instagramId: comment.senderId },
    });

    if (!integration) return { triggered: false, error: "User not found" };

    const automations = (await db.automation.findMany({
      where: { userId: integration.userId, active: true },
      include: { keywords: true, listener: true, trigger: true },
    })) as unknown as AutomationWithRelations[];

    const matchingAutomation = this.findMatchingAutomation(automations, {
      type: "COMMENT",
      message: comment.text,
    });

    if (!matchingAutomation) return { triggered: false, error: "No match" };

    const hasCommentTrigger = matchingAutomation.trigger.some(
      (t) => t.type === "COMMENT"
    );
    if (!hasCommentTrigger)
      return { triggered: false, error: "COMMENT trigger not set" };

    try {
      const reply =
        matchingAutomation.listener?.commentReply || "Thanks for your comment!";

      const token = await instagram.getUserToken(matchingAutomation.userId);
      if (!token) throw new Error("No token");

      await instagram.replyToComment(
        comment.mediaId,
        comment.commentId,
        reply,
        token
      );

      await db.dms.create({
        data: {
          automationId: matchingAutomation.id,
          senderId: comment.senderId,
          senderUsername: comment.senderUsername,
          reciever: comment.senderUsername,
          message: comment.text,
          messageType: "COMMENT",
          automationResponse: reply,
          isFromBot: true,
        },
      });

      await db.listener.update({
        where: { id: matchingAutomation.listener!.id },
        data: { commentCount: { increment: 1 } },
      });

      await this.incrementDMUsage(matchingAutomation.userId);

      return {
        triggered: true,
        automationId: matchingAutomation.id,
        response: reply,
      };
    } catch (error) {
      console.error("Comment reply error:", error);
      return {
        triggered: false,
        error: error instanceof Error ? error.message : "Failed",
      };
    }
  }

  /**
   * Find automation that matches the message keywords
   */
  private findMatchingAutomation(
    automations: AutomationWithRelations[],
    dm: { message: string; type: string }
  ): AutomationWithRelations | null {
    const messageLower = dm.message.toLowerCase();

    for (const automation of automations) {
      const hasKeywordMatch = automation.keywords.some((kw) =>
        messageLower.includes(kw.word.toLowerCase())
      );

      if (hasKeywordMatch && automation.listener) {
        return automation;
      }
    }

    return null;
  }

  /**
   * Generate AI response using OpenAI
   */
  private async generateAIResponse(
    prompt: string,
    userMessage: string,
    userId: string
  ): Promise<string> {
    const recentHistory = await this.getConversationHistory(userId, 5);

    const messages: MessageContext[] = [
      {
        role: "system",
        content: `You are an Instagram DM assistant. ${prompt}\n\nRespond briefly (under 100 words), casual tone.`,
      },
      ...recentHistory,
      { role: "user", content: userMessage },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
        max_tokens: 150,
        temperature: 0.7,
      });

      return (
        completion.choices[0]?.message?.content ||
        "I'm here to help! How can I assist you?"
      );
    } catch (error) {
      console.error("OpenAI error:", error);
      return "Thanks for your message! I'll get back to you soon.";
    }
  }

  /**
   * Get conversation history
   */
  private async getConversationHistory(
    userId: string,
    limit: number
  ): Promise<MessageContext[]> {
    // Get all automations for this user to filter DMs
    const userAutomations = await db.automation.findMany({
      where: { userId },
      select: { id: true },
    });

    const automationIds = userAutomations.map((a) => a.id);

    if (automationIds.length === 0) return [];

    const messages = await db.dms.findMany({
      where: { 
        automationId: {
          in: automationIds
        },
        isFromBot: false
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const history: MessageContext[] = messages.map((msg) => ({
      role: msg.isFromBot ? "assistant" : "user",
      content: msg.message || "",
    }));

    return history.reverse();
  }

  /**
   * Log DM to database
   */
  private async logDM(
    dm: InstagramDM,
    automationId: string,
    response: string
  ): Promise<void> {
    await db.dms.create({
      data: {
        automationId,
        senderId: dm.senderId,
        senderUsername: dm.senderUsername,
        reciever: dm.senderUsername,
        message: dm.message,
        messageType: dm.type,
        automationResponse: response,
        isFromBot: true,
      },
    });
  }

  /**
   * Increment DM usage counter
   */
  private async incrementDMUsage(userId: string): Promise<void> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    await db.usage.upsert({
      where: { userId_month: { userId, month: currentMonth } },
      update: { dmSent: { increment: 1 } },
      create: {
        userId,
        month: currentMonth,
        dmSent: 1,
        aiTokensUsed: 0,
        automations: 0,
      },
    });
  }

  /**
   * Increment AI token usage
   */
  private async incrementAIUsage(userId: string, tokens: number = 50): Promise<void> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    await db.usage.upsert({
      where: { userId_month: { userId, month: currentMonth } },
      update: { aiTokensUsed: { increment: tokens } },
      create: {
        userId,
        month: currentMonth,
        dmSent: 0,
        aiTokensUsed: tokens,
        automations: 0,
      },
    });
  }
}

export const automationEngine = new AutomationEngine();
