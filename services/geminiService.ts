import { GoogleGenAI, Type } from "@google/genai";
import { SleepRecord, GeminiAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSleepRecord = async (record: SleepRecord): Promise<GeminiAnalysis> => {
  try {
    let prompt = '';
    
    if (record.status === 'incomplete') {
      prompt = `
        Analyze this sleep record where the user clocked in but hasn't clocked out yet (or forgot).
        Date: ${record.date}
        Bed Time: ${record.bedTime}
        
        Provide a friendly reminder to clock out or a tip for consistent bedtimes.
        Return JSON.
      `;
    } else {
      prompt = `
        Analyze this sleep record:
        Date: ${record.date}
        Duration: ${record.duration} hours
        Bed Time: ${record.bedTime}
        Wake Time: ${record.wakeTime}
        Quality Rating: ${record.quality}

        Provide a brief, friendly, 1-sentence insight and 1 specific suggestion.
        Return JSON.
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "A score from 1-100 based on the data. Return 0 if incomplete." },
            insight: { type: Type.STRING, description: "A one sentence observation" },
            suggestion: { type: Type.STRING, description: "Actionable advice" }
          },
          required: ["score", "insight", "suggestion"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiAnalysis;
    }
    
    throw new Error("No data returned");

  } catch (error) {
    console.error("Gemini analysis failed", error);
    return {
      score: record.status === 'incomplete' ? 0 : 85,
      insight: record.status === 'incomplete' ? "Looks like you're still dreaming!" : "Analysis unavailable currently.",
      suggestion: record.status === 'incomplete' ? "Don't forget to stop the timer when you wake up." : "Try to maintain a consistent schedule."
    };
  }
};