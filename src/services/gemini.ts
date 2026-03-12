import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Trivia {
  category: string;
  question: string;
  answer: string;
  fact: string;
}

export async function generateDailyTrivia(): Promise<Trivia> {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate one fascinating, high-quality trivia fact for today, ${today}. 
    The trivia should be from one of these varied areas: history, geography, politics, art, sports, entertainment, science, or maths.
    
    Requirements:
    - It must be a single, clear trivia question.
    - Provide the correct answer.
    - Provide a "Did you know?" style interesting fact related to the answer.
    - Ensure it's engaging and not too obscure.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "The area of knowledge (e.g., Science, History)" },
          question: { type: Type.STRING, description: "The trivia question" },
          answer: { type: Type.STRING, description: "The correct answer" },
          fact: { type: Type.STRING, description: "An additional interesting fact related to the topic" },
        },
        required: ["category", "question", "answer", "fact"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}") as Trivia;
  } catch (error) {
    console.error("Failed to parse trivia response:", error);
    throw new Error("Invalid trivia format received");
  }
}
