//gemini.js
import dotenv from "dotenv";
dotenv.config();

export async function askGemini(prompt) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in env variables");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Encoding": "identity",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini generateContent failed with status ${res.status}: ${errText}`);
    }

    const json = await res.json();
    if (
      !json.candidates ||
      json.candidates.length === 0 ||
      !json.candidates[0].content ||
      !json.candidates[0].content.parts ||
      json.candidates[0].content.parts.length === 0
    ) {
      throw new Error(`Invalid generateContent response format: ${JSON.stringify(json)}`);
    }

    return json.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "Maaf, terjadi kesalahan saat memproses permintaan Anda.";
  }
}
