import dotenv from "dotenv";
dotenv.config();

export async function embedText(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in env variables");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Encoding": "identity",
    },
    body: JSON.stringify({
      content: {
        parts: [
          { text },
        ],
      },
      outputDimensionality: 768,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini embedding failed with status ${res.status}: ${errText}`);
  }

  const json = await res.json();
  if (!json.embedding || !json.embedding.values) {
    throw new Error(`Invalid response format from Gemini: ${JSON.stringify(json)}`);
  }

  return json.embedding.values;
}
