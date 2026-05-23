import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// Inisialisasi menggunakan Agent Router
const openai = new OpenAI({
  // URL ini biasanya perlu diakhiri dengan /v1 untuk standar OpenAI SDK. 
  // Cek kembali di menu "API Information" pada dashboard Agent Router kamu.
  baseURL: 'https://agentrouter.org/v1', 
  apiKey: process.env.AGENT_ROUTER_API_KEY, // Gunakan API Key dari Agent Router
});

async function main() {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a helpful assistant." }],
      // Kamu bisa bebas mengganti model asalkan didukung oleh Agent Router
      model: "deepseek-v4-pro", 
      // Parameter thinking dan reasoning_effort bisa tetap dipakai jika 
      // Agent Router meneruskannya ke DeepSeek dengan benar
      thinking: {"type": "enabled"},
      reasoning_effort: "high",
      stream: false,
    });

    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error memanggil Agent Router:", error);
  }
}

main();