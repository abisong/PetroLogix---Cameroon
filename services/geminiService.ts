
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getBusinessInsights = async (data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following oil distribution business data and provide exactly 3 professional insights: ${JSON.stringify(data)}`,
      config: {
        systemInstruction: "You are a professional business analyst for the energy sector. Return structured JSON. Do not include markdown. Focus on cash flow, tax compliance, and fleet efficiency.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Short professional title" },
                  description: { type: Type.STRING, description: "Detailed insight explanation" },
                  type: { type: Type.STRING, description: "Category: Financial, Tax, or Logistics" },
                  severity: { type: Type.STRING, description: "positive, warning, or info" }
                },
                required: ["title", "description", "type", "severity"]
              }
            },
            overallSummary: { type: Type.STRING, description: "A high-level one-sentence status" }
          },
          required: ["insights", "overallSummary"]
        },
        temperature: 0.7,
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const generateTaxSummary = async (taxes: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on these records, provide a professional quarterly tax forecast for this DRC oil distributor: ${JSON.stringify(taxes)}`,
      config: {
        systemInstruction: "You are an expert tax consultant in the Democratic Republic of Congo. Focus on TVA and IBC deadlines. Return structured data for a professional dashboard.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            forecastItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "Type of tax e.g. TVA, IBC, IPR" },
                  estimatedAmount: { type: Type.STRING, description: "Formatted currency amount" },
                  deadline: { type: Type.STRING, description: "Payment deadline date" },
                  priority: { type: Type.STRING, description: "High, Medium, or Low" }
                },
                required: ["category", "estimatedAmount", "deadline", "priority"]
              }
            },
            summary: { type: Type.STRING, description: "A brief professional summary of the upcoming quarter's compliance" }
          },
          required: ["forecastItems", "summary"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Tax Error:", error);
    return null;
  }
};
