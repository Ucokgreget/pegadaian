import { GoogleGenAI } from "@google/genai";

import dotenv from "dotenv";
dotenv.config();

const genAi = new GoogleGenAI(process.env.GEMINI_API_KEY);

export async function askGemini(prompt) {
  try {
    const result = await genAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return result.text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "Maaf, terjadi kesalahan saat memproses permintaan Anda.";
  }
}
