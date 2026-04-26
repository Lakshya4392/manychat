/**
 * OpenAI Service
 * Handles AI-powered message generation for Smart AI replies
 */

import OpenAI from "openai";

// Initialize OpenAI — won't crash if key is missing, but API calls will fail gracefully
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-missing",
});

const hasApiKey = !!process.env.OPENAI_API_KEY;

export interface MessageContext {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  message: string;
  tokensUsed: number;
  model: string;
}

/**
 * Generate an AI response for an Instagram DM
 */
export async function generateDMResponse(
  prompt: string,
  userMessage: string,
  conversationHistory: MessageContext[] = [],
  userProfile?: { username: string; fullName?: string }
): Promise<AIResponse> {
  // Build system message
  const systemMessage = buildSystemPrompt(prompt, userProfile);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemMessage },
    ...conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 150,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const choice = completion.choices[0];
    const message = choice.message.content || "I'm here to help!";

    const usage = completion.usage;
    const tokensUsed = usage?.total_tokens || 0;

    return {
      message,
      tokensUsed,
      model: completion.model,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Generate intent classification for incoming messages
 */
export async function classifyIntent(
  message: string
): Promise<{
  intent: "inquiry" | "support" | "complaint" | "compliment" | "other";
  confidence: number;
}> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Classify this Instagram DM into one of these categories:
- inquiry: Product question or interest in buying
- support: Help needed with an issue
- complaint: Negative feedback or problem
- compliment: Positive feedback or praise
- other: Everything else

Return JSON: {"intent": "category", "confidence": 0.95}`,
      },
      { role: "user", content: message },
    ],
    response_format: { type: "json_object" },
    max_tokens: 50,
  });

  try {
    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      intent: result.intent || "other",
      confidence: result.confidence || 0,
    };
  } catch {
    return { intent: "other", confidence: 0 };
  }
}

/**
 * Suggest quick reply options for a received message
 */
export async function suggestReplies(
  message: string,
  context?: string
): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: context
          ? `You are helping with Instagram customer service. ${context}`
          : "You are an Instagram customer service assistant.",
      },
      {
        role: "user",
        content: `Suggest 3 short, friendly reply options for this message: "${message}". Return as a simple array.`,
      },
    ],
    max_tokens: 100,
  });

  const text = completion.choices[0].message.content || "";
  // Extract array from response (simple parsing)
  const replies = text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .slice(0, 3)
    .map((line) => line.replace(/^\d+\.\s*/, "").trim());

  return replies;
}

/**
 * Generate conversation summary
 */
export async function summarizeConversation(
  messages: { role: string; content: string }[]
): Promise<string> {
  const conversation = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Summarize this Instagram conversation in one short sentence.",
      },
      { role: "user", content: conversation },
    ],
    max_tokens: 50,
  });

  return completion.choices[0].message.content || "";
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt(
  basePrompt: string,
  userProfile?: { username: string; fullName?: string }
): string {
  let prompt = `You are an Instagram DM assistant for ${userProfile?.fullName || "a business"}. ${basePrompt}

Guidelines:
- Keep responses under 100 words
- Be friendly and professional
- Use casual, conversational tone (like texting)
- Don't use emojis excessively
- If unsure, ask clarifying questions
- End with a question to keep conversation flowing`;

  if (userProfile?.username) {
    prompt += `\n\nUser's Instagram: @${userProfile.username}`;
  }

  return prompt;
}

export default openai;
