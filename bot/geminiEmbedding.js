import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    return;
  }
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: "Halo, apa kabar?",
  });

  console.log(response.embeddings);
}

main();
