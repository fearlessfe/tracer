import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

// Safely initialize only if API key exists (avoids crashing if env is missing in some previews)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateProjectDescription = async (projectName: string, projectType: string): Promise<string> => {
  if (!ai) {
    throw new Error("API_KEY is missing. Cannot generate description.");
  }

  try {
    const prompt = `
      请为一个名为 "${projectName}" 的 "${projectType}" 撰写一段简短、专业且吸引人的中文描述。
      限制在 80 字以内。语气要积极向上，适合展示在项目管理看板上。
      不要包含引号。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "暂无描述";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("生成描述失败，请稍后重试。");
  }
};