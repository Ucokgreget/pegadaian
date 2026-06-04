// Please install OpenAI SDK first: `npm install openai`
import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});


export async function askDeepSeek(messages) {
    try {
        const result = await openai.chat.completions.create({
            model:"deepseek-v4-flash",
            messages:messages,
            stream:false,
            temperature:0.2,
            max_tokens:1000,
        })
        return result.choices[0].message.content;
    } catch (error) {
        console.log("Error deepseek", error)
        return "Maaf terjadi kesalahan saat memproses permintaan Anda"
    }
}