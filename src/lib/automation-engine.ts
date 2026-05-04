/**
 * Automation Execution Engine
 * Processes incoming Instagram events and triggers automations
 */

import { db } from "@/lib/db";
import { instagram, InstagramDM } from "@/lib/instagram";
import { generateGeminiResponse, MessageContext } from "@/lib/gemini";
import { AI_PERSONA, LISTENERS } from "@prisma/client";

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
  listener: LISTENERS;
  prompt?: string | null;
  commentReply?: string | null;
  welcomeMessage?: string | null;
  dmCount: number;
  commentCount: number;
  persona: AI_PERSONA;
}

interface AutomationWithRelations {
  id: string;
  name: string;
  active: boolean;
  isSemantic: boolean;
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

    // AUTO-HEALING: If not found by ID, check if there's a PENDING_SETUP integration
    if (!integration) {
      console.log(`🔍 Integration not found for ID ${dm.recipientId}. Checking for PENDING_SETUP...`);
      integration = await db.integrations.findFirst({
        where: { instagramId: "PENDING_SETUP" }
      });

      if (integration) {
        console.log(`✨ AUTO-HEAL: Updating PENDING_SETUP to real ID: ${dm.recipientId}`);
        await db.integrations.update({
          where: { id: integration.id },
          data: { instagramId: dm.recipientId }
        });
      }
    }

    if (!integration) {
      // Final fallback: if still not found, try to find ANY active instagram integration for testing
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
    const matchingAutomation = await this.findMatchingAutomation(automations, dm);

    if (!matchingAutomation) {
      return { triggered: false, error: "No match (keyword or semantic)" };
    }

    // 4. Check if trigger exists
    const hasTrigger = matchingAutomation.trigger.some(
      (t) => t.type === "MESSAGE" || t.type === "STORY_MENTION" || t.type === "NEW_FOLLOWER"
    );
    if (!hasTrigger) {
      return { triggered: false, error: "Active trigger not configured for this message type" };
    }

    // 5. Execute action
    let response: string;

    try {
      const listener = matchingAutomation.listener;
      if (!listener) {
        return { triggered: false, error: "No listener configured" };
      }

      if (listener.listener === "SMARTAI") {
        response = await this.generateAIResponse(
          listener.prompt || "",
          dm.message,
          matchingAutomation.userId,
          listener.persona
        );
        await this.incrementAIUsage(matchingAutomation.userId);
      } else {
        response =
          listener.commentReply ||
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

      // 10. Schedule Follow-up (Full Funnel)
      await this.scheduleFollowUp(
        matchingAutomation.id,
        dm.senderId,
        matchingAutomation.userId,
        `User sent a DM: ${dm.message}`
      );

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
    recipientId: string;
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
    // Search by recipientId (the business account)
    let integration = await db.integrations.findUnique({
      where: { instagramId: comment.recipientId },
    });

    // AUTO-HEALING: If not found by ID, check if there's a PENDING_SETUP integration
    if (!integration) {
      console.log(`🔍 Integration not found for ID ${comment.recipientId}. Checking for PENDING_SETUP...`);
      integration = await db.integrations.findFirst({
        where: { instagramId: "PENDING_SETUP" }
      });

      if (integration) {
        console.log(`✨ AUTO-HEAL: Updating PENDING_SETUP to real ID: ${comment.recipientId}`);
        await db.integrations.update({
          where: { id: integration.id },
          data: { instagramId: comment.recipientId }
        });
      }
    }

    if (!integration) {
      console.log(`❌ No integration found for Instagram ID: ${comment.recipientId}`);
      return { triggered: false, error: "Integration not found" };
    } 
    
    const automations = (await db.automation.findMany({
      where: { userId: integration.userId, active: true },
      include: { keywords: true, listener: true, trigger: true },
    })) as unknown as AutomationWithRelations[];

    const matchingAutomation = await this.findMatchingAutomation(automations, {
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
      const listener = matchingAutomation.listener;
      if (!listener) {
        return { triggered: false, error: "No listener configured" };
      }

      let response: string;
      const token = await instagram.getUserToken(matchingAutomation.userId);
      if (!token) throw new Error("No token");

      // Fetch Post Context (Caption) to make AI smarter
      let postContext = "";
      try {
        const mediaInfo = await instagram.getMediaInfo(comment.mediaId, token);
        postContext = mediaInfo.caption || "";
      } catch (err) {
        console.warn("Could not fetch post context:", err);
      }

      // 1. Generate response (AI or Fixed)
      if (listener.listener === "SMARTAI") {
        response = await this.generateAIResponse(
          listener.prompt || "",
          comment.text,
          matchingAutomation.userId,
          listener.persona,
          postContext // Pass the post caption as context
        );
        await this.incrementAIUsage(matchingAutomation.userId);
      } else {
        response =
          listener.commentReply ||
          "Thanks for your comment! Check your DMs for more info.";
      }

      // 2. Publicly reply to the comment
      const publicReply = listener.listener === "SMARTAI" 
        ? "Just sent you a DM with the details! 🚀" 
        : "Check your DMs! I've sent you the info. 📥";

      await instagram.replyToComment(
        comment.mediaId,
        comment.commentId,
        publicReply,
        token
      );

      // 3. Privately send the full response via DM
      await instagram.sendPrivateReply(comment.commentId, response, token);

      // 4. Log the interaction
      await this.logDM({
        senderId: comment.senderId,
        senderUsername: comment.senderUsername,
        recipientId: comment.recipientId,
        message: comment.text,
        type: "COMMENT",
        timestamp: new Date().toISOString()
      }, matchingAutomation.id, response);

      // 5. Update stats
      await db.listener.update({
        where: { id: listener.id },
        data: { 
          commentCount: { increment: 1 },
          dmCount: { increment: 1 }
        },
      });

      await this.incrementDMUsage(matchingAutomation.userId);

      // 6. Schedule Follow-up
      await this.scheduleFollowUp(
        matchingAutomation.id,
        comment.senderId,
        matchingAutomation.userId,
        `User commented: ${comment.text} on post ${comment.mediaId}`
      );

      return {
        triggered: true,
        automationId: matchingAutomation.id,
        response,
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
   * Find automation that matches the message keywords OR semantic intent
   */
  private async findMatchingAutomation(
    automations: AutomationWithRelations[],
    dm: { message: string; type?: string }
  ): Promise<AutomationWithRelations | null> {
    const messageLower = dm.message.toLowerCase();

    // 1. First Pass: Hard Keyword Match (Fast)
    for (const automation of automations) {
      if (automation.keywords.length === 0 && automation.listener) {
        return automation;
      }

      const hasKeywordMatch = automation.keywords.some((kw) =>
        messageLower.includes(kw.word.toLowerCase())
      );

      if (hasKeywordMatch && automation.listener) {
        return automation;
      }
    }

    // 2. Second Pass: Semantic Match (AI-powered, for emojis and variations)
    const semanticAutomations = automations.filter(a => a.isSemantic);
    if (semanticAutomations.length > 0) {
      console.log(`🧠 Attempting semantic match for: "${dm.message}"`);
      for (const automation of semanticAutomations) {
        const isMatch = await this.checkSemanticMatch(dm.message, automation);
        if (isMatch) {
          console.log(`✅ Semantic match found: ${automation.name}`);
          return automation;
        }
      }
    }

    return null;
  }

  /**
   * Use AI to check if a message matches the intent of an automation
   */
  private async checkSemanticMatch(message: string, automation: AutomationWithRelations): Promise<boolean> {
    const keywords = automation.keywords.map(k => k.word).join(", ");
    const systemPrompt = `You are an intent classifier. Your goal is to determine if a user's message (which could be an emoji, slang, or a question) matches the intent of an automation.
    
    Automation Name: ${automation.name}
    Target Keywords: ${keywords}
    
    Return "MATCH" if the message aligns with the intent of these keywords or the automation name. 
    Return "NO_MATCH" otherwise.
    Only return one word.`;

    try {
      const result = await generateGeminiResponse(systemPrompt, message, []);
      return result.trim().toUpperCase() === "MATCH";
    } catch (error) {
      console.error("Semantic match error:", error);
      return false;
    }
  }

  /**
   * Generate AI response using OpenAI/Gemini
   */
  private async generateAIResponse(
    prompt: string,
    userMessage: string,
    userId: string,
    persona?: string,
    postContext?: string
  ): Promise<string> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { brandContext: true, firstname: true }
    });

    const PERSONA_PROMPTS = {
      CASUAL: "Your tone is casual, friendly, and relatable. Use emojis, Gen-Z slang if appropriate, and keep it lighthearted.",
      PROFESSIONAL: "Your tone is formal, professional, and precise. Be clear, polite, and avoid slang or excessive emojis.",
      SALES: "Your tone is persuasive and energetic. Focus on value, build excitement, and guide the user toward a conversion or purchase.",
      SUPPORT: "Your tone is helpful, empathetic, and solution-oriented. Be concise, technical where necessary, and focus on solving the user's problem.",
      CUSTOM: "",
    };

    const selectedPersona = PERSONA_PROMPTS[persona as keyof typeof PERSONA_PROMPTS] || "";
    const creatorSoul = user?.brandContext ? `\n\nCREATOR BRAND CONTEXT (Your Identity): ${user.brandContext}` : "";
    
    const recentHistory = await this.getConversationHistory(userId, 5);

    const contextPrompt = postContext 
      ? `\n\nPOST CONTEXT: The user is engaging with a post with this caption: "${postContext}".` 
      : "";

    const systemPrompt = `You are a personalized Instagram AI assistant for ${user?.firstname || "a creator"}. ${selectedPersona} ${prompt}${creatorSoul}${contextPrompt}
    
    Guidelines:
    - Respond briefly (under 80 words).
    - Be helpful but human-like.
    - If the user sent an emoji, respond with a matching vibe.
    - Maintain the creator's identity at all times.`;

    try {
      const response = await generateGeminiResponse(
        systemPrompt,
        userMessage,
        recentHistory
      );

      return response || "I'm here to help! How can I assist you?";
    } catch (error) {
      console.error("Gemini error:", error);
      return "Thanks for your message! I'll get back to you soon.";
    }
  }

  /**
   * Schedule a follow-up DM (Full Funnel Logic)
   */
  private async scheduleFollowUp(
    automationId: string,
    senderId: string,
    userId: string,
    context: string
  ): Promise<void> {
    try {
      // Schedule follow-up 24 hours from now
      const scheduledAt = new Date();
      scheduledAt.setHours(scheduledAt.getHours() + 24);

      await db.followUp.create({
        data: {
          automationId,
          senderId,
          userId,
          scheduledAt,
          context,
        }
      });
      console.log(`🕒 Follow-up scheduled for ${senderId} in 24h`);
    } catch (error) {
      console.error("Failed to schedule follow-up:", error);
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
      role: msg.isFromBot ? "model" : "user",
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
