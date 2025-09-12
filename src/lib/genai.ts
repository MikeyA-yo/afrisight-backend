import { GoogleGenAI } from "@google/genai";

// Get API key from environment variables
const apiKey = process.env.GOOGLEAI_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLEAI_API_KEY environment variable not set");
}

// Initialize GoogleGenAI with the API key
const ai = new GoogleGenAI({
  apiKey: apiKey,
});

/**
 * Basic Gemini AI function that loads up the module and accepts a prompt string.
 * @param prompt - The prompt string to send to the AI.
 * @returns The generated text from the AI.
 */
export async function run(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  
  return response.text || "";
}
