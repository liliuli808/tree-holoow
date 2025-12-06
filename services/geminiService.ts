import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// Initialize logic moved to check to prevent crash if no key, 
// though prompts say assume key exists.
let ai: GoogleGenAI | null = null;

try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.error("Failed to initialize Gemini Client", e);
}

export const checkContentSafety = async (text: string): Promise<{ safe: boolean; reason?: string }> => {
  if (!ai || !text) return { safe: true }; // Fallback to safe if no AI or empty text

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following text for sensitive, harmful, explicit, or offensive content suitable for a strict social media platform. 
      Text: "${text}"
      
      Return a JSON object with this structure: { "safe": boolean, "reason": string }
      Only return the JSON.`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      safe: result.safe ?? true,
      reason: result.reason
    };
  } catch (error) {
    console.error("Content safety check failed:", error);
    return { safe: true }; // Fail open for demo purposes, fail closed for prod
  }
};

export const generateAIResponse = async (userMessage: string, context: string = ""): Promise<string> => {
  if (!ai) return "树洞精灵正在休息...";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are "Tree Hollow Elf" (树洞精灵), a warm, empathetic, and slightly mysterious listener in an anonymous social app.
      User says: "${userMessage}"
      Context: ${context}
      
      Reply in Chinese, be comforting, brief (under 50 words), and encourage them.`,
    });

    return response.text || "...";
  } catch (error) {
    console.error("AI chat generation failed:", error);
    return "抱歉，我的信号不太好。";
  }
};
