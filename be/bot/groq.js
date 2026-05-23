//groq.js
import { Groq } from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function askGroqLegacy(prompt) {
  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 1,
      top_p: 1,
      max_completion_tokens: 4096,
      stream: true,
    });

    let fullText = "";

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      process.stdout.write(text);
      fullText += text;
    }

    return fullText;
  } catch (error) {
    console.error("Groq Error:", error);
    return "Maaf, terjadi kesalahan saat memproses permintaan.";
  }
}

export async function askGroq(messages) {
  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 1,
      top_p: 1,
      max_completion_tokens: 4096,
      stream: true,
    });
scm-history-item:/home/luqman/Documents/pegadaian?%7B%22repositoryId%22%3A%22scm1_1%22%2C%22historyItemId%22%3A%22c4bbb5986cba718238190f55d1ca7590aab2a756%22%2C%22historyItemParentId%22%3A%22c2111dc322dffa428a166ca1709b72eaf6eb1831%22%2C%22historyItemDisplayId%22%3A%22c4bbb59%22%7D
    let fullText = "";

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      process.stdout.write(text);
      fullText += text;
    }

    return fullText;
  } catch (error) {
    console.error("Groq Error:", error);
    return "Maaf, terjadi kesalahan saat memproses permintaan.";
  }
}
