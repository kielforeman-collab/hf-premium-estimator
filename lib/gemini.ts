"use server";

import { GoogleGenAI, Type } from "@google/genai";

// Use a getter for lazy initialization to ensure environment variables are loaded
// and to provide better error handling for missing keys.
let genAI: GoogleGenAI | null = null;

function getAI() {
  if (genAI) return genAI;

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Please ensure GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY is set in your .env.local file."
    );
  }

  genAI = new GoogleGenAI({ apiKey });
  return genAI;
}

export async function getAIColorAdvice(vibe: string) {
  if (!vibe) return null;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Suggest paint colors and finishes for a: ${vibe}`,
      config: {
        systemInstruction: "You are a professional interior designer and painting consultant. Use Canadian English spelling (colour, favourite, theatre). Provide concise (2-3 sentences) recommendations for paint colours, finishes (matte, satin, etc.), and overall aesthetic advice based on the user's room mood.",
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Color Advice Error:", error);
    throw error;
  }
}

export async function generateAIProposal(clientName: string, rooms: any[], totalArea: number, totalCost: number, context: string = '') {
  const roomList = rooms.map(r => `${r.name} (${r.length}x${r.width})`).join(', ');
  
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a professional painting proposal for ${clientName}. 
        Project includes: ${roomList}. 
        ${context}
        Total Area: ${Math.round(totalArea)} sqft. 
        Total Cost: $${totalCost.toFixed(2)} CAD. 
        Highlight the professionalism, clean work environment, and the value of a quality finish. Keep it to 3-4 professional paragraphs. Use Canadian English spelling throughout (honour, labour, colour).`,
      config: {
        systemInstruction: "You are an expert Canadian painting contractor writing a persuasive and high-end project proposal. Use a professional, trustworthy, and detail-oriented tone.",
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Proposal Error:", error);
    throw error;
  }
}
