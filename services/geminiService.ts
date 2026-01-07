
import { GoogleGenAI, Type } from "@google/genai";
import { WineAnalysis } from "../types";

// 延迟初始化 AI 实例，确保在调用时才读取环境变量
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_NOT_FOUND: 请确保系统环境变量中已配置 API_KEY。");
  }
  return new GoogleGenAI({ apiKey });
};

const WINE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Official name of the wine" },
    winery: { type: Type.STRING, description: "Name of the winery or producer" },
    varietal: { type: Type.STRING, description: "Grape variety or blend" },
    region: { type: Type.STRING, description: "Wine region and country" },
    vintage: { type: Type.STRING, description: "Vintage year, use N/V for non-vintage" },
    style: { type: Type.STRING, description: "One of: Red, White, Rosé, Sparkling, Sweet, Fortified" },
    summary: { type: Type.STRING, description: "Professional tasting notes and flavor profile summary in Chinese." },
    characteristics: {
      type: Type.OBJECT,
      properties: {
        body: { type: Type.INTEGER, description: "1-5 scale" },
        tannin: { type: Type.INTEGER, description: "1-5 scale" },
        acidity: { type: Type.INTEGER, description: "1-5 scale" },
        sweetness: { type: Type.INTEGER, description: "1-5 scale" },
      },
      required: ["body", "tannin", "acidity", "sweetness"]
    }
  },
  required: ["name", "winery", "varietal", "region", "vintage", "summary", "characteristics", "style"]
};

export const analyzeWineLabel = async (base64Image: string): Promise<{ data: WineAnalysis }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
          { text: "请精准识别这张酒标。利用 Google Search 查找其专业品酒笔记、酒庄背景和产区详细信息。请用中文回答。" }
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
};

export const researchWineInfo = async (query: string): Promise<{ data: WineAnalysis, sources: any[] }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `请对这款酒进行深度研究: "${query}"。识别其酒庄、产区、葡萄品种，并提供专业的中文品酒笔记。`,
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
};
