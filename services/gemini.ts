
import { GoogleGenAI, Type } from "@google/genai";
import { MODELS, calculateOverallScore } from "../constants";

export interface EvaluationResult {
  accuracy: number;
  clarity: number;
  hallucination_risk: number;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Correct initialization with named parameter and process.env.API_KEY
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async execute(prompt: string): Promise<{ text: string; time: number }> {
    const startTime = Date.now();
    try {
      // Manual retry logic as requested (max 2 retries = 3 attempts total)
      let attempts = 0;
      let lastError = null;

      while (attempts < 3) {
        try {
          const response = await this.ai.models.generateContent({
            model: MODELS.EXECUTION,
            contents: prompt,
          });
          
          // Use .text property (not a method) to access the generated content
          const text = response.text;
          if (!text) throw new Error("Empty response from Gemini");
          
          const endTime = Date.now();
          return { text: text, time: endTime - startTime };
        } catch (e) {
          lastError = e;
          attempts++;
          if (attempts < 3) await new Promise(r => setTimeout(r, 1000 * attempts));
        }
      }
      throw lastError;
    } catch (error) {
      console.error("Execution failed after retries:", error);
      throw error;
    }
  }

  async evaluate(originalPrompt: string, responseText: string): Promise<EvaluationResult> {
    const evaluationPrompt = `
      You are an expert AI quality auditor. Evaluate the following LLM response based on the provided prompt.
      
      Prompt: "${originalPrompt}"
      Response: "${responseText}"
      
      Provide scores (0-100) for:
      - accuracy: How factual and correct the response is.
      - clarity: How clear, well-structured, and easy to understand the response is.
      - hallucination_risk: The risk that the model invented facts or deviated from the prompt context (0 means no hallucination, 100 means complete hallucination).
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: MODELS.EVALUATION,
        contents: evaluationPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              accuracy: { type: Type.NUMBER },
              clarity: { type: Type.NUMBER },
              hallucination_risk: { type: Type.NUMBER },
            },
            required: ["accuracy", "clarity", "hallucination_risk"],
            propertyOrdering: ["accuracy", "clarity", "hallucination_risk"],
          },
        },
      });

      // Use .text property and trim for safety
      const jsonStr = (response.text || '{}').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Evaluation failed:", error);
      // Fallback values if evaluation fails
      return { accuracy: 0, clarity: 0, hallucination_risk: 100 };
    }
  }
}

export const gemini = new GeminiService();
