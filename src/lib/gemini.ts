import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "missing-key");

export interface MessageContext {
  role: "user" | "model" | "system" | "assistant";
  content: string;
}

/**
 * Generate a response using Google Gemini
 */
export async function generateGeminiResponse(
  systemPrompt: string,
  userMessage: string,
  history: MessageContext[] = []
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt
    });

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === "assistant" || h.role === "model" ? "model" : "user",
        parts: [{ text: h.content }]
      })),
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Thanks for your message! I'll get back to you soon.";
  }
}
