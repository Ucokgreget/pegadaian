// Please install OpenAI SDK first: `npm install openai`

import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error(
      "DEEPSEEK_API_KEY belum di-set. Pastikan ada di .env dan dotenv ter-load."
    );
  }

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-chat",
    stream: false,
  });

  console.log(completion.choices[0].message.content);
}

export async function askDeepSeek(messages) {
    try {
        const stream = await openai.chat.completions.create({
            model:
        })
    } catch (error) {
        
    }
}
main();
