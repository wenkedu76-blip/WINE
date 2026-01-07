
import { GoogleGenAI, Type } from "@google/genai";
import { WineAnalysis } from "../types";

// 只有在 API_KEY 存在时才初始化，否则在调用时再检查，防止初始化白屏
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

const WINE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    winery: { type: Type.STRING },
    varietal: { type: Type.STRING },
    region: { type: Type.STRING },
    vintage: { type: Type.STRING },
    style: { type: Type.STRING, description: "One of: Red, White, Rosé, Sparkling, Sweet, Fortified" },
    summary: { type: Type.STRING, description: "Professional tasting notes and flavor profile summary." },
    characteristics: {
      type: Type.OBJECT,
      properties: {
        body: { type: Type.INTEGER },
        tannin: { type: Type.INTEGER },
        acidity: { type: Type.INTEGER },
        sweetness: { type: Type.INTEGER },
      },
      required: ["body", "tannin", "acidity", "sweetness"]
    }
  },
  required: ["name", "winery", "varietal", "region", "vintage", "summary", "characteristics", "style"]
};

export const analyzeWineLabel = async (base64Image: string): Promise<{ data: WineAnalysis }> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
            { text: "Identify this wine. Return JSON including style (Red/White/etc) and taste summary. Use Search to be accurate." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: WINE_SCHEMA,
        tools: [{ googleSearch: {} }]
      }
    });

    return { data: JSON.parse(response.text || '{}') };
  } catch (error: any) {
    if (error.message === "API_KEY_MISSING") {
      throw new Error("请先在 Vercel 环境变量中设置 API_KEY");
    }
    throw error;
  }
};

export const researchWineInfo = async (query: string): Promise<{ data: WineAnalysis, sources: any[] }> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Detailed research for: ${query}. Include winery, region, vintage, professional tasting notes and style category.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: WINE_SCHEMA,
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    return { data: JSON.parse(response.text || '{}'), sources };
  } catch (error: any) {
    if (error.message === "API_KEY_MISSING") {
      throw new Error("请先在 Vercel 环境变量中设置 API_KEY");
    }
    throw error;
  }
};
