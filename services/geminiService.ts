import { GoogleGenAI, Type } from "@google/genai";
import { AdviceResponse } from "../types.js";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBlackjackAdvice = async (
  playerHandDescription: string,
  dealerUpCardDescription: string,
  playerScore: number
): Promise<AdviceResponse> => {
  try {
    const prompt = `
      You are a professional Blackjack advisor.
      The player has: ${playerHandDescription} (Score: ${playerScore}).
      The dealer shows: ${dealerUpCardDescription}.
      
      Provide strategic advice based on standard Blackjack basic strategy. 
      Explicitly suggest "Double Down" if it's the optimal move for this hand.
      Return the response in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestion: { type: Type.STRING, description: "The recommended action (Hit, Stand, Double Down, or Split)" },
            reasoning: { type: Type.STRING, description: "A very brief explanation (under 12 words) of the math/strategy." }
          },
          propertyOrdering: ["suggestion", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AdviceResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      suggestion: "Unknown",
      reasoning: "The strategy mainframe is currently offline."
    };
  }
};