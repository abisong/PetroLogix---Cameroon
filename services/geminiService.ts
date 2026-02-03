
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getBusinessInsights = async (data: any, language: Language = 'en') => {
  const isFrench = language === 'fr';
  const instruction = isFrench 
    ? "Vous êtes un analyste commercial professionnel pour le secteur de l'énergie. Renvoyez du JSON structuré. N'incluez pas de markdown. Concentrez-vous sur les flux de trésorerie, la conformité fiscale et l'efficacité de la flotte. TOUTES les réponses textuelles (titre, description, résumé) DOIVENT être en FRANÇAIS."
    : "You are a professional business analyst for the energy sector. Return structured JSON. Do not include markdown. Focus on cash flow, tax compliance, and fleet efficiency. ALL text responses (title, description, summary) MUST be in ENGLISH.";

  const prompt = isFrench
    ? `Analysez les données suivantes de l'entreprise de distribution de pétrole et fournissez exactement 3 analyses professionnelles : ${JSON.stringify(data)}`
    : `Analyze the following oil distribution business data and provide exactly 3 professional insights: ${JSON.stringify(data)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: instruction,
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

export const generateTaxSummary = async (taxes: any[], language: Language = 'en') => {
  const isFrench = language === 'fr';
  const instruction = isFrench
    ? "Vous êtes un consultant fiscal expert en République Démocratique du Congo. Concentrez-vous sur les délais de TVA et d'IBC. Renvoyez des données structurées pour un tableau de bord professionnel. TOUTES les réponses textuelles DOIVENT être en FRANÇAIS."
    : "You are an expert tax consultant in the Democratic Republic of Congo. Focus on TVA and IBC deadlines. Return structured data for a professional dashboard. ALL text responses MUST be in ENGLISH.";

  const prompt = isFrench
    ? `Sur la base de ces enregistrements, fournissez des prévisions fiscales trimestrielles professionnelles pour ce distributeur de pétrole en RDC : ${JSON.stringify(taxes)}`
    : `Based on these records, provide a professional quarterly tax forecast for this DRC oil distributor: ${JSON.stringify(taxes)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: instruction,
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
