
import { GoogleGenAI, Type } from "@google/genai";
import { Message, Language, Lead } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Searches for local businesses using Gemini 2.5 Flash + Google Maps Tool.
 */
export const searchLocalLeads = async (niche: string, location: string): Promise<{ text: string, leads: Partial<Lead>[], sources: any[] }> => {
  try {
    let latLng = undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) {
      console.warn("Geolocation not available for context.");
    }

    // Fix: Using gemini-2.5-flash because Google Maps grounding is only supported in the 2.5 series.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search for high-potential ${niche} business leads in ${location}. 
      Identify entities with established physical presence. 
      Analyze their current digital footprint and provide recommendations for growth services.`,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: { latLng }
        }
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return {
      text: response.text || "No results found.",
      leads: [],
      sources: sources
    };
  } catch (error) {
    console.error("Lead Search Error:", error);
    throw error;
  }
};

/**
 * Calculates a proprietary Lead Score using Gemini 3 Pro reasoning.
 */
export const calculateLeadScore = async (lead: Lead): Promise<{ score: number, reason: string }> => {
  const prompt = `
    Analyze this business entity for high-ticket service fit.
    
    Entity Metadata:
    - Name: ${lead.name}
    - Category: ${lead.category}
    - Reputation: ${lead.rating} stars / ${lead.reviews} reviews
    - Corporate Data: ${lead.enrichedData?.revenue || 'Unknown revenue'}, ${lead.enrichedData?.employees || 'Unknown'} staff
    - Context: ${lead.enrichedData?.qualSegment || 'Awaiting segment analysis'}
    
    Provide a quantitative Success Probability Score (0-100) and a brief qualitative growth thesis.
  `;

  // Fix: Using gemini-3-pro-preview for complex reasoning and quantitative analysis.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          reason: { type: Type.STRING }
        },
        required: ['score', 'reason']
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"score": 50, "reason": "Baseline evaluation completed."}');
  } catch {
    return { score: 50, reason: "Manual validation required." };
  }
};

/**
 * Generates personalized outreach using Gemini 3 Pro.
 */
export const generateOutreach = async (leadInfo: string, myService: string, lang: Language): Promise<string> => {
  // Fix: Using gemini-3-pro-preview for high-quality outreach generation.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Architect a highly personalized outreach strategy for: ${leadInfo}. 
    Goal: Pitch ${myService}. 
    Tone: Authoritative, expert-led, value-first. 
    Language: ${lang}. 
    Structure: Subject line, Hook based on their industry, Core value prop, Low-friction CTA.`,
  });
  return response.text || "Strategy synthesis failed.";
};

/**
 * Generates chat responses for the logistics assistant using Gemini 3 Pro.
 */
export const getLogisticsInsight = async (prompt: string, lang: Language): Promise<Message> => {
  try {
    // Fix: Using gemini-3-pro-preview for advanced logistics reasoning and grounding.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are the RISE LEADS Command Intelligence. You assist high-level sales professionals with lead discovery, market analysis, and conversion strategies. You have access to real-time search grounding. Language: ${lang}.`,
        tools: [{ googleSearch: {} }]
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Market Intelligence Source",
      uri: chunk.web?.uri || "#"
    })).filter((s: any) => s.uri !== "#") || [];

    return {
      id: Math.random().toString(36).substr(2, 9),
      role: 'assistant',
      content: response.text || "Command refused: Unexpected data structure.",
      timestamp: new Date(),
      sources: sources
    };
  } catch (error) {
    console.error("AI Insight Error:", error);
    return {
      id: Math.random().toString(36).substr(2, 9),
      role: 'assistant',
      content: "System anomaly detected in neural processor.",
      timestamp: new Date()
    };
  }
};
